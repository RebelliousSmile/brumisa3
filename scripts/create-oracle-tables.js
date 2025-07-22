#!/usr/bin/env node

/**
 * Script pour créer les tables d'oracles par étapes
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const db = require('../src/database/db');

async function creerTablesOracles() {
    console.log('🎲 Création des tables d\'oracles');
    console.log('==================================\n');

    const requetes = [
        // 1. Table principale des oracles
        {
            nom: 'Table oracles',
            sql: `
                CREATE TABLE IF NOT EXISTS oracles (
                  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                  name VARCHAR(255) NOT NULL,
                  description TEXT,
                  premium_required BOOLEAN DEFAULT FALSE,
                  total_weight INTEGER DEFAULT 0,
                  filters JSONB,
                  is_active BOOLEAN DEFAULT TRUE,
                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  created_by INTEGER REFERENCES utilisateurs(id) ON DELETE SET NULL
                );
            `
        },

        // 2. Index pour oracles
        {
            nom: 'Index oracles',
            sql: `
                CREATE INDEX IF NOT EXISTS idx_oracles_premium ON oracles(premium_required);
                CREATE INDEX IF NOT EXISTS idx_oracles_active ON oracles(is_active);
                CREATE INDEX IF NOT EXISTS idx_oracles_name ON oracles(name);
            `
        },

        // 3. Table oracle_items
        {
            nom: 'Table oracle_items',
            sql: `
                CREATE TABLE IF NOT EXISTS oracle_items (
                  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                  oracle_id UUID NOT NULL REFERENCES oracles(id) ON DELETE CASCADE,
                  value TEXT NOT NULL,
                  weight INTEGER NOT NULL DEFAULT 1 CHECK (weight >= 0),
                  metadata JSONB,
                  is_active BOOLEAN DEFAULT TRUE,
                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `
        },

        // 4. Index pour oracle_items
        {
            nom: 'Index oracle_items',
            sql: `
                CREATE INDEX IF NOT EXISTS idx_oracle_items_oracle_id ON oracle_items(oracle_id);
                CREATE INDEX IF NOT EXISTS idx_oracle_items_active ON oracle_items(is_active);
            `
        },

        // 5. Table oracle_draws
        {
            nom: 'Table oracle_draws',
            sql: `
                CREATE TABLE IF NOT EXISTS oracle_draws (
                  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                  oracle_id UUID NOT NULL REFERENCES oracles(id) ON DELETE CASCADE,
                  user_id INTEGER REFERENCES utilisateurs(id) ON DELETE SET NULL,
                  session_id VARCHAR(255),
                  results JSONB NOT NULL,
                  filters_applied JSONB,
                  draw_count INTEGER NOT NULL DEFAULT 1,
                  ip_address INET,
                  user_agent TEXT,
                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `
        },

        // 6. Table oracle_imports
        {
            nom: 'Table oracle_imports',
            sql: `
                CREATE TABLE IF NOT EXISTS oracle_imports (
                  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                  admin_user_id INTEGER NOT NULL REFERENCES utilisateurs(id),
                  oracle_id UUID REFERENCES oracles(id) ON DELETE SET NULL,
                  filename VARCHAR(255) NOT NULL,
                  file_size INTEGER,
                  file_hash VARCHAR(64),
                  import_type VARCHAR(20) NOT NULL CHECK (import_type IN ('JSON', 'CSV')),
                  import_mode VARCHAR(20) NOT NULL CHECK (import_mode IN ('CREATE', 'REPLACE', 'MERGE')),
                  items_imported INTEGER DEFAULT 0,
                  items_failed INTEGER DEFAULT 0,
                  validation_errors JSONB,
                  import_status VARCHAR(20) DEFAULT 'PENDING' CHECK (import_status IN ('PENDING', 'SUCCESS', 'FAILED', 'PARTIAL', 'CANCELLED')),
                  processing_time_ms INTEGER,
                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  completed_at TIMESTAMP
                );
            `
        },

        // 7. Fonction trigger pour poids total
        {
            nom: 'Fonction update_oracle_total_weight',
            sql: `
                CREATE OR REPLACE FUNCTION update_oracle_total_weight()
                RETURNS TRIGGER AS $$
                BEGIN
                  UPDATE oracles 
                  SET total_weight = (
                    SELECT COALESCE(SUM(weight), 0) 
                    FROM oracle_items 
                    WHERE oracle_id = COALESCE(NEW.oracle_id, OLD.oracle_id) 
                    AND is_active = TRUE
                  ),
                  updated_at = CURRENT_TIMESTAMP
                  WHERE id = COALESCE(NEW.oracle_id, OLD.oracle_id);
                  
                  RETURN COALESCE(NEW, OLD);
                END;
                $$ LANGUAGE plpgsql;
            `
        },

        // 8. Trigger sur oracle_items
        {
            nom: 'Trigger update oracle weight',
            sql: `
                DROP TRIGGER IF EXISTS trigger_update_oracle_weight ON oracle_items;
                CREATE TRIGGER trigger_update_oracle_weight
                  AFTER INSERT OR UPDATE OR DELETE ON oracle_items
                  FOR EACH ROW
                  EXECUTE FUNCTION update_oracle_total_weight();
            `
        },

        // 9. Fonction pour updated_at
        {
            nom: 'Fonction update_updated_at_column',
            sql: `
                CREATE OR REPLACE FUNCTION update_updated_at_column()
                RETURNS TRIGGER AS $$
                BEGIN
                  NEW.updated_at = CURRENT_TIMESTAMP;
                  RETURN NEW;
                END;
                $$ LANGUAGE plpgsql;
            `
        },

        // 10. Trigger updated_at sur oracles
        {
            nom: 'Trigger updated_at oracles',
            sql: `
                DROP TRIGGER IF EXISTS trigger_oracles_updated_at ON oracles;
                CREATE TRIGGER trigger_oracles_updated_at
                  BEFORE UPDATE ON oracles
                  FOR EACH ROW
                  EXECUTE FUNCTION update_updated_at_column();
            `
        }
    ];

    let success = 0;
    let errors = 0;

    for (const requete of requetes) {
        console.log(`🔄 ${requete.nom}...`);
        
        try {
            await db.run(requete.sql);
            console.log(`   ✅ OK`);
            success++;
        } catch (error) {
            console.log(`   ❌ Erreur: ${error.message}`);
            errors++;
        }
    }

    console.log(`\n📊 Résultats:`);
    console.log(`   ✅ Réussies: ${success}/${requetes.length}`);
    console.log(`   ❌ Erreurs: ${errors}/${requetes.length}`);

    if (success > 0) {
        console.log('\n🎉 Tables d\'oracles créées avec succès !');
        console.log('💡 Vous pouvez maintenant utiliser:');
        console.log('   node scripts/injecter-oracle.js --fichier=oracle.json');
    }
}

// Vérification de l'état des tables
async function verifierTables() {
    try {
        const result = await db.get(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'oracles'
            ) as table_exists
        `);
        
        console.log(`🔍 Table 'oracles': ${result.table_exists ? 'Existe' : 'N\'existe pas'}`);
        return result.table_exists;
    } catch (error) {
        console.log('❌ Erreur lors de la vérification:', error.message);
        return false;
    }
}

async function main() {
    console.log('🗄️  Création des tables d\'oracles');
    console.log('==================================\n');

    // Vérification avant
    await verifierTables();
    console.log('');

    // Création des tables
    await creerTablesOracles();

    // Vérification après
    console.log('\n🔍 Vérification finale...');
    await verifierTables();
}

if (require.main === module) {
    main().catch(error => {
        console.error('\n💥 Erreur fatale:', error.message);
        process.exit(1);
    });
}