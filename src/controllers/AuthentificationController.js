const BaseController = require('./BaseController');
const UtilisateurService = require('../services/UtilisateurService');
const EmailService = require('../services/EmailService');
const config = require('../config');

/**
 * Contrôleur pour l'authentification et gestion des utilisateurs
 */
class AuthentificationController extends BaseController {
    constructor() {
        super('AuthentificationController');
        this.utilisateurService = new UtilisateurService();
        this.emailService = new EmailService();
    }

    /**
     * Connexion utilisateur
     * POST /api/auth/connexion
     */
    connexion = this.wrapAsync(async (req, res) => {
        this.validerParametres(req, ['email', 'motDePasse']);
        
        const { email, motDePasse } = this.sanitizeInput(req.body);
        
        // Valider le format email
        if (!this.validerEmail(email)) {
            return this.repondreErreur(res, 400, 'Format email invalide');
        }
        
        // Authentifier l'utilisateur
        const utilisateur = await this.utilisateurService.authentifier(email, motDePasse);
        
        if (!utilisateur) {
            return this.repondreErreur(res, 401, 'Email ou mot de passe incorrect');
        }
        
        // Vérifier que le compte est actif
        if (!utilisateur.actif) {
            return this.repondreErreur(res, 403, 'Compte désactivé');
        }
        
        // Mettre à jour la dernière connexion
        await this.utilisateurService.mettreAJourDerniereConnexion(utilisateur.id);
        
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
        this.validerParametres(req, ['nom', 'email', 'motDePasse']);
        
        const { nom, email, motDePasse, confirmationMotDePasse } = this.sanitizeInput(req.body);
        
        // Valider le format email
        if (!this.validerEmail(email)) {
            return this.repondreErreur(res, 400, 'Format email invalide');
        }
        
        // Valider le mot de passe
        if (!motDePasse || motDePasse.length < 8) {
            return this.repondreErreur(res, 400, 'Le mot de passe doit contenir au moins 8 caractères');
        }
        
        // Vérifier la confirmation du mot de passe
        if (confirmationMotDePasse && motDePasse !== confirmationMotDePasse) {
            return this.repondreErreur(res, 400, 'Les mots de passe ne correspondent pas');
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
            mot_de_passe: motDePasse,
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
        
        // Envoyer l'email de bienvenue (de manière asynchrone)
        try {
            const emailResult = await this.emailService.envoyerBienvenue(
                utilisateur.email,
                utilisateur.nom
            );
            
            if (emailResult.success) {
                this.logger.info('Email de bienvenue envoyé', {
                    utilisateur_id: utilisateur.id,
                    resend_id: emailResult.id
                });
            } else {
                this.logger.error('Échec envoi email de bienvenue', {
                    utilisateur_id: utilisateur.id,
                    error: emailResult.error
                });
            }
        } catch (error) {
            // Ne pas bloquer l'inscription si l'email échoue
            this.logger.error('Erreur lors de l\'envoi de l\'email de bienvenue', { 
                context: 'envoi_email_bienvenue',
                utilisateur_id: utilisateur.id,
                error: error.message,
                stack: error.stack
            });
        }
        
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
     * Passer au compte Premium avec code d'accès
     * POST /api/auth/passer-premium
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

    /**
     * Demande de récupération de mot de passe
     * POST /api/auth/mot-de-passe-oublie
     */
    motDePasseOublie = this.wrapAsync(async (req, res) => {
        this.validerParametres(req, ['email']);
        
        const { email } = this.sanitizeInput(req.body);
        
        // Valider le format email
        if (!this.validerEmail(email)) {
            return this.repondreErreur(res, 400, 'Format email invalide');
        }
        
        // Générer le token de récupération
        const resultat = await this.utilisateurService.genererTokenRecuperation(email);
        
        if (resultat) {
            this.logger.info('Token de récupération demandé', { 
                email: email,
                ip: req.ip
            });
            
            // Récupérer l'utilisateur pour obtenir son nom
            const utilisateur = await this.utilisateurService.obtenirParEmail(email);
            
            // Envoyer l'email avec le lien de récupération
            try {
                const emailResult = await this.emailService.envoyerMotDePasseOublie(
                    email,
                    utilisateur.nom,
                    resultat.token
                );
                
                if (emailResult.success) {
                    this.logger.info('Email de récupération envoyé', {
                        email: email,
                        resend_id: emailResult.id
                    });
                } else {
                    this.logger.error('Échec envoi email de récupération', {
                        email: email,
                        error: emailResult.error
                    });
                }
            } catch (error) {
                this.logger.error('Erreur lors de l\'envoi de l\'email de récupération', { 
                    context: 'envoi_email_recuperation',
                    email: email,
                    error: error.message,
                    stack: error.stack
                });
            }
        }
        
        // Toujours répondre succès pour ne pas révéler si l'email existe
        return this.repondreSucces(res, null, 'Si cet email existe, vous recevrez un lien de récupération');
    });

    /**
     * Réinitialisation du mot de passe avec token
     * POST /api/auth/reinitialiser-mot-de-passe
     */
    reinitialiserMotDePasse = this.wrapAsync(async (req, res) => {
        this.validerParametres(req, ['token', 'motDePasse']);
        
        const { token, motDePasse, confirmationMotDePasse } = this.sanitizeInput(req.body);
        
        // Valider le mot de passe
        if (!motDePasse || motDePasse.length < 8) {
            return this.repondreErreur(res, 400, 'Le mot de passe doit contenir au moins 8 caractères');
        }
        
        // Vérifier la confirmation du mot de passe
        if (confirmationMotDePasse && motDePasse !== confirmationMotDePasse) {
            return this.repondreErreur(res, 400, 'Les mots de passe ne correspondent pas');
        }
        
        // Valider le token
        const utilisateur = await this.utilisateurService.validerTokenRecuperation(token);
        
        if (!utilisateur) {
            return this.repondreErreur(res, 400, 'Token invalide ou expiré');
        }
        
        // Mettre à jour le mot de passe
        await this.utilisateurService.mettreAJourMotDePasse(utilisateur.id, motDePasse);
        
        this.logger.info('Mot de passe réinitialisé', { 
            utilisateur_id: utilisateur.id,
            ip: req.ip
        });
        
        return this.repondreSucces(res, null, 'Mot de passe mis à jour avec succès');
    });

    /**
     * Test de l'endpoint mot de passe oublié avec l'email de configuration
     * GET /api/auth/test-mot-de-passe-oublie
     * Endpoint de développement uniquement
     */
    testMotDePasseOublie = this.wrapAsync(async (req, res) => {
        // Seulement en développement
        if (process.env.NODE_ENV === 'production') {
            return this.repondreErreur(res, 404, 'Endpoint non disponible en production');
        }

        const emailTest = process.env.TEST_EMAIL || process.env.ADMIN_EMAIL || 'internet@fxguillois.email';
        
        try {
            // Simuler une requête POST vers motDePasseOublie
            const fakeReq = {
                ...req,
                body: { email: emailTest },
                method: 'POST'
            };

            // Appeler la méthode motDePasseOublie
            await this.motDePasseOublie(fakeReq, res);
            
        } catch (error) {
            this.logger.error('Erreur lors du test mot de passe oublié', {
                error: error.message,
                stack: error.stack,
                email_test: emailTest
            });
            return this.repondreErreur(res, 500, 'Erreur lors du test');
        }
    });
}

module.exports = AuthentificationController;