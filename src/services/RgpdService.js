const BaseService = require('./BaseService');
const RgpdConsentement = require('../models/RgpdConsentement');
const DemandeChangementEmail = require('../models/DemandeChangementEmail');
const Utilisateur = require('../models/Utilisateur');

/**
 * Service RGPD pour la conformité et gestion des données personnelles
 * Implémente les obligations RGPD selon architecture-models.md
 */
class RgpdService extends BaseService {
    constructor() {
        super('RgpdService');
        
        // Types de consentement RGPD
        this.TYPES_CONSENTEMENT = {
            NEWSLETTER: 'NEWSLETTER',
            COOKIES_ANALYTIQUES: 'COOKIES_ANALYTIQUES',
            PARTAGE_DONNEES: 'PARTAGE_DONNEES',
            COMMUNICATION_MARKETING: 'COMMUNICATION_MARKETING'
        };
    }

    /**
     * Enregistrer un consentement RGPD
     * 
     * @param {number} utilisateurId - ID de l'utilisateur
     * @param {string} typeConsentement - Type de consentement
     * @param {boolean} consentementDonne - Consentement accordé ou retiré
     * @param {Object} metadata - Métadonnées (IP, User-Agent, etc.)
     * @returns {Object} Consentement enregistré
     */
    async enregistrerConsentement(utilisateurId, typeConsentement, consentementDonne, metadata = {}) {
        try {
            this.validateRequired({ utilisateurId, typeConsentement }, ['utilisateurId', 'typeConsentement']);
            
            // Valider le type de consentement
            if (!Object.values(this.TYPES_CONSENTEMENT).includes(typeConsentement)) {
                throw new Error(`Type de consentement invalide: ${typeConsentement}`);
            }
            
            // Vérifier que l'utilisateur existe
            const utilisateur = await Utilisateur.findById(utilisateurId);
            if (!utilisateur) {
                throw new Error('Utilisateur non trouvé');
            }
            
            // Révoquer le consentement précédent s'il existe
            const consentementPrecedent = await RgpdConsentement.findOne({
                utilisateur_id: utilisateurId,
                type_consentement: typeConsentement,
                actif: true
            });
            
            if (consentementPrecedent) {
                await RgpdConsentement.update(consentementPrecedent.id, { actif: false });
            }
            
            // Créer le nouveau consentement
            const consentementData = {
                utilisateur_id: utilisateurId,
                type_consentement: typeConsentement,
                consentement_donne: consentementDonne,
                date_consentement: new Date(),
                ip_adresse: metadata.ip || null,
                user_agent: metadata.userAgent || null,
                contexte: metadata.contexte || 'manuel',
                actif: true
            };
            
            const consentement = await RgpdConsentement.create(consentementData);
            
            this.log('info', 'Consentement RGPD enregistré', {
                utilisateur_id: utilisateurId,
                type_consentement: typeConsentement,
                consentement_donne: consentementDonne,
                ip_adresse: metadata.ip,
                contexte: metadata.contexte
            });
            
            return consentement;
            
        } catch (error) {
            this.logError(error, { utilisateurId, typeConsentement, consentementDonne });
            throw error;
        }
    }

    /**
     * Vérifier le consentement actuel d'un utilisateur
     * 
     * @param {number} utilisateurId - ID de l'utilisateur
     * @param {string} typeConsentement - Type de consentement à vérifier
     * @returns {boolean} Statut du consentement
     */
    async verifierConsentement(utilisateurId, typeConsentement) {
        try {
            const consentement = await RgpdConsentement.findOne({
                utilisateur_id: utilisateurId,
                type_consentement: typeConsentement,
                actif: true
            });
            
            return consentement ? consentement.consentement_donne : false;
            
        } catch (error) {
            this.logError(error, { utilisateurId, typeConsentement });
            return false;
        }
    }

