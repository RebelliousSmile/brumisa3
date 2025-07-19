const BaseController = require('./BaseController');
const UtilisateurService = require('../services/UtilisateurService');
const config = require('../config');

/**
 * Contrôleur pour l'authentification et gestion des utilisateurs
 */
class AuthentificationController extends BaseController {
    constructor() {
        super('AuthentificationController');
        this.utilisateurService = new UtilisateurService();
    }

    /**
     * Connexion utilisateur (création si n'existe pas)
     * POST /api/auth/connexion
     */
    connexion = this.wrapAsync(async (req, res) => {
        this.validerParametres(req, ['nom', 'email']);
        
        const { nom, email } = this.sanitizeInput(req.body);
        
        // Valider le format email
        if (!this.validerEmail(email)) {
            return this.repondreErreur(res, 400, 'Format email invalide');
        }
        
        // Trouver ou créer l'utilisateur
        let utilisateur = await this.utilisateurService.obtenirParEmail(email);
        
        if (!utilisateur) {
            // Créer un nouveau utilisateur
            utilisateur = await this.utilisateurService.creer({
                nom: nom.trim(),
                email: email.toLowerCase().trim(),
                role: 'UTILISATEUR'
            });
            
            this.logger.info('Nouvel utilisateur créé', { 
                id: utilisateur.id, 
                email: utilisateur.email 
            });
        } else {
            // Mettre à jour la dernière connexion
            await this.utilisateurService.mettreAJourDerniereConnexion(utilisateur.id);
        }
        
        // Créer la session
        req.session.utilisateur = {
            id: utilisateur.id,
            nom: utilisateur.nom,
            email: utilisateur.email,
            role: utilisateur.role
        };
        
        // Sauvegarder la session
        await new Promise((resolve, reject) => {
            req.session.save((err) => {
                if (err) reject(err);
                else resolve();
            });
        });
        
        this.logger.info('Connexion réussie', { 
            utilisateur_id: utilisateur.id,
            ip: req.ip
        });
        
        return this.repondreSucces(res, {
            utilisateur: {
                id: utilisateur.id,
                nom: utilisateur.nom,
                email: utilisateur.email,
                role: utilisateur.role
            }
        }, 'Connexion réussie');
    });

    /**
     * Inscription d'un nouvel utilisateur
     * POST /api/auth/inscription
     */
    inscription = this.wrapAsync(async (req, res) => {
        this.validerParametres(req, ['nom', 'email']);
        
        const { nom, email } = this.sanitizeInput(req.body);
        
        // Valider le format email
        if (!this.validerEmail(email)) {
            return this.repondreErreur(res, 400, 'Format email invalide');
        }
        
        // Vérifier que l'utilisateur n'existe pas déjà
        const utilisateurExistant = await this.utilisateurService.obtenirParEmail(email);
        if (utilisateurExistant) {
            return this.repondreErreur(res, 409, 'Un compte avec cet email existe déjà');
        }
        
        // Créer le nouvel utilisateur
        const utilisateur = await this.utilisateurService.creer({
            nom: nom.trim(),
            email: email.toLowerCase().trim(),
            role: 'UTILISATEUR'
        });
        
        // Créer la session
        req.session.utilisateur = {
            id: utilisateur.id,
            nom: utilisateur.nom,
            email: utilisateur.email,
            role: utilisateur.role
        };
        
        // Sauvegarder la session
        await new Promise((resolve, reject) => {
            req.session.save((err) => {
                if (err) reject(err);
                else resolve();
            });
        });
        
        this.logger.info('Inscription et connexion réussies', { 
            utilisateur_id: utilisateur.id,
            ip: req.ip
        });
        
        return this.repondreSucces(res, {
            utilisateur: {
                id: utilisateur.id,
                nom: utilisateur.nom,
                email: utilisateur.email,
                role: utilisateur.role
            }
        }, 'Inscription réussie', 201);
    });

    /**
     * Déconnexion
     * POST /api/auth/deconnexion
     */
    deconnexion = this.wrapAsync(async (req, res) => {
        const utilisateurId = req.session?.utilisateur?.id;
        
        // Détruire la session
        await new Promise((resolve, reject) => {
            req.session.destroy((err) => {
                if (err) reject(err);
                else resolve();
            });
        });
        
        // Effacer le cookie de session
        res.clearCookie('connect.sid');
        
        if (utilisateurId) {
            this.logger.info('Déconnexion réussie', { 
                utilisateur_id: utilisateurId,
                ip: req.ip
            });
        }
        
        return this.repondreSucces(res, null, 'Déconnexion réussie');
    });

