const db = require('./db');
const logManager = require('../utils/logManager');

/**
 * Script d'initialisation de la base de données
 * Crée toutes les tables nécessaires au fonctionnement de l'application
 */

const createTables = {
  // Table des utilisateurs et authentification
  utilisateurs: `
    CREATE TABLE IF NOT EXISTS utilisateurs (
      id SERIAL PRIMARY KEY,
      nom VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE,
      role VARCHAR(50) NOT NULL DEFAULT 'UTILISATEUR' CHECK (role IN ('UTILISATEUR', 'PREMIUM', 'ADMIN')),
      code_acces VARCHAR(255),
      session_id VARCHAR(255),
      derniere_connexion TIMESTAMP,
      date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      actif BOOLEAN DEFAULT TRUE
    )
  `,

  // Table des personnages JDR
  personnages: `
    CREATE TABLE IF NOT EXISTS personnages (
      id SERIAL PRIMARY KEY,
      utilisateur_id INTEGER NOT NULL,
      nom VARCHAR(255) NOT NULL,
      systeme_jeu VARCHAR(50) NOT NULL CHECK (systeme_jeu IN ('monsterhearts', 'engrenages', 'metro_2033', 'mist_engine')),
      
      -- Données du personnage (JSON)
      attributs JSONB NOT NULL, -- JSON des attributs selon le système
      competences JSONB, -- JSON des compétences/skills
      avantages JSONB, -- JSON des avantages/moves/skins
      equipement JSONB, -- JSON de l'équipement
      historique JSONB, -- JSON de l'historique/background
      notes TEXT, -- Notes libres du joueur
      
      -- Mécaniques spécifiques
      sante_actuelle INTEGER DEFAULT 0,
      sante_maximale INTEGER DEFAULT 0,
      experience_actuelle INTEGER DEFAULT 0,
      experience_totale INTEGER DEFAULT 0,
      
      -- Métadonnées
      avatar_url VARCHAR(500),
      couleur_theme VARCHAR(50),
      public BOOLEAN DEFAULT FALSE,
      date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      
      FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE
    )
  `,

  // Table des PDFs générés
  pdfs: `
    CREATE TABLE IF NOT EXISTS pdfs (
      id SERIAL PRIMARY KEY,
      personnage_id INTEGER NOT NULL,
      utilisateur_id INTEGER NOT NULL,
      type_pdf VARCHAR(50) NOT NULL DEFAULT 'fiche_personnage' CHECK (type_pdf IN ('fiche_personnage', 'fiche_pnj', 'carte_reference', 'guide_moves', 'suivi_conditions', 'notes_session')),
      
      -- Statut de génération
      statut VARCHAR(50) NOT NULL DEFAULT 'EN_ATTENTE' CHECK (statut IN ('EN_ATTENTE', 'EN_TRAITEMENT', 'TERMINE', 'ECHEC')),
      progression INTEGER DEFAULT 0, -- Pourcentage 0-100
      
      -- Fichier généré
      nom_fichier VARCHAR(255),
      chemin_fichier VARCHAR(500),
      taille_fichier BIGINT,
      url_temporaire VARCHAR(500),
      
      -- Paramètres de génération
      options_generation JSONB, -- JSON des options (format, style, etc.)
      template_utilise VARCHAR(255),
      
      -- Métadonnées
      temps_generation INTEGER, -- en millisecondes
      erreur_message TEXT,
      date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      date_expiration TIMESTAMP, -- Pour nettoyage automatique
      telecharge BOOLEAN DEFAULT FALSE,
      nombre_telechargements INTEGER DEFAULT 0,
      
      FOREIGN KEY (personnage_id) REFERENCES personnages(id) ON DELETE CASCADE,
      FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE
    )
  `,

  // Table des sessions utilisateur
  sessions: `
    CREATE TABLE IF NOT EXISTS sessions (
      id VARCHAR(255) PRIMARY KEY,
      utilisateur_id INTEGER,
      donnees JSONB NOT NULL, -- JSON des données de session
      adresse_ip INET,
      user_agent TEXT,
      actif BOOLEAN DEFAULT TRUE,
      date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      date_expiration TIMESTAMP NOT NULL,
      
      FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE
    )
  `,

  // Table des logs applicatifs (complément Winston)
  logs_activite: `
    CREATE TABLE IF NOT EXISTS logs_activite (
      id SERIAL PRIMARY KEY,
      utilisateur_id INTEGER,
      action VARCHAR(100) NOT NULL,
      ressource VARCHAR(100), -- Table/entité affectée
      ressource_id INTEGER, -- ID de l'entité
      details JSONB, -- JSON des détails
      adresse_ip INET,
      user_agent TEXT,
      date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      
      FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE SET NULL
    )
  `,

  // Table des paramètres globaux
  parametres: `
    CREATE TABLE IF NOT EXISTS parametres (
      cle VARCHAR(100) PRIMARY KEY,
      valeur TEXT NOT NULL,
      type VARCHAR(20) DEFAULT 'string' CHECK (type IN ('string', 'number', 'boolean', 'json')),
      description TEXT,
      modifiable BOOLEAN DEFAULT TRUE,
      date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `,

  // Table des templates PDF personnalisés
  templates_pdf: `
    CREATE TABLE IF NOT EXISTS templates_pdf (
      id SERIAL PRIMARY KEY,
      nom VARCHAR(255) NOT NULL,
      systeme_jeu VARCHAR(50) NOT NULL,
      type_template VARCHAR(50) NOT NULL,
      
      -- Template
      contenu_html TEXT NOT NULL,
      styles_css TEXT NOT NULL,
      variables_disponibles JSONB, -- JSON
      
      -- Métadonnées
      description TEXT,
      auteur_id INTEGER,
      public BOOLEAN DEFAULT FALSE,
      version VARCHAR(20) DEFAULT '1.0.0',
      actif BOOLEAN DEFAULT TRUE,
      date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      
      FOREIGN KEY (auteur_id) REFERENCES utilisateurs(id) ON DELETE SET NULL
    )
  `
};