    /**
     * Obtenir tous les consentements d'un utilisateur
     * 
     * @param {number} utilisateurId - ID de l'utilisateur
     * @returns {Object} Consentements par type
     */
    async getConsentsUtilisateur(utilisateurId) {
        try {
            const consentements = {};
            
            for (const type of Object.values(this.TYPES_CONSENTEMENT)) {
                const consentement = await RgpdConsentement.findOne({
                    utilisateur_id: utilisateurId,
                    type_consentement: type,
                    actif: true
                });
                
                consentements[type] = {
                    accorde: consentement ? consentement.consentement_donne : false,
                    date: consentement ? consentement.date_consentement : null,
                    contexte: consentement ? consentement.contexte : null
                };
            }
            
            return consentements;
            
        } catch (error) {
            this.logError(error, { utilisateurId });
            throw error;
        }
    }

    /**
     * Révoquer un consentement spécifique
     * 
     * @param {number} utilisateurId - ID de l'utilisateur
     * @param {string} typeConsentement - Type de consentement à révoquer
     * @param {Object} metadata - Métadonnées de révocation
     * @returns {Object} Résultat de la révocation
     */
    async revoquerConsentement(utilisateurId, typeConsentement, metadata = {}) {
        try {
            return await this.enregistrerConsentement(
                utilisateurId, 
                typeConsentement, 
                false, // Retirer le consentement
                { ...metadata, contexte: 'revocation' }
            );
            
        } catch (error) {
            this.logError(error, { utilisateurId, typeConsentement });
            throw error;
        }
    }

    /**
     * Demander un changement d'email sécurisé
     * 
     * @param {number} utilisateurId - ID de l'utilisateur
     * @param {string} nouvelEmail - Nouvelle adresse email
     * @param {string} ipDemande - IP de la demande
     * @returns {Object} Demande créée avec token
     */
    async demanderChangementEmail(utilisateurId, nouvelEmail, ipDemande) {
        try {
            this.validateRequired({ utilisateurId, nouvelEmail }, ['utilisateurId', 'nouvelEmail']);
            
            // Valider le format email
            if (!this.isValidEmail(nouvelEmail)) {
                throw new Error('Format d\'email invalide');
            }
            
            // Vérifier que l'utilisateur existe
            const utilisateur = await Utilisateur.findById(utilisateurId);
            if (!utilisateur) {
                throw new Error('Utilisateur non trouvé');
            }
            
            // Vérifier que le nouvel email n'est pas déjà utilisé
            const emailExistant = await Utilisateur.findOne({ email: nouvelEmail });
            if (emailExistant && emailExistant.id !== utilisateurId) {
                throw new Error('Cette adresse email est déjà utilisée');
            }
            
            // Annuler les demandes précédentes en attente
            await DemandeChangementEmail.updateWhere(
                { utilisateur_id: utilisateurId, statut: 'EN_ATTENTE' },
                { statut: 'ANNULE' }
            );
            
            // Générer un token sécurisé
            const token = await this.genererTokenSecurise();
            const dateExpiration = new Date();
            dateExpiration.setDate(dateExpiration.getDate() + 15); // 15 jours
            
            // Créer la demande
            const demandeData = {
                utilisateur_id: utilisateurId,
                ancien_email: utilisateur.email,
                nouvel_email: nouvelEmail,
                token_validation: token,
                statut: 'EN_ATTENTE',
                date_demande: new Date(),
                date_expiration: dateExpiration,
                ip_demande: ipDemande
            };
            
            const demande = await DemandeChangementEmail.create(demandeData);
            
            this.log('info', 'Demande changement email créée', {
                utilisateur_id: utilisateurId,
                ancien_email: utilisateur.email,
                nouvel_email: nouvelEmail,
                ip_demande: ipDemande,
                token: token
            });
            
            // Envoyer l'email de validation (implémentation future)
            await this.envoyerEmailValidationChangement(utilisateur, nouvelEmail, token);
            
            return {
                demande_id: demande.id,
                token: token,
                date_expiration: dateExpiration,
                message: 'Un email de validation a été envoyé à votre nouvelle adresse'
            };
            
        } catch (error) {
            this.logError(error, { utilisateurId, nouvelEmail, ipDemande });
            throw error;
        }
    }

