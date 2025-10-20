# Adaptation au MVP Réel Brumisa3 v1.0

## Clarification Hiérarchique

**Hiérarchie Système → Hack → Univers** :
- **Système** : Mist Engine (base commune)
- **Hack** : LITM, Otherscape (variantes mécaniques du Mist Engine)
  - LITM : Fantasy héroïque, quêtes épiques
  - Otherscape : Cyberpunk, réalités alternatives
- **Univers** : Settings narratifs spécifiques à chaque hack
  - LITM : Zamanora, HOR (Hearts of Ravensdale)
  - Otherscape : Tokyo:Otherscape, Cairo:2001

**Important** : LITM (Legends in the Mist) est un **hack du Mist Engine**, pas un système distinct.

## Scope MVP v1.0 vs Analyse Repositories

### Ce qui EST dans le MVP v1.0

| Fonctionnalité | Priorité | Source Inspiration | Adaptation Brumisa3 |
|----------------|----------|-------------------|---------------------|
| **Playspaces (Système + Hack + Univers)** | P0 | Concept unique Brumisa3 | CRUD complet, basculement rapide |
| **Characters LITM** | P0 | taragnor/city-of-mist | Adapté avec Prisma + Nuxt 4 |
| **Theme Cards** | P0 | taragnor/city-of-mist | Power/Weakness tags, Attention |
| **Hero Card** | P0 | taragnor/city-of-mist | Relations, Quintessences, Backpack |
| **Trackers** | P0 | taragnor/city-of-mist | Status, Story Tag, Story Theme |
| **Authentification** | P0 | - | @sidebase/nuxt-auth, mode guest |
| **Export JSON** | P0 | Altervayne/characters-of-the-mist | Format compatible |

### Ce qui N'EST PAS dans le MVP v1.0

| Fonctionnalité | Reporté Version | Raison |
|----------------|-----------------|--------|
| **Investigation Board** | v2.0 | Complexe (canvas interactif), pas critique pour MVP |
| **Oracles customs utilisateurs** | v1.2+ | MVP a des oracles fixes seulement |
| **Drawer System** | v1.4 | Organisation multi-personnages, nice-to-have |
| **Undo/Redo** | v1.1 | Amélioration UX, pas bloquant |
| **Multi-joueurs (WebSocket)** | v2.5 | Mode solo prioritaire MVP |
| **Export PDF** | v2.0 | PDFKit complexe, JSON suffit pour MVP |
| **Système de jets** | v1.3 | Mécaniques de jeu avancées |

## Pattern 1 : Architecture Actor-Item (FoundryVTT)

### Source
**Repository** : taragnor/city-of-mist (FoundryVTT)

**Pattern identifié** :
```typescript
// FoundryVTT
Actor (Character)
├── Items[] (Theme, Status, Tag)
└── Embedded Documents
```

### Adaptation Brumisa3 MVP

**Modèle Prisma** :
```prisma
// Hiérarchie relationnelle PostgreSQL
model Character {
  id          String      @id @default(uuid())
  name        String
  level       Int         @default(1)
  playspaceId String
  playspace   Playspace   @relation(fields: [playspaceId], references: [id], onDelete: Cascade)

  // Relations 1-N
  themeCards  ThemeCard[]
  heroCard    HeroCard?
  trackers    Trackers?

  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
}

model ThemeCard {
  id          String   @id @default(uuid())
  characterId String
  character   Character @relation(fields: [characterId], references: [id], onDelete: Cascade)

  themebook   String   // Référence au themebook LITM
  attention   Int      @default(0)
  fade        Int      @default(0)
  crack       Int      @default(0)

  powerTags   Tag[]    @relation("PowerTags")
  weaknessTags Tag[]   @relation("WeaknessTags")

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Tag {
  id              String    @id @default(uuid())
  themeCardId     String
  themeCard       ThemeCard @relation(fields: [themeCardId], references: [id], onDelete: Cascade)

  name            String
  type            TagType   // POWER, WEAKNESS
  isBurned        Boolean   @default(false)

  createdAt       DateTime  @default(now())
}

enum TagType {
  POWER
  WEAKNESS
}
```

