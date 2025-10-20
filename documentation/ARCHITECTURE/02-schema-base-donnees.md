# Schéma de Base de Données MVP - Brumisater v1.0

## Vue d'Ensemble

Le schéma MVP supporte le Mist Engine (LITM, City of Mist) avec 10 modèles principaux organisés autour du concept de **Playspace** (contexte de jeu isolé par joueur).

### Architecture Globale

```
User (Authentification)
└── Playspaces[] (Contextes de jeu isolés)
    ├── Characters[] (Personnages joueurs)
    │   ├── ThemeCards[] (Cartes de thème Mythos/Logos)
    │   │   └── Tags[] (Power/Weakness tags)
    │   ├── HeroCard (Carte de héros)
    │   ├── Relationships[] (Relations entre personnages)
    │   └── Statuses[] (Statuts temporaires)
    └── Dangers[] (Adversaires/PNJ du MJ)
```

### Tables Créées

1. **users** - Utilisateurs avec authentification
2. **playspaces** - Contextes de jeu isolés
3. **characters** - Personnages joueurs (Player Characters)
4. **theme_cards** - Cartes de thème (Mythos/Logos)
5. **tags** - Tags polymorphiques (power/weakness/story)
6. **hero_cards** - Cartes de héros
7. **relationships** - Relations entre personnages
8. **statuses** - Statuts temporaires
9. **dangers** - Adversaires/PNJ du MJ (Mist Engine)
10. **Enums** : ThemeCardType, TagType

---

## Modèles

### User (Table: `users`)

**Rôle**: Authentification et ownership des playspaces.

**Schéma**:
```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  password_hash String
  name          String?
  avatar_url    String?

  created_at    DateTime  @default(now())
  updated_at    DateTime  @updatedAt
  last_login    DateTime?

  playspaces    Playspace[]

  @@index([email])
  @@map("users")
}
```

**Points clés**:
- ID de type CUID (Collision-resistant Unique ID)
- Email unique indexé pour performance des requêtes de connexion
- Relations : 1 User → N Playspaces
- Mapping vers table `users` (convention snake_case)

---

### Playspace (Table: `playspaces`)

**Rôle**: Contexte de jeu isolé. Chaque joueur peut avoir plusieurs playspaces (ex: campagne 1, campagne 2, one-shot).

**Schéma**:
```prisma
model Playspace {
  id          String   @id @default(cuid())
  name        String
  description String?  @db.Text

  user_id     String
  system_id   String   // "litm", "city-of-mist", etc.
  hack_id     String?  // Future : "cyberpunk-city", etc.

  settings    Json     @default("{}")  // Configuration playspace

  created_at  DateTime @default(now())
  updated_at  DateTime @updatedAt

  user       User        @relation(fields: [user_id], references: [id], onDelete: Cascade)
  characters Character[]

  @@index([user_id])
  @@index([system_id])
  @@map("playspaces")
}
```

**Points clés**:
- Isolation des données par playspace (MVP : 1 joueur solo)
- `system_id` : identifie le système de jeu ("litm", "city-of-mist")
- `hack_id` : identifie le hack (pour Phase 2+)
- `settings` : JSON pour configuration flexible (langue, règles maison, etc.)
- Cascade delete : Suppression User → supprime ses Playspaces
- Index sur `user_id` et `system_id` pour performance

---

### Character (Table: `characters`)

**Rôle**: Personnage central du système LITM.

**Schéma**:
```prisma
model Character {
  id             String   @id @default(cuid())
  playspace_id   String

  name           String
  pronouns       String?
  mythos         String?  @db.Text
  logos          String?  @db.Text
  crew           String?  @db.Text

  improvement_tracker Json  @default("[]")  // Array de bools
  crack_tracker       Json  @default("[]")  // Array de bools

  created_at     DateTime @default(now())
  updated_at     DateTime @updatedAt

  playspace      Playspace      @relation(fields: [playspace_id], references: [id], onDelete: Cascade)
  theme_cards    ThemeCard[]
  hero_card      HeroCard?
  relationships  Relationship[]
  statuses       Status[]

  @@index([playspace_id])
  @@map("characters")
}
```

**Points clés**:
- Lié à un Playspace (cascade delete : suppression Playspace → supprime Characters)
- `mythos`, `logos`, `crew` : textes libres pour la narration
- Trackers stockés en JSON pour flexibilité (arrays de booléens)
- Relations : 1 Character → N ThemeCards, 1 HeroCard, N Relationships, N Statuses

---

### ThemeCard (Table: `theme_cards`)

**Rôle**: Cartes de thème (Mythos ou Logos) du personnage LITM.

