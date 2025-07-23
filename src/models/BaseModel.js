const db = require('../database/db');
const logManager = require('../utils/logManager');

/**
 * Classe de base pour tous les modèles
 * Implémente les principes SOLID et DRY
 */
class BaseModel {
  constructor(tableName, primaryKey = 'id') {
    this.tableName = tableName;
    this.primaryKey = primaryKey;
    this.fillable = []; // Champs autorisés en mass assignment
    this.guarded = []; // Champs protégés
    this.hidden = []; // Champs cachés lors de la sérialisation
    this.casts = {}; // Conversion automatique des types
    this.timestamps = true; // Gestion automatique created_at/updated_at
  }

  /**
   * Convertit les placeholders SQLite (?) vers PostgreSQL ($1, $2, etc.)
   */
  convertPlaceholders(sql, params) {
    let index = 1;
    const convertedSql = sql.replace(/\?/g, () => `$${index++}`);
    return { sql: convertedSql, params };
  }

  /**
   * Trouve un enregistrement par ID
   */
  async findById(id) {
    try {
      const { sql, params } = this.convertPlaceholders(
        `SELECT * FROM ${this.tableName} WHERE ${this.primaryKey} = ?`, 
        [id]
      );
      const row = await db.get(sql, params);
      return row ? this.castAttributes(row) : null;
    } catch (error) {
      if (logManager.logDatabaseOperation) {
        logManager.logDatabaseOperation('read', this.tableName, id, false, error);
      }
      throw error;
    }
  }

  /**
   * Trouve un enregistrement selon des critères
   */
  async findOne(where, params = []) {
    try {
      const { sql, params: convertedParams } = this.convertPlaceholders(
        `SELECT * FROM ${this.tableName} WHERE ${where} LIMIT 1`, 
        params
      );
      const row = await db.get(sql, convertedParams);
      return row ? this.castAttributes(row) : null;
    } catch (error) {
      if (logManager.logDatabaseOperation) {
        logManager.logDatabaseOperation('read', this.tableName, null, false, error);
      }
      throw error;
    }
  }

  /**
   * Trouve plusieurs enregistrements
   */
  async findAll(where = '', params = [], orderBy = '', limit = null) {
    try {
      let sql = `SELECT * FROM ${this.tableName}`;
      
      if (where) {
        sql += ` WHERE ${where}`;
      }
      
      if (orderBy) {
        sql += ` ORDER BY ${orderBy}`;
      }
      
      if (limit) {
        sql += ` LIMIT ${limit}`;
      }

      const { sql: convertedSql, params: convertedParams } = this.convertPlaceholders(sql, params);
      const rows = await db.all(convertedSql, convertedParams);
      return rows.map(row => this.castAttributes(row));
    } catch (error) {
      if (logManager.logDatabaseOperation) {
        logManager.logDatabaseOperation('read', this.tableName, null, false, error);
      }
      throw error;
    }
  }

  /**
   * Crée un nouvel enregistrement (alias français)
   */
  async creer(data) {
    return await this.create(data);
  }

  /**
   * Crée un nouvel enregistrement
   */
  async create(data) {
    try {
      // Validation et nettoyage des données
      let cleanData = this.fillableData(data);
      
      // Hook beforeCreate
      cleanData = await this.beforeCreate(cleanData);
      
      if (this.timestamps) {
        cleanData.date_creation = new Date().toISOString();
        cleanData.date_modification = new Date().toISOString();
      }

      // Validation métier
      await this.validate(cleanData, 'create');

      // Construction de la requête
      const fields = Object.keys(cleanData);
      const placeholders = fields.map(() => '?').join(', ');
      const values = Object.values(cleanData);

      const { sql, params } = this.convertPlaceholders(
        `INSERT INTO ${this.tableName} (${fields.join(', ')}) VALUES (${placeholders}) RETURNING ${this.primaryKey}`,
        values
      );

      const result = await db.get(sql, params);
      const insertedId = result[this.primaryKey];
      
      if (logManager.logDatabaseOperation) {
        logManager.logDatabaseOperation('create', this.tableName, insertedId, true);
      }
      
      // Retourne l'enregistrement créé
      return await this.findById(insertedId);
    } catch (error) {
      if (logManager.logDatabaseOperation) {
        logManager.logDatabaseOperation('create', this.tableName, null, false, error);
      }
      throw error;
    }
  }

