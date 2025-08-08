const BaseModel = require('./BaseModel');
const Joi = require('joi');

/**
 * Modèle Document - Document JDR principal avec 6 types supportés
 * 
 * Ce modèle central gère tous les documents JDR créés par les utilisateurs.
 * Il supporte le workflow "mode sur le pouce" (anonyme) + "gestion à moyen terme" (avec compte).
 * 
 * Types de documents supportés:
 * - GENERIQUE : Document non typé, structure libre (journaux joueur solo)
 * - CHARACTER : Fiche de personnage (tous systèmes JDR)
 * - TOWN : Cadre de ville (spécifique à Monsterhearts)
 * - GROUP : Plan de classe/groupe (spécifique à Monsterhearts)
 * - ORGANIZATION : Liste de PNJs (crucial pour MJs - tous systèmes)
 * - DANGER : Fronts et dangers (spécifique à Mist Engine)
 * 
 * Fonctionnalités:
 * - Support mode "sur le pouce" : Création anonyme immédiate
 * - Workflow Document vs Personnage : Documents peuvent être générés depuis personnages sauvegardés
 * - Partage communautaire : Documents publics avec système de votes
 * - Modération a posteriori : Publication immédiate puis validation admin
 * - Mise en avant administrative : Documents de référence promus par modérateurs
 * - Système de priorité d'affichage : Mis en avant > Votés > Récents
 */
class Document extends BaseModel {
  constructor() {
    super('documents', 'id');
    
    this.fillable = [
      'type',
      'titre',
      'systeme_jeu',
      'utilisateur_id', // nullable pour guests
      'donnees',
      'statut',
      'visible_admin_only',
      'personnage_id', // nullable - lien vers personnage sauvegardé
      'visibilite',
      'est_mis_en_avant',
      'date_mise_en_avant',
      'moderateur_id',
      'statut_moderation',
      'date_moderation',
      'motif_rejet',
      'notes_creation',
      'contexte_utilisation'
    ];
    
    this.hidden = ['visible_admin_only']; // Champ technique caché
    
    this.casts = {
      utilisateur_id: 'integer',
      personnage_id: 'integer',
      moderateur_id: 'integer',
      donnees: 'json',
      visible_admin_only: 'boolean',
      est_mis_en_avant: 'boolean',
      date_mise_en_avant: 'date',
      date_moderation: 'date',
      date_creation: 'date',
      date_modification: 'date'
    };
    
    this.timestamps = true;
  }

  /**
   * Types de documents disponibles
   */
  static get TYPES() {
    return {
      GENERIQUE: 'GENERIQUE',
      CHARACTER: 'CHARACTER',
      TOWN: 'TOWN',
      GROUP: 'GROUP',
      ORGANIZATION: 'ORGANIZATION',
      DANGER: 'DANGER'
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
      SUPPRIME: 'SUPPRIME'
    };
  }

  /**
   * Niveaux de visibilité disponibles
   */
  static get VISIBILITES() {
    return {
      PRIVE: 'PRIVE',
      PUBLIC: 'PUBLIC'
    };
  }

