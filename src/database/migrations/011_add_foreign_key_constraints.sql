-- Migration 011: Ajout des contraintes de clés étrangères selon architecture-models.md
-- 
-- Cette migration ajoute toutes les relations définies dans l'architecture
-- avec les cascades appropriés selon le type de relation

-- CONTRAINTES PRINCIPALES

-- 1. Relations Utilisateur
-- personnages.utilisateur_id -> utilisateurs.id
-- Les personnages appartiennent à un utilisateur (NOT NULL)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_personnages_utilisateur_id'
    ) THEN
        ALTER TABLE personnages 
        ADD CONSTRAINT fk_personnages_utilisateur_id 
        FOREIGN KEY (utilisateur_id) 
        REFERENCES utilisateurs(id) 
        ON DELETE CASCADE;
    END IF;
END $$;

-- documents.utilisateur_id -> utilisateurs.id
-- Nullable pour utilisateurs anonymes
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_documents_utilisateur_id'
    ) THEN
        ALTER TABLE documents 
        ADD CONSTRAINT fk_documents_utilisateur_id 
        FOREIGN KEY (utilisateur_id) 
        REFERENCES utilisateurs(id) 
        ON DELETE SET NULL; -- Documents anonymes préservés
    END IF;
END $$;

-- documents.moderateur_id -> utilisateurs.id  
-- Modérateur qui a traité le document
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_documents_moderateur_id'
    ) THEN
        ALTER TABLE documents 
        ADD CONSTRAINT fk_documents_moderateur_id 
        FOREIGN KEY (moderateur_id) 
        REFERENCES utilisateurs(id) 
        ON DELETE SET NULL; -- Modérateur supprimé = historique préservé
    END IF;
END $$;

-- pdfs.utilisateur_id -> utilisateurs.id
-- Nullable pour utilisateurs anonymes
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_pdfs_utilisateur_id'
    ) THEN
        ALTER TABLE pdfs 
        ADD CONSTRAINT fk_pdfs_utilisateur_id 
        FOREIGN KEY (utilisateur_id) 
        REFERENCES utilisateurs(id) 
        ON DELETE SET NULL; -- PDFs anonymes préservés
    END IF;
END $$;

-- 2. Relations Document-Personnage
-- documents.personnage_id -> personnages.id
-- Un document peut être généré depuis un personnage sauvegardé
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_documents_personnage_id'
    ) THEN
        ALTER TABLE documents 
        ADD CONSTRAINT fk_documents_personnage_id 
        FOREIGN KEY (personnage_id) 
        REFERENCES personnages(id) 
        ON DELETE SET NULL; -- Document préservé si personnage supprimé
    END IF;
END $$;

-- pdfs.personnage_id -> personnages.id
-- Un PDF peut être généré depuis un personnage sauvegardé
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_pdfs_personnage_id'
    ) THEN
        ALTER TABLE pdfs 
        ADD CONSTRAINT fk_pdfs_personnage_id 
        FOREIGN KEY (personnage_id) 
        REFERENCES personnages(id) 
        ON DELETE SET NULL; -- PDF préservé si personnage supprimé
    END IF;
END $$;

-- 3. Relations Document-PDF
-- pdfs.document_id -> documents.id  
-- CRITICAL : Chaque PDF est lié à un document (NOT NULL selon architecture)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_pdfs_document_id'
    ) THEN
        ALTER TABLE pdfs 
        ADD CONSTRAINT fk_pdfs_document_id 
        FOREIGN KEY (document_id) 
        REFERENCES documents(id) 
        ON DELETE CASCADE; -- PDF supprimé si document supprimé
    END IF;
END $$;

-- 4. Relations Système JDR
-- documents.systeme_jeu -> systemes_jeu.id
-- Validation des systèmes supportés
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_documents_systeme_jeu'
    ) THEN
        ALTER TABLE documents 
        ADD CONSTRAINT fk_documents_systeme_jeu 
        FOREIGN KEY (systeme_jeu) 
        REFERENCES systemes_jeu(id) 
        ON DELETE RESTRICT; -- Empêcher suppression système si documents
    END IF;
