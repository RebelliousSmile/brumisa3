const BaseModel = require('./BaseModel');
const Joi = require('joi');

/**
 * Modèle DocumentVote - Système de votes à 3 critères pour documents publics
 * 
 * Fonctionnalités:
 * - Vote unique par utilisateur/document (contrainte UNIQUE)
 * - 3 critères d'évaluation avec notes 1-5
 * - Calcul automatique des moyennes pour classement
 * - Commentaires optionnels pour feedback constructif
 * - Historique complet avec traçabilité
 */
class DocumentVote extends BaseModel {
  constructor() {
    super('document_votes', 'id');
    
    this.fillable = [
      'document_id',
      'utilisateur_id', 
      'qualite_generale',
      'utilite_pratique',
      'respect_gamme',
      'commentaire'
    ];
    
    this.hidden = [];
    
    this.casts = {
      qualite_generale: 'integer',
      utilite_pratique: 'integer',
      respect_gamme: 'integer',
      date_creation: 'date'
    };
    
    this.timestamps = true;
  }

  /**
   * Schema de validation Joi
   */
  getValidationSchema(operation = 'create') {
    const baseSchema = {
      document_id: Joi.number().integer().positive().required()
        .messages({
          'number.base': 'L\'ID du document doit être un nombre',
          'number.integer': 'L\'ID du document doit être un entier',
          'number.positive': 'L\'ID du document doit être positif',
          'any.required': 'L\'ID du document est requis'
        }),
        
      utilisateur_id: Joi.number().integer().positive().required()
        .messages({
          'number.base': 'L\'ID utilisateur doit être un nombre',
          'number.integer': 'L\'ID utilisateur doit être un entier', 
          'number.positive': 'L\'ID utilisateur doit être positif',
          'any.required': 'L\'ID utilisateur est requis'
        }),
        
      qualite_generale: Joi.number().integer().min(1).max(5).required()
        .messages({
          'number.base': 'La qualité générale doit être un nombre',
          'number.integer': 'La qualité générale doit être un entier',
          'number.min': 'La qualité générale doit être entre 1 et 5',
          'number.max': 'La qualité générale doit être entre 1 et 5',
          'any.required': 'La note de qualité générale est requise'
        }),
        
      utilite_pratique: Joi.number().integer().min(1).max(5).required()
        .messages({
          'number.base': 'L\'utilité pratique doit être un nombre',
          'number.integer': 'L\'utilité pratique doit être un entier',
          'number.min': 'L\'utilité pratique doit être entre 1 et 5', 
          'number.max': 'L\'utilité pratique doit être entre 1 et 5',
          'any.required': 'La note d\'utilité pratique est requise'
        }),
        
      respect_gamme: Joi.number().integer().min(1).max(5).required()
        .messages({
          'number.base': 'Le respect de la gamme doit être un nombre',
          'number.integer': 'Le respect de la gamme doit être un entier',
          'number.min': 'Le respect de la gamme doit être entre 1 et 5',
          'number.max': 'Le respect de la gamme doit être entre 1 et 5', 
          'any.required': 'La note de respect de la gamme est requise'
        }),
        
      commentaire: Joi.string().max(1000).optional().allow('')
        .messages({
          'string.base': 'Le commentaire doit être une chaîne de caractères',
          'string.max': 'Le commentaire ne peut pas dépasser 1000 caractères'
        })
    };

    return Joi.object(baseSchema);
  }

  /**
   * Validation métier spécifique
   */
  async businessValidation(data, operation = 'create') {
    // Vérifier que le document existe et est public
    if (data.document_id) {
      const Document = require('./Document');
      const document = new Document();
      const doc = await document.findById(data.document_id);
      
      if (!doc) {
        throw new Error('Le document spécifié n\'existe pas');
      }
      
      if (doc.visibilite !== 'PUBLIC') {
        throw new Error('Seuls les documents publics peuvent être votés');
      }
    }

    // Vérifier que l'utilisateur existe
    if (data.utilisateur_id) {
      const Utilisateur = require('./Utilisateur');
      const utilisateur = new Utilisateur();
      const user = await utilisateur.findById(data.utilisateur_id);
      
      if (!user) {
        throw new Error('L\'utilisateur spécifié n\'existe pas');
      }
    }

    // Pour les créations, vérifier l'unicité du vote
    if (operation === 'create' && data.document_id && data.utilisateur_id) {
      const existingVote = await this.findOne(
        'document_id = $1 AND utilisateur_id = $2',
        [data.document_id, data.utilisateur_id]
      );
      
      if (existingVote) {
        throw new Error('Vous avez déjà voté pour ce document. Utilisez modifierVote() pour modifier votre vote.');
      }
    }

    return true;
  }

