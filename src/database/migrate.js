const db = require('./db');
const logManager = require('../utils/logManager');

/**
 * Script de migration de la base de données
 * Gère les mises à jour de schéma entre les versions
 */

/**
 * Migrations par version
 * Chaque migration doit être idempotente (peut être exécutée plusieurs fois sans problème)
 */
const migrations = {
  '1.0.0': [],
  
  '1.1.0': [
    // Migration pour ajouter les colonnes d'authentification par mot de passe
    {
      name: 'add_password_authentication',
      description: 'Ajoute les colonnes pour l\'authentification par mot de passe',
      sql: `
        ALTER TABLE utilisateurs 
        ADD COLUMN IF NOT EXISTS mot_de_passe VARCHAR(255),
        ADD COLUMN IF NOT EXISTS token_recuperation VARCHAR(64),
        ADD COLUMN IF NOT EXISTS token_expiration TIMESTAMP;
      `
    },
    {
      name: 'add_password_indexes',
      description: 'Ajoute les index pour les tokens de récupération',
      sql: `CREATE INDEX IF NOT EXISTS idx_utilisateurs_token ON utilisateurs(token_recuperation)`
    },
    {
      name: 'add_password_expiration_index',
      description: 'Ajoute l\'index pour l\'expiration des tokens',
      sql: `CREATE INDEX IF NOT EXISTS idx_utilisateurs_token_expiration ON utilisateurs(token_expiration)`
    }
  ]
};

/**
 * Table de suivi des migrations
 */
const createMigrationsTable = `
  CREATE TABLE IF NOT EXISTS migrations (
    id SERIAL PRIMARY KEY,
    version VARCHAR(20) NOT NULL,
    migration_name VARCHAR(100) NOT NULL,
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(version, migration_name)
  )
`;

/**
 * Récupère la version actuelle de l'application
 */
async function getCurrentVersion() {
  try {
    const result = await db.get(`
      SELECT valeur FROM parametres WHERE cle = $1
    `, ['app_version']);
    
    return result ? result.valeur : '1.0.0';
  } catch (error) {
    logManager.warn('Impossible de récupérer la version actuelle, utilisation de 1.0.0 par défaut');
    return '1.0.0';
  }
}

/**
 * Récupère les migrations déjà exécutées
 */
async function getExecutedMigrations() {
  try {
    const results = await db.all(`
      SELECT version, migration_name FROM migrations
    `);
    
    return results.map(r => `${r.version}:${r.migration_name}`);
  } catch (error) {
    // Table migrations n'existe pas encore
    return [];
  }
}

/**
 * Marque une migration comme exécutée
 */
async function markMigrationExecuted(version, migrationName) {
  await db.run(`
    INSERT INTO migrations (version, migration_name) 
    VALUES ($1, $2) 
    ON CONFLICT (version, migration_name) DO NOTHING
  `, [version, migrationName]);
}

/**
 * Met à jour la version de l'application
 */
async function updateAppVersion(version) {
  await db.run(`
    UPDATE parametres 
    SET valeur = $1, date_modification = CURRENT_TIMESTAMP 
    WHERE cle = $2
  `, [version, 'app_version']);
}

/**
 * Compare deux versions sémantiques
 */
function compareVersions(version1, version2) {
  const v1parts = version1.split('.').map(Number);
  const v2parts = version2.split('.').map(Number);
  
  for (let i = 0; i < Math.max(v1parts.length, v2parts.length); i++) {
    const v1part = v1parts[i] || 0;
    const v2part = v2parts[i] || 0;
    
    if (v1part < v2part) return -1;
    if (v1part > v2part) return 1;
  }
  
  return 0;
}

/**
 * Obtient les versions à migrer
 */
function getVersionsToMigrate(currentVersion, targetVersion) {
  const versionsToMigrate = [];
  
  for (const version of Object.keys(migrations)) {
    if (compareVersions(version, currentVersion) > 0 && 
        compareVersions(version, targetVersion) <= 0) {
      versionsToMigrate.push(version);
    }
  }
  
  // Trier les versions
  return versionsToMigrate.sort(compareVersions);
}

/**
 * Exécute une migration
 */
async function executeMigration(version, migration) {
  const migrationKey = `${version}:${migration.name}`;
  
  try {
    logManager.info(`Exécution migration: ${migrationKey}`, {
      description: migration.description
    });
    
    // Exécuter le SQL de migration
    await db.run(migration.sql);
    
    // Marquer comme exécutée
    await markMigrationExecuted(version, migration.name);
    
    logManager.info(`Migration réussie: ${migrationKey}`);
    
  } catch (error) {
    logManager.error(`Échec migration: ${migrationKey}`, {
      error: error.message,
      sql: migration.sql
    });
    throw error;
  }
}

/**
 * Migre la base de données vers une version donnée
 */
