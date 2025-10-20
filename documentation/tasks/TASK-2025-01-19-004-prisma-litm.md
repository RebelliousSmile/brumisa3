# Task - Modèle de Données Prisma pour Characters Multi-Hacks

## Métadonnées

- **ID**: TASK-2025-01-19-004
- **Date de création**: 2025-01-20
- **Priorité**: P0 (MVP)
- **Statut**: À faire
- **Temps estimé**: 4h
- **Version cible**: MVP v1.0

## Description

### Objectif

Créer le schéma Prisma pour les personnages supportant l'architecture **Système → Hack → Univers** avec le Playspace comme contexte unique.

### Contexte

Les personnages sont toujours créés dans le contexte d'un **Playspace** qui détermine :
- Le **hack** utilisé (LITM, Otherscape, City of Mist)
- L'**univers** du setting (Zamanora, HOR, Tokyo, Cairo)
- Les **mécaniques** disponibles (ThemeCards pour LITM, Protocols pour Otherscape)

### Périmètre

**Inclus dans cette tâche**:
- Modèles de base : User, Playspace, Character
- Modèles LITM : ThemeCard, HeroCard, Tracker, Tag, Quest
- Relations avec cascade delete
- Indexes pour performance

**Exclu de cette tâche**:
- Modèles Otherscape (Post-MVP)
- Modèles City of Mist (Post-MVP)
- Interface d'édition

## Architecture

### Hiérarchie des Modèles

```
User
  └─> Playspace (contexte unique)
        ├─> hack (LITM, Otherscape, etc.)
        ├─> universe (Zamanora, HOR, etc.)
        └─> Characters[]
              ├─> HeroCard (si LITM)
              ├─> ThemeCards[] (si LITM)
              └─> Trackers[]
```

### Modèles Prisma

```prisma
// ============================================
// MODÈLES DE BASE (Tous Hacks)
// ============================================

model User {
  id          String      @id @default(cuid())
  email       String?     @unique
  name        String?
  isGuest     Boolean     @default(false)

  playspaces  Playspace[]

  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
}

model System {
  id          String      @id @default(cuid())
  slug        String      @unique // "mist-engine"
  name        String
  description String?

  hacks       Hack[]

  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
}

model Hack {
  id          String      @id @default(cuid())
  slug        String      @unique // "litm", "otherscape", "city-of-mist"
  name        String
  description String?

  systemId    String
  system      System      @relation(fields: [systemId], references: [id])

  universes   Universe[]
  playspaces  Playspace[]

  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  @@index([systemId])
}

model Universe {
  id          String      @id @default(cuid())
  slug        String      @unique // "zamanora", "hor", "tokyo", "cairo"
  name        String
  description String?

  hackId      String
  hack        Hack        @relation(fields: [hackId], references: [id])

  playspaces  Playspace[]

  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  @@index([hackId])
}

model Playspace {
  id          String      @id @default(cuid())
  name        String
  description String?

  userId      String
  user        User        @relation(fields: [userId], references: [id], onDelete: Cascade)

  hackId      String
  hack        Hack        @relation(fields: [hackId], references: [id])

  universeId  String?
  universe    Universe?   @relation(fields: [universeId], references: [id])

  characters  Character[]

  isActive    Boolean     @default(true)
  lastUsedAt  DateTime    @default(now())

  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  @@index([userId])
  @@index([hackId])
  @@index([universeId])
}

model Character {
  id          String      @id @default(cuid())
  name        String
  description String?

  playspaceId String
  playspace   Playspace   @relation(fields: [playspaceId], references: [id], onDelete: Cascade)

  // Données polymorphiques selon le hack
  heroCard    HeroCard?   // Pour LITM
  themeCards  ThemeCard[]
  trackers    Tracker[]

  // Metadata
  order       Int         @default(0)
  isArchived  Boolean     @default(false)

  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  @@index([playspaceId])
}

// ============================================
// MODÈLES SPÉCIFIQUES LITM
// ============================================

model HeroCard {
  id          String      @id @default(cuid())

  characterId String      @unique
  character   Character   @relation(fields: [characterId], references: [id], onDelete: Cascade)

  relationships Relationship[]
  quintessences String[]  // Simple array
  backpackItems String[]  // Simple array

  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
}

model ThemeCard {
  id          String      @id @default(cuid())

  characterId String
  character   Character   @relation(fields: [characterId], references: [id], onDelete: Cascade)

  type        ThemeCardType  // CHARACTER, FELLOWSHIP
  category    ThemeCategory  // ORIGIN, ADVENTURE, GREATNESS
  themebook   String         // Nom du livre de thème
  mainTag     String

  powerTags   Tag[]       @relation("PowerTags")
  weaknessTags Tag[]      @relation("WeaknessTags")

  quest       Quest?
  improvements String[]   // Array des améliorations

  order       Int         @default(0)

  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  @@index([characterId])
}

model Tag {
  id          String      @id @default(cuid())
  content     String
  type        TagType     // POWER, WEAKNESS

  // Relations polymorphiques pour les tags
  powerCards  ThemeCard[] @relation("PowerTags")
  weaknessCards ThemeCard[] @relation("WeaknessTags")

  order       Int         @default(0)

  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
}

model Quest {
  id          String      @id @default(cuid())

  themeCardId String      @unique
  themeCard   ThemeCard   @relation(fields: [themeCardId], references: [id], onDelete: Cascade)

  content     String      @db.Text
  pips        Int         @default(0) // 0-4 progression
  maxPips     Int         @default(4)

  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
}

model Tracker {
  id          String      @id @default(cuid())

  characterId String
  character   Character   @relation(fields: [characterId], references: [id], onDelete: Cascade)

  type        TrackerType // STATUS, STORY_TAG, STORY_THEME
  name        String
  pips        Int         @default(0)
  maxPips     Int         @default(4)

  order       Int         @default(0)

  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  @@index([characterId])
}

model Relationship {
  id          String      @id @default(cuid())

  heroCardId  String
  heroCard    HeroCard    @relation(fields: [heroCardId], references: [id], onDelete: Cascade)

  companionName String
  relation    String      // Type de relation

  order       Int         @default(0)

  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  @@index([heroCardId])
}

// ============================================
// ENUMS
// ============================================

enum ThemeCardType {
  CHARACTER
  FELLOWSHIP
}

enum ThemeCategory {
  ORIGIN
  ADVENTURE
  GREATNESS
}

enum TagType {
  POWER
  WEAKNESS
}

enum TrackerType {
  STATUS
  STORY_TAG
  STORY_THEME
}

// ============================================
// MODÈLE TRADUCTIONS (depuis TASK-001)
// ============================================

model TranslationEntry {
  id          String      @id @default(cuid())
  key         String
  value       String      @db.Text
  locale      String
  category    TranslationCategory
  description String?     @db.Text

  level       TranslationLevel
  priority    Int

  systemId    String?
  hackId      String?
  universeId  String?

  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  @@unique([key, locale, level, systemId, hackId, universeId])
  @@index([key, locale])
  @@index([level, priority])
}

enum TranslationLevel {
  SYSTEM
  HACK
  UNIVERSE
}

enum TranslationCategory {
  CHARACTER
  PLAYSPACE
  GAME_MECHANICS
  UI
  THEMES
  MOVES
  STATUSES
}
```

