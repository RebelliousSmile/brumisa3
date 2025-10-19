-- ============================================================================
-- Script de Nettoyage des Systemes Non-Mist
-- ============================================================================
-- Date: 2025-01-19
-- Auteur: Claude (Senior Technical Architect)
-- Contexte: TASK-020B - Nettoyage Base de Donnees
-- Base: jdrspace_pdf (PostgreSQL sur AlwaysData)
--
-- ATTENTION: Ce script est DESTRUCTIF et IRREVERSIBLE apres COMMIT.
-- Assurez-vous d'avoir un backup complet avant execution.
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- ETAPE 0: Verification Prealable
-- ----------------------------------------------------------------------------

-- Compter les enregistrements qui seront supprimes
SELECT 'AVANT SUPPRESSION - Verification' as etape;

SELECT 'systemes_jeu' as table_name, COUNT(*) as count
FROM systemes_jeu
WHERE id IN ('pbta', 'monsterhearts', 'engrenages', 'myz', 'metro2033', 'zombiology')

UNION ALL

SELECT 'univers_jeu', COUNT(*)
FROM univers_jeu
WHERE id IN ('monsterhearts', 'urban_shadows', 'ecryme', 'roue_du_temps', 'metro2033', 'zombiology')

UNION ALL

SELECT 'personnages', COUNT(*)
FROM personnages
WHERE univers_jeu IN ('monsterhearts', 'urban_shadows', 'ecryme', 'roue_du_temps', 'metro2033', 'zombiology')

UNION ALL

SELECT 'pdfs', COUNT(*)
FROM pdfs
WHERE univers_jeu IN ('monsterhearts', 'urban_shadows', 'ecryme', 'roue_du_temps', 'metro2033', 'zombiology')

UNION ALL

SELECT 'documents', COUNT(*)
FROM documents
WHERE univers_jeu IN ('monsterhearts', 'urban_shadows', 'ecryme', 'roue_du_temps', 'metro2033', 'zombiology')

UNION ALL

SELECT 'oracles', COUNT(*)
FROM oracles
WHERE univers_jeu IN ('monsterhearts', 'urban_shadows', 'ecryme', 'roue_du_temps', 'metro2033', 'zombiology');

-- ----------------------------------------------------------------------------
-- ETAPE 1: Suppression des Oracles (Table Terminale)
-- ----------------------------------------------------------------------------

-- Les oracles sont lies aux univers via FK onDelete: Restrict
-- Il faut les supprimer EN PREMIER pour eviter les erreurs FK

SELECT 'ETAPE 1: Suppression des oracles' as etape;

DELETE FROM oracles
WHERE univers_jeu IN (
  'monsterhearts',     -- PBTA
  'urban_shadows',     -- PBTA
  'ecryme',            -- Engrenages
  'roue_du_temps',     -- Engrenages
  'metro2033',         -- MYZ
  'zombiology'         -- Zombiology
);

-- Verification
SELECT 'Oracles restants apres suppression' as verification, COUNT(*) as count
FROM oracles;

-- ----------------------------------------------------------------------------
-- ETAPE 2: Suppression des Documents (Table Terminale)
-- ----------------------------------------------------------------------------

SELECT 'ETAPE 2: Suppression des documents' as etape;

DELETE FROM documents
WHERE univers_jeu IN (
  'monsterhearts',
  'urban_shadows',
  'ecryme',
  'roue_du_temps',
  'metro2033',
  'zombiology'
);

-- Verification
SELECT 'Documents restants apres suppression' as verification, COUNT(*) as count
FROM documents;

-- ----------------------------------------------------------------------------
-- ETAPE 3: Suppression des PDFs (Table Terminale)
-- ----------------------------------------------------------------------------

SELECT 'ETAPE 3: Suppression des PDFs' as etape;

DELETE FROM pdfs
WHERE univers_jeu IN (
  'monsterhearts',
  'urban_shadows',
  'ecryme',
  'roue_du_temps',
  'metro2033',
  'zombiology'
);

-- Verification
SELECT 'PDFs restants apres suppression' as verification, COUNT(*) as count
FROM pdfs;

-- ----------------------------------------------------------------------------
-- ETAPE 4: Suppression des Personnages (Table Terminale)
-- ----------------------------------------------------------------------------

SELECT 'ETAPE 4: Suppression des personnages' as etape;

DELETE FROM personnages
WHERE univers_jeu IN (
  'monsterhearts',
  'urban_shadows',
  'ecryme',
  'roue_du_temps',
  'metro2033',
  'zombiology'
);

-- Verification
SELECT 'Personnages restants apres suppression' as verification, COUNT(*) as count
FROM personnages;

-- ----------------------------------------------------------------------------
-- ETAPE 5: Suppression des Univers (ORDRE IMPORTANT)
-- ----------------------------------------------------------------------------

SELECT 'ETAPE 5: Suppression des univers (doublons en premier)' as etape;

-- ETAPE 5.1: Supprimer les univers doublons EN PREMIER
-- (monsterhearts, metro2033, zombiology existent comme systeme ET univers)
DELETE FROM univers_jeu
WHERE id IN ('monsterhearts', 'metro2033', 'zombiology');

-- ETAPE 5.2: Supprimer les autres univers non-Mist
DELETE FROM univers_jeu
WHERE id IN ('urban_shadows', 'ecryme', 'roue_du_temps');

-- Verification
SELECT 'Univers restants apres suppression' as verification, id, nom_complet, systeme_jeu
FROM univers_jeu
ORDER BY systeme_jeu, id;

