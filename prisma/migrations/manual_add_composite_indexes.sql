-- Migration Manuelle: Ajout Indexes Composites
-- Date: 2025-11-13
-- Description: Ajout d'indexes composites pour optimiser les queries avec ORDER BY et filtres

-- ThemeCard: Index composite pour queries avec ORDER BY createdAt
CREATE INDEX IF NOT EXISTS "theme_cards_characterId_createdAt_idx"
ON "theme_cards" ("characterId", "createdAt");

-- Tag: Index composite pour filtres par themeCardId ET type
CREATE INDEX IF NOT EXISTS "tags_themeCardId_type_idx"
ON "tags" ("themeCardId", "type");

-- Analyse des tables après ajout indexes
ANALYZE theme_cards;
ANALYZE tags;
