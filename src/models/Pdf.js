const BaseModel = require('./BaseModel');
const path = require('path');
const SystemRightsService = require('../services/SystemRightsService');

/**
 * Modèle PDF
 */
class Pdf extends BaseModel {
    constructor() {
        super('pdfs', 'id');
        
        // Service pour la gestion des droits
        this.systemRightsService = new SystemRightsService();
        
        // Champs autorisés pour mass assignment
        this.fillable = [
            'nom_fichier', 'titre', 'utilisateur_id', 'personnage_id',
            'systeme_jeu', 'chemin_fichier', 'taille_fichier', 'statut',
            'type_export', 'options_export', 'hash_fichier', 'url_partage',
            'template_utilise', 'system_rights'
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

        // DEBUG: Ajouter des logs pour comprendre le problème
        console.log('DEBUG - Validation Pdf:', JSON.stringify(data, null, 2));
        
        // Système de jeu requis
        const systemesValides = ['monsterhearts', 'engrenages', 'metro2033', 'mistengine'];
        if (!data.systeme_jeu || !systemesValides.includes(data.systeme_jeu)) {
            console.log('DEBUG - Système invalide:', data.systeme_jeu, 'dans', systemesValides);
            erreurs.push('Système de jeu requis et valide');
        }

        // Type d'export valide
        const typesValides = ['FICHE_COMPLETE', 'FICHE_SIMPLE', 'RESUME', 'CARTE_REFERENCE'];
        if (data.type_export && !typesValides.includes(data.type_export)) {
            erreurs.push('Type d\'export invalide');
        }

        // Statut valide
        const statutsValides = ['EN_ATTENTE', 'EN_COURS', 'TERMINE', 'ERREUR', 'SUPPRIME'];
        if (data.statut && !statutsValides.includes(data.statut)) {
            console.log('DEBUG - Statut invalide:', data.statut, 'dans', statutsValides);
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

        // Génération du chemin et nom de fichier si non fourni
        if (!data.nom_fichier || !data.chemin_fichier) {
            const template = data.template_utilise || 'default';
            const systemRights = this.determinerSystemRights(data);
            const pdfPath = this.systemRightsService.generatePdfPath(
                data.titre, 
                data.systeme_jeu, 
                data.utilisateur_id, 
                template, 
                systemRights
            );
            
            data.nom_fichier = pdfPath.fileName;
            data.chemin_fichier = pdfPath.fullPath;
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
     * Génère un nom de fichier unique (LEGACY - utiliser SystemRightsService.generatePdfPath)
     * @deprecated Utiliser this.systemRightsService.generatePdfPath() à la place
     */
    genererNomFichier(titre, systeme, userId = null, template = 'default', systemRights = 'private') {
        const result = this.systemRightsService.generatePdfPath(titre, systeme, userId, template, systemRights);
        return result.fileName;
    }

    /**
     * Génère le chemin complet du fichier PDF (LEGACY - utiliser SystemRightsService.generatePdfPath)
     * @deprecated Utiliser this.systemRightsService.generatePdfPath() à la place
     */
    genererCheminFichier(nomFichier, systeme) {
        return path.join('output', 'pdfs', systeme, nomFichier);
    }

    /**
     * Détermine le statut des droits pour le nommage du fichier
     */
    determinerSystemRights(data) {
        return this.systemRightsService.determineSystemRights(data.utilisateur_id, data);
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
        
        const baseUrl = process.env.BASE_URL;
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
        
        const baseUrl = process.env.BASE_URL;
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

            const baseUrl = process.env.BASE_URL;
            return `${baseUrl}/partage/pdf/${urlData.token}`;
        } catch (error) {
            return null;
        }
    }

    /**
     * Getter pour l'URL de l'API du PDF
     */
    get urlApi() {
        const baseUrl = process.env.BASE_URL;
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

        // Utiliser le service s'il est disponible, sinon parsing direct
        if (this.systemRightsService) {
            const parsed = this.systemRightsService.parseFilename(this.nom_fichier);
            if (parsed) {
                return {
                    userId: parsed.userId,
                    droits: parsed.systemRights,
                    template: parsed.template,
                    uniqueId: parsed.uniqueId,
                    format: 'structured'
                };
            }
        }

        // Fallback: parsing direct
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

        const userId = match[1] === '0' ? 0 : parseInt(match[1], 10);
        return {
            userId: isNaN(userId) ? 0 : userId,
            droits: match[2],
            template: match[3],
            uniqueId: match[4],
            format: 'structured'
        };
    }

    /**
     * Obtient les statistiques globales des PDFs
     */
    async obtenirStatistiques() {
        try {
            const db = require('../database/db');
            const maintenant = new Date();
            const debutMois = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1);
            
            const sql = `
                SELECT 
                    COUNT(*) as total,
                    COUNT(CASE WHEN date_creation >= ? THEN 1 END) as ce_mois,
                    COUNT(CASE WHEN statut = 'EN_TRAITEMENT' THEN 1 END) as en_cours,
                    COUNT(CASE WHEN statut = 'ERREUR' THEN 1 END) as echecs,
                    COUNT(CASE WHEN type_pdf LIKE '%monsterhearts%' THEN 1 END) as total_monsterhearts,
                    COUNT(CASE WHEN type_pdf LIKE '%engrenages%' THEN 1 END) as total_engrenages,
                    COUNT(CASE WHEN type_pdf LIKE '%metro%' THEN 1 END) as total_metro,
                    COUNT(CASE WHEN type_pdf LIKE '%mist%' THEN 1 END) as total_mist
                FROM ${this.tableName} 
                WHERE statut != 'SUPPRIME'
            `;
            
            const stats = await db.get(sql, [debutMois.toISOString()]);
            return stats;
            
        } catch (error) {
            console.error('Erreur statistiques PDFs:', error);
            return null;
        }
    }

    /**
     * Obtient les PDFs récents
     */
    async obtenirRecents(limite = 10) {
        try {
            return await this.findAll(
                'statut != ?',
                ['SUPPRIME'],
                'date_creation DESC',
                limite
            );
        } catch (error) {
            console.error('Erreur PDFs récents:', error);
            return [];
        }
    }

    /**
     * RELATIONS - Récupérer l'utilisateur propriétaire du PDF
     * belongsTo('utilisateur')
     */
    async getUtilisateur(pdfId) {
        const pdf = await this.findById(pdfId);
        if (!pdf || !pdf.utilisateur_id) {
            return null;
        }
        
        const Utilisateur = require('./Utilisateur');
        const utilisateur = new Utilisateur();
        return await utilisateur.findById(pdf.utilisateur_id);
    }

    /**
     * RELATIONS - Récupérer le document source du PDF
     * belongsTo('document')
     */
    async getDocument(pdfId) {
        const pdf = await this.findById(pdfId);
        if (!pdf || !pdf.document_id) {
            return null;
        }
        
        const Document = require('./Document');
        const document = new Document();
        return await document.findById(pdf.document_id);
    }

    /**
     * RELATIONS - Récupérer le personnage source du PDF (si applicable)
     * belongsTo('personnage')
     */
    async getPersonnage(pdfId) {
        const pdf = await this.findById(pdfId);
        if (!pdf || !pdf.personnage_id) {
            return null;
        }
        
        const Personnage = require('./Personnage');
        const personnage = new Personnage();
        return await personnage.findById(pdf.personnage_id);
    }

    /**
     * RELATIONS - Récupérer les informations du système JDR
     * belongsTo('systeme_jeu')
     */
    async getSystemeJeu(pdfId) {
        const pdf = await this.findById(pdfId);
        if (!pdf || !pdf.systeme_jeu) {
            return null;
        }
        
        const SystemeJeu = require('./SystemeJeu');
        const systemeJeu = new SystemeJeu();
        return await systemeJeu.findById(pdf.systeme_jeu);
    }
}

module.exports = Pdf;