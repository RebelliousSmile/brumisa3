-- Migration 012: Créer la structure des univers de jeu
-- Date: 2025-08-23
-- Description: Ajoute la table univers_jeu et les relations nécessaires

-- Créer la table univers_jeu
CREATE TABLE IF NOT EXISTS univers_jeu (
    -- Clé primaire
    id VARCHAR(50) PRIMARY KEY,
    
    -- Informations de base
    nom_complet VARCHAR(255) NOT NULL,
    description TEXT,
    editeur VARCHAR(255),
    annee_sortie INTEGER,
    site_officiel VARCHAR(500),
    
    -- Relations
    systeme_jeu VARCHAR(50) NOT NULL,
    
    -- Configuration
    configuration JSONB DEFAULT '{}',
    structure_donnees JSONB DEFAULT '{}',
    
    -- Statut et maintenance
    statut VARCHAR(20) NOT NULL DEFAULT 'ACTIF' 
        CHECK (statut IN ('ACTIF', 'MAINTENANCE', 'BETA', 'ARCHIVE')),
    message_maintenance TEXT,
    
    -- Présentation
    ordre_affichage INTEGER DEFAULT 0,
    couleur_theme VARCHAR(7) DEFAULT '#333333',
    couleur_accent VARCHAR(7),
    icone VARCHAR(100),
    image_hero VARCHAR(500),
    tags TEXT[],
    
    -- Métadonnées
    version_supportee VARCHAR(50),
    langue_principale VARCHAR(2) DEFAULT 'fr',
    langues_disponibles TEXT[],
    
    -- Timestamps
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_derniere_maj_structure TIMESTAMP,
    
    -- Contraintes
    CONSTRAINT fk_univers_systeme 
        FOREIGN KEY (systeme_jeu) 
        REFERENCES systemes_jeu(id) 
        ON DELETE RESTRICT
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_univers_systeme ON univers_jeu(systeme_jeu);
CREATE INDEX IF NOT EXISTS idx_univers_statut ON univers_jeu(statut);
CREATE INDEX IF NOT EXISTS idx_univers_ordre ON univers_jeu(ordre_affichage);
CREATE INDEX IF NOT EXISTS idx_univers_tags ON univers_jeu USING GIN(tags);

-- Insérer les données initiales des univers
INSERT INTO univers_jeu (id, nom_complet, description, editeur, annee_sortie, site_officiel, systeme_jeu, couleur_theme, couleur_accent, icone, ordre_affichage, tags, configuration)
VALUES
    -- PBTA
    ('monsterhearts', 'Monsterhearts 2', 'Jeu de rôle sur les adolescents monstres, explorant les thèmes de l''adolescence et de l''identité', 
     'Buried Without Ceremony', 2017, 'https://buriedwithoutceremony.com/monsterhearts', 'pbta', 
     '#8B0000', '#DC143C', 'fa-heart-broken', 1, 
     ARRAY['horror', 'teen', 'romance', 'drama'],
     '{"features": {"has_magic": true, "has_supernatural": true, "has_factions": true}, "gameplay": {"tone": ["dark", "romantic", "horror"]}}'::jsonb),
    
    ('urban_shadows', 'Urban Shadows', 'Politique urbaine et surnaturel dans les villes modernes',
     'Magpie Games', 2018, NULL, 'pbta',
     '#2F4F4F', '#708090', 'fa-city', 2,
     ARRAY['urban', 'politics', 'supernatural'], '{}'::jsonb),
    
    -- Engrenages
    ('roue_du_temps', 'La Roue du Temps', 'Adaptation du monde de Robert Jordan',
     'Black Book Editions', 2020, NULL, 'engrenages',
     '#8B4513', '#D2691E', 'fa-dharmachakra', 3,
     ARRAY['fantasy', 'epic', 'magic'], '{}'::jsonb),
    
    ('ecryme', 'Ecryme 1880', 'Steampunk victorien dans une Londres alternative',
     'Sans-Détour', 2019, NULL, 'engrenages',
     '#4B0082', '#6A5ACD', 'fa-cogs', 4,
     ARRAY['steampunk', 'victorian', 'mystery'], '{}'::jsonb),
    
    -- Mist Engine
    ('obojima', 'Obojima', 'Japon féodal fantastique',
     'Korentin Games', 2021, NULL, 'mistengine',
     '#DC143C', '#FF69B4', 'fa-torii-gate', 5,
     ARRAY['japan', 'fantasy', 'samurai'], '{}'::jsonb),
    
    ('zamanora', 'Zamanora', 'Fantasy onirique et mystique',
     'Korentin Games', 2022, NULL, 'mistengine',
     '#663399', '#9370DB', 'fa-moon', 6,
     ARRAY['dream', 'mystic', 'fantasy'], '{}'::jsonb),
    
    ('post_mortem', 'Post-Mortem', 'Enquêtes surnaturelles après la mort',
     'Korentin Games', 2023, NULL, 'mistengine',
     '#191970', '#4169E1', 'fa-skull', 7,
     ARRAY['afterlife', 'mystery', 'supernatural'], '{}'::jsonb),
    
    ('otherscape', 'Tokyo:Otherscape', 'Tokyo moderne avec créatures surnaturelles',
     'Korentin Games', 2023, NULL, 'mistengine',
     '#FF1493', '#FF69B4', 'fa-torii-gate', 8,
     ARRAY['modern', 'tokyo', 'yokai'], '{}'::jsonb),
    
    -- MYZ
    ('metro2033', 'Metro 2033', 'Survie dans le métro de Moscou post-apocalyptique',
     'Modiphius', 2021, NULL, 'myz',
     '#2F4F4F', '#696969', 'fa-radiation', 9,
     ARRAY['post-apocalyptic', 'survival', 'russia'], '{}'::jsonb),
    
    -- Zombiology
    ('zombiology', 'Zombiology', 'Survival horror contre les zombies',
     'Indie', 2020, NULL, 'zombiology',
     '#8B0000', '#B22222', 'fa-biohazard', 10,
     ARRAY['zombie', 'survival', 'horror'], '{}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Créer la table de jonction document_univers_jeu
CREATE TABLE IF NOT EXISTS document_univers_jeu (
    document_type VARCHAR(50) NOT NULL,
    univers_jeu VARCHAR(50) NOT NULL,
    actif BOOLEAN DEFAULT true,
    ordre_affichage INTEGER DEFAULT 0,
    configuration JSONB DEFAULT '{}',
    date_ajout TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (document_type, univers_jeu),
    CONSTRAINT fk_doc_univers_univers 
        FOREIGN KEY (univers_jeu) 
        REFERENCES univers_jeu(id) 
        ON DELETE CASCADE,
    CONSTRAINT chk_doc_type_univers 
        CHECK (document_type IN ('CHARACTER', 'TOWN', 'GROUP', 
                                'ORGANIZATION', 'DANGER', 'GENERIQUE'))
);