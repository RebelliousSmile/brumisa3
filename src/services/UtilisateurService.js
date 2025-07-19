const BaseService = require('./BaseService');
const UtilisateurModel = require('../models/Utilisateur');
const crypto = require('crypto');

/**
 * Service pour la gestion des utilisateurs
 */
class UtilisateurService extends BaseService {
    constructor() {
        super('UtilisateurService');
        this.utilisateurModel = new UtilisateurModel();
    }

    /**
     * Crée un nouvel utilisateur
     */
    async creer(donnees) {
        try {
            // Valider les données
            this.validerDonnees(donnees);
            
            // Vérifier que l'email n'existe pas déjà
            const utilisateurExistant = await this.obtenirParEmail(donnees.email);
            if (utilisateurExistant) {
                throw new Error('Un utilisateur avec cet email existe déjà');
            }
            
            // Préparer les données
            const donneesCompletes = {
                ...donnees,
                email: donnees.email.toLowerCase().trim(),
                nom: donnees.nom.trim(),
                role: donnees.role || 'UTILISATEUR',
                actif: true,
                date_creation: new Date(),
                derniere_connexion: new Date()
            };
            
            // Créer l'utilisateur
            const utilisateur = await this.utilisateurModel.creer(donneesCompletes);
            
            this.logger.info('Utilisateur créé:', { 
                id: utilisateur.id, 
                email: utilisateur.email,
                role: utilisateur.role 
            });
            
            return utilisateur;
            
        } catch (erreur) {
            this.logger.error('Erreur lors de la création utilisateur:', erreur);
            throw erreur;
        }
    }

    /**
     * Obtient un utilisateur par ID
     */
    async obtenirParId(id) {
        try {
            return await this.utilisateurModel.obtenirParId(id);
        } catch (erreur) {
            this.logger.error(`Erreur lors de la récupération utilisateur ${id}:`, erreur);
            throw erreur;
        }
    }

    /**
     * Obtient un utilisateur par email
     */
    async obtenirParEmail(email) {
        try {
            return await this.utilisateurModel.obtenirParEmail(email.toLowerCase().trim());
        } catch (erreur) {
            this.logger.error(`Erreur lors de la récupération utilisateur par email ${email}:`, erreur);
            throw erreur;
        }
    }

    /**
     * Met à jour un utilisateur
     */
    async mettreAJour(id, donnees) {
        try {
            // Vérifier que l'utilisateur existe
            const utilisateurExistant = await this.obtenirParId(id);
            if (!utilisateurExistant) {
                throw new Error('Utilisateur non trouvé');
            }
            
            // Filtrer les données autorisées
            const donneesAutorisees = this.filtrerDonneesMAJ(donnees);
            
            // Valider les données
            if (Object.keys(donneesAutorisees).length === 0) {
                throw new Error('Aucune donnée valide à mettre à jour');
            }
            
            this.validerDonnees({ ...utilisateurExistant, ...donneesAutorisees }, true);
            
            // Ajouter la date de modification
            donneesAutorisees.date_modification = new Date();
            
            // Mettre à jour
            const utilisateurMisAJour = await this.utilisateurModel.mettreAJour(id, donneesAutorisees);
            
            this.logger.info('Utilisateur mis à jour:', { 
                id: utilisateurMisAJour.id, 
                champs: Object.keys(donneesAutorisees) 
            });
            
            return utilisateurMisAJour;
            
        } catch (erreur) {
            this.logger.error(`Erreur lors de la mise à jour utilisateur ${id}:`, erreur);
            throw erreur;
        }
    }

    /**
     * Met à jour le rôle d'un utilisateur
     */
    async mettreAJourRole(id, nouveauRole) {
        try {
            // Valider le rôle
            const rolesValides = ['UTILISATEUR', 'PREMIUM', 'ADMIN'];
            if (!rolesValides.includes(nouveauRole)) {
                throw new Error('Rôle invalide');
            }
            
            const utilisateur = await this.mettreAJour(id, { role: nouveauRole });
            
            this.logger.info('Rôle utilisateur mis à jour:', { 
                id, 
                nouveau_role: nouveauRole 
            });
            
            return utilisateur;
            
        } catch (erreur) {
            this.logger.error(`Erreur lors de la mise à jour du rôle ${id}:`, erreur);
            throw erreur;
        }
    }

    /**
     * Met à jour la dernière connexion
     */
    async mettreAJourDerniereConnexion(id) {
        try {
            return await this.mettreAJour(id, { 
                derniere_connexion: new Date() 
            });
        } catch (erreur) {
            this.logger.error(`Erreur lors de la mise à jour dernière connexion ${id}:`, erreur);
            throw erreur;
        }
    }

