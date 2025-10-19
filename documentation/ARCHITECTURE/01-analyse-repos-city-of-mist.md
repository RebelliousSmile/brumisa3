# Analyse des Repositories City of Mist / Legends in the Mist

## Vue d'ensemble

Analyse de 5 repositories open-source liés aux systèmes City of Mist et Legends in the Mist pour identifier les patterns architecturaux et fonctionnalités adaptables à notre stack Nuxt 4.

## Repositories Analysés

### 1. taragnor/city-of-mist (FoundryVTT - TypeScript)
- **Stack**: FoundryVTT System, TypeScript, Handlebars, jQuery
- **Taille**: Système complet avec ~40 modules TypeScript
- **Focus**: Système de jeu officiel pour FoundryVTT

### 2. Altervayne/characters-of-the-mist (Next.js - TypeScript)
- **Stack**: Next.js 15, TypeScript, Zustand, Tailwind CSS, dnd-kit
- **Taille**: Application standalone client-side
- **Focus**: Gestionnaire de fiches de personnage moderne

### 3. mikerees/litm-player (Node.js - Vanilla JS)
- **Stack**: Express.js, Socket.io, Vanilla JavaScript
- **Taille**: Serveur de jeu léger
- **Focus**: Plateforme multi-joueurs temps réel

### 4. mordachai/investigation-board (FoundryVTT Module)
- **Stack**: FoundryVTT Module, JavaScript, Handlebars
- **Focus**: Tableau d'enquête pour City of Mist

### 5. mordachai/mist-hud (FoundryVTT Module)
- **Stack**: FoundryVTT Module, JavaScript, Handlebars
- **Focus**: HUD amélioré pour City of Mist/Otherscape/LitM

## Comparaison des Approches Technologiques

| Aspect | FoundryVTT (taragnor) | Next.js (Altervayne) | Node.js (mikerees) | Notre Stack (Nuxt 4) |
|--------|----------------------|----------------------|---------------------|----------------------|
| **Frontend** | Handlebars + jQuery | React + Zustand | Vanilla JS | Vue 3 + Pinia |
| **Backend** | FoundryVTT API | Client-side only | Express + Socket.io | Nitro Server |
| **State** | Actor/Item Documents | Zustand + LocalStorage | Server State | Pinia + Prisma |
| **Templates** | Handlebars (.hbs) | JSX/TSX | HTML strings | Vue SFC (.vue) |
| **Types** | TypeScript | TypeScript | JavaScript | TypeScript |
| **Styling** | CSS custom | Tailwind CSS | CSS custom | UnoCSS/Tailwind |
| **DB** | NeDB (embedded) | LocalStorage | In-memory | PostgreSQL + Prisma |

## Patterns Architecturaux Identifiés

### Pattern 1: Modèle de Données Hiérarchique (Actor-Item)

**FoundryVTT (taragnor)**:
```typescript
// Actor (Character/Threat/Crew)
//   └─ Items (Theme, Tag, Status, Improvement, Move)
//      └─ Nested Data (Power Tags, Weaknesses, etc.)

Actor Types: character, threat, crew
Item Types: themebook, tag, improvement, theme, status, clue, move, gmmove, etc.
```

**Adaptable à Nuxt 4 (Prisma)**:
```prisma
model Character {
  id        String   @id @default(cuid())
  name      String
  type      CharacterType // PLAYER, DANGER, CREW
  themes    Theme[]
  statuses  Status[]
  moves     Move[]
}

model Theme {
  id           String @id @default(cuid())
  characterId  String
  character    Character @relation(fields: [characterId], references: [id])
  type         ThemeType // MYTHOS, LOGOS, MIST, BASTION
  tags         Tag[]
  improvements Improvement[]
  attention    Int @default(0)
}

model Tag {
  id       String @id @default(cuid())
  themeId  String
  theme    Theme @relation(fields: [themeId], references: [id])
  type     TagType // POWER, WEAKNESS, STORY, LOADOUT
  name     String
  question String?
  burned   Boolean @default(false)
}
```

**Avantages**:
- Séparation claire entre personnages et leurs composants
- Réutilisabilité des éléments (tags, statuses)
- Facilite les requêtes et les relations

### Pattern 2: State Management avec Undo/Redo

**Next.js (Altervayne)** utilise Zustand avec middleware temporal:
```typescript
// src/lib/stores/characterStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { temporal } from 'zundo';

// Store avec historique Undo/Redo intégré
const useCharacterStore = create(
  temporal(
    persist(
      (set) => ({
        characters: [],
        activeCharacter: null,
        addCharacter: (char) => set((state) => ({
          characters: [...state.characters, char]
        })),
        // ... autres actions
      }),
      { name: 'character-storage' }
    ),
    { limit: 50 } // Limite de l'historique
  )
);
```

