/**
 * Helper pour la gestion de base de données dans les tests
 * 
 * Fournit des utilitaires pour setup/teardown propre selon testing.md
 * Compatible Windows avec gestion des transactions PostgreSQL.
 */

const db = require('../../src/database/db');
const logger = require('../../src/utils/logManager');

class TestDatabaseHelper {
  /**
   * Configuration propre pour chaque test avec transaction
   * @returns {Promise<void>}
   */
  static async setupTestDatabase() {
    try {
      // Démarrer une transaction pour isolation
      await db.run('BEGIN TRANSACTION');
      logger.info('Test database transaction started');
    } catch (error) {
      logger.error('Failed to setup test database:', error);
      throw error;
    }
  }

  /**
   * Nettoyage après test avec rollback
   * @returns {Promise<void>}
   */
  static async teardownTestDatabase() {
    try {
      // Annuler toutes les modifications
      await db.run('ROLLBACK');
      logger.info('Test database transaction rolled back');
    } catch (error) {
      logger.error('Failed to teardown test database:', error);
      // Ne pas lancer d'erreur pour éviter masquer les vrais échecs
    }
  }

  /**
   * Nettoyage complet de la base de test
   * Supprime les données créées pendant les tests
   * @returns {Promise<void>}
   */
  static async cleanTestData() {
    const tables = [
      'document_votes',
      'document_moderation_historique',
      'rgpd_consentements',
      'demandes_changement_email',
      'pdfs',
      'documents',
      'personnages'
    ];

    try {
      // Nettoyer dans l'ordre inverse des dépendances
      for (const table of tables) {
        // Supprimer les données de test (créées récemment ou avec email test)
        await db.run(`
          DELETE FROM ${table} 
          WHERE created_at > NOW() - INTERVAL '2 hours' 
             OR (${table}.email LIKE '%test%' AND ${table}.email IS NOT NULL)
        `);
        logger.debug(`Cleaned test data from ${table}`);
      }
      
      // Nettoyage spécial utilisateurs de test
      await db.run(`
        DELETE FROM utilisateurs 
        WHERE email LIKE '%test%' 
           OR email LIKE '%example.com'
           OR created_at > NOW() - INTERVAL '2 hours'
      `);
      
      logger.info('Test data cleanup completed');
    } catch (error) {
      logger.error('Error during test data cleanup:', error);
      // Ne pas lancer d'erreur - le nettoyage ne doit pas faire échouer les tests
    }
  }

  /**
   * Vérifier l'état des contraintes FK
   * @returns {Promise<Object>} Rapport des contraintes
   */
  static async checkConstraints() {
    try {
      // Vérifier les contraintes de clés étrangères
      const constraints = await db.all(`
        SELECT 
          tc.table_name,
          tc.constraint_name,
          tc.constraint_type
        FROM information_schema.table_constraints tc
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_schema = 'public'
        ORDER BY tc.table_name
      `);

      return {
        success: true,
        constraints: constraints.length,
        details: constraints
      };
    } catch (error) {
      logger.error('Error checking constraints:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Compter les enregistrements dans une table
   * @param {string} tableName - Nom de la table
   * @param {Object} [conditions] - Conditions WHERE optionnelles
   * @returns {Promise<number>} Nombre d'enregistrements
   */
  static async countRecords(tableName, conditions = {}) {
    try {
      let sql = `SELECT COUNT(*) as count FROM ${tableName}`;
      const params = [];

      if (Object.keys(conditions).length > 0) {
        const whereClause = Object.keys(conditions)
          .map((key, index) => `${key} = $${index + 1}`)
          .join(' AND ');
        sql += ` WHERE ${whereClause}`;
        params.push(...Object.values(conditions));
      }

      const result = await db.get(sql, params);
      return parseInt(result.count, 10);
    } catch (error) {
      logger.error(`Error counting records in ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * Vérifier si une table existe
   * @param {string} tableName - Nom de la table
   * @returns {Promise<boolean>} True si la table existe
   */
  static async tableExists(tableName) {
    try {
      const result = await db.get(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
            AND table_name = $1
        )
      `, [tableName]);

      return result.exists;
    } catch (error) {
      logger.error(`Error checking if table ${tableName} exists:`, error);
      return false;
    }
  }

  /**
   * Créer un snapshot des données pour comparaison
   * @param {Array<string>} tables - Tables à inclure dans le snapshot
   * @returns {Promise<Object>} Snapshot des données
   */
  static async createDataSnapshot(tables) {
    const snapshot = {};

    try {
      for (const table of tables) {
        const count = await this.countRecords(table);
        snapshot[table] = count;
      }

      snapshot.timestamp = new Date().toISOString();
      return snapshot;
    } catch (error) {
      logger.error('Error creating data snapshot:', error);
      throw error;
    }
  }

  /**
   * Comparer deux snapshots de données
   * @param {Object} before - Snapshot avant
   * @param {Object} after - Snapshot après
   * @returns {Object} Différences trouvées
   */
  static compareSnapshots(before, after) {
    const differences = {};

    for (const table in before) {
      if (table === 'timestamp') continue;
      
      const beforeCount = before[table];
      const afterCount = after[table];
      
      if (beforeCount !== afterCount) {
        differences[table] = {
          before: beforeCount,
          after: afterCount,
          delta: afterCount - beforeCount
        };
      }
    }

    return {
      hasDifferences: Object.keys(differences).length > 0,
      differences
    };
  }

  /**
   * Exécuter une fonction avec isolation de transaction
   * @param {Function} testFunction - Fonction à exécuter
   * @returns {Promise<any>} Résultat de la fonction
   */
  static async withTransactionIsolation(testFunction) {
    await this.setupTestDatabase();
    
    try {
      return await testFunction();
    } finally {
      await this.teardownTestDatabase();
    }
  }
}

module.exports = TestDatabaseHelper;