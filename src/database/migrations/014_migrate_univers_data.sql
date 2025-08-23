-- Migration 014: Migrer les données existantes vers la structure univers
-- Date: 2025-08-23
-- Description: Migre les données existantes basées sur game_system/systeme_jeu vers univers_jeu

-- Migrer les données des oracles basées sur game_system
UPDATE oracles 
SET univers_jeu = 
  CASE 
    WHEN game_system = 'monsterhearts' THEN 'monsterhearts'
    WHEN game_system = 'roue_du_temps' THEN 'roue_du_temps'
    WHEN game_system = 'metro2033' THEN 'metro2033'
    WHEN game_system = 'engrenages' THEN 'roue_du_temps' -- Par défaut pour engrenages
    WHEN game_system = 'mistengine' THEN 'obojima' -- Par défaut pour mistengine
    WHEN game_system = 'zombiology' THEN 'zombiology'
    WHEN game_system = 'pbta' THEN 'monsterhearts' -- Par défaut pour pbta
    WHEN game_system = 'myz' THEN 'metro2033' -- Par défaut pour myz
    ELSE game_system -- Conserver la valeur existante si non mappée
  END
WHERE game_system IS NOT NULL AND univers_jeu IS NULL;

-- Cas spécifiques pour les oracles Monsterhearts identifiés par leur nom
UPDATE oracles 
SET univers_jeu = 'monsterhearts'
WHERE name IN (
    'Révélations - Monsterhearts',
    'Relations Intimes - Monsterhearts',
    'Monstruosités Cachées - Monsterhearts',
    'Événements Dramatiques - Monsterhearts'
) AND univers_jeu IS NULL;

-- Cas spécifiques pour les oracles La Roue du Temps (si identifiables par nom)
UPDATE oracles 
SET univers_jeu = 'roue_du_temps'
WHERE (name LIKE '%Roue du Temps%' OR name LIKE '%Wheel of Time%')
AND univers_jeu IS NULL;

-- Cas spécifiques pour les oracles Metro 2033 (si identifiables par nom)
UPDATE oracles 
SET univers_jeu = 'metro2033'
WHERE (name LIKE '%Metro%' OR name LIKE '%2033%')
AND univers_jeu IS NULL;

-- Migrer les données des documents basées sur systeme_jeu
UPDATE documents 
SET univers_jeu = 
  CASE 
    WHEN systeme_jeu = 'monsterhearts' THEN 'monsterhearts'
    WHEN systeme_jeu = 'roue_du_temps' THEN 'roue_du_temps'
    WHEN systeme_jeu = 'metro2033' THEN 'metro2033'
    WHEN systeme_jeu = 'engrenages' THEN 'roue_du_temps'
    WHEN systeme_jeu = 'mistengine' THEN 'obojima'
    WHEN systeme_jeu = 'zombiology' THEN 'zombiology'
    WHEN systeme_jeu = 'pbta' THEN 'monsterhearts'
    WHEN systeme_jeu = 'myz' THEN 'metro2033'
    ELSE systeme_jeu
  END
WHERE systeme_jeu IS NOT NULL AND univers_jeu IS NULL;

-- Migrer les données des personnages si la table existe
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'personnages') THEN
        UPDATE personnages 
        SET univers_jeu = 
          CASE 
            WHEN systeme_jeu = 'monsterhearts' THEN 'monsterhearts'
            WHEN systeme_jeu = 'roue_du_temps' THEN 'roue_du_temps'
            WHEN systeme_jeu = 'metro2033' THEN 'metro2033'
            WHEN systeme_jeu = 'engrenages' THEN 'roue_du_temps'
            WHEN systeme_jeu = 'mistengine' THEN 'obojima'
            WHEN systeme_jeu = 'zombiology' THEN 'zombiology'
            WHEN systeme_jeu = 'pbta' THEN 'monsterhearts'
            WHEN systeme_jeu = 'myz' THEN 'metro2033'
            ELSE systeme_jeu
          END
        WHERE systeme_jeu IS NOT NULL AND univers_jeu IS NULL;
    END IF;
END $$;

-- Migrer les données des PDFs si la table existe
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pdfs') THEN
        UPDATE pdfs 
        SET univers_jeu = 
          CASE 
            WHEN systeme_jeu = 'monsterhearts' THEN 'monsterhearts'
            WHEN systeme_jeu = 'roue_du_temps' THEN 'roue_du_temps'
            WHEN systeme_jeu = 'metro2033' THEN 'metro2033'
            WHEN systeme_jeu = 'engrenages' THEN 'roue_du_temps'
            WHEN systeme_jeu = 'mistengine' THEN 'obojima'
            WHEN systeme_jeu = 'zombiology' THEN 'zombiology'
            WHEN systeme_jeu = 'pbta' THEN 'monsterhearts'
            WHEN systeme_jeu = 'myz' THEN 'metro2033'
            ELSE systeme_jeu
          END
        WHERE systeme_jeu IS NOT NULL AND univers_jeu IS NULL;
    END IF;
END $$;

-- Migrer les configurations de types de documents depuis document_systeme_jeu
-- Copier les configurations Monsterhearts
INSERT INTO document_univers_jeu (document_type, univers_jeu, actif, ordre_affichage, configuration)
SELECT 
    document_type,
    'monsterhearts' as univers_jeu,
    actif,
    ordre_affichage,
    configuration
FROM document_systeme_jeu
WHERE systeme_jeu = 'monsterhearts'
ON CONFLICT (document_type, univers_jeu) DO NOTHING;

-- Copier les configurations pour les autres systèmes vers leurs univers par défaut
INSERT INTO document_univers_jeu (document_type, univers_jeu, actif, ordre_affichage, configuration)
SELECT 
    document_type,
    CASE 
        WHEN systeme_jeu = 'pbta' THEN 'monsterhearts'
        WHEN systeme_jeu = 'engrenages' THEN 'roue_du_temps'
        WHEN systeme_jeu = 'mistengine' THEN 'obojima'
        WHEN systeme_jeu = 'myz' THEN 'metro2033'
        WHEN systeme_jeu = 'zombiology' THEN 'zombiology'
        ELSE systeme_jeu
    END as univers_jeu,
    actif,
    ordre_affichage,
    configuration
FROM document_systeme_jeu
WHERE systeme_jeu != 'monsterhearts' -- Déjà traité
ON CONFLICT (document_type, univers_jeu) DO NOTHING;

-- Rapport de migration
DO $$
DECLARE
    oracle_count INTEGER;
    doc_count INTEGER;
    perso_count INTEGER := 0;
    pdf_count INTEGER := 0;
BEGIN
    SELECT COUNT(*) INTO oracle_count FROM oracles WHERE univers_jeu IS NOT NULL;
    SELECT COUNT(*) INTO doc_count FROM documents WHERE univers_jeu IS NOT NULL;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'personnages') THEN
        SELECT COUNT(*) INTO perso_count FROM personnages WHERE univers_jeu IS NOT NULL;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pdfs') THEN
        SELECT COUNT(*) INTO pdf_count FROM pdfs WHERE univers_jeu IS NOT NULL;
    END IF;
    
    RAISE NOTICE 'Migration terminée - Oracles: %, Documents: %, Personnages: %, PDFs: %', 
                 oracle_count, doc_count, perso_count, pdf_count;
END $$;