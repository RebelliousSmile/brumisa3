/**
 * Helper spécialisé pour la gestion du serveur dans les tests
 * Principe SOLID : Interface Segregation - Une seule responsabilité
 */

class ServerTestHelper {
    constructor() {
        this.servers = new Set();
        this.ports = new Set();
    }

    /**
     * Démarre un serveur de test sur un port disponible
     * @param {Object} app - Application Express
     * @param {number} preferredPort - Port préféré (optionnel)
     * @returns {Promise<Object>} - Serveur démarré avec le port
     */
    async startServer(app, preferredPort = null) {
        return new Promise((resolve, reject) => {
            // Utiliser le port 0 pour laisser le système choisir un port libre
            const port = preferredPort || 0;
            
            const server = app.listen(port, (error) => {
                if (error) {
                    reject(error);
                    return;
                }

                const actualPort = server.address().port;
                this.servers.add(server);
                this.ports.add(actualPort);

                // Attendre que le serveur soit vraiment prêt
                setTimeout(() => {
                    resolve({
                        server,
                        port: actualPort,
                        url: `http://localhost:${actualPort}`
                    });
                }, 100);
            });

            // Gestion des erreurs du serveur
            server.on('error', (error) => {
                if (error.code === 'EADDRINUSE') {
                    // Port déjà utilisé, essayer avec un autre port
                    this.startServer(app, 0).then(resolve).catch(reject);
                } else {
                    reject(error);
                }
            });
        });
    }

    /**
     * Arrête un serveur de manière propre
     * @param {Object} server - Instance du serveur à arrêter
     */
    async stopServer(server) {
        if (!server) return;

        return new Promise((resolve) => {
            try {
                server.close(() => {
                    this.servers.delete(server);
                    resolve();
                });

                // Force la fermeture après 2 secondes
                setTimeout(() => {
                    if (server.listening) {
                        server.closeAllConnections?.();
                    }
                    resolve();
                }, 2000);
            } catch (error) {
                console.warn('Erreur lors de l\'arrêt du serveur:', error.message);
                resolve();
            }
        });
    }

    /**
     * Arrête tous les serveurs démarrés
     */
    async stopAllServers() {
        const stopPromises = Array.from(this.servers).map(server => 
            this.stopServer(server)
        );

        await Promise.all(stopPromises);
        this.servers.clear();
        this.ports.clear();
    }

    /**
     * Vérifie si un serveur répond
     * @param {string} url - URL du serveur à tester
     * @returns {Promise<boolean>}
     */
    async isServerReady(url) {
        try {
            const http = require('http');
            return new Promise((resolve) => {
                const req = http.get(`${url}/`, { timeout: 1000 }, (res) => {
                    resolve(res.statusCode < 500);
                });
                req.on('error', () => resolve(false));
                req.on('timeout', () => resolve(false));
            });
        } catch (error) {
            return false;
        }
    }

    /**
     * Attend qu'un serveur soit prêt
     * @param {string} url - URL du serveur
     * @param {number} maxAttempts - Nombre max de tentatives
     * @param {number} delay - Délai entre les tentatives (ms)
     */
    async waitForServer(url, maxAttempts = 10, delay = 500) {
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            const isReady = await this.isServerReady(url);
            
            if (isReady) {
                return true;
            }

            if (attempt < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }

        throw new Error(`Serveur non disponible après ${maxAttempts} tentatives: ${url}`);
    }

    /**
     * Obtient un port libre
     * @returns {Promise<number>}
     */
    async getFreePort() {
        const net = require('net');
        
        return new Promise((resolve, reject) => {
            const server = net.createServer();
            
            server.listen(0, () => {
                const port = server.address().port;
                server.close(() => resolve(port));
            });
            
            server.on('error', reject);
        });
    }

    /**
     * Crée un serveur de test avec configuration optimisée
     * @param {Object} app - Application Express
     * @param {Object} options - Options de configuration
     */
    async createTestServer(app, options = {}) {
        const {
            timeout = 30000,
            keepAliveTimeout = 5000,
            headersTimeout = 6000
        } = options;

        const { server, port, url } = await this.startServer(app);

        // Configuration optimisée pour les tests
        server.timeout = timeout;
        server.keepAliveTimeout = keepAliveTimeout;
        server.headersTimeout = headersTimeout;

        // Attendre que le serveur soit prêt
        if (options.waitForReady !== false) {
            await this.waitForServer(url);
        }

        return { server, port, url };
    }
}

module.exports = ServerTestHelper;