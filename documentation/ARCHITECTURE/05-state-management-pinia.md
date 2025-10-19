# State Management avec Pinia - Architecture et Patterns

## Vue d'ensemble

Architecture Pinia inspirée de Zustand (Altervayne/characters-of-the-mist) mais adaptée aux patterns Vue 3 et Nuxt 4.

## Principes

### 1. Stores Modulaires
Un store par domaine métier (characters, themes, rolls, etc.)

### 2. Composition API Syntax
Utiliser la syntaxe `setup()` pour les stores Pinia (plus proche de Vue 3)

### 3. Synchronisation Server-Client
- State serveur via `useFetch` / `useAsyncData`
- State local pour UI (sélections, modals, etc.)
- Optimistic updates quand approprié

### 4. Pas de Persistence par Défaut
- Données critiques en DB via API
- State UI éphémère (sauf préférences utilisateur)

## Architecture des Stores

```
stores/
├── auth.ts              # Authentification
├── characters.ts        # Gestion personnages
├── themes.ts            # Gestion thèmes
├── tags.ts              # Tags globaux
├── statuses.ts          # Statuts
├── rolls.ts             # Jets de dés et historique
├── ui.ts                # État UI (modals, sidebars, etc.)
└── preferences.ts       # Préférences utilisateur (persist)
```

## Exemples d'Implémentation

### 1. Store Authentication

```typescript
// stores/auth.ts
import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null);
  const isAuthenticated = computed(() => user.value !== null);

  // Actions
  const login = async (credentials: LoginCredentials) => {
    const { data } = await $fetch('/api/auth/login', {
      method: 'POST',
      body: credentials,
    });

    user.value = data.user;
  };

  const logout = async () => {
    await $fetch('/api/auth/logout', { method: 'POST' });
    user.value = null;

    // Redirection
    navigateTo('/login');
  };

  const fetchCurrentUser = async () => {
    try {
      const { data } = await $fetch('/api/auth/me');
      user.value = data;
    } catch (error) {
      user.value = null;
    }
  };

  return {
    user,
    isAuthenticated,
    login,
    logout,
    fetchCurrentUser,
  };
});
```

### 2. Store Characters (avec Cache)

```typescript
// stores/characters.ts
import { defineStore } from 'pinia';
import type { Character, CharacterFilters } from '~/types/character';

export const useCharactersStore = defineStore('characters', () => {
  // State
  const characters = ref<Character[]>([]);
  const activeCharacterId = ref<string | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Computed
  const activeCharacter = computed(() =>
    characters.value.find(c => c.id === activeCharacterId.value) || null
  );

  const charactersByType = computed(() => {
    return (type: string) =>
      characters.value.filter(c => c.type === type);
  });

  // Actions
  const fetchCharacters = async (filters?: CharacterFilters) => {
    loading.value = true;
    error.value = null;

    try {
      const data = await $fetch('/api/characters', {
        query: filters,
      });

      characters.value = data.data;
    } catch (e) {
      error.value = (e as Error).message;
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const fetchCharacter = async (id: string) => {
    loading.value = true;
    error.value = null;

    try {
      const character = await $fetch(`/api/characters/${id}`);

      // Mettre à jour ou ajouter dans la liste
      const index = characters.value.findIndex(c => c.id === id);
      if (index !== -1) {
        characters.value[index] = character;
      } else {
        characters.value.push(character);
      }

      return character;
    } catch (e) {
      error.value = (e as Error).message;
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const createCharacter = async (data: CreateCharacterDto) => {
    loading.value = true;
    error.value = null;

    try {
      const character = await $fetch('/api/characters', {
        method: 'POST',
        body: data,
      });

      // Optimistic update
      characters.value.push(character);
      activeCharacterId.value = character.id;

      return character;
    } catch (e) {
      error.value = (e as Error).message;
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const updateCharacter = async (id: string, data: UpdateCharacterDto) => {
    const previousState = { ...characters.value };

    // Optimistic update
    const index = characters.value.findIndex(c => c.id === id);
    if (index !== -1) {
      characters.value[index] = {
        ...characters.value[index],
        ...data,
      };
    }

    try {
      const updated = await $fetch(`/api/characters/${id}`, {
        method: 'PATCH',
        body: data,
      });

      // Confirmer avec les données serveur
      characters.value[index] = updated;

      return updated;
    } catch (e) {
      // Rollback en cas d'erreur
      characters.value = Object.values(previousState);
      error.value = (e as Error).message;
      throw e;
    }
  };

  const deleteCharacter = async (id: string) => {
    const previousState = [...characters.value];

    // Optimistic delete
    characters.value = characters.value.filter(c => c.id !== id);

    if (activeCharacterId.value === id) {
      activeCharacterId.value = null;
    }

    try {
      await $fetch(`/api/characters/${id}`, {
        method: 'DELETE',
      });
    } catch (e) {
      // Rollback
      characters.value = previousState;
      error.value = (e as Error).message;
      throw e;
    }
  };

  const setActiveCharacter = (id: string | null) => {
    activeCharacterId.value = id;
  };

  return {
    // State
    characters,
    activeCharacterId,
    loading,
    error,

    // Computed
    activeCharacter,
    charactersByType,

    // Actions
    fetchCharacters,
    fetchCharacter,
    createCharacter,
    updateCharacter,
    deleteCharacter,
    setActiveCharacter,
  };
});
```

