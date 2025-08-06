-- Migration 009 (version corrigée): Support complet des fonctionnalités (100%)

-- 1. Système d'oracles personnalisés (premium) - PARTIE 1: Tables principales
CREATE TABLE IF NOT EXISTS oracles_personnalises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    utilisateur_id INTEGER NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
    nom VARCHAR(255) NOT NULL,
    description TEXT,
    donnees_oracle JSONB NOT NULL,
    statut VARCHAR(20) NOT NULL DEFAULT 'PRIVE' CHECK (statut IN ('PRIVE', 'PARTAGE', 'PUBLIC')),
    systeme_jeu VARCHAR(50),
    base_sur_oracle_id UUID REFERENCES oracles(id),
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Extensions utilisateurs pour emails et RGPD
ALTER TABLE utilisateurs ADD COLUMN IF NOT EXISTS email_precedent VARCHAR(255);
ALTER TABLE utilisateurs ADD COLUMN IF NOT EXISTS token_changement_email VARCHAR(255);
ALTER TABLE utilisateurs ADD COLUMN IF NOT EXISTS date_demande_changement_email TIMESTAMP;
ALTER TABLE utilisateurs ADD COLUMN IF NOT EXISTS historique_emails JSONB DEFAULT '[]';

-- 3. Conformité RGPD
CREATE TABLE IF NOT EXISTS rgpd_consentements (
    id SERIAL PRIMARY KEY,
    utilisateur_id INTEGER NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
    type_consentement VARCHAR(50) NOT NULL,
    consentement_donne BOOLEAN NOT NULL,
    date_consentement TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_adresse INET,
    user_agent TEXT
);

-- 4. Extensions PDFs premium
ALTER TABLE pdfs ADD COLUMN IF NOT EXISTS template_premium VARCHAR(100);
ALTER TABLE pdfs ADD COLUMN IF NOT EXISTS personnalisation JSONB DEFAULT '{}';
ALTER TABLE pdfs ADD COLUMN IF NOT EXISTS date_expiration_partage TIMESTAMP;

-- 5. Gestion changements email
CREATE TABLE IF NOT EXISTS demandes_changement_email (
    id SERIAL PRIMARY KEY,
    utilisateur_id INTEGER NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
    ancien_email VARCHAR(255) NOT NULL,
    nouvel_email VARCHAR(255) NOT NULL,
    token_validation VARCHAR(255) NOT NULL UNIQUE,
    statut VARCHAR(20) NOT NULL DEFAULT 'EN_ATTENTE' CHECK (statut IN ('EN_ATTENTE', 'VALIDE', 'EXPIRE', 'ANNULE')),
    date_demande TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_expiration TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '15 days'),
    date_validation TIMESTAMP,
    ip_demande INET
);

-- Index de base
CREATE INDEX IF NOT EXISTS idx_oracles_personnalises_utilisateur ON oracles_personnalises(utilisateur_id);
CREATE INDEX IF NOT EXISTS idx_oracles_personnalises_statut ON oracles_personnalises(statut);
CREATE INDEX IF NOT EXISTS idx_rgpd_utilisateur ON rgpd_consentements(utilisateur_id);
CREATE INDEX IF NOT EXISTS idx_demandes_email_token ON demandes_changement_email(token_validation);