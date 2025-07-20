-- Migration 001: Ajout system_rights et gestion utilisateurs anonymes
-- Date: 2025-01-20
-- Description: Ajoute les champs nécessaires pour gérer les droits système et les utilisateurs anonymes

-- 1. Mise à jour de la table utilisateurs pour supporter les comptes anonymes
ALTER TABLE utilisateurs 
ALTER COLUMN email DROP NOT NULL,
ADD COLUMN IF NOT EXISTS type_compte VARCHAR(20) DEFAULT 'STANDARD' CHECK (type_compte IN ('STANDARD', 'PREMIUM', 'ADMIN')),
ADD COLUMN IF NOT EXISTS est_anonyme BOOLEAN DEFAULT FALSE;

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
CREATE INDEX IF NOT EXISTS idx_utilisateurs_type_compte ON utilisateurs(type_compte);
CREATE INDEX IF NOT EXISTS idx_utilisateurs_anonyme ON utilisateurs(est_anonyme);

-- 6. Mise à jour des utilisateurs existants
UPDATE utilisateurs 
SET type_compte = CASE 
    WHEN role = 'ADMIN' THEN 'ADMIN'
    WHEN role = 'PREMIUM' THEN 'PREMIUM'
    ELSE 'STANDARD'
END
WHERE type_compte IS NULL;

-- 7. Mise à jour des PDFs existants pour system_rights
UPDATE pdfs 
SET system_rights = 'private'
WHERE system_rights IS NULL;

-- 8. Ajout d'un utilisateur anonyme de référence (ID = 0)
INSERT INTO utilisateurs (id, nom, email, role, type_compte, est_anonyme) 
VALUES (0, 'Utilisateur Anonyme', NULL, 'UTILISATEUR', 'STANDARD', TRUE)
ON CONFLICT (id) DO NOTHING;

-- 9. Mise à jour de la séquence pour éviter les conflits avec l'ID 0
SELECT setval('utilisateurs_id_seq', GREATEST(1, (SELECT MAX(id) FROM utilisateurs WHERE id > 0)));