### 3. Store Rolls (avec Historique)

```typescript
// stores/rolls.ts
import { defineStore } from 'pinia';
import type { RollResult, RollOptions } from '~/types/rolls';

export const useRollsStore = defineStore('rolls', () => {
  // State
  const history = ref<RollResult[]>([]);
  const rolling = ref(false);
  const latestRoll = ref<RollResult | null>(null);

  // Actions
  const executeRoll = async (options: RollOptions): Promise<RollResult> => {
    rolling.value = true;

    try {
      const result = await $fetch('/api/rolls/execute', {
        method: 'POST',
        body: options,
      });

      // Ajouter à l'historique local
      history.value.unshift(result);
      latestRoll.value = result;

      // Limiter l'historique local à 50
      if (history.value.length > 50) {
        history.value = history.value.slice(0, 50);
      }

      return result;
    } finally {
      rolling.value = false;
    }
  };

  const fetchHistory = async (characterId: string, page = 1) => {
    const data = await $fetch(`/api/rolls/history/${characterId}`, {
      query: { page, pageSize: 20 },
    });

    if (page === 1) {
      history.value = data.data;
    } else {
      history.value.push(...data.data);
    }

    return data;
  };

  const clearHistory = () => {
    history.value = [];
    latestRoll.value = null;
  };

  // Computed
  const successRate = computed(() => {
    if (history.value.length === 0) return 0;

    const successes = history.value.filter(
      r => r.outcome === 'SUCCESS' || r.outcome === 'CRITICAL_SUCCESS'
    ).length;

    return Math.round((successes / history.value.length) * 100);
  });

  const averageRoll = computed(() => {
    if (history.value.length === 0) return 0;

    const sum = history.value.reduce((acc, r) => acc + r.finalTotal, 0);
    return Math.round(sum / history.value.length * 10) / 10;
  });

  return {
    // State
    history,
    rolling,
    latestRoll,

    // Computed
    successRate,
    averageRoll,

    // Actions
    executeRoll,
    fetchHistory,
    clearHistory,
  };
});
```

### 4. Store UI (État Éphémère)

