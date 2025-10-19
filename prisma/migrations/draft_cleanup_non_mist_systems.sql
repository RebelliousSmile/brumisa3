-- ============================================================================
-- SCRIPT DE NETTOYAGE DES SYSTEMES NON-MIST
-- ============================================================================
-- Date: 2025-01-19
-- Auteur: Claude (TASK-020A)
-- Description: Suppression des systèmes non-Mist et ajout de City of Mist
--
-- ATTENTION: Ce script supprime définitivement des données !
-- Un backup complet doit avoir été créé avant d'exécuter ce script.
-- Backup disponible dans: documentation/MIGRATION/2025-01-19-backup-before-cleanup.json
--
-- IMPORTANT: Les relations utilisent onDelete: Restrict
-- Il faut supprimer dans l'ordre INVERSE des dépendances :
--   1. Tables terminales (oracles, documents, pdfs, personnages)
--   2. univers_jeu
--   3. systemes_jeu
-- ============================================================================

BEGIN;

-- ============================================================================
-- ETAPE 1: Suppression des données liées (tables terminales)
-- ============================================================================

-- 1.1. Suppression des oracles liés aux univers non-Mist
-- Impact: 7 oracles (Monsterhearts: 4, Roue du Temps: 3)
DELETE FROM oracles
WHERE univers_jeu IN (
  'monsterhearts',     -- PBTA
  'urban_shadows',     -- PBTA
  'ecryme',            -- Engrenages
  'roue_du_temps',     -- Engrenages
  'metro2033',         -- MYZ
  'zombiology'         -- Zombiology
);

-- 1.2. Suppression des documents liés aux systèmes non-Mist (si existants)
DELETE FROM documents
WHERE "systemeJeu" IN (
  'pbta',
  'monsterhearts',     -- Doublon système
  'engrenages',
  'myz',
  'metro2033',         -- Doublon système
  'zombiology'
);

-- 1.3. Suppression des PDFs liés aux systèmes non-Mist (si existants)
DELETE FROM pdfs
WHERE systeme_jeu IN (
  'pbta',
  'monsterhearts',     -- Doublon système
  'engrenages',
  'myz',
  'metro2033',         -- Doublon système
  'zombiology'
);

-- 1.4. Suppression des personnages liés aux systèmes non-Mist (si existants)
DELETE FROM personnages
WHERE systeme_jeu IN (
  'pbta',
  'monsterhearts',     -- Doublon système
  'engrenages',
  'myz',
  'metro2033',         -- Doublon système
  'zombiology'
);

-- ============================================================================
-- ETAPE 2: Suppression des univers non-Mist
-- ============================================================================

-- IMPORTANT: Supprimer les doublons EN PREMIER pour éviter les erreurs FK
DELETE FROM univers_jeu WHERE id IN (
  -- Univers PBTA
  'monsterhearts',     -- DOUBLON avec système monsterhearts
  'urban_shadows',

  -- Univers Engrenages
  'ecryme',
  'roue_du_temps',

  -- Univers MYZ
  'metro2033',         -- DOUBLON avec système metro2033

  -- Univers Zombiology
  'zombiology'         -- DOUBLON avec système zombiology
);

-- ============================================================================
-- ETAPE 3: Suppression des systèmes non-Mist
-- ============================================================================

DELETE FROM systemes_jeu WHERE id IN (
  'pbta',              -- PBTA (Powered by the Apocalypse)
  'monsterhearts',     -- Monsterhearts 2 (doublon système)
  'engrenages',        -- Engrenages et Sortilèges
  'myz',               -- MYZ (Mutant Year Zero)
  'metro2033',         -- Métro 2033 (doublon système)
  'zombiology'         -- Zombiology
);

-- ============================================================================
-- ETAPE 4: Ajout de City of Mist (RECOMMANDATION ARCHITECTE)
-- ============================================================================

-- City of Mist est la variante de base du Mist Engine
-- Post-Mortem est un hack de City of Mist
-- Ajout maintenant pour cohérence avec le plan d'intégration LITM