**Différences clés** :
- FoundryVTT : Documents imbriqués (JSON-like)
- Brumisa3 : Relations SQL strictes avec cascade DELETE
- FoundryVTT : Pas de typage fort
- Brumisa3 : TypeScript + Prisma avec typage complet

## Pattern 2 : Undo/Redo (Zustand Temporal)

### Source
**Repository** : Altervayne/characters-of-the-mist

**Pattern identifié** :
```typescript
// Zustand + temporal middleware
import { temporal } from 'zundo';

const useStore = create(
  temporal((set) => ({
    character: {},
    updateCharacter: (data) => set({ character: data }),
  }))
);

// Usage
const { undo, redo } = useStore.temporal.getState();
```

### Adaptation Brumisa3 MVP

**Reporté en v1.1** (pas dans MVP)

**Raison** :
- Nice-to-have, pas critique pour fonctionnalité minimale
- Complexité ajoutée (gestion historique, rollback)
- MVP focus sur CRUD basique

**Implémentation future (v1.1)** :
```typescript
// Pinia + VueUse useRefHistory
import { useRefHistory } from '@vueuse/core';

// stores/character.ts
export const useCharacterStore = defineStore('character', () => {
  const character = ref<Character | null>(null);

  // VueUse pour historique
  const { history, undo, redo, canUndo, canRedo } = useRefHistory(character, {
    deep: true,
    capacity: 50, // Max 50 états
  });

  return { character, undo, redo, canUndo, canRedo };
});
```

## Pattern 3 : Sélection Tags avec Polarité

### Source
**Repository** : Altervayne/characters-of-the-mist

**Pattern identifié** :
```typescript
// Tag avec statut burn et polarité
interface Tag {
  id: string;
  name: string;
  type: 'power' | 'weakness';
  burned: boolean;
  temporary: boolean;
}

// Logique de jet avec tags
function rollDice(powerTags: Tag[], weaknessTags: Tag[]) {
  const bonus = powerTags.filter(t => !t.burned).length;
  const penalty = weaknessTags.filter(t => !t.burned).length;
  const roll = 2d6 + bonus - penalty;
  return roll;
}
```

### Adaptation Brumisa3 MVP

**API Route** :
```typescript
// server/api/characters/[id]/roll.post.ts
export default defineEventHandler(async (event) => {
  const { characterId } = event.context.params;
  const { powerTagIds, weaknessTagIds, moveId } = await readBody(event);

  // Récupérer les tags
  const powerTags = await prisma.tag.findMany({
    where: { id: { in: powerTagIds }, isBurned: false },
  });

  const weaknessTags = await prisma.tag.findMany({
    where: { id: { in: weaknessTagIds }, isBurned: false },
  });

  // Logique jet LITM
  const bonus = powerTags.length;
  const penalty = weaknessTags.length;

  const die1 = Math.floor(Math.random() * 6) + 1;
  const die2 = Math.floor(Math.random() * 6) + 1;
  const total = die1 + die2 + bonus - penalty;

  // Enregistrer en DB
  const roll = await prisma.rollHistory.create({
    data: {
      characterId,
      die1,
      die2,
      bonus,
      penalty,
      total,
      powerTagsUsed: powerTagIds,
      weaknessTagsUsed: weaknessTagIds,
    },
  });

  return { roll, outcome: determineOutcome(total) };
});
```

**Reporté en v1.3** pour le système de jets complet.

## Pattern 4 : Bibliothèque de Fichiers (Drawer System)

### Source
**Repository** : Altervayne/characters-of-the-mist

**Pattern identifié** :
```typescript
// Organisation en dossiers + fichiers
interface Folder {
  id: string;
  name: string;
  characters: Character[];
  subfolders: Folder[];
}

// Drag & drop entre dossiers
```

