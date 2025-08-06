-- Migration 009: Compléter le support de fonctionnalités pour atteindre 100%
-- Cette migration ajoute les éléments manquants identifiés dans l'analyse des 4% restants

-- 1. ORACLE SYSTEM PREMIUM FEATURES (1.5%)
-- Table pour les oracles personnalisés
CREATE TABLE IF NOT EXISTS oracles_personnalises (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    description TEXT,
    systeme_jeu VARCHAR(50),
    utilisateur_id INTEGER NOT NULL REFERENCES utilisateurs(id),
    oracle_parent_id INTEGER, -- Référence vers oracle original (sera ajouté la FK après création de la table)
    donnees JSONB NOT NULL, -- Structure oracle + éléments
    statut VARCHAR(20) NOT NULL DEFAULT 'PRIVE' CHECK (statut IN ('PRIVE', 'PUBLIC')),
    nombre_utilisations INTEGER DEFAULT 0,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table pour les votes sur oracles personnalisés
CREATE TABLE IF NOT EXISTS oracle_votes (
    id SERIAL PRIMARY KEY,
    oracle_id INTEGER NOT NULL REFERENCES oracles_personnalises(id) ON DELETE CASCADE,
    utilisateur_id INTEGER NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
    qualite_generale INTEGER NOT NULL CHECK (qualite_generale >= 1 AND qualite_generale <= 5),
    utilite_pratique INTEGER NOT NULL CHECK (utilite_pratique >= 1 AND utilite_pratique <= 5),
    respect_gamme INTEGER NOT NULL CHECK (respect_gamme >= 1 AND respect_gamme <= 5),
    commentaire TEXT,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(oracle_id, utilisateur_id)
);

-- Ajouter FK après création des tables
ALTER TABLE oracles_personnalises 
ADD CONSTRAINT fk_oracle_parent 
FOREIGN KEY (oracle_parent_id) REFERENCES oracles_personnalises(id) ON DELETE SET NULL;

-- Table pour les propositions d'options sur oracles (référence les oracles officiels)
CREATE TABLE IF NOT EXISTS oracle_propositions (
    id SERIAL PRIMARY KEY,
    oracle_id INTEGER NOT NULL, -- Référence vers oracle officiel
    utilisateur_id INTEGER NOT NULL REFERENCES utilisateurs(id),
    option_proposee JSONB NOT NULL,
    statut VARCHAR(20) NOT NULL DEFAULT 'EN_ATTENTE' CHECK (statut IN ('EN_ATTENTE', 'ACCEPTEE', 'REJETEE')),
    motif_rejet TEXT,
    date_proposition TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_traitement TIMESTAMP
);

-- 2. EMAIL MANAGEMENT SYSTEM (1.0%)
-- Champs pour la gestion avancée des emails
ALTER TABLE utilisateurs ADD COLUMN IF NOT EXISTS email_precedent VARCHAR(255);
ALTER TABLE utilisateurs ADD COLUMN IF NOT EXISTS email_validation_token VARCHAR(255);
ALTER TABLE utilisateurs ADD COLUMN IF NOT EXISTS email_changement_expire_le TIMESTAMP;
ALTER TABLE utilisateurs ADD COLUMN IF NOT EXISTS derniere_modification_email TIMESTAMP;

-- Table pour l'historique des changements d'email
CREATE TABLE IF NOT EXISTS utilisateur_email_historique (
    id SERIAL PRIMARY KEY,
    utilisateur_id INTEGER NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
    ancien_email VARCHAR(255) NOT NULL,
    nouvel_email VARCHAR(255) NOT NULL,
    date_changement TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_changement INET,
    statut VARCHAR(20) NOT NULL DEFAULT 'VALIDE' CHECK (statut IN ('VALIDE', 'ANNULE'))
);

-- 3. ADVANCED PDF EXPORT OPTIONS (1.0%)
-- Champs pour les options d'export PDF premium
ALTER TABLE pdfs ADD COLUMN IF NOT EXISTS type_export VARCHAR(50) DEFAULT 'FICHE_COMPLETE' 
    CHECK (type_export IN ('FICHE_COMPLETE', 'FICHE_SIMPLE', 'RESUME', 'CARTE_REFERENCE', 'ORGANISATION_LIST', 'DOCUMENT_GENERIQUE'));
ALTER TABLE pdfs ADD COLUMN IF NOT EXISTS date_expiration TIMESTAMP;
ALTER TABLE pdfs ADD COLUMN IF NOT EXISTS nombre_telechargements INTEGER DEFAULT 0;

-- Table pour la configuration des templates PDF premium
CREATE TABLE IF NOT EXISTS pdf_templates_premium (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    systeme_jeu VARCHAR(50) NOT NULL,
    type_document VARCHAR(50) NOT NULL,
    configuration_template JSONB NOT NULL, -- Polices, couleurs, layout
    disponible_premium_seulement BOOLEAN NOT NULL DEFAULT TRUE,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. COMMUNITY CONTENT CASCADING (0.5%)
-- Table pour les cascades d'oracles
CREATE TABLE IF NOT EXISTS oracle_cascades (
    id SERIAL PRIMARY KEY,
    oracle_parent_id INTEGER NOT NULL REFERENCES oracles_personnalises(id),
    oracle_enfant_id INTEGER NOT NULL REFERENCES oracles_personnalises(id),
    parametre_liaison VARCHAR(100) NOT NULL, -- Paramètre qui filtre
    utilisateur_id INTEGER NOT NULL REFERENCES utilisateurs(id),
    ordre_execution INTEGER NOT NULL DEFAULT 1,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(oracle_parent_id, oracle_enfant_id, ordre_execution)
);

-- INDEX pour performance
CREATE INDEX IF NOT EXISTS idx_oracles_personnalises_utilisateur ON oracles_personnalises(utilisateur_id);
CREATE INDEX IF NOT EXISTS idx_oracles_personnalises_parent ON oracles_personnalises(oracle_parent_id);
CREATE INDEX IF NOT EXISTS idx_oracles_personnalises_statut ON oracles_personnalises(statut);
CREATE INDEX IF NOT EXISTS idx_oracle_votes_oracle ON oracle_votes(oracle_id);
CREATE INDEX IF NOT EXISTS idx_oracle_propositions_oracle ON oracle_propositions(oracle_id);
CREATE INDEX IF NOT EXISTS idx_oracle_propositions_statut ON oracle_propositions(statut);
CREATE INDEX IF NOT EXISTS idx_utilisateur_email_historique_user ON utilisateur_email_historique(utilisateur_id);
CREATE INDEX IF NOT EXISTS idx_pdf_templates_systeme ON pdf_templates_premium(systeme_jeu, type_document);
CREATE INDEX IF NOT EXISTS idx_oracle_cascades_parent ON oracle_cascades(oracle_parent_id);