    /**
     * Élévation de rôle avec code d'accès
     * POST /api/auth/elevation-role
     */
    elevationRole = this.wrapAsync(async (req, res) => {
        const utilisateur = this.verifierPermissions(req);
        this.validerParametres(req, ['code_acces']);
        
        const { code_acces } = req.body;
        
        // Vérifier le code d'accès
        let nouveauRole = null;
        
        if (code_acces === config.auth.codes.premium) {
            nouveauRole = 'PREMIUM';
        } else if (code_acces === config.auth.codes.admin) {
            nouveauRole = 'ADMIN';
        } else {
            this.logger.warn('Tentative d\'élévation avec code invalide', {
                utilisateur_id: utilisateur.id,
                code_fourni: code_acces,
                ip: req.ip
            });
            return this.repondreErreur(res, 401, 'Code d\'accès invalide');
        }
        
        // Mettre à jour le rôle en base
        const utilisateurMisAJour = await this.utilisateurService.mettreAJourRole(
            utilisateur.id, 
            nouveauRole
        );
        
        // Mettre à jour la session
        req.session.utilisateur.role = nouveauRole;
        
        // Sauvegarder la session
        await new Promise((resolve, reject) => {
            req.session.save((err) => {
                if (err) reject(err);
                else resolve();
            });
        });
        
        this.logger.info('Élévation de rôle réussie', {
            utilisateur_id: utilisateur.id,
            ancien_role: utilisateur.role,
            nouveau_role: nouveauRole,
            ip: req.ip
        });
        
        return this.repondreSucces(res, {
            utilisateur: {
                id: utilisateurMisAJour.id,
                nom: utilisateurMisAJour.nom,
                email: utilisateurMisAJour.email,
                role: utilisateurMisAJour.role
            },
            role: nouveauRole
        }, `Rôle élevé vers ${nouveauRole}`);
    });

    /**
     * Vérifie le statut de la session
     * GET /api/auth/statut
     */
    verifierStatut = this.wrapAsync(async (req, res) => {
        if (!req.session || !req.session.utilisateur) {
            return this.repondreErreur(res, 401, 'Non authentifié');
        }
        
        // Vérifier que l'utilisateur existe toujours
        const utilisateur = await this.utilisateurService.obtenirParId(req.session.utilisateur.id);
        
        if (!utilisateur || !utilisateur.actif) {
            // Détruire la session si l'utilisateur n'existe plus
            await new Promise((resolve) => {
                req.session.destroy(() => resolve());
            });
            return this.repondreErreur(res, 401, 'Session invalide');
        }
        
        // Mettre à jour les informations de session si nécessaires
        if (req.session.utilisateur.role !== utilisateur.role) {
            req.session.utilisateur.role = utilisateur.role;
            await new Promise((resolve, reject) => {
                req.session.save((err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
        }
        
        return this.repondreSucces(res, {
            utilisateur: req.session.utilisateur,
            session_id: req.sessionID
        }, 'Session valide');
    });

    /**
     * Obtient le profil utilisateur
     * GET /api/auth/profil
     */
    obtenirProfil = this.wrapAsync(async (req, res) => {
        const utilisateur = this.verifierPermissions(req);
        
        const profilComplet = await this.utilisateurService.obtenirParId(utilisateur.id);
        
        if (!profilComplet) {
            return this.repondreErreur(res, 404, 'Utilisateur non trouvé');
        }
        
        // Ne pas retourner d'informations sensibles
        const profil = {
            id: profilComplet.id,
            nom: profilComplet.nom,
            email: profilComplet.email,
            role: profilComplet.role,
            date_creation: profilComplet.date_creation,
            derniere_connexion: profilComplet.derniere_connexion
        };
        
        return this.repondreSucces(res, profil, 'Profil récupéré');
    });

    /**
     * Met à jour le profil utilisateur
     * PUT /api/auth/profil
     */
    mettreAJourProfil = this.wrapAsync(async (req, res) => {
        const utilisateur = this.verifierPermissions(req);
        
        const donneesAutorisees = this.sanitizeInput({
            nom: req.body.nom
        });
        
        // Validation
        if (donneesAutorisees.nom && donneesAutorisees.nom.trim().length < 2) {
            return this.repondreErreur(res, 400, 'Le nom doit contenir au moins 2 caractères');
        }
        
        const utilisateurMisAJour = await this.utilisateurService.mettreAJour(
            utilisateur.id, 
            donneesAutorisees
        );
        
        // Mettre à jour la session
        if (donneesAutorisees.nom) {
            req.session.utilisateur.nom = utilisateurMisAJour.nom;
            await new Promise((resolve, reject) => {
                req.session.save((err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
        }
        
        return this.repondreSucces(res, {
            id: utilisateurMisAJour.id,
            nom: utilisateurMisAJour.nom,
            email: utilisateurMisAJour.email,
            role: utilisateurMisAJour.role
        }, 'Profil mis à jour');
    });

    /**
     * Middleware pour vérifier l'authentification
     */
    middlewareAuth = (req, res, next) => {
        if (!req.session || !req.session.utilisateur) {
            return this.repondreErreur(res, 401, 'Authentification requise');
        }
        next();
    };

    /**
     * Middleware pour vérifier un rôle minimum
     */
    middlewareRole = (roleRequis) => {
        return (req, res, next) => {
            try {
                this.verifierPermissions(req, roleRequis);
                next();
            } catch (erreur) {
                this.gererErreur(res, erreur);
            }
        };
    };
}

module.exports = AuthentificationController;