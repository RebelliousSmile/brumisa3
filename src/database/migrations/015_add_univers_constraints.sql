-- Migration 015: Ajouter les contraintes de clés étrangères pour univers_jeu
-- Date: 2025-08-23
-- Description: Ajoute les contraintes de clés étrangères après migration des données

-- Ajouter les contraintes de clés étrangères pour documents
ALTER TABLE documents 
ADD CONSTRAINT fk_documents_univers 
    FOREIGN KEY (univers_jeu) 
    REFERENCES univers_jeu(id) 
    ON DELETE RESTRICT;

-- Ajouter les contraintes de clés étrangères pour oracles
ALTER TABLE oracles 
ADD CONSTRAINT fk_oracles_univers 
    FOREIGN KEY (univers_jeu) 
    REFERENCES univers_jeu(id) 
    ON DELETE RESTRICT;

-- Ajouter les contraintes pour personnages si la table existe
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'personnages') THEN
        ALTER TABLE personnages 
        ADD CONSTRAINT fk_personnages_univers 
            FOREIGN KEY (univers_jeu) 
            REFERENCES univers_jeu(id) 
            ON DELETE RESTRICT;
    END IF;
END $$;

-- Ajouter les contraintes pour pdfs si la table existe
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pdfs') THEN
        ALTER TABLE pdfs 
        ADD CONSTRAINT fk_pdfs_univers 
            FOREIGN KEY (univers_jeu) 
            REFERENCES univers_jeu(id) 
            ON DELETE RESTRICT;
    END IF;
END $$;

-- Créer un trigger pour maintenir la cohérence date_modification
CREATE OR REPLACE FUNCTION update_univers_modification_date()
RETURNS TRIGGER AS $$
BEGIN
    NEW.date_modification = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_univers_modification
BEFORE UPDATE ON univers_jeu
FOR EACH ROW
EXECUTE FUNCTION update_univers_modification_date();

-- Créer un trigger similaire pour document_univers_jeu
CREATE TRIGGER trigger_update_doc_univers_modification
BEFORE UPDATE ON document_univers_jeu
FOR EACH ROW
EXECUTE FUNCTION update_univers_modification_date();

-- Rapport final de la structure
DO $$
DECLARE
    univers_count INTEGER;
    doc_type_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO univers_count FROM univers_jeu;
    SELECT COUNT(*) INTO doc_type_count FROM document_univers_jeu;
    
    RAISE NOTICE 'Structure créée - Univers: %, Configurations de types: %', 
                 univers_count, doc_type_count;
END $$;