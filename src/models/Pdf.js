const BaseModel = require('./BaseModel');
const path = require('path');

/**
 * Modèle PDF
 */
class Pdf extends BaseModel {
    constructor() {
        super('pdfs', 'id');
        
        // Champs autorisés pour mass assignment
        this.fillable = [
            'nom_fichier', 'titre', 'utilisateur_id', 'personnage_id',
            'systeme_jeu', 'chemin_fichier', 'taille_fichier', 'statut',
            'type_export', 'options_export', 'hash_fichier', 'url_partage',
            'template_utilise', 'statut_visibilite'
        ];
        
        // Champs protégés
        this.guarded = ['id', 'date_creation', 'date_modification'];
        
        // Conversions automatiques
        this.casts = {
            options_export: 'json',
            taille_fichier: 'integer'
        };
        
        this.timestamps = true;
    }

    /**
     * Validation métier
     */
    async validate(data, operation = 'create') {
        const erreurs = [];

        // Titre requis
        if (!data.titre || data.titre.trim().length < 2) {
            erreurs.push('Titre requis (minimum 2 caractères)');
        }

        // Utilisateur requis
        if (!data.utilisateur_id) {
            erreurs.push('Utilisateur requis');
        }

        // Système de jeu requis
        const systemesValides = ['monsterhearts', 'engrenages', 'metro2033', 'mistengine'];
        if (!data.systeme_jeu || !systemesValides.includes(data.systeme_jeu)) {
            erreurs.push('Système de jeu requis et valide');
        }

        // Type d'export valide
        const typesValides = ['FICHE_COMPLETE', 'FICHE_SIMPLE', 'RESUME', 'CARTE_REFERENCE'];
        if (data.type_export && !typesValides.includes(data.type_export)) {
            erreurs.push('Type d\'export invalide');
        }

        // Statut valide
        const statutsValides = ['EN_COURS', 'TERMINE', 'ERREUR', 'SUPPRIME'];
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
            data.statut = 'EN_COURS';
        }

        // Type d'export par défaut
        if (!data.type_export) {
            data.type_export = 'FICHE_COMPLETE';
        }

        // Options par défaut
        if (!data.options_export) {
            data.options_export = this.obtenirOptionsParDefaut(data.systeme_jeu, data.type_export);
        }

        // Génération du nom de fichier si non fourni
        if (!data.nom_fichier) {
            const template = data.template_utilise || 'default';
            const statut = this.determinerStatutDroits(data);
            data.nom_fichier = this.genererNomFichier(
                data.titre, 
                data.systeme_jeu, 
                data.utilisateur_id, 
                template, 
                statut
            );
        }

        // Génération du chemin de fichier
        if (!data.chemin_fichier) {
            data.chemin_fichier = this.genererCheminFichier(data.nom_fichier, data.systeme_jeu);
        }