  /**
   * Hook beforeCreate - Log de l'action de vote
   */
  async beforeCreate(data) {
    this.logChange('vote_create', null, null, data);
    return data;
  }

  /**
   * Hook beforeUpdate - Log de la modification de vote
   */
  async beforeUpdate(data) {
    this.logChange('vote_update', null, null, data);
    return data;
  }

  /**
   * Enregistrer ou modifier un vote pour un document
   * 
   * @param {number} documentId - ID du document
   * @param {number} utilisateurId - ID de l'utilisateur
   * @param {Object} votes - Notes des 3 critères
   * @param {string} commentaire - Commentaire optionnel
   * @returns {Object} Vote créé ou modifié
   */
  async voterDocument(documentId, utilisateurId, votes, commentaire = '') {
    const voteData = {
      document_id: documentId,
      utilisateur_id: utilisateurId,
      qualite_generale: votes.qualite_generale,
      utilite_pratique: votes.utilite_pratique,
      respect_gamme: votes.respect_gamme,
      commentaire: commentaire
    };

    // Vérifier si un vote existe déjà
    const existingVote = await this.findOne(
      'document_id = $1 AND utilisateur_id = $2',
      [documentId, utilisateurId]
    );

    if (existingVote) {
      throw new Error('Un vote existe déjà. Utilisez modifierVote() pour le modifier.');
    }

    return await this.create(voteData);
  }

  /**
   * Modifier un vote existant
   * 
   * @param {number} documentId - ID du document
   * @param {number} utilisateurId - ID de l'utilisateur
   * @param {Object} nouveauxVotes - Nouvelles notes
   * @param {string} commentaire - Nouveau commentaire
   * @returns {Object} Vote modifié
   */
  async modifierVote(documentId, utilisateurId, nouveauxVotes, commentaire = '') {
    const existingVote = await this.findOne(
      'document_id = $1 AND utilisateur_id = $2',
      [documentId, utilisateurId]
    );

    if (!existingVote) {
      throw new Error('Aucun vote trouvé pour ce document et cet utilisateur');
    }

    const updateData = {
      qualite_generale: nouveauxVotes.qualite_generale,
      utilite_pratique: nouveauxVotes.utilite_pratique,
      respect_gamme: nouveauxVotes.respect_gamme,
      commentaire: commentaire
    };

    return await this.update(existingVote.id, updateData);
  }

  /**
   * Calculer les moyennes par critère pour un document
   * 
   * @param {number} documentId - ID du document
   * @returns {Object} Moyennes et statistiques
   */
  async calculerMoyennes(documentId) {
    const votes = await this.findAll('document_id = $1', [documentId]);
    
    if (votes.length === 0) {
      return {
        nombre_votes: 0,
        qualite_generale_moyenne: 0,
        utilite_pratique_moyenne: 0,
        respect_gamme_moyenne: 0,
        moyenne_globale: 0
      };
    }

    const moyennes = {
      nombre_votes: votes.length,
      qualite_generale_moyenne: votes.reduce((sum, vote) => sum + vote.qualite_generale, 0) / votes.length,
      utilite_pratique_moyenne: votes.reduce((sum, vote) => sum + vote.utilite_pratique, 0) / votes.length,
      respect_gamme_moyenne: votes.reduce((sum, vote) => sum + vote.respect_gamme, 0) / votes.length
    };

    // Calcul de la moyenne globale (moyenne des 3 critères)
    moyennes.moyenne_globale = (
      moyennes.qualite_generale_moyenne + 
      moyennes.utilite_pratique_moyenne + 
      moyennes.respect_gamme_moyenne
    ) / 3;

    // Arrondir à 2 décimales
    Object.keys(moyennes).forEach(key => {
      if (key !== 'nombre_votes') {
        moyennes[key] = Math.round(moyennes[key] * 100) / 100;
      }
    });

    return moyennes;
  }

  /**
   * Récupérer le vote d'un utilisateur pour un document
   * 
   * @param {number} utilisateurId - ID de l'utilisateur
   * @param {number} documentId - ID du document
   * @returns {Object|null} Vote de l'utilisateur
   */
  async getVotesUtilisateur(utilisateurId, documentId) {
    return await this.findOne(
      'utilisateur_id = $1 AND document_id = $2',
      [utilisateurId, documentId]
    );
  }

