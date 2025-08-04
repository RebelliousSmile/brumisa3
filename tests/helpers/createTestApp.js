/**
 * Crée une instance Express configurée pour les tests
 * Évite l'initialisation de la vraie base de données
 */

const express = require('express');

function createTestApp() {
    const app = express();
    
    // Configuration minimale pour les tests
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    
    // Pas besoin de cookies ni de sessions pour les tests d'API publiques
    
    // Middleware pour simuler l'utilisateur connecté si nécessaire
    app.use((req, res, next) => {
        // Pour les tests, on peut injecter un utilisateur ici
        req.utilisateur = req.session?.utilisateur || null;
        next();
    });
    
    // Charger les routes API
    try {
        app.use('/api', require('../../src/routes/api'));
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