```typescript
// stores/ui.ts
import { defineStore } from 'pinia';

export const useUIStore = defineStore('ui', () => {
  // Modals
  const modals = reactive({
    characterCreate: false,
    characterEdit: false,
    themeCreate: false,
    rollDialog: false,
  });

  const openModal = (name: keyof typeof modals) => {
    modals[name] = true;
  };

  const closeModal = (name: keyof typeof modals) => {
    modals[name] = false;
  };

  const closeAllModals = () => {
    Object.keys(modals).forEach(key => {
      modals[key as keyof typeof modals] = false;
    });
  };

  // Sidebars
  const sidebars = reactive({
    characterLibrary: false,
    rollHistory: false,
    settings: false,
  });

  const toggleSidebar = (name: keyof typeof sidebars) => {
    sidebars[name] = !sidebars[name];
  };

  // Notifications
  const notifications = ref<Notification[]>([]);

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Date.now().toString();
    notifications.value.push({ ...notification, id });

    // Auto-remove après 5s
    setTimeout(() => {
      removeNotification(id);
    }, 5000);
  };

  const removeNotification = (id: string) => {
    notifications.value = notifications.value.filter(n => n.id !== id);
  };

  // Loading states
  const globalLoading = ref(false);

  return {
    // Modals
    modals,
    openModal,
    closeModal,
    closeAllModals,

    // Sidebars
    sidebars,
    toggleSidebar,

    // Notifications
    notifications,
    addNotification,
    removeNotification,

    // Loading
    globalLoading,
  };
});
```

### 5. Store Preferences (Persisté)

```typescript
// stores/preferences.ts
import { defineStore } from 'pinia';

export const usePreferencesStore = defineStore('preferences', () => {
  // State persisté via localStorage
  const theme = useLocalStorage('theme', 'dark');
  const language = useLocalStorage('language', 'fr');
  const diceSound = useLocalStorage('dice-sound', true);
  const autoSave = useLocalStorage('auto-save', true);

  // Préférences d'affichage
  const display = useLocalStorage('display-preferences', {
    showTagQuestions: true,
    compactMode: false,
    showRollHistory: true,
  });

  // Actions
  const setTheme = (newTheme: 'light' | 'dark') => {
    theme.value = newTheme;
  };

  const setLanguage = (lang: string) => {
    language.value = lang;
  };

  const toggleDiceSound = () => {
    diceSound.value = !diceSound.value;
  };

  const updateDisplay = (key: keyof typeof display.value, value: boolean) => {
    display.value[key] = value;
  };

  return {
    // State
    theme,
    language,
    diceSound,
    autoSave,
    display,

    // Actions
    setTheme,
    setLanguage,
    toggleDiceSound,
    updateDisplay,
  };
});
```

## Patterns d'Utilisation dans les Composants

### 1. Basic Usage

```vue
<script setup lang="ts">
const charactersStore = useCharactersStore();
const { activeCharacter, loading } = storeToRefs(charactersStore);

onMounted(async () => {
  await charactersStore.fetchCharacters();
});
</script>

<template>
  <div v-if="loading">Loading...</div>
  <div v-else-if="activeCharacter">
    {{ activeCharacter.name }}
  </div>
</template>
```

### 2. Optimistic Updates

```vue
<script setup lang="ts">
const charactersStore = useCharactersStore();

const updateName = async (newName: string) => {
  try {
    await charactersStore.updateCharacter(characterId, {
      name: newName,
    });
    // UI déjà mise à jour optimistically
  } catch (error) {
    // UI rollback automatique + notification
    useUIStore().addNotification({
      type: 'error',
      message: 'Échec de la mise à jour',
    });
  }
};
</script>
```

### 3. Computed Cross-Store

```typescript
// composables/useCharacterStats.ts
export const useCharacterStats = (characterId: string) => {
  const charactersStore = useCharactersStore();
  const rollsStore = useRollsStore();

  const character = computed(() =>
    charactersStore.characters.find(c => c.id === characterId)
  );

  const rollHistory = computed(() =>
    rollsStore.history.filter(r => r.characterId === characterId)
  );

  const stats = computed(() => ({
    totalThemes: character.value?.themes.length || 0,
    totalTags: character.value?.themes.reduce(
      (sum, t) => sum + t.tags.length,
      0
    ) || 0,
    totalRolls: rollHistory.value.length,
    successRate: /* calcul */,
  }));

  return { stats };
};
```

