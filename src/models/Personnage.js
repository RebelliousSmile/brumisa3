const BaseModel = require('./BaseModel');

/**
 * Modèle Personnage
 */
class Personnage extends BaseModel {
    constructor() {
        super('personnages', 'id');
        
        // Champs autorisés pour mass assignment
        this.fillable = [
            'nom', 'systeme_jeu', 'utilisateur_id', 'donnees_personnage',
            'image_avatar', 'statut', 'version_systeme', 'tags',
            'description_courte', 'notes_privees', 'partage_public'
        ];
        
        // Champs protégés
        this.guarded = ['id', 'date_creation', 'date_modification'];
        
        // Champs cachés lors de la sérialisation (selon contexte)
        this.hidden = ['notes_privees'];
        
        // Conversions automatiques
        this.casts = {
            donnees_personnage: 'json',
            tags: 'json',
            partage_public: 'boolean'
        };
        
        this.timestamps = true;
    }

    /**
     * Validation métier
     */
    async validate(data, operation = 'create') {
        const erreurs = [];

        // Nom requis
        if (!data.nom || data.nom.trim().length < 2) {
            erreurs.push('Nom du personnage requis (minimum 2 caractères)');
        }

        // Système de jeu requis
        const systemesValides = ['monsterhearts', 'engrenages', 'metro2033', 'mistengine'];
        if (!data.systeme_jeu || !systemesValides.includes(data.systeme_jeu)) {
            erreurs.push('Système de jeu requis et valide');
        }

        // Utilisateur requis
        if (!data.utilisateur_id) {
            erreurs.push('Utilisateur requis');
        }

        // Données personnage doivent être un objet
        if (data.donnees_personnage && typeof data.donnees_personnage !== 'object') {
            erreurs.push('Les données du personnage doivent être un objet JSON');
        }

        // Statut valide
        const statutsValides = ['BROUILLON', 'ACTIF', 'ARCHIVE', 'SUPPRIME'];
        if (data.statut && !statutsValides.includes(data.statut)) {
            erreurs.push('Statut invalide');
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
            data.statut = 'BROUILLON';
        }

        // Partage public par défaut
        if (data.partage_public === undefined) {
            data.partage_public = false;
        }

        // Tags par défaut
        if (!data.tags) {
            data.tags = [];
        }

        // Données personnage par défaut selon le système
        if (!data.donnees_personnage) {
            data.donnees_personnage = this.obtenirDonneesParDefaut(data.systeme_jeu);
        }

        return data;
    }

    /**
     * Obtient les données par défaut selon le système de jeu
     */
    obtenirDonneesParDefaut(systeme) {
        const defaults = {
            monsterhearts: {
                skin: '',
                look: '',
                stats: { hot: 0, cold: 0, volatile: 0, dark: 0 },
                moves: [],
                conditions: [],
                experience: 0
            },
            engrenages: {
                concept: '',
                attributs: { force: 2, agilite: 2, intellect: 2, perception: 2 },
                competences: {},
                sante: { vie: 10, stress: 0 },
                equipement: []
            },
            metro2033: {
                origine: '',
                motivation: '',
                caracteristiques: { physique: 2, mental: 2, social: 2 },
                competences: {},
                karma: 0,
                equipement: []
            },
            mistengine: {
                heritage: '',
                passion: '',
                traits: { grace: 2, sagesse: 2, courage: 2 },
                pouvoirs: [],
                liens: []
            }
        };

        return defaults[systeme] || {};
    }

    /**
     * Trouve les personnages d'un utilisateur
     */
    async findByUtilisateur(utilisateurId, filtres = {}) {
        let where = 'utilisateur_id = ? AND statut != ?';
        let params = [utilisateurId, 'SUPPRIME'];

        // Filtre par système
        if (filtres.systeme) {
            where += ' AND systeme_jeu = ?';
            params.push(filtres.systeme);
        }

        // Filtre par statut
        if (filtres.statut) {
            where += ' AND statut = ?';
            params.push(filtres.statut);
        }

        // Recherche textuelle
        if (filtres.recherche) {
            where += ' AND (nom LIKE ? OR description_courte LIKE ?)';
            params.push(`%${filtres.recherche}%`, `%${filtres.recherche}%`);
        }

        return await this.findAll(where, params, 'date_modification DESC');
    }

    /**
     * Trouve les personnages publics
     */
    async findPublics(filtres = {}, page = 1, limit = 20) {
        let where = 'partage_public = ? AND statut = ?';
        let params = [true, 'ACTIF'];

        // Filtre par système
        if (filtres.systeme) {
            where += ' AND systeme_jeu = ?';
            params.push(filtres.systeme);
        }

        // Recherche
        if (filtres.recherche) {
            where += ' AND (nom LIKE ? OR description_courte LIKE ?)';
            params.push(`%${filtres.recherche}%`, `%${filtres.recherche}%`);
        }

        return await this.paginate(page, limit, where, params, 'date_creation DESC');
    }

