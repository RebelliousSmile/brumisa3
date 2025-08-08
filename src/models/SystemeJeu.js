const BaseModel = require('./BaseModel');
const Joi = require('joi');

/**
 * Modèle SystemeJeu - Référentiel centralisé des systèmes JDR supportés
 * 
 * Fonctionnalités:
 * - Gestion centralisée des 5 systèmes JDR : monsterhearts, engrenages, metro2033, mistengine, zombiology
 * - Mode maintenance système complet (désactive tout le système)
 * - Structure de données flexible via JSONB pour chaque type de document
 * - Interface visuelle personnalisée (couleur, icône)
 * - Versioning pour compatibilité avec évolutions des systèmes
 * - Référentiel central pour validation des types de documents
 */
class SystemeJeu extends BaseModel {
  constructor() {
    super('systemes_jeu', 'id');
    
    this.fillable = [
      'id', // VARCHAR primary key (ex: monsterhearts, engrenages)
      'nom_complet',
      'description',
      'site_officiel',
      'version_supportee',
      'structure_donnees',
      'statut',
      'message_maintenance',
      'ordre_affichage',
      'couleur_theme',
      'icone'
    ];
    
    this.hidden = [];
    
    this.casts = {
      structure_donnees: 'json',
      ordre_affichage: 'integer',
      date_derniere_maj_structure: 'date',
      date_creation: 'date',
      date_modification: 'date'
    };
    
    this.timestamps = true;
  }

  /**
   * Statuts disponibles pour les systèmes JDR
   */
  static get STATUTS() {
    return {
      ACTIF: 'ACTIF',
      MAINTENANCE: 'MAINTENANCE',
      DEPRECIE: 'DEPRECIE',
      BETA: 'BETA'
    };
  }

  /**
   * IDs des systèmes JDR supportés
   */
  static get SYSTEMES_SUPPORTES() {
    return [
      'monsterhearts',
      'engrenages', 
      'metro2033',
      'mistengine',
      'zombiology'
    ];
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
   * Schema de validation Joi
   */
  getValidationSchema(operation = 'create') {
    const systemes = SystemeJeu.SYSTEMES_SUPPORTES;
    const statuts = Object.values(SystemeJeu.STATUTS);
    
    const baseSchema = {
      id: Joi.string().valid(...systemes).required()
        .messages({
          'string.base': 'L\'ID du système doit être une chaîne de caractères',
          'any.only': `L'ID du système doit être l'un des suivants: ${systemes.join(', ')}`,
          'any.required': 'L\'ID du système est requis'
        }),
        
      nom_complet: Joi.string().min(3).max(100).required()
        .messages({
          'string.base': 'Le nom complet doit être une chaîne de caractères',
          'string.min': 'Le nom complet doit faire au moins 3 caractères',
          'string.max': 'Le nom complet ne peut pas dépasser 100 caractères',
          'any.required': 'Le nom complet est requis'
        }),
        
      description: Joi.string().max(1000).optional().allow('')
        .messages({
          'string.base': 'La description doit être une chaîne de caractères',
          'string.max': 'La description ne peut pas dépasser 1000 caractères'
        }),
        
      site_officiel: Joi.string().uri().optional().allow('')
        .messages({
          'string.base': 'Le site officiel doit être une chaîne de caractères',
          'string.uri': 'Le site officiel doit être une URL valide'
        }),
        
      version_supportee: Joi.string().max(50).optional().allow('')
        .messages({
          'string.base': 'La version supportée doit être une chaîne de caractères',
          'string.max': 'La version supportée ne peut pas dépasser 50 caractères'
        }),
        
      structure_donnees: Joi.object().optional()
        .messages({
          'object.base': 'La structure de données doit être un objet JSON'
        }),
        
      statut: Joi.string().valid(...statuts).default(SystemeJeu.STATUTS.ACTIF)
        .messages({
          'string.base': 'Le statut doit être une chaîne de caractères',
          'any.only': `Le statut doit être l'un des suivants: ${statuts.join(', ')}`
        }),
        
      message_maintenance: Joi.string().max(500).optional().allow('')
        .messages({
          'string.base': 'Le message de maintenance doit être une chaîne de caractères',
          'string.max': 'Le message de maintenance ne peut pas dépasser 500 caractères'
        }),
        
      ordre_affichage: Joi.number().integer().min(0).default(0)
        .messages({
          'number.base': 'L\'ordre d\'affichage doit être un nombre',
          'number.integer': 'L\'ordre d\'affichage doit être un entier',
          'number.min': 'L\'ordre d\'affichage ne peut pas être négatif'
        }),
        
      couleur_theme: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).optional().allow('')
        .messages({
          'string.base': 'La couleur de thème doit être une chaîne de caractères',
          'string.pattern.base': 'La couleur de thème doit être au format hexadécimal (#RRGGBB)'
        }),
        
      icone: Joi.string().max(100).optional().allow('')
        .messages({
          'string.base': 'L\'icône doit être une chaîne de caractères',
          'string.max': 'L\'icône ne peut pas dépasser 100 caractères'
        })
    };

    // Pour les updates, l'ID n'est pas modifiable
    if (operation === 'update') {
      delete baseSchema.id;
    }

    return Joi.object(baseSchema);
  }

