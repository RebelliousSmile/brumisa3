# Architecture des Composants Vue 3 - Legends in the Mist

## Principes d'Architecture

### 1. Composition API First
Utiliser exclusivement la Composition API avec `<script setup>` pour tous les composants.

### 2. Single Responsibility
Chaque composant a une responsabilité unique et claire.

### 3. Composables pour la Logique Réutilisable
Extraire toute logique métier dans des composables.

### 4. Props & Emits Typés
Utiliser TypeScript pour typer props et emits.

## Structure des Composants

```
components/
├── character/
│   ├── CharacterSheet.vue          # Fiche complète
│   ├── CharacterHeader.vue         # En-tête avec nom, avatar
│   ├── CharacterThemes.vue         # Liste des thèmes
│   └── CharacterStatuses.vue       # Statuts actifs
│
├── theme/
│   ├── ThemeCard.vue               # Carte de thème
│   ├── ThemeHeader.vue             # Header du thème
│   ├── ThemeTags.vue               # Liste des tags
│   ├── ThemeImprovements.vue       # Améliorations
│   └── ThemeAttention.vue          # Barre d'attention
│
├── tag/
│   ├── TagList.vue                 # Liste de tags
│   ├── TagItem.vue                 # Tag individuel
│   ├── TagSelector.vue             # Sélecteur pour jets
│   └── TagEditor.vue               # Éditeur de tag
│
├── status/
│   ├── StatusList.vue              # Liste de statuts
│   ├── StatusItem.vue              # Statut individuel
│   ├── StatusSelector.vue          # Sélecteur pour jets
│   └── StatusEditor.vue            # Éditeur de statut
│
├── roll/
│   ├── RollDialog.vue              # Dialogue de jet
│   ├── RollModifiers.vue           # Affichage des modificateurs
│   ├── RollResult.vue              # Résultat du jet
│   ├── RollHistory.vue             # Historique
│   └── DiceAnimation.vue           # Animation des dés
│
├── move/
│   ├── MoveList.vue                # Liste des moves
│   ├── MoveCard.vue                # Carte de move
│   └── MoveButton.vue              # Bouton d'action
│
└── ui/
    ├── Button.vue                  # Bouton réutilisable
    ├── Card.vue                    # Carte réutilisable
    ├── Dialog.vue                  # Dialog réutilisable
    ├── Dropdown.vue                # Dropdown
    └── IconButton.vue              # Bouton avec icône
```

## Composants Principaux - Exemples Détaillés

### 1. CharacterSheet.vue (Page Principale)

```vue
<script setup lang="ts">
import type { Character } from '~/types/character';

const props = defineProps<{
  characterId: string;
}>();

// Composables
const { character, loading, error } = useCharacter(props.characterId);
const { selectedTags, selectedStatuses, calculateModifier } = useRollModifiers();
const rollDialog = ref(false);

const openRollDialog = () => {
  rollDialog.value = true;
};
</script>

<template>
  <div class="character-sheet">
    <CharacterHeader
      v-if="character"
      :character="character"
      @edit="handleEdit"
    />

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Colonne gauche: Thèmes -->
      <div class="lg:col-span-2">
        <CharacterThemes
          v-if="character"
          :themes="character.themes"
          @tag-select="selectedTags.push($event)"
        />
      </div>

      <!-- Colonne droite: Statuts & Actions -->
      <div class="space-y-6">
        <CharacterStatuses
          :statuses="character?.statuses ?? []"
          @status-select="selectedStatuses.push($event)"
        />

        <MoveList
          :moves="character?.moves ?? []"
          :modifier="calculateModifier"
          @roll="openRollDialog"
        />
      </div>
    </div>

    <!-- Dialog de jet -->
    <RollDialog
      v-model="rollDialog"
      :character="character"
      :selected-tags="selectedTags"
      :selected-statuses="selectedStatuses"
    />
  </div>
</template>
```

### 2. ThemeCard.vue