  /**
   * Met à jour un enregistrement
   */
  async update(id, data) {
    try {
      let cleanData = this.fillableData(data);
      
      // Hook beforeUpdate
      cleanData = await this.beforeUpdate(cleanData);
      
      if (this.timestamps) {
        cleanData.date_modification = new Date().toISOString();
      }

      // Validation métier
      await this.validate(cleanData, 'update');

      const fields = Object.keys(cleanData);
      const setClause = fields.map(field => `${field} = ?`).join(', ');
      const values = [...Object.values(cleanData), id];

      const { sql, params } = this.convertPlaceholders(
        `UPDATE ${this.tableName} SET ${setClause} WHERE ${this.primaryKey} = ?`,
        values
      );

      const result = await db.run(sql, params);
      
      if (result.rowCount === 0) {
        throw new Error(`Aucun enregistrement trouvé avec l'ID ${id}`);
      }

      if (logManager.logDatabaseOperation) {
        logManager.logDatabaseOperation('update', this.tableName, id, true);
      }
      
      return await this.findById(id);
    } catch (error) {
      if (logManager.logDatabaseOperation) {
        logManager.logDatabaseOperation('update', this.tableName, id, false, error);
      }
      throw error;
    }
  }

  /**
   * Supprime un enregistrement
   */
  async delete(id) {
    try {
      const { sql, params } = this.convertPlaceholders(
        `DELETE FROM ${this.tableName} WHERE ${this.primaryKey} = ?`,
        [id]
      );
      const result = await db.run(sql, params);
      
      if (result.rowCount === 0) {
        throw new Error(`Aucun enregistrement trouvé avec l'ID ${id}`);
      }

      if (logManager.logDatabaseOperation) {
        logManager.logDatabaseOperation('delete', this.tableName, id, true);
      }
      return true;
    } catch (error) {
      if (logManager.logDatabaseOperation) {
        logManager.logDatabaseOperation('delete', this.tableName, id, false, error);
      }
      throw error;
    }
  }

  /**
   * Compte les enregistrements
   */
  async count(where = '', params = []) {
    try {
      const { sql, params: convertedParams } = this.convertPlaceholders(
        `SELECT COUNT(*) as count FROM ${this.tableName} ${where ? 'WHERE ' + where : ''}`,
        params
      );
      const result = await db.get(sql, convertedParams);
      return parseInt(result.count);
    } catch (error) {
      if (logManager.logDatabaseOperation) {
        logManager.logDatabaseOperation('read', this.tableName, null, false, error);
      }
      throw error;
    }
  }

  /**
   * Vérifie si un enregistrement existe
   */
  async exists(where, params = []) {
    const count = await this.count(where, params);
    return count > 0;
  }

  /**
   * Pagination
   */
  async paginate(page = 1, limit = 10, where = '', params = [], orderBy = 'id DESC') {
    try {
      const offset = (page - 1) * limit;
      
      // Compte total
      const total = await this.count(where, params);
      
      // Données paginées
      const { sql, params: convertedParams } = this.convertPlaceholders(
        `SELECT * FROM ${this.tableName} ${where ? 'WHERE ' + where : ''} ORDER BY ${orderBy} LIMIT ? OFFSET ?`,
        [...params, limit, offset]
      );
      const rows = await db.all(sql, convertedParams);

      return {
        data: rows.map(row => this.castAttributes(row)),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      };
    } catch (error) {
      if (logManager.logDatabaseOperation) {
        logManager.logDatabaseOperation('read', this.tableName, null, false, error);
      }
      throw error;
    }
  }

