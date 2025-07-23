-- Migration 000: Ajout des champs d'authentification manquants
-- Date: 2025-07-23
-- Description: Ajoute les colonnes nécessaires pour l'authentification par mot de passe

-- 1. Ajout des colonnes d'authentification à la table utilisateurs
ALTER TABLE utilisateurs ADD COLUMN IF NOT EXISTS mot_de_passe VARCHAR(255);
ALTER TABLE utilisateurs ADD COLUMN IF NOT EXISTS token_recuperation VARCHAR(255);
ALTER TABLE utilisateurs ADD COLUMN IF NOT EXISTS token_expiration TIMESTAMP;
ALTER TABLE utilisateurs ADD COLUMN IF NOT EXISTS type_compte VARCHAR(20) DEFAULT 'STANDARD' CHECK (type_compte IN ('STANDARD', 'PREMIUM', 'ADMIN'));
ALTER TABLE utilisateurs ADD COLUMN IF NOT EXISTS est_anonyme BOOLEAN DEFAULT FALSE;

-- 2. Ajout d'index pour optimiser les requêtes d'authentification
CREATE INDEX IF NOT EXISTS idx_utilisateurs_token_recuperation ON utilisateurs(token_recuperation);
CREATE INDEX IF NOT EXISTS idx_utilisateurs_type_compte ON utilisateurs(type_compte);
CREATE INDEX IF NOT EXISTS idx_utilisateurs_anonyme ON utilisateurs(est_anonyme);

-- 3. Les utilisateurs existants auront la valeur par défaut 'STANDARD'
-- Pas besoin d'UPDATE car la colonne a une valeur par défaut