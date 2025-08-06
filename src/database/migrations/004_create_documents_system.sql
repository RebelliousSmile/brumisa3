-- Migration 004: Création du système de documents
-- Implémente l'architecture Document vs Personnage selon spécifications

-- Table principale des documents JDR
CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    type VARCHAR(20) NOT NULL CHECK (type IN ('GENERIQUE', 'CHARACTER', 'TOWN', 'GROUP', 'ORGANIZATION', 'DANGER')),
    titre VARCHAR(255) NOT NULL,
    systeme_jeu VARCHAR(50) NOT NULL CHECK (systeme_jeu IN ('monsterhearts', 'engrenages', 'metro2033', 'mistengine', 'zombiology')),
    
    -- Relations
    utilisateur_id INTEGER NULL, -- NULL pour utilisateurs anonymes (guests)
    personnage_id INTEGER NULL, -- NULL si document indépendant
    
    -- Contenu du document
    donnees JSONB NOT NULL DEFAULT '{}', -- Données dynamiques selon type et système
    notes_creation TEXT,
    contexte_utilisation TEXT,
    
    -- Statut et visibilité
    statut VARCHAR(20) NOT NULL DEFAULT 'ACTIF' CHECK (statut IN ('BROUILLON', 'ACTIF', 'ARCHIVE', 'SUPPRIME')),
    visibilite VARCHAR(20) NOT NULL DEFAULT 'PRIVE' CHECK (visibilite IN ('PRIVE', 'PUBLIC')),
    visible_admin_only BOOLEAN NOT NULL DEFAULT FALSE, -- Pour documents créés par guests
    
    -- Métadonnées
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE SET NULL,
    FOREIGN KEY (personnage_id) REFERENCES personnages(id) ON DELETE SET NULL
);

-- Table de configuration des types de documents par système JDR
CREATE TABLE IF NOT EXISTS document_systeme_jeu (
    document_type VARCHAR(20) NOT NULL CHECK (document_type IN ('GENERIQUE', 'CHARACTER', 'TOWN', 'GROUP', 'ORGANIZATION', 'DANGER')),
    systeme_jeu VARCHAR(50) NOT NULL CHECK (systeme_jeu IN ('monsterhearts', 'engrenages', 'metro2033', 'mistengine', 'zombiology')),
    
    -- Configuration
    actif BOOLEAN NOT NULL DEFAULT TRUE,
    ordre_affichage INTEGER,
    configuration JSONB DEFAULT '{}', -- Configuration spécifique (champs requis, template, etc.)
    
    -- Métadonnées
    date_ajout TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (document_type, systeme_jeu)
);

-- Table des témoignages utilisateurs
CREATE TABLE IF NOT EXISTS temoignages (
    id SERIAL PRIMARY KEY,
    
    -- Informations auteur
    auteur_nom VARCHAR(255) NOT NULL,
    auteur_email VARCHAR(255) NOT NULL,
    lien_contact VARCHAR(500), -- URL optionnelle vers profil/site
    
    -- Contenu du témoignage
    contenu TEXT NOT NULL CHECK (LENGTH(contenu) BETWEEN 50 AND 1000),
    note INTEGER NOT NULL CHECK (note >= 1 AND note <= 5),
    systeme_jeu VARCHAR(50) NOT NULL CHECK (systeme_jeu IN ('monsterhearts', 'engrenages', 'metro2033', 'mistengine', 'zombiology')),
    
    -- Modération
    statut VARCHAR(20) NOT NULL DEFAULT 'EN_ATTENTE' CHECK (statut IN ('EN_ATTENTE', 'APPROUVE', 'REJETE', 'MASQUE')),
    date_moderation TIMESTAMP,
    moderateur_id INTEGER,
    motif_rejet TEXT,
    
    -- Anti-spam
    ip_adresse INET,
    user_agent TEXT,
    
    -- Métadonnées
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (moderateur_id) REFERENCES utilisateurs(id) ON DELETE SET NULL
);

-- Table des abonnés newsletter
CREATE TABLE IF NOT EXISTS newsletter_abonnes (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    nom VARCHAR(255),
    
    -- Préférences
    preferences JSONB DEFAULT '{}', -- Préférences par système JDR
    
    -- Statut
    statut VARCHAR(20) NOT NULL DEFAULT 'EN_ATTENTE' CHECK (statut IN ('EN_ATTENTE', 'CONFIRME', 'DESABONNE', 'BOUNCE')),
    
    -- Double opt-in
    token_confirmation VARCHAR(255),
    date_confirmation TIMESTAMP,
    
    -- Métadonnées
    source VARCHAR(100), -- Provenance de l'inscription
    derniere_communication TIMESTAMP,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des actualités/newsletter
CREATE TABLE IF NOT EXISTS actualites (
    id SERIAL PRIMARY KEY,
    titre VARCHAR(255) NOT NULL,
    resume TEXT, -- Court descriptif
    contenu_html TEXT NOT NULL,
    
    -- Auteur et ciblage
    auteur_id INTEGER NOT NULL,
    systemes_concernes JSONB DEFAULT '[]', -- Array des systèmes JDR concernés
    
    -- Type et statut
    type VARCHAR(20) NOT NULL DEFAULT 'NOUVEAUTE' CHECK (type IN ('NOUVEAUTE', 'MISE_A_JOUR', 'EVENEMENT', 'ANNONCE')),
    statut VARCHAR(20) NOT NULL DEFAULT 'BROUILLON' CHECK (statut IN ('BROUILLON', 'PLANIFIE', 'PUBLIE', 'ARCHIVE')),
    
    -- Dates
    date_publication TIMESTAMP,
    date_envoi TIMESTAMP, -- Date d'envoi newsletter
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (auteur_id) REFERENCES utilisateurs(id) ON DELETE RESTRICT
);

-- Index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_documents_utilisateur ON documents(utilisateur_id);
CREATE INDEX IF NOT EXISTS idx_documents_personnage ON documents(personnage_id);
CREATE INDEX IF NOT EXISTS idx_documents_type_systeme ON documents(type, systeme_jeu);
CREATE INDEX IF NOT EXISTS idx_documents_visibilite ON documents(visibilite, visible_admin_only);
CREATE INDEX IF NOT EXISTS idx_documents_statut ON documents(statut);
CREATE INDEX IF NOT EXISTS idx_documents_date_creation ON documents(date_creation);

CREATE INDEX IF NOT EXISTS idx_temoignages_statut ON temoignages(statut);
CREATE INDEX IF NOT EXISTS idx_temoignages_systeme ON temoignages(systeme_jeu);
CREATE INDEX IF NOT EXISTS idx_temoignages_date ON temoignages(date_creation);
CREATE INDEX IF NOT EXISTS idx_temoignages_moderation ON temoignages(date_moderation);

CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_abonnes(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_statut ON newsletter_abonnes(statut);

CREATE INDEX IF NOT EXISTS idx_actualites_statut ON actualites(statut);
CREATE INDEX IF NOT EXISTS idx_actualites_date_publication ON actualites(date_publication);
CREATE INDEX IF NOT EXISTS idx_actualites_auteur ON actualites(auteur_id);