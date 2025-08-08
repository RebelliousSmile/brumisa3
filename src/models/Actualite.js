const BaseModel = require('./BaseModel');
const Joi = require('joi');

/**
 * Modèle Actualite - Actualités et communications distinctes de Newsletter
 * 
 * Ce modèle gère les actualités du site, distinctes des abonnés newsletter.
 * Les actualités sont des contenus éditoriaux créés par les administrateurs
 * pour informer la communauté des nouveautés, événements et annonces.
 * 
 * Fonctionnalités:
 * - Gestion des actualités avec types et statuts
 * - Planification de publication automatique
 * - Contenu riche avec résumé et contenu complet
 * - Catégorisation par type (nouveauté, mise à jour, événement, annonce)
 * - Workflow éditorial avec brouillon/planifié/publié/archivé
 */
class Actualite extends BaseModel {
  constructor() {
    super('actualites', 'id');
    
    this.fillable = [
      'titre',
      'resume',
      'contenu',
      'auteur_id',
      'type',
      'statut',
      'date_publication',
      'date_fin_affichage',
      'systeme_jeu_lie',
      'image_url',
      'tags',
      'meta_description',
      'slug'
    ];
    
    this.hidden = [];
    
    this.casts = {
      auteur_id: 'integer',
      tags: 'json',
      date_publication: 'date',
      date_fin_affichage: 'date',
      date_creation: 'date',
      date_modification: 'date'
    };
    
    this.timestamps = true;
  }

  /**
   * Types d'actualités disponibles
   */
  static get TYPES() {
    return {
      NOUVEAUTE: 'NOUVEAUTE',
      MISE_A_JOUR: 'MISE_A_JOUR',
      EVENEMENT: 'EVENEMENT',
      ANNONCE: 'ANNONCE',
      TUTORIEL: 'TUTORIEL',
      RETOUR_EXPERIENCE: 'RETOUR_EXPERIENCE'
    };
  }

  /**
   * Statuts de publication disponibles
   */
  static get STATUTS() {
    return {
      BROUILLON: 'BROUILLON',
      PLANIFIE: 'PLANIFIE',
      PUBLIE: 'PUBLIE',
      ARCHIVE: 'ARCHIVE',
      MASQUE: 'MASQUE'
    };
  }

  /**
   * Schema de validation Joi
   */
  getValidationSchema(operation = 'create') {
    const types = Object.values(Actualite.TYPES);
    const statuts = Object.values(Actualite.STATUTS);
    const SystemeJeu = require('./SystemeJeu');
    const systemesValides = [...SystemeJeu.SYSTEMES_SUPPORTES, 'GENERAL'];
    
    const baseSchema = {
      titre: Joi.string().min(5).max(200).required()
        .messages({
          'string.base': 'Le titre doit être une chaîne de caractères',
          'string.min': 'Le titre doit faire au moins 5 caractères',
          'string.max': 'Le titre ne peut pas dépasser 200 caractères',
          'any.required': 'Le titre est requis'
        }),
        
      resume: Joi.string().min(10).max(500).required()
        .messages({
          'string.base': 'Le résumé doit être une chaîne de caractères',
          'string.min': 'Le résumé doit faire au moins 10 caractères',
          'string.max': 'Le résumé ne peut pas dépasser 500 caractères',
          'any.required': 'Le résumé est requis'
        }),
        
      contenu: Joi.string().min(50).required()
        .messages({
          'string.base': 'Le contenu doit être une chaîne de caractères',
          'string.min': 'Le contenu doit faire au moins 50 caractères',
          'any.required': 'Le contenu est requis'
        }),
        
      auteur_id: Joi.number().integer().positive().required()
        .messages({
          'number.base': 'L\'ID auteur doit être un nombre',
          'number.integer': 'L\'ID auteur doit être un entier',
          'number.positive': 'L\'ID auteur doit être positif',
          'any.required': 'L\'auteur est requis'
        }),
        
      type: Joi.string().valid(...types).required()
        .messages({
          'string.base': 'Le type doit être une chaîne de caractères',
          'any.only': `Le type doit être l'un des suivants: ${types.join(', ')}`,
          'any.required': 'Le type est requis'
        }),
        
      statut: Joi.string().valid(...statuts).default(Actualite.STATUTS.BROUILLON)
        .messages({
          'string.base': 'Le statut doit être une chaîne de caractères',
          'any.only': `Le statut doit être l'un des suivants: ${statuts.join(', ')}`
        }),
        
      date_publication: Joi.date().optional()
        .messages({
          'date.base': 'La date de publication doit être une date valide'
        }),
        
      date_fin_affichage: Joi.date().optional()
        .messages({
          'date.base': 'La date de fin d\'affichage doit être une date valide'
        }),
        
      systeme_jeu_lie: Joi.string().valid(...systemesValides).optional().allow('')
        .messages({
          'string.base': 'Le système JDR doit être une chaîne de caractères',
          'any.only': `Le système JDR doit être l'un des suivants: ${systemesValides.join(', ')}`
        }),
        
      image_url: Joi.string().uri().optional().allow('')
        .messages({
          'string.base': 'L\'URL de l\'image doit être une chaîne de caractères',
          'string.uri': 'L\'URL de l\'image doit être une URL valide'
        }),
        
      tags: Joi.array().items(Joi.string().max(50)).max(10).default([])
        .messages({
          'array.base': 'Les tags doivent être un tableau',
          'array.max': 'Maximum 10 tags autorisés',
          'string.max': 'Chaque tag ne peut pas dépasser 50 caractères'
        }),
        
      meta_description: Joi.string().max(160).optional().allow('')
        .messages({
          'string.base': 'La méta-description doit être une chaîne de caractères',
          'string.max': 'La méta-description ne peut pas dépasser 160 caractères'
        }),
        
      slug: Joi.string().pattern(/^[a-z0-9-]+$/).max(100).optional()
        .messages({
          'string.base': 'Le slug doit être une chaîne de caractères',
          'string.pattern.base': 'Le slug ne peut contenir que des lettres minuscules, chiffres et tirets',
          'string.max': 'Le slug ne peut pas dépasser 100 caractères'
        })
    };

    return Joi.object(baseSchema);
  }

