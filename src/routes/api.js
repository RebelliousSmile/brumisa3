const express = require('express');
const AuthentificationController = require('../controllers/AuthentificationController');
const PersonnageController = require('../controllers/PersonnageController');
const PdfController = require('../controllers/PdfController');
const HomeController = require('../controllers/HomeController');
const DonationController = require('../controllers/DonationController');
const AdminController = require('../controllers/AdminController');

const router = express.Router();

// Initialiser les contrôleurs
const authController = new AuthentificationController();
const personnageController = new PersonnageController();
const pdfController = new PdfController();
const homeController = new HomeController();
const donationController = new DonationController();
const adminController = new AdminController();

// ===== ROUTES AUTHENTIFICATION =====

// Connexion/Inscription
router.post('/auth/connexion', authController.connexion);
router.post('/auth/inscription', authController.inscription);
router.post('/auth/deconnexion', authController.deconnexion);

// Récupération de mot de passe
router.post('/auth/mot-de-passe-oublie', authController.motDePasseOublie);
router.post('/auth/reinitialiser-mot-de-passe', authController.reinitialiserMotDePasse);

// Gestion du profil
router.get('/auth/statut', authController.verifierStatut);
router.get('/auth/profil', authController.middlewareAuth, authController.obtenirProfil);
router.put('/auth/profil', authController.middlewareAuth, authController.mettreAJourProfil);

// Élévation de rôle
router.post('/auth/elevation-role', authController.middlewareAuth, authController.elevationRole);

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
router.post('/pdfs/document-generique/:systeme', pdfController.genererDocumentGeneriqueAnonyme);
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