    /**
     * Désactive un utilisateur
     */
    async desactiver(id) {
        try {
            const utilisateur = await this.mettreAJour(id, { actif: false });
            
            this.logger.info('Utilisateur désactivé:', { id });
            
            return utilisateur;
            
        } catch (erreur) {
            this.logger.error(`Erreur lors de la désactivation utilisateur ${id}:`, erreur);
            throw erreur;
        }
    }

    /**
     * Réactive un utilisateur
     */
    async reactiver(id) {
        try {
            const utilisateur = await this.mettreAJour(id, { actif: true });
            
            this.logger.info('Utilisateur réactivé:', { id });
            
            return utilisateur;
            
        } catch (erreur) {
            this.logger.error(`Erreur lors de la réactivation utilisateur ${id}:`, erreur);
            throw erreur;
        }
    }

    /**
     * Supprime un utilisateur (soft delete)
     */
    async supprimer(id) {
        try {
            // Vérifier que l'utilisateur existe
            const utilisateur = await this.obtenirParId(id);
            if (!utilisateur) {
                throw new Error('Utilisateur non trouvé');
            }
            
            // Soft delete : désactiver et anonymiser
            const donneesAnonymisees = {
                email: `deleted_${id}@example.com`,
                nom: 'Utilisateur supprimé',
                actif: false,
                date_suppression: new Date()
            };
            
            await this.mettreAJour(id, donneesAnonymisees);
            
            this.logger.info('Utilisateur supprimé (soft delete):', { 
                id, 
                email_original: utilisateur.email 
            });
            
            return true;
            
        } catch (erreur) {
            this.logger.error(`Erreur lors de la suppression utilisateur ${id}:`, erreur);
            throw erreur;
        }
    }

    /**
     * Liste les utilisateurs (admin uniquement)
     */
    async lister(filtres = {}, pagination = {}) {
        try {
            const conditions = [];
            const valeurs = [];
            
            // Filtres optionnels
            if (filtres.role) {
                conditions.push('role = ?');
                valeurs.push(filtres.role);
            }
            
            if (filtres.actif !== undefined) {
                conditions.push('actif = ?');
                valeurs.push(filtres.actif);
            }
            
            if (filtres.recherche) {
                conditions.push('(nom ILIKE ? OR email ILIKE ?)');
                valeurs.push(`%${filtres.recherche}%`, `%${filtres.recherche}%`);
            }
            
            // Ne pas afficher les utilisateurs supprimés par défaut
            if (!filtres.inclure_supprimes) {
                conditions.push('date_suppression IS NULL');
            }
            
            const whereClause = conditions.length > 0 ? conditions.join(' AND ') : null;
            
            // Compter le total
            const total = await this.utilisateurModel.compter(whereClause, valeurs);
            
            // Récupérer les utilisateurs avec pagination
            const offset = pagination.offset || 0;
            const limite = pagination.limite || 20;
            
            const utilisateurs = await this.utilisateurModel.lister({
                where: whereClause,
                valeurs,
                order: 'date_creation DESC',
                limit: limite,
                offset
            });
            
            return { utilisateurs, total };
            
        } catch (erreur) {
            this.logger.error('Erreur lors de la liste des utilisateurs:', erreur);
            throw erreur;
        }
    }

    /**
     * Recherche d'utilisateurs
     */
    async rechercher(terme, options = {}) {
        try {
            const conditions = [
                'actif = ? AND date_suppression IS NULL',
                '(nom ILIKE ? OR email ILIKE ?)'
            ];
            const valeurs = [true, `%${terme}%`, `%${terme}%`];
            
            // Filtre par rôle si spécifié
            if (options.role) {
                conditions.push('role = ?');
                valeurs.push(options.role);
            }
            
            const limite = Math.min(options.limite || 10, 50);
            
            const utilisateurs = await this.utilisateurModel.lister({
                where: conditions.join(' AND '),
                valeurs,
                order: 'nom ASC',
                limit: limite
            });
            
            // Ne retourner que les infos publiques
            return utilisateurs.map(user => ({
                id: user.id,
                nom: user.nom,
                email: user.email,
                role: user.role
            }));
            
        } catch (erreur) {
            this.logger.error('Erreur lors de la recherche d\'utilisateurs:', erreur);
            throw erreur;
        }
    }

    /**
     * Obtient les statistiques des utilisateurs
     */
    async obtenirStatistiques() {
        try {
            return await this.utilisateurModel.obtenirStatistiques();
        } catch (erreur) {
            this.logger.error('Erreur lors du calcul des statistiques:', erreur);
            throw erreur;
        }
    }

