-- Migration 001b: Finaliser l'utilisateur anonyme
-- Date: 2025-07-23
-- Description: Ajouter l'utilisateur anonyme après création des colonnes nécessaires

-- Ajout d'un utilisateur anonyme de référence (ID = 0)
INSERT INTO utilisateurs (id, nom, email, role, type_compte, est_anonyme) 
VALUES (0, 'Utilisateur Anonyme', NULL, 'UTILISATEUR', 'STANDARD', TRUE)
ON CONFLICT (id) DO NOTHING;