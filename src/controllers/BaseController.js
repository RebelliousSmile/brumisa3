const logManager = require('../utils/logManager');

/**
 * Contrôleur de base avec gestion d'erreurs unifiée
 * Principe SOLID : Interface Segregation + DRY
 */
class BaseController {
    constructor(nomControleur) {
        this.logger = logManager;
        this.nomControleur = nomControleur;
    }

    /**
     * Gère les erreurs de manière uniforme (DRY)
     */
    gererErreur(res, erreur, codeStatut = 500) {
        this.logger.error(`Erreur dans ${this.nomControleur}:`, {
            message: erreur.message,
            stack: erreur.stack,
            code: erreur.code
        });
        
        // Gestion spécifique selon le type d'erreur
        if (erreur.name === 'ValidationError') {
            return this.repondreErreur(res, 400, erreur.message, 'validation', erreur.details);
        }
        
        if (erreur.code === 'UNAUTHORIZED') {
            return this.repondreErreur(res, 401, erreur.message, 'authentification');
        }
        
        if (erreur.code === 'FORBIDDEN') {
            return this.repondreErreur(res, 403, erreur.message, 'permission');
        }
        
        if (erreur.code === 'ENOTFOUND' || erreur.code === 'ECONNREFUSED') {
            return this.repondreErreur(res, 503, 'Service temporairement indisponible', 'service');
        }
        
        if (erreur.message.includes('duplicate') || erreur.code === '23505') {
            return this.repondreErreur(res, 409, 'Cette ressource existe déjà', 'conflit');
        }
        
        if (erreur.message.includes('not found') || erreur.code === 'ENOENT') {
            return this.repondreErreur(res, 404, 'Ressource non trouvée', 'non_trouve');
        }
        
        // Erreur générique
        const messagePublic = process.env.NODE_ENV === 'production' 
            ? 'Erreur interne du serveur'
            : erreur.message;
            
        return this.repondreErreur(res, codeStatut, messagePublic, 'erreur_interne');
    }

    /**
     * Formate une réponse d'erreur standardisée
     */
    repondreErreur(res, statut, message, type = 'erreur', details = null) {
        const reponse = {
            succes: false,
            message,
            type,
            timestamp: new Date().toISOString()
        };
        
        if (details && process.env.NODE_ENV !== 'production') {
            reponse.details = details;
        }
        
        return res.status(statut).json(reponse);
    }

    /**
     * Formate une réponse de succès standardisée
     */
    repondreSucces(res, donnees = null, message = 'Opération réussie', statut = 200) {
        const reponse = {
            succes: true,
            message,
            timestamp: new Date().toISOString()
        };
        
        if (donnees !== null) {
            reponse.donnees = donnees;
        }
        
        return res.status(statut).json(reponse);
    }

    /**
     * Valide les paramètres requis
     */
    validerParametres(req, parametresRequis) {
        const erreurs = [];
        
        parametresRequis.forEach(param => {
            const valeur = req.body[param] || req.params[param] || req.query[param];
            if (valeur === undefined || valeur === null || valeur === '') {
                erreurs.push(`Le paramètre '${param}' est requis`);
            }
        });
        
        if (erreurs.length > 0) {
            const erreur = new Error(erreurs.join(', '));
            erreur.name = 'ValidationError';
            erreur.details = erreurs;
            throw erreur;
        }
    }

    /**
     * Valide les champs requis dans le corps de la requête
     */
    validerCorps(req, champsRequis) {
        const erreurs = [];
        
        champsRequis.forEach(champ => {
            const valeur = req.body[champ];
            if (valeur === undefined || valeur === null || valeur === '') {
                erreurs.push(`Le champ '${champ}' est requis`);
            }
        });
        
        if (erreurs.length > 0) {
            const erreur = new Error(erreurs.join(', '));
            erreur.name = 'ValidationError';
            erreur.details = erreurs;
            throw erreur;
        }
    }

