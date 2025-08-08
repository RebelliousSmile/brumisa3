const BaseModel = require('./BaseModel');
const Joi = require('joi');
const crypto = require('crypto');

/**
 * Modèle DemandeChangementEmail - Changements d'email sécurisés avec double validation
 * 
 * Fonctionnalités:
 * - Changement d'email sécurisé avec tokens temporaires
 * - Double validation : ancien email + nouveau email
 * - Expiration automatique des demandes (15 jours)
 * - Historique complet des changements demandés
 * - Sécurité renforcée avec IP tracking et limitations
 */
class DemandeChangementEmail extends BaseModel {
  constructor() {
    super('demandes_changement_email', 'id');
    
    this.fillable = [
      'utilisateur_id',
      'ancien_email',
      'nouvel_email',
      'token_validation',
      'statut',
      'ip_demande',
      'user_agent',
      'motif_demande'
    ];
    
    this.hidden = ['token_validation', 'ip_demande', 'user_agent']; // Données sensibles
    
    this.casts = {
      utilisateur_id: 'integer',
      date_demande: 'date',
      date_expiration: 'date',
      date_validation: 'date'
    };
    
    this.timestamps = false; // Gestion manuelle des dates
  }

  /**
   * Statuts disponibles pour les demandes de changement
   */
  static get STATUTS() {
    return {
      EN_ATTENTE: 'EN_ATTENTE',
      VALIDE: 'VALIDE',
      EXPIRE: 'EXPIRE',
      ANNULE: 'ANNULE',
      ECHEC: 'ECHEC'
    };
  }

  /**
   * Durée de validité d'un token en jours
   */
  static get DUREE_VALIDITE_JOURS() {
    return 15;
  }

  /**
   * Schema de validation Joi
   */
  getValidationSchema(operation = 'create') {
    const statuts = Object.values(DemandeChangementEmail.STATUTS);
    
    const baseSchema = {
      utilisateur_id: Joi.number().integer().positive().required()
        .messages({
          'number.base': 'L\'ID utilisateur doit être un nombre',
          'number.integer': 'L\'ID utilisateur doit être un entier',
          'number.positive': 'L\'ID utilisateur doit être positif',
          'any.required': 'L\'ID utilisateur est requis'
        }),
        
      ancien_email: Joi.string().email().required()
        .messages({
          'string.base': 'L\'ancien email doit être une chaîne de caractères',
          'string.email': 'L\'ancien email doit être un email valide',
          'any.required': 'L\'ancien email est requis'
        }),
        
      nouvel_email: Joi.string().email().required()
        .messages({
          'string.base': 'Le nouvel email doit être une chaîne de caractères',
          'string.email': 'Le nouvel email doit être un email valide',
          'any.required': 'Le nouvel email est requis'
        }),
        
      token_validation: Joi.string().length(64).optional()
        .messages({
          'string.base': 'Le token doit être une chaîne de caractères',
          'string.length': 'Le token doit faire exactement 64 caractères'
        }),
        
      statut: Joi.string().valid(...statuts).default(DemandeChangementEmail.STATUTS.EN_ATTENTE)
        .messages({
          'string.base': 'Le statut doit être une chaîne de caractères',
          'any.only': `Le statut doit être l'un des suivants: ${statuts.join(', ')}`
        }),
        
      ip_demande: Joi.string().ip().required()
        .messages({
          'string.base': 'L\'adresse IP doit être une chaîne de caractères',
          'string.ip': 'L\'adresse IP doit être valide',
          'any.required': 'L\'adresse IP est requise pour la sécurité'
        }),
        
      user_agent: Joi.string().max(1000).optional().allow('')
        .messages({
          'string.base': 'Le User-Agent doit être une chaîne de caractères',
          'string.max': 'Le User-Agent ne peut pas dépasser 1000 caractères'
        }),
        
      motif_demande: Joi.string().max(500).optional().allow('')
        .messages({
          'string.base': 'Le motif doit être une chaîne de caractères',
          'string.max': 'Le motif ne peut pas dépasser 500 caractères'
        })
    };

    return Joi.object(baseSchema);
  }

