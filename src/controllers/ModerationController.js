const BaseController = require('./BaseController');
const Document = require('../models/Document');
const DocumentModerationHistorique = require('../models/DocumentModerationHistorique');

/**
 * Contrôleur pour les fonctionnalités de modération
 * Implémente la modération a posteriori selon FONCTIONNALITES/06-administration.md
 */
class ModerationController extends BaseController {
    constructor() {
        super('ModerationController');
    }

    /**
     * Lister les documents en attente de modération
     * GET /api/admin/moderation/documents-en-attente
     */
    documentsEnAttente = this.wrapAsync(async (req, res) => {
        this.verifierPermissions(req, 'ADMIN');
        const pagination = this.extrairePagination(req);
        
        // Documents publics non encore modérés
        const conditions = {
            est_public: true,
            statut_moderation: 'EN_ATTENTE'
        };
        
        const documents = await Document.findAll(conditions, {
            orderBy: [['created_at', 'ASC']], // Les plus anciens en premier
            limit: pagination.limite,
            offset: pagination.offset
        });
        
        const total = await Document.count(conditions);
        
        return this.repondrePagine(res, documents, {
            ...pagination,
            total
        }, 'Documents en attente récupérés');
    });

    /**
     * Approuver un document
     * POST /api/admin/moderation/documents/:id/approuver
     */
    approuverDocument = this.wrapAsync(async (req, res) => {
        this.validerParametres(req, ['id']);
        const utilisateur = this.verifierPermissions(req, 'ADMIN');
        
        const documentId = parseInt(req.params.id);
        const { commentaire_admin } = req.body;
        
        const document = await Document.findById(documentId);
        if (!document) {
            return this.repondreErreur(res, 404, 'Document non trouvé', 'not_found');
        }
        
        if (document.statut_moderation !== 'EN_ATTENTE') {
            return this.repondreErreur(res, 400, 'Ce document a déjà été modéré', 'validation');
        }
        
        // Mettre à jour le statut du document
        await Document.update(documentId, {
            statut_moderation: 'APPROUVE',
            modere_le: new Date(),
            modere_par: utilisateur.id
        });
        
        // Enregistrer l'historique de modération
        await DocumentModerationHistorique.create({
            document_id: documentId,
            moderateur_id: utilisateur.id,
            action: 'APPROBATION',
            commentaire: commentaire_admin || 'Document approuvé',
            statut_avant: 'EN_ATTENTE',
            statut_apres: 'APPROUVE'
        });
        
        this.logger.info('Document approuvé', {
            document_id: documentId,
            moderateur_id: utilisateur.id,
            commentaire: commentaire_admin
        });
        
        return this.repondreSucces(res, null, 'Document approuvé avec succès');
    });

    /**
     * Rejeter un document
     * POST /api/admin/moderation/documents/:id/rejeter
     */
    rejeterDocument = this.wrapAsync(async (req, res) => {
        this.validerParametres(req, ['id']);
        const utilisateur = this.verifierPermissions(req, 'ADMIN');
        
        const documentId = parseInt(req.params.id);
        const { motif, commentaire_admin } = req.body;
        
        if (!motif) {
            const erreur = new Error('Le motif de rejet est obligatoire');
            erreur.name = 'ValidationError';
            throw erreur;
        }
        
        const document = await Document.findById(documentId);
        if (!document) {
            return this.repondreErreur(res, 404, 'Document non trouvé', 'not_found');
        }
        
        if (document.statut_moderation !== 'EN_ATTENTE') {
            return this.repondreErreur(res, 400, 'Ce document a déjà été modéré', 'validation');
        }
        
        // Mettre à jour le statut du document
        await Document.update(documentId, {
            statut_moderation: 'REJETE',
            est_public: false, // Retirer de la visibilité publique
            modere_le: new Date(),
            modere_par: utilisateur.id
        });
        
        // Enregistrer l'historique de modération
        await DocumentModerationHistorique.create({
            document_id: documentId,
            moderateur_id: utilisateur.id,
            action: 'REJET',
            motif,
            commentaire: commentaire_admin,
            statut_avant: 'EN_ATTENTE',
            statut_apres: 'REJETE'
        });
        
        this.logger.info('Document rejeté', {
            document_id: documentId,
            moderateur_id: utilisateur.id,
            motif,
            commentaire: commentaire_admin
        });
        
        return this.repondreSucces(res, null, 'Document rejeté avec succès');
    });