INSERT INTO univers_jeu (
  id,
  nom_complet,
  description,
  editeur,
  annee_sortie,
  site_officiel,
  systeme_jeu,
  statut,
  ordre_affichage,
  couleur_theme,
  langue_principale,
  date_creation
) VALUES (
  'city-of-mist',
  'City of Mist',
  'Enquêtes urbaines modernes avec pouvoirs surnaturels inspirés par des mythes et légendes. Les personnages sont des Rifts, des individus ordinaires dont la vie est bouleversée par l''apparition de pouvoirs mystiques.',
  'Son of Oak Game Studio',
  2017,
  'https://cityofmist.co',
  'mistengine',
  'ACTIF',
  1,
  '#2D3748',  -- Gris urbain sombre
  'en',
  CURRENT_TIMESTAMP
);

-- ============================================================================
-- ETAPE 5: Vérifications d'intégrité
-- ============================================================================

-- Compter les systèmes restants (doit être = 1)
DO $$
DECLARE
  systemes_count INT;
BEGIN
  SELECT COUNT(*) INTO systemes_count FROM systemes_jeu WHERE actif = true;

  IF systemes_count != 1 THEN
    RAISE EXCEPTION 'ERREUR: Il devrait rester exactement 1 système actif, mais il y en a %', systemes_count;
  END IF;

  RAISE NOTICE 'OK: Exactement 1 système actif restant';
END $$;

-- Compter les univers restants (doit être = 5)
-- otherscape, post_mortem, obojima, zamanora, city-of-mist
DO $$
DECLARE
  univers_count INT;
BEGIN
  SELECT COUNT(*) INTO univers_count FROM univers_jeu WHERE statut = 'ACTIF';

  IF univers_count != 5 THEN
    RAISE EXCEPTION 'ERREUR: Il devrait rester exactement 5 univers actifs, mais il y en a %', univers_count;
  END IF;

  RAISE NOTICE 'OK: Exactement 5 univers actifs restants';
END $$;

-- Vérifier qu'il n'y a pas de données orphelines
DO $$
DECLARE
  orphelins_count INT;
BEGIN
  -- Personnages orphelins
  SELECT COUNT(*) INTO orphelins_count
  FROM personnages
  WHERE systeme_jeu NOT IN (SELECT id FROM systemes_jeu);

  IF orphelins_count > 0 THEN
    RAISE EXCEPTION 'ERREUR: % personnages orphelins détectés', orphelins_count;
  END IF;

  -- PDFs orphelins
  SELECT COUNT(*) INTO orphelins_count
  FROM pdfs
  WHERE systeme_jeu IS NOT NULL
    AND systeme_jeu NOT IN (SELECT id FROM systemes_jeu);

  IF orphelins_count > 0 THEN
    RAISE EXCEPTION 'ERREUR: % PDFs orphelins détectés', orphelins_count;
  END IF;

  -- Oracles orphelins
  SELECT COUNT(*) INTO orphelins_count
  FROM oracles
  WHERE univers_jeu IS NOT NULL
    AND univers_jeu NOT IN (SELECT id FROM univers_jeu);

  IF orphelins_count > 0 THEN
    RAISE EXCEPTION 'ERREUR: % oracles orphelins détectés', orphelins_count;
  END IF;

  RAISE NOTICE 'OK: Aucune donnée orpheline détectée';
END $$;

-- Afficher les systèmes et univers restants
DO $$
DECLARE
  r RECORD;
BEGIN
  RAISE NOTICE '=== SYSTEMES RESTANTS ===';
  FOR r IN SELECT id, nom_complet FROM systemes_jeu ORDER BY id LOOP
    RAISE NOTICE '  - % (%)', r.nom_complet, r.id;
  END LOOP;

  RAISE NOTICE '=== UNIVERS RESTANTS ===';
  FOR r IN SELECT id, nom_complet, systeme_jeu FROM univers_jeu ORDER BY systeme_jeu, id LOOP
    RAISE NOTICE '  - % (%) [systeme: %]', r.nom_complet, r.id, r.systeme_jeu;
  END LOOP;
END $$;

-- ============================================================================
-- FINALISATION
-- ============================================================================

-- Si toutes les vérifications passent, COMMIT
-- Sinon, ROLLBACK automatiquement en cas d'exception

COMMIT;

-- IMPORTANT: Après l'exécution réussie, exécuter :
-- VACUUM ANALYZE systemes_jeu;
-- VACUUM ANALYZE univers_jeu;
-- VACUUM ANALYZE oracles;
-- VACUUM ANALYZE personnages;
-- VACUUM ANALYZE pdfs;
-- VACUUM ANALYZE documents;