### Adaptation Brumisa3 MVP

**Reporté en v1.4** (pas dans MVP)

**Raison** :
- MVP : Liste simple de personnages par playspace
- Organisation avancée non critique
- Complexité drag & drop

**MVP (v1.0)** : Liste simple triée
```typescript
// composables/useCharacters.ts
export const useCharacters = () => {
  const characters = ref<Character[]>([]);

  const fetchCharacters = async (playspaceId: string) => {
    const data = await $fetch(`/api/playspaces/${playspaceId}/characters`, {
      query: {
        orderBy: 'updatedAt',
        order: 'desc',
      },
    });
    characters.value = data;
  };

  return { characters, fetchCharacters };
};
```

## Pattern 5 : Jets de Dés avec Historique

### Source
**Repository** : mikerees/litm-player

**Pattern identifié** :
```javascript
// Express + Socket.io
io.on('connection', (socket) => {
  socket.on('rollDice', (data) => {
    const result = rollDice(data.powerTags, data.weaknessTags);
    io.to(data.roomId).emit('rollResult', result);
  });
});
```

### Adaptation Brumisa3 MVP

**Reporté en v1.3** (système de jets) et **v2.5** (multi-joueurs WebSocket)

**MVP (v1.0)** : Pas de système de jets

**Raison** :
- Focus MVP sur création/gestion personnages
- Jets de dés = mécanique de jeu avancée
- WebSocket = mode multi-joueurs (v2.5)

**Implémentation future (v1.3)** :
```typescript
// API route sans WebSocket (mode solo)
// POST /api/characters/:id/roll

// Future (v2.5) : WebSocket Nitro
// server/websocket/rolls.ts
import { defineWebSocketHandler } from 'h3';

export default defineWebSocketHandler({
  open(peer) {
    console.log('Client connecté');
  },

  message(peer, message) {
    if (message.type === 'ROLL_DICE') {
      const result = executeDiceRoll(message.data);
      peer.send({ type: 'ROLL_RESULT', data: result });
    }
  },
});
```

## Pattern 6 : Investigation Board (FoundryVTT Module)

### Source
**Repository** : mordachai/investigation-board

**Pattern identifié** :
```javascript
// FoundryVTT Canvas Layer
class InvestigationBoardLayer extends CanvasLayer {
  // Notes sticky positionnées sur canvas
  // Drag & drop
  // Connexions entre notes
}
```

### Adaptation Brumisa3 MVP

**Reporté en v2.0** (pas dans MVP)

**Raison** :
- Complexité élevée (canvas interactif)
- Dépendance externe (Fabric.js ou Konva.js)
- Pas critique pour gestion personnages

**MVP (v1.0)** : Aucun Investigation Board

**Implémentation future (v2.0)** :
```typescript
// Nuxt 4 + Konva.js
// composables/useInvestigationBoard.ts
import Konva from 'konva';

export const useInvestigationBoard = () => {
  const stage = ref<Konva.Stage | null>(null);
  const layer = ref<Konva.Layer | null>(null);

  const initBoard = (containerId: string) => {
    stage.value = new Konva.Stage({
      container: containerId,
      width: window.innerWidth,
      height: window.innerHeight,
    });

    layer.value = new Konva.Layer();
    stage.value.add(layer.value);
  };

  const addNote = (text: string, x: number, y: number) => {
    const note = new Konva.Text({
      text,
      x,
      y,
      draggable: true,
    });
    layer.value?.add(note);
  };

  return { initBoard, addNote };
};
```

## Modèle de Données Prisma Complet (MVP v1.0)

### Schema Simplifié pour MVP