  /**
   * Validation métier spécifique
   */
  async businessValidation(data, operation = 'create') {
    // Vérifier que l'utilisateur existe
    if (data.utilisateur_id) {
      const Utilisateur = require('./Utilisateur');
      const utilisateur = new Utilisateur();
      const user = await utilisateur.findById(data.utilisateur_id);
      
      if (!user) {
        throw new Error('L\'utilisateur spécifié n\'existe pas');
      }
      
      // Vérifier que l'ancien email correspond à celui de l'utilisateur
      if (data.ancien_email && user.email !== data.ancien_email) {
        throw new Error('L\'ancien email ne correspond pas à l\'email actuel de l\'utilisateur');
      }
    }

    // Vérifier que le nouvel email n'est pas déjà utilisé
    if (data.nouvel_email && operation === 'create') {
      const Utilisateur = require('./Utilisateur');
      const utilisateur = new Utilisateur();
      const existingUser = await utilisateur.findOne('email = $1', [data.nouvel_email]);
      
      if (existingUser) {
        throw new Error('Le nouvel email est déjà utilisé par un autre compte');
      }
    }

    // Vérifier qu'il n'y a pas déjà une demande en cours
    if (operation === 'create' && data.utilisateur_id) {
      const demandeEnCours = await this.findOne(
        'utilisateur_id = $1 AND statut = $2',
        [data.utilisateur_id, DemandeChangementEmail.STATUTS.EN_ATTENTE]
      );
      
      if (demandeEnCours) {
        throw new Error('Il existe déjà une demande de changement d\'email en cours pour cet utilisateur');
      }
    }

    return true;
  }

  /**
   * Hook beforeCreate - Générer le token et définir les dates
   */
  async beforeCreate(data) {
    const maintenant = new Date();
    const expiration = new Date(maintenant.getTime() + (DemandeChangementEmail.DUREE_VALIDITE_JOURS * 24 * 60 * 60 * 1000));
    
    data.date_demande = maintenant.toISOString();
    data.date_expiration = expiration.toISOString();
    
    // Générer un token sécurisé
    if (!data.token_validation) {
      data.token_validation = this.genererTokenSecurise();
    }
    
    this.logChange('email_change_request', null, null, {
      utilisateur_id: data.utilisateur_id,
      ancien_email: data.ancien_email,
      nouvel_email: data.nouvel_email,
      ip: data.ip_demande
    });
    
    return data;
  }

  /**
   * Générer un token de validation sécurisé
   * 
   * @returns {string} Token hexadécimal 64 caractères
   */
  genererTokenSecurise() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Demander un changement d'email
   * 
   * @param {number} userId - ID de l'utilisateur
   * @param {string} nouvelEmail - Nouvel email souhaité
   * @param {string} ip - Adresse IP de la demande
   * @param {Object} metadata - Métadonnées supplémentaires
   * @returns {Object} Demande créée
   */
  async demanderChangement(userId, nouvelEmail, ip, metadata = {}) {
    // Récupérer l'utilisateur pour obtenir l'ancien email
    const Utilisateur = require('./Utilisateur');
    const utilisateur = new Utilisateur();
    const user = await utilisateur.findById(userId);
    
    if (!user) {
      throw new Error('Utilisateur introuvable');
    }

    const demandeData = {
      utilisateur_id: userId,
      ancien_email: user.email,
      nouvel_email: nouvelEmail,
      ip_demande: ip,
      user_agent: metadata.user_agent || '',
      motif_demande: metadata.motif || 'Changement d\'email demandé par l\'utilisateur'
    };

    return await this.create(demandeData);
  }

  /**
   * Valider un changement d'email avec le token
   * 
   * @param {string} token - Token de validation
   * @returns {Object} Résultat de la validation
   */
  async validerChangement(token) {
    if (!token || token.length !== 64) {
      throw new Error('Token invalide');
    }

    // Trouver la demande correspondante
    const demande = await this.findOne(
      'token_validation = $1 AND statut = $2',
      [token, DemandeChangementEmail.STATUTS.EN_ATTENTE]
    );

    if (!demande) {
      throw new Error('Token introuvable ou demande déjà traitée');
    }

    // Vérifier l'expiration
    const maintenant = new Date();
    const expiration = new Date(demande.date_expiration);
    
    if (maintenant > expiration) {
      // Marquer comme expiré
      await this.marquerCommeExpire(demande.id);
      throw new Error('Le token a expiré');
    }

    try {
      // Effectuer le changement d'email
      const Utilisateur = require('./Utilisateur');
      const utilisateur = new Utilisateur();
      await utilisateur.update(demande.utilisateur_id, { 
        email: demande.nouvel_email 
      });

      // Marquer la demande comme validée
      await this.marquerCommeValide(demande.id);

      return {
        success: true,
        message: 'Email changé avec succès',
        ancien_email: demande.ancien_email,
        nouvel_email: demande.nouvel_email,
        utilisateur_id: demande.utilisateur_id
      };

    } catch (error) {
      // Marquer comme échec
      await this.marquerCommeEchec(demande.id, error.message);
      throw new Error(`Erreur lors du changement d'email: ${error.message}`);
    }
  }

