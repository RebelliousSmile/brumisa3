const BaseService = require('./BaseService');
const Document = require('../models/Document');
const DocumentModerationHistorique = require('../models/DocumentModerationHistorique');

/**
 * Service de modération des documents
 * Implémente le workflow de modération a posteriori
 * selon FONCTIONNALITES/06-administration.md
 */
class DocumentModerationService extends BaseService {
    constructor() {
        super('DocumentModerationService');
    }

    /**
     * Traiter une demande d'approbation de document
     * 
     * @param {number} documentId - ID du document à approuver
     * @param {number} moderateurId - ID du modérateur
     * @param {string} commentaire - Commentaire optionnel
     * @returns {Object} Résultat de l'approbation
     */
    async approuverDocument(documentId, moderateurId, commentaire = '') {
        try {
            // Validation du document et permissions
            const document = await this.validateDocumentPourModeration(documentId);
            await this.validateModerateurPermissions(moderateurId);
            
            if (document.statut_moderation !== 'EN_ATTENTE') {
                throw new Error('Ce document a déjà été modéré');
            }
            
            // Mettre à jour le statut du document
            const documentUpdate = {
                statut_moderation: 'APPROUVE',
                modere_le: new Date(),
                modere_par: moderateurId
            };
            
            await Document.update(documentId, documentUpdate);
            
            // Enregistrer l'historique
            await DocumentModerationHistorique.create({
                document_id: documentId,
                moderateur_id: moderateurId,
                action: 'APPROBATION',
                commentaire: commentaire || 'Document approuvé',
                statut_avant: 'EN_ATTENTE',
                statut_apres: 'APPROUVE'
            });
            
            this.log('info', 'Document approuvé', {
                document_id: documentId,
                moderateur_id: moderateurId,
                titre: document.titre
            });
            
            // Optionnel: Notifier l'auteur
            await this.notifierAuteur(document.utilisateur_id, 'APPROBATION', document, commentaire);
            
            return {
                success: true,
                action: 'APPROBATION',
                document: { ...document, ...documentUpdate }
            };
            
        } catch (error) {
            this.logError(error, { documentId, moderateurId });
            throw error;
        }
    }

    /**
     * Rejeter un document avec motif
     * 
     * @param {number} documentId - ID du document à rejeter
     * @param {number} moderateurId - ID du modérateur
     * @param {string} motif - Motif obligatoire du rejet
     * @param {string} commentaire - Commentaire détaillé
     * @returns {Object} Résultat du rejet
     */
    async rejeterDocument(documentId, moderateurId, motif, commentaire = '') {
        try {
            this.validateRequired({ motif }, ['motif']);
            
            const document = await this.validateDocumentPourModeration(documentId);
            await this.validateModerateurPermissions(moderateurId);
            
            if (document.statut_moderation !== 'EN_ATTENTE') {
                throw new Error('Ce document a déjà été modéré');
            }
            
            // Mettre à jour le statut du document
            const documentUpdate = {
                statut_moderation: 'REJETE',
                est_public: false, // Retirer de la visibilité publique
                modere_le: new Date(),
                modere_par: moderateurId
            };
            
            await Document.update(documentId, documentUpdate);
            
            // Enregistrer l'historique avec motif détaillé
            await DocumentModerationHistorique.create({
                document_id: documentId,
                moderateur_id: moderateurId,
                action: 'REJET',
                motif: motif,
                commentaire: commentaire,
                statut_avant: 'EN_ATTENTE',
                statut_apres: 'REJETE'
            });
            
            this.log('info', 'Document rejeté', {
                document_id: documentId,
                moderateur_id: moderateurId,
                motif: motif,
                titre: document.titre
            });
            
            // Notifier l'auteur avec explication
            await this.notifierAuteur(document.utilisateur_id, 'REJET', document, motif, commentaire);
            
            return {
                success: true,
                action: 'REJET',
                motif: motif,
                document: { ...document, ...documentUpdate }
            };
            
        } catch (error) {
            this.logError(error, { documentId, moderateurId, motif });
            throw error;
        }
    }

