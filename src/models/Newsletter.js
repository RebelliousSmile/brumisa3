const BaseModel = require('./BaseModel');

/**
 * Modèle Newsletter (Abonnés et Actualités)
 */
class Newsletter extends BaseModel {
    constructor() {
        super('newsletter_abonnes', 'id');
        
        // Champs autorisés pour mass assignment
        this.fillable = [
            'email', 'nom', 'preferences', 'statut', 'token_confirmation',
            'ip_inscription', 'source', 'langue'
        ];
        
        // Champs protégés
        this.guarded = ['id', 'date_creation', 'date_modification'];
        
        // Champs cachés lors de la sérialisation
        this.hidden = ['token_confirmation', 'ip_inscription'];
        
        // Conversions automatiques
        this.casts = {
            preferences: 'json'
        };
        
        this.timestamps = true;
    }

    /**
     * Validation métier
     */
    async validate(data, operation = 'create') {
        const erreurs = [];

        // Email requis et format valide
        if (!data.email) {
            erreurs.push('Email requis');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            erreurs.push('Format email invalide');
        }

        // Nom optionnel mais si fourni, minimum 2 caractères
        if (data.nom && data.nom.trim().length < 2) {
            erreurs.push('Nom doit faire au moins 2 caractères');
        }

        // Statut valide
        const statutsValides = ['EN_ATTENTE', 'CONFIRME', 'DESABONNE', 'BOUNCE'];
        if (data.statut && !statutsValides.includes(data.statut)) {
            erreurs.push('Statut invalide');
        }

        // Email unique pour les abonnés actifs
        if (data.email) {
            const existing = await this.findOne(
                'email = ? AND statut IN (?, ?)', 
                [data.email, 'EN_ATTENTE', 'CONFIRME']
            );
            
            if (existing && (operation === 'create' || existing.id !== data.id)) {
                erreurs.push('Email déjà abonné');
            }
        }

        if (erreurs.length > 0) {
            throw new Error(`Erreurs de validation: ${erreurs.join(', ')}`);
        }

        return true;
    }

    /**
     * Définit les valeurs par défaut avant création
     */
    async beforeCreate(data) {
        // Statut par défaut
        if (!data.statut) {
            data.statut = 'EN_ATTENTE';
        }

        // Langue par défaut
        if (!data.langue) {
            data.langue = 'fr';
        }

        // Source par défaut
        if (!data.source) {
            data.source = 'site_web';
        }

        // Préférences par défaut
        if (!data.preferences) {
            data.preferences = {
                nouvelles_fonctionnalites: true,
                systemes_jeu: ['monsterhearts', 'engrenages', 'metro2033', 'mistengine'],
                frequence: 'hebdomadaire',
                format: 'html'
            };
        }

        // Générer token de confirmation
        if (!data.token_confirmation) {
            const crypto = require('crypto');
            data.token_confirmation = crypto.randomBytes(32).toString('hex');
        }

        // Nettoyer l'email
        data.email = data.email.toLowerCase().trim();

        return data;
    }

    /**
     * Abonne un email à la newsletter
     */
    async abonner(email, donnees = {}) {
        const donneesComplete = {
            email: email.toLowerCase().trim(),
            ...donnees
        };

        return await this.create(donneesComplete);
    }

    /**
     * Confirme un abonnement via token
     */
    async confirmer(token) {
        const abonne = await this.findOne('token_confirmation = ?', [token]);
        
        if (!abonne) {
            throw new Error('Token de confirmation invalide');
        }

        if (abonne.statut !== 'EN_ATTENTE') {
            throw new Error('Abonnement déjà confirmé ou invalide');
        }

        return await this.update(abonne.id, {
            statut: 'CONFIRME',
            token_confirmation: null,
            date_confirmation: new Date().toISOString()
        });
    }

    /**
     * Désabonne un email
     */
    async desabonner(email, token = null) {
        let abonne;
        
        if (token) {
            abonne = await this.findOne('token_confirmation = ?', [token]);
        } else {
            abonne = await this.findOne('email = ?', [email.toLowerCase().trim()]);
        }

        if (!abonne) {
            throw new Error('Abonnement non trouvé');
        }

        return await this.update(abonne.id, {
            statut: 'DESABONNE',
            date_desabonnement: new Date().toISOString()
        });
    }

    /**
     * Trouve tous les abonnés confirmés
     */
    async findConfirmes(preferences = {}) {
        let where = 'statut = ?';
        let params = ['CONFIRME'];

        // Filtre par préférences
        if (preferences.systeme) {
            where += ' AND preferences LIKE ?';
            params.push(`%"${preferences.systeme}"%`);
        }

        if (preferences.frequence) {
            where += ' AND preferences LIKE ?';
            params.push(`%"frequence":"${preferences.frequence}"%`);
        }

        return await this.findAll(where, params, 'date_creation DESC');
    }

    /**
     * Met à jour les préférences d'un abonné
     */
    async mettreAJourPreferences(email, nouvellesPreferences) {
        const abonne = await this.findOne('email = ?', [email.toLowerCase().trim()]);
        
        if (!abonne) {
            throw new Error('Abonné non trouvé');
        }

        const preferences = {
            ...(abonne.preferences || {}),
            ...nouvellesPreferences
        };

        return await this.update(abonne.id, { preferences });
    }

