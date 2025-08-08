const PerformanceMonitoringService = require('../services/PerformanceMonitoringService');

/**
 * Middleware de monitoring des performances
 */
class PerformanceMiddleware {
    constructor() {
        this.performanceService = PerformanceMonitoringService.create();
        
        // Configuration des seuils
        this.thresholds = {
            api: parseInt(process.env.API_RESPONSE_TARGET) || 500, // 500ms selon TODO.md
            pdf: parseInt(process.env.PDF_GENERATION_TARGET) || 2000, // 2s selon TODO.md
            slow: parseInt(process.env.PERF_SLOW_THRESHOLD) || 1000
        };
    }

    /**
     * Middleware principal de monitoring
     */
    monitor() {
        return this.performanceService.middleware();
    }

    /**
     * Middleware spécifique pour les API endpoints
     */
    monitorAPI() {
        return (req, res, next) => {
            const startTime = process.hrtime.bigint();
            
            // Hook sur la fin de réponse
            const originalEnd = res.end;
            res.end = (...args) => {
                const endTime = process.hrtime.bigint();
                const responseTimeMs = Number(endTime - startTime) / 1000000;
                
                // Enregistrer métrique personnalisée pour API
                this.performanceService.recordCustomMetric(
                    'api_response_time',
                    responseTimeMs,
                    {
                        method: req.method,
                        route: req.route?.path || req.path,
                        status: res.statusCode,
                        target: this.thresholds.api,
                        isWithinTarget: responseTimeMs < this.thresholds.api
                    }
                );
                
                // Alert si dépasse la cible TODO.md (500ms)
                if (responseTimeMs > this.thresholds.api) {
                    this.performanceService.log('warn', 'API response time dépassé', {
                        target: `${this.thresholds.api}ms`,
                        actual: `${responseTimeMs.toFixed(2)}ms`,
                        endpoint: `${req.method} ${req.path}`,
                        overage: `+${(responseTimeMs - this.thresholds.api).toFixed(2)}ms`
                    });
                }
                
                originalEnd.apply(res, args);
            };
            
            next();
        };
    }

    /**
     * Middleware pour monitoring PDF generation
     */
    monitorPDF() {
        return (req, res, next) => {
            // Ajouter une méthode pour mesurer la génération PDF
            req.measurePdfGeneration = async (operation) => {
                const result = await this.performanceService.measureTime(
                    `pdf_generation_${operation}`,
                    operation
                );
                
                // Enregistrer métrique PDF
                this.performanceService.recordCustomMetric(
                    'pdf_generation_time',
                    result.duration,
                    {
                        target: this.thresholds.pdf,
                        isWithinTarget: result.duration < this.thresholds.pdf
                    }
                );
                
                // Alert si dépasse la cible TODO.md (2s)
                if (result.duration > this.thresholds.pdf) {
                    this.performanceService.log('warn', 'PDF generation time dépassé', {
                        target: `${this.thresholds.pdf}ms`,
                        actual: `${result.duration.toFixed(2)}ms`,
                        overage: `+${(result.duration - this.thresholds.pdf).toFixed(2)}ms`
                    });
                }
                
                return result;
            };
            
            next();
        };
    }

    /**
     * Endpoint pour obtenir les métriques de performance
     */
    getMetricsEndpoint() {
        return (req, res) => {
            try {
                const report = this.performanceService.generatePerformanceReport();
                
                // Ajouter des informations spécifiques aux cibles TODO.md
                const apiMetrics = this.getAPIPerformanceMetrics();
                const pdfMetrics = this.getPDFPerformanceMetrics();
                
                res.json({
                    ...report,
                    targets: {
                        api: {
                            target: this.thresholds.api,
                            ...apiMetrics
                        },
                        pdf: {
                            target: this.thresholds.pdf,
                            ...pdfMetrics
                        }
                    },
                    timestamp: Date.now()
                });
                
            } catch (error) {
                this.performanceService.logError(error, { endpoint: 'metrics' });
                res.status(500).json({ 
                    error: 'Erreur lors de la récupération des métriques',
                    message: error.message 
                });
            }
        };
    }

    /**
     * Obtient les métriques de performance API
     */
    getAPIPerformanceMetrics() {
        const apiEndpoints = this.performanceService.getSlowestEndpoints(20)
            .filter(ep => ep.endpoint.includes('/api/'));
        
        const withinTarget = apiEndpoints.filter(ep => ep.avgResponseTime < this.thresholds.api);
        const aboveTarget = apiEndpoints.filter(ep => ep.avgResponseTime >= this.thresholds.api);
        
        return {
            totalEndpoints: apiEndpoints.length,
            withinTarget: withinTarget.length,
            aboveTarget: aboveTarget.length,
            complianceRate: apiEndpoints.length > 0 
                ? ((withinTarget.length / apiEndpoints.length) * 100).toFixed(2) + '%'
                : '100%',
            slowestEndpoints: aboveTarget.slice(0, 5)
        };
    }

