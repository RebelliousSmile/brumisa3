const BaseModel = require('./BaseModel');
const Joi = require('joi');

/**
 * Modèle DocumentModerationHistorique - Traçabilité complète des actions de modération
 * 
 * Fonctionnalités:
 * - Historique immuable des actions de modération
 * - Traçabilité complète des changements de statut
 * - Justifications obligatoires pour actions importantes
 * - Suivi des interventions par modérateur
 * - Métriques pour dashboard administratif
 */
class DocumentModerationHistorique extends BaseModel {
  constructor() {
    super('document_moderation_historique', 'id');
    
    this.fillable = [
      'document_id',
      'moderateur_id',
      'action',
      'ancien_statut',
      'nouveau_statut',
      'motif'
    ];
    
    this.hidden = [];
    
    this.casts = {
      document_id: 'integer',
      moderateur_id: 'integer',
      date_action: 'date'
    };
    
    this.timestamps = false; // Gestion manuelle de date_action
  }

  /**
   * Actions de modération disponibles
   */
  static get ACTIONS() {
    return {
      MISE_EN_AVANT: 'MISE_EN_AVANT',
      RETRAIT_MISE_EN_AVANT: 'RETRAIT_MISE_EN_AVANT',
      APPROBATION: 'APPROBATION',
      REJET: 'REJET',
      SIGNALEMENT: 'SIGNALEMENT',
      ARCHIVAGE: 'ARCHIVAGE',
      RESTAURATION: 'RESTAURATION',
      CHANGEMENT_VISIBILITE: 'CHANGEMENT_VISIBILITE'
    };
  }

  /**
   * Statuts de document disponibles
   */
  static get STATUTS() {
    return {
      BROUILLON: 'BROUILLON',
      ACTIF: 'ACTIF',
      ARCHIVE: 'ARCHIVE',
      SUPPRIME: 'SUPPRIME',
      EN_ATTENTE: 'EN_ATTENTE',
      APPROUVE: 'APPROUVE',
      REJETE: 'REJETE',
      SIGNALE: 'SIGNALE'
    };
  }

  /**
   * Schema de validation Joi
   */
  getValidationSchema(operation = 'create') {
    const actions = Object.values(DocumentModerationHistorique.ACTIONS);
    const statuts = Object.values(DocumentModerationHistorique.STATUTS);
    
    const baseSchema = {
      document_id: Joi.number().integer().positive().required()
        .messages({
          'number.base': 'L\'ID du document doit être un nombre',
          'number.integer': 'L\'ID du document doit être un entier',
          'number.positive': 'L\'ID du document doit être positif',
          'any.required': 'L\'ID du document est requis'
        }),
        
      moderateur_id: Joi.number().integer().positive().required()
        .messages({
          'number.base': 'L\'ID du modérateur doit être un nombre',
          'number.integer': 'L\'ID du modérateur doit être un entier',
          'number.positive': 'L\'ID du modérateur doit être positif',
          'any.required': 'L\'ID du modérateur est requis'
        }),
        
      action: Joi.string().valid(...actions).required()
        .messages({
          'string.base': 'L\'action doit être une chaîne de caractères',
          'any.only': `L'action doit être l'une des valeurs suivantes: ${actions.join(', ')}`,
          'any.required': 'L\'action est requise'
        }),
        
      ancien_statut: Joi.string().valid(...statuts, '').optional().allow('')
        .messages({
          'string.base': 'L\'ancien statut doit être une chaîne de caractères',
          'any.only': `L'ancien statut doit être l'une des valeurs suivantes: ${statuts.join(', ')}`
        }),
        
      nouveau_statut: Joi.string().valid(...statuts, '').optional().allow('')
        .messages({
          'string.base': 'Le nouveau statut doit être une chaîne de caractères',
          'any.only': `Le nouveau statut doit être l'une des valeurs suivantes: ${statuts.join(', ')}`
        }),
        
      motif: Joi.string().max(2000).required()
        .messages({
          'string.base': 'Le motif doit être une chaîne de caractères',
          'string.max': 'Le motif ne peut pas dépasser 2000 caractères',
          'any.required': 'Le motif est requis pour toute action de modération'
        })
    };

    return Joi.object(baseSchema);
  }

