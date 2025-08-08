const BaseModel = require('./BaseModel');
const Joi = require('joi');

/**
 * Modèle DocumentSystemeJeu - Maintenance granulaire par type de document et système JDR
 * 
 * Cette table gère la maintenance granulaire TYPE par TYPE pour chaque système JDR.
 * Elle permet de désactiver/activer des types spécifiques sans affecter tout le système.
 * 
 * Fonctionnalités:
 * - Maintenance granulaire TYPE par TYPE (ex: désactiver uniquement TOWN pour Monsterhearts)
 * - Ordre d'affichage personnalisé par système
 * - Configuration JSONB flexible (champs requis, templates, validations par combinaison)
 * - Double validation : Système actif (systemes_jeu) ET type actif (document_systeme_jeu)
 */
class DocumentSystemeJeu extends BaseModel {
  constructor() {
    super('document_systeme_jeu', null); // Clé primaire composite
    
    this.fillable = [
      'document_type',
      'systeme_jeu',
      'actif',
      'ordre_affichage',
      'configuration'
    ];
    
    this.hidden = [];
    
    this.casts = {
      actif: 'boolean',
      ordre_affichage: 'integer',
      configuration: 'json',
      date_ajout: 'date',
      date_modification: 'date'
    };
    
    this.timestamps = true;
    
    // Modification du nom des champs de timestamp pour cette table
    this.timestampFields = {
      created: 'date_ajout',
      updated: 'date_modification'
    };
  }

  /**
   * Types de documents disponibles
   */
  static get TYPES_DOCUMENTS() {
    return [
      'CHARACTER',
      'TOWN',
      'GROUP',
      'ORGANIZATION', 
      'DANGER',
      'GENERIQUE'
    ];
  }

  /**
   * Override des méthodes CRUD pour gérer la clé composite
   */
  async findByCompositeKey(documentType, systemeJeu) {
    const { sql, params } = this.convertPlaceholders(
      `SELECT * FROM ${this.tableName} WHERE document_type = ? AND systeme_jeu = ?`,
      [documentType, systemeJeu]
    );
    const db = require('../database/db');
    const row = await db.get(sql, params);
    return row ? this.castAttributes(row) : null;
  }

  /**
   * Schema de validation Joi
   */
  getValidationSchema(operation = 'create') {
    const typesDocuments = DocumentSystemeJeu.TYPES_DOCUMENTS;
    const SystemeJeu = require('./SystemeJeu');
    const systemesValides = SystemeJeu.SYSTEMES_SUPPORTES;
    
    const baseSchema = {
      document_type: Joi.string().valid(...typesDocuments).required()
        .messages({
          'string.base': 'Le type de document doit être une chaîne de caractères',
          'any.only': `Le type de document doit être l'un des suivants: ${typesDocuments.join(', ')}`,
          'any.required': 'Le type de document est requis'
        }),
        
      systeme_jeu: Joi.string().valid(...systemesValides).required()
        .messages({
          'string.base': 'Le système JDR doit être une chaîne de caractères',
          'any.only': `Le système JDR doit être l'un des suivants: ${systemesValides.join(', ')}`,
          'any.required': 'Le système JDR est requis'
        }),
        
      actif: Joi.boolean().default(true)
        .messages({
          'boolean.base': 'Le statut actif doit être un booléen'
        }),
        
      ordre_affichage: Joi.number().integer().min(0).default(0)
        .messages({
          'number.base': 'L\'ordre d\'affichage doit être un nombre',
          'number.integer': 'L\'ordre d\'affichage doit être un entier',
          'number.min': 'L\'ordre d\'affichage ne peut pas être négatif'
        }),
        
      configuration: Joi.object({
        champs_requis: Joi.array().items(Joi.string()).default([]),
        template_pdf: Joi.string().optional(),
        validation_custom: Joi.array().items(Joi.string()).default([]),
        couleur_theme: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).optional(),
        description: Joi.string().max(500).optional(),
        exemple_donnees: Joi.object().optional()
      }).optional().default({})
        .messages({
          'object.base': 'La configuration doit être un objet JSON'
        })
    };

