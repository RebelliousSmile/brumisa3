const express = require('express');
const multer = require('multer');
const AuthentificationController = require('../controllers/AuthentificationController');
const PersonnageController = require('../controllers/PersonnageController');
const PdfController = require('../controllers/PdfController');
const HomeController = require('../controllers/HomeController');
const DonationController = require('../controllers/DonationController');
const AdminController = require('../controllers/AdminController');
const OracleController = require('../controllers/OracleController');

const router = express.Router();

// Configuration multer pour l'upload de fichiers oracles
const uploadOracle = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max
        files: 1
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['application/json', 'text/csv', 'application/vnd.ms-excel'];
        const allowedExtensions = ['.json', '.csv'];
        
        const hasValidType = allowedTypes.includes(file.mimetype) || 
                            file.mimetype === 'application/octet-stream'; // Pour certains navigateurs
        const hasValidExtension = allowedExtensions.some(ext => 
            file.originalname.toLowerCase().endsWith(ext)
        );
        
        if (hasValidType && hasValidExtension) {
            cb(null, true);
        } else {
            cb(new Error('Type de fichier non supporté. Utilisez JSON ou CSV.'), false);
        }
    }
});

// Initialiser les contrôleurs
const authController = new AuthentificationController();
const personnageController = new PersonnageController();
const pdfController = new PdfController();
const homeController = new HomeController();
const donationController = new DonationController();
const adminController = new AdminController();
const oracleController = new OracleController();

// ===== ROUTES AUTHENTIFICATION =====

// Connexion/Inscription
router.post('/auth/connexion', authController.connexion);
router.post('/auth/inscription', authController.inscription);
router.post('/auth/deconnexion', authController.deconnexion);

// Récupération de mot de passe
router.post('/auth/mot-de-passe-oublie', authController.motDePasseOublie);
router.post('/auth/reinitialiser-mot-de-passe', authController.reinitialiserMotDePasse);

// Route de test (développement uniquement)
router.get('/auth/test-mot-de-passe-oublie', authController.testMotDePasseOublie);

// Gestion du profil
router.get('/auth/statut', authController.verifierStatut);
router.get('/auth/profil', authController.middlewareAuth, authController.obtenirProfil);
router.put('/auth/profil', authController.middlewareAuth, authController.mettreAJourProfil);

// Passer Premium avec code d'accès
router.post('/auth/passer-premium', authController.middlewareAuth, authController.elevationRole);

// ===== ROUTES PERSONNAGES =====

// CRUD personnages (authentification requise)
router.get('/personnages', authController.middlewareAuth, personnageController.lister);
router.get('/personnages/:id', authController.middlewareAuth, personnageController.obtenirParId);
router.post('/personnages', authController.middlewareAuth, personnageController.creer);
router.put('/personnages/:id', authController.middlewareAuth, personnageController.mettreAJour);
router.delete('/personnages/:id', authController.middlewareAuth, personnageController.supprimer);

// Actions spéciales personnages
router.post('/personnages/:id/dupliquer', authController.middlewareAuth, personnageController.dupliquer);
router.post('/personnages/brouillon', authController.middlewareAuth, personnageController.sauvegarderBrouillon);
router.get('/personnages/rechercher', authController.middlewareAuth, personnageController.rechercher);
router.get('/personnages/statistiques', authController.middlewareAuth, personnageController.obtenirStatistiques);

// Génération PDF depuis personnage
router.post('/personnages/:id/pdf', authController.middlewareAuth, personnageController.genererPdf);

// Templates de personnages (accès public)
router.get('/personnages/template/:systeme', personnageController.obtenirTemplate);

// ===== ROUTES PDF =====

// CRUD PDFs (authentification requise)
router.get('/pdfs', authController.middlewareAuth, pdfController.lister);
router.get('/pdfs/:id', authController.middlewareAuth, pdfController.obtenirParId);
router.delete('/pdfs/:id', authController.middlewareAuth, pdfController.supprimer);

// Token pour utilisateurs anonymes
router.post('/auth/token-anonyme', pdfController.genererTokenAnonyme);

// Génération et gestion PDFs
router.post('/pdfs/generer', authController.middlewareAuth, pdfController.generer);
router.post('/pdfs/document-generique/:systeme', authController.middlewareAuth, pdfController.genererDocumentGenerique);
router.post('/pdfs/document-generique-anonyme/:systeme', pdfController.genererDocumentGeneriqueAnonyme);
router.get('/pdfs/:id/statut', pdfController.verifierStatutAnonyme);
router.post('/pdfs/:id/relancer', authController.middlewareAuth, pdfController.relancerGeneration);