  /**
   * Filtre les données selon les champs fillable/guarded
   */
  fillableData(data) {
    const result = {};
    
    Object.entries(data).forEach(([key, value]) => {
      // Si fillable est défini, seuls ces champs sont autorisés
      if (this.fillable.length > 0 && !this.fillable.includes(key)) {
        return;
      }
      
      // Si le champ est dans guarded, on l'ignore
      if (this.guarded.includes(key)) {
        return;
      }
      
      result[key] = value;
    });
    
    return result;
  }

  /**
   * Applique les conversions de type automatiques
   */
  castAttributes(data) {
    if (!data) return data;
    
    const result = { ...data };
    
    Object.entries(this.casts).forEach(([field, type]) => {
      if (result[field] !== undefined && result[field] !== null) {
        switch (type) {
          case 'json':
            try {
              result[field] = JSON.parse(result[field]);
            } catch (e) {
              logManager.warn(`Erreur parsing JSON pour ${field}`, { value: result[field] });
            }
            break;
          case 'boolean':
            result[field] = Boolean(result[field]);
            break;
          case 'integer':
            result[field] = parseInt(result[field]);
            break;
          case 'float':
            result[field] = parseFloat(result[field]);
            break;
          case 'date':
            result[field] = new Date(result[field]);
            break;
        }
      }
    });
    
    return result;
  }

  /**
   * Sérialise les données pour l'API (cache les champs hidden)
   */
  serialize(data) {
    if (!data) return data;
    
    const result = { ...data };
    
    this.hidden.forEach(field => {
      delete result[field];
    });
    
    return result;
  }

  /**
   * Validation métier (à override dans les classes filles)
   */
  async validate(data, operation = 'create') {
    // Validation de base - à étendre dans les modèles spécifiques
    return true;
  }

  /**
   * Hooks appelés avant/après les opérations (à override)
   */
  async beforeCreate(data) { return data; }
  async afterCreate(record) { return record; }
  async beforeUpdate(data) { return data; }
  async afterUpdate(record) { return record; }
  async beforeDelete(id) { return true; }
  async afterDelete(id) { return true; }

  /**
   * Recherche textuelle simple
   */
  async search(query, fields = [], limit = 50) {
    if (!fields.length) {
      throw new Error('Champs de recherche requis');
    }
    
    const conditions = fields.map(field => `${field} LIKE ?`).join(' OR ');
    const params = fields.map(() => `%${query}%`);
    
    return await this.findAll(conditions, params, 'id DESC', limit);
  }

  /**
   * Batch operations
   */
  async bulkCreate(dataArray) {
    const results = [];
    
    for (const data of dataArray) {
      const record = await this.create(data);
      results.push(record);
    }
    
    return results;
  }

  /**
   * Upsert (update ou insert)
   */
  async upsert(data, uniqueField = 'id') {
    const existing = await this.findOne(`${uniqueField} = ?`, [data[uniqueField]]);
    
    if (existing) {
      return await this.update(existing[this.primaryKey], data);
    } else {
      return await this.create(data);
    }
  }

  /**
   * Soft delete (marque comme supprimé sans supprimer)
   */
  async softDelete(id) {
    return await this.update(id, { deleted_at: new Date().toISOString() });
  }

  /**
   * Restore un enregistrement soft deleted
   */
  async restore(id) {
    return await this.update(id, { deleted_at: null });
  }

  /**
   * Scope pour exclure les soft deleted
   */
  async findAllActive(where = '', params = [], orderBy = '') {
    const activeWhere = where ? `(${where}) AND deleted_at IS NULL` : 'deleted_at IS NULL';
    return await this.findAll(activeWhere, params, orderBy);
  }
}

module.exports = BaseModel;