**Schéma**:
```prisma
enum ThemeCardType {
  MYTHOS
  LOGOS
}

model ThemeCard {
  id            String        @id @default(cuid())
  character_id  String

  type          ThemeCardType
  title         String
  mystery       String?       @db.Text

  attention     Int           @default(0)  // 0-3
  fade          Int           @default(0)  // 0-3

  locked        Boolean       @default(false)

  created_at    DateTime      @default(now())
  updated_at    DateTime      @updatedAt

  character     Character     @relation(fields: [character_id], references: [id], onDelete: Cascade)
  tags          Tag[]

  @@index([character_id])
  @@index([type])
  @@map("theme_cards")
}
```

**Points clés**:
- Enum `ThemeCardType` : MYTHOS ou LOGOS
- `attention` et `fade` : trackers 0-3
- `locked` : carte verrouillée (non modifiable)
- Relation : 1 ThemeCard → N Tags

---

### Tag (Table: `tags`)

**Rôle**: Tags polymorphiques (power/weakness/story) attachés aux cartes de thème.

**Schéma**:
```prisma
enum TagType {
  POWER
  WEAKNESS
  STORY
}

model Tag {
  id            String      @id @default(cuid())
  theme_card_id String?     // Nullable car STORY tags peuvent être sur Character
  character_id  String?     // Pour STORY tags globaux

  type          TagType
  name          String
  burned        Boolean     @default(false)
  temporary     Boolean     @default(false)

  created_at    DateTime    @default(now())

  theme_card    ThemeCard?  @relation(fields: [theme_card_id], references: [id], onDelete: Cascade)

  @@index([theme_card_id])
  @@index([character_id])
  @@index([type])
  @@map("tags")
}
```

**Points clés**:
- Enum `TagType` : POWER, WEAKNESS, STORY
- Polymorphique : peut être lié à ThemeCard OU Character
- `burned` : tag brûlé (utilisé une fois)
- `temporary` : tag temporaire (sera supprimé)

---

### HeroCard (Table: `hero_cards`)

**Rôle**: Carte centrale du héros (relation 1:1 avec Character).

**Schéma**:
```prisma
model HeroCard {
  id               String    @id @default(cuid())
  character_id     String    @unique

  defining_trait   String?
  defining_relationship String?
  mission          String?   @db.Text

  quintessence     Json      @default("[]")  // Array d'items {name, burned}
  backpack         Json      @default("[]")  // Array d'items {name}

  hurt             Int       @default(0)  // 0-5
  story_tracker    Json      @default("[]")  // Array de bools

  created_at       DateTime  @default(now())
  updated_at       DateTime  @updatedAt

  character        Character @relation(fields: [character_id], references: [id], onDelete: Cascade)

  @@map("hero_cards")
}
```

**Points clés**:
- Relation 1:1 avec Character (`character_id` unique)
- `quintessence` et `backpack` : stockés en JSON pour flexibilité
- `hurt` : tracker 0-5
- `story_tracker` : array de booléens en JSON

---

### Relationship (Table: `relationships`)

**Rôle**: Relations narratives entre personnages.

**Schéma**:
```prisma
model Relationship {
  id           String    @id @default(cuid())
  character_id String

  name         String
  description  String?   @db.Text

  created_at   DateTime  @default(now())
  updated_at   DateTime  @updatedAt

  character    Character @relation(fields: [character_id], references: [id], onDelete: Cascade)

  @@index([character_id])
  @@map("relationships")
}
```

**Points clés**:
- Lié à un Character (1 personnage → N relations)
- `name` : nom de la relation (ex: "Ma soeur")
- `description` : détails narratifs

---

### Status (Table: `statuses`)

**Rôle**: Statuts temporaires du personnage (blessures, conditions, etc.).

**Schéma**:
```prisma
model Status {
  id           String    @id @default(cuid())
  character_id String

  name         String
  tier         Int       // 1-6 (spectrum)
  positive     Boolean   @default(true)

  created_at   DateTime  @default(now())
  expires_at   DateTime?

  character    Character @relation(fields: [character_id], references: [id], onDelete: Cascade)

  @@index([character_id])
  @@map("statuses")
}
```

**Points clés**:
- `tier` : niveau du statut (1-6, spectrum)
- `positive` : statut positif ou négatif
- `expires_at` : expiration optionnelle

---

### Danger (Table: `dangers`)

**Rôle**: Adversaires et PNJ du MJ (Mist Engine - LITM, City of Mist).

**Schéma**:
```prisma
model Danger {
  id           String @id @default(cuid())
  playspace_id String

  name        String
  description String? @db.Text
  tier        Int // 1-6 (spectrum Danger)

  power_tags    Json @default("[]") // Array de {name, burned, temporary}
  weakness_tags Json @default("[]") // Array de {name, burned, temporary}

  notes String? @db.Text // Notes MJ

  created_at DateTime @default(now())
  updated_at DateTime @updatedAt

  playspace Playspace @relation(fields: [playspace_id], references: [id], onDelete: Cascade)

  @@index([playspace_id])
  @@index([tier])
  @@map("dangers")
}
```