-- ----------------------------------------------------------------------------
-- ETAPE 6: Suppression des Systemes
-- ----------------------------------------------------------------------------

SELECT 'ETAPE 6: Suppression des systemes' as etape;

DELETE FROM systemes_jeu
WHERE id IN (
  'pbta',           -- PBTA (Powered by the Apocalypse)
  'monsterhearts',  -- Monsterhearts 2 (doublon)
  'engrenages',     -- Engrenages & Sortileges
  'myz',            -- Mutant Year Zero Engine
  'metro2033',      -- Metro 2033 (doublon)
  'zombiology'      -- Zombiology d100 System
);

-- Verification
SELECT 'Systemes restants apres suppression' as verification, id, nom_complet
FROM systemes_jeu
ORDER BY id;

-- ----------------------------------------------------------------------------
-- ETAPE 7: Ajout de City of Mist (NOUVEAU)
-- ----------------------------------------------------------------------------

SELECT 'ETAPE 7: Ajout de City of Mist' as etape;

-- Verifier que City of Mist n'existe pas deja
SELECT 'Verification existence City of Mist' as verification, COUNT(*) as count
FROM univers_jeu
WHERE id = 'city-of-mist';

-- Si count = 0, inserer City of Mist
INSERT INTO univers_jeu (
  id,
  nom_complet,
  description,
  editeur,
  annee_sortie,
  systeme_jeu,
  statut,
  ordre_affichage,
  couleur_theme,
  couleur_accent,
  tags,
  version_supportee,
  langue_principale,
  langues_disponibles,
  date_creation,
  date_modification
)
SELECT
  'city-of-mist',
  'City of Mist',
  'Enquetes urbaines modernes avec elements surnaturels. Incarnez des individus ordinaires touches par des legendes anciennes.',
  'Son of Oak Game Studio',
  2017,
  'mistengine',
  'ACTIF',
  1,
  '#1a1a2e',
  '#f0a500',
  ARRAY['urban', 'investigation', 'supernatural', 'modern'],
  '1.0',
  'en',
  ARRAY['en', 'fr'],
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM univers_jeu WHERE id = 'city-of-mist'
);

-- Verification
SELECT 'City of Mist insere' as verification, id, nom_complet, systeme_jeu
FROM univers_jeu
WHERE id = 'city-of-mist';

-- ----------------------------------------------------------------------------
-- ETAPE 8: Verification Finale de l'Integrite
-- ----------------------------------------------------------------------------

SELECT 'ETAPE 8: Verification finale integrite referentielle' as etape;

-- Verifier qu'aucun enregistrement orphelin n'existe
SELECT 'personnages orphelins' as table_name, COUNT(*) as count
FROM personnages p
WHERE p.systeme_jeu NOT IN (SELECT id FROM systemes_jeu)
   OR (p.univers_jeu IS NOT NULL AND p.univers_jeu NOT IN (SELECT id FROM univers_jeu))

UNION ALL

SELECT 'pdfs orphelins', COUNT(*)
FROM pdfs p
WHERE p.systeme_jeu NOT IN (SELECT id FROM systemes_jeu)
   OR (p.univers_jeu IS NOT NULL AND p.univers_jeu NOT IN (SELECT id FROM univers_jeu))

UNION ALL

SELECT 'documents orphelins', COUNT(*)
FROM documents d
WHERE d.systeme_jeu NOT IN (SELECT id FROM systemes_jeu)
   OR (d.univers_jeu IS NOT NULL AND d.univers_jeu NOT IN (SELECT id FROM univers_jeu))

UNION ALL

SELECT 'oracles orphelins', COUNT(*)
FROM oracles o
WHERE o.univers_jeu NOT IN (SELECT id FROM univers_jeu);

-- IMPORTANT: Toutes les lignes doivent retourner count = 0
-- Si count > 0, il y a un probleme d'integrite referentielle

-- ----------------------------------------------------------------------------
-- ETAPE 9: Recapitulatif Final
-- ----------------------------------------------------------------------------

SELECT 'ETAPE 9: Recapitulatif final' as etape;

SELECT 'systemes_jeu' as table_name, COUNT(*) as count_final
FROM systemes_jeu
UNION ALL
SELECT 'univers_jeu', COUNT(*)
FROM univers_jeu
UNION ALL
SELECT 'personnages', COUNT(*)
FROM personnages
UNION ALL
SELECT 'pdfs', COUNT(*)
FROM pdfs
UNION ALL
SELECT 'documents', COUNT(*)
FROM documents
UNION ALL
SELECT 'oracles', COUNT(*)
FROM oracles;

-- Lister les systemes et univers restants
SELECT 'Systeme restant' as type, id, nom_complet
FROM systemes_jeu
UNION ALL
SELECT 'Univers restant', id, nom_complet
FROM univers_jeu
ORDER BY type DESC, id;

-- ----------------------------------------------------------------------------
-- DECISION FINALE
-- ----------------------------------------------------------------------------

-- SI TOUT EST OK:
-- COMMIT;

-- SI PROBLEME DETECTE:
-- ROLLBACK;

-- ATTENTION: Decommenter une seule des deux lignes ci-dessus
-- Ne pas laisser la transaction ouverte

-- Apres COMMIT, executer VACUUM ANALYZE pour optimiser les indices
-- VACUUM ANALYZE systemes_jeu;
-- VACUUM ANALYZE univers_jeu;
-- VACUUM ANALYZE personnages;
-- VACUUM ANALYZE pdfs;
-- VACUUM ANALYZE documents;
-- VACUUM ANALYZE oracles;

-- ============================================================================
-- FIN DU SCRIPT
-- ============================================================================