    /**
     * Obtient les métriques de performance PDF
     */
    getPDFPerformanceMetrics() {
        // Récupérer les métriques personnalisées PDF
        const pdfMetrics = this.performanceService.metrics.endpoints.get('custom:pdf_generation_time');
        
        if (!pdfMetrics || !pdfMetrics.values.length) {
            return {
                totalGenerations: 0,
                avgTime: 0,
                withinTarget: 0,
                aboveTarget: 0,
                complianceRate: '100%'
            };
        }
        
        const recentValues = pdfMetrics.values.slice(-100); // 100 dernières générations
        const withinTarget = recentValues.filter(v => v.tags.isWithinTarget);
        const aboveTarget = recentValues.filter(v => !v.tags.isWithinTarget);
        
        return {
            totalGenerations: recentValues.length,
            avgTime: (pdfMetrics.sum / pdfMetrics.count).toFixed(2),
            minTime: pdfMetrics.min.toFixed(2),
            maxTime: pdfMetrics.max.toFixed(2),
            withinTarget: withinTarget.length,
            aboveTarget: aboveTarget.length,
            complianceRate: ((withinTarget.length / recentValues.length) * 100).toFixed(2) + '%'
        };
    }

    /**
     * Health check endpoint avec métriques
     */
    getHealthCheckEndpoint() {
        return (req, res) => {
            try {
                const system = this.performanceService.getSystemMetrics();
                const alerts = this.performanceService.getActiveAlerts();
                
                // Déterminer le statut de santé
                let status = 'healthy';
                let issues = [];
                
                // Vérifier les alertes critiques
                const criticalAlerts = alerts.filter(a => a.severity === 'error');
                if (criticalAlerts.length > 0) {
                    status = 'unhealthy';
                    issues.push(...criticalAlerts.map(a => a.message));
                }
                
                // Vérifier les alertes d'avertissement
                const warningAlerts = alerts.filter(a => a.severity === 'warning');
                if (warningAlerts.length > 0 && status === 'healthy') {
                    status = 'degraded';
                    issues.push(...warningAlerts.map(a => a.message));
                }
                
                // Vérifier la performance moyenne
                if (parseFloat(system.avgResponseTime) > this.thresholds.slow) {
                    status = status === 'healthy' ? 'degraded' : status;
                    issues.push(`Response time élevé: ${system.avgResponseTime}ms`);
                }
                
                const response = {
                    status,
                    timestamp: Date.now(),
                    uptime: system.uptimeHuman,
                    version: process.env.npm_package_version || '1.0.0',
                    environment: process.env.NODE_ENV || 'development',
                    metrics: {
                        requestCount: system.requestCount,
                        avgResponseTime: system.avgResponseTime,
                        errorRate: system.errorRate,
                        memoryUsage: {
                            used: Math.round(system.memoryUsage.used / 1024 / 1024) + 'MB',
                            total: Math.round(system.memoryUsage.rss / 1024 / 1024) + 'MB'
                        }
                    },
                    performance: {
                        apiTarget: this.thresholds.api + 'ms',
                        pdfTarget: this.thresholds.pdf + 'ms',
                        currentAvg: system.avgResponseTime + 'ms'
                    },
                    issues: issues.length > 0 ? issues : undefined
                };
                
                // Status code selon l'état
                const statusCode = status === 'healthy' ? 200 : 
                                 status === 'degraded' ? 200 : 503;
                
                res.status(statusCode).json(response);
                
            } catch (error) {
                this.performanceService.logError(error, { endpoint: 'health' });
                res.status(500).json({
                    status: 'unhealthy',
                    error: 'Health check failed',
                    timestamp: Date.now()
                });
            }
        };
    }

    /**
     * Middleware pour rate limiting basé sur performance
     */
    adaptiveRateLimit() {
        return (req, res, next) => {
            const system = this.performanceService.getSystemMetrics();
            const currentLoad = parseFloat(system.avgResponseTime);
            
            // Si la charge est élevée, ralentir les requêtes
            if (currentLoad > this.thresholds.slow * 2) {
                // Delay supplémentaire pour réduire la charge
                setTimeout(() => next(), 100);
            } else {
                next();
            }
        };
    }

    /**
     * Méthode statique pour créer une instance singleton
     */
    static create() {
        if (!PerformanceMiddleware.instance) {
            PerformanceMiddleware.instance = new PerformanceMiddleware();
        }
        return PerformanceMiddleware.instance;
    }
}

module.exports = PerformanceMiddleware;