    /**
     * Clone un personnage
     */
    async cloner(id, utilisateurId, nouveauNom = null) {
        const original = await this.findById(id);
        if (!original) {
            throw new Error('Personnage non trouvé');
        }

        // Vérifier les droits (propriétaire ou personnage public)
        if (original.utilisateur_id !== utilisateurId && !original.partage_public) {
            throw new Error('Pas de droits pour cloner ce personnage');
        }

        const donneesClone = {
            nom: nouveauNom || `${original.nom} (Copie)`,
            systeme_jeu: original.systeme_jeu,
            utilisateur_id: utilisateurId,
            donnees_personnage: original.donnees_personnage,
            description_courte: original.description_courte,
            tags: [...(original.tags || [])],
            statut: 'BROUILLON',
            partage_public: false
        };

        return await this.create(donneesClone);
    }

    /**
     * Archive un personnage
     */
    async archiver(id, utilisateurId) {
        const personnage = await this.findById(id);
        if (!personnage) {
            throw new Error('Personnage non trouvé');
        }

        if (personnage.utilisateur_id !== utilisateurId) {
            throw new Error('Pas de droits pour archiver ce personnage');
        }

        return await this.update(id, { statut: 'ARCHIVE' });
    }

    /**
     * Restaure un personnage archivé
     */
    async restaurer(id, utilisateurId) {
        const personnage = await this.findById(id);
        if (!personnage) {
            throw new Error('Personnage non trouvé');
        }

        if (personnage.utilisateur_id !== utilisateurId) {
            throw new Error('Pas de droits pour restaurer ce personnage');
        }

        if (personnage.statut !== 'ARCHIVE') {
            throw new Error('Le personnage n\'est pas archivé');
        }

        return await this.update(id, { statut: 'ACTIF' });
    }

    /**
     * Met à jour les données du personnage
     */
    async mettreAJourDonnees(id, utilisateurId, nouvellesDonnees) {
        const personnage = await this.findById(id);
        if (!personnage) {
            throw new Error('Personnage non trouvé');
        }

        if (personnage.utilisateur_id !== utilisateurId) {
            throw new Error('Pas de droits pour modifier ce personnage');
        }

        const donneesActuelles = personnage.donnees_personnage || {};
        const donneesFusionnees = {
            ...donneesActuelles,
            ...nouvellesDonnees
        };

        return await this.update(id, { 
            donnees_personnage: donneesFusionnees,
            statut: 'ACTIF' // Le personnage devient actif une fois modifié
        });
    }

    /**
     * Ajoute un tag
     */
    async ajouterTag(id, utilisateurId, tag) {
        const personnage = await this.findById(id);
        if (!personnage || personnage.utilisateur_id !== utilisateurId) {
            throw new Error('Personnage non trouvé ou pas de droits');
        }

        const tags = personnage.tags || [];
        if (!tags.includes(tag)) {
            tags.push(tag);
            return await this.update(id, { tags });
        }

        return personnage;
    }

    /**
     * Retire un tag
     */
    async retirerTag(id, utilisateurId, tag) {
        const personnage = await this.findById(id);
        if (!personnage || personnage.utilisateur_id !== utilisateurId) {
            throw new Error('Personnage non trouvé ou pas de droits');
        }

        const tags = (personnage.tags || []).filter(t => t !== tag);
        return await this.update(id, { tags });
    }

    /**
     * Compte les personnages par système
     */
    async compterParSysteme() {
        const sql = `
            SELECT systeme_jeu, COUNT(*) as count 
            FROM ${this.tableName} 
            WHERE statut IN ('ACTIF', 'BROUILLON')
            GROUP BY systeme_jeu
        `;
        const db = require('../database/db');
        return await db.all(sql);
    }

    /**
     * Statistiques utilisateur
     */
    async statistiquesUtilisateur(utilisateurId) {
        const sql = `
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN statut = 'ACTIF' THEN 1 END) as actifs,
                COUNT(CASE WHEN statut = 'BROUILLON' THEN 1 END) as brouillons,
                COUNT(CASE WHEN statut = 'ARCHIVE' THEN 1 END) as archives,
                COUNT(CASE WHEN partage_public = 1 THEN 1 END) as publics
            FROM ${this.tableName} 
            WHERE utilisateur_id = ? AND statut != 'SUPPRIME'
        `;
        const db = require('../database/db');
        return await db.get(sql, [utilisateurId]);
    }
}

module.exports = Personnage;