  /**
   * Statuts de modération disponibles
   */
  static get STATUTS_MODERATION() {
    return {
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
    const types = Object.values(Document.TYPES);
    const statuts = Object.values(Document.STATUTS);
    const visibilites = Object.values(Document.VISIBILITES);
    const statutsModeration = Object.values(Document.STATUTS_MODERATION);
    const SystemeJeu = require('./SystemeJeu');
    const systemesValides = SystemeJeu.SYSTEMES_SUPPORTES;
    
    const baseSchema = {
      type: Joi.string().valid(...types).required()
        .messages({
          'string.base': 'Le type doit être une chaîne de caractères',
          'any.only': `Le type doit être l'un des suivants: ${types.join(', ')}`,
          'any.required': 'Le type de document est requis'
        }),
        
      titre: Joi.string().min(3).max(200).required()
        .messages({
          'string.base': 'Le titre doit être une chaîne de caractères',
          'string.min': 'Le titre doit faire au moins 3 caractères',
          'string.max': 'Le titre ne peut pas dépasser 200 caractères',
          'any.required': 'Le titre est requis'
        }),
        
      systeme_jeu: Joi.string().valid(...systemesValides).required()
        .messages({
          'string.base': 'Le système JDR doit être une chaîne de caractères',
          'any.only': `Le système JDR doit être l'un des suivants: ${systemesValides.join(', ')}`,
          'any.required': 'Le système JDR est requis'
        }),
        
      utilisateur_id: Joi.number().integer().positive().optional().allow(null)
        .messages({
          'number.base': 'L\'ID utilisateur doit être un nombre',
          'number.integer': 'L\'ID utilisateur doit être un entier',
          'number.positive': 'L\'ID utilisateur doit être positif'
        }),
        
      donnees: Joi.object().required()
        .messages({
          'object.base': 'Les données doivent être un objet JSON',
          'any.required': 'Les données du document sont requises'
        }),
        
      statut: Joi.string().valid(...statuts).default(Document.STATUTS.ACTIF)
        .messages({
          'string.base': 'Le statut doit être une chaîne de caractères',
          'any.only': `Le statut doit être l'un des suivants: ${statuts.join(', ')}`
        }),
        
      visible_admin_only: Joi.boolean().default(false)
        .messages({
          'boolean.base': 'visible_admin_only doit être un booléen'
        }),
        
      personnage_id: Joi.number().integer().positive().optional().allow(null)
        .messages({
          'number.base': 'L\'ID du personnage doit être un nombre',
          'number.integer': 'L\'ID du personnage doit être un entier',
          'number.positive': 'L\'ID du personnage doit être positif'
        }),
        
      visibilite: Joi.string().valid(...visibilites).default(Document.VISIBILITES.PRIVE)
        .messages({
          'string.base': 'La visibilité doit être une chaîne de caractères',
          'any.only': `La visibilité doit être l'une des suivantes: ${visibilites.join(', ')}`
        }),
        
      est_mis_en_avant: Joi.boolean().default(false)
        .messages({
          'boolean.base': 'est_mis_en_avant doit être un booléen'
        }),
        
      statut_moderation: Joi.string().valid(...statutsModeration).default(Document.STATUTS_MODERATION.EN_ATTENTE)
        .messages({
          'string.base': 'Le statut de modération doit être une chaîne de caractères',
          'any.only': `Le statut de modération doit être l'un des suivants: ${statutsModeration.join(', ')}`
        }),
        
      notes_creation: Joi.string().max(1000).optional().allow('')
        .messages({
          'string.base': 'Les notes de création doivent être une chaîne de caractères',
          'string.max': 'Les notes de création ne peuvent pas dépasser 1000 caractères'
        }),
        
      contexte_utilisation: Joi.string().max(1000).optional().allow('')
        .messages({
          'string.base': 'Le contexte d\'utilisation doit être une chaîne de caractères',
          'string.max': 'Le contexte d\'utilisation ne peut pas dépasser 1000 caractères'
        })
    };

    return Joi.object(baseSchema);
  }

  /**
   * Validation métier spécifique
   */
  async businessValidation(data, operation = 'create') {
    // Vérifier que l'utilisateur existe (si fourni)
    if (data.utilisateur_id) {
      const Utilisateur = require('./Utilisateur');
      const utilisateur = new Utilisateur();
      const user = await utilisateur.findById(data.utilisateur_id);
      
      if (!user) {
        throw new Error('L\'utilisateur spécifié n\'existe pas');
      }
    }

    // Vérifier que le personnage existe et appartient à l'utilisateur (si fourni)
    if (data.personnage_id) {
      const Personnage = require('./Personnage');
      const personnage = new Personnage();
      const perso = await personnage.findById(data.personnage_id);
      
      if (!perso) {
        throw new Error('Le personnage spécifié n\'existe pas');
      }
      
      if (data.utilisateur_id && perso.utilisateur_id !== data.utilisateur_id) {
        throw new Error('Le personnage ne correspond pas à l\'utilisateur spécifié');
      }
    }

    // Vérifier la disponibilité du type pour le système JDR
    if (data.type && data.systeme_jeu) {
      const DocumentSystemeJeu = require('./DocumentSystemeJeu');
      const docSysJeu = new DocumentSystemeJeu();
      const disponibilite = await docSysJeu.verifierDisponibilite(data.type, data.systeme_jeu);
      
      if (!disponibilite.disponible) {
        throw new Error(`Type ${data.type} non disponible pour ${data.systeme_jeu}: ${disponibilite.message}`);
      }
    }

    // Les documents anonymes sont automatiquement visible_admin_only
    if (!data.utilisateur_id && !data.visible_admin_only) {
      data.visible_admin_only = true;
    }

    // Les documents publics ne peuvent pas être des brouillons
    if (data.visibilite === Document.VISIBILITES.PUBLIC && data.statut === Document.STATUTS.BROUILLON) {
      throw new Error('Un document brouillon ne peut pas être rendu public');
    }

    return true;
  }

  /**
   * Hook beforeCreate - Gestion des règles métier à la création
   */
  async beforeCreate(data) {
    // Pour les utilisateurs connectés, vérifier si visible_admin_only doit être false
    if (data.utilisateur_id && data.visible_admin_only === undefined) {
      data.visible_admin_only = false;
    }

    this.logChange('document_create', null, null, {
      type: data.type,
      systeme_jeu: data.systeme_jeu,
      utilisateur_id: data.utilisateur_id,
      anonyme: !data.utilisateur_id
    });
    
    return data;
  }

  /**
   * Créer un document anonyme (mode "sur le pouce")
   * 
   * @param {Object} data - Données du document
   * @returns {Object} Document créé
   */
  async createAnonymous(data) {
    const documentData = {
      ...data,
      utilisateur_id: null,
      visible_admin_only: true,
      visibilite: Document.VISIBILITES.PRIVE,
      statut_moderation: Document.STATUTS_MODERATION.EN_ATTENTE
    };

    return await this.create(documentData);
  }

  /**
   * Créer un document depuis un personnage sauvegardé
   * 
   * @param {number} personnageId - ID du personnage
   * @returns {Object} Document créé
   */
  async createFromPersonnage(personnageId) {
    const Personnage = require('./Personnage');
    const personnage = new Personnage();
    const perso = await personnage.findById(personnageId);
    
    if (!perso) {
      throw new Error('Personnage introuvable');
    }

    // Mettre à jour la dernière utilisation du personnage
    await personnage.mettreAJourDerniereUtilisation(personnageId);

    const documentData = {
      type: Document.TYPES.CHARACTER,
      titre: `${perso.nom} - Fiche de personnage`,
      systeme_jeu: perso.systeme_jeu,
      utilisateur_id: perso.utilisateur_id,
      personnage_id: personnageId,
      donnees: perso.donnees,
      statut: Document.STATUTS.ACTIF,
      visible_admin_only: false,
      notes_creation: 'Document généré depuis un personnage sauvegardé'
    };

    return await this.create(documentData);
  }

  /**
   * Trouver les documents par type et système
   * 
   * @param {string} type - Type de document
   * @param {string} systeme - Système JDR
   * @param {Object} filtres - Filtres additionnels
   * @returns {Array} Documents trouvés
   */
  async findByType(type, systeme, filtres = {}) {
    let whereClause = 'type = $1 AND systeme_jeu = $2 AND statut != $3';
    const params = [type, systeme, Document.STATUTS.SUPPRIME];
    let paramIndex = 4;

    if (filtres.visibilite) {
      whereClause += ` AND visibilite = $${paramIndex}`;
      params.push(filtres.visibilite);
      paramIndex++;
    }

    if (filtres.utilisateur_id) {
      whereClause += ` AND utilisateur_id = $${paramIndex}`;
      params.push(filtres.utilisateur_id);
      paramIndex++;
    }

    const orderBy = filtres.orderBy || 'date_creation DESC';
    const limite = filtres.limite || 50;

    return await this.findAll(whereClause, params, orderBy, limite);
  }

  /**
   * Trouver les documents visibles par un utilisateur
   * 
   * @param {number|null} utilisateurId - ID de l'utilisateur (null pour invité)
   * @param {Object} filtres - Filtres additionnels
   * @returns {Array} Documents visibles
   */
  async findVisibleBy(utilisateurId, filtres = {}) {
    let whereClause = 'statut != $1';
    const params = [Document.STATUTS.SUPPRIME];
    let paramIndex = 2;

    if (utilisateurId) {
      // Utilisateur connecté : ses propres documents + documents publics
      whereClause += ` AND (utilisateur_id = $${paramIndex} OR (visibilite = 'PUBLIC' AND visible_admin_only = false))`;
      params.push(utilisateurId);
      paramIndex++;
    } else {
      // Invité : uniquement documents publics
      whereClause += ` AND visibilite = 'PUBLIC' AND visible_admin_only = false`;
    }

    if (filtres.type) {
      whereClause += ` AND type = $${paramIndex}`;
      params.push(filtres.type);
      paramIndex++;
    }

    if (filtres.systeme_jeu) {
      whereClause += ` AND systeme_jeu = $${paramIndex}`;
      params.push(filtres.systeme_jeu);
      paramIndex++;
    }

    const orderBy = filtres.orderBy || 'date_creation DESC';
    const limite = filtres.limite || 50;

    return await this.findAll(whereClause, params, orderBy, limite);
  }

  /**
   * Trouver les documents "admin only" (créés par des invités)
   * 
   * @param {Object} filtres - Filtres additionnels
   * @returns {Array} Documents admin only
   */
  async findAdminOnly(filtres = {}) {
    let whereClause = 'visible_admin_only = true AND statut != $1';
    const params = [Document.STATUTS.SUPPRIME];
    let paramIndex = 2;

    if (filtres.type) {
      whereClause += ` AND type = $${paramIndex}`;
      params.push(filtres.type);
      paramIndex++;
    }

    if (filtres.systeme_jeu) {
      whereClause += ` AND systeme_jeu = $${paramIndex}`;
      params.push(filtres.systeme_jeu);
      paramIndex++;
    }

    const orderBy = filtres.orderBy || 'date_creation DESC';
    const limite = filtres.limite || 100;

    return await this.findAll(whereClause, params, orderBy, limite);
  }

  /**
   * Trouver les documents publics par système JDR
   * 
   * @param {string} systeme - Système JDR
   * @param {Object} filtres - Filtres additionnels
   * @returns {Array} Documents publics
   */
  async findPublicsBySystem(systeme, filtres = {}) {
    let whereClause = 'systeme_jeu = $1 AND visibilite = $2 AND visible_admin_only = false AND statut = $3';
    const params = [systeme, Document.VISIBILITES.PUBLIC, Document.STATUTS.ACTIF];
    let paramIndex = 4;

    if (filtres.type) {
      whereClause += ` AND type = $${paramIndex}`;
      params.push(filtres.type);
      paramIndex++;
    }

    if (filtres.est_mis_en_avant !== undefined) {
      whereClause += ` AND est_mis_en_avant = $${paramIndex}`;
      params.push(filtres.est_mis_en_avant);
      paramIndex++;
    }

    // Ordre de priorité : mis en avant > puis date de création
    const orderBy = 'est_mis_en_avant DESC, date_creation DESC';
    const limite = filtres.limite || 20;

    return await this.findAll(whereClause, params, orderBy, limite);
  }

  /**
   * Trouver les documents mis en avant par système et type
   * 
   * @param {string} systeme - Système JDR
   * @param {string} type - Type de document (optionnel)
   * @returns {Array} Documents mis en avant
   */
  async findMisEnAvant(systeme, type = null) {
    let whereClause = 'systeme_jeu = $1 AND est_mis_en_avant = true AND visibilite = $2 AND statut = $3';
    const params = [systeme, Document.VISIBILITES.PUBLIC, Document.STATUTS.ACTIF];
    let paramIndex = 4;

    if (type) {
      whereClause += ` AND type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    return await this.findAll(
      whereClause,
      params,
      'date_mise_en_avant DESC, date_creation DESC'
    );
  }

  /**
   * Trouver les documents en attente de modération
   * 
   * @returns {Array} Documents à modérer
   */
  async findEnAttenteModeration() {
    return await this.findAll(
      'statut_moderation = $1 AND visibilite = $2 AND statut = $3',
      [Document.STATUTS_MODERATION.EN_ATTENTE, Document.VISIBILITES.PUBLIC, Document.STATUTS.ACTIF],
      'date_creation ASC' // Plus anciens en premier
    );
  }

  /**
   * Changer la visibilité d'un document
   * 
   * @param {number} id - ID du document
   * @param {string} nouvelleVisibilite - Nouvelle visibilité
   * @param {number} utilisateurId - ID de l'utilisateur demandeur
   * @returns {Object} Document mis à jour
   */
  async changerVisibilite(id, nouvelleVisibilite, utilisateurId) {
    const document = await this.findById(id);
    
    if (!document) {
      throw new Error('Document introuvable');
    }

    // Vérifier les permissions
    if (document.utilisateur_id !== utilisateurId) {
      throw new Error('Vous ne pouvez modifier que vos propres documents');
    }

    // Un brouillon ne peut pas être rendu public
    if (nouvelleVisibilite === Document.VISIBILITES.PUBLIC && document.statut === Document.STATUTS.BROUILLON) {
      throw new Error('Un document brouillon ne peut pas être rendu public');
    }

    const updateData = { visibilite: nouvelleVisibilite };

    // Si passage en public, réinitialiser le statut de modération
    if (nouvelleVisibilite === Document.VISIBILITES.PUBLIC) {
      updateData.statut_moderation = Document.STATUTS_MODERATION.EN_ATTENTE;
      updateData.date_moderation = null;
    }

    return await this.update(id, updateData);
  }

  /**
   * Mettre un document en avant (administrateur)
   * 
   * @param {number} id - ID du document
   * @param {number} moderateurId - ID du modérateur
   * @param {string} motif - Motif de la mise en avant
   * @returns {Object} Document mis à jour
   */
  async mettreEnAvant(id, moderateurId, motif) {
    const document = await this.findById(id);
    
    if (!document) {
      throw new Error('Document introuvable');
    }

    if (document.visibilite !== Document.VISIBILITES.PUBLIC) {
      throw new Error('Seuls les documents publics peuvent être mis en avant');
    }

    const updateData = {
      est_mis_en_avant: true,
      date_mise_en_avant: new Date().toISOString(),
      moderateur_id: moderateurId,
      statut_moderation: Document.STATUTS_MODERATION.APPROUVE
    };

    // Enregistrer l'action dans l'historique
    const DocumentModerationHistorique = require('./DocumentModerationHistorique');
    const historique = new DocumentModerationHistorique();
    await historique.enregistrerAction(
      id,
      moderateurId,
      'MISE_EN_AVANT',
      motif,
      '',
      'MIS_EN_AVANT'
    );

    return await this.update(id, updateData);
  }

  /**
   * Retirer la mise en avant d'un document
   * 
   * @param {number} id - ID du document
   * @param {number} moderateurId - ID du modérateur
   * @returns {Object} Document mis à jour
   */
  async retirerMiseEnAvant(id, moderateurId) {
    const document = await this.findById(id);
    
    if (!document) {
      throw new Error('Document introuvable');
    }

    if (!document.est_mis_en_avant) {
      throw new Error('Ce document n\'est pas mis en avant');
    }

    const updateData = {
      est_mis_en_avant: false,
      date_mise_en_avant: null,
      moderateur_id: moderateurId
    };

    // Enregistrer l'action dans l'historique
    const DocumentModerationHistorique = require('./DocumentModerationHistorique');
    const historique = new DocumentModerationHistorique();
    await historique.enregistrerAction(
      id,
      moderateurId,
      'RETRAIT_MISE_EN_AVANT',
      'Retrait de la mise en avant',
      'MIS_EN_AVANT',
      ''
    );

    return await this.update(id, updateData);
  }

  /**
   * Modérer un document (approuver, rejeter, signaler)
   * 
   * @param {number} id - ID du document
   * @param {string} statut - Nouveau statut de modération
   * @param {number} moderateurId - ID du modérateur
   * @param {string} motif - Motif de l'action
   * @returns {Object} Document modéré
   */
  async moderer(id, statut, moderateurId, motif) {
    const document = await this.findById(id);
    
    if (!document) {
      throw new Error('Document introuvable');
    }

    const updateData = {
      statut_moderation: statut,
      date_moderation: new Date().toISOString(),
      moderateur_id: moderateurId
    };

    if (statut === Document.STATUTS_MODERATION.REJETE) {
      updateData.motif_rejet = motif;
      // Un document rejeté est automatiquement remis en privé
      updateData.visibilite = Document.VISIBILITES.PRIVE;
    }

    // Déterminer l'action pour l'historique
    let action = 'APPROBATION';
    if (statut === Document.STATUTS_MODERATION.REJETE) {
      action = 'REJET';
    } else if (statut === Document.STATUTS_MODERATION.SIGNALE) {
      action = 'SIGNALEMENT';
    }

    // Enregistrer l'action dans l'historique
    const DocumentModerationHistorique = require('./DocumentModerationHistorique');
    const historique = new DocumentModerationHistorique();
    await historique.enregistrerAction(
      id,
      moderateurId,
      action,
      motif,
      document.statut_moderation,
      statut
    );

    return await this.update(id, updateData);
  }

  /**
   * Obtenir les types disponibles pour un système JDR
   * 
   * @param {string} systeme - Système JDR
   * @returns {Array} Types disponibles
   */
  async getTypesForSysteme(systeme) {
    const DocumentSystemeJeu = require('./DocumentSystemeJeu');
    const docSysJeu = new DocumentSystemeJeu();
    const typesActifs = await docSysJeu.getTypesActifs(systeme);
    
    return typesActifs.map(config => config.document_type);
  }

  /**
   * RELATIONS - Récupérer l'utilisateur propriétaire du document
   * belongsTo('utilisateur')
   */
  async getUtilisateur(documentId) {
    const document = await this.findById(documentId);
    if (!document || !document.utilisateur_id) {
      return null;
    }
    
    const Utilisateur = require('./Utilisateur');
    const utilisateur = new Utilisateur();
    return await utilisateur.findById(document.utilisateur_id);
  }

  /**
   * RELATIONS - Récupérer le personnage source du document (si applicable)
   * belongsTo('personnage')
   */
  async getPersonnage(documentId) {
    const document = await this.findById(documentId);
    if (!document || !document.personnage_id) {
      return null;
    }
    
    const Personnage = require('./Personnage');
    const personnage = new Personnage();
    return await personnage.findById(document.personnage_id);
  }

  /**
   * RELATIONS - Récupérer le modérateur ayant traité le document
   * belongsTo('moderateur') 
   */
  async getModerateur(documentId) {
    const document = await this.findById(documentId);
    if (!document || !document.moderateur_id) {
      return null;
    }
    
    const Utilisateur = require('./Utilisateur');
    const utilisateur = new Utilisateur();
    return await utilisateur.findById(document.moderateur_id);
  }

  /**
   * RELATIONS - Récupérer les votes pour ce document
   * hasMany('document_votes')
   */
  async getDocumentVotes(documentId) {
    const DocumentVote = require('./DocumentVote');
    const vote = new DocumentVote();
    return await vote.findAll('document_id = $1', [documentId], 'date_creation DESC');
  }

  /**
   * RELATIONS - Récupérer l'historique de modération du document
   * hasMany('document_moderation_historique')
   */
  async getModerationHistorique(documentId) {
    const DocumentModerationHistorique = require('./DocumentModerationHistorique');
    const historique = new DocumentModerationHistorique();
    return await historique.getHistoriqueDocument(documentId);
  }

  /**
   * RELATIONS - Récupérer les PDFs générés depuis ce document
   * hasMany('pdfs')
   */
  async getPdfs(documentId, filtres = {}) {
    const Pdf = require('./Pdf');
    const pdf = new Pdf();
    
    let whereClause = 'document_id = $1 AND statut != $2';
    const params = [documentId, 'SUPPRIME'];
    let paramIndex = 3;

    if (filtres.statut) {
      whereClause += ` AND statut = $${paramIndex}`;
      params.push(filtres.statut);
      paramIndex++;
    }

    return await pdf.findAll(whereClause, params, 'date_creation DESC');
  }

  /**
   * RELATIONS - Récupérer la configuration système/type pour ce document
   * belongsTo('document_systeme_jeu') via (type, systeme_jeu)
   */
  async getConfigurationSysteme(documentId) {
    const document = await this.findById(documentId);
    if (!document) {
      return null;
    }

    const DocumentSystemeJeu = require('./DocumentSystemeJeu');
    const docSysJeu = new DocumentSystemeJeu();
    return await docSysJeu.findByCompositeKey(document.type, document.systeme_jeu);
  }

  /**
   * Statistiques des documents
   * 
   * @param {number} utilisateurId - ID utilisateur (optionnel, pour stats personnelles)
   * @returns {Object} Statistiques détaillées
   */
  async getStatistiques(utilisateurId = null) {
    const db = require('../database/db');
    
    let whereUser = '';
    const params = [];
    let paramIndex = 1;

    if (utilisateurId) {
      whereUser = ` WHERE utilisateur_id = $${paramIndex}`;
      params.push(utilisateurId);
      paramIndex++;
    }

    // Statistiques par type
    const sqlTypes = `
      SELECT type, COUNT(*) as nombre
      FROM documents
      ${whereUser}
      ${whereUser ? 'AND' : 'WHERE'} statut != 'SUPPRIME'
      GROUP BY type
      ORDER BY nombre DESC
    `;
    
    // Statistiques par système
    const sqlSystemes = `
      SELECT systeme_jeu, COUNT(*) as nombre
      FROM documents
      ${whereUser}
      ${whereUser ? 'AND' : 'WHERE'} statut != 'SUPPRIME'
      GROUP BY systeme_jeu
      ORDER BY nombre DESC
    `;
    
    // Statistiques par visibilité
    const sqlVisibilite = `
      SELECT visibilite, COUNT(*) as nombre
      FROM documents
      ${whereUser}
      ${whereUser ? 'AND' : 'WHERE'} statut != 'SUPPRIME'
      GROUP BY visibilite
      ORDER BY nombre DESC
    `;

    const [typesStats, systemesStats, visibiliteStats] = await Promise.all([
      db.all(sqlTypes, params),
      db.all(sqlSystemes, params),
      db.all(sqlVisibilite, params)
    ]);

    return {
      par_type: typesStats,
      par_systeme: systemesStats,
      par_visibilite: visibiliteStats,
      utilisateur_id: utilisateurId,
      date_generation: new Date().toISOString()
    };
  }
}

module.exports = Document;