```prisma
// ===== AUTHENTIFICATION =====

model User {
  id          String      @id @default(uuid())
  email       String      @unique
  password    String      // Hashed
  name        String?

  playspaces  Playspace[]

  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
}

// ===== PLAYSPACES =====

model Playspace {
  id          String      @id @default(uuid())
  userId      String
  user        User        @relation(fields: [userId], references: [id], onDelete: Cascade)

  name        String
  systemId    String      // Référence Mist Engine
  hackId      String      // Référence LITM, Otherscape
  universeId  String      // Référence Chicago Noir, etc.

  isActive    Boolean     @default(false)

  characters  Character[]

  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  @@unique([userId, name])
  @@index([userId, isActive])
}

// ===== CHARACTERS =====

model Character {
  id           String      @id @default(uuid())
  name         String      @db.VarChar(100)
  description  String?     @db.Text
  avatarUrl    String?
  level        Int         @default(1)

  playspaceId  String
  playspace    Playspace   @relation(fields: [playspaceId], references: [id], onDelete: Cascade)

  userId       String

  themeCards   ThemeCard[]
  heroCard     HeroCard?
  trackers     Trackers?

  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt

  @@index([playspaceId, userId])
  @@index([updatedAt])
}

// ===== THEME CARDS =====

model ThemeCard {
  id           String    @id @default(uuid())
  characterId  String
  character    Character @relation(fields: [characterId], references: [id], onDelete: Cascade)

  themebook    String    // Nom du themebook LITM
  name         String    // Nom du thème
  description  String?   @db.Text

  attention    Int       @default(0)
  fade         Int       @default(0)
  crack        Int       @default(0)

  powerTags    Tag[]     @relation("PowerTags")
  weaknessTags Tag[]     @relation("WeaknessTags")

  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  @@index([characterId])
}

model Tag {
  id              String    @id @default(uuid())
  themeCardId     String

  name            String
  type            TagType
  subtype         String?   // Story, Temporary, etc.
  isBurned        Boolean   @default(false)

  // Relations polymorphes
  powerThemeCard  ThemeCard? @relation("PowerTags", fields: [themeCardId], references: [id], onDelete: Cascade)
  weaknessThemeCard ThemeCard? @relation("WeaknessTags", fields: [themeCardId], references: [id], onDelete: Cascade)

  createdAt       DateTime  @default(now())

  @@index([themeCardId])
}

enum TagType {
  POWER
  WEAKNESS
}

// ===== HERO CARD =====

model HeroCard {
  id            String    @id @default(uuid())
  characterId   String    @unique
  character     Character @relation(fields: [characterId], references: [id], onDelete: Cascade)

  relationships Relationship[]
  quintessences Quintessence[]

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Relationship {
  id          String   @id @default(uuid())
  heroCardId  String
  heroCard    HeroCard @relation(fields: [heroCardId], references: [id], onDelete: Cascade)

  name        String   // Nom du PNJ
  description String?  @db.Text
  type        String?  // Friend, Rival, Enemy, etc.

  createdAt   DateTime @default(now())

  @@index([heroCardId])
}

model Quintessence {
  id          String   @id @default(uuid())
  heroCardId  String
  heroCard    HeroCard @relation(fields: [heroCardId], references: [id], onDelete: Cascade)

  name        String
  description String?  @db.Text

  createdAt   DateTime @default(now())

  @@index([heroCardId])
}

// ===== TRACKERS =====

model Trackers {
  id            String   @id @default(uuid())
  characterId   String   @unique
  character     Character @relation(fields: [characterId], references: [id], onDelete: Cascade)

  statuses      Status[]
  storyTags     StoryTag[]
  storyThemes   StoryTheme[]

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model Status {
  id          String   @id @default(uuid())
  trackersId  String
  trackers    Trackers @relation(fields: [trackersId], references: [id], onDelete: Cascade)

  name        String
  tier        Int      // 1-6
  type        StatusType

  createdAt   DateTime @default(now())

  @@index([trackersId])
}

enum StatusType {
  POSITIVE
  NEGATIVE
}

model StoryTag {
  id          String   @id @default(uuid())
  trackersId  String
  trackers    Trackers @relation(fields: [trackersId], references: [id], onDelete: Cascade)

  name        String

  createdAt   DateTime @default(now())

  @@index([trackersId])
}

model StoryTheme {
  id          String   @id @default(uuid())
  trackersId  String
  trackers    Trackers @relation(fields: [trackersId], references: [id], onDelete: Cascade)

  name        String
  letters     String   // Ex: "ABCD"

  createdAt   DateTime @default(now())

  @@index([trackersId])
}
```

