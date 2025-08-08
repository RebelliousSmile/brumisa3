#!/usr/bin/env node

/**
 * Worker dédié pour les tâches de maintenance
 * Nettoyage, backup, optimisations
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const fs = require('fs').promises;
const { logger } = require('../utils/logger');
const CacheService = require('../services/CacheService');
const QueueService = require('../services/QueueService');

/**
 * Worker de maintenance
 */
class MaintenanceWorker {
    constructor() {
        this.isShuttingDown = false;
        this.cache = new CacheService();
        this.queue = QueueService.create();
        
        // Configuration
        this.config = {
            cleanupInterval: parseInt(process.env.CLEANUP_INTERVAL) || 3600000, // 1 heure
            maxLogAge: parseInt(process.env.MAX_LOG_AGE) || 86400000 * 14, // 14 jours
            maxOutputAge: parseInt(process.env.MAX_OUTPUT_AGE) || 86400000 * 7, // 7 jours
            backupRetention: parseInt(process.env.BACKUP_RETENTION_DAYS) || 30,
        };
        
        logger.info('MaintenanceWorker démarré', {
            pid: process.pid,
            nodeEnv: process.env.NODE_ENV,
            workerType: process.env.WORKER_TYPE,
            cleanupInterval: this.config.cleanupInterval
        });
        
        this.setupScheduledTasks();
        this.setupGracefulShutdown();
    }

    /**
     * Configure les tâches programmées
     */
    setupScheduledTasks() {
        // Nettoyage principal
        setInterval(async () => {
            if (!this.isShuttingDown) {
                await this.runMaintenanceTasks();
            }
        }, this.config.cleanupInterval);
        
        // Nettoyage cache plus fréquent
        setInterval(() => {
            if (!this.isShuttingDown) {
                this.cleanCache();
            }
        }, 300000); // 5 minutes
        
        // Statistiques périodiques
        setInterval(() => {
            if (!this.isShuttingDown) {
                this.logSystemStats();
            }
        }, 900000); // 15 minutes
        
        // Exécuter un nettoyage initial
        setTimeout(() => {
            this.runMaintenanceTasks();
        }, 30000); // Après 30 secondes
    }

    /**
     * Exécute toutes les tâches de maintenance
     */
    async runMaintenanceTasks() {
        const startTime = Date.now();
        
        logger.info('Démarrage des tâches de maintenance');
        
        try {
            const results = {
                logs: await this.cleanupLogs(),
                outputs: await this.cleanupOutputFiles(),
                cache: this.cleanCache(),
                pdfs: await this.cleanupExpiredPDFs(),
                temp: await this.cleanupTempFiles()
            };
            
            const duration = Date.now() - startTime;
            
            logger.info('Tâches de maintenance terminées', {
                duration: `${duration}ms`,
                results
            });
            
        } catch (error) {
            logger.error('Erreur lors des tâches de maintenance', {
                error: error.message,
                stack: error.stack
            });
        }
    }

    /**
     * Nettoie les fichiers de logs anciens
     */
    async cleanupLogs() {
        try {
            const logsDir = process.env.LOG_DIR || path.join(process.cwd(), 'logs');
            
            try {
                await fs.access(logsDir);
            } catch {
                logger.debug('Dossier logs non trouvé, création...');
                await fs.mkdir(logsDir, { recursive: true });
                return { cleaned: 0, created: true };
            }
            
            const files = await fs.readdir(logsDir);
            const cutoffTime = Date.now() - this.config.maxLogAge;
            let cleaned = 0;
            
            for (const file of files) {
                const filePath = path.join(logsDir, file);
                const stats = await fs.stat(filePath);
                
                if (stats.mtime.getTime() < cutoffTime && file.endsWith('.log')) {
                    await fs.unlink(filePath);
                    cleaned++;
                    logger.debug('Fichier log supprimé', { file });
                }
            }
            
            return { cleaned };
            
        } catch (error) {
            logger.error('Erreur lors du nettoyage des logs', {
                error: error.message
            });
            return { error: error.message };
        }
    }

    /**
     * Nettoie les fichiers de sortie PDF anciens
     */
    async cleanupOutputFiles() {
        try {
            const outputDir = process.env.OUTPUT_DIR || path.join(process.cwd(), 'output');
            
            try {
                await fs.access(outputDir);
            } catch {
                logger.debug('Dossier output non trouvé, création...');
                await fs.mkdir(outputDir, { recursive: true });
                return { cleaned: 0, created: true };
            }
            
            const files = await fs.readdir(outputDir);
            const cutoffTime = Date.now() - this.config.maxOutputAge;
            let cleaned = 0;
            let totalSize = 0;
            
            for (const file of files) {
                const filePath = path.join(outputDir, file);
                const stats = await fs.stat(filePath);
                
                if (stats.mtime.getTime() < cutoffTime && file.endsWith('.pdf')) {
                    totalSize += stats.size;
                    await fs.unlink(filePath);
                    cleaned++;
                    logger.debug('Fichier PDF supprimé', { file, size: stats.size });
                }
            }
            
            return { 
                cleaned, 
                totalSizeFreed: Math.round(totalSize / 1024 / 1024 * 100) / 100 // MB
            };
            
        } catch (error) {
            logger.error('Erreur lors du nettoyage des fichiers output', {
                error: error.message
            });
            return { error: error.message };
        }
    }