  /**
   * Validation métier spécifique
   */
  async businessValidation(data, operation = 'create') {
    // Validation de la structure des données si fournie
    if (data.structure_donnees) {
      const typesDocuments = SystemeJeu.TYPES_DOCUMENTS;
      
      // Vérifier que les types de documents dans la structure sont valides
      Object.keys(data.structure_donnees).forEach(type => {
        if (!typesDocuments.includes(type)) {
          throw new Error(`Type de document invalide dans structure_donnees: ${type}. Types valides: ${typesDocuments.join(', ')}`);
        }
      });
    }

    // Si en maintenance, le message est requis
    if (data.statut === SystemeJeu.STATUTS.MAINTENANCE && (!data.message_maintenance || data.message_maintenance.trim().length === 0)) {
      throw new Error('Un message de maintenance est requis lorsque le système est en maintenance');
    }

    return true;
  }

  /**
   * Hook beforeUpdate - Mettre à jour la date de dernière modification structure si nécessaire
   */
  async beforeUpdate(data) {
    if (data.structure_donnees) {
      data.date_derniere_maj_structure = new Date().toISOString();
    }
    
    this.logChange('systeme_update', null, null, data);
    return data;
  }

  /**
   * Récupérer tous les systèmes actifs (disponibles aux utilisateurs)
   * 
   * @returns {Array} Systèmes avec statut ACTIF uniquement
   */
  async getSystemesActifs() {
    return await this.findAll(
      'statut = $1',
      [SystemeJeu.STATUTS.ACTIF],
      'ordre_affichage ASC, nom_complet ASC'
    );
  }

  /**
   * Récupérer tous les systèmes avec leurs statuts (pour l'admin)
   * 
   * @returns {Array} Tous les systèmes avec leurs statuts
   */
  async getTousSystemes() {
    return await this.findAll(
      '',
      [],
      'ordre_affichage ASC, nom_complet ASC'
    );
  }

  /**
   * Mettre un système en maintenance complète
   * 
   * @param {string} id - ID du système
   * @param {string} message - Message de maintenance
   * @returns {Object} Système mis à jour
   */
  async mettreEnMaintenance(id, message) {
    if (!message || message.trim().length === 0) {
      throw new Error('Un message de maintenance est requis');
    }

    const updateData = {
      statut: SystemeJeu.STATUTS.MAINTENANCE,
      message_maintenance: message
    };

    return await this.update(id, updateData);
  }

  /**
   * Sortir un système de maintenance
   * 
   * @param {string} id - ID du système
   * @returns {Object} Système réactivé
   */
  async sortirMaintenance(id) {
    const updateData = {
      statut: SystemeJeu.STATUTS.ACTIF,
      message_maintenance: ''
    };

    return await this.update(id, updateData);
  }

  /**
   * Mettre à jour la structure de données d'un système
   * 
   * @param {string} id - ID du système
   * @param {Object} nouvelleStructure - Nouvelle structure JSONB
   * @returns {Object} Système mis à jour
   */
  async mettreAJourStructure(id, nouvelleStructure) {
    // Valider que la structure contient des types de documents valides
    if (nouvelleStructure) {
      const typesDocuments = SystemeJeu.TYPES_DOCUMENTS;
      Object.keys(nouvelleStructure).forEach(type => {
        if (!typesDocuments.includes(type)) {
          throw new Error(`Type de document invalide: ${type}. Types valides: ${typesDocuments.join(', ')}`);
        }
      });
    }

    const updateData = {
      structure_donnees: nouvelleStructure,
      date_derniere_maj_structure: new Date().toISOString()
    };

    return await this.update(id, updateData);
  }

  /**
   * Récupérer les informations complètes d'un système
   * 
   * @param {string} id - ID du système
   * @returns {Object|null} Informations du système ou null
   */
  async getSystemeInfo(id) {
    return await this.findById(id);
  }

  /**
   * Vérifier si un système est disponible (actif et non en maintenance)
   * 
   * @param {string} id - ID du système
   * @returns {boolean} True si le système est disponible
   */
  async estDisponible(id) {
    const systeme = await this.findById(id);
    return systeme && systeme.statut === SystemeJeu.STATUTS.ACTIF;
  }

