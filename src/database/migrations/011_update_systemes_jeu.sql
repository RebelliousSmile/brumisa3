-- Migration 011: Mise \u00e0 jour de la table systemes_jeu
-- Date: 2025-08-23
-- Description: Ajoute les syst\u00e8mes pbta et myz qui manquent pour supporter les univers

-- Ins\u00e9rer le syst\u00e8me PBTA (Powered by the Apocalypse)
INSERT INTO systemes_jeu (id, nom_complet, description, statut, ordre_affichage, couleur_theme, icone, site_officiel, version_supportee, structure_donnees)
SELECT 'pbta', 'PBTA (Powered by the Apocalypse)', 'Syst\u00e8me narratif bas\u00e9 sur les mouvements pour jeux d''adolescence et d''horreur urbaine', 'ACTIF', 0, '#663399', 'fa-mask', 'http://apocalypse-world.com/', 'Core System', 
    '{"CHARACTER": {"champs_requis": ["skin", "hot", "cold", "volatile", "dark"], "template_pdf": "pbta_character", "validation_custom": ["skin_valide", "stats_equilibrees"]}, "TOWN": {"champs_requis": ["nom", "description", "lieux"], "template_pdf": "pbta_town"}, "GROUP": {"champs_requis": ["nom", "type", "membres"], "template_pdf": "pbta_group"}}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM systemes_jeu WHERE id = 'pbta');

-- Ins\u00e9rer le syst\u00e8me MYZ (Mutant Year Zero / Year Zero Engine)
INSERT INTO systemes_jeu (id, nom_complet, description, statut, ordre_affichage, couleur_theme, icone, site_officiel, version_supportee, structure_donnees)
SELECT 'myz', 'MYZ (Mutant Year Zero)', 'Year Zero Engine pour la survie post-apocalyptique', 'ACTIF', 6, '#2F4F4F', 'fa-radiation-alt', 'https://freeleaguepublishing.com/', 'Year Zero Engine', '{}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM systemes_jeu WHERE id = 'myz');

-- Mettre \u00e0 jour l'ordre d'affichage pour avoir une hi\u00e9rarchie coh\u00e9rente
UPDATE systemes_jeu SET ordre_affichage = 1 WHERE id = 'pbta';
UPDATE systemes_jeu SET ordre_affichage = 2 WHERE id = 'engrenages';
UPDATE systemes_jeu SET ordre_affichage = 3 WHERE id = 'mistengine';
UPDATE systemes_jeu SET ordre_affichage = 4 WHERE id = 'myz';
UPDATE systemes_jeu SET ordre_affichage = 5 WHERE id = 'zombiology';