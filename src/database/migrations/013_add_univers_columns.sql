-- Migration 013: Ajouter les colonnes univers_jeu aux tables existantes
-- Date: 2025-08-23
-- Description: Ajoute les colonnes univers_jeu aux tables documents, oracles, personnages et pdfs

-- Ajouter la colonne univers_jeu à la table documents
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS univers_jeu VARCHAR(50);

-- Ajouter la colonne univers_jeu à la table oracles
ALTER TABLE oracles 
ADD COLUMN IF NOT EXISTS univers_jeu VARCHAR(50);

-- Ajouter la colonne univers_jeu à la table personnages (si la table existe)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'personnages') THEN
        ALTER TABLE personnages 
        ADD COLUMN IF NOT EXISTS univers_jeu VARCHAR(50);
    END IF;
END $$;

-- Ajouter la colonne univers_jeu à la table pdfs (si la table existe)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pdfs') THEN
        ALTER TABLE pdfs 
        ADD COLUMN IF NOT EXISTS univers_jeu VARCHAR(50);
    END IF;
END $$;

-- Créer les index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_documents_univers ON documents(univers_jeu);
CREATE INDEX IF NOT EXISTS idx_oracles_univers ON oracles(univers_jeu);

-- Index conditionnels pour les tables qui peuvent ne pas exister
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'personnages') THEN
        CREATE INDEX IF NOT EXISTS idx_personnages_univers ON personnages(univers_jeu);
    END IF;
END $$;

DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pdfs') THEN
        CREATE INDEX IF NOT EXISTS idx_pdfs_univers ON pdfs(univers_jeu);
    END IF;
END $$;