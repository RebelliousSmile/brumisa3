# Modèle de Données Prisma - Legends in the Mist

## Vue d'ensemble

Schéma Prisma inspiré de l'architecture Actor-Item de FoundryVTT, adapté pour PostgreSQL avec les meilleures pratiques de notre stack Nuxt 4.

## Principes de Design

### 1. Hiérarchie des Entités
```
User (Joueur)
  └─ Character (Personnage/Danger/Crew)
      ├─ Theme (Mythos/Logos/Mist/Bastion)
      │   ├─ Tag (Power/Weakness/Story/Loadout)
      │   └─ Improvement (Amélioration du thème)
      ├─ Status (Statut temporaire)
      ├─ Move (Action du personnage)
      └─ RollHistory (Historique des jets)
```

### 2. Performance First
- Index sur les colonnes fréquemment requêtées
- Relations optimisées avec `@relation`
- Pas de cascade delete (contrôle explicite)
- Types enum PostgreSQL pour performance

### 3. Extensibilité
- JSON pour données flexibles (character metadata)
- Système de types extensible (enum)
- Support multi-jeux (City of Mist, Legends in the Mist, Otherscape)

## Schéma Prisma Complet

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================================================
// USERS & AUTHENTICATION
// ============================================================================

model User {
  id            String      @id @default(cuid())
  email         String      @unique
  name          String?
  passwordHash  String

  characters    Character[]
  sessions      Session[]

  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  @@index([email])
}