const createIndexes = [
  'CREATE INDEX IF NOT EXISTS idx_utilisateurs_email ON utilisateurs(email)',
  'CREATE INDEX IF NOT EXISTS idx_utilisateurs_session ON utilisateurs(session_id)',
  'CREATE INDEX IF NOT EXISTS idx_personnages_utilisateur ON personnages(utilisateur_id)',
  'CREATE INDEX IF NOT EXISTS idx_personnages_systeme ON personnages(systeme_jeu)',
  'CREATE INDEX IF NOT EXISTS idx_personnages_public ON personnages(public)',
  'CREATE INDEX IF NOT EXISTS idx_pdfs_personnage ON pdfs(personnage_id)',
  'CREATE INDEX IF NOT EXISTS idx_pdfs_utilisateur ON pdfs(utilisateur_id)',
  'CREATE INDEX IF NOT EXISTS idx_pdfs_statut ON pdfs(statut)',
  'CREATE INDEX IF NOT EXISTS idx_pdfs_expiration ON pdfs(date_expiration)',
  'CREATE INDEX IF NOT EXISTS idx_sessions_utilisateur ON sessions(utilisateur_id)',
  'CREATE INDEX IF NOT EXISTS idx_sessions_expiration ON sessions(date_expiration)',
  'CREATE INDEX IF NOT EXISTS idx_logs_utilisateur ON logs_activite(utilisateur_id)',
  'CREATE INDEX IF NOT EXISTS idx_logs_action ON logs_activite(action)',
  'CREATE INDEX IF NOT EXISTS idx_logs_date ON logs_activite(date_creation)',
  'CREATE INDEX IF NOT EXISTS idx_templates_systeme ON templates_pdf(systeme_jeu)',
  'CREATE INDEX IF NOT EXISTS idx_templates_public ON templates_pdf(public)'
];

