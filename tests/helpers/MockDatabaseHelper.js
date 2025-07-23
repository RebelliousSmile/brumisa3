/**
 * Mock de base de données pour les tests d'intégration
 * Utilisé quand la vraie base de données n'est pas accessible
 * Principe SOLID : Liskov Substitution - Remplace DatabaseTestHelper
 */

class MockDatabaseHelper {
    constructor() {
        this.users = new Map();
        this.personnages = new Map();
        this.pdfs = new Map();
        this.oracles = new Map();
        this.idCounter = 1;
    }

    /**
     * Simule l'initialisation de la base de données
     */
    async initialize() {
        return { success: true, usingMocks: true };
    }

    /**
     * Simule la vérification de disponibilité
     */
    async isAvailable() {
        return true;
    }

    /**
     * Simule la création d'un utilisateur
     */
    async createUser(userData) {
        const user = {
            id: this.idCounter++,
            ...userData,
            date_creation: new Date(),
            date_modification: new Date()
        };
        this.users.set(user.id, user);
        return user;
    }

    /**
     * Simule la recherche d'un utilisateur par email
     */
    async findUserByEmail(email) {
        for (const user of this.users.values()) {
            if (user.email === email) {
                return user;
            }
        }
        return null;
    }

    /**
     * Simule la recherche d'un utilisateur par ID
     */
    async findUserById(id) {
        return this.users.get(id) || null;
    }

    /**
     * Simule la mise à jour d'un utilisateur
     */
    async updateUser(id, updates) {
        const user = this.users.get(id);
        if (!user) {
            throw new Error('Utilisateur non trouvé');
        }
        const updatedUser = {
            ...user,
            ...updates,
            date_modification: new Date()
        };
        this.users.set(id, updatedUser);
        return updatedUser;
    }

    /**
     * Simule la suppression d'un utilisateur
     */
    async deleteUser(email) {
        for (const [id, user] of this.users.entries()) {
            if (user.email === email) {
                this.users.delete(id);
                return true;
            }
        }
        return false;
    }

    /**
     * Simule le nettoyage des utilisateurs de test
     */
    async cleanupTestUser(email) {
        return this.deleteUser(email);
    }

    /**
     * Simule le nettoyage de plusieurs utilisateurs
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
     * Simule une requête SQL générique
     */
    async query(sql, params = []) {
        // Simulation basique pour les requêtes SELECT 1
        if (sql === 'SELECT 1') {
            return { rows: [{ '?column?': 1 }] };
        }
        
        // Simulation pour d'autres requêtes courantes
        if (sql.includes('DELETE FROM utilisateurs WHERE email =')) {
            const email = params[0];
            return { rowCount: this.deleteUser(email) ? 1 : 0 };
        }
        
        if (sql.includes('SELECT * FROM utilisateurs WHERE email =')) {
            const email = params[0];
            const user = await this.findUserByEmail(email);
            return { rows: user ? [user] : [] };
        }
        
        // Par défaut, retourner un résultat vide
        return { rows: [], rowCount: 0 };
    }

    /**
     * Simule la fermeture des connexions
     */
    async closeConnections() {
        // Réinitialiser les données mockées
        this.users.clear();
        this.personnages.clear();
        this.pdfs.clear();
        this.oracles.clear();
        this.idCounter = 1;
        return true;
    }

    /**
     * Méthode utilitaire pour ajouter des données de test
     */
    seedTestData() {
        // Ajouter un utilisateur admin de test
        this.createUser({
            nom: 'Admin Test',
            email: 'admin@test.com',
            mot_de_passe: 'hashed_password',
            role: 'ADMIN',
            actif: true
        });

        // Ajouter un utilisateur normal de test
        this.createUser({
            nom: 'User Test',
            email: 'user@test.com',
            mot_de_passe: 'hashed_password',
            role: 'UTILISATEUR',
            actif: true
        });

        // Ajouter quelques oracles de test
        const oracleId = this.idCounter++;
        this.oracles.set(oracleId, {
            id: oracleId,
            nom: 'Oracle Test',
            systeme: 'monsterhearts',
            type: 'personnage',
            elements: [
                { id: 1, valeur: 'Element 1', poids: 1 },
                { id: 2, valeur: 'Element 2', poids: 2 }
            ]
        });
    }
}

module.exports = MockDatabaseHelper;