// Téléchargement et partage
router.get('/pdfs/:id/telecharger', pdfController.telecharger); // Gère auth ET liens temporaires
router.post('/pdfs/:id/partager', authController.middlewareAuth, pdfController.genererLienPartage);
router.get('/pdfs/partage/:token', pdfController.afficherPartage); // Accès public avec token

// Prévisualisation
router.post('/pdfs/preview-html', authController.middlewareAuth, pdfController.genererPreviewHtml);

// Utilitaires PDFs
router.get('/pdfs/types', pdfController.obtenirTypesPdf); // Accès public
router.get('/pdfs/templates/:systeme', authController.middlewareAuth, pdfController.listerTemplates);
router.get('/pdfs/types-templates', authController.middlewareAuth, pdfController.obtenirTypesTemplates);
router.get('/pdfs/statistiques', authController.middlewareAuth, pdfController.obtenirStatistiques);

// Routes admin
router.delete('/pdfs/nettoyage', authController.middlewareRole('ADMIN'), pdfController.nettoyerPdfsExpires);

// Visibilité des PDFs
router.post('/pdfs/:id/basculer-visibilite', authController.middlewareAuth, homeController.basculerVisibilitePdf);

// ===== ROUTES DONATIONS =====

// Système de dons et Premium
router.get('/donations/status', donationController.verifierStatut);
router.post('/donations/create-payment-intent', donationController.creerSessionPaiement);
router.post('/donations/webhook', express.raw({type: 'application/json'}), donationController.webhookStripe);

// Statistiques dons (admin)
router.get('/admin/donations/stats', authController.middlewareRole('ADMIN'), donationController.obtenirStatistiquesDons);

// ===== ROUTES ADMIN =====

// Statistiques et dashboard
router.get('/admin/statistiques', authController.middlewareRole('ADMIN'), adminController.obtenirStatistiques);
router.get('/admin/activite-recente', authController.middlewareRole('ADMIN'), adminController.obtenirActiviteRecente);
router.get('/admin/logs', authController.middlewareRole('ADMIN'), adminController.obtenirLogs);

// Gestion utilisateurs
router.get('/admin/utilisateurs', authController.middlewareRole('ADMIN'), adminController.listerUtilisateurs);
router.delete('/admin/utilisateurs/:id', authController.middlewareRole('ADMIN'), adminController.supprimerUtilisateur);
router.put('/admin/utilisateurs/:id/role', authController.middlewareRole('ADMIN'), adminController.modifierRoleUtilisateur);

// Actions de maintenance
router.post('/admin/cleanup-tokens', authController.middlewareRole('ADMIN'), adminController.nettoyerTokens);
router.post('/admin/backup', authController.middlewareRole('ADMIN'), adminController.creerSauvegarde);

// ===== ROUTES PAGE D'ACCUEIL =====

// Données page d'accueil
router.get('/home/donnees', homeController.obtenirDonneesAccueil);

// Newsletter
router.post('/newsletter/inscription', homeController.inscrireNewsletter);
router.post('/newsletter/desinscription/:token', homeController.desinscrireNewsletter);

// Actualités
router.get('/actualites', homeController.listerActualites);
router.get('/actualites/rss', homeController.fluxRSS);
router.post('/actualites', authController.middlewareRole('ADMIN'), homeController.ajouterActualite);

// Témoignages
router.get('/temoignages', homeController.listerTemoignages);
router.post('/temoignages', homeController.ajouterTemoignage);

// Dons
router.get('/dons/infos', homeController.informationsDons);

// ===== ROUTES ORACLES =====

// Routes publiques/utilisateur
router.get('/oracles', oracleController.lister);
router.get('/oracles/search', oracleController.rechercher);
router.get('/oracles/:id', oracleController.obtenirParId);
router.post('/oracles/:id/draw', oracleController.effectuerTirage);
router.get('/oracles/:id/stats', oracleController.obtenirStatistiques);

