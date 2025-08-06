-- Ajout des données de configuration et utilisateur anonyme

-- Insertion de l'utilisateur anonyme s'il n'existe pas déjà
INSERT INTO utilisateurs (id, nom, email, role, est_anonyme, actif, date_creation, date_modification) 
SELECT 0, 'Utilisateur Anonyme', NULL, 'UTILISATEUR', TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM utilisateurs WHERE id = 0);

-- Ajout des paramètres de configuration
INSERT INTO parametres (cle, valeur, type, description, modifiable, date_creation, date_modification) 
SELECT 'mode_anonyme_active', 'true', 'boolean', 'Active le mode de création anonyme sur le pouce', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM parametres WHERE cle = 'mode_anonyme_active');

INSERT INTO parametres (cle, valeur, type, description, modifiable, date_creation, date_modification) 
SELECT 'duree_token_partage_pdf', '24', 'number', 'Durée de validité en heures des tokens de partage PDF', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM parametres WHERE cle = 'duree_token_partage_pdf');

INSERT INTO parametres (cle, valeur, type, description, modifiable, date_creation, date_modification) 
SELECT 'premium_cout_par_mois', '1.00', 'number', 'Coût en euros pour 1 mois de premium', FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM parametres WHERE cle = 'premium_cout_par_mois');

INSERT INTO parametres (cle, valeur, type, description, modifiable, date_creation, date_modification) 
SELECT 'nettoyage_auto_pdfs', 'true', 'boolean', 'Nettoyage automatique des anciens PDFs', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM parametres WHERE cle = 'nettoyage_auto_pdfs');

INSERT INTO parametres (cle, valeur, type, description, modifiable, date_creation, date_modification) 
SELECT 'duree_conservation_pdfs_anonymes', '7', 'number', 'Durée en jours de conservation des PDFs créés en mode anonyme', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM parametres WHERE cle = 'duree_conservation_pdfs_anonymes');