    /**
     * Mettre en avant un document approuvé
     * POST /api/admin/moderation/documents/:id/mettre-en-avant
     */
    mettreEnAvant = this.wrapAsync(async (req, res) => {
        this.validerParametres(req, ['id']);
        const utilisateur = this.verifierPermissions(req, 'ADMIN');
        
        const documentId = parseInt(req.params.id);
        const { commentaire_admin } = req.body;
        
        const document = await Document.findById(documentId);
        if (!document) {
            return this.repondreErreur(res, 404, 'Document non trouvé', 'not_found');
        }
        
        if (document.statut_moderation !== 'APPROUVE') {
            return this.repondreErreur(res, 400, 'Seuls les documents approuvés peuvent être mis en avant', 'validation');
        }
        
        // Mettre à jour le statut du document
        await Document.update(documentId, {
            est_mis_en_avant: true,
            mis_en_avant_le: new Date(),
            mis_en_avant_par: utilisateur.id
        });
        
        // Enregistrer l'historique de modération
        await DocumentModerationHistorique.create({
            document_id: documentId,
            moderateur_id: utilisateur.id,
            action: 'MISE_EN_AVANT',
            commentaire: commentaire_admin || 'Document mis en avant',
            statut_avant: 'APPROUVE',
            statut_apres: 'APPROUVE'
        });
        
        this.logger.info('Document mis en avant', {
            document_id: documentId,
            moderateur_id: utilisateur.id,
            commentaire: commentaire_admin
        });
        
        return this.repondreSucces(res, null, 'Document mis en avant avec succès');
    });

    /**
     * Retirer la mise en avant d'un document
     * POST /api/admin/moderation/documents/:id/retirer-mise-en-avant
     */
    retirerMiseEnAvant = this.wrapAsync(async (req, res) => {
        this.validerParametres(req, ['id']);
        const utilisateur = this.verifierPermissions(req, 'ADMIN');
        
        const documentId = parseInt(req.params.id);
        const { commentaire_admin } = req.body;
        
        const document = await Document.findById(documentId);
        if (!document) {
            return this.repondreErreur(res, 404, 'Document non trouvé', 'not_found');
        }
        
        if (!document.est_mis_en_avant) {
            return this.repondreErreur(res, 400, 'Ce document n\'est pas mis en avant', 'validation');
        }
        
        // Mettre à jour le statut du document
        await Document.update(documentId, {
            est_mis_en_avant: false,
            mis_en_avant_le: null,
            mis_en_avant_par: null
        });
        
        // Enregistrer l'historique de modération
        await DocumentModerationHistorique.create({
            document_id: documentId,
            moderateur_id: utilisateur.id,
            action: 'RETRAIT_MISE_EN_AVANT',
            commentaire: commentaire_admin || 'Mise en avant retirée',
            statut_avant: 'APPROUVE',
            statut_apres: 'APPROUVE'
        });
        
        this.logger.info('Mise en avant retirée', {
            document_id: documentId,
            moderateur_id: utilisateur.id,
            commentaire: commentaire_admin
        });
        
        return this.repondreSucces(res, null, 'Mise en avant retirée avec succès');
    });

