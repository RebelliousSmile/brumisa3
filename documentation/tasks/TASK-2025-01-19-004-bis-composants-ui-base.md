# Task - Composants UI de Base Génériques

## Métadonnées

- **ID**: TASK-2025-01-19-004-bis
- **Date de création**: 2025-01-20
- **Priorité**: P0 (MVP)
- **Statut**: À faire
- **Temps estimé**: 3h
- **Version cible**: MVP v1.0

## Description

### Objectif

Créer les composants UI de base réutilisables pour tous les hacks, avec adaptation automatique selon le contexte du playspace.

### Contexte

Les différents hacks (LITM, City of Mist, Otherscape) partagent des patterns UI communs mais avec des variations dans la terminologie et les styles. Les composants de base doivent être génériques tout en supportant ces variations.

### Périmètre

**Inclus dans cette tâche**:
- Composant CardBase.vue (wrapper pour toutes les cartes)
- Composant EditableTag.vue (tags adaptables)
- Composant PipIndicator.vue (progression universelle)
- Composant EditModeToggle.vue (mode édition)
- Composant FlipCard.vue (animation générique)
- Composables partagés avec contexte

**Exclu de cette tâche**:
- Logique métier spécifique aux hacks
- Intégration avec Prisma

## Architecture

### Structure des Composants

```
app/components/ui/
├── CardBase.vue           # Wrapper universel pour cartes
├── EditableTag.vue        # Tag avec styles selon hack
├── PipIndicator.vue       # Indicateur de progression
├── EditModeToggle.vue     # Toggle édition/lecture
├── FlipCard.vue           # Animation flip générique
└── BaseButton.vue         # Bouton avec thème adaptatif

app/composables/
├── useEditMode.ts         # Mode édition global
├── usePips.ts             # Gestion des progressions
└── useTheme.ts            # Thème selon le hack
```

## Plan d'Implémentation

### Étape 1: CardBase.vue Générique

```vue
<!-- app/components/ui/CardBase.vue -->
<template>
  <div
    class="card-base"
    :class="`card-base--${hackTheme}`"
    :data-test="'card-base'"
  >
    <header v-if="title || subtitle" class="card-base__header">
      <h3 v-if="title" class="card-base__title">
        {{ title }}
      </h3>
      <span v-if="subtitle" class="card-base__subtitle">
        {{ subtitle }}
      </span>
    </header>

    <div class="card-base__content">
      <slot name="content" />
    </div>

    <footer v-if="$slots.actions" class="card-base__actions">
      <slot name="actions" />
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { usePlayspaceStore } from '@/stores/playspace';

interface CardBaseProps {
  title?: string;
  subtitle?: string;
}

defineProps<CardBaseProps>();

const playspaceStore = usePlayspaceStore();
const hackTheme = computed(() =>
  playspaceStore.currentPlayspace?.hack?.slug || 'default'
);
</script>

<style scoped>
/* Styles de base */
.card-base {
  @apply bg-white dark:bg-gray-800 rounded-lg shadow-md p-4;
}

/* Variations par hack */
.card-base--litm {
  @apply border-2 border-amber-300;
}

.card-base--city-of-mist {
  @apply border-2 border-gray-500;
}

.card-base--otherscape {
  @apply border-2 border-purple-500;
}
</style>
```

### Étape 2: EditableTag.vue Adaptatif

```vue
<!-- app/components/ui/EditableTag.vue -->
<template>
  <div
    class="tag"
    :class="tagClasses"
    :data-test="`tag-${type}`"
  >
    <input
      v-if="editable && isEditing"
      v-model="localValue"
      @blur="save"
      @keyup.enter="save"
      @keyup.escape="cancel"
      class="tag__input"
      :aria-label="t('ui.tag.edit')"
    />
    <span
      v-else
      @click="editable && startEdit()"
      class="tag__content"
    >
      {{ modelValue }}
    </span>

    <button
      v-if="editable && !isEditing"
      @click="$emit('delete')"
      class="tag__delete"
      :aria-label="t('ui.tag.delete')"
    >
      ×
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useTranslations } from '@/composables/useTranslations';
import { usePlayspaceStore } from '@/stores/playspace';

interface TagProps {
  modelValue: string;
  type?: 'power' | 'weakness' | 'neutral';
  editable?: boolean;
}

const props = defineProps<TagProps>();
const emit = defineEmits(['update:modelValue', 'delete']);

const { t } = useTranslations();
const playspaceStore = usePlayspaceStore();

const isEditing = ref(false);
const localValue = ref(props.modelValue);

// Classes adaptées selon le hack
const tagClasses = computed(() => {
  const hack = playspaceStore.currentPlayspace?.hack?.slug;
  const base = ['tag', `tag--${props.type}`];

  if (hack) {
    base.push(`tag--${hack}`);
  }

  return base;
});

const startEdit = () => {
  isEditing.value = true;
  localValue.value = props.modelValue;
};

const save = () => {
  emit('update:modelValue', localValue.value);
  isEditing.value = false;
};

const cancel = () => {
  localValue.value = props.modelValue;
  isEditing.value = false;
};
</script>
```

### Étape 3: PipIndicator.vue Universel