model Session {
  id           String   @id @default(cuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  token        String   @unique
  expiresAt    DateTime

  createdAt    DateTime @default(now())

  @@index([userId])
  @@index([token])
  @@index([expiresAt])
}

// ============================================================================
// GAME SYSTEM
// ============================================================================

enum GameSystem {
  CITY_OF_MIST      // City of Mist
  LEGENDS_IN_MIST   // Legends in the Mist
  OTHERSCAPE        // Otherscape
}

// ============================================================================
// CHARACTERS (Actor equivalent)
// ============================================================================

enum CharacterType {
  PLAYER      // Personnage joueur
  DANGER      // Danger/Menace/Threat
  CREW        // Crew theme (partagé)
  EXTRA       // Extra theme
}

model Character {
  id              String          @id @default(cuid())
  userId          String
  user            User            @relation(fields: [userId], references: [id], onDelete: Cascade)

  name            String
  type            CharacterType   @default(PLAYER)
  gameSystem      GameSystem      @default(LEGENDS_IN_MIST)

  // Métadonnées flexibles (avatar, description, etc.)
  avatar          String?
  description     String?         @db.Text
  metadata        Json?           // Pour données custom extensibles

  // Statistiques LitM
  buildUp         Int             @default(0)  // Points de build-up

  // Relations
  themes          Theme[]
  statuses        Status[]
  moves           Move[]
  rollHistory     RollHistory[]
  heroCards       HeroCard[]      // LitM specific
  themeCards      ThemeCard[]     // LitM specific
  trackers        Tracker[]       // LitM specific

  // Timestamps
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  @@index([userId])
  @@index([type])
  @@index([gameSystem])
}

// ============================================================================
// THEMES
// ============================================================================

enum ThemeType {
  MYTHOS          // Thème Mythos (City of Mist)
  LOGOS           // Thème Logos (City of Mist)
  MIST            // Thème Mist (Otherscape)
  BASTION         // Thème Bastion (Otherscape)
  LEGEND_ORIGIN   // Origin (Legends in the Mist)
  LEGEND_ADVENTURE // Adventure (Legends in the Mist)
  LEGEND_GREATNESS // Greatness (Legends in the Mist)
}

model Theme {
  id              String        @id @default(cuid())
  characterId     String
  character       Character     @relation(fields: [characterId], references: [id], onDelete: Cascade)

  name            String        // Nom du thème
  type            ThemeType
  themebookId     String?       // Référence au themebook (optionnel)

  // Progression
  attention       Int           @default(0)  // Points d'attention
  crack           Int           @default(0)  // Fissures (Logos) ou Fade (Mythos)

  // Mystery/Identity pour City of Mist
  mystery         String?       @db.Text
  identity        String?       @db.Text

  // Relationships
  tags            Tag[]
  improvements    Improvement[]

  // Timestamps
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  @@index([characterId])
  @@index([type])
}

// ============================================================================
// TAGS
// ============================================================================

enum TagType {
  POWER           // Power tag
  WEAKNESS        // Weakness tag
  STORY           // Story tag
  LOADOUT         // Loadout tag (City of Mist)
  HERO_TAG        // Hero tag (LitM)
}

model Tag {
  id              String    @id @default(cuid())
  themeId         String?   // Peut être null pour story tags globaux
  theme           Theme?    @relation(fields: [themeId], references: [id], onDelete: Cascade)

  characterId     String?   // Pour tags globaux (story tags)

  name            String
  type            TagType

  // Tag question (pour les power tags)
  question        String?   @db.Text

  // État du tag
  burned          Boolean   @default(false)
  temporary       Boolean   @default(false)  // Tag temporaire (disparaît après usage)

  // Métadonnées
  subtags         String[]  // Sub-tags ou aspects

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@index([themeId])
  @@index([characterId])
  @@index([type])
  @@index([burned])
}

// ============================================================================
// IMPROVEMENTS
// ============================================================================

enum ImprovementType {
  CORE_MOVE       // Amélioration de core move
  ATTENTION       // Amélioration standard
  THEME_KIT       // Kit de thème
  FLASHBACK       // Flashback
  STORY_TAG       // Story tag permanent
  LOADOUT_TAG     // Loadout tag
  HELP_HURT       // Help & Hurt
  CUSTOM          // Amélioration custom
}

model Improvement {
  id              String          @id @default(cuid())
  themeId         String
  theme           Theme           @relation(fields: [themeId], references: [id], onDelete: Cascade)

  name            String
  type            ImprovementType
  description     String?         @db.Text

  // Compteurs d'usage
  maxUses         Int?            // Nombre d'utilisations max (null = illimité)
  currentUses     Int             @default(0)

  // État
  active          Boolean         @default(true)
  depleted        Boolean         @default(false)

  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  @@index([themeId])
  @@index([type])
}

// ============================================================================
// STATUSES
// ============================================================================

enum StatusType {
  PHYSICAL        // Statut physique
  MENTAL          // Statut mental
  SOCIAL          // Statut social
  ENVIRONMENTAL   // Statut environnemental
  CUSTOM          // Statut custom
}

model Status {
  id              String      @id @default(cuid())
  characterId     String?     // Peut être sur personnage ou scène
  character       Character?  @relation(fields: [characterId], references: [id], onDelete: Cascade)

  name            String
  type            StatusType  @default(CUSTOM)
  tier            Int         @default(1)     // 1-6 généralement

  // Polarité (-1, 0, +1)
  // -1 = négatif (malus), 0 = neutre, +1 = positif (bonus)
  polarity        Int         @default(0)

  // Temporary vs permanent
  temporary       Boolean     @default(true)

  // Description
  description     String?     @db.Text

  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  @@index([characterId])
  @@index([type])
  @@index([temporary])
}

// ============================================================================
// MOVES
// ============================================================================

enum MoveCategory {
  CORE_MOVE       // Core move (système)
  CHARACTER_MOVE  // Move spécifique au personnage
  GM_MOVE         // GM move
  HARD_MOVE       // Hard move (Otherscape)
  SOFT_MOVE       // Soft move (Otherscape)
  INTRUSION       // Intrusion (Otherscape)
}

model Move {
  id              String        @id @default(cuid())
  characterId     String?       // Null si c'est un core move
  character       Character?    @relation(fields: [characterId], references: [id], onDelete: Cascade)

  name            String
  category        MoveCategory  @default(CORE_MOVE)

  description     String        @db.Text

  // Outcomes possibles
  outcomes        Json?         // Structure: { hit: string, partial: string, miss: string }

  // Dynamite move flag
  isDynamite      Boolean       @default(false)

  // Ordre d'affichage
  order           Int           @default(0)

  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  @@index([characterId])
  @@index([category])
}

// ============================================================================
// ROLL HISTORY
// ============================================================================

enum RollOutcome {
  CRITICAL_SUCCESS  // 12+ avec dynamite
  SUCCESS           // 10+
  PARTIAL_SUCCESS   // 7-9
  FAILURE           // 6-
}

model RollHistory {
  id              String        @id @default(cuid())
  characterId     String
  character       Character     @relation(fields: [characterId], references: [id], onDelete: Cascade)

  // Données du jet
  die1            Int           // Premier dé (1-6)
  die2            Int           // Deuxième dé (1-6)
  diceTotal       Int           // Somme des dés

  modifiers       Int           // Total des modificateurs
  finalTotal      Int           // Total final (dés + modifs)

  outcome         RollOutcome

  // Contexte
  moveId          String?       // Move utilisé (optionnel)
  moveName        String?       // Nom du move

  // Tags et statuts utilisés
  tagsUsed        Json?         // Array d'IDs de tags
  statusesUsed    Json?         // Array d'IDs de statuts

  // Flags
  wasDynamite     Boolean       @default(false)
  tagsBurned      String[]      // IDs des tags brûlés

  // Notes
  notes           String?       @db.Text

  timestamp       DateTime      @default(now())

  @@index([characterId])
  @@index([timestamp])
  @@index([outcome])
}

// ============================================================================
// LEGENDS IN THE MIST SPECIFIC
// ============================================================================

enum HeroCardType {
  ORIGIN
  ADVENTURE
  GREATNESS
}

model HeroCard {
  id              String        @id @default(cuid())
  characterId     String
  character       Character     @relation(fields: [characterId], references: [id], onDelete: Cascade)

  type            HeroCardType
  name            String
  description     String?       @db.Text

  // Attributs spécifiques
  aspects         String[]      // Liste d'aspects
  tags            String[]      // Tags de la carte

  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  @@index([characterId])
  @@index([type])
}

model ThemeCard {
  id              String    @id @default(cuid())
  characterId     String
  character       Character @relation(fields: [characterId], references: [id], onDelete: Cascade)

  name            String
  category        String    // Origin/Adventure/Greatness
  power           String
  weakness        String

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@index([characterId])
}

enum TrackerType {
  BUILD_UP
  JUICE
  LUCK
  CUSTOM
}

model Tracker {
  id              String        @id @default(cuid())
  characterId     String
  character       Character     @relation(fields: [characterId], references: [id], onDelete: Cascade)

  name            String
  type            TrackerType

  current         Int           @default(0)
  max             Int           @default(5)

  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  @@index([characterId])
  @@index([type])
}

// ============================================================================
// THEMEBOOKS (Catalogue)
// ============================================================================

model Themebook {
  id              String    @id @default(cuid())

  name            String
  gameSystem      GameSystem
  type            ThemeType

  // Contenu pré-défini
  defaultTags     Json?     // Tags par défaut
  defaultMoves    Json?     // Moves par défaut

  description     String?   @db.Text

  // Métadonnées
  official        Boolean   @default(false)  // Themebook officiel ou homebrew

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@index([gameSystem])
  @@index([type])
}
```

## Optimisations de Performance

### 1. Index Critiques

```sql
-- Index pour requêtes fréquentes
CREATE INDEX idx_character_user ON "Character"("userId");
CREATE INDEX idx_character_type_system ON "Character"("type", "gameSystem");
CREATE INDEX idx_theme_character ON "Theme"("characterId");
CREATE INDEX idx_tag_theme_type ON "Tag"("themeId", "type");
CREATE INDEX idx_rollhistory_character_timestamp ON "RollHistory"("characterId", "timestamp" DESC);
```

### 2. Requêtes Optimisées

```typescript
// Charger un personnage complet (eager loading)
const character = await prisma.character.findUnique({
  where: { id: characterId },
  include: {
    themes: {
      include: {
        tags: {
          where: { burned: false } // Seulement les tags non brûlés
        },
        improvements: {
          where: { active: true }
        }
      }
    },
    statuses: {
      where: { temporary: true },
      orderBy: { tier: 'desc' }
    },
    rollHistory: {
      take: 10,
      orderBy: { timestamp: 'desc' }
    }
  }
});

// Requête avec pagination pour historique
const rolls = await prisma.rollHistory.findMany({
  where: { characterId },
  orderBy: { timestamp: 'desc' },
  skip: page * pageSize,
  take: pageSize
});
```

### 3. Éviter N+1 Queries

```typescript
// BAD - N+1 queries
const characters = await prisma.character.findMany();
for (const char of characters) {
  const themes = await prisma.theme.findMany({
    where: { characterId: char.id }
  }); // ❌ Une requête par personnage
}

// GOOD - Une seule requête
const characters = await prisma.character.findMany({
  include: {
    themes: true
  }
}); // ✅ Eager loading
```

## Migrations

### Migration Initiale

```bash
pnpm prisma migrate dev --name init
```

### Seed Data (Themebooks)

```typescript
// prisma/seed.ts
import { PrismaClient, GameSystem, ThemeType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Seed themebooks officiels LitM
  await prisma.themebook.createMany({
    data: [
      {
        name: 'The Prodigy',
        gameSystem: GameSystem.LEGENDS_IN_MIST,
        type: ThemeType.LEGEND_ORIGIN,
        official: true,
        description: 'You are naturally talented...',
        defaultTags: {
          power: ['Natural Talent', 'Quick Learner'],
          weakness: ['Overconfident', 'Inexperienced']
        }
      },
      {
        name: 'The Wanderer',
        gameSystem: GameSystem.LEGENDS_IN_MIST,
        type: ThemeType.LEGEND_ADVENTURE,
        official: true,
        description: 'You have traveled far...',
        defaultTags: {
          power: ['Well-Traveled', 'Adaptable'],
          weakness: ['Rootless', 'Haunted by the Past']
        }
      }
      // ... autres themebooks
    ]
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

## Prochaines Étapes

- Voir `03-architecture-composants-vue.md` pour l'intégration Vue
- Voir `04-api-routes-nitro.md` pour les API routes Prisma