  /**
   * Annuler une demande de changement d'email
   * 
   * @param {number} userId - ID de l'utilisateur (pour vérifier les permissions)
   * @param {number} demandeId - ID de la demande (optionnel)
   * @returns {Object} Demande annulée
   */
  async annulerDemande(userId, demandeId = null) {
    let demande;
    
    if (demandeId) {
      demande = await this.findById(demandeId);
      if (!demande) {
        throw new Error('Demande introuvable');
      }
      
      // Vérifier que la demande appartient à l'utilisateur
      if (demande.utilisateur_id !== userId) {
        throw new Error('Vous ne pouvez annuler que vos propres demandes');
      }
    } else {
      // Trouver la demande en cours pour cet utilisateur
      demande = await this.findOne(
        'utilisateur_id = $1 AND statut = $2',
        [userId, DemandeChangementEmail.STATUTS.EN_ATTENTE]
      );
      
      if (!demande) {
        throw new Error('Aucune demande en cours trouvée pour cet utilisateur');
      }
    }

    if (demande.statut !== DemandeChangementEmail.STATUTS.EN_ATTENTE) {
      throw new Error('Seules les demandes en attente peuvent être annulées');
    }

    return await this.marquerCommeAnnule(demande.id);
  }

  /**
   * Marquer une demande comme validée
   */
  async marquerCommeValide(demandeId) {
    const updateData = {
      statut: DemandeChangementEmail.STATUTS.VALIDE,
      date_validation: new Date().toISOString()
    };
    
    return await this.updateDemande(demandeId, updateData);
  }

  /**
   * Marquer une demande comme expirée
   */
  async marquerCommeExpire(demandeId) {
    const updateData = {
      statut: DemandeChangementEmail.STATUTS.EXPIRE
    };
    
    return await this.updateDemande(demandeId, updateData);
  }

  /**
   * Marquer une demande comme annulée
   */
  async marquerCommeAnnule(demandeId) {
    const updateData = {
      statut: DemandeChangementEmail.STATUTS.ANNULE
    };
    
    return await this.updateDemande(demandeId, updateData);
  }

  /**
   * Marquer une demande comme ayant échoué
   */
  async marquerCommeEchec(demandeId, motifEchec) {
    const updateData = {
      statut: DemandeChangementEmail.STATUTS.ECHEC,
      motif_echec: motifEchec
    };
    
    return await this.updateDemande(demandeId, updateData);
  }

  /**
   * Méthode interne pour mettre à jour une demande
   */
  async updateDemande(demandeId, data) {
    const db = require('../database/db');
    
    const fields = Object.keys(data);
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    const values = [demandeId, ...Object.values(data)];

    const sql = `UPDATE ${this.tableName} SET ${setClause} WHERE id = $1 RETURNING *`;
    const row = await db.get(sql, values);
    
    return row ? this.castAttributes(row) : null;
  }

  /**
   * Nettoyer les demandes expirées automatiquement
   * 
   * @returns {number} Nombre de demandes marquées comme expirées
   */
  async nettoyerDemandesExpirees() {
    const maintenant = new Date().toISOString();
    
    const db = require('../database/db');
    const sql = `
      UPDATE ${this.tableName} 
      SET statut = $1
      WHERE statut = $2 AND date_expiration < $3
    `;
    
    const result = await db.run(sql, [
      DemandeChangementEmail.STATUTS.EXPIRE,
      DemandeChangementEmail.STATUTS.EN_ATTENTE,
      maintenant
    ]);

    return result.changes || 0;
  }

