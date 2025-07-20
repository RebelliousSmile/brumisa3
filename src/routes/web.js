const express = require('express');
const AuthentificationController = require('../controllers/AuthentificationController');
const systemesJeu = require('../utils/systemesJeu');

const router = express.Router();

// Initialiser le contrôleur d'authentification
const authController = new AuthentificationController();

// ===== MIDDLEWARE GLOBAL =====

// Middleware pour injecter les données utilisateur dans les templates
router.use((req, res, next) => {
    const { SystemeUtils } = require('../utils/systemesJeu');
    res.locals.utilisateur = req.session?.utilisateur || null;
    res.locals.systemes = systemesJeu;
    res.locals.systemesJeu = SystemeUtils.getAllSystemes();
    res.locals.config = {
        appName: 'Générateur PDF JDR',
        version: process.env.npm_package_version || '1.0.0'
    };
    next();
});

// ===== PAGE D'ACCUEIL =====

router.get('/', (req, res) => {
    const { SystemeUtils } = require('../utils/systemesJeu');
    res.render('index', {
        title: 'Générateur PDF JDR - Créez vos fiches de personnages',
        meta: {
            description: 'Créez et partagez des fiches de personnages pour Monsterhearts, Engrenages & Sortilèges, Metro 2033 et Mist Engine',
            keywords: 'jdr, jeu de rôle, pdf, fiche personnage, monsterhearts, engrenages, metro 2033'
        },
        systemesJeu: SystemeUtils.getAllSystemes()
    });
});

// ===== PAGES SYSTEMES DE JEU =====

// Page Monsterhearts
router.get('/monsterhearts', (req, res) => {
    res.render('systemes/monsterhearts', {
        title: 'Monsterhearts - Générateur PDF JDR',
        description: 'Créez des fiches de personnages pour Monsterhearts',
        systeme: 'monsterhearts'
    });
});

// Formulaire document générique Monsterhearts
router.get('/monsterhearts/document-generique', (req, res) => {
    res.render('systemes/monsterhearts/creer-document-generique', {
        title: 'Créer un Document Monsterhearts',
        description: 'Créez un document PDF personnalisé avec le style Monsterhearts',
        systeme: 'monsterhearts'
    });
});

// Page Engrenages
router.get('/engrenages', (req, res) => {
    res.render('systemes/engrenages', {
        title: 'Engrenages & Sortilèges - Générateur PDF JDR',
        description: 'Créez des fiches de personnages pour Engrenages & Sortilèges',
        systeme: 'engrenages'
    });
});

// Page Metro 2033
router.get('/metro2033', (req, res) => {
    res.render('systemes/metro2033', {
        title: 'Metro 2033 - Générateur PDF JDR',
        description: 'Créez des fiches de personnages pour Metro 2033',
        systeme: 'metro2033'
    });
});

// Page Mist Engine
router.get('/mistengine', (req, res) => {
    res.render('systemes/mistengine', {
        title: 'Mist Engine - Générateur PDF JDR',
        description: 'Créez des fiches de personnages pour Mist Engine',
        systeme: 'mistengine'
    });
});

// ===== AUTHENTIFICATION =====

// Pages de connexion/inscription
router.get('/connexion', (req, res) => {
    // Rediriger si déjà connecté
    if (req.session?.utilisateur) {
        return res.redirect('/mes-documents');
    }
    
    res.render('auth/connexion', {
        title: 'Connexion - Générateur PDF JDR'
    });
});

router.get('/inscription', (req, res) => {
    // Rediriger si déjà connecté
    if (req.session?.utilisateur) {
        return res.redirect('/mes-documents');
    }
    
    res.render('auth/inscription', {
        title: 'Inscription - Générateur PDF JDR'
    });
});

// Page de mot de passe oublié
router.get('/mot-de-passe-oublie', (req, res) => {
    // Rediriger si déjà connecté
    if (req.session?.utilisateur) {
        return res.redirect('/mes-documents');
    }
    
    res.render('auth/mot-de-passe-oublie', {
        title: 'Mot de passe oublié - Générateur PDF JDR'
    });
});

// Page de réinitialisation de mot de passe
router.get('/reinitialiser-mot-de-passe/:token', (req, res) => {
    // Rediriger si déjà connecté
    if (req.session?.utilisateur) {
        return res.redirect('/mes-documents');
    }
    
    res.render('auth/reinitialiser-mot-de-passe', {
        title: 'Réinitialiser le mot de passe - Générateur PDF JDR',
        token: req.params.token
    });
});

// Déconnexion (GET pour compatibilité liens)
router.get('/deconnexion', authController.deconnexion);

// Page de profil
router.get('/profil', authController.middlewareAuth, (req, res) => {
    res.render('auth/profil', {
        title: 'Mon Profil - Générateur PDF JDR'
    });
});

// Page de paramètres
router.get('/parametres', authController.middlewareAuth, (req, res) => {
    res.render('parametres', {
        title: 'Paramètres - Générateur PDF JDR'
    });
});

// ===== MES DOCUMENTS =====

// Page "Mes documents" - Liste personnages et PDFs
router.get('/mes-documents', authController.middlewareAuth, (req, res) => {
    res.render('mes-documents', {
        title: 'Mes Documents - Générateur PDF JDR'
    });
});

// ===== GESTION PERSONNAGES =====

// Liste des personnages (pour compatibilité)
router.get('/personnages', authController.middlewareAuth, (req, res) => {
    res.redirect('/mes-documents');
});

