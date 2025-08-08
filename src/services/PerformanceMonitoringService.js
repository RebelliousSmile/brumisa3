const BaseService = require('./BaseService');

/**
 * Service de monitoring des performances
 * Mesure temps de réponse, métriques d'usage, détection de problèmes
 */
class PerformanceMonitoringService extends BaseService {
    constructor() {
        super('PerformanceMonitoringService');
        this.metrics = {
            requests: new Map(),
            endpoints: new Map(),
            errors: new Map(),
            system: {
                startTime: Date.now(),
                requestCount: 0,
                errorCount: 0,
                totalResponseTime: 0
            }
        };
        
        // Configuration
        this.config = {
            maxHistorySize: parseInt(process.env.PERF_MAX_HISTORY) || 1000,
            slowRequestThreshold: parseInt(process.env.PERF_SLOW_THRESHOLD) || 1000, // 1 seconde
            alertThreshold: parseInt(process.env.PERF_ALERT_THRESHOLD) || 5000, // 5 secondes
            metricsRetentionTime: parseInt(process.env.PERF_RETENTION) || 86400000 // 24 heures
        };
        
        this.log('info', 'PerformanceMonitoringService initialisé', {
            slowRequestThreshold: this.config.slowRequestThreshold,
            alertThreshold: this.config.alertThreshold
        });
        
        // Nettoyer les métriques anciennes périodiquement
        setInterval(() => {
            this.cleanOldMetrics();
        }, 300000); // Toutes les 5 minutes
    }

    /**
     * Middleware Express pour mesurer les performances
     * 
     * @returns {Function} Middleware Express
     */
    middleware() {
        return (req, res, next) => {
            const startTime = process.hrtime.bigint();
            const requestId = this.generateRequestId();
            
            // Ajouter l'ID de requête pour traçabilité
            req.performanceId = requestId;
            
            // Hook sur la fin de réponse
            const originalEnd = res.end;
            res.end = (...args) => {
                const endTime = process.hrtime.bigint();
                const responseTimeMs = Number(endTime - startTime) / 1000000;
                
                // Enregistrer les métriques
                this.recordRequest({
                    id: requestId,
                    method: req.method,
                    path: req.path,
                    route: req.route?.path || req.path,
                    statusCode: res.statusCode,
                    responseTime: responseTimeMs,
                    timestamp: Date.now(),
                    userAgent: req.get('User-Agent'),
                    ip: req.ip,
                    userId: req.session?.userId || null
                });
                
                // Appeler la méthode originale
                originalEnd.apply(res, args);
            };
            
            next();
        };
    }

    /**
     * Enregistre une requête dans les métriques
     */
    recordRequest(requestData) {
        const { 
            id, method, path, route, statusCode, responseTime, 
            timestamp, userAgent, ip, userId 
        } = requestData;
        
        // Stocker les détails de la requête
        this.metrics.requests.set(id, requestData);
        
        // Nettoyer si trop d'entrées
        if (this.metrics.requests.size > this.config.maxHistorySize) {
            const oldestKey = this.metrics.requests.keys().next().value;
            this.metrics.requests.delete(oldestKey);
        }
        
        // Métriques par endpoint
        const endpointKey = `${method} ${route}`;
        if (!this.metrics.endpoints.has(endpointKey)) {
            this.metrics.endpoints.set(endpointKey, {
                method,
                route,
                count: 0,
                totalResponseTime: 0,
                minResponseTime: Infinity,
                maxResponseTime: 0,
                errorCount: 0,
                statusCodes: new Map()
            });
        }
        
        const endpoint = this.metrics.endpoints.get(endpointKey);
        endpoint.count++;
        endpoint.totalResponseTime += responseTime;
        endpoint.minResponseTime = Math.min(endpoint.minResponseTime, responseTime);
        endpoint.maxResponseTime = Math.max(endpoint.maxResponseTime, responseTime);
        
        // Status codes
        const statusKey = statusCode.toString();
        endpoint.statusCodes.set(statusKey, (endpoint.statusCodes.get(statusKey) || 0) + 1);
        
        if (statusCode >= 400) {
            endpoint.errorCount++;
        }
        
        // Métriques système globales
        this.metrics.system.requestCount++;
        this.metrics.system.totalResponseTime += responseTime;
        
        if (statusCode >= 400) {
            this.metrics.system.errorCount++;
        }
        
        // Logging pour requêtes lentes
        if (responseTime > this.config.slowRequestThreshold) {
            this.log('warn', 'Requête lente détectée', {
                method,
                path,
                responseTime: `${responseTime.toFixed(2)}ms`,
                statusCode,
                userId
            });
        }
        
        // Alerte pour requêtes très lentes
        if (responseTime > this.config.alertThreshold) {
            this.log('error', 'Requête critique lente', {
                method,
                path,
                responseTime: `${responseTime.toFixed(2)}ms`,
                statusCode,
                userId,
                userAgent
            });
        }
        
        // Log debug pour toutes les requêtes
        this.log('debug', 'Requête traitée', {
            id,
            method,
            path,
            responseTime: `${responseTime.toFixed(2)}ms`,
            statusCode
        });
    }