```vue
<script setup lang="ts">
import type { Theme } from '~/types/character';

const props = defineProps<{
  theme: Theme;
  selectable?: boolean;
}>();

const emit = defineEmits<{
  'tag-select': [tag: Tag, polarity: number];
  'tag-burn': [tag: Tag];
  'edit': [theme: Theme];
}>();

const { attention, maxAttention, canImprove } = useThemeProgression(
  () => props.theme
);

const handleTagClick = (tag: Tag, polarity: number) => {
  if (props.selectable && !tag.burned) {
    emit('tag-select', tag, polarity);
  }
};
</script>

<template>
  <Card class="theme-card" :class="`theme-${theme.type.toLowerCase()}`">
    <ThemeHeader
      :theme="theme"
      :attention="attention"
      :max-attention="maxAttention"
      :can-improve="canImprove"
      @edit="emit('edit', theme)"
    />

    <div class="theme-body">
      <!-- Mystery/Identity -->
      <div v-if="theme.mystery" class="mb-4">
        <h4 class="text-sm font-semibold">Mystery</h4>
        <p class="text-sm text-gray-600">{{ theme.mystery }}</p>
      </div>

      <!-- Tags -->
      <ThemeTags
        :tags="theme.tags"
        :selectable="selectable"
        @tag-click="handleTagClick"
        @tag-burn="emit('tag-burn', $event)"
      />

      <!-- Improvements -->
      <ThemeImprovements
        v-if="theme.improvements.length > 0"
        :improvements="theme.improvements"
      />
    </div>
  </Card>
</template>

<style scoped>
.theme-card {
  border-left: 4px solid;
}

.theme-mythos {
  border-left-color: #9333ea; /* purple-600 */
}

.theme-logos {
  border-left-color: #2563eb; /* blue-600 */
}

.theme-legend_origin {
  border-left-color: #dc2626; /* red-600 */
}

.theme-legend_adventure {
  border-left-color: #16a34a; /* green-600 */
}

.theme-legend_greatness {
  border-left-color: #ca8a04; /* yellow-600 */
}
</style>
```

### 3. TagItem.vue (Composant Réutilisable)

```vue
<script setup lang="ts">
import type { Tag } from '~/types/character';

const props = defineProps<{
  tag: Tag;
  selectable?: boolean;
  selected?: boolean;
  polarity?: number; // -1, 0, 1
}>();

const emit = defineEmits<{
  click: [polarity: number];
  burn: [];
  edit: [];
}>();

const tagClasses = computed(() => {
  const classes = ['tag-item'];

  if (props.tag.burned) {
    classes.push('tag-burned');
  }

  if (props.selected) {
    if (props.polarity === 1) classes.push('tag-positive');
    else if (props.polarity === -1) classes.push('tag-negative');
  }

  if (props.selectable && !props.tag.burned) {
    classes.push('tag-selectable');
  }

  switch (props.tag.type) {
    case 'POWER':
      classes.push('tag-power');
      break;
    case 'WEAKNESS':
      classes.push('tag-weakness');
      break;
    case 'STORY':
      classes.push('tag-story');
      break;
  }

  return classes;
});

const handleClick = (event: MouseEvent) => {
  if (!props.selectable || props.tag.burned) return;

  // Left click = positive, Right click = negative
  const polarity = event.button === 2 ? -1 : 1;
  emit('click', polarity);
};

const handleBurn = () => {
  emit('burn');
};
</script>

<template>
  <div
    :class="tagClasses"
    @click="handleClick"
    @contextmenu.prevent="handleClick($event)"
    @dblclick="emit('edit')"
  >
    <div class="tag-header">
      <span class="tag-name">{{ tag.name }}</span>

      <div v-if="selectable" class="tag-actions">
        <!-- Bouton burn -->
        <IconButton
          v-if="!tag.burned"
          icon="i-heroicons-fire"
          size="xs"
          variant="ghost"
          @click.stop="handleBurn"
        />

        <!-- Indicateur burned -->
        <Icon
          v-else
          name="i-heroicons-fire-solid"
          class="text-red-500"
        />
      </div>
    </div>

    <!-- Question (power tags) -->
    <p v-if="tag.question" class="tag-question">
      {{ tag.question }}
    </p>

    <!-- Subtags -->
    <div v-if="tag.subtags.length > 0" class="tag-subtags">
      <span
        v-for="subtag in tag.subtags"
        :key="subtag"
        class="subtag"
      >
        {{ subtag }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.tag-item {
  @apply p-3 rounded-lg border-2 border-gray-200 transition-all cursor-pointer;
}

.tag-selectable:hover {
  @apply border-gray-400 shadow-md;
}

.tag-positive {
  @apply border-green-500 bg-green-50;
}

.tag-negative {
  @apply border-red-500 bg-red-50;
}

.tag-burned {
  @apply opacity-50 cursor-not-allowed border-gray-300;
}

.tag-power {
  @apply border-l-4 border-l-purple-500;
}

.tag-weakness {
  @apply border-l-4 border-l-red-500;
}

.tag-story {
  @apply border-l-4 border-l-blue-500;
}

.tag-header {
  @apply flex items-center justify-between;
}

.tag-name {
  @apply font-semibold text-gray-900;
}

.tag-question {
  @apply text-sm text-gray-600 italic mt-2;
}

.tag-subtags {
  @apply flex flex-wrap gap-1 mt-2;
}

.subtag {
  @apply text-xs bg-gray-200 px-2 py-1 rounded;
}
</style>
```

