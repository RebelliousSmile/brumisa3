const BaseController = require('./BaseController');
const PdfService = require('../services/PdfService');
const PersonnageService = require('../services/PersonnageService');
const AnonymousTokenService = require('../services/AnonymousTokenService');
const path = require('path');

/**
 * Contrôleur pour la gestion des PDFs
 */
class PdfController extends BaseController {
    constructor() {
        super('PdfController');
        this.pdfService = new PdfService();
        this.personnageService = new PersonnageService();
        this.anonymousTokenService = new AnonymousTokenService();
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

    /**
     * Liste les templates disponibles pour un système
     * GET /api/pdfs/templates/:systeme
     */
    listerTemplates = this.wrapAsync(async (req, res) => {
        this.validerParametres(req, ['systeme']);
        
        const templates = await this.pdfService.listerTemplates(req.params.systeme);
        
        return this.repondreSucces(res, templates, `Templates disponibles pour ${req.params.systeme}`);
    });

    /**
     * Obtient les types de templates disponibles
     * GET /api/pdfs/types-templates
     */
    obtenirTypesTemplates = this.wrapAsync(async (req, res) => {
        const types = await this.pdfService.obtenirTypesTemplates();
        
        return this.repondreSucces(res, types, 'Types de templates disponibles');
    });

    /**
     * Génère un PDF de document générique
     * POST /api/pdfs/document-generique/:systeme
     */
    genererDocumentGenerique = this.wrapAsync(async (req, res) => {
        const utilisateur = this.verifierPermissions(req);
        this.validerParametres(req, ['systeme']);
        
        // Validation des données requises
        const donneesRequises = ['titre', 'sections'];
        this.validerCorps(req, donneesRequises);
        
        const { SystemeUtils } = require('../config/systemesUtils');
        const systeme = req.params.systeme;
        
        // Vérifier que le système existe
        if (!SystemeUtils.getSysteme(systeme)) {
            return this.repondreErreur(res, 400, `Système de jeu non supporté: ${systeme}`);
        }
        
        // Utiliser le DocumentGeneriqueService pour valider et générer
        const DocumentGeneriqueService = require('../services/DocumentGeneriqueService');
        const documentService = new DocumentGeneriqueService();
        
        try {
            // Valider les données
            documentService.validerDonnees(req.body);
            
            // Gérer le pied de page personnalisé (réservé aux premium/admin)
            const donnees = { ...req.body };
            if (donnees.piedDePage && !this.peutUtiliserPiedDePagePersonnalise(utilisateur)) {
                // Supprimer le pied de page personnalisé pour les utilisateurs basiques
                delete donnees.piedDePage;
            }
            
            // Préparer les options de génération
            const optionsGeneration = {
                template: 'document-generique-v2',
                type_pdf: 'document-generique',
                systeme: systeme,
                donnees: donnees,
                titre_personnalise: donnees.titre
            };
            
            // Démarrer la génération PDF via PdfService
            const pdf = await this.pdfService.genererDocumentGenerique(
                utilisateur.id,
                optionsGeneration
            );
            
            return this.repondreSucces(res, pdf, 'Génération PDF document générique démarrée', 202);
            
        } catch (error) {
            if (error.message.includes('Données invalides')) {
                return this.repondreErreur(res, 400, error.message);
            }
            throw error;
        }
    });

    /**
     * Génère un token temporaire pour utilisateurs anonymes
     * POST /api/auth/token-anonyme
     */
    genererTokenAnonyme = this.wrapAsync(async (req, res) => {
        const userAgent = req.get('User-Agent') || '';
        const sessionFingerprint = req.body.fingerprint || null;
        
        // Créer un ID de session basé sur des données non sensibles
        const sessionData = {
            userAgent: userAgent.substring(0, 100),
            fingerprint: sessionFingerprint,
            timestamp: Date.now()
        };
        
        const sessionId = require('crypto')
            .createHash('sha256')
            .update(JSON.stringify(sessionData))
            .digest('hex')
            .substring(0, 32);

        // Générer le token avec limitations pour utilisateur anonyme
        const tokenInfo = this.anonymousTokenService.generateToken(sessionId, {
            maxUsage: 3, // Max 3 PDFs par token anonyme
            maxSizeKB: 300, // Taille réduite pour anonymes
            allowedSystems: ['monsterhearts'] // Seulement Monsterhearts pour commencer
        });

        return this.repondreSucces(res, {
            token: tokenInfo.token,
            expiresIn: tokenInfo.expiresIn,
            limitations: tokenInfo.limitations
        }, 'Token anonyme généré');
    });

    /**
     * Génère un PDF de document générique pour utilisateur anonyme
     * POST /api/pdfs/document-generique/:systeme
     */
    genererDocumentGeneriqueAnonyme = this.wrapAsync(async (req, res) => {
        // Vérifier le token anonyme
        const token = req.get('Authorization')?.replace('Bearer ', '') || req.body.token;
        
        if (!token) {
            return this.repondreErreur(res, 401, 'Token anonyme requis');
        }

        const systeme = req.params.systeme;
        const validation = this.anonymousTokenService.validateToken(token, systeme);
        
        if (!validation.valid) {
            const message = AnonymousTokenService.getErrorMessage(validation.reason);
            return this.repondreErreur(res, 401, message);
        }

        // Validation des données requises
        const donneesRequises = ['titre', 'sections'];
        this.validerCorps(req, donneesRequises);
        
        const { SystemeUtils } = require('../config/systemesUtils');
        
        // Vérifier que le système existe
        if (!SystemeUtils.getSysteme(systeme)) {
            return this.repondreErreur(res, 400, `Système de jeu non supporté: ${systeme}`);
        }
        
        // Utiliser le DocumentGeneriqueService pour valider et générer
        const DocumentGeneriqueService = require('../services/DocumentGeneriqueService');
        const documentService = new DocumentGeneriqueService();
        
        try {
            // Valider les données
            documentService.validerDonnees(req.body);
            
            // Limitations pour utilisateur anonyme
            const donnees = { ...req.body };
            
            // Pas de pied de page personnalisé pour les anonymes
            delete donnees.piedDePage;
            
            // Limitation du nombre de sections
            if (donnees.sections && donnees.sections.length > 10) {
                return this.repondreErreur(res, 400, 'Maximum 10 sections pour un utilisateur anonyme');
            }
            
            // Limitation de la longueur du contenu
            const totalContent = donnees.sections.reduce((total, section) => {
                const contentLength = section.contenus?.reduce((sectionTotal, contenu) => {
                    return sectionTotal + (contenu.texte?.length || 0);
                }, 0) || 0;
                return total + contentLength;
            }, 0);
            
            if (totalContent > 10000) {
                return this.repondreErreur(res, 400, 'Contenu trop long pour un utilisateur anonyme');
            }
            
            // Créer un utilisateur virtuel pour les anonymes
            const utilisateurAnonyme = {
                id: `anonymous_${validation.sessionId}`,
                type_compte: 'ANONYME',
                role: 'ANONYME'
            };
            
            // Préparer les options de génération
            const optionsGeneration = {
                template: 'document-generique-v2',
                type_pdf: 'document-generique',
                systeme: systeme,
                donnees: donnees,
                titre_personnalise: donnees.titre,
                est_anonyme: true,
                token_anonyme: token
            };
            
            // Démarrer la génération PDF via PdfService
            const pdf = await this.pdfService.genererDocumentGenerique(
                utilisateurAnonyme.id,
                optionsGeneration
            );
            
            // Marquer le token comme utilisé
            this.anonymousTokenService.markTokenUsed(token, 0); // Taille sera vérifiée plus tard
            
            return this.repondreSucces(res, pdf, 'Génération PDF document générique démarrée', 202);
            
        } catch (error) {
            if (error.message.includes('Données invalides')) {
                return this.repondreErreur(res, 400, error.message);
            }
            throw error;
        }
    });

    /**
     * Vérifie le statut de génération d'un PDF (version anonyme)
     * GET /api/pdfs/:id/statut
     */
    verifierStatutAnonyme = this.wrapAsync(async (req, res) => {
        this.validerParametres(req, ['id']);
        
        const pdf = await this.pdfService.obtenirParId(req.params.id);
        
        if (!pdf) {
            return this.repondreErreur(res, 404, 'PDF non trouvé');
        }
        
        // Pour les utilisateurs anonymes, vérifier le token
        if (pdf.utilisateur_id.startsWith('anonymous_')) {
            const token = req.get('Authorization')?.replace('Bearer ', '') || req.query.token;
            
            if (!token) {
                return this.repondreErreur(res, 401, 'Token anonyme requis');
            }
            
            const validation = this.anonymousTokenService.validateToken(token);
            
            if (!validation.valid || pdf.utilisateur_id !== `anonymous_${validation.sessionId}`) {
                return this.repondreErreur(res, 403, 'Accès interdit à ce PDF');
            }
        } else {
            // Pour les utilisateurs connectés, vérifier normalement
            const utilisateur = this.verifierPermissions(req);
            this.verifierProprietaire(req, pdf.utilisateur_id);
        }
        
        return this.repondreSucces(res, {
            id: pdf.id,
            statut: pdf.statut,
            progression: pdf.progression,
            erreur_message: pdf.erreur_message
        }, 'Statut du PDF récupéré');
    });

    /**
     * Vérifie si l'utilisateur peut utiliser un pied de page personnalisé
     */
    peutUtiliserPiedDePagePersonnalise(utilisateur) {
        return utilisateur.type_compte === 'PREMIUM' || 
               utilisateur.role === 'ADMIN' || 
               utilisateur.role === 'MODERATEUR';
    }
}

module.exports = PdfController;