    /**
     * Valide les permissions utilisateur
     */
    verifierPermissions(req, roleRequis = 'UTILISATEUR') {
        if (!req.session || !req.session.utilisateur) {
            const erreur = new Error('Authentification requise');
            erreur.code = 'UNAUTHORIZED';
            throw erreur;
        }
        
        const utilisateur = req.session.utilisateur;
        const rolesHierarchie = ['UTILISATEUR', 'PREMIUM', 'ADMIN'];
        const roleUtilisateur = rolesHierarchie.indexOf(utilisateur.role);
        const roleMin = rolesHierarchie.indexOf(roleRequis);
        
        if (roleUtilisateur < roleMin) {
            const erreur = new Error(`Rôle ${roleRequis} requis (actuel: ${utilisateur.role})`);
            erreur.code = 'FORBIDDEN';
            throw erreur;
        }
        
        return utilisateur;
    }

    /**
     * Valide qu'un utilisateur peut accéder à une ressource
     */
    verifierProprietaire(req, ressourceUserId) {
        const utilisateur = this.verifierPermissions(req);
        
        // Admin peut tout voir
        if (utilisateur.role === 'ADMIN') {
            return utilisateur;
        }
        
        // Vérifier que l'utilisateur est le propriétaire
        if (utilisateur.id !== ressourceUserId) {
            const erreur = new Error('Accès non autorisé à cette ressource');
            erreur.code = 'FORBIDDEN';
            throw erreur;
        }
        
        return utilisateur;
    }

    /**
     * Extrait les paramètres de pagination
     */
    extrairePagination(req) {
        const page = parseInt(req.query.page) || 1;
        const limite = Math.min(parseInt(req.query.limite) || 20, 100); // Max 100
        const offset = (page - 1) * limite;
        
        return { page, limite, offset };
    }

    /**
     * Formate une réponse paginée
     */
    repondrePagine(res, donnees, pagination, message = 'Données récupérées') {
        return this.repondreSucces(res, {
            items: donnees,
            pagination: {
                page: pagination.page,
                limite: pagination.limite,
                total: pagination.total,
                pages: Math.ceil(pagination.total / pagination.limite),
                hasNext: pagination.page < Math.ceil(pagination.total / pagination.limite),
                hasPrev: pagination.page > 1
            }
        }, message);
    }

    /**
     * Middleware pour wrapper les méthodes async et gérer les erreurs
     */
    wrapAsync(fn) {
        return (req, res, next) => {
            Promise.resolve(fn.call(this, req, res, next)).catch(erreur => {
                this.gererErreur(res, erreur);
            });
        };
    }

    /**
     * Middleware pour logger les requêtes
     */
    loggerRequete(req, res, next) {
        const debut = Date.now();
        
        // Log de la requête entrante
        this.logger.info(`${req.method} ${req.path}`, {
            ip: req.ip,
            userAgent: req.get('user-agent'),
            utilisateur: req.session?.utilisateur?.id || 'anonyme'
        });
        
        // Log de la réponse
        res.on('finish', () => {
            const duree = Date.now() - debut;
            this.logger.info(`Response ${res.statusCode}`, {
                method: req.method,
                path: req.path,
                status: res.statusCode,
                duree: `${duree}ms`
            });
        });
        
        next();
    }

    /**
     * Sanitize les données entrantes
     */
    sanitizeInput(data) {
        if (typeof data === 'string') {
            return data.trim();
        }
        
        if (Array.isArray(data)) {
            return data.map(item => this.sanitizeInput(item));
        }
        
        if (typeof data === 'object' && data !== null) {
            const sanitized = {};
            Object.keys(data).forEach(key => {
                sanitized[key] = this.sanitizeInput(data[key]);
            });
            return sanitized;
        }
        
        return data;
    }

    /**
     * Valide le format email
     */
    validerEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    /**
     * Génère un ID unique
     */
    genererIdUnique() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
}

module.exports = BaseController;