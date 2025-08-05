const BaseModel = require('./BaseModel');
const crypto = require('crypto');

/**
 * Modèle Utilisateur
 */
class Utilisateur extends BaseModel {
    constructor() {
        super('utilisateurs', 'id');
        
        // Champs autorisés pour mass assignment
        this.fillable = [
            'nom', 'email', 'mot_de_passe', 'role', 'avatar', 
            'preferences', 'derniere_connexion', 'statut', 'actif',
            'token_recuperation', 'token_expiration'
        ];
        
        // Champs protégés
        this.guarded = ['id', 'date_creation', 'date_modification'];
        
        // Champs cachés lors de la sérialisation
        this.hidden = ['mot_de_passe'];
        
        // Conversions automatiques
        this.casts = {
            preferences: 'json',
            derniere_connexion: 'date'
        };
        
        // Gestion automatique des timestamps
        this.timestamps = true;
    }

    /**
     * Validation métier
     */
    async validate(data, operation = 'create') {
        const erreurs = [];

        // Pour les mises à jour, ne valider que les champs présents
        if (operation === 'create') {
            // Email requis pour création
            if (!data.email) {
                erreurs.push('Email requis');
            }
            
            // Nom requis pour création
            if (!data.nom || data.nom.trim().length < 2) {
                erreurs.push('Nom requis (minimum 2 caractères)');
            }
            
            // Mot de passe requis pour création
            if (!data.mot_de_passe || data.mot_de_passe.length < 6) {
                erreurs.push('Mot de passe requis (minimum 6 caractères)');
            }
        }

        // Validation format email si présent
        if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            erreurs.push('Format email invalide');
        }

        // Validation nom si présent
        if (data.nom !== undefined && data.nom.trim().length < 2) {
            erreurs.push('Nom requis (minimum 2 caractères)');
        }

        // Validation mot de passe si présent
        if (data.mot_de_passe !== undefined && data.mot_de_passe.length < 6) {
            erreurs.push('Mot de passe trop court (minimum 6 caractères)');
        }

        // Rôle valide si présent
        const rolesValides = ['UTILISATEUR', 'PREMIUM', 'ADMIN'];
        if (data.role && !rolesValides.includes(data.role)) {
            erreurs.push('Rôle invalide');
        }

        // Email unique si présent
        if (data.email) {
            const existing = await this.findOne('email = ?', [data.email.toLowerCase().trim()]);
            if (existing && (operation === 'create' || existing.id !== data.id)) {
                erreurs.push('Email déjà utilisé');
            }
        }

        if (erreurs.length > 0) {
            throw new Error(`Erreurs de validation: ${erreurs.join(', ')}`);
        }