        return data;
    }

    /**
     * Obtient les options par défaut selon le système et type
     */
    obtenirOptionsParDefaut(systeme, type) {
        const defaults = {
            format: 'A4',
            orientation: 'portrait',
            theme: systeme,
            inclure_image: true,
            inclure_notes: type === 'FICHE_COMPLETE',
            inclure_historique: type === 'FICHE_COMPLETE',
            qualite_image: 'haute',
            filigrane: false
        };

        // Options spécifiques par système
        switch (systeme) {
            case 'monsterhearts':
                defaults.couleur_theme = '#8b5cf6';
                defaults.police_titre = 'serif';
                break;
            case 'engrenages':
                defaults.couleur_theme = '#10b981';
                defaults.inclure_carte = true;
                break;
            case 'metro2033':
                defaults.couleur_theme = '#dc2626';
                defaults.style_post_apo = true;
                break;
            case 'mistengine':
                defaults.couleur_theme = '#ec4899';
                defaults.style_fantastique = true;
                break;
        }

        return defaults;
    }

    /**
     * Génère un nom de fichier unique avec user, droits, template et ID
     * Format: user-{userId}_rights-{statut}_template-{template}_id-{uniqueId}.pdf
     */
    genererNomFichier(titre, systeme, userId = null, template = 'default', statut = 'private') {
        const crypto = require('crypto');
        const uniqueId = crypto.randomBytes(8).toString('hex');
        const timestamp = Date.now();
        
        const titreClean = titre
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
        
        const userPart = userId ? `user-${userId}` : 'user-anonymous';
        const rightsPart = `rights-${statut}`;
        const templatePart = `template-${template}`;
        const idPart = `id-${uniqueId}`;
        
        return `${userPart}_${rightsPart}_${templatePart}_${idPart}.pdf`;
    }

    /**
     * Génère le chemin complet du fichier PDF
     */
    genererCheminFichier(nomFichier, systeme) {
        return path.join('output', 'pdfs', systeme, nomFichier);
    }

    /**
     * Détermine le statut des droits pour le nommage du fichier
     */
    determinerStatutDroits(data) {
        // Vérifier si le PDF a des paramètres de partage
        if (data.url_partage) {
            try {
                const urlData = JSON.parse(data.url_partage);
                if (urlData.active) {
                    return 'public';
                }
            } catch (error) {
                // Ignore
            }
        }

        // Vérifier le statut de visibilité si défini
        if (data.statut_visibilite) {
            switch (data.statut_visibilite) {
                case 'PUBLIC':
                    return 'public';
                case 'COMMUNAUTAIRE':
                    return 'community';
                case 'PRIVATE':
                default:
                    return 'private';
            }
        }

        // Par défaut, privé
        return 'private';
    }

    /**
     * Trouve les PDFs d'un utilisateur
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

        // Filtre par type
        if (filtres.type) {
            where += ' AND type_export = ?';
            params.push(filtres.type);
        }

        // Recherche textuelle
        if (filtres.recherche) {
            where += ' AND titre LIKE ?';
            params.push(`%${filtres.recherche}%`);
        }

        return await this.findAll(where, params, 'date_creation DESC');
    }

    /**
     * Trouve les PDFs d'un personnage
     */
    async findByPersonnage(personnageId) {
        return await this.findAll(
            'personnage_id = ? AND statut != ?',
            [personnageId, 'SUPPRIME'],
            'date_creation DESC'
        );
    }

    /**
     * Met à jour le statut de génération
     */
    async mettreAJourStatut(id, statut, donnees = {}) {
        const updateData = { statut, ...donnees };
        
        // Informations du fichier généré
        if (statut === 'TERMINE' && donnees.cheminFichier) {
            updateData.chemin_fichier = donnees.cheminFichier;
            updateData.taille_fichier = donnees.tailleFichier || 0;
            updateData.hash_fichier = donnees.hashFichier || null;
        }

        return await this.update(id, updateData);
    }

    /**
     * Marque comme supprimé (soft delete)
     */
    async marquerSupprime(id, utilisateurId) {
        const pdf = await this.findById(id);
        if (!pdf) {
            throw new Error('PDF non trouvé');
        }

        if (pdf.utilisateur_id !== utilisateurId) {
            throw new Error('Pas de droits pour supprimer ce PDF');
        }

        return await this.update(id, { statut: 'SUPPRIME' });
    }

    /**
     * Nettoie les PDFs en erreur anciens
     */
    async nettoyerPdfsErreur(joursAnciennete = 7) {
        const dateLimit = new Date();
        dateLimit.setDate(dateLimit.getDate() - joursAnciennete);
        
        const sql = `
            UPDATE ${this.tableName} 
            SET statut = 'SUPPRIME' 
            WHERE statut = 'ERREUR' 
            AND date_creation < ?
        `;
        
        const db = require('../database/db');
        const result = await db.run(sql, [dateLimit.toISOString()]);
        
        return result.changes;
    }

    /**
     * Statistiques de génération
     */
    async statistiquesGeneration(utilisateurId = null) {
        let where = '';
        let params = [];

        if (utilisateurId) {
            where = 'WHERE utilisateur_id = ?';
            params = [utilisateurId];
        }

        const sql = `
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN statut = 'TERMINE' THEN 1 END) as termines,
                COUNT(CASE WHEN statut = 'EN_COURS' THEN 1 END) as en_cours,
                COUNT(CASE WHEN statut = 'ERREUR' THEN 1 END) as erreurs,
                AVG(taille_fichier) as taille_moyenne,
                systeme_jeu,
                type_export
            FROM ${this.tableName} 
            ${where}
            AND statut != 'SUPPRIME'
            GROUP BY systeme_jeu, type_export
        `;
        
        const db = require('../database/db');
        return await db.all(sql, params);
    }

    /**
     * Obtient l'utilisation de l'espace disque
     */
    async utilisationEspace(utilisateurId = null) {
        let where = '';
        let params = [];

        if (utilisateurId) {
            where = 'WHERE utilisateur_id = ?';
            params = [utilisateurId];
        }

        const sql = `
            SELECT 
                COUNT(*) as nombre_fichiers,
                COALESCE(SUM(taille_fichier), 0) as taille_totale,
                AVG(taille_fichier) as taille_moyenne,
                MAX(taille_fichier) as taille_max
            FROM ${this.tableName} 
            ${where}
            AND statut = 'TERMINE'
        `;
        
        const db = require('../database/db');
        return await db.get(sql, params);
    }

    /**
     * Génère une URL de partage temporaire
     */
    async genererUrlPartage(id, utilisateurId, dureeHeures = 24) {
        const pdf = await this.findById(id);
        if (!pdf) {
            throw new Error('PDF non trouvé');
        }

        if (pdf.utilisateur_id !== utilisateurId) {
            throw new Error('Pas de droits pour partager ce PDF');
        }

        if (pdf.statut !== 'TERMINE') {
            throw new Error('Le PDF n\'est pas prêt pour le partage');
        }

        // Générer un token unique
        const crypto = require('crypto');
        const token = crypto.randomBytes(32).toString('hex');
        const expiration = new Date();
        expiration.setHours(expiration.getHours() + dureeHeures);

        const urlPartage = {
            token,
            expiration: expiration.toISOString(),
            active: true
        };

        await this.update(id, { url_partage: JSON.stringify(urlPartage) });

        return `${process.env.BASE_URL || 'http://localhost:3000'}/partage/pdf/${token}`;
    }

    /**
     * Vérifie la validité d'un token de partage
     */
    async verifierTokenPartage(token) {
        const pdf = await this.findOne('url_partage LIKE ?', [`%${token}%`]);
        
        if (!pdf || !pdf.url_partage) {
            return null;
        }

        try {
            const urlData = JSON.parse(pdf.url_partage);
            
            if (!urlData.active || urlData.token !== token) {
                return null;
            }

            if (new Date(urlData.expiration) < new Date()) {
                // Token expiré, le désactiver
                await this.update(pdf.id, { 
                    url_partage: JSON.stringify({ ...urlData, active: false }) 
                });
                return null;
            }

            return pdf;
        } catch (error) {
            return null;
        }
    }

    /**
     * Révoque l'URL de partage
     */
    async revoquerPartage(id, utilisateurId) {
        const pdf = await this.findById(id);
        if (!pdf || pdf.utilisateur_id !== utilisateurId) {
            throw new Error('PDF non trouvé ou pas de droits');
        }

        return await this.update(id, { url_partage: null });
    }

    /**
     * Getter pour l'URL de téléchargement du PDF
     */
    get urlTelecharger() {
        if (!this.chemin_fichier || this.statut !== 'TERMINE') {
            return null;
        }
        
        const baseUrl = process.env.BASE_URL || 'http://localhost:3076';
        const cheminRelatif = this.chemin_fichier.replace(/\\/g, '/');
        return `${baseUrl}/${cheminRelatif}`;
    }

    /**
     * Getter pour l'URL d'aperçu du PDF (iframe)
     */
    get urlApercu() {
        if (!this.urlTelecharger) {
            return null;
        }
        
        const baseUrl = process.env.BASE_URL || 'http://localhost:3076';
        return `${baseUrl}/api/pdfs/${this.id}/apercu`;
    }

    /**
     * Getter pour l'URL de partage public (si configuré)
     */
    get urlPartagePublic() {
        if (!this.url_partage) {
            return null;
        }

        try {
            const urlData = JSON.parse(this.url_partage);
            
            if (!urlData.active || new Date(urlData.expiration) < new Date()) {
                return null;
            }

            const baseUrl = process.env.BASE_URL || 'http://localhost:3076';
            return `${baseUrl}/partage/pdf/${urlData.token}`;
        } catch (error) {
            return null;
        }
    }

    /**
     * Getter pour l'URL de l'API du PDF
     */
    get urlApi() {
        const baseUrl = process.env.BASE_URL || 'http://localhost:3076';
        return `${baseUrl}/api/pdfs/${this.id}`;
    }

    /**
     * Détermine si le PDF est accessible publiquement
     */
    get estPublic() {
        return this.urlPartagePublic !== null;
    }

    /**
     * Getter pour les informations complètes d'URL
     */
    get urls() {
        return {
            telecharger: this.urlTelecharger,
            apercu: this.urlApercu,
            partage: this.urlPartagePublic,
            api: this.urlApi
        };
    }

    /**
     * Parse le nom de fichier pour extraire les métadonnées
     */
    get metadonneesFichier() {
        if (!this.nom_fichier) {
            return null;
        }

        const regex = /user-([^_]+)_rights-([^_]+)_template-([^_]+)_id-([^.]+)\.pdf$/;
        const match = this.nom_fichier.match(regex);

        if (!match) {
            return {
                userId: null,
                droits: 'unknown',
                template: 'default',
                uniqueId: null,
                format: 'legacy'
            };
        }

        return {
            userId: match[1] === 'anonymous' ? null : match[1],
            droits: match[2],
            template: match[3],
            uniqueId: match[4],
            format: 'structured'
        };
    }
}

module.exports = Pdf;