  /**
   * Validation métier spécifique
   */
  async businessValidation(data, operation = 'create') {
    // Vérifier que le document existe
    if (data.document_id) {
      const Document = require('./Document');
      const document = new Document();
      const doc = await document.findById(data.document_id);
      
      if (!doc) {
        throw new Error('Le document spécifié n\'existe pas');
      }
    }

    // Vérifier que le modérateur existe et a les bonnes permissions
    if (data.moderateur_id) {
      const Utilisateur = require('./Utilisateur');
      const utilisateur = new Utilisateur();
      const user = await utilisateur.findById(data.moderateur_id);
      
      if (!user) {
        throw new Error('Le modérateur spécifié n\'existe pas');
      }
      
      if (user.role !== 'ADMIN' && user.role !== 'MODERATEUR') {
        throw new Error('Seuls les administrateurs et modérateurs peuvent effectuer des actions de modération');
      }
    }

    // Validation spécifique selon l'action
    if (data.action) {
      switch (data.action) {
        case DocumentModerationHistorique.ACTIONS.MISE_EN_AVANT:
        case DocumentModerationHistorique.ACTIONS.RETRAIT_MISE_EN_AVANT:
          if (!data.motif || data.motif.trim().length < 10) {
            throw new Error('Les actions de mise en avant nécessitent un motif d\'au moins 10 caractères');
          }
          break;
          
        case DocumentModerationHistorique.ACTIONS.REJET:
        case DocumentModerationHistorique.ACTIONS.SIGNALEMENT:
          if (!data.motif || data.motif.trim().length < 20) {
            throw new Error('Les rejets et signalements nécessitent un motif détaillé d\'au moins 20 caractères');
          }
          break;
      }
    }

    return true;
  }

  /**
   * Hook beforeCreate - Ajouter la date d'action et validation finale
   */
  async beforeCreate(data) {
    // Ajouter la date d'action
    data.date_action = new Date().toISOString();
    
    // Log de l'action de modération
    this.logChange('moderation_action', null, null, {
      action: data.action,
      document_id: data.document_id,
      moderateur_id: data.moderateur_id,
      motif: data.motif
    });
    
    return data;
  }

  /**
   * Empêcher la modification des entrées d'historique (immuable)
   */
  async update(id, data) {
    throw new Error('L\'historique de modération est immuable et ne peut pas être modifié');
  }

  /**
   * Empêcher la suppression des entrées d'historique (immuable)
   */
  async delete(id) {
    throw new Error('L\'historique de modération est immuable et ne peut pas être supprimé');
  }

  /**
   * Enregistrer une action de modération
   * 
   * @param {number} documentId - ID du document
   * @param {number} moderateurId - ID du modérateur
   * @param {string} action - Action effectuée
   * @param {string} motif - Justification de l'action
   * @param {string} ancienStatut - Statut avant l'action (optionnel)
   * @param {string} nouveauStatut - Statut après l'action (optionnel)
   * @returns {Object} Entrée d'historique créée
   */
  async enregistrerAction(documentId, moderateurId, action, motif, ancienStatut = '', nouveauStatut = '') {
    const actionData = {
      document_id: documentId,
      moderateur_id: moderateurId,
      action: action,
      ancien_statut: ancienStatut,
      nouveau_statut: nouveauStatut,
      motif: motif
    };

    return await this.create(actionData);
  }

  /**
   * Récupérer l'historique complet d'un document
   * 
   * @param {number} documentId - ID du document
   * @param {number} limite - Nombre d'entrées à récupérer
   * @returns {Array} Historique ordonné par date décroissante
   */
  async getHistoriqueDocument(documentId, limite = 50) {
    const db = require('../database/db');
    
    const sql = `
      SELECT 
        dmh.*,
        u.nom as moderateur_nom,
        u.email as moderateur_email
      FROM document_moderation_historique dmh
      LEFT JOIN utilisateurs u ON dmh.moderateur_id = u.id
      WHERE dmh.document_id = $1
      ORDER BY dmh.date_action DESC
      LIMIT $2
    `;
    
    const rows = await db.all(sql, [documentId, limite]);
    return rows.map(row => this.castAttributes(row));
  }