### Changements par rapport à l'analyse initiale

| Élément | Analyse initiale | MVP réel | Raison |
|---------|------------------|----------|--------|
| **Investigation Board** | Tables `BoardNode`, `Connection` | ❌ Supprimé | Reporté v2.0 |
| **Oracles customs** | Table `Oracle` avec CRUD | ❌ Simplifié | MVP = oracles fixes uniquement |
| **Roll History** | Table `RollHistory` | ❌ Supprimé | Système de jets reporté v1.3 |
| **Drawer System** | Tables `Folder`, `File` | ❌ Supprimé | Organisation avancée reportée v1.4 |
| **Undo/Redo** | Middleware temporal | ❌ Supprimé | Amélioration UX reportée v1.1 |

## API Routes Simplifiées (MVP v1.0)

### Routes Essentielles

```
GET    /api/playspaces              - Liste playspaces user
POST   /api/playspaces              - Créer playspace
PUT    /api/playspaces/:id          - Modifier playspace
DELETE /api/playspaces/:id          - Supprimer playspace

GET    /api/playspaces/:id/characters - Liste personnages du playspace
POST   /api/playspaces/:id/characters - Créer personnage dans playspace

GET    /api/characters/:id          - Détails personnage complet
PATCH  /api/characters/:id          - Modifier personnage
DELETE /api/characters/:id          - Supprimer personnage
POST   /api/characters/:id/duplicate - Dupliquer personnage

POST   /api/characters/:id/theme-cards    - Créer theme card
PATCH  /api/theme-cards/:id               - Modifier theme card
DELETE /api/theme-cards/:id               - Supprimer theme card

POST   /api/theme-cards/:id/tags          - Ajouter tag (power/weakness)
PATCH  /api/tags/:id                      - Modifier tag
DELETE /api/tags/:id                      - Supprimer tag

POST   /api/characters/:id/hero-card      - Créer hero card
PATCH  /api/hero-cards/:id                - Modifier hero card

POST   /api/hero-cards/:id/relationships  - Ajouter relation
PATCH  /api/relationships/:id             - Modifier relation
DELETE /api/relationships/:id             - Supprimer relation

GET    /api/trackers/:characterId         - Récupérer trackers
PATCH  /api/trackers/:id                  - Modifier trackers

GET    /api/export/character/:id/json     - Export JSON personnage
```

**Total** : 21 API routes pour MVP v1.0

### Routes Reportées

```
// v1.3 : Système de jets
POST   /api/rolls/execute
GET    /api/rolls/history/:characterId

// v2.0 : Investigation Board
GET    /api/investigation-board/:playspaceId
POST   /api/investigation-board/:playspaceId/nodes
PATCH  /api/investigation-board/nodes/:id
DELETE /api/investigation-board/nodes/:id
POST   /api/investigation-board/connections

// v2.5 : Multi-joueurs
WebSocket /ws/rooms/:roomId
```

## Composants Vue Simplifiés (MVP v1.0)

### Composants Essentiels

```
app/components/
├── Playspace/
│   ├── PlayspaceCard.vue
│   ├── PlayspaceForm.vue
│   └── PlayspaceSwitcher.vue
│
├── Character/
│   ├── CharacterCard.vue
│   ├── CharacterForm.vue
│   ├── CharacterList.vue
│   └── CharacterDetail.vue
│
├── ThemeCard/
│   ├── ThemeCardForm.vue
│   ├── ThemeCardDisplay.vue
│   └── TagList.vue
│
├── HeroCard/
│   ├── HeroCardForm.vue
│   ├── RelationshipList.vue
│   └── QuintessenceList.vue
│
├── Trackers/
│   ├── StatusTracker.vue
│   ├── StoryTagTracker.vue
│   └── StoryThemeTracker.vue
│
└── Common/
    ├── Button.vue
    ├── Input.vue
    ├── Modal.vue
    └── Toast.vue
```