  /**
   * Classement des documents par critère
   * 
   * @param {string} systeme - Système JDR (optionnel)
   * @param {string} critere - Critère de classement
   * @param {number} limite - Nombre de résultats
   * @returns {Array} Documents classés
   */
  async classementDocuments(systeme = null, critere = 'moyenne_globale', limite = 20) {
    const criteresValides = ['qualite_generale', 'utilite_pratique', 'respect_gamme', 'moyenne_globale'];
    if (!criteresValides.includes(critere)) {
      throw new Error(`Critère invalide. Utilisez: ${criteresValides.join(', ')}`);
    }

    let sqlJoin = `
      SELECT 
        d.id,
        d.titre,
        d.systeme_jeu,
        d.type,
        COUNT(dv.id) as nombre_votes,
        ROUND(AVG(dv.qualite_generale), 2) as qualite_generale_moyenne,
        ROUND(AVG(dv.utilite_pratique), 2) as utilite_pratique_moyenne,
        ROUND(AVG(dv.respect_gamme), 2) as respect_gamme_moyenne,
        ROUND((AVG(dv.qualite_generale) + AVG(dv.utilite_pratique) + AVG(dv.respect_gamme)) / 3, 2) as moyenne_globale
      FROM documents d
      INNER JOIN document_votes dv ON d.id = dv.document_id
      WHERE d.visibilite = 'PUBLIC'
    `;

    const params = [];
    let paramIndex = 1;

    if (systeme) {
      sqlJoin += ` AND d.systeme_jeu = $${paramIndex}`;
      params.push(systeme);
      paramIndex++;
    }

    sqlJoin += ` GROUP BY d.id, d.titre, d.systeme_jeu, d.type`;
    sqlJoin += ` HAVING COUNT(dv.id) >= 3`; // Minimum 3 votes pour être classé
    
    if (critere === 'moyenne_globale') {
      sqlJoin += ` ORDER BY moyenne_globale DESC`;
    } else {
      sqlJoin += ` ORDER BY ${critere}_moyenne DESC`;
    }
    
    sqlJoin += ` LIMIT $${paramIndex}`;
    params.push(limite);

    const db = require('../database/db');
    const rows = await db.all(sqlJoin, params);
    
    return rows;
  }

  /**
   * Statistiques complètes des votes pour un document
   * 
   * @param {number} documentId - ID du document
   * @returns {Object} Statistiques détaillées
   */
  async statistiquesVotes(documentId) {
    const votes = await this.findAll('document_id = $1', [documentId], 'date_creation DESC');
    const moyennes = await this.calculerMoyennes(documentId);

    if (votes.length === 0) {
      return {
        ...moyennes,
        distribution: {
          qualite_generale: {},
          utilite_pratique: {},
          respect_gamme: {}
        },
        commentaires: []
      };
    }

    // Distribution des notes par critère
    const distribution = {
      qualite_generale: {},
      utilite_pratique: {},
      respect_gamme: {}
    };

    // Initialiser les compteurs pour chaque note (1-5)
    [1, 2, 3, 4, 5].forEach(note => {
      distribution.qualite_generale[note] = 0;
      distribution.utilite_pratique[note] = 0;
      distribution.respect_gamme[note] = 0;
    });

    // Compter les votes par note
    votes.forEach(vote => {
      distribution.qualite_generale[vote.qualite_generale]++;
      distribution.utilite_pratique[vote.utilite_pratique]++;
      distribution.respect_gamme[vote.respect_gamme]++;
    });

    // Récupérer les commentaires non vides
    const commentaires = votes
      .filter(vote => vote.commentaire && vote.commentaire.trim().length > 0)
      .map(vote => ({
        commentaire: vote.commentaire,
        date_creation: vote.date_creation,
        notes: {
          qualite_generale: vote.qualite_generale,
          utilite_pratique: vote.utilite_pratique,
          respect_gamme: vote.respect_gamme
        }
      }));

    return {
      ...moyennes,
      distribution,
      commentaires
    };
  }

  /**
   * Supprimer un vote (pour les admins ou l'utilisateur propriétaire)
   * 
   * @param {number} documentId - ID du document
   * @param {number} utilisateurId - ID de l'utilisateur
   * @param {number} demandeurId - ID du demandeur (admin ou utilisateur)
   * @param {boolean} estAdmin - Le demandeur est-il admin
   * @returns {boolean} Succès de la suppression
   */
  async supprimerVote(documentId, utilisateurId, demandeurId, estAdmin = false) {
    const vote = await this.findOne(
      'document_id = $1 AND utilisateur_id = $2',
      [documentId, utilisateurId]
    );

    if (!vote) {
      throw new Error('Vote introuvable');
    }

    // Vérifier les permissions
    if (!estAdmin && demandeurId !== utilisateurId) {
      throw new Error('Vous ne pouvez supprimer que vos propres votes');
    }

    return await this.delete(vote.id);
  }