    /**
     * Signaler un document (par les utilisateurs)
     * POST /api/documents/:id/signaler
     */
    signalerDocument = this.wrapAsync(async (req, res) => {
        this.validerParametres(req, ['id']);
        const utilisateur = this.verifierPermissions(req, 'UTILISATEUR');
        
        const documentId = parseInt(req.params.id);
        const { motif, commentaire } = req.body;
        
        if (!motif) {
            const erreur = new Error('Le motif de signalement est obligatoire');
            erreur.name = 'ValidationError';
            throw erreur;
        }
        
        const document = await Document.findById(documentId);
        if (!document) {
            return this.repondreErreur(res, 404, 'Document non trouvé', 'not_found');
        }
        
        if (!document.est_public) {
            return this.repondreErreur(res, 400, 'Seuls les documents publics peuvent être signalés', 'validation');
        }
        
        // Vérifier que l'utilisateur n'a pas déjà signalé ce document
        const signalementExistant = await DocumentModerationHistorique.findOne({
            document_id: documentId,
            moderateur_id: utilisateur.id,
            action: 'SIGNALEMENT'
        });
        
        if (signalementExistant) {
            return this.repondreErreur(res, 409, 'Vous avez déjà signalé ce document', 'conflit');
        }
        
        // Enregistrer le signalement
        await DocumentModerationHistorique.create({
            document_id: documentId,
            moderateur_id: utilisateur.id,
            action: 'SIGNALEMENT',
            motif,
            commentaire,
            statut_avant: document.statut_moderation,
            statut_apres: document.statut_moderation
        });
        
        this.logger.info('Document signalé', {
            document_id: documentId,
            utilisateur_id: utilisateur.id,
            motif,
            commentaire
        });
        
        return this.repondreSucces(res, null, 'Document signalé avec succès');
    });

    /**
     * Obtenir l'historique de modération d'un document
     * GET /api/admin/moderation/documents/:id/historique
     */
    obtenirHistoriqueDocument = this.wrapAsync(async (req, res) => {
        this.validerParametres(req, ['id']);
        this.verifierPermissions(req, 'ADMIN');
        
        const documentId = parseInt(req.params.id);
        const pagination = this.extrairePagination(req);
        
        const historique = await DocumentModerationHistorique.findAll({
            document_id: documentId
        }, {
            orderBy: [['created_at', 'DESC']],
            limit: pagination.limite,
            offset: pagination.offset
        });
        
        const total = await DocumentModerationHistorique.count({
            document_id: documentId
        });
        
        return this.repondrePagine(res, historique, {
            ...pagination,
            total
        }, 'Historique de modération récupéré');
    });

    /**
     * Obtenir les statistiques de modération
     * GET /api/admin/moderation/statistiques
     */
    obtenirStatistiques = this.wrapAsync(async (req, res) => {
        this.verifierPermissions(req, 'ADMIN');
        
        // Statistiques globales
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
        
        // Statistiques par action
        const actionsStats = await DocumentModerationHistorique.getStatistiquesActions();
        
        // Signalements récents (30 derniers jours)
        const signalements = await DocumentModerationHistorique.count({
            action: 'SIGNALEMENT',
            created_at: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        });
        
        const statistiques = {
            documents: {
                total: totalDocuments,
                en_attente: enAttente,
                approuves,
                rejetes,
                mis_en_avant: misEnAvant,
                taux_approbation: totalDocuments > 0 ? (approuves / (approuves + rejetes) * 100).toFixed(1) : 0
            },
            actions: actionsStats,
            signalements_30j: signalements
        };
        
        return this.repondreSucces(res, statistiques, 'Statistiques de modération récupérées');
    });

    /**
     * Lister les documents mis en avant
     * GET /api/communaute/:systeme/documents-mis-en-avant
     */
    documentsMisEnAvant = this.wrapAsync(async (req, res) => {
        this.validerParametres(req, ['systeme']);
        const { systeme } = req.params;
        const pagination = this.extrairePagination(req);
        const { type } = req.query;
        
        const conditions = {
            systeme,
            est_public: true,
            est_mis_en_avant: true,
            statut_moderation: 'APPROUVE',
            ...(type && { type })
        };
        
        const documents = await Document.findAll(conditions, {
            orderBy: [['mis_en_avant_le', 'DESC']],
            limit: pagination.limite,
            offset: pagination.offset
        });
        
        const total = await Document.count(conditions);
        
        return this.repondrePagine(res, documents, {
            ...pagination,
            total
        }, 'Documents mis en avant récupérés');
    });
}

module.exports = ModerationController;