  /**
   * Récupérer l'historique des demandes pour un utilisateur
   * 
   * @param {number} userId - ID de l'utilisateur
   * @param {number} limite - Nombre de résultats
   * @returns {Array} Historique des demandes
   */
  async getHistoriqueDemandes(userId, limite = 20) {
    return await this.findAll(
      'utilisateur_id = $1',
      [userId],
      'date_demande DESC',
      limite
    );
  }

  /**
   * Statistiques des demandes de changement d'email
   * 
   * @param {Date} dateDebut - Période de début (optionnel)
   * @param {Date} dateFin - Période de fin (optionnel)
   * @returns {Object} Statistiques détaillées
   */
  async statistiquesDemandes(dateDebut = null, dateFin = null) {
    let whereClause = '1 = 1';
    const params = [];
    let paramIndex = 1;

    if (dateDebut) {
      whereClause += ` AND date_demande >= $${paramIndex}`;
      params.push(dateDebut.toISOString());
      paramIndex++;
    }

    if (dateFin) {
      whereClause += ` AND date_demande <= $${paramIndex}`;
      params.push(dateFin.toISOString());
      paramIndex++;
    }

    const db = require('../database/db');
    
    // Statistiques par statut
    const sqlStatuts = `
      SELECT 
        statut,
        COUNT(*) as nombre_demandes
      FROM demandes_changement_email
      WHERE ${whereClause}
      GROUP BY statut
      ORDER BY nombre_demandes DESC
    `;
    
    // Délai moyen de validation
    const sqlDelais = `
      SELECT 
        AVG(EXTRACT(EPOCH FROM (date_validation::timestamp - date_demande::timestamp)) / 3600) as delai_moyen_heures
      FROM demandes_changement_email
      WHERE ${whereClause}
        AND statut = 'VALIDE'
        AND date_validation IS NOT NULL
    `;

    const [statutsStats, delaiStats] = await Promise.all([
      db.all(sqlStatuts, params),
      db.get(sqlDelais, params)
    ]);

    const total = statutsStats.reduce((sum, stat) => sum + stat.nombre_demandes, 0);
    const tauxReussite = total > 0 ? 
      (statutsStats.find(s => s.statut === 'VALIDE')?.nombre_demandes || 0) / total * 100 : 0;

    return {
      periode: {
        debut: dateDebut ? dateDebut.toISOString() : 'Toutes',
        fin: dateFin ? dateFin.toISOString() : 'Aujourd\'hui'
      },
      total_demandes: total,
      demandes_par_statut: statutsStats,
      taux_reussite: Math.round(tauxReussite * 100) / 100,
      delai_moyen_validation_heures: delaiStats?.delai_moyen_heures ? 
        Math.round(delaiStats.delai_moyen_heures * 100) / 100 : null
    };
  }

  /**
   * Vérifier si un utilisateur peut faire une nouvelle demande
   * (limitation anti-spam)
   * 
   * @param {number} userId - ID de l'utilisateur
   * @returns {Object} Résultat de vérification
   */
  async peutFaireNouvelleDemande(userId) {
    // Vérifier s'il y a déjà une demande en cours
    const demandeEnCours = await this.findOne(
      'utilisateur_id = $1 AND statut = $2',
      [userId, DemandeChangementEmail.STATUTS.EN_ATTENTE]
    );

    if (demandeEnCours) {
      return {
        peut_demander: false,
        raison: 'DEMANDE_EN_COURS',
        message: 'Il existe déjà une demande en cours',
        demande_existante: demandeEnCours
      };
    }

    // Vérifier le délai depuis la dernière demande (limitation: 1 par jour)
    const maintenant = new Date();
    const hier = new Date(maintenant.getTime() - (24 * 60 * 60 * 1000));
    
    const demandeRecente = await this.findOne(
      'utilisateur_id = $1 AND date_demande > $2',
      [userId, hier.toISOString()],
      'date_demande DESC'
    );

    if (demandeRecente) {
      return {
        peut_demander: false,
        raison: 'DELAI_INSUFFISANT',
        message: 'Vous ne pouvez faire qu\'une demande par jour',
        prochaine_demande_possible: new Date(new Date(demandeRecente.date_demande).getTime() + (24 * 60 * 60 * 1000))
      };
    }

    return {
      peut_demander: true,
      raison: 'AUTORISE',
      message: 'Vous pouvez faire une nouvelle demande'
    };
  }
}

module.exports = DemandeChangementEmail;