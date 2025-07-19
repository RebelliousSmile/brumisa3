const express = require('express');
const AuthentificationController = require('../controllers/AuthentificationController');
const systemesJeu = require('../utils/systemesJeu');

const router = express.Router();

// Initialiser le contrôleur d'authentification
const authController = new AuthentificationController();

// ===== MIDDLEWARE GLOBAL =====

// Middleware pour injecter les données utilisateur dans les templates
router.use((req, res, next) => {
    res.locals.utilisateur = req.session?.utilisateur || null;
    res.locals.systemesJeu = systemesJeu;
    res.locals.config = {
        appName: 'Générateur PDF JDR',
        version: process.env.npm_package_version || '1.0.0'
    };
    next();
});

// ===== PAGE D'ACCUEIL =====

router.get('/', (req, res) => {
    res.render('index', {
        title: 'Générateur PDF JDR - Créez vos fiches de personnages',
        meta: {
            description: 'Créez et partagez des fiches de personnages pour Monsterhearts, Engrenages & Sortilèges, Metro 2033 et Mist Engine',
            keywords: 'jdr, jeu de rôle, pdf, fiche personnage, monsterhearts, engrenages, metro 2033'
        }
    });
});

// ===== AUTHENTIFICATION =====

// Pages de connexion/inscription
router.get('/connexion', (req, res) => {
    // Rediriger si déjà connecté
    if (req.session?.utilisateur) {
        return res.redirect('/personnages');
    }
    
    res.render('auth/connexion', {
        title: 'Connexion - Générateur PDF JDR'
    });
});

router.get('/inscription', (req, res) => {
    // Rediriger si déjà connecté
    if (req.session?.utilisateur) {
        return res.redirect('/personnages');
    }
    
    res.render('auth/inscription', {
        title: 'Inscription - Générateur PDF JDR'
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

// ===== GESTION PERSONNAGES =====

// Liste des personnages
router.get('/personnages', authController.middlewareAuth, (req, res) => {
    res.render('personnages/liste', {
        title: 'Mes Personnages - Générateur PDF JDR',
        systemeFiltre: req.query.systeme || null
    });
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
        return res.status(404).render('erreurs/404', {
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
    res.redirect('/personnages');
});

router.get('/characters', authController.middlewareAuth, (req, res) => {
    res.redirect('/personnages');
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
    res.status(404).render('erreurs/404', {
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
    let vue = 'erreurs/500';
    let titre = 'Erreur interne';
    
    if (erreur.code === 'UNAUTHORIZED') {
        statut = 401;
        vue = 'erreurs/401';
        titre = 'Accès non autorisé';
    } else if (erreur.code === 'FORBIDDEN') {
        statut = 403;
        vue = 'erreurs/403';
        titre = 'Accès interdit';
    } else if (erreur.message.includes('not found') || erreur.message.includes('non trouvé')) {
        statut = 404;
        vue = 'erreurs/404';
        titre = 'Page non trouvée';
    }
    
    res.status(statut).render(vue, {
        title: titre,
        erreur: process.env.NODE_ENV !== 'production' ? erreur : null,
        message: erreur.message
    });
});

module.exports = router;