END $$;

-- personnages.systeme_jeu -> systemes_jeu.id
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_personnages_systeme_jeu'
    ) THEN
        ALTER TABLE personnages 
        ADD CONSTRAINT fk_personnages_systeme_jeu 
        FOREIGN KEY (systeme_jeu) 
        REFERENCES systemes_jeu(id) 
        ON DELETE RESTRICT; -- Empêcher suppression système si personnages
    END IF;
END $$;

-- pdfs.systeme_jeu -> systemes_jeu.id
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_pdfs_systeme_jeu'
    ) THEN
        ALTER TABLE pdfs 
        ADD CONSTRAINT fk_pdfs_systeme_jeu 
        FOREIGN KEY (systeme_jeu) 
        REFERENCES systemes_jeu(id) 
        ON DELETE RESTRICT; -- Empêcher suppression système si PDFs
    END IF;
END $$;

-- document_systeme_jeu.systeme_jeu -> systemes_jeu.id
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_document_systeme_jeu_systeme_jeu'
    ) THEN
        ALTER TABLE document_systeme_jeu 
        ADD CONSTRAINT fk_document_systeme_jeu_systeme_jeu 
        FOREIGN KEY (systeme_jeu) 
        REFERENCES systemes_jeu(id) 
        ON DELETE CASCADE; -- Supprimer configurations si système supprimé
    END IF;
END $$;

-- 5. Relations de Vote et Modération
-- document_votes.document_id -> documents.id
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_document_votes_document_id'
    ) THEN
        ALTER TABLE document_votes 
        ADD CONSTRAINT fk_document_votes_document_id 
        FOREIGN KEY (document_id) 
        REFERENCES documents(id) 
        ON DELETE CASCADE; -- Votes supprimés si document supprimé
    END IF;
END $$;

-- document_votes.utilisateur_id -> utilisateurs.id
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_document_votes_utilisateur_id'
    ) THEN
        ALTER TABLE document_votes 
        ADD CONSTRAINT fk_document_votes_utilisateur_id 
        FOREIGN KEY (utilisateur_id) 
        REFERENCES utilisateurs(id) 
        ON DELETE CASCADE; -- Votes supprimés si utilisateur supprimé
    END IF;
END $$;

-- document_moderation_historique.document_id -> documents.id
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_moderation_historique_document_id'
    ) THEN
        ALTER TABLE document_moderation_historique 
        ADD CONSTRAINT fk_moderation_historique_document_id 
        FOREIGN KEY (document_id) 
        REFERENCES documents(id) 
        ON DELETE CASCADE; -- Historique supprimé si document supprimé
    END IF;
END $$;

-- document_moderation_historique.moderateur_id -> utilisateurs.id
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_moderation_historique_moderateur_id'
    ) THEN
        ALTER TABLE document_moderation_historique 
        ADD CONSTRAINT fk_moderation_historique_moderateur_id 
        FOREIGN KEY (moderateur_id) 
        REFERENCES utilisateurs(id) 
        ON DELETE SET NULL; -- Historique préservé, modérateur anonymisé
    END IF;
END $$;

-- 6. Relations RGPD et Sécurité
-- rgpd_consentements.utilisateur_id -> utilisateurs.id
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_rgpd_consentements_utilisateur_id'
    ) THEN
        ALTER TABLE rgpd_consentements 
        ADD CONSTRAINT fk_rgpd_consentements_utilisateur_id 
        FOREIGN KEY (utilisateur_id) 
        REFERENCES utilisateurs(id) 
        ON DELETE CASCADE; -- Consentements supprimés avec utilisateur
    END IF;
END $$;

-- demandes_changement_email.utilisateur_id -> utilisateurs.id
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_demandes_changement_email_utilisateur_id'
    ) THEN
        ALTER TABLE demandes_changement_email 
        ADD CONSTRAINT fk_demandes_changement_email_utilisateur_id 
        FOREIGN KEY (utilisateur_id) 
        REFERENCES utilisateurs(id) 
        ON DELETE CASCADE; -- Demandes supprimées avec utilisateur
    END IF;