## Plan d'Implémentation

### Étape 1: Création du Schema

- [ ] Créer/mettre à jour `prisma/schema.prisma`
- [ ] Ajouter les modèles de base (User, System, Hack, Universe, Playspace)
- [ ] Ajouter les modèles Character et LITM
- [ ] Ajouter les enums

### Étape 2: Seed Data

```typescript
// prisma/seed.ts
async function seed() {
  // Créer le système Mist Engine
  const mistEngine = await prisma.system.create({
    data: {
      slug: 'mist-engine',
      name: 'Mist Engine',
      hacks: {
        create: [
          {
            slug: 'litm',
            name: 'Legends in the Mist',
            universes: {
              create: [
                { slug: 'zamanora', name: 'Zamanora' },
                { slug: 'hor', name: 'Hearts of Ravensdale' }
              ]
            }
          },
          {
            slug: 'otherscape',
            name: 'Otherscape',
            universes: {
              create: [
                { slug: 'tokyo', name: 'Tokyo' },
                { slug: 'cairo', name: 'Cairo' }
              ]
            }
          }
        ]
      }
    }
  });

  console.log('✅ Seed data created');
}
```

### Étape 3: Migration

```bash
# Créer la migration
pnpm prisma migrate dev --name init_character_models

# Générer le client
pnpm prisma generate

# Exécuter le seed
pnpm prisma db seed
```

### Étape 4: Tests de Validation

```typescript
// tests/models/character.test.ts
test('Create character with playspace context', async () => {
  // Créer un utilisateur
  const user = await prisma.user.create({
    data: { email: 'test@example.com' }
  });

  // Créer un playspace LITM/Zamanora
  const playspace = await prisma.playspace.create({
    data: {
      name: 'Ma Partie Zamanora',
      userId: user.id,
      hackId: 'litm-id',
      universeId: 'zamanora-id'
    }
  });

  // Créer un personnage dans ce playspace
  const character = await prisma.character.create({
    data: {
      name: 'Elara',
      playspaceId: playspace.id,
      heroCard: {
        create: {
          backpackItems: ['Épée', 'Potion']
        }
      },
      themeCards: {
        create: [{
          type: 'CHARACTER',
          category: 'ORIGIN',
          themebook: 'Nobility',
          mainTag: 'Noble Blood'
        }]
      }
    },
    include: {
      playspace: {
        include: {
          hack: true,
          universe: true
        }
      },
      heroCard: true,
      themeCards: true
    }
  });

  // Vérifications
  expect(character.playspace.hack.slug).toBe('litm');
  expect(character.playspace.universe?.slug).toBe('zamanora');
  expect(character.heroCard).toBeDefined();
  expect(character.themeCards).toHaveLength(1);
});
```

## Critères d'Acceptation

- [ ] Schema Prisma créé avec tous les modèles
- [ ] Relations correctement définies
- [ ] Cascade delete fonctionne
- [ ] Migration appliquée sans erreur
- [ ] Seed data créées (systèmes, hacks, univers)
- [ ] Tests de création/suppression passent
- [ ] Performance optimale avec indexes
- [ ] Support multi-hacks prêt (extensible)

## Dépendances

- **Bloque**: Toutes les tâches de création de personnage (TASK-005 à TASK-010)
- **Indépendant de**: Système de traductions (TASK-001/002/003)

## Notes

Cette approche permet :
- Support de multiples hacks/univers
- Playspace comme contexte unique
- Extension facile pour Otherscape/City of Mist
- Performance optimale avec indexes appropriés

## Références

- [Architecture Playspace](../ARCHITECTURE/15-playspace-contexte-unique.md)
- [Glossaire Système/Hack/Univers](../ARCHITECTURE/00-GLOSSAIRE.md)
- [Prisma Relations](https://www.prisma.io/docs/concepts/components/prisma-schema/relations)