const insertDefaultData = [
  // Paramètres par défaut
  {
    sql: `INSERT INTO parametres (cle, valeur, type, description, modifiable) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (cle) DO NOTHING`,
    params: ['app_version', '1.0.0', 'string', 'Version de l\'application', false]
  },
  {
    sql: `INSERT INTO parametres (cle, valeur, type, description) VALUES ($1, $2, $3, $4) ON CONFLICT (cle) DO NOTHING`,
    params: ['pdf_cleanup_enabled', 'true', 'boolean', 'Nettoyage automatique des PDFs']
  },
  {
    sql: `INSERT INTO parametres (cle, valeur, type, description) VALUES ($1, $2, $3, $4) ON CONFLICT (cle) DO NOTHING`,
    params: ['pdf_cleanup_max_age', '86400000', 'number', 'Âge maximum des PDFs en millisecondes (24h)']
  },
  {
    sql: `INSERT INTO parametres (cle, valeur, type, description) VALUES ($1, $2, $3, $4) ON CONFLICT (cle) DO NOTHING`,
    params: ['max_personnages_par_utilisateur', '50', 'number', 'Nombre maximum de personnages par utilisateur']
  },
  {
    sql: `INSERT INTO parametres (cle, valeur, type, description) VALUES ($1, $2, $3, $4) ON CONFLICT (cle) DO NOTHING`,
    params: ['max_pdfs_simultanes', '5', 'number', 'Nombre maximum de PDFs en génération simultanée']
  },

  // Utilisateur admin par défaut (dev uniquement)
  {
    sql: `INSERT INTO utilisateurs (nom, email, role) VALUES ($1, $2, $3) ON CONFLICT (email) DO NOTHING`,
    params: ['Administrateur', 'admin@localhost', 'ADMIN']
  }
];

/**
 * Initialise la base de données PostgreSQL
 */
async function initializeDatabase() {
  try {
    logManager.info('Début initialisation base de données PostgreSQL');

    // Initialise la connexion
    await db.init();

    // Crée toutes les tables
    for (const [tableName, sql] of Object.entries(createTables)) {
      await db.run(sql);
      logManager.info(`Table créée: ${tableName}`);
    }

    // Crée tous les index
    for (const indexSql of createIndexes) {
      await db.run(indexSql);
    }
    logManager.info('Index créés');

    // Insère les données par défaut
    for (const data of insertDefaultData) {
      await db.run(data.sql, data.params);
    }
    logManager.info('Données par défaut insérées');
    
    logManager.info('Initialisation base de données PostgreSQL terminée');
    return true;

  } catch (error) {
    logManager.error('Erreur initialisation base de données PostgreSQL', { error: error.message });
    throw error;
  }
}

/**
 * Vérifie si la base de données est initialisée
 */
async function isDatabaseInitialized() {
  try {
    const result = await db.get(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'utilisateurs'
    `);
    return parseInt(result.count) > 0;
  } catch (error) {
    return false;
  }
}

/**
 * Réinitialise la base de données (ATTENTION: supprime toutes les données)
 */
async function resetDatabase() {
  try {
    logManager.warn('Début réinitialisation base de données - TOUTES LES DONNÉES SERONT PERDUES');

    // Liste toutes les tables
    const tables = await db.all(`
      SELECT table_name as name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);

    // Supprime toutes les tables
    for (const table of tables) {
      await db.run(`DROP TABLE IF EXISTS ${table.name} CASCADE`);
      logManager.info(`Table supprimée: ${table.name}`);
    }

    // Réinitialise
    await initializeDatabase();
    
    logManager.warn('Base de données réinitialisée avec succès');
    return true;

  } catch (error) {
    logManager.error('Erreur réinitialisation base de données', { error: error.message });
    throw error;
  }
}

/**
 * Migre la base de données vers une nouvelle version
 */
async function migrateDatabase() {
  try {
    // Récupère la version actuelle
    const currentVersion = await db.get(`
      SELECT valeur FROM parametres WHERE cle = $1
    `, ['app_version']);

    if (!currentVersion) {
      logManager.info('Première initialisation - pas de migration nécessaire');
      return;
    }

    logManager.info(`Version actuelle: ${currentVersion.valeur}`);
    
    // Ici on ajouterait les scripts de migration selon les versions
    // Pour l'instant, pas de migration nécessaire
    
  } catch (error) {
    logManager.error('Erreur migration base de données', { error: error.message });
    throw error;
  }
}

module.exports = {
  initializeDatabase,
  isDatabaseInitialized,
  resetDatabase,
  migrateDatabase,
  createTables,
  createIndexes
};

// Auto-initialisation si exécuté directement
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      logManager.info('Initialisation terminée avec succès');
      process.exit(0);
    })
    .catch((error) => {
      logManager.error('Échec initialisation', { error: error.message });
      process.exit(1);
    });
}