#!/usr/bin/env node

/**
 * Worker dédié pour le traitement des queues
 * Processus séparé pour optimiser les performances
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const QueueService = require('../services/QueueService');
const { logger } = require('../utils/logger');

/**
 * Worker principal pour les queues
 */
class QueueWorker {
    constructor() {
        this.queue = QueueService.create();
        this.isShuttingDown = false;
        
        logger.info('QueueWorker démarré', {
            pid: process.pid,
            nodeEnv: process.env.NODE_ENV,
            workerType: process.env.WORKER_TYPE
        });
        
        this.setupEventListeners();
        this.setupGracefulShutdown();
    }

    /**
     * Configure les écouteurs d'événements
     */
    setupEventListeners() {
        // Événements de queue
        this.queue.on('job:completed', (data) => {
            logger.info('Job terminé', {
                queue: data.queueName,
                jobId: data.job.id,
                type: data.job.type,
                duration: data.job.completedAt - data.job.startedAt
            });
        });

        this.queue.on('job:failed', (data) => {
            logger.error('Job échoué', {
                queue: data.queueName,
                jobId: data.job.id,
                type: data.job.type,
                attempts: data.job.attemptsCount,
                errors: data.job.errors
            });
        });

        this.queue.on('job:retry', (data) => {
            logger.warn('Job en retry', {
                queue: data.queueName,
                jobId: data.job.id,
                attempt: data.job.attemptsCount
            });
        });

        // Statistiques périodiques
        setInterval(() => {
            if (!this.isShuttingDown) {
                this.logStats();
            }
        }, 60000); // Toutes les minutes
    }

    /**
     * Affiche les statistiques des queues
     */
    logStats() {
        try {
            const stats = this.queue.getGlobalStats();
            
            logger.info('Statistiques queues', {
                totalJobs: stats.totalJobs,
                completedJobs: stats.completedJobs,
                failedJobs: stats.failedJobs,
                activeJobs: stats.activeJobs,
                queues: stats.queues.map(q => ({
                    name: q.name,
                    waiting: q.waiting,
                    processing: q.processing,
                    activeWorkers: q.activeWorkers
                }))
            });
            
        } catch (error) {
            logger.error('Erreur lors du calcul des statistiques queues', {
                error: error.message
            });
        }
    }

    /**
     * Configure l'arrêt gracieux
     */
    setupGracefulShutdown() {
        const shutdown = async (signal) => {
            logger.info(`Signal ${signal} reçu, arrêt gracieux du worker...`);
            this.isShuttingDown = true;
            
            try {
                // Attendre que les jobs en cours se terminent
                logger.info('Attente de la fin des jobs en cours...');
                
                const timeout = parseInt(process.env.GRACEFUL_SHUTDOWN_TIMEOUT) || 30000;
                const startTime = Date.now();
                
                while (Date.now() - startTime < timeout) {
                    const stats = this.queue.getGlobalStats();
                    if (stats.activeJobs === 0) {
                        break;
                    }
                    
                    logger.info(`${stats.activeJobs} jobs encore actifs, attente...`);
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
                
                logger.info('Worker arrêté proprement');
                process.exit(0);
                
            } catch (error) {
                logger.error('Erreur lors de l\'arrêt du worker', {
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
            logger.error('Exception non attrapée dans le worker', {
                error: error.message,
                stack: error.stack
            });
            process.exit(1);
        });
        
        process.on('unhandledRejection', (reason, promise) => {
            logger.error('Promise rejetée non gérée dans le worker', {
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
            logger.info('Démarrage des queues...');
            
            // Les queues sont automatiquement créées dans QueueService
            // On peut ajouter ici une logique spécifique si nécessaire
            
            logger.info('Worker de queue prêt et en écoute');
            
            // Garder le processus vivant
            setInterval(() => {
                if (!this.isShuttingDown) {
                    // Health check ou maintenance légère
                }
            }, 30000);
            
        } catch (error) {
            logger.error('Erreur lors du démarrage du worker', {
                error: error.message,
                stack: error.stack
            });
            process.exit(1);
        }
    }
}

// Démarrer le worker si ce fichier est exécuté directement
if (require.main === module) {
    const worker = new QueueWorker();
    worker.start().catch(error => {
        logger.error('Erreur fatale du worker', {
            error: error.message,
            stack: error.stack
        });
        process.exit(1);
    });
}

module.exports = QueueWorker;