### 4. Actions Composées

```typescript
// stores/characters.ts (suite)

// Action complexe qui coordonne plusieurs opérations
const createCharacterWithTheme = async (
  characterData: CreateCharacterDto,
  themeData: CreateThemeDto
) => {
  loading.value = true;

  try {
    // 1. Créer le personnage
    const character = await createCharacter(characterData);

    // 2. Créer le thème
    const theme = await $fetch(`/api/characters/${character.id}/themes`, {
      method: 'POST',
      body: themeData,
    });

    // 3. Mettre à jour le store
    const index = characters.value.findIndex(c => c.id === character.id);
    if (index !== -1) {
      characters.value[index].themes.push(theme);
    }

    return { character, theme };
  } finally {
    loading.value = false;
  }
};
```

## Testing des Stores

```typescript
// tests/stores/characters.test.ts
import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useCharactersStore } from '~/stores/characters';

describe('Characters Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('should fetch characters', async () => {
    const store = useCharactersStore();

    // Mock fetch
    global.$fetch = vi.fn().mockResolvedValue({
      data: [
        { id: '1', name: 'Test Character' },
      ],
    });

    await store.fetchCharacters();

    expect(store.characters).toHaveLength(1);
    expect(store.characters[0].name).toBe('Test Character');
  });

  it('should handle optimistic updates', async () => {
    const store = useCharactersStore();
    store.characters = [{ id: '1', name: 'Old Name' }];

    // Mock success
    global.$fetch = vi.fn().mockResolvedValue({
      id: '1',
      name: 'New Name',
    });

    await store.updateCharacter('1', { name: 'New Name' });

    expect(store.characters[0].name).toBe('New Name');
  });

  it('should rollback on error', async () => {
    const store = useCharactersStore();
    store.characters = [{ id: '1', name: 'Original' }];

    // Mock error
    global.$fetch = vi.fn().mockRejectedValue(new Error('Failed'));

    await expect(
      store.updateCharacter('1', { name: 'New' })
    ).rejects.toThrow();

    // Rollback
    expect(store.characters[0].name).toBe('Original');
  });
});
```

## Performance et Bonnes Pratiques

### 1. Éviter les Watchers Coûteux

```typescript
// ❌ BAD
watch(
  () => charactersStore.characters,
  (newChars) => {
    // Opération coûteuse sur chaque changement
    expensiveOperation(newChars);
  },
  { deep: true } // Très coûteux
);

// ✅ GOOD
const characterIds = computed(() =>
  charactersStore.characters.map(c => c.id)
);

watch(characterIds, (newIds) => {
  // Seulement si les IDs changent
  expensiveOperation();
});
```

### 2. Utiliser `storeToRefs` pour la Réactivité

```typescript
// ❌ BAD - perd la réactivité
const { characters } = useCharactersStore();

// ✅ GOOD - conserve la réactivité
const { characters } = storeToRefs(useCharactersStore());
```

### 3. Normaliser les Données Complexes

```typescript
// Si beaucoup de relations imbriquées, normaliser:
const normalizedStore = defineStore('normalized', () => {
  const characters = ref<Record<string, Character>>({});
  const themes = ref<Record<string, Theme>>({});
  const tags = ref<Record<string, Tag>>({});

  // Relations via IDs
  const getCharacterWithThemes = (id: string) => {
    const char = characters.value[id];
    return {
      ...char,
      themes: char.themeIds.map(tid => themes.value[tid]),
    };
  };
});
```

## Prochaines Étapes

Cette architecture Pinia s'intègre avec:
- Les composants Vue (voir `03-architecture-composants-vue.md`)
- Les API routes (voir `04-api-routes-nitro.md`)
- Le modèle Prisma (voir `02-modele-donnees-prisma.md`)
