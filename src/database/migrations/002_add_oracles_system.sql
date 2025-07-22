-- Migration 002: Système d'oracles
-- Date: 2025-01-22
-- Description: Ajoute les tables pour le système d'oracles avec tirages pondérés

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

-- 4. Catégories d'oracles pour organisation (optionnel)
CREATE TABLE IF NOT EXISTS oracle_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  parent_id UUID REFERENCES oracle_categories(id) ON DELETE SET NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_oracle_categories_parent ON oracle_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_oracle_categories_name ON oracle_categories(name);

-- 5. Liaison many-to-many oracles <-> catégories
CREATE TABLE IF NOT EXISTS oracle_category_assignments (
  oracle_id UUID REFERENCES oracles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES oracle_categories(id) ON DELETE CASCADE,
  PRIMARY KEY (oracle_id, category_id)
);

-- 6. Historique des modifications administratives
CREATE TABLE IF NOT EXISTS oracle_edit_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  oracle_id UUID NOT NULL REFERENCES oracles(id) ON DELETE CASCADE,
  admin_user_id INTEGER NOT NULL REFERENCES utilisateurs(id),
  action_type VARCHAR(50) NOT NULL CHECK (action_type IN ('CREATE', 'UPDATE', 'DELETE', 'RESTORE')),
  entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('ORACLE', 'ITEM', 'METADATA')),
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  change_reason TEXT,
  ip_address INET,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour audit et traçabilité