**Total** : 20 composants pour MVP v1.0

### Composants Reportés

```
// v1.1 : Undo/Redo
├── UndoRedoBar.vue

// v1.4 : Drawer System
├── Drawer/
│   ├── FolderTree.vue
│   └── FileList.vue

// v2.0 : Investigation Board
├── InvestigationBoard/
│   ├── Canvas.vue
│   ├── Node.vue
│   └── Connection.vue
```

## Stores Pinia Simplifiés (MVP v1.0)

### Stores Essentiels

```typescript
// stores/playspace.ts
export const usePlayspaceStore = defineStore('playspace', () => {
  const current = ref<Playspace | null>(null);
  const list = ref<Playspace[]>([]);

  const switchPlayspace = async (id: string) => {
    const data = await $fetch(`/api/playspaces/${id}`);
    current.value = data;
  };

  return { current, list, switchPlayspace };
});

// stores/character.ts
export const useCharacterStore = defineStore('character', () => {
  const current = ref<Character | null>(null);
  const list = ref<Character[]>([]);

  const fetchCharacters = async (playspaceId: string) => {
    const data = await $fetch(`/api/playspaces/${playspaceId}/characters`);
    list.value = data;
  };

  return { current, list, fetchCharacters };
});

// stores/ui.ts (simple)
export const useUIStore = defineStore('ui', () => {
  const sidebarOpen = ref(true);
  const loading = ref(false);

  return { sidebarOpen, loading };
});
```

**Total** : 3 stores pour MVP v1.0

### Stores Reportés

```typescript
// v1.1 : History store (undo/redo)
export const useHistoryStore = defineStore('history', () => {
  const { undo, redo } = useRefHistory(character);
  return { undo, redo };
});

// v2.0 : Investigation Board store
export const useBoardStore = defineStore('board', () => {
  const nodes = ref([]);
  const connections = ref([]);
  return { nodes, connections };
});

// v2.5 : WebSocket store
export const useWebSocketStore = defineStore('websocket', () => {
  const socket = ref<WebSocket | null>(null);
  return { socket, connect, disconnect };
});
```

## Roadmap d'Implémentation MVP v1.0

### Phase 1 : Fondations (2 semaines)
- ✅ Setup Nuxt 4 + Prisma + PostgreSQL
- ✅ Schema Prisma MVP
- ✅ Migration initiale
- ✅ Authentification @sidebase/nuxt-auth
- ✅ Layout de base (UnoCSS)

### Phase 2 : Playspaces (2 semaines)
- ✅ CRUD Playspaces (API routes)
- ✅ Store Pinia playspace
- ✅ Composants Playspace (formulaire, liste, switcher)
- ✅ Tests E2E Playwright (création, basculement)

### Phase 3 : Characters (4 semaines)
- ✅ CRUD Characters (API routes)
- ✅ Store Pinia character
- ✅ Composants Character (formulaire, liste, détail)
- ✅ Theme Cards CRUD
- ✅ Hero Card CRUD
- ✅ Trackers CRUD
- ✅ Tests E2E Playwright (création, édition, suppression)

### Phase 4 : Polish & Export (2 semaines)
- ✅ Export JSON personnages
- ✅ Validation Zod complète
- ✅ Messages d'erreur UX
- ✅ Loading states
- ✅ Tests E2E complets (24 tests)
- ✅ Documentation utilisateur

**Total MVP** : 10 semaines (2.5 mois)

---

**Date** : 2025-01-19
**Version** : 1.0
**Statut** : Validé
**Auteur** : Technical Architect
**Scope** : MVP v1.0 Brumisa3 (Playspaces + LITM Characters)