END $$;

-- 7. Relations Oracles (existantes)
-- oracles_personnalises.utilisateur_id -> utilisateurs.id (si table existe)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'oracles_personnalises') 
    AND NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_oracles_personnalises_utilisateur_id'
    ) THEN
        ALTER TABLE oracles_personnalises 
        ADD CONSTRAINT fk_oracles_personnalises_utilisateur_id 
        FOREIGN KEY (utilisateur_id) 
        REFERENCES utilisateurs(id) 
        ON DELETE CASCADE; -- Oracles personnalisés supprimés avec utilisateur
    END IF;
END $$;

-- oracles_personnalises.base_sur_oracle_id -> oracles.id (si tables existent)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'oracles_personnalises')
    AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'oracles')
    AND NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_oracles_personnalises_base_oracle'
    ) THEN
        ALTER TABLE oracles_personnalises 
        ADD CONSTRAINT fk_oracles_personnalises_base_oracle 
        FOREIGN KEY (base_sur_oracle_id) 
        REFERENCES oracles(id) 
        ON DELETE SET NULL; -- Oracle personnalisé devient indépendant
    END IF;
END $$;

-- 8. Relations Newsletter et Actualités (si tables existent)
-- actualites.auteur_id -> utilisateurs.id
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'actualites')
    AND NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_actualites_auteur_id'
    ) THEN
        ALTER TABLE actualites 
        ADD CONSTRAINT fk_actualites_auteur_id 
        FOREIGN KEY (auteur_id) 
        REFERENCES utilisateurs(id) 
        ON DELETE SET NULL; -- Actualité préservée, auteur anonymisé
    END IF;
END $$;

-- 9. Relations Témoignages (validation applicative via système)
-- temoignages.systeme_jeu -> systemes_jeu.id (validation optionnelle)
-- Note: Pas de contrainte FK car peut être NULL pour témoignages génériques
-- Validation sera faite au niveau applicatif dans le modèle

-- CONTRAINTES UNIQUES ET INDEX DE PERFORMANCE

-- Contrainte unique pour vote utilisateur/document
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'uniq_document_votes_user_document'
    ) THEN
        ALTER TABLE document_votes 
        ADD CONSTRAINT uniq_document_votes_user_document 
        UNIQUE (document_id, utilisateur_id);
    END IF;
END $$;

-- Contrainte unique pour clé composite document_systeme_jeu
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'pk_document_systeme_jeu'
    ) THEN
        ALTER TABLE document_systeme_jeu 
        ADD CONSTRAINT pk_document_systeme_jeu 
        PRIMARY KEY (document_type, systeme_jeu);
    END IF;
END $$;

-- INDEX DE PERFORMANCE pour les requêtes fréquentes

-- Index sur les relations fréquemment requêtées
CREATE INDEX IF NOT EXISTS idx_documents_utilisateur_systeme ON documents(utilisateur_id, systeme_jeu);
CREATE INDEX IF NOT EXISTS idx_documents_personnage_id ON documents(personnage_id);
CREATE INDEX IF NOT EXISTS idx_documents_moderateur_id ON documents(moderateur_id);

CREATE INDEX IF NOT EXISTS idx_pdfs_utilisateur_systeme ON pdfs(utilisateur_id, systeme_jeu);
CREATE INDEX IF NOT EXISTS idx_pdfs_document_id ON pdfs(document_id);
CREATE INDEX IF NOT EXISTS idx_pdfs_personnage_id ON pdfs(personnage_id);

CREATE INDEX IF NOT EXISTS idx_personnages_utilisateur_systeme ON personnages(utilisateur_id, systeme_jeu);

CREATE INDEX IF NOT EXISTS idx_document_votes_document_id ON document_votes(document_id);
CREATE INDEX IF NOT EXISTS idx_document_votes_utilisateur_id ON document_votes(utilisateur_id);