    /**
     * Nettoie le cache
     */
    cleanCache() {
        try {
            const beforeStats = this.cache.getStats();
            const cleaned = this.cache.cleanup();
            const afterStats = this.cache.getStats();
            
            if (cleaned > 0) {
                logger.debug('Cache nettoyé', {
                    entriesRemoved: cleaned,
                    sizeBefore: beforeStats.size,
                    sizeAfter: afterStats.size
                });
            }
            
            return { 
                cleaned, 
                sizeBefore: beforeStats.size,
                sizeAfter: afterStats.size,
                hitRate: afterStats.hitRate
            };
            
        } catch (error) {
            logger.error('Erreur lors du nettoyage du cache', {
                error: error.message
            });
            return { error: error.message };
        }
    }

    /**
     * Nettoie les PDFs expirés via le service
     */
    async cleanupExpiredPDFs() {
        try {
            // Ajouter une tâche de nettoyage à la queue
            const job = await this.queue.add(
                QueueService.Queues.CLEANUP,
                QueueService.JobTypes.CLEANUP_FILES,
                {
                    type: 'pdf',
                    olderThan: Date.now() - (24 * 60 * 60 * 1000) // 24h
                },
                {
                    priority: 1 // Basse priorité
                }
            );
            
            return { queued: true, jobId: job.id };
            
        } catch (error) {
            logger.error('Erreur lors de la programmation du nettoyage PDFs', {
                error: error.message
            });
            return { error: error.message };
        }
    }

    /**
     * Nettoie les fichiers temporaires
     */
    async cleanupTempFiles() {
        try {
            const tempDirs = [
                path.join(process.cwd(), 'temp'),
                path.join(process.cwd(), 'tmp'),
                path.join(require('os').tmpdir(), 'brumisater')
            ];
            
            let totalCleaned = 0;
            
            for (const tempDir of tempDirs) {
                try {
                    await fs.access(tempDir);
                    const files = await fs.readdir(tempDir);
                    const cutoffTime = Date.now() - (60 * 60 * 1000); // 1 heure
                    
                    for (const file of files) {
                        const filePath = path.join(tempDir, file);
                        const stats = await fs.stat(filePath);
                        
                        if (stats.mtime.getTime() < cutoffTime) {
                            await fs.unlink(filePath);
                            totalCleaned++;
                            logger.debug('Fichier temp supprimé', { file });
                        }
                    }
                } catch {
                    // Dossier n'existe pas, ignorer
                }
            }
            
            return { cleaned: totalCleaned };
            
        } catch (error) {
            logger.error('Erreur lors du nettoyage des fichiers temporaires', {
                error: error.message
            });
            return { error: error.message };
        }
    }

    /**
     * Log les statistiques système
     */
    logSystemStats() {
        try {
            const memUsage = process.memoryUsage();
            const cpuUsage = process.cpuUsage();
            const cacheStats = this.cache.getStats();
            const queueStats = this.queue.getGlobalStats();
            
            logger.info('Statistiques système maintenance', {
                memory: {
                    used: Math.round(memUsage.used / 1024 / 1024) + 'MB',
                    heap: Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB',
                    external: Math.round(memUsage.external / 1024 / 1024) + 'MB'
                },
                cache: {
                    size: cacheStats.size,
                    hitRate: cacheStats.hitRate,
                    memoryUsage: cacheStats.memoryUsage.estimatedKB + 'KB'
                },
                queues: {
                    totalJobs: queueStats.totalJobs,
                    activeJobs: queueStats.activeJobs,
                    completedJobs: queueStats.completedJobs,
                    failedJobs: queueStats.failedJobs
                }
            });
            
        } catch (error) {
            logger.error('Erreur lors du logging des statistiques', {
                error: error.message
            });
        }
    }

    /**
     * Configure l'arrêt gracieux
     */
    setupGracefulShutdown() {
        const shutdown = async (signal) => {
            logger.info(`Signal ${signal} reçu, arrêt du worker de maintenance...`);
            this.isShuttingDown = true;
            
            try {
                // Effectuer un dernier nettoyage rapide
                logger.info('Nettoyage final avant arrêt...');
                this.cleanCache();
                
                logger.info('Worker de maintenance arrêté proprement');
                process.exit(0);
                
            } catch (error) {
                logger.error('Erreur lors de l\'arrêt du worker de maintenance', {
                    error: error.message
                });
                process.exit(1);
            }
        };
        
        // Écouter les signaux d'arrêt
        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));
        process.on('SIGUSR2', () => shutdown('SIGUSR2')); // PM2 reload
        
        // Gérer les erreurs non attrapées
        process.on('uncaughtException', (error) => {
            logger.error('Exception non attrapée dans le worker de maintenance', {
                error: error.message,
                stack: error.stack
            });
            process.exit(1);
        });
        
        process.on('unhandledRejection', (reason, promise) => {
            logger.error('Promise rejetée non gérée dans le worker de maintenance', {
                reason: reason?.message || reason,
                promise: promise.toString()
            });
        });
    }

    /**
     * Démarre le worker
     */
    async start() {
        try {
            logger.info('Worker de maintenance prêt');
            
            // Garder le processus vivant
            setInterval(() => {
                if (!this.isShuttingDown) {
                    // Health check simple
                }
            }, 30000);
            
        } catch (error) {
            logger.error('Erreur lors du démarrage du worker de maintenance', {
                error: error.message,
                stack: error.stack
            });
            process.exit(1);
        }
    }
}

// Démarrer le worker si ce fichier est exécuté directement
if (require.main === module) {
    const worker = new MaintenanceWorker();
    worker.start().catch(error => {
        logger.error('Erreur fatale du worker de maintenance', {
            error: error.message,
            stack: error.stack
        });
        process.exit(1);
    });
}

module.exports = MaintenanceWorker;