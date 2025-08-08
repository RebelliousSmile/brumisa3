const BaseController = require('./BaseController');
const DocumentVote = require('../models/DocumentVote');
const Document = require('../models/Document');

/**
 * Contrôleur pour la gestion des votes sur documents
 * Implémente les fonctionnalités de vote communautaire selon FONCTIONNALITES/05-partage-communaute.md
 */
class VoteController extends BaseController {
    constructor() {
        super('VoteController');
    }

    /**
     * Voter pour un document public
     * POST /api/documents/:id/vote
     */
    voterDocument = this.wrapAsync(async (req, res) => {
        this.validerParametres(req, ['id']);
        const utilisateur = this.verifierPermissions(req, 'UTILISATEUR');
        
        const documentId = parseInt(req.params.id);
        const { qualite_generale, utilite_pratique, respect_gamme } = req.body;
        
        // Validation des scores de vote (1-5 étoiles)
        if (!qualite_generale || !utilite_pratique || !respect_gamme) {
            const erreur = new Error('Les 3 critères de vote sont requis : qualite_generale, utilite_pratique, respect_gamme');
            erreur.name = 'ValidationError';
            throw erreur;
        }
        
        [qualite_generale, utilite_pratique, respect_gamme].forEach(score => {
            const note = parseInt(score);
            if (note < 1 || note > 5) {
                const erreur = new Error('Chaque critère doit être noté entre 1 et 5 étoiles');
                erreur.name = 'ValidationError';
                throw erreur;
            }
        });

        // Vérifier que le document existe et est public
        const document = await Document.findById(documentId);
        if (!document) {
            return this.repondreErreur(res, 404, 'Document non trouvé', 'not_found');
        }
        
        if (!document.est_public) {
            return this.repondreErreur(res, 403, 'Ce document n\'est pas public et ne peut être voté', 'forbidden');
        }
        
        // Empêcher l'auto-vote
        if (document.utilisateur_id === utilisateur.id) {
            return this.repondreErreur(res, 403, 'Vous ne pouvez pas voter pour vos propres documents', 'forbidden');
        }

        try {
            // Créer ou mettre à jour le vote
            const voteData = {
                document_id: documentId,
                utilisateur_id: utilisateur.id,
                qualite_generale: parseInt(qualite_generale),
                utilite_pratique: parseInt(utilite_pratique),
                respect_gamme: parseInt(respect_gamme)
            };

            const vote = await DocumentVote.upsert(voteData, ['document_id', 'utilisateur_id']);
            
            // Calculer les nouvelles statistiques du document
            const statistiques = await DocumentVote.getStatistiquesDocument(documentId);
            
            this.logger.info('Vote enregistré', {
                document_id: documentId,
                utilisateur_id: utilisateur.id,
                scores: voteData
            });

            return this.repondreSucces(res, {
                vote,
                statistiques
            }, 'Vote enregistré avec succès');
            
        } catch (erreur) {
            // Gestion spécifique pour contrainte unique (upsert failed)
            if (erreur.code === '23505') {
                return this.repondreErreur(res, 409, 'Vous avez déjà voté pour ce document', 'conflit');
            }
            throw erreur;
        }
    });

    /**
     * Supprimer son vote sur un document
     * DELETE /api/documents/:id/vote
     */
    supprimerVote = this.wrapAsync(async (req, res) => {
        this.validerParametres(req, ['id']);
        const utilisateur = this.verifierPermissions(req, 'UTILISATEUR');
        
        const documentId = parseInt(req.params.id);
        
        const vote = await DocumentVote.findOne({
            document_id: documentId,
            utilisateur_id: utilisateur.id
        });
        
        if (!vote) {
            return this.repondreErreur(res, 404, 'Aucun vote trouvé pour ce document', 'not_found');
        }
        
        await DocumentVote.delete(vote.id);
        
        // Recalculer les statistiques
        const statistiques = await DocumentVote.getStatistiquesDocument(documentId);
        
        this.logger.info('Vote supprimé', {
            document_id: documentId,
            utilisateur_id: utilisateur.id
        });
        
        return this.repondreSucces(res, { statistiques }, 'Vote supprimé avec succès');
    });

    /**
     * Obtenir les statistiques de votes d'un document
     * GET /api/documents/:id/statistiques-votes
     */
    obtenirStatistiquesDocument = this.wrapAsync(async (req, res) => {
        this.validerParametres(req, ['id']);
        const documentId = parseInt(req.params.id);
        
        // Vérifier que le document existe
        const document = await Document.findById(documentId);
        if (!document) {
            return this.repondreErreur(res, 404, 'Document non trouvé', 'not_found');
        }
        
        const statistiques = await DocumentVote.getStatistiquesDocument(documentId);
        
        return this.repondreSucces(res, statistiques, 'Statistiques récupérées');
    });

    /**
     * Obtenir le vote d'un utilisateur pour un document
     * GET /api/documents/:id/mon-vote
     */
    obtenirMonVote = this.wrapAsync(async (req, res) => {
        this.validerParametres(req, ['id']);
        const utilisateur = this.verifierPermissions(req, 'UTILISATEUR');
        
        const documentId = parseInt(req.params.id);
        
        const vote = await DocumentVote.findOne({
            document_id: documentId,
            utilisateur_id: utilisateur.id
        });
        
        if (!vote) {
            return this.repondreSucces(res, null, 'Aucun vote trouvé');
        }
        
        return this.repondreSucces(res, vote, 'Vote récupéré');
    });

    /**
     * Lister les documents les plus plébiscités par système
     * GET /api/communaute/:systeme/documents-populaires
     */
    documentsPopulaires = this.wrapAsync(async (req, res) => {
        this.validerParametres(req, ['systeme']);
        const { systeme } = req.params;
        const pagination = this.extrairePagination(req);
        const { type } = req.query; // Filtrer par type de document optionnel
        
        const conditions = {
            systeme,
            est_public: true,
            ...(type && { type })
        };
        
        // Récupérer les documents avec leurs statistiques de votes
        const documentsAvecVotes = await DocumentVote.getDocumentsPopulaires(
            conditions,
            pagination.limite,
            pagination.offset
        );
        
        const total = await Document.count(conditions);
        
        return this.repondrePagine(res, documentsAvecVotes, {
            ...pagination,
            total
        }, 'Documents populaires récupérés');
    });

    /**
     * Lister les documents récemment partagés par système
     * GET /api/communaute/:systeme/documents-recents
     */
    documentsRecents = this.wrapAsync(async (req, res) => {
        this.validerParametres(req, ['systeme']);
        const { systeme } = req.params;
        const pagination = this.extrairePagination(req);
        const { type } = req.query;
        
        const conditions = {
            systeme,
            est_public: true,
            ...(type && { type })
        };
        
        const documents = await Document.findAll(conditions, {
            orderBy: [['created_at', 'DESC']],
            limit: pagination.limite,
            offset: pagination.offset
        });
        
        const total = await Document.count(conditions);
        
        return this.repondrePagine(res, documents, {
            ...pagination,
            total
        }, 'Documents récents récupérés');
    });
}

module.exports = VoteController;