-- Migration 002: Tables d'oracles uniquement
-- Date: 2025-01-22

-- 1. Table principale des oracles
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

-- Index pour optimisation des requêtes
CREATE INDEX IF NOT EXISTS idx_oracles_premium ON oracles(premium_required);
CREATE INDEX IF NOT EXISTS idx_oracles_active ON oracles(is_active);
CREATE INDEX IF NOT EXISTS idx_oracles_created_by ON oracles(created_by);
CREATE INDEX IF NOT EXISTS idx_oracles_filters ON oracles USING GIN(filters);
CREATE INDEX IF NOT EXISTS idx_oracles_name ON oracles(name);

-- 2. Table des items d'oracle avec pondération
CREATE TABLE IF NOT EXISTS oracle_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  oracle_id UUID NOT NULL REFERENCES oracles(id) ON DELETE CASCADE,
  value TEXT NOT NULL,
  weight INTEGER NOT NULL DEFAULT 1 CHECK (weight >= 0),
  metadata JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT valid_weight CHECK (weight >= 0)
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_oracle_items_oracle_id ON oracle_items(oracle_id);
CREATE INDEX IF NOT EXISTS idx_oracle_items_weight ON oracle_items(weight);
CREATE INDEX IF NOT EXISTS idx_oracle_items_active ON oracle_items(is_active);
CREATE INDEX IF NOT EXISTS idx_oracle_items_metadata ON oracle_items USING GIN(metadata);
CREATE INDEX IF NOT EXISTS idx_oracle_items_value ON oracle_items(value);

-- 3. Historique des tirages pour statistiques
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

-- Index pour analyse et performance
CREATE INDEX IF NOT EXISTS idx_oracle_draws_oracle_id ON oracle_draws(oracle_id);
CREATE INDEX IF NOT EXISTS idx_oracle_draws_user_id ON oracle_draws(user_id);
CREATE INDEX IF NOT EXISTS idx_oracle_draws_session ON oracle_draws(session_id);
CREATE INDEX IF NOT EXISTS idx_oracle_draws_created_at ON oracle_draws(created_at);
CREATE INDEX IF NOT EXISTS idx_oracle_draws_results ON oracle_draws USING GIN(results);

-- 4. Gestion des imports de fichiers
CREATE TABLE IF NOT EXISTS oracle_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id INTEGER NOT NULL REFERENCES utilisateurs(id),
  oracle_id UUID REFERENCES oracles(id) ON DELETE SET NULL,
  filename VARCHAR(255) NOT NULL,
  file_size INTEGER,
  file_hash VARCHAR(64),
  import_type VARCHAR(20) NOT NULL CHECK (import_type IN ('JSON', 'CSV', 'XML')),
  import_mode VARCHAR(20) NOT NULL CHECK (import_mode IN ('CREATE', 'REPLACE', 'MERGE')),
  items_imported INTEGER DEFAULT 0,
  items_failed INTEGER DEFAULT 0,
  validation_errors JSONB,
  import_status VARCHAR(20) DEFAULT 'PENDING' CHECK (import_status IN ('PENDING', 'SUCCESS', 'FAILED', 'PARTIAL', 'CANCELLED')),
  processing_time_ms INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_oracle_imports_admin_user ON oracle_imports(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_oracle_imports_oracle_id ON oracle_imports(oracle_id);
CREATE INDEX IF NOT EXISTS idx_oracle_imports_status ON oracle_imports(import_status);
CREATE INDEX IF NOT EXISTS idx_oracle_imports_created_at ON oracle_imports(created_at);

-- 5. Trigger pour recalcul automatique du poids total
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

-- Application du trigger sur les modifications d'items
DROP TRIGGER IF EXISTS trigger_update_oracle_weight ON oracle_items;
CREATE TRIGGER trigger_update_oracle_weight
  AFTER INSERT OR UPDATE OR DELETE ON oracle_items
  FOR EACH ROW
  EXECUTE FUNCTION update_oracle_total_weight();

-- 6. Trigger pour mise à jour automatique de updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Application sur les tables principales
DROP TRIGGER IF EXISTS trigger_oracles_updated_at ON oracles;
CREATE TRIGGER trigger_oracles_updated_at
  BEFORE UPDATE ON oracles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();