    /**
     * Mesure le temps d'exécution d'une fonction
     */
    async measureTime(operation, fn) {
        const startTime = process.hrtime.bigint();
        
        try {
            const result = await fn();
            const endTime = process.hrtime.bigint();
            const duration = Number(endTime - startTime) / 1000000;
            
            this.log('debug', 'Opération mesurée', {
                operation,
                duration: `${duration.toFixed(2)}ms`
            });
            
            return { result, duration };
            
        } catch (error) {
            const endTime = process.hrtime.bigint();
            const duration = Number(endTime - startTime) / 1000000;
            
            this.log('error', 'Erreur dans opération mesurée', {
                operation,
                duration: `${duration.toFixed(2)}ms`,
                error: error.message
            });
            
            throw error;
        }
    }

    /**
     * Enregistre une métrique personnalisée
     */
    recordCustomMetric(name, value, tags = {}) {
        const timestamp = Date.now();
        const metricKey = `custom:${name}`;
        
        if (!this.metrics.endpoints.has(metricKey)) {
            this.metrics.endpoints.set(metricKey, {
                name,
                type: 'custom',
                values: [],
                count: 0,
                sum: 0,
                min: Infinity,
                max: 0
            });
        }
        
        const metric = this.metrics.endpoints.get(metricKey);
        metric.values.push({ value, timestamp, tags });
        metric.count++;
        metric.sum += value;
        metric.min = Math.min(metric.min, value);
        metric.max = Math.max(metric.max, value);
        
        // Nettoyer les anciennes valeurs
        const cutoff = timestamp - this.config.metricsRetentionTime;
        metric.values = metric.values.filter(v => v.timestamp > cutoff);
        
        this.log('debug', 'Métrique personnalisée enregistrée', {
            name,
            value,
            tags
        });
    }

    /**
     * Obtient les métriques d'un endpoint
     */
    getEndpointMetrics(method, route) {
        const key = `${method} ${route}`;
        const endpoint = this.metrics.endpoints.get(key);
        
        if (!endpoint) {
            return null;
        }
        
        return {
            ...endpoint,
            avgResponseTime: endpoint.totalResponseTime / endpoint.count,
            errorRate: (endpoint.errorCount / endpoint.count * 100).toFixed(2) + '%',
            statusCodes: Object.fromEntries(endpoint.statusCodes)
        };
    }

    /**
     * Obtient les métriques système globales
     */
    getSystemMetrics() {
        const { system } = this.metrics;
        const uptime = Date.now() - system.startTime;
        const avgResponseTime = system.requestCount > 0 
            ? system.totalResponseTime / system.requestCount 
            : 0;
        const errorRate = system.requestCount > 0 
            ? (system.errorCount / system.requestCount * 100).toFixed(2) + '%' 
            : '0%';
        
        return {
            uptime,
            uptimeHuman: this.formatUptime(uptime),
            requestCount: system.requestCount,
            errorCount: system.errorCount,
            errorRate,
            avgResponseTime: avgResponseTime.toFixed(2),
            requestsPerMinute: this.getRequestsPerMinute(),
            memoryUsage: process.memoryUsage(),
            cpuUsage: process.cpuUsage()
        };
    }

    /**
     * Obtient le nombre de requêtes par minute
     */
    getRequestsPerMinute() {
        const oneMinuteAgo = Date.now() - 60000;
        let count = 0;
        
        for (const request of this.metrics.requests.values()) {
            if (request.timestamp > oneMinuteAgo) {
                count++;
            }
        }
        
        return count;
    }

    /**
     * Obtient les endpoints les plus lents
     */
    getSlowestEndpoints(limit = 10) {
        const endpoints = Array.from(this.metrics.endpoints.entries())
            .filter(([key, data]) => !key.startsWith('custom:'))
            .map(([key, data]) => ({
                endpoint: key,
                avgResponseTime: data.totalResponseTime / data.count,
                count: data.count,
                maxResponseTime: data.maxResponseTime,
                errorRate: (data.errorCount / data.count * 100).toFixed(2) + '%'
            }))
            .sort((a, b) => b.avgResponseTime - a.avgResponseTime)
            .slice(0, limit);
        
        return endpoints;
    }

