/**
 * Service pour la gestion des droits système
 * Respecte le principe de responsabilité unique (SOLID)
 */
class SystemRightsService {
    constructor() {
        this.validRights = ['public', 'private', 'common'];
    }

    /**
     * Valide si un droit système est valide
     * @param {string} systemRights - Le droit à valider
     * @returns {boolean}
     */
    isValidSystemRights(systemRights) {
        return this.validRights.includes(systemRights);
    }

    /**
     * Détermine les droits système pour un utilisateur et un document
     * @param {number|null} userId - ID utilisateur (0 pour anonyme, null pour non défini)
     * @param {Object} documentData - Données du document
     * @returns {string} - 'public', 'private', ou 'common'
     */
    determineSystemRights(userId, documentData = {}) {
        // Si explicitement défini et valide
        if (documentData.system_rights && this.isValidSystemRights(documentData.system_rights)) {
            return documentData.system_rights;
        }

        // Si utilisateur anonyme (userId = 0 ou null)
        if (!userId || userId === 0) {
            // Documents anonymes sont privés par défaut, sauf si partagés
            if (this.hasActiveSharing(documentData)) {
                return 'public';
            }
            return 'private';
        }

        // Pour utilisateurs connectés
        if (this.hasActiveSharing(documentData)) {
            return 'public';
        }

        // Par défaut privé pour utilisateurs connectés
        return 'private';
    }

    /**
     * Vérifie si le document a un partage actif
     * @param {Object} documentData - Données du document
     * @returns {boolean}
     */
    hasActiveSharing(documentData) {
        if (!documentData.url_partage) {
            return false;
        }

        try {
            const shareData = typeof documentData.url_partage === 'string' 
                ? JSON.parse(documentData.url_partage) 
                : documentData.url_partage;

            return shareData.active && new Date(shareData.expiration) > new Date();
        } catch (error) {
            return false;
        }
    }

    /**
     * Génère un chemin PDF complet avec nom de fichier unique
     * Format: {userId}_{systemRights}_{template}_{uniqueId}.pdf
     * @param {string} titre - Titre du document
     * @param {string} systeme - Système de jeu
     * @param {number|null} userId - ID utilisateur (0 pour anonyme)
     * @param {string} template - Template utilisé
     * @param {string} systemRights - Droits système
     * @returns {Object} - {fileName, fullPath}
     */
    generatePdfPath(titre, systeme, userId = null, template = 'default', systemRights = 'private') {
        const crypto = require('crypto');
        const path = require('path');
        
        // Générer un ID unique
        const uniqueId = crypto.randomBytes(8).toString('hex');
        
        // Formater les composants
        const userPart = userId && userId > 0 ? userId : 0;
        const rightsPart = this.isValidSystemRights(systemRights) ? systemRights : 'private';
        const templatePart = template;
        
        // Construire le nom de fichier simplifie
        const fileName = `${userPart}_${rightsPart}_${templatePart}_${uniqueId}.pdf`;
        
        // Construire le chemin complet
        const fullPath = path.join('output', 'pdfs', systeme, fileName);
        
        return {
            fileName,
            fullPath
        };
    }

    /**
     * Parse un nom de fichier pour extraire les composants
     * Supporte les deux formats: ancien (user-X_rights-Y) et nouveau (X_Y_Z_ID)
     * @param {string} filename - Nom de fichier
     * @returns {Object|null} - {userId, systemRights, template, uniqueId} ou null
     */
    parseFilename(filename) {
        // Nouveau format simplifié: userId_systemRights_template_uniqueId.pdf
        const newFormatRegex = /^([^_]+)_([^_]+)_([^_]+)_([^.]+)\.pdf$/;
        const newMatch = filename.match(newFormatRegex);
        
        if (newMatch) {
            const userId = newMatch[1] === '0' ? 0 : parseInt(newMatch[1], 10);
            const systemRights = newMatch[2];
            
            return {
                userId: isNaN(userId) ? 0 : userId,
                systemRights: this.isValidSystemRights(systemRights) ? systemRights : 'private',
                template: newMatch[3],
                uniqueId: newMatch[4],
                format: 'simplified'
            };
        }
        
        // Ancien format: user-X_rights-Y_template-Z_id-ID.pdf (rétrocompatibilité)
        const oldFormatRegex = /user-([^_]+)_rights-([^_]+)_template-([^_]+)_id-([^.]+)\.pdf$/;
        const oldMatch = filename.match(oldFormatRegex);
        
        if (oldMatch) {
            const userId = oldMatch[1] === '0' ? 0 : parseInt(oldMatch[1], 10);
            const systemRights = oldMatch[2];
            
            return {
                userId: isNaN(userId) ? 0 : userId,
                systemRights: this.isValidSystemRights(systemRights) ? systemRights : 'private',
                template: oldMatch[3],
                uniqueId: oldMatch[4],
                format: 'legacy'
            };
        }
        
        return null;
    }

    /**
     * Vérifie si un utilisateur peut accéder à un document
     * @param {number|null} userId - ID de l'utilisateur demandeur
     * @param {Object} documentData - Données du document
     * @returns {boolean}
     */
    canUserAccessDocument(userId, documentData) {
        const systemRights = documentData.system_rights || 'private';

        switch (systemRights) {
            case 'public':
                return true; // Tout le monde peut accéder

            case 'common':
                return userId && userId > 0; // Seuls les utilisateurs connectés

            case 'private':
            default:
                // Seul le propriétaire ou partage actif
                return (
                    (userId && documentData.utilisateur_id === userId) ||
                    this.hasActiveSharing(documentData)
                );
        }
    }

    /**
     * Vérifie si un utilisateur peut modifier un document
     * @param {number|null} userId - ID de l'utilisateur demandeur
     * @param {Object} documentData - Données du document
     * @returns {boolean}
     */
    canUserModifyDocument(userId, documentData) {
        // Seul le propriétaire peut modifier
        return userId && documentData.utilisateur_id === userId;
    }

    /**
     * Obtient la liste des droits système disponibles pour un utilisateur
     * @param {number|null} userId - ID utilisateur
     * @param {string} userType - Type d'utilisateur ('ADMIN', 'PREMIUM', 'STANDARD')
     * @returns {Array<string>}
     */
    getAvailableRightsForUser(userId, userType = 'STANDARD') {
        if (!userId || userId === 0) {
            // Utilisateurs anonymes ne peuvent créer que des documents privés
            return ['private'];
        }

        switch (userType) {
            case 'ADMIN':
                return ['public', 'private', 'common']; // Admins ont tous les droits

            case 'PREMIUM':
                return ['public', 'private', 'common']; // Premium ont tous les droits

            case 'STANDARD':
            default:
                return ['private', 'common']; // Standard peuvent faire privé et commun
        }
    }

    /**
     * Migre les anciens formats vers le nouveau système
     * @param {Object} oldData - Anciennes données
     * @returns {Object} - Nouvelles données
     */
    migrateFromLegacyFormat(oldData) {
        const newData = { ...oldData };

        // Migration statut_visibilite -> system_rights
        if (oldData.statut_visibilite && !oldData.system_rights) {
            switch (oldData.statut_visibilite) {
                case 'PUBLIC':
                    newData.system_rights = 'public';
                    break;
                case 'COMMUNAUTAIRE':
                    newData.system_rights = 'common';
                    break;
                case 'PRIVATE':
                default:
                    newData.system_rights = 'private';
                    break;
            }
        }

        // Assurer que system_rights est défini
        if (!newData.system_rights) {
            newData.system_rights = 'private';
        }

        return newData;
    }
}

module.exports = SystemRightsService;