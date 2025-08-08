/**
 * Index des configurations
 * Point d'entrée centralisé pour toutes les configurations
 */

const database = require('./database');
const { systemesJeu } = require('./systemesJeu');
const SystemeUtils = require('../utils/SystemeUtils');

// Export de la configuration complète comme avant (compatibilité)
const config = database;

module.exports = {
  // Configuration générale (compatibilité avec l'ancien config.js)
  ...database,
  
  // Configurations spécialisées
  database: database.database,
  server: database.server,
  session: database.session,
  auth: database.auth,
  directories: database.directories,
  logging: database.logging,
  security: database.security,
  pdf: database.pdf,
  upload: database.upload,
  api: database.api,
  
  // Systèmes de jeu
  systemesJeu,
  SystemeUtils
};