**Adaptation Pinia (Nuxt 4)**:
```typescript
// stores/character.ts
import { defineStore } from 'pinia';
import { useRefHistory } from '@vueuse/core';

export const useCharacterStore = defineStore('character', () => {
  const characters = ref<Character[]>([]);
  const activeCharacter = ref<Character | null>(null);

  // Historique Undo/Redo avec VueUse
  const { history, undo, redo, canUndo, canRedo } = useRefHistory(characters, {
    capacity: 50,
    deep: true
  });

  const addCharacter = (character: Character) => {
    characters.value.push(character);
  };

  return {
    characters,
    activeCharacter,
    addCharacter,
    undo,
    redo,
    canUndo,
    canRedo
  };
});
```

**Recommandations**:
- Utiliser `@vueuse/core` pour l'historique (useRefHistory)
- Pinia pour le state management global
- Persister les données critiques via API Nitro + Prisma

### Pattern 3: Système de Tags et Statuts Sélectionnables

**FoundryVTT (taragnor)** - Sélection de tags pour les jets:
```typescript
// city-roll.ts - ReviewableModifierList
class ReviewableModifierList {
  tags: Tag[] = [];
  statuses: Status[] = [];

  selectTag(tag: Tag, amount: number) {
    // amount: +1 (bonus), -1 (malus), 0 (neutral)
  }

  calculateTotal(): number {
    const tagBonus = this.tags.reduce((sum, tag) => sum + tag.amount, 0);
    const statusBonus = this.statuses.reduce((sum, s) => sum + s.tier * s.polarity, 0);
    return tagBonus + statusBonus;
  }
}
```

**Adaptation Vue 3 (Composable)**:
```typescript
// composables/useRollModifiers.ts
export const useRollModifiers = () => {
  const selectedTags = ref<SelectedTag[]>([]);
  const selectedStatuses = ref<SelectedStatus[]>([]);

  const toggleTag = (tag: Tag, polarity: 1 | -1 | 0) => {
    const existing = selectedTags.value.find(t => t.id === tag.id);
    if (existing) {
      if (existing.polarity === polarity) {
        // Désélectionner
        selectedTags.value = selectedTags.value.filter(t => t.id !== tag.id);
      } else {
        // Changer la polarité
        existing.polarity = polarity;
      }
    } else {
      // Ajouter
      selectedTags.value.push({ ...tag, polarity });
    }
  };

  const calculateModifier = computed(() => {
    const tagMod = selectedTags.value.reduce((sum, t) => sum + t.polarity, 0);
    const statusMod = selectedStatuses.value.reduce(
      (sum, s) => sum + (s.tier * s.polarity),
      0
    );
    return tagMod + statusMod;
  });

  const reset = () => {
    selectedTags.value = [];
    selectedStatuses.value = [];
  };

  return {
    selectedTags,
    selectedStatuses,
    toggleTag,
    calculateModifier,
    reset
  };
};
```

### Pattern 4: Système de Fichier/Drawer (Altervayne)

**Next.js (Altervayne)** - Gestionnaire de fichiers avec drag & drop:
```typescript
// src/lib/stores/drawerStore.ts
interface DrawerItem {
  id: string;
  type: 'character' | 'folder';
  name: string;
  parentId: string | null;
  children?: DrawerItem[];
}

// Opérations de fichier
const drawerStore = create((set) => ({
  items: [],
  createFolder: (name, parentId) => { /* ... */ },
  moveItem: (itemId, newParentId) => { /* ... */ },
  deleteItem: (itemId) => { /* ... */ },
}));
```

**Adaptation Nuxt 4**:
```typescript
// composables/useCharacterLibrary.ts
export const useCharacterLibrary = () => {
  const folders = ref<Folder[]>([]);
  const characters = ref<Character[]>([]);

  const createFolder = async (name: string, parentId?: string) => {
    const folder = await $fetch('/api/folders', {
      method: 'POST',
      body: { name, parentId }
    });
    folders.value.push(folder);
  };

  const moveCharacter = async (characterId: string, folderId: string) => {
    await $fetch(`/api/characters/${characterId}/move`, {
      method: 'PATCH',
      body: { folderId }
    });
    // Mise à jour locale
  };

  return {
    folders,
    characters,
    createFolder,
    moveCharacter
  };
};
```

**Recommandations**:
- Utiliser `@vueuse/integrations/useDraggable` pour le drag & drop
- Persister la structure de dossiers en DB
- Pagination côté serveur pour de grandes bibliothèques

### Pattern 5: Système de Jets de Dés avec Résultats Visuels