```vue
<!-- app/components/ui/PipIndicator.vue -->
<template>
  <div class="pip-indicator" :data-test="'pip-indicator'">
    <span class="pip-indicator__label">
      {{ getLabel(current) }}
    </span>

    <div class="pip-indicator__pips">
      <button
        v-for="i in max"
        :key="i"
        @click="editable && setPip(i)"
        class="pip"
        :class="{ 'pip--filled': i <= current }"
        :disabled="!editable"
        :aria-label="`${t('ui.pip.set')} ${i}`"
        :data-test="`pip-${i}`"
      >
        <span class="pip__icon">{{ getPipIcon(i) }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useTranslations } from '@/composables/useTranslations';
import { usePlayspaceStore } from '@/stores/playspace';

interface PipProps {
  current: number;
  max?: number;
  editable?: boolean;
  labels?: string[];
}

const props = withDefaults(defineProps<PipProps>(), {
  max: 4,
  editable: false
});

const emit = defineEmits(['update']);
const { t } = useTranslations();
const playspaceStore = usePlayspaceStore();

// Labels adaptatifs selon le hack
const getLabel = (value: number) => {
  if (props.labels?.[value]) {
    return props.labels[value];
  }

  // Traduction contextuelle selon le hack
  return t(`progress.level.${value}`, `Level ${value}`);
};

// Icônes selon le hack
const getPipIcon = (index: number) => {
  const hack = playspaceStore.currentPlayspace?.hack?.slug;

  switch (hack) {
    case 'litm':
      return '●'; // Point simple
    case 'city-of-mist':
      return '◆'; // Diamant
    case 'otherscape':
      return '▲'; // Triangle
    default:
      return '●';
  }
};

const setPip = (value: number) => {
  emit('update', value);
};
</script>
```

### Étape 4: Composable useEditMode

```typescript
// app/composables/useEditMode.ts
import { ref, readonly } from 'vue';

const globalEditMode = ref(false);

export const useEditMode = () => {
  const isEditMode = readonly(globalEditMode);

  const toggleEditMode = () => {
    globalEditMode.value = !globalEditMode.value;

    // Sauvegarder la préférence
    localStorage.setItem('editMode', String(globalEditMode.value));
  };

  const setEditMode = (value: boolean) => {
    globalEditMode.value = value;
    localStorage.setItem('editMode', String(value));
  };

  // Restaurer la préférence au chargement
  const initEditMode = () => {
    const saved = localStorage.getItem('editMode');
    if (saved !== null) {
      globalEditMode.value = saved === 'true';
    }
  };

  return {
    isEditMode,
    toggleEditMode,
    setEditMode,
    initEditMode
  };
};
```

### Étape 5: Composable useTheme

```typescript
// app/composables/useTheme.ts
import { computed } from 'vue';
import { usePlayspaceStore } from '@/stores/playspace';

export const useTheme = () => {
  const playspaceStore = usePlayspaceStore();

  const hackSlug = computed(() =>
    playspaceStore.currentPlayspace?.hack?.slug || 'default'
  );

  const themeColors = computed(() => {
    switch (hackSlug.value) {
      case 'litm':
        return {
          primary: 'amber',
          secondary: 'orange',
          accent: 'yellow'
        };
      case 'city-of-mist':
        return {
          primary: 'gray',
          secondary: 'slate',
          accent: 'zinc'
        };
      case 'otherscape':
        return {
          primary: 'purple',
          secondary: 'violet',
          accent: 'indigo'
        };
      default:
        return {
          primary: 'blue',
          secondary: 'indigo',
          accent: 'cyan'
        };
    }
  });

  const getComponentClass = (base: string) => {
    return `${base} ${base}--${hackSlug.value}`;
  };

  return {
    hackSlug: readonly(hackSlug),
    themeColors: readonly(themeColors),
    getComponentClass
  };
};
```

### Étape 6: Tests E2E

```typescript
// tests/e2e/components/ui-base.spec.ts
import { test, expect } from '@playwright/test';

test.describe('UI Base Components', () => {
  test('should adapt styles based on playspace hack', async ({ page }) => {
    // Créer playspace LITM
    await setupPlayspace(page, 'litm', 'zamanora');
    await page.goto('/character/create');

    // Vérifier le thème LITM
    const card = page.locator('.card-base');
    await expect(card).toHaveClass(/card-base--litm/);

    // Changer vers playspace Otherscape
    await switchPlayspace(page, 'otherscape', 'tokyo');

    // Vérifier le thème Otherscape
    await expect(card).toHaveClass(/card-base--otherscape/);
  });

  test('should use correct translations for tags', async ({ page }) => {
    await setupPlayspace(page, 'litm', 'zamanora');
    await page.goto('/character/create');

    // Les labels devraient être traduits selon le hack
    await expect(page.locator('.tag__label'))
      .toContainText('Gift Tag'); // Traduction LITM
  });

  test('should toggle edit mode globally', async ({ page }) => {
    await page.goto('/character/create');

    // Activer le mode édition
    await page.click('[data-test="edit-mode-toggle"]');

    // Tous les composants devraient être éditables
    await expect(page.locator('.tag')).toHaveClass(/tag--editable/);
    await expect(page.locator('.pip')).not.toBeDisabled();
  });
});
```

## Critères d'Acceptation

- [ ] Composants s'adaptent au hack du playspace
- [ ] Traductions contextuelles fonctionnent
- [ ] Mode édition global se propage
- [ ] Styles différenciés par hack
- [ ] Accessible (ARIA labels)
- [ ] Tests E2E passent
- [ ] Performance <50ms pour render

## Dépendances

- **Bloqué par**: TASK-001 (Système traductions)
- **Bloque**: TASK-005, 006, 007 (Composants spécifiques)

## Notes

Cette approche permet :
- Réutilisabilité maximale entre hacks
- Adaptation automatique au contexte
- Extension facile pour nouveaux hacks
- Cohérence UI à travers l'application

## Références

- [Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)
- [Architecture Composants](../ARCHITECTURE/04-composants-vue-essentiels.md)