CREATE INDEX IF NOT EXISTS idx_moderation_historique_document_id ON document_moderation_historique(document_id);
CREATE INDEX IF NOT EXISTS idx_moderation_historique_moderateur_id ON document_moderation_historique(moderateur_id);
CREATE INDEX IF NOT EXISTS idx_moderation_historique_date_action ON document_moderation_historique(date_action);

CREATE INDEX IF NOT EXISTS idx_rgpd_consentements_utilisateur_id ON rgpd_consentements(utilisateur_id);
CREATE INDEX IF NOT EXISTS idx_demandes_email_utilisateur_id ON demandes_changement_email(utilisateur_id);

-- VÉRIFICATIONS D'INTÉGRITÉ

-- Fonction pour vérifier l'intégrité référentielle
CREATE OR REPLACE FUNCTION verifier_integrite_relations()
RETURNS TABLE (
    table_name TEXT,
    constraint_name TEXT,
    status TEXT,
    details TEXT
) AS $$
BEGIN
    -- Vérification des relations Utilisateur
    RETURN QUERY
    SELECT 
        'personnages'::TEXT,
        'fk_personnages_utilisateur_id'::TEXT,
        CASE WHEN COUNT(*) = 0 THEN 'OK' ELSE 'ERREUR' END::TEXT,
        CONCAT('Personnages orphelins: ', COUNT(*))::TEXT
    FROM personnages p 
    WHERE p.utilisateur_id IS NOT NULL 
    AND NOT EXISTS (SELECT 1 FROM utilisateurs u WHERE u.id = p.utilisateur_id);
    
    -- Vérification des relations Document
    RETURN QUERY
    SELECT 
        'documents'::TEXT,
        'fk_documents_personnage_id'::TEXT,
        CASE WHEN COUNT(*) = 0 THEN 'OK' ELSE 'ERREUR' END::TEXT,
        CONCAT('Documents avec personnage inexistant: ', COUNT(*))::TEXT
    FROM documents d 
    WHERE d.personnage_id IS NOT NULL 
    AND NOT EXISTS (SELECT 1 FROM personnages p WHERE p.id = d.personnage_id);
    
    -- Vérification des relations PDF
    RETURN QUERY
    SELECT 
        'pdfs'::TEXT,
        'fk_pdfs_document_id'::TEXT,
        CASE WHEN COUNT(*) = 0 THEN 'OK' ELSE 'ERREUR' END::TEXT,
        CONCAT('PDFs avec document inexistant: ', COUNT(*))::TEXT
    FROM pdfs p 
    WHERE p.document_id IS NOT NULL 
    AND NOT EXISTS (SELECT 1 FROM documents d WHERE d.id = p.document_id);
    
    -- Vérification des systèmes JDR
    RETURN QUERY
    SELECT 
        'documents'::TEXT,
        'fk_documents_systeme_jeu'::TEXT,
        CASE WHEN COUNT(*) = 0 THEN 'OK' ELSE 'ERREUR' END::TEXT,
        CONCAT('Documents avec système inexistant: ', COUNT(*))::TEXT
    FROM documents d 
    WHERE NOT EXISTS (SELECT 1 FROM systemes_jeu s WHERE s.id = d.systeme_jeu);
    
END;
$$ LANGUAGE plpgsql;

-- Message de fin
DO $$
BEGIN
    RAISE NOTICE 'Migration 011 terminée: Contraintes de clés étrangères ajoutées selon architecture-models.md';
    RAISE NOTICE 'Relations établies: Utilisateur->Personnages/Documents/PDFs, Document->PDF, Système->Documents/Personnages/PDFs';
    RAISE NOTICE 'Cascades configurées: CASCADE pour données dépendantes, SET NULL pour préserver historique, RESTRICT pour référentiels';
    RAISE NOTICE 'Utilisez SELECT * FROM verifier_integrite_relations() pour vérifier l''intégrité';
END $$;