    /**
     * Valider un changement d'email avec token
     * 
     * @param {string} token - Token de validation
     * @returns {Object} Résultat de la validation
     */
    async validerChangementEmail(token) {
        try {
            this.validateRequired({ token }, ['token']);
            
            const demande = await DemandeChangementEmail.findOne({
                token_validation: token,
                statut: 'EN_ATTENTE'
            });
            
            if (!demande) {
                throw new Error('Token invalide ou demande déjà traitée');
            }
            
            // Vérifier l'expiration
            if (new Date() > new Date(demande.date_expiration)) {
                await DemandeChangementEmail.update(demande.id, { statut: 'EXPIRE' });
                throw new Error('Token expiré. Veuillez refaire une demande.');
            }
            
            // Mettre à jour l'email utilisateur
            await Utilisateur.update(demande.utilisateur_id, {
                email: demande.nouvel_email
            });
            
            // Marquer la demande comme validée
            await DemandeChangementEmail.update(demande.id, {
                statut: 'VALIDE',
                date_validation: new Date()
            });
            
            this.log('info', 'Changement email validé', {
                utilisateur_id: demande.utilisateur_id,
                ancien_email: demande.ancien_email,
                nouvel_email: demande.nouvel_email,
                token: token
            });
            
            return {
                success: true,
                nouvel_email: demande.nouvel_email,
                message: 'Votre adresse email a été mise à jour avec succès'
            };
            
        } catch (error) {
            this.logError(error, { token });
            throw error;
        }
    }

    /**
     * Annuler une demande de changement d'email
     * 
     * @param {number} utilisateurId - ID de l'utilisateur
     * @returns {Object} Résultat de l'annulation
     */
    async annulerDemandeChangementEmail(utilisateurId) {
        try {
            const demande = await DemandeChangementEmail.findOne({
                utilisateur_id: utilisateurId,
                statut: 'EN_ATTENTE'
            });
            
            if (!demande) {
                throw new Error('Aucune demande en attente trouvée');
            }
            
            await DemandeChangementEmail.update(demande.id, { statut: 'ANNULE' });
            
            this.log('info', 'Demande changement email annulée', {
                utilisateur_id: utilisateurId,
                demande_id: demande.id
            });
            
            return {
                success: true,
                message: 'Demande de changement d\'email annulée'
            };
            
        } catch (error) {
            this.logError(error, { utilisateurId });
            throw error;
        }
    }

