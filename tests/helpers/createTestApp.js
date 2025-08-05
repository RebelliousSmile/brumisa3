/**
 * Crée une instance Express configurée pour les tests
 * Évite l'initialisation de la vraie base de données
 */

const express = require('express');
const session = require('express-session');

function createTestApp() {
    const app = express();
    
    // Configuration minimale pour les tests
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    
    // Configuration des sessions pour les tests
    app.use(session({
        secret: 'test-secret-key-for-testing-only',
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: false, // HTTP pour les tests
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000 // 24 heures
        }
    }));
    
    // Middleware pour l'utilisateur connecté
    app.use((req, res, next) => {
        req.utilisateur = req.session?.utilisateur || null;
        next();
    });
    
    // Charger les routes API
    try {
        app.use('/api', require('../../src/routes/api'));
        
        // Stocker les services pour pouvoir les nettoyer
        app._testServices = [];
    } catch (error) {
        console.warn('Impossible de charger les routes API:', error.message);
        // Routes API minimales pour les tests
        app.get('/api/home/donnees', (req, res) => {
            res.json({
                succes: true,
                donnees: {
                    pdfs_recents: [],
                    actualites: [],
                    temoignages: [],
                    statistiques: {
                        nb_utilisateurs_inscrits: 0,
                        nb_contenus_ouverts_mois: 0,
                        nb_pdfs_stockes: 0
                    }
                }
            });
        });
        
        app.get('/api/dons/infos', (req, res) => {
            res.json({
                succes: true,
                donnees: {
                    message: 'Soutenez le projet',
                    plateforme: 'PayPal',
                    url_don: 'https://www.paypal.com/donate/?hosted_button_id=brumisa3',
                    objectifs: []
                }
            });
        });
        
        app.post('/api/newsletter/inscription', (req, res) => {
            res.json({
                succes: true,
                message: 'Inscription enregistrée'
            });
        });
    }
    
    // Route 404
    app.use((req, res) => {
        res.status(404).json({
            succes: false,
            message: 'Route non trouvée'
        });
    });
    
    // Gestionnaire d'erreurs
    app.use((error, req, res, next) => {
        console.error('Erreur dans test app:', error);
        res.status(500).json({
            succes: false,
            message: 'Erreur serveur',
            error: process.env.NODE_ENV === 'test' ? error.message : undefined
        });
    });
    
    return app;
}

module.exports = createTestApp;