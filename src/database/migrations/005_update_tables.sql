-- Migration 005 simplifiée : Mise à jour des tables existantes

-- Mise à jour de la table utilisateurs
ALTER TABLE utilisateurs ADD COLUMN IF NOT EXISTS avatar VARCHAR(500);
ALTER TABLE utilisateurs ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}';
ALTER TABLE utilisateurs ADD COLUMN IF NOT EXISTS statut VARCHAR(20) NOT NULL DEFAULT 'ACTIF';
ALTER TABLE utilisateurs ADD COLUMN IF NOT EXISTS type_premium VARCHAR(20) DEFAULT NULL;
ALTER TABLE utilisateurs ADD COLUMN IF NOT EXISTS premium_expire_le TIMESTAMP;
ALTER TABLE utilisateurs ADD COLUMN IF NOT EXISTS newsletter_abonne BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE utilisateurs ADD COLUMN IF NOT EXISTS communication_preferences JSONB DEFAULT '{}';
ALTER TABLE utilisateurs ADD COLUMN IF NOT EXISTS pseudo_public VARCHAR(255);

-- Mise à jour de la table personnages 
ALTER TABLE personnages ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]';
ALTER TABLE personnages ADD COLUMN IF NOT EXISTS derniere_utilisation TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE personnages ADD COLUMN IF NOT EXISTS nombre_modifications INTEGER DEFAULT 0;

-- Mise à jour de la table pdfs avec nouveaux champs
ALTER TABLE pdfs ADD COLUMN IF NOT EXISTS document_id INTEGER;
ALTER TABLE pdfs ADD COLUMN IF NOT EXISTS systeme_jeu VARCHAR(50);
ALTER TABLE pdfs ADD COLUMN IF NOT EXISTS statut_visibilite VARCHAR(20) NOT NULL DEFAULT 'PRIVE';
ALTER TABLE pdfs ADD COLUMN IF NOT EXISTS options_export JSONB DEFAULT '{}';
ALTER TABLE pdfs ADD COLUMN IF NOT EXISTS partage_token VARCHAR(255);
ALTER TABLE pdfs ADD COLUMN IF NOT EXISTS hash_fichier VARCHAR(64);

-- Mise à jour de la table sessions
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS donnees_supplementaires JSONB DEFAULT '{}';