    /**
     * Génère un token de récupération de mot de passe
     */
    async genererTokenRecuperation(email) {
        try {
            const utilisateur = await this.obtenirParEmail(email);
            if (!utilisateur || !utilisateur.actif) {
                // Ne pas révéler si l'email existe ou non
                this.logger.warn('Tentative de récupération pour email inexistant:', { email });
                return null;
            }
            
            // Générer un token sécurisé
            const token = crypto.randomBytes(32).toString('hex');
            const expiration = new Date(Date.now() + 60 * 60 * 1000); // 1 heure
            
            await this.mettreAJour(utilisateur.id, {
                token_recuperation: token,
                token_expiration: expiration
            });
            
            this.logger.info('Token de récupération généré:', { 
                utilisateur_id: utilisateur.id 
            });
            
            return { token, expiration };
            
        } catch (erreur) {
            this.logger.error('Erreur lors de la génération du token:', erreur);
            throw erreur;
        }
    }

    /**
     * Valide un token de récupération
     */
    async validerTokenRecuperation(token) {
        try {
            const utilisateur = await this.utilisateurModel.obtenirParToken(token);
            
            if (!utilisateur || !utilisateur.token_expiration) {
                return null;
            }
            
            // Vérifier l'expiration
            if (new Date() > new Date(utilisateur.token_expiration)) {
                // Nettoyer le token expiré
                await this.mettreAJour(utilisateur.id, {
                    token_recuperation: null,
                    token_expiration: null
                });
                return null;
            }
            
            return utilisateur;
            
        } catch (erreur) {
            this.logger.error('Erreur lors de la validation du token:', erreur);
            throw erreur;
        }
    }

    /**
     * Nettoie les tokens expirés
     */
    async nettoyerTokensExpires() {
        try {
            const maintenant = new Date();
            const nbNettoyes = await this.utilisateurModel.nettoyerTokensExpires(maintenant);
            
            this.logger.info(`${nbNettoyes} tokens expirés nettoyés`);
            return nbNettoyes;
            
        } catch (erreur) {
            this.logger.error('Erreur lors du nettoyage des tokens:', erreur);
            throw erreur;
        }
    }

    /**
     * Valide les données d'un utilisateur
     */
    validerDonnees(donnees, miseAJour = false) {
        const erreurs = [];
        
        // Validation du nom
        if (donnees.nom !== undefined) {
            if (!donnees.nom || donnees.nom.trim().length < 2) {
                erreurs.push('Le nom doit contenir au moins 2 caractères');
            }
            if (donnees.nom.trim().length > 100) {
                erreurs.push('Le nom ne peut pas dépasser 100 caractères');
            }
        }
        
        // Validation de l'email
        if (donnees.email !== undefined) {
            if (!donnees.email || !this.validerFormatEmail(donnees.email)) {
                erreurs.push('Format email invalide');
            }
        }
        
        // Validation du rôle
        if (donnees.role !== undefined) {
            const rolesValides = ['UTILISATEUR', 'PREMIUM', 'ADMIN'];
            if (!rolesValides.includes(donnees.role)) {
                erreurs.push('Rôle invalide');
            }
        }
        
        // Champs requis pour création
        if (!miseAJour) {
            if (!donnees.nom) {
                erreurs.push('Le nom est requis');
            }
            if (!donnees.email) {
                erreurs.push('L\'email est requis');
            }
        }
        
        if (erreurs.length > 0) {
            const erreur = new Error(erreurs.join(', '));
            erreur.name = 'ValidationError';
            erreur.details = erreurs;
            throw erreur;
        }
    }

    /**
     * Filtre les données autorisées pour une mise à jour
     */
    filtrerDonneesMAJ(donnees) {
        const champsAutorises = ['nom', 'email', 'role', 'actif', 'derniere_connexion'];
        const donneesFiltr = {};
        
        champsAutorises.forEach(champ => {
            if (donnees[champ] !== undefined) {
                donneesFiltr[champ] = donnees[champ];
            }
        });
        
        return donneesFiltr;
    }

    /**
     * Valide le format email
     */
    validerFormatEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    /**
     * Obtient les utilisateurs récemment connectés
     */
    async obtenirUtilisateursRecents(limite = 10) {
        try {
            return await this.utilisateurModel.lister({
                where: 'actif = ? AND derniere_connexion IS NOT NULL',
                valeurs: [true],
                order: 'derniere_connexion DESC',
                limit: limite
            });
        } catch (erreur) {
            this.logger.error('Erreur lors de la récupération des utilisateurs récents:', erreur);
            throw erreur;
        }
    }

    /**
     * Compte les utilisateurs par rôle
     */
    async compterParRole() {
        try {
            return await this.utilisateurModel.compterParRole();
        } catch (erreur) {
            this.logger.error('Erreur lors du comptage par rôle:', erreur);
            throw erreur;
        }
    }
}

module.exports = UtilisateurService;