  /**
   * Récupérer la structure de données pour un type de document spécifique
   * 
   * @param {string} systemeId - ID du système
   * @param {string} typeDocument - Type de document
   * @returns {Object|null} Structure pour ce type ou null
   */
  async getStructureDocument(systemeId, typeDocument) {
    const systeme = await this.findById(systemeId);
    
    if (!systeme || !systeme.structure_donnees) {
      return null;
    }
    
    return systeme.structure_donnees[typeDocument] || null;
  }

  /**
   * Mettre à jour l'ordre d'affichage des systèmes
   * 
   * @param {Array} ordres - Tableau d'objets {id, ordre}
   * @returns {Array} Systèmes mis à jour
   */
  async mettreAJourOrdres(ordres) {
    const results = [];
    
    for (const item of ordres) {
      if (!item.id || typeof item.ordre !== 'number') {
        throw new Error('Format invalide pour les ordres. Attendu: [{id: string, ordre: number}]');
      }
      
      const updated = await this.update(item.id, { ordre_affichage: item.ordre });
      results.push(updated);
    }
    
    return results;
  }

  /**
   * Statistiques d'utilisation par système
   * 
   * @returns {Array} Statistiques pour chaque système
   */
  async getStatistiquesUtilisation() {
    const db = require('../database/db');
    
    const sql = `
      SELECT 
        sj.id,
        sj.nom_complet,
        sj.statut,
        sj.couleur_theme,
        COALESCE(doc_stats.nombre_documents, 0) as nombre_documents,
        COALESCE(pdf_stats.nombre_pdfs, 0) as nombre_pdfs,
        COALESCE(perso_stats.nombre_personnages, 0) as nombre_personnages
      FROM systemes_jeu sj
      LEFT JOIN (
        SELECT systeme_jeu, COUNT(*) as nombre_documents
        FROM documents 
        WHERE statut != 'SUPPRIME'
        GROUP BY systeme_jeu
      ) doc_stats ON sj.id = doc_stats.systeme_jeu
      LEFT JOIN (
        SELECT systeme_jeu, COUNT(*) as nombre_pdfs
        FROM pdfs 
        WHERE statut != 'SUPPRIME'
        GROUP BY systeme_jeu
      ) pdf_stats ON sj.id = pdf_stats.systeme_jeu
      LEFT JOIN (
        SELECT systeme_jeu, COUNT(*) as nombre_personnages
        FROM personnages
        GROUP BY systeme_jeu
      ) perso_stats ON sj.id = perso_stats.systeme_jeu
      ORDER BY sj.ordre_affichage ASC, sj.nom_complet ASC
    `;
    
    const rows = await db.all(sql);
    return rows.map(row => this.castAttributes(row));
  }

  /**
   * Configuration par défaut pour les nouveaux systèmes
   */
  static getConfigurationParDefaut() {
    return {
      structure_donnees: {
        CHARACTER: {
          champs_requis: [],
          template_pdf: 'default_character',
          validation_custom: [],
          couleur_theme: '#333333'
        },
        ORGANIZATION: {
          champs_requis: ['nom', 'description'],
          template_pdf: 'default_organization',
          validation_custom: [],
          couleur_theme: '#333333'
        },
        GENERIQUE: {
          champs_requis: ['titre', 'contenu'],
          template_pdf: 'default_generic',
          validation_custom: [],
          couleur_theme: '#333333'
        }
      },
      statut: SystemeJeu.STATUTS.BETA,
      ordre_affichage: 999,
      couleur_theme: '#333333',
      icone: 'fa-gamepad'
    };
  }

  /**
   * RELATIONS - Récupérer tous les documents de ce système JDR
   * hasMany('documents')
   */
  async getDocuments(systemeId, filtres = {}) {
    const Document = require('./Document');
    const document = new Document();
    
    let whereClause = 'systeme_jeu = $1 AND statut != $2';
    const params = [systemeId, 'SUPPRIME'];
    let paramIndex = 3;

    if (filtres.type) {
      whereClause += ` AND type = $${paramIndex}`;
      params.push(filtres.type);
      paramIndex++;
    }

    if (filtres.visibilite) {
      whereClause += ` AND visibilite = $${paramIndex}`;
      params.push(filtres.visibilite);
      paramIndex++;
    }

    return await document.findAll(whereClause, params, 'date_creation DESC');
  }

