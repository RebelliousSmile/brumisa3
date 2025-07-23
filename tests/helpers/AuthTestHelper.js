/**
 * Helper spécialisé pour l'authentification dans les tests
 * Principe SOLID : Interface Segregation - Une seule responsabilité
 */

const request = require('supertest');

class AuthTestHelper {
    constructor() {
        this.testUsers = [];
        this.loggedInAgents = new Map();
    }

    /**
     * Crée un utilisateur de test avec des données par défaut
     * @param {Object} overrides - Données à surcharger
     * @returns {Object} - Données utilisateur de test
     */
    createTestUserData(overrides = {}) {
        const timestamp = Date.now();
        const defaultUser = {
            nom: 'Test User',
            email: `test_${timestamp}@example.com`,
            motDePasse: 'motdepasse123',
            confirmationMotDePasse: 'motdepasse123',
            role: 'UTILISATEUR',
            type_compte: 'STANDARD',
            ...overrides
        };

        this.testUsers.push(defaultUser);
        return defaultUser;
    }

    /**
     * Crée un utilisateur Admin de test
     * @param {Object} overrides - Données à surcharger
     */
    createAdminUserData(overrides = {}) {
        return this.createTestUserData({
            nom: 'Test Admin',
            email: `admin_${Date.now()}@example.com`,
            role: 'ADMIN',
            type_compte: 'PREMIUM',
            ...overrides
        });
    }

    /**
     * Crée un utilisateur Premium de test
     * @param {Object} overrides - Données à surcharger
     */
    createPremiumUserData(overrides = {}) {
        return this.createTestUserData({
            nom: 'Test Premium',
            email: `premium_${Date.now()}@example.com`,
            type_compte: 'PREMIUM',
            ...overrides
        });
    }

    /**
     * Inscrit un utilisateur via l'API
     * @param {Object} server - Serveur de test
     * @param {Object} userData - Données utilisateur
     * @returns {Promise<Object>} - Réponse de l'inscription
     */
    async registerUser(server, userData) {
        const response = await request(server)
            .post('/api/auth/inscription')
            .send(userData);

        if (response.status !== 201) {
            throw new Error(`Inscription échouée: ${response.status} - ${JSON.stringify(response.body)}`);
        }

        return response;
    }

    /**
     * Connecte un utilisateur et retourne un agent authentifié
     * @param {Object} server - Serveur de test
     * @param {Object} credentials - Identifiants (email, motDePasse)
     * @returns {Promise<Object>} - Agent authentifié (supertest agent)
     */
    async loginUser(server, credentials) {
        const agent = request.agent(server);
        
        const response = await agent
            .post('/api/auth/connexion')
            .send({
                email: credentials.email,
                motDePasse: credentials.motDePasse
            });

        if (response.status !== 200) {
            throw new Error(`Connexion échouée: ${response.status} - ${JSON.stringify(response.body)}`);
        }

        this.loggedInAgents.set(credentials.email, agent);
        return agent;
    }

    /**
     * Crée et connecte un utilisateur de test complet
     * @param {Object} server - Serveur de test
     * @param {Object} overrides - Données à surcharger
     * @returns {Promise<Object>} - { user, agent, response }
     */
    async createAndLoginUser(server, overrides = {}) {
        const userData = this.createTestUserData(overrides);
        
        // Inscription
        const registerResponse = await this.registerUser(server, userData);
        
        // Connexion
        const agent = await this.loginUser(server, {
            email: userData.email,
            motDePasse: userData.motDePasse
        });

        return {
            user: userData,
            agent,
            registerResponse
        };
    }

    /**
     * Crée et connecte un utilisateur Admin
     * @param {Object} server - Serveur de test
     * @param {Object} overrides - Données à surcharger
     */
    async createAndLoginAdmin(server, overrides = {}) {
        const adminData = this.createAdminUserData(overrides);
        return await this.createAndLoginUser(server, adminData);
    }

    /**
     * Élève un utilisateur connecté au rôle Premium
     * @param {Object} agent - Agent authentifié
     * @param {string} code - Code d'accès Premium (défaut: 123456)
     */
    async elevateUserToPremium(agent, code = '123456') {
        const response = await agent
            .post('/api/auth/passer-premium')
            .send({ code });

        if (response.status !== 200) {
            throw new Error(`Élévation Premium échouée: ${response.status} - ${JSON.stringify(response.body)}`);
        }

        return response;
    }

    /**
     * Élève un utilisateur connecté au rôle Admin
     * @param {Object} agent - Agent authentifié
     * @param {string} code - Code d'accès Admin (défaut: 789012)
     */
    async elevateUserToAdmin(agent, code = '789012') {
        const response = await agent
            .post('/api/auth/passer-premium')
            .send({ code });

        if (response.status !== 200) {
            throw new Error(`Élévation Admin échouée: ${response.status} - ${JSON.stringify(response.body)}`);
        }

        return response;
    }

    /**
     * Déconnecte un utilisateur
     * @param {Object} agent - Agent authentifié
     */
    async logoutUser(agent) {
        try {
            await agent.post('/api/auth/deconnexion');
        } catch (error) {
            console.warn('Erreur lors de la déconnexion:', error.message);
        }
    }

    /**
     * Vérifie qu'un agent est bien authentifié
     * @param {Object} agent - Agent à vérifier
     * @returns {Promise<boolean>}
     */
    async isAuthenticated(agent) {
        try {
            const response = await agent.get('/api/auth/statut');
            return response.status === 200 && response.body.succes === true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Obtient les informations d'un utilisateur connecté
     * @param {Object} agent - Agent authentifié
     */
    async getUserProfile(agent) {
        const response = await agent.get('/api/auth/profil');
        
        if (response.status !== 200) {
            throw new Error(`Impossible de récupérer le profil: ${response.status}`);
        }

        return response.body.donnees;
    }

    /**
     * Nettoie tous les utilisateurs de test créés
     */
    async cleanup() {
        // Déconnecter tous les agents
        for (const agent of this.loggedInAgents.values()) {
            await this.logoutUser(agent);
        }
        
        this.loggedInAgents.clear();
        this.testUsers.length = 0;
    }

    /**
     * Obtient la liste des utilisateurs de test créés
     * @returns {Array<Object>}
     */
    getTestUsers() {
        return [...this.testUsers];
    }

    /**
     * Crée des utilisateurs de test multiples avec des rôles différents
     * @param {Object} server - Serveur de test
     * @returns {Promise<Object>} - { user, admin, premium }
     */
    async createMultipleTestUsers(server) {
        const [userResult, adminResult, premiumResult] = await Promise.all([
            this.createAndLoginUser(server),
            this.createAndLoginAdmin(server),
            this.createAndLoginUser(server, { type_compte: 'PREMIUM' })
        ]);

        return {
            user: userResult,
            admin: adminResult, 
            premium: premiumResult
        };
    }
}

module.exports = AuthTestHelper;