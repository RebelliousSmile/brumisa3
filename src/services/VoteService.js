const BaseService = require('./BaseService');
const DocumentVote = require('../models/DocumentVote');
const Document = require('../models/Document');

/**
 * Service de gestion des votes communautaires
 * Implémente la logique métier pour le système de votes à 3 critères
 * selon FONCTIONNALITES/05-partage-communaute.md
 */
class VoteService extends BaseService {
    constructor() {
        super('VoteService');
    }

    /**
     * Voter pour un document avec validation complète
     * 
     * @param {number} documentId - ID du document
     * @param {number} utilisateurId - ID de l'utilisateur votant
     * @param {Object} votes - Notes des 3 critères (1-5)
     * @param {string} commentaire - Commentaire optionnel
     * @returns {Object} Résultat du vote avec statistiques
     */
    async voterDocument(documentId, utilisateurId, votes, commentaire = '') {
        try {
            this.validateVoteData(votes);
            
            // Validation métier du document
            const document = await this.validateDocumentPourVote(documentId, utilisateurId);
            
            // Vérifier si l'utilisateur a déjà voté
            const voteExistant = await DocumentVote.findOne({
                document_id: documentId,
                utilisateur_id: utilisateurId
            });
            
            if (voteExistant) {
                return await this.modifierVote(documentId, utilisateurId, votes, commentaire);
            }
            
            // Créer le nouveau vote
            const voteData = {
                document_id: documentId,
                utilisateur_id: utilisateurId,
                qualite_generale: parseInt(votes.qualite_generale),
                utilite_pratique: parseInt(votes.utilite_pratique),
                respect_gamme: parseInt(votes.respect_gamme),
                commentaire: commentaire.trim()
            };
            
            const vote = await DocumentVote.create(voteData);
            
            // Recalculer les statistiques du document
            const statistiques = await this.getStatistiquesDocument(documentId);
            
            this.log('info', 'Vote créé avec succès', {
                document_id: documentId,
                utilisateur_id: utilisateurId,
                votes: voteData
            });
            
            return {
                vote,
                statistiques,
                action: 'created'
            };
            
        } catch (error) {
            this.logError(error, { documentId, utilisateurId, votes });
            throw error;
        }
    }

    /**
     * Modifier un vote existant
     * 
     * @param {number} documentId - ID du document
     * @param {number} utilisateurId - ID de l'utilisateur
     * @param {Object} nouveauxVotes - Nouvelles notes
     * @param {string} commentaire - Nouveau commentaire
     * @returns {Object} Vote modifié avec statistiques
     */
    async modifierVote(documentId, utilisateurId, nouveauxVotes, commentaire = '') {
        try {
            this.validateVoteData(nouveauxVotes);
            
            const voteExistant = await DocumentVote.findOne({
                document_id: documentId,
                utilisateur_id: utilisateurId
            });
            
            if (!voteExistant) {
                throw new Error('Aucun vote existant trouvé pour ce document');
            }
            
            const updateData = {
                qualite_generale: parseInt(nouveauxVotes.qualite_generale),
                utilite_pratique: parseInt(nouveauxVotes.utilite_pratique),
                respect_gamme: parseInt(nouveauxVotes.respect_gamme),
                commentaire: commentaire.trim()
            };
            
            const vote = await DocumentVote.update(voteExistant.id, updateData);
            const statistiques = await this.getStatistiquesDocument(documentId);
            
            this.log('info', 'Vote modifié avec succès', {
                document_id: documentId,
                utilisateur_id: utilisateurId,
                ancien_vote: voteExistant,
                nouveau_vote: updateData
            });
            
            return {
                vote: { ...voteExistant, ...updateData },
                statistiques,
                action: 'updated'
            };
            
        } catch (error) {
            this.logError(error, { documentId, utilisateurId, nouveauxVotes });
            throw error;
        }
    }

    /**
     * Supprimer un vote
     * 
     * @param {number} documentId - ID du document
     * @param {number} utilisateurId - ID de l'utilisateur
     * @param {number} demandeurId - ID du demandeur (pour permissions)
     * @param {boolean} estAdmin - Le demandeur est-il admin
     * @returns {Object} Statistiques mises à jour
     */
    async supprimerVote(documentId, utilisateurId, demandeurId, estAdmin = false) {
        try {
            // Vérifier les permissions
            if (!estAdmin && demandeurId !== utilisateurId) {
                throw new Error('Vous ne pouvez supprimer que vos propres votes');
            }
            
            const vote = await DocumentVote.findOne({
                document_id: documentId,
                utilisateur_id: utilisateurId
            });
            
            if (!vote) {
                throw new Error('Vote non trouvé');
            }
            
            await DocumentVote.delete(vote.id);
            const statistiques = await this.getStatistiquesDocument(documentId);
            
            this.log('info', 'Vote supprimé', {
                document_id: documentId,
                utilisateur_id: utilisateurId,
                demandeur_id: demandeurId,
                est_admin: estAdmin
            });
            
            return { statistiques };
            
        } catch (error) {
            this.logError(error, { documentId, utilisateurId, demandeurId, estAdmin });
            throw error;
        }
    }

    /**
     * Obtenir les statistiques complètes d'un document
     * 
     * @param {number} documentId - ID du document
     * @returns {Object} Statistiques détaillées
     */
    async getStatistiquesDocument(documentId) {
        try {
            const statistiques = await DocumentVote.getStatistiquesDocument(documentId);
            
            // Enrichir avec des métriques calculées
            if (statistiques.nombre_votes > 0) {
                statistiques.score_popularite = this.calculerScorePopularite(statistiques);
                statistiques.niveau_consensus = this.calculerNiveauConsensus(documentId);
            }
            
            return statistiques;
            
        } catch (error) {
            this.logError(error, { documentId });
            throw error;
        }
    }