  /**
   * Validation métier spécifique
   */
  async businessValidation(data, operation = 'create') {
    // Vérifier que l'auteur existe et a les permissions
    if (data.auteur_id) {
      const Utilisateur = require('./Utilisateur');
      const utilisateur = new Utilisateur();
      const auteur = await utilisateur.findById(data.auteur_id);
      
      if (!auteur) {
        throw new Error('L\'auteur spécifié n\'existe pas');
      }
      
      if (auteur.role !== 'ADMIN' && auteur.role !== 'MODERATEUR') {
        throw new Error('Seuls les administrateurs et modérateurs peuvent créer des actualités');
      }
    }

    // Vérifier la cohérence des dates
    if (data.date_publication && data.date_fin_affichage) {
      const datePublication = new Date(data.date_publication);
      const dateFin = new Date(data.date_fin_affichage);
      
      if (dateFin <= datePublication) {
        throw new Error('La date de fin d\'affichage doit être postérieure à la date de publication');
      }
    }

    // Pour les actualités planifiées, la date de publication est requise
    if (data.statut === Actualite.STATUTS.PLANIFIE && !data.date_publication) {
      throw new Error('Une date de publication est requise pour les actualités planifiées');
    }

    // Vérifier l'unicité du slug si fourni
    if (data.slug) {
      const slugExistant = await this.findOne('slug = $1', [data.slug]);
      if (slugExistant && (operation === 'create' || slugExistant.id !== data.id)) {
        throw new Error('Ce slug est déjà utilisé par une autre actualité');
      }
    }

    return true;
  }

  /**
   * Hook beforeCreate - Générer slug automatique et définir date de publication
   */
  async beforeCreate(data) {
    // Générer un slug automatique si non fourni
    if (!data.slug) {
      data.slug = this.genererSlug(data.titre);
      
      // Vérifier l'unicité du slug généré
      let slugFinal = data.slug;
      let compteur = 1;
      while (await this.findOne('slug = $1', [slugFinal])) {
        slugFinal = `${data.slug}-${compteur}`;
        compteur++;
      }
      data.slug = slugFinal;
    }

    // Si statut PUBLIE sans date de publication, la définir maintenant
    if (data.statut === Actualite.STATUTS.PUBLIE && !data.date_publication) {
      data.date_publication = new Date().toISOString();
    }

    // Générer méta-description automatique si non fournie
    if (!data.meta_description && data.resume) {
      data.meta_description = data.resume.substring(0, 160);
    }

    this.logChange('actualite_create', null, null, {
      titre: data.titre,
      type: data.type,
      statut: data.statut,
      auteur_id: data.auteur_id
    });
    
    return data;
  }