**Points clés**:
- Lié à un Playspace (1 playspace → N dangers)
- `tier` : niveau du Danger (1-6, spectrum)
- Tags stockés en JSON (structure : `{name, burned, temporary}`)
- Pas de Hero Card ni de Theme Cards (structure simplifiée)
- `notes` : notes privées du MJ
- Index sur `tier` pour filtrer par niveau de danger

**Différences avec Character**:
- Pas de Theme Cards (Mythos/Logos)
- Pas de Hero Card
- Pas de Relationships
- Tags directement en JSON (plus simple)
- Spectrum unique (`tier`) au lieu de multiples trackers

---

## Diagramme de Relations

```
User
│
├─► Playspace (1:N)
    │
    ├─► Character (1:N)
    │   │
    │   ├─► ThemeCard (1:N)
    │   │   └─► Tag (1:N)
    │   │
    │   ├─► HeroCard (1:1)
    │   │
    │   ├─► Relationship (1:N)
    │   │
    │   └─► Status (1:N)
    │
    └─► Danger (1:N)
```

---

## Choix Techniques

### JSON vs Tables Dédiées

**Choix : JSON pour les données structurées simples**

**Pourquoi JSON ?**
- Trackers (`improvement_tracker`, `crack_tracker`, `story_tracker`) : arrays de booléens, structure simple
- Quintessence/Backpack : listes d'items avec peu de requêtes complexes
- Settings Playspace : configuration flexible (langue, règles maison, etc.)

**Pourquoi Tables ?**
- ThemeCards, Tags, Relationships, Statuses : requêtes complexes, filtres, relations

**Alternative rejetée** : Tables dédiées pour trackers (sur-ingénierie pour MVP)

---

### Cascade Delete

**Configuration**:
- Suppression User → supprime Playspaces → supprime Characters → supprime tout le reste
- Garantit cohérence des données (pas de "personnages orphelins")

**Avantage** : Simplicité pour l'utilisateur (1 clic pour tout supprimer)

**Attention** : Pas de soft delete pour MVP (données définitivement perdues)

---

### Index Optimisés

**Index créés** :
- `User.email` : requêtes de connexion
- `Playspace.user_id` : liste des playspaces d'un user
- `Playspace.system_id` : filtre par système de jeu
- `Character.playspace_id` : liste des personnages d'un playspace
- `ThemeCard.character_id` : cartes d'un personnage
- `ThemeCard.type` : filtre par type (Mythos/Logos)
- `Tag.theme_card_id` : tags d'une carte
- `Tag.type` : filtre par type (Power/Weakness/Story)
- `Relationship.character_id` : relations d'un personnage
- `Status.character_id` : statuts d'un personnage

**Objectif** : Performance optimale pour les requêtes MVP (<100ms)

---

### Conventions de Nommage

**Modèles** : PascalCase singulier (ex: `User`, `Playspace`, `Character`)

**Tables** : snake_case pluriel via `@@map()` (ex: `users`, `playspaces`, `characters`)

**Colonnes** : snake_case (ex: `user_id`, `created_at`, `password_hash`)

**Relations** : snake_case (même nom que colonne FK)

**Raison** : Cohérence avec conventions PostgreSQL et lisibilité

---

## Migration et Synchronisation

**Méthode utilisée** : `prisma db push` (pas de migrations)

**Raison** : Hébergement mutualisé (AlwaysData) ne permet pas de créer de shadow database

**Impact** :
- Pas d'historique de migrations
- Synchronisation directe schema ↔ base de données
- Idéal pour prototypage MVP

**Production** : À réévaluer pour système de migrations standard

---

## Notes de Compatibilité

### Tables Legacy

Le schéma MVP coexiste avec les tables legacy existantes :
- `utilisateurs` (ancien modèle User)
- `actualites`, `documents`, `pdfs`, `oracles`, etc.

**Stratégie** : Garder les tables legacy tant qu'elles ne gênent pas le MVP.

**Future migration** : Fusion progressive des données si nécessaire.

---

## Références

- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Prisma Relations](https://www.prisma.io/docs/concepts/components/prisma-schema/relations)
- `documentation/ARCHITECTURE/15-playspace-contexte-unique.md` - Concept Playspace
- `documentation/DEVELOPPEMENT/nomenclature-et-conventions.md` - Conventions nommage

---

## Prochaines Étapes

1. Générer le client Prisma TypeScript (bloqué par verrou fichier Windows)
2. Créer les stores Pinia (`playspace.ts`, `character.ts`)
3. Créer les composables (`usePlayspace.ts`, `useCharacter.ts`)
4. Implémenter les API Routes RESTful
5. Créer les composants Vue pour l'interface utilisateur

---

**Version** : 1.0 MVP
**Date** : 2025-01-20
**Auteur** : Claude (TASK-2025-01-20-000B)