    /**
     * Obtenir le classement des documents par système JDR
     * 
     * @param {string} systeme - Système JDR
     * @param {string} critere - Critère de classement
     * @param {number} limite - Nombre de documents
     * @param {string} type - Type de document (optionnel)
     * @returns {Array} Documents classés
     */
    async getClassementDocuments(systeme, critere = 'moyenne_globale', limite = 20, type = null) {
        try {
            const conditions = {
                systeme,
                est_public: true,
                statut_moderation: 'APPROUVE'
            };
            
            if (type) {
                conditions.type = type;
            }
            
            const documents = await DocumentVote.getDocumentsPopulaires(conditions, limite, 0);
            
            // Enrichir avec des métadonnées de classement
            return documents.map((doc, index) => ({
                ...doc,
                rang: index + 1,
                score_popularite: this.calculerScorePopularite({
                    moyenne_globale: doc.moyenne_globale,
                    nombre_votes: doc.nombre_votes
                })
            }));
            
        } catch (error) {
            this.logError(error, { systeme, critere, limite, type });
            throw error;
        }
    }

    /**
     * Obtenir les documents récemment votés par un utilisateur
     * 
     * @param {number} utilisateurId - ID de l'utilisateur
     * @param {number} limite - Nombre de votes récents
     * @returns {Array} Votes récents avec informations document
     */
    async getVotesUtilisateur(utilisateurId, limite = 20) {
        try {
            const votes = await DocumentVote.findAll({
                utilisateur_id: utilisateurId
            }, {
                orderBy: [['updated_at', 'DESC']],
                limit: limite
            });
            
            // Enrichir avec les informations des documents
            const votesEnrichis = [];
            for (const vote of votes) {
                const document = await Document.findById(vote.document_id);
                if (document && document.est_public) {
                    votesEnrichis.push({
                        ...vote,
                        document: {
                            id: document.id,
                            titre: document.titre,
                            systeme: document.systeme,
                            type: document.type
                        }
                    });
                }
            }
            
            return votesEnrichis;
            
        } catch (error) {
            this.logError(error, { utilisateurId, limite });
            throw error;
        }
    }

    /**
     * Validation des données de vote
     * 
     * @private
     * @param {Object} votes - Données de vote à valider
     */
    validateVoteData(votes) {
        const criteres = ['qualite_generale', 'utilite_pratique', 'respect_gamme'];
        const erreurs = [];
        
        for (const critere of criteres) {
            const note = parseInt(votes[critere]);
            if (!note || note < 1 || note > 5) {
                erreurs.push(`${critere} doit être une note entre 1 et 5`);
            }
        }
        
        if (erreurs.length > 0) {
            throw new Error(`Données de vote invalides: ${erreurs.join(', ')}`);
        }
    }

    /**
     * Validation métier d'un document pour le vote
     * 
     * @private
     * @param {number} documentId - ID du document
     * @param {number} utilisateurId - ID de l'utilisateur votant
     * @returns {Object} Document validé
     */
    async validateDocumentPourVote(documentId, utilisateurId) {
        const document = await Document.findById(documentId);
        
        if (!document) {
            throw new Error('Document non trouvé');
        }
        
        if (!document.est_public) {
            throw new Error('Seuls les documents publics peuvent être votés');
        }
        
        if (document.statut_moderation !== 'APPROUVE') {
            throw new Error('Ce document n\'est pas encore approuvé pour le vote');
        }
        
        if (document.utilisateur_id === utilisateurId) {
            throw new Error('Vous ne pouvez pas voter pour vos propres documents');
        }
        
        return document;
    }

    /**
     * Calculer un score de popularité basé sur les votes et la moyenne
     * 
     * @private
     * @param {Object} statistiques - Statistiques de base
     * @returns {number} Score de popularité (0-100)
     */
    calculerScorePopularite(statistiques) {
        const { moyenne_globale, nombre_votes } = statistiques;
        
        if (nombre_votes === 0) return 0;
        
        // Formule: moyenne * coefficient de confiance basé sur le nombre de votes
        const coefficientConfiance = Math.min(nombre_votes / 10, 1); // Max confiance à 10+ votes
        const scoreBase = (moyenne_globale / 5) * 100; // Convertir en pourcentage
        
        return Math.round(scoreBase * coefficientConfiance);
    }

    /**
     * Calculer le niveau de consensus pour un document
     * 
     * @private
     * @param {number} documentId - ID du document
     * @returns {Promise<string>} Niveau de consensus
     */
    async calculerNiveauConsensus(documentId) {
        // Implémentation simple - pourrait être enrichie
        const votes = await DocumentVote.findAll({ document_id: documentId });
        
        if (votes.length < 3) return 'INSUFFISANT';
        
        // Calculer l'écart-type des moyennes individuelles
        const moyennesIndividuelles = votes.map(vote => 
            (vote.qualite_generale + vote.utilite_pratique + vote.respect_gamme) / 3
        );
        
        const moyenne = moyennesIndividuelles.reduce((sum, m) => sum + m, 0) / moyennesIndividuelles.length;
        const variance = moyennesIndividuelles.reduce((sum, m) => sum + Math.pow(m - moyenne, 2), 0) / moyennesIndividuelles.length;
        const ecartType = Math.sqrt(variance);
        
        if (ecartType < 0.5) return 'FORT';
        if (ecartType < 1) return 'MODERE';
        return 'FAIBLE';
    }
}

module.exports = VoteService;