  /**
   * Hook beforeUpdate - Gester les changements de statut
   */
  async beforeUpdate(data) {
    // Si passage en PUBLIE, définir date de publication si non définie
    if (data.statut === Actualite.STATUTS.PUBLIE && !data.date_publication) {
      data.date_publication = new Date().toISOString();
    }

    this.logChange('actualite_update', null, null, data);
    return data;
  }

  /**
   * Générer un slug à partir du titre
   */
  genererSlug(titre) {
    return titre
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
      .replace(/[^a-z0-9\s-]/g, '') // Garder que lettres, chiffres, espaces et tirets
      .trim()
      .replace(/\s+/g, '-') // Remplacer espaces par tirets
      .replace(/-+/g, '-') // Éviter les tirets multiples
      .substring(0, 100); // Limiter la longueur
  }

  /**
   * Récupérer les actualités publiées et visibles
   * 
   * @param {number} limite - Nombre d'actualités à récupérer
   * @param {string} type - Type spécifique (optionnel)
   * @param {string} systeme - Système JDR spécifique (optionnel)
   * @returns {Array} Actualités publiées
   */
  async getActualitesPubliees(limite = 10, type = null, systeme = null) {
    const maintenant = new Date().toISOString();
    let whereClause = `statut = '${Actualite.STATUTS.PUBLIE}' AND date_publication <= '${maintenant}'`;
    let params = [];
    let paramIndex = 1;

    // Exclure les actualités expirées
    whereClause += ` AND (date_fin_affichage IS NULL OR date_fin_affichage > '${maintenant}')`;

    if (type) {
      whereClause += ` AND type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    if (systeme) {
      whereClause += ` AND (systeme_jeu_lie = $${paramIndex} OR systeme_jeu_lie = 'GENERAL' OR systeme_jeu_lie IS NULL OR systeme_jeu_lie = '')`;
      params.push(systeme);
      paramIndex++;
    }

    return await this.findAll(
      whereClause,
      params,
      'date_publication DESC',
      limite
    );
  }

  /**
   * Récupérer une actualité par son slug
   * 
   * @param {string} slug - Slug de l'actualité
   * @returns {Object|null} Actualité trouvée
   */
  async getBySlug(slug) {
    return await this.findOne('slug = $1', [slug]);
  }

  /**
   * Publier les actualités planifiées dont la date de publication est arrivée
   * 
   * @returns {Array} Actualités publiées automatiquement
   */
  async publierActualitesPlanifiees() {
    const maintenant = new Date().toISOString();
    
    // Trouver les actualités planifiées à publier
    const actualitesAPublier = await this.findAll(
      'statut = $1 AND date_publication <= $2',
      [Actualite.STATUTS.PLANIFIE, maintenant]
    );

    const results = [];
    for (const actualite of actualitesAPublier) {
      try {
        const updated = await this.update(actualite.id, {
          statut: Actualite.STATUTS.PUBLIE
        });
        results.push(updated);
      } catch (error) {
        console.error(`Erreur lors de la publication automatique de l'actualité ${actualite.id}:`, error);
      }
    }

