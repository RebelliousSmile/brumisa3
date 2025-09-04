-- Migration simple pour ajouter les colonnes manquantes

-- Ajouter les colonnes manquantes à la table systemes_jeu
ALTER TABLE systemes_jeu ADD COLUMN IF NOT EXISTS actif BOOLEAN DEFAULT TRUE;
ALTER TABLE systemes_jeu ADD COLUMN IF NOT EXISTS ordre_affichage INTEGER DEFAULT 0;
ALTER TABLE systemes_jeu ADD COLUMN IF NOT EXISTS couleur_primaire VARCHAR;
ALTER TABLE systemes_jeu ADD COLUMN IF NOT EXISTS couleur_secondaire VARCHAR;
ALTER TABLE systemes_jeu ADD COLUMN IF NOT EXISTS pictogramme VARCHAR;

-- Ajouter les colonnes manquantes à la table documents
ALTER TABLE documents ADD COLUMN IF NOT EXISTS nombre_vues INTEGER DEFAULT 0;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS nombre_utilisations INTEGER DEFAULT 0;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS contenu JSONB DEFAULT '{}';

-- Ajouter la colonne password_hash si elle n'existe pas
ALTER TABLE utilisateurs ADD COLUMN IF NOT EXISTS password_hash VARCHAR;
ALTER TABLE utilisateurs ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Mettre à jour les valeurs NULL pour les utilisateurs existants
UPDATE utilisateurs SET email = 'unknown@example.com' WHERE email IS NULL;
UPDATE utilisateurs SET password_hash = 'temp_hash' WHERE password_hash IS NULL;