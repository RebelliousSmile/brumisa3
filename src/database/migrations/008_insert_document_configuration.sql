-- Migration 007: Configuration des types de documents par système JDR

-- Configuration pour Monsterhearts
INSERT INTO document_systeme_jeu (document_type, systeme_jeu, actif, ordre_affichage, configuration) 
SELECT 'CHARACTER', 'monsterhearts', TRUE, 1, '{"required_fields": ["nom", "skin"], "template": "monsterhearts-character"}'
WHERE NOT EXISTS (SELECT 1 FROM document_systeme_jeu WHERE document_type = 'CHARACTER' AND systeme_jeu = 'monsterhearts');

INSERT INTO document_systeme_jeu (document_type, systeme_jeu, actif, ordre_affichage, configuration) 
SELECT 'TOWN', 'monsterhearts', TRUE, 2, '{"required_fields": ["nom", "description"], "template": "monsterhearts-town"}'
WHERE NOT EXISTS (SELECT 1 FROM document_systeme_jeu WHERE document_type = 'TOWN' AND systeme_jeu = 'monsterhearts');

INSERT INTO document_systeme_jeu (document_type, systeme_jeu, actif, ordre_affichage, configuration) 
SELECT 'GROUP', 'monsterhearts', TRUE, 3, '{"required_fields": ["nom", "etablissement"], "template": "monsterhearts-group"}'
WHERE NOT EXISTS (SELECT 1 FROM document_systeme_jeu WHERE document_type = 'GROUP' AND systeme_jeu = 'monsterhearts');

INSERT INTO document_systeme_jeu (document_type, systeme_jeu, actif, ordre_affichage, configuration) 
SELECT 'ORGANIZATION', 'monsterhearts', TRUE, 4, '{"required_fields": ["nom", "membres"], "template": "organization-list"}'
WHERE NOT EXISTS (SELECT 1 FROM document_systeme_jeu WHERE document_type = 'ORGANIZATION' AND systeme_jeu = 'monsterhearts');

-- Configuration pour MistEngine  
INSERT INTO document_systeme_jeu (document_type, systeme_jeu, actif, ordre_affichage, configuration) 
SELECT 'CHARACTER', 'mistengine', TRUE, 1, '{"required_fields": ["nom"], "template": "mistengine-character"}'
WHERE NOT EXISTS (SELECT 1 FROM document_systeme_jeu WHERE document_type = 'CHARACTER' AND systeme_jeu = 'mistengine');

INSERT INTO document_systeme_jeu (document_type, systeme_jeu, actif, ordre_affichage, configuration) 
SELECT 'DANGER', 'mistengine', TRUE, 2, '{"required_fields": ["nom", "type_front"], "template": "mistengine-danger"}'
WHERE NOT EXISTS (SELECT 1 FROM document_systeme_jeu WHERE document_type = 'DANGER' AND systeme_jeu = 'mistengine');

INSERT INTO document_systeme_jeu (document_type, systeme_jeu, actif, ordre_affichage, configuration) 
SELECT 'ORGANIZATION', 'mistengine', TRUE, 3, '{"required_fields": ["nom", "membres"], "template": "organization-list"}'
WHERE NOT EXISTS (SELECT 1 FROM document_systeme_jeu WHERE document_type = 'ORGANIZATION' AND systeme_jeu = 'mistengine');

-- Configuration pour Engrenages
INSERT INTO document_systeme_jeu (document_type, systeme_jeu, actif, ordre_affichage, configuration) 
SELECT 'CHARACTER', 'engrenages', TRUE, 1, '{"required_fields": ["nom", "concept"], "template": "engrenages-character"}'
WHERE NOT EXISTS (SELECT 1 FROM document_systeme_jeu WHERE document_type = 'CHARACTER' AND systeme_jeu = 'engrenages');

INSERT INTO document_systeme_jeu (document_type, systeme_jeu, actif, ordre_affichage, configuration) 
SELECT 'ORGANIZATION', 'engrenages', TRUE, 2, '{"required_fields": ["nom", "membres"], "template": "organization-list"}'
WHERE NOT EXISTS (SELECT 1 FROM document_systeme_jeu WHERE document_type = 'ORGANIZATION' AND systeme_jeu = 'engrenages');

-- Configuration pour Metro2033
INSERT INTO document_systeme_jeu (document_type, systeme_jeu, actif, ordre_affichage, configuration) 
SELECT 'CHARACTER', 'metro2033', TRUE, 1, '{"required_fields": ["nom", "station_origine"], "template": "metro2033-character"}'
WHERE NOT EXISTS (SELECT 1 FROM document_systeme_jeu WHERE document_type = 'CHARACTER' AND systeme_jeu = 'metro2033');

INSERT INTO document_systeme_jeu (document_type, systeme_jeu, actif, ordre_affichage, configuration) 
SELECT 'ORGANIZATION', 'metro2033', TRUE, 2, '{"required_fields": ["nom", "faction"], "template": "organization-list"}'
WHERE NOT EXISTS (SELECT 1 FROM document_systeme_jeu WHERE document_type = 'ORGANIZATION' AND systeme_jeu = 'metro2033');

-- Configuration pour Zombiology
INSERT INTO document_systeme_jeu (document_type, systeme_jeu, actif, ordre_affichage, configuration) 
SELECT 'CHARACTER', 'zombiology', TRUE, 1, '{"required_fields": ["nom"], "template": "zombiology-character"}'
WHERE NOT EXISTS (SELECT 1 FROM document_systeme_jeu WHERE document_type = 'CHARACTER' AND systeme_jeu = 'zombiology');

INSERT INTO document_systeme_jeu (document_type, systeme_jeu, actif, ordre_affichage, configuration) 
SELECT 'ORGANIZATION', 'zombiology', TRUE, 2, '{"required_fields": ["nom", "survivants"], "template": "organization-list"}'
WHERE NOT EXISTS (SELECT 1 FROM document_systeme_jeu WHERE document_type = 'ORGANIZATION' AND systeme_jeu = 'zombiology');