  /**
   * Récupérer les actions effectuées par un modérateur
   * 
   * @param {number} moderateurId - ID du modérateur
   * @param {number} limite - Nombre d'entrées à récupérer
   * @param {Date} dateDebut - Date de début (optionnel)
   * @param {Date} dateFin - Date de fin (optionnel)
   * @returns {Array} Actions du modérateur
   */
  async getActionsModerateur(moderateurId, limite = 100, dateDebut = null, dateFin = null) {
    let whereClause = 'moderateur_id = $1';
    const params = [moderateurId];
    let paramIndex = 2;

    if (dateDebut) {
      whereClause += ` AND date_action >= $${paramIndex}`;
      params.push(dateDebut.toISOString());
      paramIndex++;
    }

    if (dateFin) {
      whereClause += ` AND date_action <= $${paramIndex}`;
      params.push(dateFin.toISOString());
      paramIndex++;
    }

    const db = require('../database/db');
    
    const sql = `
      SELECT 
        dmh.*,
        d.titre as document_titre,
        d.systeme_jeu as document_systeme
      FROM document_moderation_historique dmh
      LEFT JOIN documents d ON dmh.document_id = d.id
      WHERE ${whereClause}
      ORDER BY dmh.date_action DESC
      LIMIT $${paramIndex}
    `;
    
    params.push(limite);
    
    const rows = await db.all(sql, params);
    return rows.map(row => this.castAttributes(row));
  }

  /**
   * Statistiques de modération pour le dashboard admin
   * 
   * @param {Date} dateDebut - Période de début (optionnel)
   * @param {Date} dateFin - Période de fin (optionnel)
   * @returns {Object} Statistiques détaillées
   */
  async statistiquesModeration(dateDebut = null, dateFin = null) {
    let whereClause = '1 = 1';
    const params = [];
    let paramIndex = 1;

    if (dateDebut) {
      whereClause += ` AND date_action >= $${paramIndex}`;
      params.push(dateDebut.toISOString());
      paramIndex++;
    }

    if (dateFin) {
      whereClause += ` AND date_action <= $${paramIndex}`;
      params.push(dateFin.toISOString());
      paramIndex++;
    }

    const db = require('../database/db');
    
    // Statistiques par action
    const sqlActions = `
      SELECT 
        action,
        COUNT(*) as nombre_actions
      FROM document_moderation_historique
      WHERE ${whereClause}
      GROUP BY action
      ORDER BY nombre_actions DESC
    `;
    
    // Statistiques par modérateur
    const sqlModerateurs = `
      SELECT 
        u.nom as moderateur_nom,
        u.email as moderateur_email,
        COUNT(*) as nombre_actions,
        COUNT(DISTINCT dmh.document_id) as documents_traites
      FROM document_moderation_historique dmh
      LEFT JOIN utilisateurs u ON dmh.moderateur_id = u.id
      WHERE ${whereClause}
      GROUP BY dmh.moderateur_id, u.nom, u.email
      ORDER BY nombre_actions DESC
    `;
    
    // Statistiques par jour (derniers 30 jours)
    const sqlJours = `
      SELECT 
        DATE(date_action) as date,
        COUNT(*) as nombre_actions
      FROM document_moderation_historique
      WHERE ${whereClause}
        AND date_action >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(date_action)
      ORDER BY date DESC
    `;

    const [actionsStats, moderateursStats, joursStats] = await Promise.all([
      db.all(sqlActions, params),
      db.all(sqlModerateurs, params),
      db.all(sqlJours, params)
    ]);

    // Total des actions
    const total = actionsStats.reduce((sum, stat) => sum + stat.nombre_actions, 0);

    return {
      total_actions: total,
      actions_par_type: actionsStats,
      actions_par_moderateur: moderateursStats,
      actions_par_jour: joursStats,
      periode: {
        debut: dateDebut ? dateDebut.toISOString() : 'Toutes',
        fin: dateFin ? dateFin.toISOString() : 'Aujourd\'hui'
      }
    };
  }