    /**
     * Mettre en avant un document approuvé
     * 
     * @param {number} documentId - ID du document à mettre en avant
     * @param {number} moderateurId - ID du modérateur
     * @param {string} commentaire - Justification de la mise en avant
     * @returns {Object} Résultat de la mise en avant
     */
    async mettreEnAvantDocument(documentId, moderateurId, commentaire = '') {
        try {
            const document = await this.validateDocumentPourModeration(documentId);
            await this.validateModerateurPermissions(moderateurId);
            
            if (document.statut_moderation !== 'APPROUVE') {
                throw new Error('Seuls les documents approuvés peuvent être mis en avant');
            }
            
            if (document.est_mis_en_avant) {
                throw new Error('Ce document est déjà mis en avant');
            }
            
            // Mettre à jour le statut de mise en avant
            const documentUpdate = {
                est_mis_en_avant: true,
                mis_en_avant_le: new Date(),
                mis_en_avant_par: moderateurId
            };
            
            await Document.update(documentId, documentUpdate);
            
            // Enregistrer l'historique
            await DocumentModerationHistorique.create({
                document_id: documentId,
                moderateur_id: moderateurId,
                action: 'MISE_EN_AVANT',
                commentaire: commentaire || 'Document mis en avant pour sa qualité',
                statut_avant: 'APPROUVE',
                statut_apres: 'APPROUVE'
            });
            
            this.log('info', 'Document mis en avant', {
                document_id: documentId,
                moderateur_id: moderateurId,
                titre: document.titre
            });
            
            return {
                success: true,
                action: 'MISE_EN_AVANT',
                document: { ...document, ...documentUpdate }
            };
            
        } catch (error) {
            this.logError(error, { documentId, moderateurId });
            throw error;
        }
    }

    /**
     * Retirer la mise en avant d'un document
     * 
     * @param {number} documentId - ID du document
     * @param {number} moderateurId - ID du modérateur
     * @param {string} commentaire - Justification
     * @returns {Object} Résultat
     */
    async retirerMiseEnAvant(documentId, moderateurId, commentaire = '') {
        try {
            const document = await this.validateDocumentPourModeration(documentId);
            await this.validateModerateurPermissions(moderateurId);
            
            if (!document.est_mis_en_avant) {
                throw new Error('Ce document n\'est pas mis en avant');
            }
            
            // Retirer la mise en avant
            const documentUpdate = {
                est_mis_en_avant: false,
                mis_en_avant_le: null,
                mis_en_avant_par: null
            };
            
            await Document.update(documentId, documentUpdate);
            
            // Enregistrer l'historique
            await DocumentModerationHistorique.create({
                document_id: documentId,
                moderateur_id: moderateurId,
                action: 'RETRAIT_MISE_EN_AVANT',
                commentaire: commentaire || 'Mise en avant retirée',
                statut_avant: 'APPROUVE',
                statut_apres: 'APPROUVE'
            });
            
            this.log('info', 'Mise en avant retirée', {
                document_id: documentId,
                moderateur_id: moderateurId,
                titre: document.titre
            });
            
            return {
                success: true,
                action: 'RETRAIT_MISE_EN_AVANT',
                document: { ...document, ...documentUpdate }
            };
            
        } catch (error) {
            this.logError(error, { documentId, moderateurId });
            throw error;
        }
    }

    /**
     * Traiter un signalement de document par un utilisateur
     * 
     * @param {number} documentId - ID du document signalé
     * @param {number} utilisateurId - ID de l'utilisateur signalant
     * @param {string} motif - Motif du signalement
     * @param {string} commentaire - Détails du signalement
     * @returns {Object} Résultat du signalement
     */
    async signalerDocument(documentId, utilisateurId, motif, commentaire = '') {
        try {
            this.validateRequired({ motif }, ['motif']);
            
            const document = await Document.findById(documentId);
            if (!document) {
                throw new Error('Document non trouvé');
            }
            
            if (!document.est_public) {
                throw new Error('Seuls les documents publics peuvent être signalés');
            }
            
            // Vérifier que l'utilisateur n'a pas déjà signalé ce document
            const signalementExistant = await DocumentModerationHistorique.findOne({
                document_id: documentId,
                moderateur_id: utilisateurId,
                action: 'SIGNALEMENT'
            });
            
            if (signalementExistant) {
                throw new Error('Vous avez déjà signalé ce document');
            }
            
            // Enregistrer le signalement
            await DocumentModerationHistorique.create({
                document_id: documentId,
                moderateur_id: utilisateurId, // L'utilisateur signalant
                action: 'SIGNALEMENT',
                motif: motif,
                commentaire: commentaire,
                statut_avant: document.statut_moderation,
                statut_apres: document.statut_moderation
            });
            
            this.log('info', 'Document signalé', {
                document_id: documentId,
                utilisateur_id: utilisateurId,
                motif: motif,
                titre: document.titre
            });
            
            // Optionnel: Alerter les modérateurs si plusieurs signalements
            await this.verifierSeuilSignalements(documentId);
            
            return {
                success: true,
                action: 'SIGNALEMENT',
                message: 'Signalement enregistré, les modérateurs ont été notifiés'
            };
            
        } catch (error) {
            this.logError(error, { documentId, utilisateurId, motif });
            throw error;
        }
    }