**FoundryVTT (taragnor)** - Système de roll complet:
```typescript
// city-roll.ts
class CityRoll {
  async roll(modifiers: number, rollOptions: RollOptions): Promise<RollResult> {
    const dice = new Roll('2d6');
    await dice.evaluate();

    const total = dice.total + modifiers;
    const outcome = this.determineOutcome(total, rollOptions.dynamite);

    await this.displayInChat(dice, modifiers, outcome);

    return { dice, total, outcome };
  }

  determineOutcome(total: number, isDynamite: boolean): Outcome {
    if (total >= 12 && isDynamite) return 'CRITICAL_SUCCESS';
    if (total >= 10) return 'SUCCESS';
    if (total >= 7) return 'PARTIAL_SUCCESS';
    return 'FAILURE';
  }
}
```

**Adaptation Nuxt 4 (Composable + API)**:
```typescript
// composables/useDiceRoll.ts
export const useDiceRoll = () => {
  const roll = async (modifiers: number, options: RollOptions) => {
    // Appel API pour garantir l'aléatoire côté serveur
    const result = await $fetch('/api/rolls/execute', {
      method: 'POST',
      body: { modifiers, options }
    });

    return result;
  };

  const displayResult = (result: RollResult) => {
    // Animation visuelle avec gsap ou framer-motion
    // Affichage du résultat dans un composant
  };

  return { roll, displayResult };
};

// server/api/rolls/execute.post.ts
export default defineEventHandler(async (event) => {
  const { modifiers, options } = await readBody(event);

  // Génération aléatoire cryptographiquement sûre
  const die1 = Math.floor(Math.random() * 6) + 1;
  const die2 = Math.floor(Math.random() * 6) + 1;
  const diceTotal = die1 + die2;
  const total = diceTotal + modifiers;

  const outcome = determineOutcome(total, options.dynamite);

  // Enregistrement en DB pour historique
  await prisma.rollHistory.create({
    data: {
      characterId: options.characterId,
      die1,
      die2,
      modifiers,
      total,
      outcome,
      timestamp: new Date()
    }
  });

  return {
    dice: { die1, die2, total: diceTotal },
    modifiers,
    total,
    outcome
  };
});
```

### Pattern 6: Chat/Messages Temps Réel

**Node.js (mikerees)** - Socket.io pour communication temps réel:
```javascript
// server/websocket.js
io.on('connection', (socket) => {
  socket.on('join-session', (sessionId) => {
    socket.join(sessionId);
  });

  socket.on('chat-message', (data) => {
    io.to(data.sessionId).emit('chat-message', {
      username: data.username,
      message: data.message,
      timestamp: Date.now()
    });
  });

  socket.on('roll-dice', (data) => {
    const result = rollDice(data.formula, data.modifiers);
    io.to(data.sessionId).emit('dice-result', result);
  });
});
```

**Adaptation Nuxt 4 (WebSocket via Nitro)**:
```typescript
// server/api/ws.ts
import { defineWebSocketHandler } from 'h3';

export default defineWebSocketHandler({
  open(peer) {
    console.log('Client connected', peer.id);
  },

  message(peer, message) {
    const data = JSON.parse(message.text());

    switch (data.type) {
      case 'JOIN_SESSION':
        peer.subscribe(data.sessionId);
        break;

      case 'CHAT_MESSAGE':
        peer.publish(data.sessionId, JSON.stringify({
          type: 'CHAT_MESSAGE',
          username: data.username,
          message: data.message,
          timestamp: Date.now()
        }));
        break;

      case 'DICE_ROLL':
        // Traiter le jet de dés
        const result = processDiceRoll(data);
        peer.publish(data.sessionId, JSON.stringify({
          type: 'DICE_RESULT',
          result
        }));
        break;
    }
  },

  close(peer) {
    console.log('Client disconnected', peer.id);
  }
});
```

**Recommandations**:
- Utiliser les WebSockets Nitro pour le temps réel
- Alternative: Server-Sent Events (SSE) pour communication unidirectionnelle
- Pinia pour synchroniser l'état client avec les messages WebSocket

## Conclusion - Synthèse des Patterns Adaptables

### Priorité Haute (Implémenter en premier)

1. **Modèle de données Actor-Item** (Prisma)
2. **State management avec Pinia** (sans undo/redo initial)
3. **Système de tags/statuts sélectionnables** (Composable Vue)
4. **API de jets de dés côté serveur** (Nitro)

### Priorité Moyenne

5. **Système Undo/Redo** (VueUse)
6. **Bibliothèque de personnages** (avec dossiers)
7. **Historique des jets** (DB + affichage)

### Priorité Basse (Nice to have)

8. **WebSocket temps réel** (pour mode multi-joueurs futur)
9. **Drag & Drop avancé** (réorganisation UI)
10. **Export/Import de personnages** (JSON/PDF)

## Prochaines Étapes

Voir les documents suivants pour l'implémentation détaillée:
- `02-modele-donnees-prisma.md` - Schéma Prisma complet
- `03-architecture-composants-vue.md` - Structure des composants
- `04-api-routes-nitro.md` - Design des API routes
- `05-state-management-pinia.md` - Stores Pinia
