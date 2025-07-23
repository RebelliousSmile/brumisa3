/**
 * Helper spécialisé pour les opérations de base de données dans les tests
 * Principe SOLID : Interface Segregation - Une seule responsabilité
 */

const db = require('../../src/database/db');
const MockDatabaseHelper = require('./MockDatabaseHelper');

class DatabaseTestHelper {
    constructor() {
        this.connections = new Set();
        this.mockHelper = null;
        this.usingMocks = false;
    }

    /**
     * Nettoie les données de test créées pendant un test
     * @param {string} email - Email de l'utilisateur de test à supprimer
     */
    async cleanupTestUser(email) {
        if (!email) return;
        
        // Si on utilise des mocks, déléguer au mock helper
        if (this.usingMocks && this.mockHelper) {
            return await this.mockHelper.cleanupTestUser(email);
        }
        
        try {
            // Supprimer l'utilisateur de test et toutes ses données liées (CASCADE)
            await db.query(
                'DELETE FROM utilisateurs WHERE email = $1',
                [email]
            );
        } catch (error) {
            console.warn('Erreur lors du nettoyage des données de test:', error.message);
        }
    }

    /**
     * Nettoie tous les utilisateurs de test créés
     * @param {Array<Object>} testUsers - Liste des utilisateurs de test
     */
    async cleanupTestUsers(testUsers) {
        if (!Array.isArray(testUsers)) return;
        
        for (const user of testUsers) {
            if (user && user.email) {
                await this.cleanupTestUser(user.email);
            }
        }
    }

    /**
     * Vérifie si la base de données est disponible
     * @returns {Promise<boolean>}
     */
    async isAvailable() {
        try {
            await db.query('SELECT 1');
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Ferme proprement toutes les connexions de base de données
     */
    async closeConnections() {
        try {
            // Fermer le pool de connexions de base de données (une seule fois)
            if (db && typeof db.close === 'function') {
                await db.close();
            }
        } catch (error) {
            // Ignorer l'erreur "Called end on pool more than once"
            if (!error.message.includes('Called end on pool more than once')) {
                console.warn('Erreur lors de la fermeture des connexions:', error.message);
            }
        }
    }

    /**
     * Initialise la base de données de test
     */
    async initialize() {
        try {
            // Vérifier que nous sommes en environnement de test
            if (process.env.NODE_ENV !== 'test') {
                throw new Error('DatabaseTestHelper ne peut être utilisé qu\'en environnement de test');
            }

            // Vérifier la disponibilité de la base
            const isAvailable = await this.isAvailable();
            if (!isAvailable) {
                console.warn('Base de données de test non disponible - Les tests utiliseront des mocks');
                // Initialiser le mock helper
                this.mockHelper = new MockDatabaseHelper();
                await this.mockHelper.initialize();
                this.mockHelper.seedTestData(); // Ajouter des données de test
                this.usingMocks = true;
                // Retourner success avec un flag indiquant l'utilisation de mocks
                return { success: true, usingMocks: true };
            }

            this.usingMocks = false;
            return { success: true, usingMocks: false };
        } catch (error) {
            console.warn('Erreur initialisation base de données de test:', error.message);
            console.warn('Les tests utiliseront des mocks à la place');
            // Initialiser le mock helper en cas d'erreur
            this.mockHelper = new MockDatabaseHelper();
            await this.mockHelper.initialize();
            this.mockHelper.seedTestData();
            this.usingMocks = true;
            // Retourner success avec un flag indiquant l'utilisation de mocks
            return { success: true, usingMocks: true };
        }
    }

    /**
     * Crée un utilisateur de test en base
     * @param {Object} userData - Données de l'utilisateur
     * @returns {Promise<Object>} - Utilisateur créé
     */
    async createTestUser(userData) {
        const defaultUser = {
            nom: 'Test User',
            email: `test_${Date.now()}@example.com`,
            motDePasse: 'motdepasse123',
            role: 'UTILISATEUR',
            type_compte: 'STANDARD',
            ...userData
        };

        try {
            // En réalité, ceci serait fait via le service d'authentification
            // Ici on simule la création directe en base
            const result = await db.query(
                'INSERT INTO utilisateurs (nom, email, mot_de_passe, role, type_compte) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                [defaultUser.nom, defaultUser.email, defaultUser.motDePasse, defaultUser.role, defaultUser.type_compte]
            );
            
            return result.rows[0];
        } catch (error) {
            console.error('Erreur création utilisateur de test:', error.message);
            throw error;
        }
    }

    /**
     * Supprime toutes les tables de test (pour nettoyage complet)
     */
    async truncateAllTables() {
        try {
            const tables = ['utilisateurs', 'personnages', 'pdfs', 'oracles', 'temoignages'];
            
            for (const table of tables) {
                await db.query(`TRUNCATE TABLE ${table} CASCADE`);
            }
        } catch (error) {
            console.warn('Erreur lors du truncate des tables:', error.message);
        }
    }
}

module.exports = DatabaseTestHelper;