  /**
   * Obtenir les statistiques de vote d'un document spécifique
   * Alias pour calculerMoyennes pour compatibilité avec le controller
   * 
   * @param {number} documentId - ID du document
   * @returns {Object} Statistiques de votes
   */
  static async getStatistiquesDocument(documentId) {
    const instance = new DocumentVote();
    return await instance.calculerMoyennes(documentId);
  }

  /**
   * Obtenir les documents populaires avec leurs statistiques de votes
   * 
   * @param {Object} conditions - Conditions de filtrage (systeme, type, est_public, etc.)
   * @param {number} limite - Nombre de documents à récupérer
   * @param {number} offset - Décalage pour pagination
   * @returns {Array} Documents avec statistiques de votes
   */
  static async getDocumentsPopulaires(conditions = {}, limite = 20, offset = 0) {
    const db = require('../database/db');
    
    let whereClause = 'd.est_public = true';
    const params = [];
    let paramIndex = 1;

    // Construire la clause WHERE selon les conditions
    if (conditions.systeme) {
      whereClause += ` AND d.systeme = $${paramIndex}`;
      params.push(conditions.systeme);
      paramIndex++;
    }

    if (conditions.type) {
      whereClause += ` AND d.type = $${paramIndex}`;
      params.push(conditions.type);
      paramIndex++;
    }

    if (conditions.statut_moderation) {
      whereClause += ` AND d.statut_moderation = $${paramIndex}`;
      params.push(conditions.statut_moderation);
      paramIndex++;
    }

    const sql = `
      SELECT 
        d.id,
        d.titre,
        d.systeme,
        d.type,
        d.created_at,
        d.utilisateur_id,
        u.nom as auteur_nom,
        COUNT(dv.id) as nombre_votes,
        ROUND(AVG(dv.qualite_generale), 2) as qualite_generale_moyenne,
        ROUND(AVG(dv.utilite_pratique), 2) as utilite_pratique_moyenne,
        ROUND(AVG(dv.respect_gamme), 2) as respect_gamme_moyenne,
        ROUND((AVG(dv.qualite_generale) + AVG(dv.utilite_pratique) + AVG(dv.respect_gamme)) / 3, 2) as moyenne_globale
      FROM documents d
      LEFT JOIN document_votes dv ON d.id = dv.document_id
      LEFT JOIN utilisateurs u ON d.utilisateur_id = u.id
      WHERE ${whereClause}
      GROUP BY d.id, d.titre, d.systeme, d.type, d.created_at, d.utilisateur_id, u.nom
      ORDER BY moyenne_globale DESC NULLS LAST, nombre_votes DESC, d.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    params.push(limite, offset);
    
    const rows = await db.all(sql, params);
    return rows.map(row => ({
      ...row,
      // Gérer les valeurs null pour les documents sans votes
      nombre_votes: row.nombre_votes || 0,
      qualite_generale_moyenne: row.qualite_generale_moyenne || 0,
      utilite_pratique_moyenne: row.utilite_pratique_moyenne || 0,
      respect_gamme_moyenne: row.respect_gamme_moyenne || 0,
      moyenne_globale: row.moyenne_globale || 0
    }));
  }

  /**
   * Créer ou mettre à jour un vote (upsert)
   * 
   * @param {Object} voteData - Données du vote
   * @param {Array} conflictColumns - Colonnes pour détecter le conflit
   * @returns {Object} Vote créé ou mis à jour
   */
  static async upsert(voteData, conflictColumns = ['document_id', 'utilisateur_id']) {
    const instance = new DocumentVote();
    
    // Vérifier si un vote existe déjà
    const existingVote = await instance.findOne(
      'document_id = $1 AND utilisateur_id = $2',
      [voteData.document_id, voteData.utilisateur_id]
    );

    if (existingVote) {
      // Mettre à jour le vote existant
      const updateData = {
        qualite_generale: voteData.qualite_generale,
        utilite_pratique: voteData.utilite_pratique,
        respect_gamme: voteData.respect_gamme,
        commentaire: voteData.commentaire || existingVote.commentaire
      };
      
      await instance.update(existingVote.id, updateData);
      return { ...existingVote, ...updateData };
    } else {
      // Créer un nouveau vote
      return await instance.create(voteData);
    }
  }
}

module.exports = DocumentVote;