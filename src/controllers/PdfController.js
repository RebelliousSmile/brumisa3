const BaseController = require('./BaseController');
const PdfService = require('../services/PdfService');
const PersonnageService = require('../services/PersonnageService');
const path = require('path');

/**
 * Contrôleur pour la gestion des PDFs
 */
class PdfController extends BaseController {
    constructor() {
        super('PdfController');
        this.pdfService = new PdfService();
        this.personnageService = new PersonnageService();
    }

    /**
     * Liste les PDFs de l'utilisateur
     * GET /api/pdfs
     */
    lister = this.wrapAsync(async (req, res) => {
        const utilisateur = this.verifierPermissions(req);
        const pagination = this.extrairePagination(req);
        
        // Filtres optionnels
        const filtres = {
            statut: req.query.statut,
            type_pdf: req.query.type,
            personnage_id: req.query.personnage_id
        };
        
        const { pdfs, total } = await this.pdfService.listerParUtilisateur(
            utilisateur.id,
            filtres,
            pagination
        );
        
        return this.repondrePagine(res, pdfs, { ...pagination, total });
    });

    /**
     * Récupère un PDF par ID
     * GET /api/pdfs/:id
     */
    obtenirParId = this.wrapAsync(async (req, res) => {
        this.validerParametres(req, ['id']);
        
        const pdf = await this.pdfService.obtenirParId(req.params.id);
        
        if (!pdf) {
            return this.repondreErreur(res, 404, 'PDF non trouvé');
        }
        
        // Vérifier que l'utilisateur peut accéder à ce PDF
        this.verifierProprietaire(req, pdf.utilisateur_id);
        
        return this.repondreSucces(res, pdf, 'PDF récupéré');
    });

    /**
     * Génère un nouveau PDF
     * POST /api/pdfs/generer
     */
    generer = this.wrapAsync(async (req, res) => {
        const utilisateur = this.verifierPermissions(req);
        this.validerParametres(req, ['personnage_id']);
        
        // Vérifier que le personnage existe et appartient à l'utilisateur
        const personnage = await this.personnageService.obtenirParId(req.body.personnage_id);
        if (!personnage) {
            return this.repondreErreur(res, 404, 'Personnage non trouvé');
        }
        
        this.verifierProprietaire(req, personnage.utilisateur_id);
        
        const optionsGeneration = {
            type_pdf: req.body.type_pdf || 'fiche_personnage',
            options_generation: req.body.options_generation || {},
            format: req.body.format || 'A4',
            orientation: req.body.orientation || 'portrait'
        };
        
        // Démarrer la génération asynchrone
        const pdf = await this.pdfService.demarrerGeneration(
            req.body.personnage_id,
            utilisateur.id,
            optionsGeneration
        );
        
        return this.repondreSucces(res, pdf, 'Génération PDF démarrée', 202);
    });

    /**
     * Vérifie le statut de génération d'un PDF
     * GET /api/pdfs/:id/statut
     */
    verifierStatut = this.wrapAsync(async (req, res) => {
        this.validerParametres(req, ['id']);
        
        const pdf = await this.pdfService.obtenirParId(req.params.id);
        
        if (!pdf) {
            return this.repondreErreur(res, 404, 'PDF non trouvé');
        }
        
        this.verifierProprietaire(req, pdf.utilisateur_id);
        
        // Retourner uniquement les informations de statut
        const statut = {
            id: pdf.id,
            statut: pdf.statut,
            progression: pdf.progression,
            erreur_message: pdf.erreur_message,
            date_creation: pdf.date_creation,
            temps_generation: pdf.temps_generation
        };
        
        return this.repondreSucces(res, statut, 'Statut récupéré');
    });

    /**
     * Télécharge un PDF
     * GET /api/pdfs/:id/telecharger
     */
    telecharger = this.wrapAsync(async (req, res) => {
        this.validerParametres(req, ['id']);
        
        const pdf = await this.pdfService.obtenirParId(req.params.id);
        
        if (!pdf) {
            return this.repondreErreur(res, 404, 'PDF non trouvé');
        }
        
        // Vérifier les permissions (ou lien temporaire)
        const estLienTemporaire = req.query.token && pdf.url_temporaire === req.query.token;
        
        if (!estLienTemporaire) {
            this.verifierProprietaire(req, pdf.utilisateur_id);
        }
        
        if (pdf.statut !== 'TERMINE') {
            return this.repondreErreur(res, 400, 'PDF pas encore prêt');
        }
        
        if (!pdf.chemin_fichier) {
            return this.repondreErreur(res, 404, 'Fichier PDF non trouvé');
        }
        
        // Incrémenter le compteur de téléchargements
        await this.pdfService.marquerTelechargement(req.params.id);
        
        // Envoyer le fichier
        const cheminFichier = path.resolve(pdf.chemin_fichier);
        const nomFichier = pdf.nom_fichier || `document_${pdf.id}.pdf`;
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${nomFichier}"`);
        
        return res.sendFile(cheminFichier);
    });