CREATE INDEX IF NOT EXISTS idx_oracle_edit_history_oracle_id ON oracle_edit_history(oracle_id);
CREATE INDEX IF NOT EXISTS idx_oracle_edit_history_admin_user ON oracle_edit_history(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_oracle_edit_history_action ON oracle_edit_history(action_type);
CREATE INDEX IF NOT EXISTS idx_oracle_edit_history_created_at ON oracle_edit_history(created_at);

-- 7. Gestion des imports de fichiers
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
  import_status VARCHAR(20) DEFAULT 'PENDING' CHECK (import_status IN ('PENDING', 'SUCCESS', 'FAILED', 'PARTIAL')),
  processing_time_ms INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_oracle_imports_admin_user ON oracle_imports(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_oracle_imports_oracle_id ON oracle_imports(oracle_id);
CREATE INDEX IF NOT EXISTS idx_oracle_imports_status ON oracle_imports(import_status);
CREATE INDEX IF NOT EXISTS idx_oracle_imports_created_at ON oracle_imports(created_at);

-- 8. Brouillons pour édition collaborative
CREATE TABLE IF NOT EXISTS oracle_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  oracle_id UUID REFERENCES oracles(id) ON DELETE CASCADE,
  admin_user_id INTEGER NOT NULL REFERENCES utilisateurs(id),
  draft_name VARCHAR(255),
  oracle_data JSONB NOT NULL,
  items_data JSONB NOT NULL,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  published_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_oracle_drafts_oracle_id ON oracle_drafts(oracle_id);
CREATE INDEX IF NOT EXISTS idx_oracle_drafts_admin_user ON oracle_drafts(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_oracle_drafts_published ON oracle_drafts(is_published);

-- 9. Trigger pour recalcul automatique du poids total
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

-- 10. Trigger pour mise à jour automatique de updated_at
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

DROP TRIGGER IF EXISTS trigger_oracle_drafts_updated_at ON oracle_drafts;
CREATE TRIGGER trigger_oracle_drafts_updated_at
  BEFORE UPDATE ON oracle_drafts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 11. Vue pour statistiques des oracles
CREATE OR REPLACE VIEW oracle_stats AS
SELECT 
  o.id,
  o.name,
  o.total_weight,
  COUNT(oi.id) as total_items,
  COUNT(CASE WHEN oi.is_active THEN 1 END) as active_items,
  COALESCE(draw_stats.total_draws, 0) as total_draws,
  COALESCE(draw_stats.unique_users, 0) as unique_users
FROM oracles o
LEFT JOIN oracle_items oi ON o.id = oi.oracle_id
LEFT JOIN (
  SELECT 
    oracle_id,
    COUNT(*) as total_draws,
    COUNT(DISTINCT user_id) as unique_users
  FROM oracle_draws 
  GROUP BY oracle_id
) draw_stats ON o.id = draw_stats.oracle_id
WHERE o.is_active = TRUE
GROUP BY o.id, o.name, o.total_weight, draw_stats.total_draws, draw_stats.unique_users;

-- 12. Données d'exemple pour tests
INSERT INTO oracles (id, name, description, premium_required, is_active, created_by) VALUES
('11111111-1111-1111-1111-111111111111', 'Armes médiévales', 'Collection d''armes pour jeux médiévaux fantastiques', FALSE, TRUE, 0),
('22222222-2222-2222-2222-222222222222', 'Sorts de magie', 'Grimoire de sorts variés (Premium)', TRUE, TRUE, 0),
('33333333-3333-3333-3333-333333333333', 'Événements aléatoires', 'Événements pour pimenter vos aventures', FALSE, TRUE, 0)
ON CONFLICT (id) DO NOTHING;

-- Items pour l'oracle "Armes médiévales"
INSERT INTO oracle_items (oracle_id, value, weight, metadata) VALUES
('11111111-1111-1111-1111-111111111111', 'Épée longue', 20, '{"damage": "1d8", "type": "arme", "rarity": "commune"}'),
('11111111-1111-1111-1111-111111111111', 'Dague', 30, '{"damage": "1d4", "type": "arme", "rarity": "commune"}'),
('11111111-1111-1111-1111-111111111111', 'Arc long', 25, '{"damage": "1d8", "type": "arme", "rarity": "commune"}'),
('11111111-1111-1111-1111-111111111111', 'Hache de guerre', 15, '{"damage": "1d10", "type": "arme", "rarity": "peu_commune"}'),
('11111111-1111-1111-1111-111111111111', 'Épée magique +1', 8, '{"damage": "1d8+1", "type": "arme", "rarity": "rare", "magical": true}'),
('11111111-1111-1111-1111-111111111111', 'Excalibur', 2, '{"damage": "2d8+3", "type": "arme", "rarity": "legendaire", "magical": true}');

-- Items pour l'oracle "Sorts de magie" (Premium)
INSERT INTO oracle_items (oracle_id, value, weight, metadata) VALUES
('22222222-2222-2222-2222-222222222222', 'Boule de feu', 25, '{"damage": "3d6", "type": "sort", "school": "evocation", "level": 3}'),
('22222222-2222-2222-2222-222222222222', 'Soins légers', 30, '{"healing": "1d8+1", "type": "sort", "school": "evocation", "level": 1}'),
('22222222-2222-2222-2222-222222222222', 'Invisibilité', 20, '{"duration": "1h", "type": "sort", "school": "illusion", "level": 2}'),
('22222222-2222-2222-2222-222222222222', 'Téléportation', 15, '{"range": "500ft", "type": "sort", "school": "conjuration", "level": 4}'),
('22222222-2222-2222-2222-222222222222', 'Arrêt du temps', 5, '{"duration": "1d4+1 tours", "type": "sort", "school": "transmutation", "level": 9}'),
('22222222-2222-2222-2222-222222222222', 'Résurrection', 3, '{"type": "sort", "school": "necromancy", "level": 7}'),
('22222222-2222-2222-2222-222222222222', 'Météore', 2, '{"damage": "20d6", "type": "sort", "school": "evocation", "level": 9}');

-- Items pour l'oracle "Événements aléatoires"
INSERT INTO oracle_items (oracle_id, value, weight, metadata) VALUES
('33333333-3333-3333-3333-333333333333', 'Une caravane de marchands approche', 25, '{"type": "encounter", "mood": "neutral"}'),
('33333333-3333-3333-3333-333333333333', 'Des bandits attaquent !', 20, '{"type": "encounter", "mood": "hostile"}'),
('33333333-3333-3333-3333-333333333333', 'Vous trouvez un coffre au trésor', 15, '{"type": "treasure", "mood": "positive"}'),
('33333333-3333-3333-3333-333333333333', 'Un orage violent éclate', 20, '{"type": "weather", "mood": "negative"}'),
('33333333-3333-3333-3333-333333333333', 'Un sage offre ses conseils', 10, '{"type": "encounter", "mood": "positive"}'),
('33333333-3333-3333-3333-333333333333', 'Votre monture tombe malade', 8, '{"type": "complication", "mood": "negative"}'),
('33333333-3333-3333-3333-333333333333', 'Vous découvrez des ruines antiques', 2, '{"type": "discovery", "mood": "mysterious"}');

-- Mise à jour finale des poids totaux
UPDATE oracles SET total_weight = (
  SELECT COALESCE(SUM(weight), 0) 
  FROM oracle_items 
  WHERE oracle_id = oracles.id AND is_active = TRUE
);