    /**
     * Exporter toutes les données RGPD d'un utilisateur
     * 
     * @param {number} utilisateurId - ID de l'utilisateur
     * @returns {Object} Export complet des données
     */
    async exporterDonneesUtilisateur(utilisateurId) {
        try {
            // Données utilisateur principales
            const utilisateur = await Utilisateur.findById(utilisateurId);
            if (!utilisateur) {
                throw new Error('Utilisateur non trouvé');
            }
            
            // Consentements RGPD
            const consentements = await RgpdConsentement.findAll({
                utilisateur_id: utilisateurId
            }, {
                orderBy: [['date_consentement', 'DESC']]
            });
            
            // Demandes de changement d'email
            const demandesEmail = await DemandeChangementEmail.findAll({
                utilisateur_id: utilisateurId
            }, {
                orderBy: [['date_demande', 'DESC']]
            });
            
            // Données de documents et PDFs (utiliser les modèles existants)
            const Document = require('../models/Document');
            const Pdf = require('../models/Pdf');
            const DocumentVote = require('../models/DocumentVote');
            
            const documents = await Document.findAll({ utilisateur_id: utilisateurId });
            const pdfs = await Pdf.findAll({ utilisateur_id: utilisateurId });
            const votes = await DocumentVote.findAll({ utilisateur_id: utilisateurId });
            
            const exportData = {
                utilisateur: {
                    id: utilisateur.id,
                    nom: utilisateur.nom,
                    email: utilisateur.email,
                    role: utilisateur.role,
                    date_creation: utilisateur.created_at,
                    derniere_connexion: utilisateur.derniere_connexion
                },
                consentements: consentements.map(c => ({
                    type: c.type_consentement,
                    accorde: c.consentement_donne,
                    date: c.date_consentement,
                    ip: c.ip_adresse,
                    contexte: c.contexte
                })),
                demandes_email: demandesEmail.map(d => ({
                    ancien_email: d.ancien_email,
                    nouvel_email: d.nouvel_email,
                    statut: d.statut,
                    date_demande: d.date_demande,
                    date_validation: d.date_validation
                })),
                documents: documents.map(d => ({
                    id: d.id,
                    titre: d.titre,
                    type: d.type,
                    systeme: d.systeme,
                    est_public: d.est_public,
                    date_creation: d.created_at
                })),
                pdfs: pdfs.map(p => ({
                    id: p.id,
                    nom_fichier: p.nom_fichier,
                    statut: p.statut,
                    date_creation: p.created_at
                })),
                votes: votes.map(v => ({
                    document_id: v.document_id,
                    qualite_generale: v.qualite_generale,
                    utilite_pratique: v.utilite_pratique,
                    respect_gamme: v.respect_gamme,
                    date_vote: v.created_at
                })),
                export_info: {
                    date_export: new Date(),
                    version_rgpd: '1.0'
                }
            };
            
            this.log('info', 'Export données RGPD généré', {
                utilisateur_id: utilisateurId,
                nombre_consentements: consentements.length,
                nombre_documents: documents.length,
                nombre_pdfs: pdfs.length,
                nombre_votes: votes.length
            });
            
            return exportData;
            
        } catch (error) {
            this.logError(error, { utilisateurId });
            throw error;
        }
    }

    /**
     * Nettoyer les demandes expirées
     * 
     * @returns {Object} Résultat du nettoyage
     */
    async nettoyerDemandesExpirees() {
        try {
            const maintenant = new Date();
            
            const demandesExpirees = await DemandeChangementEmail.findAll({
                statut: 'EN_ATTENTE'
            });
            
            const aExpirees = demandesExpirees.filter(d => 
                new Date(d.date_expiration) < maintenant
            );
            
            for (const demande of aExpirees) {
                await DemandeChangementEmail.update(demande.id, { statut: 'EXPIRE' });
            }
            
            this.log('info', 'Nettoyage demandes expirées', {
                nombre_expirees: aExpirees.length
            });
            
            return {
                success: true,
                demandes_expirees: aExpirees.length,
                message: `${aExpirees.length} demandes expirées nettoyées`
            };
            
        } catch (error) {
            this.logError(error);
            throw error;
        }
    }

    /**
     * Générer un token sécurisé
     * 
     * @private
     * @returns {string} Token sécurisé
     */
    async genererTokenSecurise() {
        const crypto = require('crypto');
        return crypto.randomBytes(32).toString('hex');
    }

    /**
     * Valider le format d'un email
     * 
     * @private
     * @param {string} email - Email à valider
     * @returns {boolean} Validité du format
     */
    isValidEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    /**
     * Envoyer l'email de validation pour changement
     * 
     * @private
     * @param {Object} utilisateur - Utilisateur
     * @param {string} nouvelEmail - Nouvel email
     * @param {string} token - Token de validation
     */
    async envoyerEmailValidationChangement(utilisateur, nouvelEmail, token) {
        // Implémentation future avec EmailService
        this.log('info', 'Email validation changement à envoyer', {
            utilisateur_id: utilisateur.id,
            nouvel_email: nouvelEmail,
            token: token
        });
        
        // TODO: Intégrer avec EmailService pour envoyer le mail de validation
    }
}

module.exports = RgpdService;