    /**
     * Génère un aperçu HTML (pas PDF)
     * POST /api/pdfs/preview-html
     */
    genererPreviewHtml = this.wrapAsync(async (req, res) => {
        const utilisateur = this.verifierPermissions(req);
        this.validerParametres(req, ['personnage_id']);
        
        // Vérifier que le personnage existe et appartient à l'utilisateur
        const personnage = await this.personnageService.obtenirParId(req.body.personnage_id);
        if (!personnage) {
            return this.repondreErreur(res, 404, 'Personnage non trouvé');
        }
        
        this.verifierProprietaire(req, personnage.utilisateur_id);
        
        const options = req.body.options || {};
        
        // Générer l'aperçu HTML
        const htmlPreview = await this.pdfService.genererPreviewHtml(personnage, options);
        
        return this.repondreSucces(res, { html: htmlPreview }, 'Aperçu HTML généré');
    });

    /**
     * Supprime un PDF
     * DELETE /api/pdfs/:id
     */
    supprimer = this.wrapAsync(async (req, res) => {
        this.validerParametres(req, ['id']);
        
        const pdf = await this.pdfService.obtenirParId(req.params.id);
        
        if (!pdf) {
            return this.repondreErreur(res, 404, 'PDF non trouvé');
        }
        
        this.verifierProprietaire(req, pdf.utilisateur_id);
        
        await this.pdfService.supprimer(req.params.id);
        
        return this.repondreSucces(res, null, 'PDF supprimé');
    });

    /**
     * Génère un lien de partage temporaire
     * POST /api/pdfs/:id/partager
     */
    genererLienPartage = this.wrapAsync(async (req, res) => {
        this.validerParametres(req, ['id']);
        
        const pdf = await this.pdfService.obtenirParId(req.params.id);
        
        if (!pdf) {
            return this.repondreErreur(res, 404, 'PDF non trouvé');
        }
        
        this.verifierProprietaire(req, pdf.utilisateur_id);
        
        if (pdf.statut !== 'TERMINE') {
            return this.repondreErreur(res, 400, 'PDF pas encore prêt');
        }
        
        const dureeHeures = req.body.duree_heures || 24;
        const lienPartage = await this.pdfService.genererLienPartage(req.params.id, dureeHeures);
        
        return this.repondreSucces(res, lienPartage, 'Lien de partage généré');
    });

    /**
     * Obtient les statistiques des PDFs
     * GET /api/pdfs/statistiques
     */
    obtenirStatistiques = this.wrapAsync(async (req, res) => {
        const utilisateur = this.verifierPermissions(req);
        
        const stats = await this.pdfService.obtenirStatistiques(utilisateur.id);
        
        return this.repondreSucces(res, stats, 'Statistiques récupérées');
    });

    /**
     * Affiche un PDF partagé (accès public)
     * GET /api/pdfs/partage/:token
     */
    afficherPartage = this.wrapAsync(async (req, res) => {
        this.validerParametres(req, ['token']);
        
        const pdf = await this.pdfService.obtenirParToken(req.params.token);
        
        if (!pdf) {
            return this.repondreErreur(res, 404, 'Lien de partage invalide ou expiré');
        }
        
        if (pdf.statut !== 'TERMINE') {
            return this.repondreErreur(res, 400, 'PDF pas encore prêt');
        }
        
        // Rediriger vers le téléchargement avec le token
        return res.redirect(`/api/pdfs/${pdf.id}/telecharger?token=${req.params.token}`);
    });

    /**
     * Nettoie les PDFs expirés (tâche admin)
     * DELETE /api/pdfs/nettoyage
     */
    nettoyerPdfsExpires = this.wrapAsync(async (req, res) => {
        this.verifierPermissions(req, 'ADMIN');
        
        const nbSupprimes = await this.pdfService.nettoyerPdfsExpires();
        
        return this.repondreSucces(res, { nombre_supprimes: nbSupprimes }, 'Nettoyage effectué');
    });

    /**
     * Relance la génération d'un PDF en échec
     * POST /api/pdfs/:id/relancer
     */
    relancerGeneration = this.wrapAsync(async (req, res) => {
        this.validerParametres(req, ['id']);
        
        const pdf = await this.pdfService.obtenirParId(req.params.id);
        
        if (!pdf) {
            return this.repondreErreur(res, 404, 'PDF non trouvé');
        }
        
        this.verifierProprietaire(req, pdf.utilisateur_id);
        
        if (pdf.statut !== 'ECHEC') {
            return this.repondreErreur(res, 400, 'Seuls les PDFs en échec peuvent être relancés');
        }
        
        const pdfRelance = await this.pdfService.relancerGeneration(req.params.id);
        
        return this.repondreSucces(res, pdfRelance, 'Génération relancée');
    });

    /**
     * Obtient la liste des types de PDF disponibles
     * GET /api/pdfs/types
     */
    obtenirTypesPdf = this.wrapAsync(async (req, res) => {
        const types = this.pdfService.obtenirTypesPdf();
        
        return this.repondreSucces(res, types, 'Types de PDF disponibles');
    });
}

module.exports = PdfController;