  /**
   * Récupérer les documents les plus modérés
   * 
   * @param {number} limite - Nombre de documents à récupérer
   * @param {Date} dateDebut - Période de début (optionnel)
   * @returns {Array} Documents avec nombre d'actions
   */
  async getDocumentsLesPlusModeres(limite = 20, dateDebut = null) {
    let whereClause = '1 = 1';
    const params = [];
    let paramIndex = 1;

    if (dateDebut) {
      whereClause += ` AND dmh.date_action >= $${paramIndex}`;
      params.push(dateDebut.toISOString());
      paramIndex++;
    }

    const db = require('../database/db');
    
    const sql = `
      SELECT 
        d.id,
        d.titre,
        d.systeme_jeu,
        d.type,
        d.visibilite,
        COUNT(dmh.id) as nombre_actions_moderation,
        STRING_AGG(DISTINCT dmh.action, ', ') as types_actions,
        MAX(dmh.date_action) as derniere_action
      FROM documents d
      INNER JOIN document_moderation_historique dmh ON d.id = dmh.document_id
      WHERE ${whereClause}
      GROUP BY d.id, d.titre, d.systeme_jeu, d.type, d.visibilite
      ORDER BY nombre_actions_moderation DESC, derniere_action DESC
      LIMIT $${paramIndex}
    `;
    
    params.push(limite);
    
    const rows = await db.all(sql, params);
    return rows.map(row => ({
      ...this.castAttributes(row),
      types_actions: row.types_actions ? row.types_actions.split(', ') : []
    }));
  }

  /**
   * Rechercher dans l'historique par motif
   * 
   * @param {string} recherche - Terme de recherche
   * @param {number} limite - Nombre de résultats
   * @returns {Array} Résultats de recherche
   */
  async rechercherParMotif(recherche, limite = 50) {
    const db = require('../database/db');
    
    const sql = `
      SELECT 
        dmh.*,
        d.titre as document_titre,
        u.nom as moderateur_nom
      FROM document_moderation_historique dmh
      LEFT JOIN documents d ON dmh.document_id = d.id
      LEFT JOIN utilisateurs u ON dmh.moderateur_id = u.id
      WHERE dmh.motif ILIKE $1
      ORDER BY dmh.date_action DESC
      LIMIT $2
    `;
    
    const rows = await db.all(sql, [`%${recherche}%`, limite]);
    return rows.map(row => this.castAttributes(row));
  }

  /**
   * RELATIONS - Récupérer le document concerné par cette action
   * belongsTo('document')
   */
  async getDocument(historiqueId) {
    const historique = await this.findById(historiqueId);
    if (!historique || !historique.document_id) {
      return null;
    }
    
    const Document = require('./Document');
    const document = new Document();
    return await document.findById(historique.document_id);
  }

  /**
   * RELATIONS - Récupérer le modérateur ayant effectué l'action
   * belongsTo('moderateur')
   */
  async getModerateur(historiqueId) {
    const historique = await this.findById(historiqueId);
    if (!historique || !historique.moderateur_id) {
      return null;
    }
    
    const Utilisateur = require('./Utilisateur');
    const utilisateur = new Utilisateur();
    return await utilisateur.findById(historique.moderateur_id);
  }

  /**
   * Statistiques des actions de modération par type
   * 
   * @param {Date} dateDebut - Date de début (optionnel)
   * @param {Date} dateFin - Date de fin (optionnel)
   * @returns {Array} Statistiques par action
   */
  static async getStatistiquesActions(dateDebut = null, dateFin = null) {
    const db = require('../database/db');
    
    let whereClause = '1 = 1';
    const params = [];
    let paramIndex = 1;

    if (dateDebut) {
      whereClause += ` AND created_at >= $${paramIndex}`;
      params.push(dateDebut.toISOString());
      paramIndex++;
    }

    if (dateFin) {
      whereClause += ` AND created_at <= $${paramIndex}`;
      params.push(dateFin.toISOString());
      paramIndex++;
    }

    const sql = `
      SELECT 
        action,
        COUNT(*) as nombre
      FROM document_moderation_historique
      WHERE ${whereClause}
      GROUP BY action
      ORDER BY nombre DESC
    `;
    
    const rows = await db.all(sql, params);
    
    // Convertir en objet pour faciliter l'accès
    const statistiques = {};
    rows.forEach(row => {
      statistiques[row.action] = parseInt(row.nombre);
    });
    
    return statistiques;
  }
}

module.exports = DocumentModerationHistorique;