### 4. RollDialog.vue

```vue
<script setup lang="ts">
import type { Character, Tag, Status } from '~/types/character';

const props = defineProps<{
  modelValue: boolean;
  character: Character | null;
  selectedTags: Tag[];
  selectedStatuses: Status[];
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

const { roll, rolling, result } = useDiceRoll();
const { calculateModifier } = useRollModifiers();

const modifier = computed(() =>
  calculateModifier(props.selectedTags, props.selectedStatuses)
);

const selectedMove = ref<string | null>(null);

const executeRoll = async () => {
  if (!props.character || !selectedMove.value) return;

  const rollResult = await roll({
    characterId: props.character.id,
    moveId: selectedMove.value,
    modifiers: modifier.value,
    tagsUsed: props.selectedTags.map(t => t.id),
    statusesUsed: props.selectedStatuses.map(s => s.id),
  });

  // Afficher le résultat
  result.value = rollResult;
};

const close = () => {
  emit('update:modelValue', false);
};
</script>

<template>
  <Dialog :model-value="modelValue" @update:model-value="close">
    <template #title>
      Make a Move
    </template>

    <div class="space-y-6">
      <!-- Sélection du move -->
      <div>
        <label class="block text-sm font-medium mb-2">
          Select Move
        </label>
        <select
          v-model="selectedMove"
          class="w-full rounded-lg border-gray-300"
        >
          <option :value="null">Choose a move...</option>
          <option
            v-for="move in character?.moves"
            :key="move.id"
            :value="move.id"
          >
            {{ move.name }}
          </option>
        </select>
      </div>

      <!-- Modificateurs -->
      <RollModifiers
        :tags="selectedTags"
        :statuses="selectedStatuses"
        :total-modifier="modifier"
      />

      <!-- Résultat (après le jet) -->
      <RollResult
        v-if="result"
        :result="result"
      />
    </div>

    <template #actions>
      <Button variant="outline" @click="close">
        Cancel
      </Button>
      <Button
        :disabled="!selectedMove || rolling"
        :loading="rolling"
        @click="executeRoll"
      >
        Roll 2d6
      </Button>
    </template>
  </Dialog>
</template>
```

## Composables Réutilisables

### 1. useCharacter.ts

```typescript
// composables/useCharacter.ts
export const useCharacter = (characterId: MaybeRef<string>) => {
  const id = computed(() => unref(characterId));

  const { data: character, pending: loading, error } = useFetch(
    () => `/api/characters/${id.value}`,
    {
      key: `character-${id.value}`,
      // Rafraîchir toutes les 30s si nécessaire
      // refresh: 30000,
    }
  );

  const refresh = () => refreshNuxtData(`character-${id.value}`);

  return {
    character,
    loading,
    error,
    refresh
  };
};
```

### 2. useRollModifiers.ts

