const BaseModel = require('./BaseModel');
const Joi = require('joi');

/**
 * Modèle UniversJeu - Gestion des univers de jeu
 * 
 * Un univers représente un cadre de jeu spécifique utilisant un système donné.
 * Par exemple : Monsterhearts (univers) utilise PBTA (système)
 */
class UniversJeu extends BaseModel {
  constructor() {
    super('univers_jeu', 'id');
    
    this.fillable = [
      'id',
      'nom_complet',
      'description',
      'editeur',
      'annee_sortie',
      'site_officiel',
      'systeme_jeu',
      'configuration',
      'structure_donnees',
      'statut',
      'message_maintenance',
      'ordre_affichage',
      'couleur_theme',
      'couleur_accent',
      'icone',
      'image_hero',
      'tags',
      'version_supportee',
      'langue_principale',
      'langues_disponibles'
    ];
    
    this.hidden = [];
    
    this.casts = {
      configuration: 'json',
      structure_donnees: 'json',
      tags: 'array',
      langues_disponibles: 'array',
      annee_sortie: 'integer',
      ordre_affichage: 'integer',
      date_creation: 'date',
      date_modification: 'date',
      date_derniere_maj_structure: 'date'
    };
    
    this.timestamps = true;
  }

  /**
   * Statuts disponibles pour les univers
   */
  static get STATUTS() {
    return {
      ACTIF: 'ACTIF',
      MAINTENANCE: 'MAINTENANCE',
      BETA: 'BETA',
      ARCHIVE: 'ARCHIVE'
    };
  }

  /**
   * Mapping des univers vers les systèmes
   */
  static get UNIVERS_MAPPING() {
    return {
      // PBTA
      'monsterhearts': 'pbta',
      'urban_shadows': 'pbta',
      
      // Engrenages
      'roue_du_temps': 'engrenages',
      'ecryme': 'engrenages',
      
      // Mist Engine
      'obojima': 'mistengine',
      'zamanora': 'mistengine',
      'post_mortem': 'mistengine',
      'otherscape': 'mistengine',
      
      // MYZ
      'metro2033': 'myz',
      
      // Zombiology (standalone)
      'zombiology': 'zombiology'
    };
  }

  /**
   * Liste des univers supportés
   */
  static get UNIVERS_SUPPORTES() {
    return Object.keys(UniversJeu.UNIVERS_MAPPING);
  }