    /**
     * Obtient les endpoints avec le plus d'erreurs
     */
    getEndpointsWithMostErrors(limit = 10) {
        const endpoints = Array.from(this.metrics.endpoints.entries())
            .filter(([key, data]) => !key.startsWith('custom:'))
            .map(([key, data]) => ({
                endpoint: key,
                errorCount: data.errorCount,
                totalCount: data.count,
                errorRate: (data.errorCount / data.count * 100).toFixed(2) + '%'
            }))
            .filter(e => e.errorCount > 0)
            .sort((a, b) => b.errorCount - a.errorCount)
            .slice(0, limit);
        
        return endpoints;
    }

    /**
     * Obtient les requêtes récentes
     */
    getRecentRequests(limit = 50) {
        return Array.from(this.metrics.requests.values())
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, limit)
            .map(req => ({
                id: req.id,
                method: req.method,
                path: req.path,
                statusCode: req.statusCode,
                responseTime: req.responseTime.toFixed(2),
                timestamp: req.timestamp,
                userId: req.userId
            }));
    }

    /**
     * Génère un rapport de performance complet
     */
    generatePerformanceReport() {
        return {
            system: this.getSystemMetrics(),
            slowestEndpoints: this.getSlowestEndpoints(),
            mostErrors: this.getEndpointsWithMostErrors(),
            recentRequests: this.getRecentRequests(20),
            alerts: this.getActiveAlerts()
        };
    }

    /**
     * Obtient les alertes actives
     */
    getActiveAlerts() {
        const alerts = [];
        const now = Date.now();
        const fiveMinutesAgo = now - 300000;
        
        // Vérifier les requêtes lentes récentes
        const recentSlowRequests = Array.from(this.metrics.requests.values())
            .filter(req => 
                req.timestamp > fiveMinutesAgo && 
                req.responseTime > this.config.slowRequestThreshold
            );
        
        if (recentSlowRequests.length > 0) {
            alerts.push({
                type: 'slow_requests',
                severity: 'warning',
                count: recentSlowRequests.length,
                message: `${recentSlowRequests.length} requêtes lentes dans les 5 dernières minutes`
            });
        }
        
        // Vérifier le taux d'erreur élevé
        const recentRequests = Array.from(this.metrics.requests.values())
            .filter(req => req.timestamp > fiveMinutesAgo);
        
        const recentErrors = recentRequests.filter(req => req.statusCode >= 400);
        
        if (recentRequests.length > 0) {
            const errorRate = (recentErrors.length / recentRequests.length) * 100;
            if (errorRate > 10) { // Plus de 10% d'erreurs
                alerts.push({
                    type: 'high_error_rate',
                    severity: 'error',
                    errorRate: errorRate.toFixed(2) + '%',
                    message: `Taux d'erreur élevé: ${errorRate.toFixed(2)}%`
                });
            }
        }
        
        return alerts;
    }

    /**
     * Nettoie les métriques anciennes
     */
    cleanOldMetrics() {
        const cutoff = Date.now() - this.config.metricsRetentionTime;
        let cleaned = 0;
        
        for (const [id, request] of this.metrics.requests.entries()) {
            if (request.timestamp < cutoff) {
                this.metrics.requests.delete(id);
                cleaned++;
            }
        }
        
        if (cleaned > 0) {
            this.log('debug', 'Métriques anciennes nettoyées', { cleaned });
        }
    }

    /**
     * Formate la durée d'uptime
     */
    formatUptime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (days > 0) {
            return `${days}j ${hours % 24}h ${minutes % 60}m`;
        } else if (hours > 0) {
            return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds % 60}s`;
        } else {
            return `${seconds}s`;
        }
    }

    /**
     * Génère un ID unique pour les requêtes
     */
    generateRequestId() {
        return `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    }

    /**
     * Reset toutes les métriques
     */
    resetMetrics() {
        this.metrics = {
            requests: new Map(),
            endpoints: new Map(),
            errors: new Map(),
            system: {
                startTime: Date.now(),
                requestCount: 0,
                errorCount: 0,
                totalResponseTime: 0
            }
        };
        
        this.log('info', 'Métriques réinitialisées');
    }

    /**
     * Méthode statique pour créer une instance singleton
     */
    static create() {
        if (!PerformanceMonitoringService.instance) {
            PerformanceMonitoringService.instance = new PerformanceMonitoringService();
        }
        return PerformanceMonitoringService.instance;
    }
}

module.exports = PerformanceMonitoringService;