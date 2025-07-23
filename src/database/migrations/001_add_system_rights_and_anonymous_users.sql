-- Migration 001: Ajout system_rights et gestion utilisateurs anonymes
-- Date: 2025-01-20
-- Description: Ajoute les champs nécessaires pour gérer les droits système et les utilisateurs anonymes

-- 1. Mise à jour de la table utilisateurs pour supporter les comptes anonymes
ALTER TABLE utilisateurs 
ALTER COLUMN email DROP NOT NULL;

-- 2. Mise à jour de la table pdfs pour ajouter system_rights
ALTER TABLE pdfs 
ADD COLUMN IF NOT EXISTS system_rights VARCHAR(20) DEFAULT 'private' CHECK (system_rights IN ('public', 'private', 'common')),
ADD COLUMN IF NOT EXISTS titre VARCHAR(255),
ADD COLUMN IF NOT EXISTS date_fin_generation TIMESTAMP;

-- 3. Modification de la colonne utilisateur_id pour permettre NULL (utilisateurs anonymes)
ALTER TABLE pdfs 
ALTER COLUMN utilisateur_id DROP NOT NULL;

-- 4. Modification de la table personnages pour permettre utilisateurs anonymes
ALTER TABLE personnages 
ALTER COLUMN utilisateur_id DROP NOT NULL;

-- 5. Ajout d'un index sur system_rights pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_pdfs_system_rights ON pdfs(system_rights);

-- 6. Les PDFs existants auront la valeur par défaut 'private'
-- Pas besoin d'UPDATE car la colonne a une valeur par défaut

-- 7. Ajout d'un utilisateur anonyme de référence (ID = 0) - après création colonne est_anonyme
-- Cette partie sera dans une migration ultérieure

-- 8. Mise à jour de la séquence pour éviter les conflits avec l'ID 0
SELECT setval('utilisateurs_id_seq', GREATEST(1, (SELECT MAX(id) FROM utilisateurs WHERE id > 0)));