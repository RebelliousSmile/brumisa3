const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const config = require('../config');
const logManager = require('../utils/logManager');

class Database {
  constructor() {
    this.db = null;
    this.isConnected = false;
    this.init();
  }

  /**
   * Initialise la connexion à la base de données
   */
  init() {
    try {
      // Création du dossier data s'il n'existe pas
      const dataDir = path.dirname(config.database.path);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
        logManager.info('Dossier data créé', { path: dataDir });
      }

      // Connexion à SQLite
      this.db = new sqlite3.Database(config.database.path, (err) => {
        if (err) {
          logManager.error('Erreur connexion base de données', { 
            error: err.message,
            path: config.database.path 
          });
          throw err;
        }

        this.isConnected = true;
        logManager.info('Connexion base de données réussie', { 
          path: config.database.path,
          mode: config.server.env
        });
      });

      // Configuration SQLite
      this.db.configure('busyTimeout', 30000);
      this.db.run('PRAGMA foreign_keys = ON');
      this.db.run('PRAGMA journal_mode = WAL');
      
      if (config.database.options.verbose && config.server.env === 'development') {
        this.db.on('trace', (sql) => {
          logManager.debug('SQL Query', { sql });
        });
      }

    } catch (error) {
      logManager.error('Erreur initialisation base de données', { error: error.message });
      throw error;
    }
  }

  /**
   * Exécute une requête SELECT
   */
  async get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          logManager.logDatabaseOperation('read', 'unknown', null, false, err);
          reject(err);
        } else {
          logManager.logDatabaseOperation('read', 'unknown', row?.id, true);
          resolve(row);
        }
      });
    });
  }

  /**
   * Exécute une requête SELECT multiple
   */
  async all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          logManager.logDatabaseOperation('read', 'unknown', null, false, err);
          reject(err);
        } else {
          logManager.logDatabaseOperation('read', 'unknown', null, true);
          resolve(rows);
        }
      });
    });
  }

  /**
   * Exécute une requête INSERT/UPDATE/DELETE
   */
  async run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          logManager.logDatabaseOperation('write', 'unknown', null, false, err);
          reject(err);
        } else {
          const operation = sql.trim().toLowerCase().startsWith('insert') ? 'create' :
                           sql.trim().toLowerCase().startsWith('update') ? 'update' : 'delete';
          logManager.logDatabaseOperation(operation, 'unknown', this.lastID, true);
          resolve({
            lastID: this.lastID,
            changes: this.changes
          });
        }
      });
    });
  }

  /**
   * Exécute plusieurs requêtes dans une transaction
   */
  async transaction(queries) {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        this.db.run('BEGIN TRANSACTION');
        
        const results = [];
        let hasError = false;

        queries.forEach((query, index) => {
          if (hasError) return;

          const { sql, params = [] } = query;
          
          this.db.run(sql, params, function(err) {
            if (err) {
              hasError = true;
              logManager.error('Erreur dans transaction', { 
                error: err.message, 
                queryIndex: index,
                sql: sql.substring(0, 100) + '...'
              });
              
              this.db.run('ROLLBACK', () => {
                reject(err);
              });
              return;
            }

            results.push({
              lastID: this.lastID,
              changes: this.changes
            });

            // Si c'est la dernière requête, commit
            if (index === queries.length - 1) {
              this.db.run('COMMIT', (commitErr) => {
                if (commitErr) {
                  logManager.error('Erreur commit transaction', { error: commitErr.message });
                  reject(commitErr);
                } else {
                  logManager.info('Transaction committée', { queries: queries.length });
                  resolve(results);
                }
              });
            }
          });
        });
      });
    });
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
   * Sauvegarde de la base de données
   */
  async backup(backupPath) {
    return new Promise((resolve, reject) => {
      const backupDb = new sqlite3.Database(backupPath);
      
      this.db.backup(backupDb, (err) => {
        backupDb.close();
        
        if (err) {
          logManager.error('Erreur sauvegarde base de données', { 
            error: err.message,
            backupPath 
          });
          reject(err);
        } else {
          logManager.info('Sauvegarde base de données réussie', { backupPath });
          resolve();
        }
      });
    });
  }

  /**
   * Optimisation de la base de données
   */
  async optimize() {
    try {
      await this.run('VACUUM');
      await this.run('ANALYZE');
      logManager.info('Optimisation base de données terminée');
    } catch (error) {
      logManager.error('Erreur optimisation base de données', { error: error.message });
      throw error;
    }
  }

  /**
   * Statistiques de la base de données
   */
  async getStats() {
    try {
      const tables = await this.all(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name NOT LIKE 'sqlite_%'
      `);
      
      const stats = {};
      
      for (const table of tables) {
        const count = await this.count(table.name);
        stats[table.name] = count;
      }

      const dbSize = fs.statSync(config.database.path).size;
      
      return {
        tables: stats,
        totalTables: tables.length,
        fileSize: dbSize,
        fileSizeFormatted: this.formatBytes(dbSize)
      };
    } catch (error) {
      logManager.error('Erreur récupération statistiques', { error: error.message });
      throw error;
    }
  }

  /**
   * Formate la taille en bytes
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Ferme la connexion à la base de données
   */
  close() {
    return new Promise((resolve) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) {
            logManager.error('Erreur fermeture base de données', { error: err.message });
          } else {
            logManager.info('Connexion base de données fermée');
          }
          this.isConnected = false;
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  /**
   * Getter pour l'instance SQLite native (si besoin)
   */
  get instance() {
    return this.db;
  }

  /**
   * Vérifie si la connexion est active
   */
  get connected() {
    return this.isConnected;
  }
}

// Export singleton
module.exports = new Database();