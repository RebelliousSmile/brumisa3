-- Migration 010 (corrigée): Table des systèmes JDR et maintenance

-- Table principale des systèmes de jeu
CREATE TABLE IF NOT EXISTS systemes_jeu (
    id VARCHAR(50) PRIMARY KEY,
    nom_complet VARCHAR(255) NOT NULL,
    description TEXT,
    site_officiel VARCHAR(500),
    version_supportee VARCHAR(50),
    structure_donnees JSONB DEFAULT '{}',
    statut VARCHAR(20) NOT NULL DEFAULT 'ACTIF' CHECK (statut IN ('ACTIF', 'MAINTENANCE', 'DEPRECIE', 'BETA')),
    message_maintenance TEXT,
    ordre_affichage INTEGER DEFAULT 0,
    couleur_theme VARCHAR(7) DEFAULT '#333333',
    icone VARCHAR(100),
    date_ajout TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_derniere_maj_structure TIMESTAMP
);

-- Données initiales (version sécurisée)
INSERT INTO systemes_jeu (id, nom_complet, description, statut, ordre_affichage, couleur_theme) 
SELECT 'monsterhearts', 'Monsterhearts 2', 'Jeu de rôle sur les adolescents monstres', 'ACTIF', 1, '#8B0000'
WHERE NOT EXISTS (SELECT 1 FROM systemes_jeu WHERE id = 'monsterhearts');

INSERT INTO systemes_jeu (id, nom_complet, description, statut, ordre_affichage, couleur_theme) 
SELECT 'engrenages', 'Engrenages et Sortilèges', 'Jeu de rôle steampunk fantasy', 'ACTIF', 2, '#8B4513'
WHERE NOT EXISTS (SELECT 1 FROM systemes_jeu WHERE id = 'engrenages');

INSERT INTO systemes_jeu (id, nom_complet, description, statut, ordre_affichage, couleur_theme) 
SELECT 'metro2033', 'Métro 2033', 'Jeu de rôle post-apocalyptique', 'ACTIF', 3, '#4F4F4F'
WHERE NOT EXISTS (SELECT 1 FROM systemes_jeu WHERE id = 'metro2033');

INSERT INTO systemes_jeu (id, nom_complet, description, statut, ordre_affichage, couleur_theme) 
SELECT 'mistengine', 'Mist Engine', 'Système générique narratif', 'ACTIF', 4, '#2F4F4F'
WHERE NOT EXISTS (SELECT 1 FROM systemes_jeu WHERE id = 'mistengine');

INSERT INTO systemes_jeu (id, nom_complet, description, statut, ordre_affichage, couleur_theme) 
SELECT 'zombiology', 'Zombiology', 'Jeu de rôle de survie zombie', 'ACTIF', 5, '#8B008B'
WHERE NOT EXISTS (SELECT 1 FROM systemes_jeu WHERE id = 'zombiology');

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_systemes_jeu_statut ON systemes_jeu(statut);
CREATE INDEX IF NOT EXISTS idx_systemes_jeu_ordre ON systemes_jeu(ordre_affichage);