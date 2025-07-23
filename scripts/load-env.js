/**
 * Utilitaire pour charger les variables d'environnement selon NODE_ENV
 * Utilisé par tous les scripts pour éviter la duplication
 */

const path = require('path');

function loadEnvironment() {
    // Déterminer le fichier d'environnement selon NODE_ENV
    const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env.local';
    const envPath = path.join(__dirname, '..', envFile);
    
    // Charger le fichier d'environnement
    require('dotenv').config({ path: envPath, override: true });
    
    // Afficher quel fichier a été chargé (pour debug)
    if (process.env.NODE_ENV !== 'test') {
        console.log(`📁 Chargement de ${envFile}`);
    }
}

module.exports = { loadEnvironment };