    /**
     * Marque un email comme bounce
     */
    async marquerBounce(email, raison = null) {
        const abonne = await this.findOne('email = ?', [email.toLowerCase().trim()]);
        
        if (abonne) {
            return await this.update(abonne.id, {
                statut: 'BOUNCE',
                raison_bounce: raison,
                date_bounce: new Date().toISOString()
            });
        }

        return null;
    }

    /**
     * Statistiques des abonnés
     */
    async statistiques() {
        const sql = `
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN statut = 'CONFIRME' THEN 1 END) as confirmes,
                COUNT(CASE WHEN statut = 'EN_ATTENTE' THEN 1 END) as en_attente,
                COUNT(CASE WHEN statut = 'DESABONNE' THEN 1 END) as desabonnes,
                COUNT(CASE WHEN statut = 'BOUNCE' THEN 1 END) as bounces
            FROM ${this.tableName}
        `;
        
        const db = require('../database/db');
        return await db.get(sql);
    }

    /**
     * Croissance des abonnements par mois
     */
    async croissanceParMois(moisNombre = 12) {
        const sql = `
            SELECT 
                strftime('%Y-%m', date_creation) as mois,
                COUNT(*) as nouveaux_abonnes,
                COUNT(CASE WHEN statut = 'CONFIRME' THEN 1 END) as confirmes
            FROM ${this.tableName}
            WHERE date_creation >= date('now', '-${moisNombre} months')
            GROUP BY strftime('%Y-%m', date_creation)
            ORDER BY mois DESC
        `;
        
        const db = require('../database/db');
        return await db.all(sql);
    }

    /**
     * Exporte les emails pour envoi
     */
    async exporterPourEnvoi(preferences = {}) {
        const abonnes = await this.findConfirmes(preferences);
        
        return abonnes.map(abonne => ({
            email: abonne.email,
            nom: abonne.nom || 'Abonné',
            preferences: abonne.preferences || {},
            token_desabonnement: abonne.token_confirmation
        }));
    }

    /**
     * Nettoie les anciens abonnements en attente
     */
    async nettoyerAnciens(joursAnciennete = 7) {
        const dateLimit = new Date();
        dateLimit.setDate(dateLimit.getDate() - joursAnciennete);
        
        const sql = `
            DELETE FROM ${this.tableName} 
            WHERE statut = 'EN_ATTENTE' 
            AND date_creation < ?
        `;
        
        const db = require('../database/db');
        const result = await db.run(sql, [dateLimit.toISOString()]);
        
        return result.changes;
    }
}

/**
 * Modèle Actualité pour la newsletter
 */
class Actualite extends BaseModel {
    constructor() {
        super('actualites', 'id');
        
        this.fillable = [
            'titre', 'contenu', 'resume', 'auteur', 'statut', 'type',
            'systeme_jeu', 'image', 'url_externe', 'date_publication',
            'tags', 'priorite'
        ];
        
        this.guarded = ['id', 'date_creation', 'date_modification'];
        
        this.casts = {
            tags: 'json',
            date_publication: 'date',
            priorite: 'integer'
        };
        
        this.timestamps = true;
    }

    async validate(data, operation = 'create') {
        const erreurs = [];

        if (!data.titre || data.titre.trim().length < 5) {
            erreurs.push('Titre requis (minimum 5 caractères)');
        }

        if (!data.contenu || data.contenu.trim().length < 20) {
            erreurs.push('Contenu requis (minimum 20 caractères)');
        }

        const typesValides = ['NOUVEAUTE', 'MISE_A_JOUR', 'EVENEMENT', 'ANNONCE'];
        if (data.type && !typesValides.includes(data.type)) {
            erreurs.push('Type invalide');
        }

        const statutsValides = ['BROUILLON', 'PLANIFIE', 'PUBLIE', 'ARCHIVE'];
        if (data.statut && !statutsValides.includes(data.statut)) {
            erreurs.push('Statut invalide');
        }

        if (erreurs.length > 0) {
            throw new Error(`Erreurs de validation: ${erreurs.join(', ')}`);
        }

        return true;
    }

    async beforeCreate(data) {
        if (!data.statut) {
            data.statut = 'BROUILLON';
        }

        if (!data.type) {
            data.type = 'NOUVEAUTE';
        }

        if (!data.priorite) {
            data.priorite = 1;
        }

        if (!data.date_publication) {
            data.date_publication = new Date().toISOString();
        }

        if (!data.tags) {
            data.tags = [];
        }

        return data;
    }

    /**
     * Trouve les actualités publiées
     */
    async findPubliees(limite = 10, systeme = null) {
        let where = 'statut = ?';
        let params = ['PUBLIE'];

        if (systeme) {
            where += ' AND (systeme_jeu = ? OR systeme_jeu IS NULL)';
            params.push(systeme);
        }

        return await this.findAll(where, params, 'date_publication DESC', limite);
    }

    /**
     * Publie une actualité
     */
    async publier(id) {
        return await this.update(id, {
            statut: 'PUBLIE',
            date_publication: new Date().toISOString()
        });
    }
}

module.exports = { Newsletter, Actualite };