const express = require('express');
const AuthentificationController = require('../controllers/AuthentificationController');
const DonationController = require('../controllers/DonationController');
const OracleController = require('../controllers/OracleController');
const { systemesJeu } = require('../config/systemesJeu');
const SystemeUtils = require('../utils/SystemeUtils');

const router = express.Router();

// Initialiser les contrôleurs
const authController = new AuthentificationController();
const donationController = new DonationController();
const oracleController = new OracleController();

// ===== MIDDLEWARE GLOBAL =====

// Middleware pour injecter les données utilisateur dans les templates
router.use((req, res, next) => {
    res.locals.utilisateur = req.session?.utilisateur || null;
    res.locals.systemes = systemesJeu;
    res.locals.systemesJeu = SystemeUtils.getAllSystemes();
    res.locals.systemesAvecUnivers = SystemeUtils.getSystemesAvecUnivers();
    res.locals.config = {
        appName: 'Générateur PDF JDR',
        version: process.env.npm_package_version || '1.0.0'
    };
    next();
});

// ===== PAGE D'ACCUEIL =====

router.get('/', (req, res) => {
    const SystemThemeService = require('../services/SystemThemeService');
    const SystemCardViewModel = require('../viewModels/SystemCardViewModel');
    
    // Injection de dépendances
    const systemThemeService = new SystemThemeService();
    const viewModel = new SystemCardViewModel(systemThemeService);
    
    // Configuration des colonnes - maintenant basée sur les systèmes
    const mainColumnCodes = ['pbta', 'engrenages', 'myz', 'zombiology'];
    const secondColumnCodes = ['mistengine'];
    
    // Préparation des données via le ViewModel avec les univers
    const allSystemsWithUniverses = SystemeUtils.getSystemesAvecUnivers();
    const systemCards = viewModel.groupByColumnsWithUniverses(mainColumnCodes, secondColumnCodes, allSystemsWithUniverses);
    
    res.render('index', {
        title: 'Générateur PDF JDR - Créez vos fiches de personnages',
        meta: {
            description: 'Créez et partagez des fiches de personnages pour Monsterhearts, Engrenages & Sortilèges, Metro 2033 et Mist Engine',
            keywords: 'jdr, jeu de rôle, pdf, fiche personnage, monsterhearts, engrenages, metro 2033'
        },
        systemesJeu: SystemeUtils.getAllSystemes(),
        systemesAvecUnivers: allSystemsWithUniverses,
        systemCards: systemCards
    });
});

// ===== PAGES SYSTEMES DE JEU =====

// Routes dynamiques pour systèmes et univers
router.get('/systeme/:systeme', (req, res) => {
    const systeme = req.params.systeme;
    const config = systemesJeu[systeme];
    
    if (!config || !config.systeme) {
        return res.status(404).render('errors/404', {
            title: 'Système non trouvé',
            message: `Le système "${systeme}" n'existe pas.`
        });
    }
    
    res.render('systemes/index', {
        title: `${config.nom} - Générateur PDF JDR`,
        description: config.description,
        systeme: systeme,
        config: config
    });
});

router.get('/systeme/:systeme/:univers', (req, res) => {
    const systeme = req.params.systeme;
    const univers = req.params.univers;
    const configSysteme = systemesJeu[systeme];
    
    if (!configSysteme || !configSysteme.systeme) {
        return res.status(404).render('errors/404', {
            title: 'Système non trouvé',
            message: `Le système "${systeme}" n'existe pas.`
        });
    }
    
    if (!configSysteme.univers || !configSysteme.univers[univers]) {
        return res.status(404).render('errors/404', {
            title: 'Univers non trouvé',
            message: `L'univers "${univers}" n'existe pas pour le système ${configSysteme.nom}.`
        });
    }
    
    const configUnivers = configSysteme.univers[univers];
    
    // Récupération du thème via le service
    const SystemThemeService = require('../services/SystemThemeService');
    const systemThemeService = new SystemThemeService();
    const theme = systemThemeService.getTheme(systeme);
    const universeIcon = systemThemeService.getUniverseIcon(systeme, univers);
    
    // Debug logging
    console.log('Theme for', systeme, ':', theme);
    console.log('Universe icon for', systeme, univers, ':', universeIcon);
    
    res.render('systemes/univers', {
        title: `${configUnivers.nom} - Générateur PDF JDR`,
        description: configUnivers.description,
        systeme: systeme,
        univers: univers,
        configSysteme: configSysteme,
        configUnivers: configUnivers,
        theme: theme,
        universeIcon: universeIcon
    });
});

// Redirections pour compatibilité avec les anciennes routes
router.get('/monsterhearts', (req, res) => {
    res.redirect(301, '/systeme/pbta/monsterhearts');
});

router.get('/urban-shadows', (req, res) => {
    res.redirect(301, '/systeme/pbta/urban_shadows');
});

router.get('/metro2033', (req, res) => {
    res.redirect(301, '/systeme/myz/metro2033');
});

router.get('/engrenages', (req, res) => {
    res.redirect(301, '/systeme/engrenages/roue_du_temps');
});

router.get('/mistengine', (req, res) => {
    res.redirect(301, '/systeme/mistengine');
});

router.get('/zombiology', (req, res) => {
    res.redirect(301, '/systeme/zombiology');
});