  /**
   * Schema de validation Joi
   */
  getValidationSchema(operation = 'create') {
    const univers = UniversJeu.UNIVERS_SUPPORTES;
    const statuts = Object.values(UniversJeu.STATUTS);
    
    const baseSchema = {
      id: Joi.string().valid(...univers).required()
        .messages({
          'string.base': 'L\'ID de l\'univers doit être une chaîne de caractères',
          'any.only': `L'ID de l'univers doit être l'un des suivants: ${univers.join(', ')}`,
          'any.required': 'L\'ID de l\'univers est requis'
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
        
      editeur: Joi.string().max(255).optional().allow('')
        .messages({
          'string.base': 'L\'éditeur doit être une chaîne de caractères',
          'string.max': 'L\'éditeur ne peut pas dépasser 255 caractères'
        }),
        
      annee_sortie: Joi.number().integer().min(1970).max(new Date().getFullYear()).optional()
        .messages({
          'number.base': 'L\'année de sortie doit être un nombre',
          'number.integer': 'L\'année de sortie doit être un entier',
          'number.min': 'L\'année de sortie ne peut pas être avant 1970',
          'number.max': 'L\'année de sortie ne peut pas être dans le futur'
        }),
        
      site_officiel: Joi.string().uri().optional().allow('')
        .messages({
          'string.base': 'Le site officiel doit être une chaîne de caractères',
          'string.uri': 'Le site officiel doit être une URL valide'
        }),
        
      systeme_jeu: Joi.string().required()
        .messages({
          'string.base': 'Le système de jeu doit être une chaîne de caractères',
          'any.required': 'Le système de jeu est requis'
        }),
        
      configuration: Joi.object().optional()
        .messages({
          'object.base': 'La configuration doit être un objet JSON'
        }),
        
      structure_donnees: Joi.object().optional()
        .messages({
          'object.base': 'La structure de données doit être un objet JSON'
        }),
        
      statut: Joi.string().valid(...statuts).default(UniversJeu.STATUTS.ACTIF)
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
        
      couleur_accent: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).optional().allow('')
        .messages({
          'string.base': 'La couleur d\'accent doit être une chaîne de caractères',
          'string.pattern.base': 'La couleur d\'accent doit être au format hexadécimal (#RRGGBB)'
        }),
        
      icone: Joi.string().max(100).optional().allow('')
        .messages({
          'string.base': 'L\'icône doit être une chaîne de caractères',
          'string.max': 'L\'icône ne peut pas dépasser 100 caractères'
        }),
        
      image_hero: Joi.string().max(500).optional().allow('')
        .messages({
          'string.base': 'L\'image hero doit être une chaîne de caractères',
          'string.max': 'L\'image hero ne peut pas dépasser 500 caractères'
        }),
        
      tags: Joi.array().items(Joi.string()).optional()
        .messages({
          'array.base': 'Les tags doivent être un tableau'
        }),
        
      version_supportee: Joi.string().max(50).optional().allow('')
        .messages({
          'string.base': 'La version supportée doit être une chaîne de caractères',
          'string.max': 'La version supportée ne peut pas dépasser 50 caractères'
        }),
        
      langue_principale: Joi.string().length(2).default('fr')
        .messages({
          'string.base': 'La langue principale doit être une chaîne de caractères',
          'string.length': 'La langue principale doit être un code ISO à 2 lettres'
        }),
        
      langues_disponibles: Joi.array().items(Joi.string().length(2)).optional()
        .messages({
          'array.base': 'Les langues disponibles doivent être un tableau'
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
    // Vérifier la cohérence univers/système
    if (data.id && data.systeme_jeu) {
      const expectedSysteme = UniversJeu.UNIVERS_MAPPING[data.id];
      if (expectedSysteme && expectedSysteme !== data.systeme_jeu) {
        throw new Error(`L'univers ${data.id} doit utiliser le système ${expectedSysteme}`);
      }
    }

    // Si en maintenance, le message est requis
    if (data.statut === UniversJeu.STATUTS.MAINTENANCE && (!data.message_maintenance || data.message_maintenance.trim().length === 0)) {
      throw new Error('Un message de maintenance est requis lorsque l\'univers est en maintenance');
    }

    // Vérifier que le système existe
    if (data.systeme_jeu) {
      const SystemeJeu = require('./SystemeJeu');
      const systeme = new SystemeJeu();
      const systemeExist = await systeme.findById(data.systeme_jeu);
      if (!systemeExist) {
        throw new Error(`Le système de jeu ${data.systeme_jeu} n'existe pas`);
      }
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
    
    return data;
  }

  /**
   * Récupérer le système de jeu associé
   */
  async getSysteme() {
    const SystemeJeu = require('./SystemeJeu');
    const systeme = new SystemeJeu();
    return await systeme.findById(this.systeme_jeu);
  }

  /**
   * Récupérer tous les univers actifs
   */
  async getUniversActifs() {
    return await this.findAll(
      'statut = $1',
      [UniversJeu.STATUTS.ACTIF],
      'ordre_affichage ASC, nom_complet ASC'
    );
  }

  /**
   * Récupérer les univers d'un système spécifique
   */
  async getUniversParSysteme(systemeId, includeInactive = false) {
    let whereClause = 'systeme_jeu = $1';
    const params = [systemeId];

    if (!includeInactive) {
      whereClause += ' AND statut = $2';
      params.push(UniversJeu.STATUTS.ACTIF);
    }

    return await this.findAll(
      whereClause,
      params,
      'ordre_affichage ASC, nom_complet ASC'
    );
  }

  /**
   * Mettre un univers en maintenance
   */
  async mettreEnMaintenance(id, message) {
    if (!message || message.trim().length === 0) {
      throw new Error('Un message de maintenance est requis');
    }

    const updateData = {
      statut: UniversJeu.STATUTS.MAINTENANCE,
      message_maintenance: message
    };

    return await this.update(id, updateData);
  }

  /**
   * Sortir un univers de maintenance
   */
  async sortirMaintenance(id) {
    const updateData = {
      statut: UniversJeu.STATUTS.ACTIF,
      message_maintenance: ''
    };

    return await this.update(id, updateData);
  }

  /**
   * RELATIONS - Récupérer tous les documents de cet univers
   */
  async getDocuments(universId, filtres = {}) {
    const Document = require('./Document');
    const document = new Document();
    
    let whereClause = 'univers_jeu = $1 AND statut != $2';
    const params = [universId, 'SUPPRIME'];
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
   * RELATIONS - Récupérer tous les oracles de cet univers
   */
  async getOracles(universId, includeInactive = false) {
    const Oracle = require('./Oracle');
    const oracle = new Oracle();
    
    let whereClause = 'univers_jeu = $1';
    const params = [universId];

    if (!includeInactive) {
      whereClause += ' AND is_active = $2';
      params.push(true);
    }

    return await oracle.findAll(whereClause, params, 'name ASC');
  }

  /**
   * RELATIONS - Récupérer tous les personnages de cet univers
   */
  async getPersonnages(universId, filtres = {}) {
    const Personnage = require('./Personnage');
    const personnage = new Personnage();
    
    let whereClause = 'univers_jeu = $1';
    const params = [universId];
    let paramIndex = 2;

    if (filtres.statut) {
      whereClause += ` AND statut = $${paramIndex}`;
      params.push(filtres.statut);
      paramIndex++;
    }

    return await personnage.findAll(whereClause, params, 'date_creation DESC');
  }

  /**
   * RELATIONS - Récupérer tous les PDFs de cet univers
   */
  async getPdfs(universId, filtres = {}) {
    const Pdf = require('./Pdf');
    const pdf = new Pdf();
    
    let whereClause = 'univers_jeu = $1 AND statut != $2';
    const params = [universId, 'SUPPRIME'];
    let paramIndex = 3;

    if (filtres.statut) {
      whereClause += ` AND statut = $${paramIndex}`;
      params.push(filtres.statut);
      paramIndex++;
    }

    return await pdf.findAll(whereClause, params, 'date_creation DESC');
  }

  /**
   * Vérifier si un univers est disponible
   */
  async estDisponible(id) {
    const univers = await this.findById(id);
    return univers && univers.statut === UniversJeu.STATUTS.ACTIF;
  }

  /**
   * Statistiques d'utilisation par univers
   */
  async getStatistiquesUtilisation() {
    const db = require('../database/db');
    
    const sql = `
      SELECT 
        uj.id,
        uj.nom_complet,
        uj.statut,
        uj.systeme_jeu,
        uj.couleur_theme,
        COALESCE(doc_stats.nombre_documents, 0) as nombre_documents,
        COALESCE(oracle_stats.nombre_oracles, 0) as nombre_oracles,
        COALESCE(pdf_stats.nombre_pdfs, 0) as nombre_pdfs,
        COALESCE(perso_stats.nombre_personnages, 0) as nombre_personnages
      FROM univers_jeu uj
      LEFT JOIN (
        SELECT univers_jeu, COUNT(*) as nombre_documents
        FROM documents 
        WHERE statut != 'SUPPRIME'
        GROUP BY univers_jeu
      ) doc_stats ON uj.id = doc_stats.univers_jeu
      LEFT JOIN (
        SELECT univers_jeu, COUNT(*) as nombre_oracles
        FROM oracles 
        WHERE is_active = true
        GROUP BY univers_jeu
      ) oracle_stats ON uj.id = oracle_stats.univers_jeu
      LEFT JOIN (
        SELECT univers_jeu, COUNT(*) as nombre_pdfs
        FROM pdfs 
        WHERE statut != 'SUPPRIME'
        GROUP BY univers_jeu
      ) pdf_stats ON uj.id = pdf_stats.univers_jeu
      LEFT JOIN (
        SELECT univers_jeu, COUNT(*) as nombre_personnages
        FROM personnages
        GROUP BY univers_jeu
      ) perso_stats ON uj.id = perso_stats.univers_jeu
      ORDER BY uj.ordre_affichage ASC, uj.nom_complet ASC
    `;
    
    const rows = await db.all(sql);
    return rows.map(row => this.castAttributes(row));
  }

  /**
   * Configuration par défaut pour les nouveaux univers
   */
  static getConfigurationParDefaut() {
    return {
      configuration: {
        features: {
          has_magic: false,
          has_technology: false,
          has_supernatural: false,
          has_factions: false
        },
        gameplay: {
          player_count: { min: 2, max: 6 },
          session_duration: '3-4 heures',
          difficulty: 'intermediate',
          tone: []
        },
        pdf_templates: {},
        display: {
          hero_gradient: '',
          cta_gradient: '',
          image_filter: '',
          title_text: '',
          subtitle_text: ''
        }
      },
      structure_donnees: {},
      statut: UniversJeu.STATUTS.BETA,
      ordre_affichage: 999,
      couleur_theme: '#333333',
      icone: 'fa-dice'
    };
  }

  /**
   * Initialiser les données des univers par défaut
   */
  async initialiserUniversDefaut() {
    const universDefaut = [
      // PBTA
      {
        id: 'monsterhearts',
        nom_complet: 'Monsterhearts 2',
        description: 'Jeu de rôle sur les adolescents monstres, explorant les thèmes de l\'adolescence et de l\'identité',
        editeur: 'Buried Without Ceremony',
        annee_sortie: 2017,
        site_officiel: 'https://buriedwithoutceremony.com/monsterhearts',
        systeme_jeu: 'pbta',
        couleur_theme: '#8B0000',
        couleur_accent: '#DC143C',
        icone: 'fa-heart-broken',
        ordre_affichage: 1,
        tags: ['horror', 'teen', 'romance', 'drama'],
        configuration: {
          features: {
            has_magic: true,
            has_supernatural: true,
            has_factions: true
          },
          gameplay: {
            tone: ['dark', 'romantic', 'horror']
          }
        }
      },
      {
        id: 'urban_shadows',
        nom_complet: 'Urban Shadows',
        description: 'Politique urbaine et surnaturel dans les villes modernes',
        editeur: 'Magpie Games',
        annee_sortie: 2018,
        systeme_jeu: 'pbta',
        couleur_theme: '#2F4F4F',
        couleur_accent: '#708090',
        icone: 'fa-city',
        ordre_affichage: 2,
        tags: ['urban', 'politics', 'supernatural']
      },
      
      // Engrenages
      {
        id: 'roue_du_temps',
        nom_complet: 'La Roue du Temps',
        description: 'Adaptation du monde de Robert Jordan',
        editeur: 'Black Book Editions',
        annee_sortie: 2020,
        systeme_jeu: 'engrenages',
        couleur_theme: '#8B4513',
        couleur_accent: '#D2691E',
        icone: 'fa-dharmachakra',
        ordre_affichage: 3,
        tags: ['fantasy', 'epic', 'magic']
      },
      {
        id: 'ecryme',
        nom_complet: 'Ecryme 1880',
        description: 'Steampunk victorien dans une Londres alternative',
        editeur: 'Sans-Détour',
        annee_sortie: 2019,
        systeme_jeu: 'engrenages',
        couleur_theme: '#4B0082',
        couleur_accent: '#6A5ACD',
        icone: 'fa-cogs',
        ordre_affichage: 4,
        tags: ['steampunk', 'victorian', 'mystery']
      },
      
      // Mist Engine
      {
        id: 'obojima',
        nom_complet: 'Obojima',
        description: 'Japon féodal fantastique',
        editeur: 'Korentin Games',
        annee_sortie: 2021,
        systeme_jeu: 'mistengine',
        couleur_theme: '#DC143C',
        couleur_accent: '#FF69B4',
        icone: 'fa-torii-gate',
        ordre_affichage: 5,
        tags: ['japan', 'fantasy', 'samurai']
      },
      {
        id: 'zamanora',
        nom_complet: 'Zamanora',
        description: 'Fantasy onirique et mystique',
        editeur: 'Korentin Games',
        annee_sortie: 2022,
        systeme_jeu: 'mistengine',
        couleur_theme: '#663399',
        couleur_accent: '#9370DB',
        icone: 'fa-moon',
        ordre_affichage: 6,
        tags: ['dream', 'mystic', 'fantasy']
      },
      {
        id: 'post_mortem',
        nom_complet: 'Post-Mortem',
        description: 'Enquêtes surnaturelles après la mort',
        editeur: 'Korentin Games',
        annee_sortie: 2023,
        systeme_jeu: 'mistengine',
        couleur_theme: '#191970',
        couleur_accent: '#4169E1',
        icone: 'fa-skull',
        ordre_affichage: 7,
        tags: ['afterlife', 'mystery', 'supernatural']
      },
      {
        id: 'otherscape',
        nom_complet: 'Tokyo:Otherscape',
        description: 'Tokyo moderne avec créatures surnaturelles',
        editeur: 'Korentin Games',
        annee_sortie: 2023,
        systeme_jeu: 'mistengine',
        couleur_theme: '#FF1493',
        couleur_accent: '#FF69B4',
        icone: 'fa-torii-gate',
        ordre_affichage: 8,
        tags: ['modern', 'tokyo', 'yokai']
      },
      
      // MYZ
      {
        id: 'metro2033',
        nom_complet: 'Metro 2033',
        description: 'Survie dans le métro de Moscou post-apocalyptique',
        editeur: 'Modiphius',
        annee_sortie: 2021,
        systeme_jeu: 'myz',
        couleur_theme: '#2F4F4F',
        couleur_accent: '#696969',
        icone: 'fa-radiation',
        ordre_affichage: 9,
        tags: ['post-apocalyptic', 'survival', 'russia']
      },
      
      // Zombiology
      {
        id: 'zombiology',
        nom_complet: 'Zombiology',
        description: 'Survival horror contre les zombies',
        editeur: 'Indie',
        annee_sortie: 2020,
        systeme_jeu: 'zombiology',
        couleur_theme: '#8B0000',
        couleur_accent: '#B22222',
        icone: 'fa-biohazard',
        ordre_affichage: 10,
        tags: ['zombie', 'survival', 'horror']
      }
    ];

    const results = [];
    
    for (const universData of universDefaut) {
      try {
        const existing = await this.findById(universData.id);
        if (!existing) {
          const created = await this.create({
            ...UniversJeu.getConfigurationParDefaut(),
            ...universData
          });
          results.push(created);
        } else {
          results.push(existing);
        }
      } catch (error) {
        throw new Error(`Erreur lors de l'initialisation de l'univers ${universData.id}: ${error.message}`);
      }
    }
    
    return results;
  }
}

module.exports = UniversJeu;