// Routes administrateur
router.post('/admin/oracles', authController.middlewareRole('ADMIN'), oracleController.creer);
router.put('/admin/oracles/:id', authController.middlewareRole('ADMIN'), oracleController.mettreAJour);
router.delete('/admin/oracles/:id', authController.middlewareRole('ADMIN'), oracleController.supprimer);
router.post('/admin/oracles/:id/items', authController.middlewareRole('ADMIN'), oracleController.ajouterItem);
router.put('/admin/oracles/:oracleId/items/:itemId', authController.middlewareRole('ADMIN'), oracleController.mettreAJourItem);
router.delete('/admin/oracles/:oracleId/items/:itemId', authController.middlewareRole('ADMIN'), oracleController.supprimerItem);
router.post('/admin/oracles/:id/clone', authController.middlewareRole('ADMIN'), oracleController.cloner);
router.post('/admin/oracles/:id/toggle', authController.middlewareRole('ADMIN'), oracleController.basculerStatut);
router.get('/admin/oracles/:id/distribution', authController.middlewareRole('ADMIN'), oracleController.analyserDistribution);

// Routes import/export
router.post('/admin/oracles/import', authController.middlewareRole('ADMIN'), uploadOracle.single('file'), oracleController.importerFichier);
router.get('/admin/oracles/:id/export/json', authController.middlewareRole('ADMIN'), oracleController.exporterJSON);
router.get('/admin/oracles/:id/export/csv', authController.middlewareRole('ADMIN'), oracleController.exporterCSV);
router.get('/admin/oracles/imports', authController.middlewareRole('ADMIN'), oracleController.historiqueImports);
router.post('/admin/oracles/imports/:importId/rollback', authController.middlewareRole('ADMIN'), oracleController.annulerImport);

// ===== ROUTES ADMIN TÉMOIGNAGES =====

router.get('/admin/temoignages', authController.middlewareRole('ADMIN'), homeController.gererTemoignages);
router.post('/admin/temoignages/:id/approuver', authController.middlewareRole('ADMIN'), homeController.approuverTemoignage);
router.post('/admin/temoignages/:id/refuser', authController.middlewareRole('ADMIN'), homeController.refuserTemoignage);
router.post('/admin/temoignages/:id/basculer-affichage', authController.middlewareRole('ADMIN'), homeController.basculerAffichageTemoignage);
router.get('/admin/temoignages/statistiques', authController.middlewareRole('ADMIN'), homeController.statistiquesTemoignages);

// ===== MIDDLEWARES DE GESTION D'ERREURS =====

// Middleware pour les routes non trouvées (API)
router.use('*', (req, res) => {
    res.status(404).json({
        succes: false,
        message: 'Endpoint API non trouvé',
        type: 'not_found',
        endpoint: req.originalUrl,
        timestamp: new Date().toISOString()
    });
});

// Middleware de gestion d'erreurs pour l'API
router.use((erreur, req, res, next) => {
    // Log de l'erreur
    console.error('Erreur API:', {
        url: req.originalUrl,
        method: req.method,
        erreur: erreur.message,
        stack: erreur.stack,
        utilisateur: req.session?.utilisateur?.id || 'anonyme'
    });
    
    // Réponse d'erreur standardisée
    let statut = 500;
    let message = 'Erreur interne du serveur';
    let type = 'erreur_interne';
    
    // Gestion spécifique selon le type d'erreur
    if (erreur.name === 'ValidationError') {
        statut = 400;
        message = erreur.message;
        type = 'validation';
    } else if (erreur.code === 'UNAUTHORIZED') {
        statut = 401;
        message = 'Authentification requise';
        type = 'non_authentifie';
    } else if (erreur.code === 'FORBIDDEN') {
        statut = 403;
        message = erreur.message || 'Accès interdit';
        type = 'interdit';
    } else if (erreur.message.includes('not found') || erreur.message.includes('non trouvé')) {
        statut = 404;
        message = erreur.message;
        type = 'non_trouve';
    } else if (erreur.code === 'ENOTFOUND' || erreur.code === 'ECONNREFUSED') {
        statut = 503;
        message = 'Service temporairement indisponible';
        type = 'service_indisponible';
    }
    
    // En développement, inclure plus de détails
    const reponse = {
        succes: false,
        message,
        type,
        timestamp: new Date().toISOString()
    };
    
    if (process.env.NODE_ENV !== 'production') {
        reponse.details = {
            erreur: erreur.message,
            stack: erreur.stack
        };
    }
    
    res.status(statut).json(reponse);
});

module.exports = router;