// Page Monsterhearts (gardée pour compatibilité)
router.get('/systeme/pbta/monsterhearts', (req, res) => {
    const configSysteme = systemesJeu.pbta;
    const configUnivers = configSysteme.univers.monsterhearts;
    
    // Récupération du thème via le service
    const SystemThemeService = require('../services/SystemThemeService');
    const systemThemeService = new SystemThemeService();
    const theme = systemThemeService.getTheme('pbta');
    const universeIcon = systemThemeService.getUniverseIcon('pbta', 'monsterhearts');
    
    res.render('systemes/univers', {
        title: 'Monsterhearts - Générateur PDF JDR',
        description: 'Créez des fiches de personnages pour Monsterhearts',
        systeme: 'pbta',
        univers: 'monsterhearts',
        configSysteme: configSysteme,
        configUnivers: configUnivers,
        theme: theme,
        universeIcon: universeIcon
    });
});

// Formulaire document générique (routes dynamiques)
router.get('/systeme/:systeme/document-generique', (req, res) => {
    const systeme = req.params.systeme;
    const config = systemesJeu[systeme];
    
    if (!config || !config.systeme) {
        return res.status(404).render('errors/404', {
            title: 'Système non trouvé'
        });
    }
    
    res.render('systemes/creer-document-generique', {
        title: `Créer un Document ${config.nom}`,
        description: `Créez un document PDF personnalisé avec le style ${config.nom}`,
        systeme: systeme,
        config: config
    });
});

router.get('/systeme/:systeme/:univers/document-generique', (req, res) => {
    const systeme = req.params.systeme;
    const univers = req.params.univers;
    const configSysteme = systemesJeu[systeme];
    
    if (!configSysteme || !configSysteme.systeme || !configSysteme.univers?.[univers]) {
        return res.status(404).render('errors/404', {
            title: 'Univers non trouvé'
        });
    }
    
    const configUnivers = configSysteme.univers[univers];
    
    res.render('systemes/creer-document-generique', {
        title: `Créer un Document ${configUnivers.nom}`,
        description: `Créez un document PDF personnalisé avec le style ${configUnivers.nom}`,
        systeme: systeme,
        univers: univers,
        configSysteme: configSysteme,
        configUnivers: configUnivers
    });
});

// Compatibilité ancienne route
router.get('/monsterhearts/document-generique', (req, res) => {
    res.redirect(301, '/systeme/pbta/monsterhearts/document-generique');
});

// Compatibilité pour les anciennes routes de document générique
router.get('/engrenages/document-generique', (req, res) => {
    res.redirect(301, '/systeme/engrenages/roue_du_temps/document-generique');
});

// Route de compatibilité pour /systemes/:systeme -> redirection vers /systeme/:systeme
router.get('/systemes/:systeme', (req, res) => {
    const systeme = req.params.systeme;
    
    // Redirections basées sur la nouvelle structure
    const redirections = {
        'monsterhearts': '/systeme/pbta/monsterhearts',
        'urban-shadows': '/systeme/pbta/urban_shadows',
        'engrenages': '/systeme/engrenages',
        'roue-du-temps': '/systeme/engrenages/roue_du_temps',
        'ecryme': '/systeme/engrenages/ecryme',
        'metro2033': '/systeme/myz/metro2033',
        'mistengine': '/systeme/mistengine',
        'obojima': '/systeme/mistengine/obojima',
        'zamanora': '/systeme/mistengine/zamanora',
        'post-mortem': '/systeme/mistengine/post_mortem',
        'otherscape': '/systeme/mistengine/otherscape',
        'zombiology': '/systeme/zombiology'
    };
    
    if (redirections[systeme]) {
        return res.redirect(301, redirections[systeme]);
    }
    
    // Système non supporté
    return res.status(404).render('errors/404', {
        title: 'Système non trouvé',
        message: `Le système "${systeme}" n'existe pas.`
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
router.get('/mes-documents', authController.middlewareAuth, async (req, res) => {
    try {
        const utilisateurId = req.session.utilisateur.id;
        
        // Récupérer les données via les services
        const PersonnageService = require('../services/PersonnageService');
        const PdfService = require('../services/PdfService');
        
        const personnageService = new PersonnageService();
        const pdfService = new PdfService();
        
        // Récupérer personnages et PDFs en parallèle
        const [personnages, pdfs] = await Promise.all([
            personnageService.obtenirParUtilisateur(utilisateurId),
            pdfService.obtenirParUtilisateur(utilisateurId)
        ]);
        
        res.render('mes-documents', {
            title: 'Mes Documents - Générateur PDF JDR',
            personnages: personnages || [],
            pdfs: pdfs || []
        });
    } catch (error) {
        console.error('Erreur lors du chargement des documents:', error);
        res.render('mes-documents', {
            title: 'Mes Documents - Générateur PDF JDR',
            personnages: [],
            pdfs: [],
            erreur: 'Erreur lors du chargement des données'
        });
    }
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

// ===== ADMINISTRATION =====

// ===== ORACLES =====

// Pages publiques oracles
router.get('/oracles', oracleController.pageListeOracles);
router.get('/oracles/systeme/:gameSystem', oracleController.pageListeOraclesParSysteme);
router.get('/oracles/:id', oracleController.pageDetailOracle);

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

// Gestion des oracles (admin)
router.get('/admin/oracles', authController.middlewareRole('ADMIN'), oracleController.pageAdminOracles);
router.get('/admin/oracles/:id/edit', authController.middlewareRole('ADMIN'), oracleController.pageEditionOracle);
router.get('/admin/oracles/imports', authController.middlewareRole('ADMIN'), oracleController.pageHistoriqueImports);

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

// Page de soutien/don
router.get('/support', (req, res) => {
    res.render('systemes/support', {
        title: 'Soutenir brumisater - Faire un don',
        description: 'Soutenez le développement de brumisater et devenez Premium'
    });
});

// Page de succès après don
router.get('/support/success', donationController.paiementSucces);

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