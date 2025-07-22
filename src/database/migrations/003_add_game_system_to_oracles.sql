-- Migration 003: Ajouter la colonne game_system aux oracles
-- Date: 2025-07-22
-- Description: Ajoute la colonne game_system pour catégoriser les oracles par système de jeu

-- Ajouter la colonne game_system
ALTER TABLE oracles 
ADD COLUMN IF NOT EXISTS game_system VARCHAR(50);

-- Index pour optimiser les requêtes par système
CREATE INDEX IF NOT EXISTS idx_oracles_game_system ON oracles(game_system);

-- Mettre à jour les oracles existants pour Monsterhearts
UPDATE oracles 
SET game_system = 'monsterhearts' 
WHERE name IN (
    'Révélations - Monsterhearts',
    'Relations Intimes - Monsterhearts',
    'Monstruosités Cachées - Monsterhearts',
    'Événements Dramatiques - Monsterhearts'
);