  /**
   * RELATIONS - Récupérer tous les personnages de ce système JDR
   * hasMany('personnages')
   */
  async getPersonnages(systemeId, filtres = {}) {
    const Personnage = require('./Personnage');
    const personnage = new Personnage();
    
    let whereClause = 'systeme_jeu = $1';
    const params = [systemeId];
    let paramIndex = 2;

    if (filtres.statut) {
      whereClause += ` AND statut = $${paramIndex}`;
      params.push(filtres.statut);
      paramIndex++;
    }

    return await personnage.findAll(whereClause, params, 'date_creation DESC');
  }

  /**
   * RELATIONS - Récupérer tous les PDFs de ce système JDR
   * hasMany('pdfs')
   */
  async getPdfs(systemeId, filtres = {}) {
    const Pdf = require('./Pdf');
    const pdf = new Pdf();
    
    let whereClause = 'systeme_jeu = $1 AND statut != $2';
    const params = [systemeId, 'SUPPRIME'];
    let paramIndex = 3;

    if (filtres.statut) {
      whereClause += ` AND statut = $${paramIndex}`;
      params.push(filtres.statut);
      paramIndex++;
    }

    return await pdf.findAll(whereClause, params, 'date_creation DESC');
  }

  /**
   * RELATIONS - Récupérer les configurations de types pour ce système
   * hasMany('document_systeme_jeu')
   */
  async getDocumentSystemeJeu(systemeId) {
    const DocumentSystemeJeu = require('./DocumentSystemeJeu');
    const docSysJeu = new DocumentSystemeJeu();
    return await docSysJeu.getTypesDisponibles(systemeId);
  }

  /**
   * RELATIONS - Récupérer uniquement les types actifs pour ce système
   */
  async getTypesActifs(systemeId) {
    const DocumentSystemeJeu = require('./DocumentSystemeJeu');
    const docSysJeu = new DocumentSystemeJeu();
    return await docSysJeu.getTypesActifs(systemeId);
  }

  /**
   * Initialiser les données des systèmes par défaut
   * 
   * @returns {Array} Systèmes créés
   */
  async initialiserSystemesDefaut() {
    const systemesDefaut = [
      {
        id: 'monsterhearts',
        nom_complet: 'Monsterhearts',
        description: 'Un jeu sur l\'adolescence monstrueuse et les émotions interdites',
        site_officiel: 'https://www.mongoosepublishing.com/products/monsterhearts-2',
        version_supportee: '2.0',
        couleur_theme: '#8B0000',
        icone: 'fa-heart-broken',
        ordre_affichage: 1,
        structure_donnees: {
          CHARACTER: {
            champs_requis: ['skin', 'hot', 'cold', 'volatile', 'dark'],
            template_pdf: 'monsterhearts_character',
            validation_custom: ['skin_valide', 'stats_equilibrees']
          },
          TOWN: {
            champs_requis: ['nom', 'description', 'lieux'],
            template_pdf: 'monsterhearts_town'
          },
          GROUP: {
            champs_requis: ['nom', 'type', 'membres'],
            template_pdf: 'monsterhearts_group'
          }
        }
      },
      {
        id: 'engrenages',
        nom_complet: 'Engrenages & Sortilèges',
        description: 'Fantasy steampunk dans un monde de magie et de technologie',
        version_supportee: '3.0',
        couleur_theme: '#2F4F4F',
        icone: 'fa-cogs',
        ordre_affichage: 2
      },
      {
        id: 'metro2033',
        nom_complet: 'Metro 2033',
        description: 'Survie post-apocalyptique dans le métro de Moscou',
        version_supportee: '1.0',
        couleur_theme: '#DC143C',
        icone: 'fa-subway',
        ordre_affichage: 3
      },
      {
        id: 'mistengine',
        nom_complet: 'Mist Engine',
        description: 'Système générique pour univers mystiques et poétiques',
        version_supportee: '1.5',
        couleur_theme: '#9370DB',
        icone: 'fa-cloud',
        ordre_affichage: 4
      },
      {
        id: 'zombiology',
        nom_complet: 'Zombiology',
        description: 'Survival horror dans un monde envahi par les zombies',
        version_supportee: '2.1',
        couleur_theme: '#DAA520',
        icone: 'fa-biohazard',
        ordre_affichage: 5
      }
    ];

    const results = [];
    
    for (const systemeData of systemesDefaut) {
      try {
        const existing = await this.findById(systemeData.id);
        if (!existing) {
          const created = await this.create({
            ...SystemeJeu.getConfigurationParDefaut(),
            ...systemeData
          });
          results.push(created);
        } else {
          results.push(existing);
        }
      } catch (error) {
        throw new Error(`Erreur lors de l'initialisation du système ${systemeData.id}: ${error.message}`);
      }
    }
    
    return results;
  }
}

module.exports = SystemeJeu;