// Création de personnage
router.get('/personnages/nouveau', authController.middlewareAuth, (req, res) => {
    const systeme = req.query.systeme;
    
    // Valider le système si spécifié
    if (systeme && !systemesJeu[systeme]) {
        return res.redirect('/personnages/nouveau');
    }
    
    res.render('personnages/creation', {
        title: 'Nouveau Personnage - Générateur PDF JDR',
        systemeSelectionne: systeme || null
    });
});

// Édition de personnage
router.get('/personnages/:id/editer', authController.middlewareAuth, (req, res) => {
    res.render('personnages/edition', {
        title: 'Éditer Personnage - Générateur PDF JDR',
        personnageId: req.params.id
    });
});

// Visualisation de personnage (fiche)
router.get('/personnages/:id', authController.middlewareAuth, (req, res) => {
    res.render('personnages/fiche', {
        title: 'Fiche Personnage - Générateur PDF JDR',
        personnageId: req.params.id
    });
});

// ===== GESTION PDF =====

// Liste des PDFs
router.get('/pdfs', authController.middlewareAuth, (req, res) => {
    res.render('pdfs/liste', {
        title: 'Mes PDFs - Générateur PDF JDR'
    });
});

// Générateur PDF (avec sélection personnage)
router.get('/pdf/generer', authController.middlewareAuth, (req, res) => {
    const personnageId = req.query.personnage;
    
    res.render('pdfs/generer', {
        title: 'Générer un PDF - Générateur PDF JDR',
        personnageId: personnageId || null
    });
});

// Visualisation d'un PDF
router.get('/pdfs/:id', authController.middlewareAuth, (req, res) => {
    res.render('pdfs/visualisation', {
        title: 'PDF - Générateur PDF JDR',
        pdfId: req.params.id
    });
});

// ===== PAGES SYSTÈME =====

// Page d'information sur un système de jeu
router.get('/systemes/:systeme', (req, res) => {
    const systeme = systemesJeu[req.params.systeme];
    
    if (!systeme) {
        return res.status(404).render('errors/404', {
            title: 'Système non trouvé',
            message: 'Ce système de jeu n\'est pas supporté.'
        });
    }
    
    res.render('systemes/details', {
        title: `${systeme.nom} - Générateur PDF JDR`,
        systeme: systeme,
        systemeId: req.params.systeme
    });
});

// ===== ADMINISTRATION =====

// Dashboard admin
router.get('/admin', authController.middlewareRole('ADMIN'), (req, res) => {
    res.render('admin/dashboard', {
        title: 'Administration - Générateur PDF JDR'
    });
});

// Gestion des utilisateurs (admin)
router.get('/admin/utilisateurs', authController.middlewareRole('ADMIN'), (req, res) => {
    res.render('admin/utilisateurs', {
        title: 'Gestion Utilisateurs - Admin'
    });
});

// Statistiques (admin)
router.get('/admin/statistiques', authController.middlewareRole('ADMIN'), (req, res) => {
    res.render('admin/statistiques', {
        title: 'Statistiques - Admin'
    });
});

// ===== PAGES STATIQUES =====

// À propos
router.get('/a-propos', (req, res) => {
    res.render('statiques/a-propos', {
        title: 'À Propos - Générateur PDF JDR'
    });
});

// Aide/Documentation
router.get('/aide', (req, res) => {
    res.render('statiques/aide', {
        title: 'Aide - Générateur PDF JDR'
    });
});

// Conditions d'utilisation
router.get('/cgu', (req, res) => {
    res.render('statiques/cgu', {
        title: 'Conditions d\'Utilisation - Générateur PDF JDR'
    });
});

// Politique de confidentialité
router.get('/confidentialite', (req, res) => {
    res.render('statiques/confidentialite', {
        title: 'Politique de Confidentialité - Générateur PDF JDR'
    });
});

// ===== REDIRECTIONS =====

// Redirections pour compatibilité
router.get('/dashboard', authController.middlewareAuth, (req, res) => {
    res.redirect('/mes-documents');
});

router.get('/characters', authController.middlewareAuth, (req, res) => {
    res.redirect('/mes-documents');
});

router.get('/login', (req, res) => {
    res.redirect('/connexion');
});

router.get('/register', (req, res) => {
    res.redirect('/inscription');
});

// ===== GESTION D'ERREURS =====

// Middleware pour les pages non trouvées
router.use((req, res) => {
    res.status(404).render('errors/404', {
        title: 'Page non trouvée',
        url: req.originalUrl
    });
});

// Middleware de gestion d'erreurs pour les vues
router.use((erreur, req, res, next) => {
    // Log de l'erreur
    console.error('Erreur page web:', {
        url: req.originalUrl,
        method: req.method,
        erreur: erreur.message,
        stack: erreur.stack,
        utilisateur: req.session?.utilisateur?.id || 'anonyme'
    });
    
    // Page d'erreur selon le type
    let statut = 500;
    let vue = 'errors/500';
    let titre = 'Erreur interne';
    
    if (erreur.code === 'UNAUTHORIZED') {
        statut = 401;
        vue = 'errors/401';
        titre = 'Accès non autorisé';
    } else if (erreur.code === 'FORBIDDEN') {
        statut = 403;
        vue = 'errors/403';
        titre = 'Accès interdit';
    } else if (erreur.message.includes('not found') || erreur.message.includes('non trouvé')) {
        statut = 404;
        vue = 'errors/404';
        titre = 'Page non trouvée';
    }
    
    res.status(statut).render(vue, {
        title: titre,
        erreur: process.env.NODE_ENV !== 'production' ? erreur : null,
        message: erreur.message
    });
});

module.exports = router;