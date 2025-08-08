#!/usr/bin/env node

/**
 * Script de health check pour monitoring externe
 * Vérifie l'état de santé complet de l'application
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');

const execAsync = util.promisify(exec);

// Configuration
const config = {
    host: process.env.HEALTH_CHECK_HOST || 'localhost',
    port: process.env.HEALTH_CHECK_PORT || process.env.PORT || 3000,
    protocol: process.env.HEALTH_CHECK_PROTOCOL || 'http',
    timeout: parseInt(process.env.HEALTH_CHECK_TIMEOUT) || 10000,
    retries: parseInt(process.env.HEALTH_CHECK_RETRIES) || 3,
    logFile: process.env.HEALTH_CHECK_LOG || '/var/log/brumisater/health-check.log'
};

// Exit codes
const EXIT_CODES = {
    HEALTHY: 0,
    WARNING: 1,
    CRITICAL: 2,
    UNKNOWN: 3
};

// Classe principale de health check
class HealthChecker {
    constructor() {
        this.results = [];
        this.startTime = Date.now();
    }

    /**
     * Log avec timestamp
     */
    log(level, message, data = {}) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level: level.toUpperCase(),
            message,
            ...data
        };
        
        console.log(JSON.stringify(logEntry));
        
        // Écrire dans le fichier de log si configuré
        if (config.logFile) {
            try {
                const logLine = `${timestamp} [${level.toUpperCase()}] ${message}\n`;
                fs.appendFileSync(config.logFile, logLine);
            } catch (error) {
                console.error('Erreur d\'écriture du log:', error.message);
            }
        }
    }

    /**
     * Ajouter un résultat de vérification
     */
    addResult(check, status, message, details = {}) {
        this.results.push({
            check,
            status, // 'healthy', 'warning', 'critical'
            message,
            details,
            timestamp: Date.now()
        });
        
        this.log(status === 'healthy' ? 'info' : status, 
                `${check}: ${message}`, details);
    }

    /**
     * Vérification HTTP de l'application
     */
    async checkHttpEndpoint() {
        const url = `${config.protocol}://${config.host}:${config.port}/health`;
        
        return new Promise((resolve) => {
            const client = config.protocol === 'https' ? https : http;
            const startTime = Date.now();
            
            const req = client.get(url, {
                timeout: config.timeout,
                rejectUnauthorized: false // Pour les certificats auto-signés en dev
            }, (res) => {
                const responseTime = Date.now() - startTime;
                let data = '';
                
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        const response = JSON.parse(data);
                        
                        if (res.statusCode === 200 && response.status === 'healthy') {
                            this.addResult('http_endpoint', 'healthy', 
                                `Application accessible en ${responseTime}ms`, {
                                    statusCode: res.statusCode,
                                    responseTime,
                                    response
                                });
                        } else {
                            this.addResult('http_endpoint', 
                                res.statusCode < 500 ? 'warning' : 'critical',
                                `Status: ${response.status || 'unknown'}`, {
                                    statusCode: res.statusCode,
                                    responseTime,
                                    response
                                });
                        }
                    } catch (parseError) {
                        this.addResult('http_endpoint', 'critical',
                            'Réponse JSON invalide', {
                                statusCode: res.statusCode,
                                responseTime,
                                data: data.substring(0, 200)
                            });
                    }
                    resolve();
                });
            });
            
            req.on('error', (error) => {
                this.addResult('http_endpoint', 'critical',
                    `Erreur de connexion: ${error.message}`, {
                        error: error.message,
                        code: error.code
                    });
                resolve();
            });
            
            req.on('timeout', () => {
                req.destroy();
                this.addResult('http_endpoint', 'critical',
                    `Timeout après ${config.timeout}ms`);
                resolve();
            });
        });
    }

    /**
     * Vérification des processus PM2
     */
    async checkPM2Processes() {
        try {
            const { stdout } = await execAsync('pm2 jlist');
            const processes = JSON.parse(stdout);
            
            if (!Array.isArray(processes) || processes.length === 0) {
                this.addResult('pm2_processes', 'critical', 
                    'Aucun processus PM2 trouvé');
                return;
            }
            
            const stats = {
                total: processes.length,
                online: 0,
                stopped: 0,
                errored: 0
            };
            
            const unhealthyProcesses = [];
            
            processes.forEach(proc => {
                switch (proc.pm2_env.status) {
                    case 'online':
                        stats.online++;
                        break;
                    case 'stopped':
                        stats.stopped++;
                        unhealthyProcesses.push(`${proc.name}: stopped`);
                        break;
                    case 'errored':
                        stats.errored++;
                        unhealthyProcesses.push(`${proc.name}: errored`);
                        break;
                    default:
                        unhealthyProcesses.push(`${proc.name}: ${proc.pm2_env.status}`);
                }
            });
            
            if (stats.online === stats.total) {
                this.addResult('pm2_processes', 'healthy',
                    `Tous les processus sont en ligne (${stats.online}/${stats.total})`, 
                    stats);
            } else if (stats.online > 0) {
                this.addResult('pm2_processes', 'warning',
                    `Certains processus ne sont pas en ligne (${stats.online}/${stats.total})`, {
                        ...stats,
                        unhealthyProcesses
                    });
            } else {
                this.addResult('pm2_processes', 'critical',
                    'Aucun processus en ligne', {
                        ...stats,
                        unhealthyProcesses
                    });
            }
            
        } catch (error) {
            this.addResult('pm2_processes', 'critical',
                `Erreur lors de la vérification PM2: ${error.message}`);
        }
    }

    /**
     * Vérification de la base de données
     */
    async checkDatabase() {
        try {
            // Vérification simple de connexion PostgreSQL
            const connectionTest = `
                const { Pool } = require('pg');
                const pool = new Pool({
                    connectionString: process.env.DATABASE_URL
                });
                pool.query('SELECT NOW()', (err, res) => {
                    if (err) {
                        console.error('DB_ERROR:' + err.message);
                        process.exit(1);
                    } else {
                        console.log('DB_OK:' + res.rows[0].now);
                        process.exit(0);
                    }
                });
            `;
            
            const { stdout, stderr } = await execAsync(
                `node -e "${connectionTest}"`,
                { timeout: 5000, cwd: path.resolve('.') }
            );
            
            if (stdout.includes('DB_OK:')) {
                const timestamp = stdout.split('DB_OK:')[1].trim();
                this.addResult('database', 'healthy',
                    'Base de données accessible', { timestamp });
            } else {
                this.addResult('database', 'critical',
                    'Réponse inattendue de la base de données', { stdout, stderr });
            }
            
        } catch (error) {
            let errorMessage = error.message;
            if (error.stdout && error.stdout.includes('DB_ERROR:')) {
                errorMessage = error.stdout.split('DB_ERROR:')[1].trim();
            }
            
            this.addResult('database', 'critical',
                `Erreur base de données: ${errorMessage}`);
        }
    }

    /**
     * Vérification de l'utilisation du disque
     */
    async checkDiskUsage() {
        try {
            const { stdout } = await execAsync("df -h | grep -E '(/$|/var)'");
            const lines = stdout.trim().split('\n');
            
            const criticalThreshold = 90;
            const warningThreshold = 80;
            let maxUsage = 0;
            const diskInfo = [];
            
            lines.forEach(line => {
                const parts = line.split(/\s+/);
                if (parts.length >= 6) {
                    const usage = parseInt(parts[4].replace('%', ''));
                    const mountPoint = parts[5];
                    
                    diskInfo.push({
                        filesystem: parts[0],
                        mountPoint,
                        usage: `${usage}%`,
                        available: parts[3]
                    });
                    
                    maxUsage = Math.max(maxUsage, usage);
                }
            });
            
            if (maxUsage >= criticalThreshold) {
                this.addResult('disk_usage', 'critical',
                    `Espace disque critique: ${maxUsage}%`, { diskInfo });
            } else if (maxUsage >= warningThreshold) {
                this.addResult('disk_usage', 'warning',
                    `Espace disque élevé: ${maxUsage}%`, { diskInfo });
            } else {
                this.addResult('disk_usage', 'healthy',
                    `Espace disque OK: ${maxUsage}%`, { diskInfo });
            }
            
        } catch (error) {
            this.addResult('disk_usage', 'warning',
                `Impossible de vérifier l'espace disque: ${error.message}`);
        }
    }

    /**
     * Vérification de la mémoire
     */
    async checkMemoryUsage() {
        try {
            const { stdout } = await execAsync('free -m');
            const lines = stdout.split('\n');
            const memLine = lines[1].split(/\s+/);
            
            const total = parseInt(memLine[1]);
            const used = parseInt(memLine[2]);
            const available = parseInt(memLine[6] || memLine[3]);
            const usagePercent = Math.round((used / total) * 100);
            
            const memInfo = {
                total: `${total}MB`,
                used: `${used}MB`,
                available: `${available}MB`,
                usagePercent: `${usagePercent}%`
            };
            
            if (usagePercent >= 90) {
                this.addResult('memory_usage', 'critical',
                    `Mémoire critique: ${usagePercent}%`, memInfo);
            } else if (usagePercent >= 80) {
                this.addResult('memory_usage', 'warning',
                    `Mémoire élevée: ${usagePercent}%`, memInfo);
            } else {
                this.addResult('memory_usage', 'healthy',
                    `Mémoire OK: ${usagePercent}%`, memInfo);
            }
            
        } catch (error) {
            this.addResult('memory_usage', 'warning',
                `Impossible de vérifier la mémoire: ${error.message}`);
        }
    }

    /**
     * Vérification des logs d'erreur récents
     */
    async checkRecentErrors() {
        try {
            const logPaths = [
                '/var/log/brumisater/error.log',
                '/var/log/brumisater/combined.log'
            ];
            
            let errorCount = 0;
            const recentErrors = [];
            const cutoffTime = Date.now() - (15 * 60 * 1000); // 15 minutes
            
            for (const logPath of logPaths) {
                if (fs.existsSync(logPath)) {
                    const { stdout } = await execAsync(
                        `tail -n 100 "${logPath}" | grep -i error || true`
                    );
                    
                    if (stdout.trim()) {
                        const lines = stdout.trim().split('\n');
                        errorCount += lines.length;
                        
                        // Garder les 5 erreurs les plus récentes pour le rapport
                        recentErrors.push(...lines.slice(-5));
                    }
                }
            }
            
            if (errorCount === 0) {
                this.addResult('recent_errors', 'healthy',
                    'Aucune erreur récente dans les logs');
            } else if (errorCount < 10) {
                this.addResult('recent_errors', 'warning',
                    `${errorCount} erreurs dans les logs récents`, {
                        errorCount,
                        samples: recentErrors.slice(-3)
                    });
            } else {
                this.addResult('recent_errors', 'critical',
                    `${errorCount} erreurs dans les logs récents`, {
                        errorCount,
                        samples: recentErrors.slice(-3)
                    });
            }
            
        } catch (error) {
            this.addResult('recent_errors', 'warning',
                `Impossible de vérifier les logs: ${error.message}`);
        }
    }

    /**
     * Exécution de tous les checks avec retry
     */
    async runAllChecks() {
        const checks = [
            () => this.checkHttpEndpoint(),
            () => this.checkPM2Processes(),
            () => this.checkDatabase(),
            () => this.checkDiskUsage(),
            () => this.checkMemoryUsage(),
            () => this.checkRecentErrors()
        ];
        
        for (const check of checks) {
            let attempt = 0;
            let success = false;
            
            while (attempt < config.retries && !success) {
                try {
                    await check();
                    success = true;
                } catch (error) {
                    attempt++;
                    if (attempt >= config.retries) {
                        this.addResult('system', 'critical',
                            `Check failed after ${attempt} attempts: ${error.message}`);
                    } else {
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                }
            }
        }
    }

    /**
     * Génération du rapport final
     */
    generateReport() {
        const duration = Date.now() - this.startTime;
        
        const summary = {
            healthy: 0,
            warning: 0,
            critical: 0
        };
        
        this.results.forEach(result => {
            summary[result.status]++;
        });
        
        let overallStatus = 'healthy';
        let exitCode = EXIT_CODES.HEALTHY;
        
        if (summary.critical > 0) {
            overallStatus = 'critical';
            exitCode = EXIT_CODES.CRITICAL;
        } else if (summary.warning > 0) {
            overallStatus = 'warning';
            exitCode = EXIT_CODES.WARNING;
        }
        
        const report = {
            timestamp: new Date().toISOString(),
            overallStatus,
            duration: `${duration}ms`,
            summary,
            checks: this.results,
            environment: {
                nodeEnv: process.env.NODE_ENV,
                host: require('os').hostname(),
                pid: process.pid
            }
        };
        
        // Output JSON pour les outils de monitoring
        console.log(JSON.stringify(report, null, 2));
        
        return exitCode;
    }
}

// Fonction principale
async function main() {
    const checker = new HealthChecker();
    
    try {
        await checker.runAllChecks();
        const exitCode = checker.generateReport();
        process.exit(exitCode);
        
    } catch (error) {
        checker.addResult('system', 'critical',
            `Erreur fatale du health check: ${error.message}`);
        
        const exitCode = checker.generateReport();
        process.exit(exitCode);
    }
}

// Gestion des signaux
process.on('SIGTERM', () => {
    console.log('Health check interrompu par SIGTERM');
    process.exit(EXIT_CODES.UNKNOWN);
});

process.on('SIGINT', () => {
    console.log('Health check interrompu par SIGINT');
    process.exit(EXIT_CODES.UNKNOWN);
});

// Exécuter si appelé directement
if (require.main === module) {
    main().catch(error => {
        console.error('Erreur fatale:', error);
        process.exit(EXIT_CODES.UNKNOWN);
    });
}

module.exports = HealthChecker;