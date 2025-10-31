-- Brumisa3 - Big Bang Cleanup
-- Supprime toutes les tables et objets legacy avant migration MVP v1.0
-- WARNING: Perte totale des données existantes

-- Drop views first (dependencies)
DROP VIEW IF EXISTS oracle_stats CASCADE;
DROP VIEW IF EXISTS document_stats CASCADE;
DROP VIEW IF EXISTS user_stats CASCADE;

-- Drop all legacy tables (35+ tables)
DROP TABLE IF EXISTS actualites CASCADE;
DROP TABLE IF EXISTS demandes_changement_email CASCADE;
DROP TABLE IF EXISTS document_moderation_historique CASCADE;
DROP TABLE IF EXISTS document_systeme_jeu CASCADE;
DROP TABLE IF EXISTS document_univers_jeu CASCADE;
DROP TABLE IF EXISTS document_votes CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS logs_activite CASCADE;
DROP TABLE IF EXISTS migrations CASCADE;
DROP TABLE IF EXISTS newsletter_abonnes CASCADE;
DROP TABLE IF EXISTS oracle_cascades CASCADE;
DROP TABLE IF EXISTS oracle_categories CASCADE;
DROP TABLE IF EXISTS oracle_category_assignments CASCADE;
DROP TABLE IF EXISTS oracle_drafts CASCADE;
DROP TABLE IF EXISTS oracle_draws CASCADE;
DROP TABLE IF EXISTS oracle_edit_history CASCADE;
DROP TABLE IF EXISTS oracle_imports CASCADE;
DROP TABLE IF EXISTS oracle_items CASCADE;
DROP TABLE IF EXISTS oracle_propositions CASCADE;
DROP TABLE IF EXISTS oracle_votes CASCADE;
DROP TABLE IF EXISTS oracles CASCADE;
DROP TABLE IF EXISTS oracles_personnalises CASCADE;
DROP TABLE IF EXISTS parametres CASCADE;
DROP TABLE IF EXISTS pdf_templates_premium CASCADE;
DROP TABLE IF EXISTS pdfs CASCADE;
DROP TABLE IF EXISTS personnages CASCADE;
DROP TABLE IF EXISTS rgpd_consentements CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS systemes_jeu CASCADE;
DROP TABLE IF EXISTS temoignages CASCADE;
DROP TABLE IF EXISTS templates_pdf CASCADE;
DROP TABLE IF EXISTS test_migration CASCADE;
DROP TABLE IF EXISTS univers_jeu CASCADE;
DROP TABLE IF EXISTS utilisateur_email_historique CASCADE;
DROP TABLE IF EXISTS utilisateurs CASCADE;

-- Drop any remaining functions or triggers
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;
DROP TRIGGER IF EXISTS update_documents_modtime ON documents;
DROP TRIGGER IF EXISTS update_personnages_modtime ON personnages;

-- Cleanup complete
-- Ready for Prisma migration
