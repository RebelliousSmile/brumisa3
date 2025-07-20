const logManager = require('../utils/logManager');

/**
 * Classe de base pour tous les services
 */
class BaseService {
    constructor(serviceName) {
        this.serviceName = serviceName;
        this.logger = logManager;
    }

    /**
     * Log une information
     */
    log(level, message, data = {}) {
        this.logger[level](`[${this.serviceName}] ${message}`, data);
    }

    /**
     * Log une erreur
     */
    logError(error, context = {}) {
        this.log('error', error.message, {
            error: error.stack,
            context
        });
    }

    /**
     * Valide que les données requises sont présentes
     */
    validerChamps(donnees, champsRequis) {
        const champsManquants = champsRequis.filter(champ => !donnees[champ]);
        
        if (champsManquants.length > 0) {
            throw new Error(`Champs manquants: ${champsManquants.join(', ')}`);
        }
    }

    /**
     * Nettoie les données en retirant les propriétés indésirables
     */
    nettoyerDonnees(donnees, champsAutorises) {
        const donneesNettoyees = {};
        
        champsAutorises.forEach(champ => {
            if (donnees.hasOwnProperty(champ)) {
                donneesNettoyees[champ] = donnees[champ];
            }
        });
        
        return donneesNettoyees;
    }

    /**
     * Génère un identifiant unique
     */
    genererId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * Formate une date pour l'affichage
     */
    formaterDate(date) {
        return new Date(date).toLocaleDateString('fr-FR');
    }

    /**
     * Vérifie si une valeur est vide (null, undefined, chaîne vide, etc.)
     */
    estVide(valeur) {
        return valeur === null || 
               valeur === undefined || 
               valeur === '' || 
               (Array.isArray(valeur) && valeur.length === 0) ||
               (typeof valeur === 'object' && Object.keys(valeur).length === 0);
    }

    /**
     * Convertit une chaîne en slug (URL-friendly)
     */
    genererSlug(texte) {
        return texte
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Retire les accents
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
    }

    /**
     * Gestion d'erreur standardisée
     */
    async gererErreur(error, contexte = {}) {
        this.logError(error, contexte);
        
        // Retourner une erreur formatée pour l'API
        return {
            succes: false,
            erreur: error.message,
            code: error.code || 'ERREUR_INTERNE'
        };
    }

    /**
     * Réponse de succès standardisée
     */
    reponseSucces(donnees = null, message = 'Opération réussie') {
        return {
            succes: true,
            message,
            donnees
        };
    }
}

module.exports = BaseService;