    /**
     * Obtenir les documents en attente de modération
     * 
     * @param {Object} filtres - Filtres optionnels
     * @param {number} limite - Nombre max de documents
     * @param {number} offset - Décalage pour pagination
     * @returns {Array} Documents en attente
     */
    async getDocumentsEnAttente(filtres = {}, limite = 20, offset = 0) {
        try {
            const conditions = {
                est_public: true,
                statut_moderation: 'EN_ATTENTE',
                ...filtres
            };
            
            const documents = await Document.findAll(conditions, {
                orderBy: [['created_at', 'ASC']], // Plus anciens en premier
                limit: limite,
                offset: offset
            });
            
            return documents;
            
        } catch (error) {
            this.logError(error, { filtres, limite, offset });
            throw error;
        }
    }

    /**
     * Obtenir les statistiques de modération
     * 
     * @param {Date} dateDebut - Date de début (optionnel)
     * @param {Date} dateFin - Date de fin (optionnel)  
     * @returns {Object} Statistiques détaillées
     */
    async getStatistiquesModeration(dateDebut = null, dateFin = null) {
        try {
            // Statistiques des documents par statut
            const totalDocuments = await Document.count({ est_public: true });
            const enAttente = await Document.count({ 
                est_public: true, 
                statut_moderation: 'EN_ATTENTE' 
            });
            const approuves = await Document.count({ 
                est_public: true, 
                statut_moderation: 'APPROUVE' 
            });
            const rejetes = await Document.count({ 
                est_public: true, 
                statut_moderation: 'REJETE' 
            });
            const misEnAvant = await Document.count({ 
                est_public: true, 
                est_mis_en_avant: true 
            });
            
            // Statistiques des actions de modération
            const actionsStats = await DocumentModerationHistorique.getStatistiquesActions(dateDebut, dateFin);
            
            // Taux d'approbation
            const totalModeres = approuves + rejetes;
            const tauxApprobation = totalModeres > 0 ? (approuves / totalModeres * 100).toFixed(1) : 0;
            
            return {
                documents: {
                    total: totalDocuments,
                    en_attente: enAttente,
                    approuves: approuves,
                    rejetes: rejetes,
                    mis_en_avant: misEnAvant,
                    taux_approbation: parseFloat(tauxApprobation)
                },
                actions: actionsStats,
                periode: {
                    debut: dateDebut ? dateDebut.toISOString() : null,
                    fin: dateFin ? dateFin.toISOString() : null
                }
            };
            
        } catch (error) {
            this.logError(error, { dateDebut, dateFin });
            throw error;
        }
    }

    /**
     * Validation des permissions de modérateur
     * 
     * @private
     * @param {number} moderateurId - ID du modérateur
     */
    async validateModerateurPermissions(moderateurId) {
        const Utilisateur = require('../models/Utilisateur');
        const moderateur = await Utilisateur.findById(moderateurId);
        
        if (!moderateur) {
            throw new Error('Modérateur non trouvé');
        }
        
        if (moderateur.role !== 'ADMIN') {
            throw new Error('Permissions administrateur requises');
        }
    }

    /**
     * Validation d'un document pour modération
     * 
     * @private
     * @param {number} documentId - ID du document
     * @returns {Object} Document validé
     */
    async validateDocumentPourModeration(documentId) {
        const document = await Document.findById(documentId);
        
        if (!document) {
            throw new Error('Document non trouvé');
        }
        
        return document;
    }

    /**
     * Notifier l'auteur d'un document du résultat de modération
     * 
     * @private
     * @param {number} auteurId - ID de l'auteur
     * @param {string} action - Action effectuée
     * @param {Object} document - Document concerné
     * @param {string} motif - Motif/commentaire
     * @param {string} commentaire - Commentaire supplémentaire
     */
    async notifierAuteur(auteurId, action, document, motif = '', commentaire = '') {
        // Implémentation future: envoi d'email ou notification in-app
        this.log('info', 'Notification auteur', {
            auteur_id: auteurId,
            action: action,
            document_id: document.id,
            document_titre: document.titre,
            motif: motif
        });
    }

    /**
     * Vérifier le seuil de signalements pour alerter les modérateurs
     * 
     * @private
     * @param {number} documentId - ID du document
     */
    async verifierSeuilSignalements(documentId) {
        const signalements = await DocumentModerationHistorique.count({
            document_id: documentId,
            action: 'SIGNALEMENT'
        });
        
        // Seuil d'alerte à 3 signalements
        if (signalements >= 3) {
            this.log('warn', 'Document fortement signalé', {
                document_id: documentId,
                nombre_signalements: signalements
            });
            
            // Future implémentation: alerte automatique aux modérateurs
        }
    }
}

module.exports = DocumentModerationService;