    return results;
  }

  /**
   * Archiver les actualités expirées
   * 
   * @returns {Array} Actualités archivées automatiquement
   */
  async archiverActualitesExpirees() {
    const maintenant = new Date().toISOString();
    
    // Trouver les actualités expirées
    const actualitesAArchiver = await this.findAll(
      'statut = $1 AND date_fin_affichage IS NOT NULL AND date_fin_affichage <= $2',
      [Actualite.STATUTS.PUBLIE, maintenant]
    );

    const results = [];
    for (const actualite of actualitesAArchiver) {
      try {
        const updated = await this.update(actualite.id, {
          statut: Actualite.STATUTS.ARCHIVE
        });
        results.push(updated);
      } catch (error) {
        console.error(`Erreur lors de l'archivage automatique de l'actualité ${actualite.id}:`, error);
      }
    }

    return results;
  }

  /**
   * Rechercher dans les actualités
   * 
   * @param {string} recherche - Terme de recherche
   * @param {Object} filtres - Filtres supplémentaires
   * @param {number} limite - Nombre de résultats
   * @returns {Array} Résultats de recherche
   */
  async rechercherActualites(recherche, filtres = {}, limite = 20) {
    const db = require('../database/db');
    
    let whereClause = 'statut = $1';
    const params = [Actualite.STATUTS.PUBLIE];
    let paramIndex = 2;

    // Recherche textuelle
    if (recherche && recherche.trim()) {
      whereClause += ` AND (titre ILIKE $${paramIndex} OR resume ILIKE $${paramIndex} OR contenu ILIKE $${paramIndex})`;
      params.push(`%${recherche.trim()}%`);
      paramIndex++;
    }

    // Filtres additionnels
    if (filtres.type) {
      whereClause += ` AND type = $${paramIndex}`;
      params.push(filtres.type);
      paramIndex++;
    }

    if (filtres.systeme_jeu) {
      whereClause += ` AND (systeme_jeu_lie = $${paramIndex} OR systeme_jeu_lie = 'GENERAL')`;
      params.push(filtres.systeme_jeu);
      paramIndex++;
    }

    if (filtres.tags && filtres.tags.length > 0) {
      whereClause += ` AND tags::text ILIKE ANY($${paramIndex})`;
      params.push(filtres.tags.map(tag => `%${tag}%`));
      paramIndex++;
    }

    const sql = `
      SELECT a.*, u.nom as auteur_nom
      FROM actualites a
      LEFT JOIN utilisateurs u ON a.auteur_id = u.id
      WHERE ${whereClause}
      ORDER BY date_publication DESC
      LIMIT $${paramIndex}
    `;
    params.push(limite);

    const rows = await db.all(sql, params);
    return rows.map(row => this.castAttributes(row));
  }

  /**
   * Obtenir les actualités par auteur
   * 
   * @param {number} auteurId - ID de l'auteur
   * @param {string} statut - Statut spécifique (optionnel)
   * @param {number} limite - Nombre de résultats
   * @returns {Array} Actualités de l'auteur
   */
  async getActualitesParAuteur(auteurId, statut = null, limite = 50) {
    let whereClause = 'auteur_id = $1';
    const params = [auteurId];
    let paramIndex = 2;

    if (statut) {
      whereClause += ` AND statut = $${paramIndex}`;
      params.push(statut);
      paramIndex++;
    }

    return await this.findAll(
      whereClause,
      params,
      'date_creation DESC',
      limite
    );
  }

  /**
   * Statistiques des actualités
   * 
   * @returns {Object} Statistiques détaillées
   */
  async getStatistiques() {
    const db = require('../database/db');
    
    // Statistiques par statut
    const sqlStatuts = `
      SELECT statut, COUNT(*) as nombre
      FROM actualites
      GROUP BY statut
      ORDER BY nombre DESC
    `;
    
    // Statistiques par type
    const sqlTypes = `
      SELECT type, COUNT(*) as nombre
      FROM actualites
      WHERE statut = 'PUBLIE'
      GROUP BY type
      ORDER BY nombre DESC
    `;
    
    // Évolution par mois (12 derniers mois)
    const sqlEvolution = `
      SELECT 
        DATE_TRUNC('month', date_publication) as mois,
        COUNT(*) as nombre_publications
      FROM actualites
      WHERE statut = 'PUBLIE'
        AND date_publication >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', date_publication)
      ORDER BY mois DESC
    `;

    const [statutsStats, typesStats, evolutionStats] = await Promise.all([
      db.all(sqlStatuts),
      db.all(sqlTypes),
      db.all(sqlEvolution)
    ]);

    return {
      par_statut: statutsStats,
      par_type: typesStats,
      evolution_12_mois: evolutionStats,
      date_generation: new Date().toISOString()
    };
  }

  /**
   * Dupliquer une actualité (pour créer une variante)
   * 
   * @param {number} actualiteId - ID de l'actualité à dupliquer
   * @param {number} nouvelAuteurId - ID du nouvel auteur
   * @param {Object} modifications - Modifications à apporter
   * @returns {Object} Nouvelle actualité créée
   */
  async dupliquerActualite(actualiteId, nouvelAuteurId, modifications = {}) {
    const actualiteOriginale = await this.findById(actualiteId);
    
    if (!actualiteOriginale) {
      throw new Error('Actualité originale introuvable');
    }

    const nouvelleActualite = {
      ...actualiteOriginale,
      id: undefined, // Supprimer l'ID pour créer un nouvel enregistrement
      auteur_id: nouvelAuteurId,
      statut: Actualite.STATUTS.BROUILLON,
      date_publication: null,
      slug: null, // Sera généré automatiquement
      titre: `${actualiteOriginale.titre} (copie)`,
      ...modifications
    };

    // Supprimer les champs de timestamp
    delete nouvelleActualite.date_creation;
    delete nouvelleActualite.date_modification;

    return await this.create(nouvelleActualite);
  }
}

module.exports = Actualite;