async function migrateToVersion(targetVersion) {
  try {
    logManager.info('Début migration base de données', {
      target_version: targetVersion
    });
    
    // Initialiser la connexion
    await db.init();
    
    // Créer la table des migrations si elle n'existe pas
    await db.run(createMigrationsTable);
    
    // Récupérer la version actuelle et les migrations exécutées
    const currentVersion = await getCurrentVersion();
    const executedMigrations = await getExecutedMigrations();
    
    logManager.info('État actuel', {
      current_version: currentVersion,
      target_version: targetVersion,
      executed_migrations: executedMigrations.length
    });
    
    // Déterminer les versions à migrer
    const versionsToMigrate = getVersionsToMigrate(currentVersion, targetVersion);
    
    if (versionsToMigrate.length === 0) {
      logManager.info('Aucune migration nécessaire');
      return true;
    }
    
    logManager.info(`${versionsToMigrate.length} version(s) à migrer`, {
      versions: versionsToMigrate
    });
    
    // Exécuter les migrations pour chaque version
    for (const version of versionsToMigrate) {
      const versionMigrations = migrations[version] || [];
      
      logManager.info(`Migration vers version ${version}`, {
        migrations_count: versionMigrations.length
      });
      
      for (const migration of versionMigrations) {
        const migrationKey = `${version}:${migration.name}`;
        
        // Vérifier si déjà exécutée
        if (executedMigrations.includes(migrationKey)) {
          logManager.info(`Migration déjà exécutée: ${migrationKey}`);
          continue;
        }
        
        await executeMigration(version, migration);
      }
      
      // Mettre à jour la version de l'application
      await updateAppVersion(version);
      logManager.info(`Version mise à jour: ${version}`);
    }
    
    logManager.info('Migration terminée avec succès', {
      from_version: currentVersion,
      to_version: targetVersion
    });
    
    return true;
    
  } catch (error) {
    logManager.error('Erreur lors de la migration', {
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
}

/**
 * Migre vers la dernière version disponible
 */
async function migrateToLatest() {
  const versions = Object.keys(migrations);
  if (versions.length === 0) {
    logManager.info('Aucune migration disponible');
    return true;
  }
  
  const latestVersion = versions.sort(compareVersions).pop();
  return await migrateToVersion(latestVersion);
}

/**
 * Affiche le statut des migrations
 */
async function getMigrationStatus() {
  try {
    await db.init();
    
    const currentVersion = await getCurrentVersion();
    const executedMigrations = await getExecutedMigrations();
    
    const status = {
      current_version: currentVersion,
      executed_migrations: executedMigrations,
      available_migrations: {}
    };
    
    // Lister toutes les migrations disponibles
    for (const [version, versionMigrations] of Object.entries(migrations)) {
      status.available_migrations[version] = versionMigrations.map(m => ({
        name: m.name,
        description: m.description,
        executed: executedMigrations.includes(`${version}:${m.name}`)
      }));
    }
    
    return status;
    
  } catch (error) {
    logManager.error('Erreur lors de la récupération du statut', {
      error: error.message
    });
    throw error;
  }
}

/**
 * Rollback d'une migration (fonctionnalité avancée, non implémentée)
 */
async function rollbackMigration(version, migrationName) {
  logManager.warn('Rollback non implémenté', {
    version,
    migration_name: migrationName
  });
  throw new Error('Fonctionnalité de rollback non implémentée');
}

module.exports = {
  migrateToVersion,
  migrateToLatest,
  getMigrationStatus,
  rollbackMigration,
  migrations
};

// Auto-exécution si appelé directement
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0] || 'latest';
  
  async function main() {
    try {
      switch (command) {
        case 'latest':
          await migrateToLatest();
          logManager.info('Migration vers la dernière version terminée');
          break;
          
        case 'status':
          const status = await getMigrationStatus();
          console.log('=== STATUT DES MIGRATIONS ===');
          console.log(`Version actuelle: ${status.current_version}`);
          console.log(`Migrations exécutées: ${status.executed_migrations.length}`);
          console.log('');
          
          for (const [version, versionMigrations] of Object.entries(status.available_migrations)) {
            console.log(`Version ${version}:`);
            for (const migration of versionMigrations) {
              const status = migration.executed ? '✓' : '✗';
              console.log(`  ${status} ${migration.name} - ${migration.description}`);
            }
            console.log('');
          }
          break;
          
        case 'version':
          const targetVersion = args[1];
          if (!targetVersion) {
            logManager.error('Version cible requise: node migrate.js version 1.1.0');
            process.exit(1);
          }
          await migrateToVersion(targetVersion);
          logManager.info(`Migration vers ${targetVersion} terminée`);
          break;
          
        default:
          console.log('Commandes disponibles:');
          console.log('  node migrate.js latest         - Migre vers la dernière version');
          console.log('  node migrate.js status         - Affiche le statut des migrations');
          console.log('  node migrate.js version X.Y.Z  - Migre vers une version spécifique');
          process.exit(1);
      }
      
      process.exit(0);
      
    } catch (error) {
      logManager.error('Échec migration', { error: error.message });
      process.exit(1);
    }
  }
  
  main();
}