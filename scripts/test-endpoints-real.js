/**
 * Script de test des endpoints HTTP réels
 * Usage: node scripts/test-endpoints-real.js
 */

const http = require('http');
const https = require('https');
const { URL } = require('url');

// Configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3074';
const TEST_EMAIL = 'test-real@example.com';
const TEST_PASSWORD = 'testpassword123';

class EndpointTester {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
        this.cookies = new Map();
        this.sessionId = null;
    }

    /**
     * Fait une requête HTTP avec gestion des cookies
     */
    async makeRequest(method, path, data = null, headers = {}) {
        return new Promise((resolve, reject) => {
            const url = new URL(path, this.baseUrl);
            const isHttps = url.protocol === 'https:';
            const httpModule = isHttps ? https : http;

            const options = {
                hostname: url.hostname,
                port: url.port || (isHttps ? 443 : 80),
                path: url.pathname + url.search,
                method: method.toUpperCase(),
                headers: {
                    'User-Agent': 'Test-Script/1.0',
                    'Accept': 'application/json, text/html, */*',
                    ...(method === 'POST' ? { 'Content-Type': 'application/json' } : {}),
                    ...headers
                }
            };

            // Ajouter les cookies
            if (this.cookies.size > 0) {
                const cookieHeader = Array.from(this.cookies.entries())
                    .map(([name, value]) => `${name}=${value}`)
                    .join('; ');
                options.headers['Cookie'] = cookieHeader;
            }

            // Ajouter Content-Length pour POST
            if (data && method === 'POST') {
                const postData = typeof data === 'string' ? data : JSON.stringify(data);
                options.headers['Content-Length'] = Buffer.byteLength(postData);
            }

            const req = httpModule.request(options, (res) => {
                let body = '';
                
                res.on('data', (chunk) => {
                    body += chunk;
                });

                res.on('end', () => {
                    // Extraire les cookies de la réponse
                    const setCookies = res.headers['set-cookie'];
                    if (setCookies) {
                        setCookies.forEach(cookieString => {
                            const [nameValue] = cookieString.split(';');
                            const [name, value] = nameValue.split('=');
                            if (name && value) {
                                this.cookies.set(name.trim(), value.trim());
                                if (name.trim() === 'connect.sid') {
                                    this.sessionId = value.trim();
                                }
                            }
                        });
                    }

                    // Parser la réponse
                    let parsedBody;
                    try {
                        parsedBody = JSON.parse(body);
                    } catch {
                        parsedBody = body;
                    }

                    resolve({
                        status: res.statusCode,
                        headers: res.headers,
                        body: parsedBody,
                        rawBody: body
                    });
                });
            });

            req.on('error', (err) => {
                reject(err);
            });

            // Timeout
            req.setTimeout(10000, () => {
                req.destroy();
                reject(new Error('Request timeout'));
            });

            // Envoyer les données POST
            if (data && method === 'POST') {
                const postData = typeof data === 'string' ? data : JSON.stringify(data);
                req.write(postData);
            }

            req.end();
        });
    }

    /**
     * Test de l'endpoint de création d'utilisateur
     */
    async testInscription() {
        console.log('📝 Test inscription...');
        
        const response = await this.makeRequest('POST', '/api/auth/inscription', {
            nom: 'Test Real User',
            email: TEST_EMAIL,
            motDePasse: TEST_PASSWORD,
            confirmationMotDePasse: TEST_PASSWORD
        });

        console.log(`   Status: ${response.status}`);
        console.log(`   Session ID: ${this.sessionId ? 'Oui' : 'Non'}`);
        
        if (response.status === 201 || response.status === 200) {
            console.log('   ✅ Inscription réussie');
            console.log(`   Utilisateur: ${response.body.donnees?.utilisateur?.nom}`);
            return true;
        } else {
            console.log('   ❌ Échec inscription');
            console.log(`   Erreur: ${response.body.message || 'Inconnue'}`);
            return false;
        }
    }

    /**
     * Test de déconnexion
     */
    async testDeconnexion() {
        console.log('🚪 Test déconnexion...');
        
        const response = await this.makeRequest('POST', '/api/auth/deconnexion');
        
        console.log(`   Status: ${response.status}`);
        
        if (response.status === 200) {
            console.log('   ✅ Déconnexion réussie');
            return true;
        } else {
            console.log('   ❌ Échec déconnexion');
            return false;
        }
    }

    /**
     * Test de connexion
     */
    async testConnexion() {
        console.log('🔑 Test connexion...');
        
        const response = await this.makeRequest('POST', '/api/auth/connexion', {
            email: TEST_EMAIL,
            motDePasse: TEST_PASSWORD
        });

        console.log(`   Status: ${response.status}`);
        console.log(`   Session ID: ${this.sessionId ? 'Oui' : 'Non'}`);
        
        if (response.status === 200) {
            console.log('   ✅ Connexion réussie');
            console.log(`   Utilisateur: ${response.body.donnees?.utilisateur?.nom}`);
            return true;
        } else {
            console.log('   ❌ Échec connexion');
            console.log(`   Erreur: ${response.body.message || 'Inconnue'}`);
            return false;
        }
    }

    /**
     * Test de statut de session
     */
    async testStatut() {
        console.log('📊 Test statut session...');
        
        const response = await this.makeRequest('GET', '/api/auth/statut');
        
        console.log(`   Status: ${response.status}`);
        
        if (response.status === 200) {
            console.log('   ✅ Session valide');
            console.log(`   Utilisateur: ${response.body.donnees?.utilisateur?.nom}`);
            return true;
        } else {
            console.log('   ❌ Session invalide');
            console.log(`   Erreur: ${response.body.message || 'Inconnue'}`);
            return false;
        }
    }

    /**
     * Test de récupération mot de passe
     */
    async testMotDePasseOublie() {
        console.log('📧 Test mot de passe oublié...');
        
        const response = await this.makeRequest('POST', '/api/auth/mot-de-passe-oublie', {
            email: TEST_EMAIL
        });

        console.log(`   Status: ${response.status}`);
        
        if (response.status === 200) {
            console.log('   ✅ Demande récupération envoyée');
            console.log(`   Message: ${response.body.message}`);
            return true;
        } else {
            console.log('   ❌ Échec demande récupération');
            console.log(`   Erreur: ${response.body.message || 'Inconnue'}`);
            return false;
        }
    }

    /**
     * Test de la page d'accueil
     */
    async testPageAccueil() {
        console.log('🏠 Test page d\'accueil...');
        
        const response = await this.makeRequest('GET', '/');
        
        console.log(`   Status: ${response.status}`);
        console.log(`   Type: ${typeof response.body}`);
        
        if (response.status === 200) {
            console.log('   ✅ Page d\'accueil accessible');
            const isHtml = typeof response.body === 'string' && response.body.includes('<html');
            console.log(`   Format: ${isHtml ? 'HTML' : 'Autre'}`);
            return true;
        } else {
            console.log('   ❌ Page d\'accueil inaccessible');
            return false;
        }
    }

    /**
     * Test des routes statiques
     */
    async testStaticRoutes() {
        console.log('📁 Test routes statiques...');
        
        const routes = ['/css/style.css', '/js/app.js', '/favicon.ico'];
        
        for (const route of routes) {
            try {
                const response = await this.makeRequest('GET', route);
                console.log(`   ${route}: ${response.status}`);
            } catch (error) {
                console.log(`   ${route}: Erreur - ${error.message}`);
            }
        }
    }

    /**
     * Nettoyage : supprimer l'utilisateur test
     */
    async cleanup() {
        console.log('🧹 Nettoyage...');
        const db = require('../src/database/db');
        
        try {
            await db.run('DELETE FROM utilisateurs WHERE email = $1', [TEST_EMAIL]);
            console.log('   ✅ Utilisateur test supprimé');
        } catch (error) {
            console.log('   ⚠️  Erreur nettoyage:', error.message);
        }
    }
}

async function testAllEndpoints() {
    console.log('🚀 Test des endpoints HTTP réels\n');
    console.log(`Base URL: ${BASE_URL}\n`);
    
    const tester = new EndpointTester(BASE_URL);
    
    try {
        // Tests de base
        await tester.testPageAccueil();
        console.log('');
        
        await tester.testStaticRoutes();
        console.log('');
        
        // Tests d'authentification
        await tester.testInscription();
        console.log('');
        
        await tester.testStatut();
        console.log('');
        
        await tester.testDeconnexion();
        console.log('');
        
        await tester.testConnexion();
        console.log('');
        
        await tester.testStatut();
        console.log('');
        
        await tester.testMotDePasseOublie();
        console.log('');
        
    } catch (error) {
        console.error('❌ Erreur lors des tests:', error.message);
    } finally {
        await tester.cleanup();
    }
}

// Lancer les tests
testAllEndpoints().then(() => {
    console.log('\n✨ Tests des endpoints terminés');
    process.exit(0);
}).catch(error => {
    console.error('\n💥 Erreur fatale:', error);
    process.exit(1);
});