```typescript
// composables/useRollModifiers.ts
import type { Tag, Status } from '~/types/character';

export interface SelectedTag extends Tag {
  polarity: number; // -1, 0, 1
}

export interface SelectedStatus extends Status {
  polarity: number;
}

export const useRollModifiers = () => {
  const selectedTags = ref<SelectedTag[]>([]);
  const selectedStatuses = ref<SelectedStatus[]>([]);

  const toggleTag = (tag: Tag, polarity: number) => {
    const index = selectedTags.value.findIndex(t => t.id === tag.id);

    if (index !== -1) {
      if (selectedTags.value[index].polarity === polarity) {
        // Désélectionner
        selectedTags.value.splice(index, 1);
      } else {
        // Changer la polarité
        selectedTags.value[index].polarity = polarity;
      }
    } else {
      // Ajouter
      selectedTags.value.push({ ...tag, polarity });
    }
  };

  const toggleStatus = (status: Status, polarity: number) => {
    const index = selectedStatuses.value.findIndex(s => s.id === status.id);

    if (index !== -1) {
      if (selectedStatuses.value[index].polarity === polarity) {
        selectedStatuses.value.splice(index, 1);
      } else {
        selectedStatuses.value[index].polarity = polarity;
      }
    } else {
      selectedStatuses.value.push({ ...status, polarity });
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
    toggleStatus,
    calculateModifier,
    reset
  };
};
```

### 3. useDiceRoll.ts

```typescript
// composables/useDiceRoll.ts
import type { RollResult, RollOptions } from '~/types/rolls';

export const useDiceRoll = () => {
  const rolling = ref(false);
  const result = ref<RollResult | null>(null);

  const roll = async (options: RollOptions): Promise<RollResult> => {
    rolling.value = true;

    try {
      const rollResult = await $fetch('/api/rolls/execute', {
        method: 'POST',
        body: options
      });

      result.value = rollResult;
      return rollResult;
    } finally {
      rolling.value = false;
    }
  };

  return {
    rolling,
    result,
    roll
  };
};
```

### 4. useThemeProgression.ts

```typescript
// composables/useThemeProgression.ts
import type { Theme } from '~/types/character';

export const useThemeProgression = (theme: () => Theme) => {
  const attention = computed(() => theme().attention);
  const maxAttention = computed(() => 5); // Configurable

  const canImprove = computed(() => attention.value >= maxAttention.value);

  const addAttention = async (points: number = 1) => {
    await $fetch(`/api/themes/${theme().id}/attention`, {
      method: 'POST',
      body: { points }
    });
  };

  const gainImprovement = async () => {
    if (!canImprove.value) return;

    await $fetch(`/api/themes/${theme().id}/improve`, {
      method: 'POST'
    });
  };

  return {
    attention,
    maxAttention,
    canImprove,
    addAttention,
    gainImprovement
  };
};
```

## Stratégie de Performance

### 1. Lazy Loading des Composants

```typescript
// pages/characters/[id].vue
const CharacterSheet = defineAsyncComponent(
  () => import('~/components/character/CharacterSheet.vue')
);

const RollDialog = defineAsyncComponent(
  () => import('~/components/roll/RollDialog.vue')
);
```

### 2. Virtual Scrolling pour Listes Longues

```vue
<script setup>
import { useVirtualList } from '@vueuse/core';

const { list, containerProps, wrapperProps } = useVirtualList(
  rollHistory,
  { itemHeight: 80 }
);
</script>

<template>
  <div v-bind="containerProps" class="h-96 overflow-auto">
    <div v-bind="wrapperProps">
      <RollHistoryItem
        v-for="{ data: roll } in list"
        :key="roll.id"
        :roll="roll"
      />
    </div>
  </div>
</template>
```

### 3. Optimistic Updates

```typescript
// Mise à jour optimiste lors de la sélection de tags
const toggleTag = (tag: Tag) => {
  // Mise à jour immédiate de l'UI
  selectedTags.value.push(tag);

  // Synchronisation serveur en arrière-plan (si nécessaire)
  $fetch('/api/selections', {
    method: 'POST',
    body: { tagId: tag.id }
  }).catch(() => {
    // Rollback en cas d'erreur
    selectedTags.value = selectedTags.value.filter(t => t.id !== tag.id);
  });
};
```

## Prochaines Étapes

Voir `04-api-routes-nitro.md` pour l'intégration des API routes correspondantes.