        return true;
    }

    /**
     * Hash le mot de passe avant création
     */
    async beforeCreate(data) {
        if (data.mot_de_passe) {
            data.mot_de_passe = await this.hashMotDePasse(data.mot_de_passe);
        }
        
        // Rôle par défaut
        if (!data.role) {
            data.role = 'UTILISATEUR';
        }
        
        // Statut par défaut (utilise la colonne 'actif')
        if (data.actif === undefined) {
            data.actif = true;
        }

        return data;
    }

    /**
     * Hash le mot de passe avant mise à jour
     */
    async beforeUpdate(data) {
        if (data.mot_de_passe) {
            data.mot_de_passe = await this.hashMotDePasse(data.mot_de_passe);
        }
        return data;
    }

    /**
     * Hash un mot de passe
     */
    async hashMotDePasse(motDePasse) {
        return new Promise((resolve, reject) => {
            const salt = crypto.randomBytes(16).toString('hex');
            crypto.pbkdf2(motDePasse, salt, 100000, 64, 'sha512', (err, derivedKey) => {
                if (err) reject(err);
                resolve(salt + ':' + derivedKey.toString('hex'));
            });
        });
    }

    /**
     * Vérifie un mot de passe
     */
    async verifierMotDePasse(motDePasse, hash) {
        return new Promise((resolve, reject) => {
            const [salt, key] = hash.split(':');
            crypto.pbkdf2(motDePasse, salt, 100000, 64, 'sha512', (err, derivedKey) => {
                if (err) reject(err);
                resolve(key === derivedKey.toString('hex'));
            });
        });
    }

    /**
     * Trouve un utilisateur par email
     */
    async findByEmail(email) {
        return await this.findOne('email = ?', [email.toLowerCase().trim()]);
    }

    /**
     * Trouve un utilisateur par email (alias français)
     */
    async obtenirParEmail(email) {
        const { sql, params } = this.convertPlaceholders(
            `SELECT * FROM ${this.tableName} WHERE email = ? LIMIT 1`,
            [email.toLowerCase().trim()]
        );
        const db = require('../database/db');
        const result = await db.get(sql, params);
        // Ne pas utiliser serialize() pour garder le mot_de_passe pour l'authentification
        return result || null;
    }

    /**
     * Trouve un utilisateur par ID
     */
    async obtenirParId(id) {
        return await this.findById(id);
    }

    /**
     * Trouve un utilisateur par token de récupération
     */
    async obtenirParToken(token) {
        const { sql, params } = this.convertPlaceholders(
            `SELECT * FROM ${this.tableName} WHERE token_recuperation = ? AND token_expiration > ? LIMIT 1`,
            [token, new Date().toISOString()]
        );
        const db = require('../database/db');
        const result = await db.get(sql, params);
        return result ? this.serialize(result) : null;
    }

    /**
     * Authentifie un utilisateur
     */
    async authentifier(email, motDePasse) {
        const utilisateur = await this.findByEmail(email);
        
        if (!utilisateur) {
            return null;
        }

        if (!utilisateur.actif) {
            throw new Error('Compte désactivé');
        }

        const motDePasseValide = await this.verifierMotDePasse(motDePasse, utilisateur.mot_de_passe);
        
        if (!motDePasseValide) {
            return null;
        }

        // Mettre à jour dernière connexion
        await this.update(utilisateur.id, {
            derniere_connexion: new Date().toISOString()
        });

        return this.serialize(utilisateur);
    }

    /**
     * Compte les utilisateurs par rôle
     */
    async compterParRole() {
        const { sql, params } = this.convertPlaceholders(
            `SELECT role, COUNT(*) as count FROM ${this.tableName} WHERE actif = ? GROUP BY role`,
            [true]
        );
        const db = require('../database/db');
        return await db.all(sql, params);
    }

    /**
     * Liste des utilisateurs actifs récents
     */
    async listerRecents(limite = 10) {
        return await this.findAll(
            'statut = ?', 
            ['ACTIF'], 
            'derniere_connexion DESC', 
            limite
        );
    }

    /**
     * Recherche d'utilisateurs
     */
    async rechercher(query) {
        return await this.search(query, ['nom', 'email']);
    }

    /**
     * Bannir un utilisateur
     */
    async bannir(id, raison = null) {
        return await this.update(id, {
            statut: 'BANNI',
            raison_bannissement: raison
        });
    }

    /**
     * Débannir un utilisateur
     */
    async debannir(id) {
        return await this.update(id, {
            statut: 'ACTIF',
            raison_bannissement: null
        });
    }

    /**
     * Élever le rôle d'un utilisateur
     */
    async elevationRole(id, nouveauRole) {
        const rolesHierarchie = {
            'UTILISATEUR': 1,
            'PREMIUM': 2,
            'ADMIN': 3
        };

        const utilisateur = await this.findById(id);
        if (!utilisateur) {
            throw new Error('Utilisateur non trouvé');
        }

        const roleActuel = rolesHierarchie[utilisateur.role] || 0;
        const roleNouveau = rolesHierarchie[nouveauRole] || 0;

        if (roleNouveau <= roleActuel) {
            throw new Error('Impossible de rétrograder ou maintenir le même rôle');
        }

        return await this.update(id, { role: nouveauRole });
    }

    /**
     * Met à jour les préférences utilisateur
     */
    async mettreAJourPreferences(id, preferences) {
        const utilisateur = await this.findById(id);
        if (!utilisateur) {
            throw new Error('Utilisateur non trouvé');
        }

        const nouvellesPreferences = {
            ...(utilisateur.preferences || {}),
            ...preferences
        };

        return await this.update(id, { preferences: nouvellesPreferences });
    }
}

module.exports = Utilisateur;