    return Joi.object(baseSchema);
  }

  /**
   * Validation métier spécifique
   */
  async businessValidation(data, operation = 'create') {
    // Vérifier que le système JDR existe
    if (data.systeme_jeu) {
      const SystemeJeu = require('./SystemeJeu');
      const systemeJeu = new SystemeJeu();
      const systeme = await systemeJeu.findById(data.systeme_jeu);
      
      if (!systeme) {
        throw new Error('Le système JDR spécifié n\'existe pas');
      }
    }

    return true;
  }

  /**
   * Override create pour gérer la clé composite
   */
  async create(data) {
    // Vérifier si la combinaison existe déjà
    const existing = await this.findByCompositeKey(data.document_type, data.systeme_jeu);
    if (existing) {
      throw new Error(`La configuration pour ${data.document_type}/${data.systeme_jeu} existe déjà`);
    }

    // Validation et nettoyage des données
    let cleanData = this.fillableData(data);
    
    // Hook beforeCreate
    cleanData = await this.beforeCreate(cleanData);
    
    if (this.timestamps) {
      cleanData[this.timestampFields.created] = new Date().toISOString();
      cleanData[this.timestampFields.updated] = new Date().toISOString();
    }

    // Validation métier
    await this.validate(cleanData, 'create');

    // Construction de la requête
    const fields = Object.keys(cleanData);
    const placeholders = fields.map(() => '?').join(', ');
    const values = Object.values(cleanData);

    const { sql, params } = this.convertPlaceholders(
      `INSERT INTO ${this.tableName} (${fields.join(', ')}) VALUES (${placeholders}) RETURNING document_type, systeme_jeu`,
      values
    );

    const db = require('../database/db');
    const result = await db.get(sql, params);
    
    if (this.logManager && this.logManager.logDatabaseOperation) {
      this.logManager.logDatabaseOperation('create', this.tableName, `${result.document_type}/${result.systeme_jeu}`, true);
    }
    
    // Retourne l'enregistrement créé
    const createdRecord = await this.findByCompositeKey(result.document_type, result.systeme_jeu);
    
    // Hook afterCreate
    const finalRecord = await this.afterCreate(createdRecord);
    
    return finalRecord;
  }

  /**
   * Override update pour gérer la clé composite
   */
  async updateByCompositeKey(documentType, systemeJeu, data) {
    let cleanData = this.fillableData(data);
    
    // Hook beforeUpdate
    cleanData = await this.beforeUpdate(cleanData);
    
    if (this.timestamps) {
      cleanData[this.timestampFields.updated] = new Date().toISOString();
    }

    // Validation métier
    await this.validate(cleanData, 'update');

    const fields = Object.keys(cleanData);
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const values = [...Object.values(cleanData), documentType, systemeJeu];

    const { sql, params } = this.convertPlaceholders(
      `UPDATE ${this.tableName} SET ${setClause} WHERE document_type = ? AND systeme_jeu = ?`,
      values
    );

    const db = require('../database/db');
    const result = await db.run(sql, params);
    
    if (result.rowCount === 0) {
      throw new Error(`Aucun enregistrement trouvé pour ${documentType}/${systemeJeu}`);
    }

    if (this.logManager && this.logManager.logDatabaseOperation) {
      this.logManager.logDatabaseOperation('update', this.tableName, `${documentType}/${systemeJeu}`, true);
    }
    
    // Récupère l'enregistrement mis à jour
    const updatedRecord = await this.findByCompositeKey(documentType, systemeJeu);
    
    // Hook afterUpdate
    const finalRecord = await this.afterUpdate(updatedRecord);
    
    return finalRecord;
  }

  /**
   * Récupérer les types actifs et disponibles pour un système
   * 
   * @param {string} systeme - ID du système JDR
   * @returns {Array} Types de documents actifs
   */
  async getTypesActifs(systeme) {
    return await this.findAll(
      'systeme_jeu = $1 AND actif = $2',
      [systeme, true],
      'ordre_affichage ASC, document_type ASC'
    );
  }

  /**
   * Récupérer tous les types configurés pour un système (actifs + inactifs)
   * 
   * @param {string} systeme - ID du système JDR
   * @returns {Array} Tous les types configurés
   */
  async getTypesDisponibles(systeme) {
    return await this.findAll(
      'systeme_jeu = $1',
      [systeme],
      'ordre_affichage ASC, document_type ASC'
    );
  }

  /**
   * Activer ou désactiver un type spécifique pour un système
   * 
   * @param {string} type - Type de document
   * @param {string} systeme - ID du système JDR
   * @param {boolean} actif - Nouvel état
   * @returns {Object} Configuration mise à jour
   */
  async activerType(type, systeme, actif) {
    const existing = await this.findByCompositeKey(type, systeme);
    
    if (!existing) {
      // Créer la configuration si elle n'existe pas
      return await this.create({
        document_type: type,
        systeme_jeu: systeme,
        actif: actif,
        configuration: this.getConfigurationParDefaut(type)
      });
    } else {
      // Mettre à jour l'existant
      return await this.updateByCompositeKey(type, systeme, { actif });
    }
  }

  /**
   * Récupérer la configuration JSONB d'une combinaison type/système
   * 
   * @param {string} type - Type de document
   * @param {string} systeme - ID du système JDR
   * @returns {Object|null} Configuration JSONB
   */
  async getConfiguration(type, systeme) {
    const record = await this.findByCompositeKey(type, systeme);
    return record ? record.configuration : null;
  }

  /**
   * Vérifier la disponibilité d'un type pour un système (double validation)
   * 
   * @param {string} type - Type de document
   * @param {string} systeme - ID du système JDR
   * @returns {Object} Résultat de vérification avec détails
   */
  async verifierDisponibilite(type, systeme) {
    // 1. Vérifier que le système JDR est actif
    const SystemeJeu = require('./SystemeJeu');
    const systemeJeu = new SystemeJeu();
    const systemeInfo = await systemeJeu.findById(systeme);
    
    if (!systemeInfo) {
      return {
        disponible: false,
        raison: 'SYSTEME_INEXISTANT',
        message: 'Le système JDR spécifié n\'existe pas'
      };
    }
    
    if (systemeInfo.statut !== SystemeJeu.STATUTS.ACTIF) {
      return {
        disponible: false,
        raison: 'SYSTEME_INDISPONIBLE',
        message: `Le système ${systemeInfo.nom_complet} est actuellement ${systemeInfo.statut.toLowerCase()}`,
        message_maintenance: systemeInfo.message_maintenance
      };
    }

    // 2. Vérifier que le type est activé pour ce système
    const typeConfig = await this.findByCompositeKey(type, systeme);
    
    if (!typeConfig) {
      return {
        disponible: false,
        raison: 'TYPE_NON_CONFIGURE',
        message: `Le type ${type} n'est pas configuré pour le système ${systemeInfo.nom_complet}`
      };
    }
    
    if (!typeConfig.actif) {
      return {
        disponible: false,
        raison: 'TYPE_DESACTIVE',
        message: `Le type ${type} est temporairement désactivé pour le système ${systemeInfo.nom_complet}`
      };
    }

    // 3. Tout est OK
    return {
      disponible: true,
      raison: 'DISPONIBLE',
      message: 'Le type de document est disponible pour ce système',
      systeme_info: systemeInfo,
      type_config: typeConfig
    };
  }

  /**
   * Mettre à jour l'ordre d'affichage des types pour un système
   * 
   * @param {string} systeme - ID du système JDR
   * @param {Array} ordres - Tableau d'objets {type, ordre}
   * @returns {Array} Configurations mises à jour
   */
  async mettreAJourOrdre(systeme, ordres) {
    const results = [];
    
    for (const item of ordres) {
      if (!item.type || typeof item.ordre !== 'number') {
        throw new Error('Format invalide pour les ordres. Attendu: [{type: string, ordre: number}]');
      }
      
      const updated = await this.updateByCompositeKey(item.type, systeme, {
        ordre_affichage: item.ordre
      });
      results.push(updated);
    }
    
    return results;
  }

  /**
   * Configuration par défaut pour un type de document
   * 
   * @param {string} type - Type de document
   * @returns {Object} Configuration par défaut
   */
  getConfigurationParDefaut(type) {
    const configs = {
      CHARACTER: {
        champs_requis: ['nom'],
        template_pdf: 'default_character',
        validation_custom: [],
        description: 'Fiche de personnage complète'
      },
      TOWN: {
        champs_requis: ['nom', 'description'],
        template_pdf: 'default_town',
        validation_custom: [],
        description: 'Cadre de ville ou lieu important'
      },
      GROUP: {
        champs_requis: ['nom', 'type'],
        template_pdf: 'default_group',
        validation_custom: [],
        description: 'Groupe, classe, organisation'
      },
      ORGANIZATION: {
        champs_requis: ['nom', 'description'],
        template_pdf: 'default_organization',
        validation_custom: [],
        description: 'Liste de PNJ structurée'
      },
      DANGER: {
        champs_requis: ['nom', 'type_danger'],
        template_pdf: 'default_danger',
        validation_custom: [],
        description: 'Front, danger ou menace'
      },
      GENERIQUE: {
        champs_requis: ['titre'],
        template_pdf: 'default_generic',
        validation_custom: [],
        description: 'Document libre ou journal'
      }
    };

    return configs[type] || configs.GENERIQUE;
  }

  /**
   * Initialiser les configurations par défaut pour un système
   * 
   * @param {string} systeme - ID du système JDR
   * @param {Array} typesActifs - Types à activer (optionnel, tous par défaut)
   * @returns {Array} Configurations créées
   */
  async initialiserConfigurationsDefaut(systeme, typesActifs = null) {
    const types = typesActifs || DocumentSystemeJeu.TYPES_DOCUMENTS;
    const results = [];
    
    for (let i = 0; i < types.length; i++) {
      const type = types[i];
      
      try {
        const existing = await this.findByCompositeKey(type, systeme);
        if (!existing) {
          const config = await this.create({
            document_type: type,
            systeme_jeu: systeme,
            actif: true,
            ordre_affichage: i + 1,
            configuration: this.getConfigurationParDefaut(type)
          });
          results.push(config);
        } else {
          results.push(existing);
        }
      } catch (error) {
        throw new Error(`Erreur lors de l'initialisation de ${type}/${systeme}: ${error.message}`);
      }
    }
    
    return results;
  }

  /**
   * Vue d'ensemble de toutes les configurations par système
   * 
   * @returns {Object} Configurations groupées par système
   */
  async getVueEnsemble() {
    const db = require('../database/db');
    
    const sql = `
      SELECT 
        dsj.*,
        sj.nom_complet as systeme_nom,
        sj.statut as systeme_statut,
        sj.couleur_theme
      FROM document_systeme_jeu dsj
      LEFT JOIN systemes_jeu sj ON dsj.systeme_jeu = sj.id
      ORDER BY sj.ordre_affichage ASC, dsj.ordre_affichage ASC
    `;
    
    const rows = await db.all(sql);
    const configurations = rows.map(row => this.castAttributes(row));
    
    // Grouper par système
    const grouped = {};
    configurations.forEach(config => {
      if (!grouped[config.systeme_jeu]) {
        grouped[config.systeme_jeu] = {
          systeme: {
            id: config.systeme_jeu,
            nom: config.systeme_nom,
            statut: config.systeme_statut,
            couleur: config.couleur_theme
          },
          types: []
        };
      }
      
      grouped[config.systeme_jeu].types.push({
        type: config.document_type,
        actif: config.actif,
        ordre: config.ordre_affichage,
        configuration: config.configuration
      });
    });
    
    return grouped;
  }

  /**
   * Override des hooks pour gérer les timestamps personnalisés
   */
  async beforeCreate(data) {
    if (this.timestamps) {
      data[this.timestampFields.created] = new Date().toISOString();
      data[this.timestampFields.updated] = new Date().toISOString();
    }
    return data;
  }

  async beforeUpdate(data) {
    if (this.timestamps) {
      data[this.timestampFields.updated] = new Date().toISOString();
    }
    return data;
  }
}

module.exports = DocumentSystemeJeu;