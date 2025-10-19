# Task - Modèle de données Prisma pour LITM

## Métadonnées

- **ID**: TASK-2025-01-19-004
- **Date de création**: 2025-01-19
- **Priorité**: Haute
- **Statut**: À faire
- **Temps estimé**: 4h

## Description

Créer le schéma Prisma pour les personnages "Legends in the Mist" : Character, ThemeCard, Tracker, Tag, Quest, Relationship, Quintessence.

## Modèles à créer

### LitmCharacter
```prisma
model LitmCharacter {
  id            String   @id @default(uuid())
  userId        String
  name          String
  game          String   @default("LEGENDS") // LEGENDS, CITY, OTHERSCAPE

  // Relations
  heroCard      LitmHeroCard?
  themeCards    LitmThemeCard[]
  trackers      LitmTracker[]

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([userId])
}
```

### LitmHeroCard
```prisma
model LitmHeroCard {
  id                String   @id @default(uuid())
  characterId       String   @unique
  character         LitmCharacter @relation(fields: [characterId], references: [id], onDelete: Cascade)

  relationships     LitmRelationship[]
  quintessences     LitmQuintessence[]
  backpackItems     String[] // Simple array for backpack

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}
```

### LitmThemeCard
```prisma
model LitmThemeCard {
  id            String   @id @default(uuid())
  characterId   String
  character     LitmCharacter @relation(fields: [characterId], references: [id], onDelete: Cascade)

  type          String   // "CHARACTER" | "FELLOWSHIP"
  themeType     String   // "Origin", "Adventure", "Greatness"
  themebook     String   // Nom du thème
  mainTag       String

  powerTags     LitmTag[] @relation("PowerTags")
  weaknessTags  LitmTag[] @relation("WeaknessTags")
  quest         LitmQuest?
  improvements  String[] // Array of improvement descriptions

  order         Int      @default(0) // Pour tri

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([characterId])
}
```

### LitmTag
```prisma
model LitmTag {
  id              String   @id @default(uuid())
  themeCardId     String
  content         String
  type            String   // "POWER" | "WEAKNESS"

  powerThemeCard  LitmThemeCard? @relation("PowerTags", fields: [themeCardId], references: [id], onDelete: Cascade)
  weaknessThemeCard LitmThemeCard? @relation("WeaknessTags", fields: [themeCardId], references: [id], onDelete: Cascade)

  order           Int      @default(0)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([themeCardId])
}
```

### LitmQuest
```prisma
model LitmQuest {
  id            String   @id @default(uuid())
  themeCardId   String   @unique
  themeCard     LitmThemeCard @relation(fields: [themeCardId], references: [id], onDelete: Cascade)

  content       String   @db.Text
  pips          Int      @default(0) // Points de progression (0-4)

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

### LitmTracker
```prisma
model LitmTracker {
  id            String   @id @default(uuid())
  characterId   String
  character     LitmCharacter @relation(fields: [characterId], references: [id], onDelete: Cascade)

  type          String   // "STATUS" | "STORY_TAG" | "STORY_THEME"
  name          String
  pips          Int      @default(0) // Points de progression
  maxPips       Int      @default(4)

  order         Int      @default(0)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([characterId])
}
```

### LitmRelationship
```prisma
model LitmRelationship {
  id            String   @id @default(uuid())
  heroCardId    String
  heroCard      LitmHeroCard @relation(fields: [heroCardId], references: [id], onDelete: Cascade)

  companionName String
  relation      String

  order         Int      @default(0)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([heroCardId])
}
```

### LitmQuintessence
```prisma
model LitmQuintessence {
  id            String   @id @default(uuid())
  heroCardId    String
  heroCard      LitmHeroCard @relation(fields: [heroCardId], references: [id], onDelete: Cascade)

  content       String

  order         Int      @default(0)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([heroCardId])
}
```

## Plan d'Implémentation

1. Ajouter les modèles au schema.prisma
2. Créer la migration: `pnpm prisma migrate dev --name litm_models`
3. Générer le client Prisma: `pnpm prisma generate`
4. Tester les relations en créant un personnage de test

## Critères d'Acceptation

- [ ] Tous les modèles sont créés
- [ ] Les relations fonctionnent correctement
- [ ] La migration s'applique sans erreur
- [ ] Les indexes sont optimisés
- [ ] Le cascade delete fonctionne

## Dépendances

Aucune task bloquante.

## Références

- [Prisma Relations](https://www.prisma.io/docs/concepts/components/prisma-schema/relations)
- [Prisma Cascading Deletes](https://www.prisma.io/docs/concepts/components/prisma-schema/relations/referential-actions)
