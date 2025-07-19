const { Pool } = require('pg');
const config = require('../config');
const logManager = require('../utils/logManager');

class DatabaseManager {
  constructor() {
    this.pool = null;
    this.isConnected = false;
  }

  /**
   * Initialise la connexion PostgreSQL
   */
  async init() {
    try {
      // Configuration de la pool de connexions PostgreSQL
      this.pool = new Pool({
        host: config.database.host,
        port: config.database.port,
        database: config.database.database,
        user: config.database.user,
        password: config.database.password,
        ssl: config.database.ssl || false,
        max: 20, // Maximum 20 connexions dans la pool
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });

      // Test de connexion
      const client = await this.pool.connect();
      await client.query('SELECT NOW()');
      client.release();

      this.isConnected = true;
      logManager.info('Base de données PostgreSQL initialisée', {
        host: config.database.host,
        port: config.database.port,
        database: config.database.database
      });
      
      return true;
      
    } catch (error) {
      logManager.error('Erreur initialisation base de données PostgreSQL', { 
        error: error.message,
        host: config.database.host,
        port: config.database.port,
        database: config.database.database
      });
      throw error;
    }
  }

  /**
   * Exécute une requête SELECT unique
   */
  async get(sql, params = []) {
    if (!this.isConnected) {
      await this.init();
    }

    try {
      const result = await this.pool.query(sql, params);
      return result.rows[0] || null;
    } catch (error) {
      logManager.error('Erreur requête GET', { sql, params, error: error.message });
      throw error;
    }
  }

  /**
   * Exécute une requête SELECT multiple
   */
  async all(sql, params = []) {
    if (!this.isConnected) {
      await this.init();
    }

    try {
      const result = await this.pool.query(sql, params);
      return result.rows;
    } catch (error) {
      logManager.error('Erreur requête ALL', { sql, params, error: error.message });
      throw error;
    }
  }

  /**
   * Exécute une requête INSERT/UPDATE/DELETE
   */
  async run(sql, params = []) {
    if (!this.isConnected) {
      await this.init();
    }

    try {
      const result = await this.pool.query(sql, params);
      return {
        lastID: result.rows[0]?.id || null,
        changes: result.rowCount,
        rows: result.rows
      };
    } catch (error) {
      logManager.error('Erreur requête RUN', { sql, params, error: error.message });
      throw error;
    }
  }

  /**
   * Exécute une transaction avec callback
   */
  async transaction(callback) {
    if (!this.isConnected) {
      await this.init();
    }

    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Crée un objet de transaction avec les méthodes de base
      const transaction = {
        get: async (sql, params = []) => {
          const result = await client.query(sql, params);
          return result.rows[0] || null;
        },
        all: async (sql, params = []) => {
          const result = await client.query(sql, params);
          return result.rows;
        },
        run: async (sql, params = []) => {
          const result = await client.query(sql, params);
          return {
            lastID: result.rows[0]?.id || null,
            changes: result.rowCount,
            rows: result.rows
          };
        }
      };

      const result = await callback(transaction);
      await client.query('COMMIT');
      logManager.info('Transaction committée');
      return result;
      
    } catch (error) {
      await client.query('ROLLBACK');
      logManager.error('Erreur transaction', { error: error.message });
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Compte le nombre d'enregistrements
   */
  async count(table, where = '', params = []) {
    const sql = `SELECT COUNT(*) as count FROM ${table} ${where ? 'WHERE ' + where : ''}`;
    const result = await this.get(sql, params);
    return result.count;
  }

  /**
   * Vérifie si un enregistrement existe
   */
  async exists(table, where, params = []) {
    const count = await this.count(table, where, params);
    return count > 0;
  }

  /**
   * Récupère le dernier enregistrement inséré
   */
  async getLastInserted(table, orderColumn = 'id') {
    const sql = `SELECT * FROM ${table} ORDER BY ${orderColumn} DESC LIMIT 1`;
    return await this.get(sql);
  }

  /**
   * Pagination simple
   */
  async paginate(table, page = 1, limit = 10, where = '', params = [], orderBy = 'id DESC') {
    const offset = (page - 1) * limit;
    
    // Compte total
    const total = await this.count(table, where, params);
    
    // Données paginées
    const sql = `
      SELECT * FROM ${table} 
      ${where ? 'WHERE ' + where : ''} 
      ORDER BY ${orderBy} 
      LIMIT ? OFFSET ?
    `;
    const rows = await this.all(sql, [...params, limit, offset]);

    return {
      data: rows,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    };
  }

  /**
   * Optimisation de la base de données PostgreSQL
   */
  async optimize() {
    try {
      await this.run('VACUUM ANALYZE');
      logManager.info('Optimisation base de données PostgreSQL terminée');
    } catch (error) {
      logManager.error('Erreur optimisation base de données', { error: error.message });
      throw error;
    }
  }

  /**
   * Statistiques de la base de données PostgreSQL
   */
  async getStats() {
    try {
      const tables = await this.all(`
        SELECT table_name as name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);
      
      const stats = {};
      
      for (const table of tables) {
        const count = await this.count(table.name);
        stats[table.name] = count;
      }

      // Taille de la base de données
      const sizeResult = await this.get(`
        SELECT pg_size_pretty(pg_database_size(current_database())) as size
      `);
      
      return {
        tables: stats,
        totalTables: tables.length,
        databaseSize: sizeResult?.size || 'N/A'
      };
    } catch (error) {
      logManager.error('Erreur récupération statistiques', { error: error.message });
      throw error;
    }
  }

  /**
   * Vérifie si la base de données est accessible
   */
  async isHealthy() {
    try {
      if (!this.isConnected) {
        return false;
      }
      
      const result = await this.pool.query('SELECT 1 as healthy');
      return result.rows[0]?.healthy === 1;
    } catch (error) {
      logManager.error('Erreur vérification santé base de données', { error: error.message });
      return false;
    }
  }

  /**
   * Retourne les statistiques de la pool de connexions
   */
  getPoolStats() {
    if (!this.pool) {
      return null;
    }

    return {
      total: this.pool.totalCount,
      idle: this.pool.idleCount,
      waiting: this.pool.waitingCount
    };
  }

  /**
   * Ferme toutes les connexions PostgreSQL
   */
  async close() {
    if (this.pool) {
      try {
        await this.pool.end();
        this.isConnected = false;
        logManager.info('Connexions PostgreSQL fermées');
      } catch (error) {
        logManager.error('Erreur fermeture connexions PostgreSQL', { error: error.message });
      }
    }
  }

  /**
   * Getter pour l'instance de pool PostgreSQL (si besoin)
   */
  get instance() {
    return this.pool;
  }

  /**
   * Vérifie si la connexion est active
   */
  get connected() {
    return this.isConnected;
  }
}

// Export singleton
module.exports = new DatabaseManager();