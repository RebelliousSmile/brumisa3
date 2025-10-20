# Task - Composant ThemeCard Vue

## Métadonnées

- **ID**: TASK-2025-01-19-005
- **Date de création**: 2025-01-20
- **Priorité**: P0 (MVP)
- **Statut**: À faire
- **Temps estimé**: 6h
- **Version cible**: MVP v1.0

## Description

### Objectif

Créer le composant Vue 3 pour les cartes de thème adaptable selon le hack du playspace actif.

### Contexte

Les cartes de thème sont spécifiques aux hacks basés sur le Mist Engine :
- **LITM** : ThemeCards avec power/weakness tags et quêtes
- **City of Mist** : Similaire mais avec terminologie différente
- **Otherscape** : Protocols (structure différente)

Le composant doit s'adapter automatiquement selon le contexte du playspace.

### Périmètre

**Inclus dans cette tâche**:
- Composant ThemeCard générique
- Sous-composants Tag et Quest
- Support mode lecture/édition
- Flip card (recto/verso)
- Utilisation du système de traductions

**Exclu de cette tâche**:
- Composants pour Otherscape (Post-MVP)
- Drag & drop des tags (v1.4)

## Architecture

### Structure des Composants

```
app/components/
├── character/
│   ├── ThemeCard.vue           # Composant principal
│   ├── ThemeCardTag.vue        # Tag réutilisable
│   ├── ThemeCardQuest.vue      # Section quête
│   └── ThemeCardFlip.vue       # Animation flip
```

### Props et État

```typescript
// types/character.ts
interface ThemeCardProps {
  characterId: string
  themeCard: ThemeCard
  editable?: boolean
  locale?: string
}

interface ThemeCard {
  id: string
  type: 'CHARACTER' | 'FELLOWSHIP'
  category: 'ORIGIN' | 'ADVENTURE' | 'GREATNESS'
  themebook: string
  mainTag: string
  powerTags: Tag[]
  weaknessTags: Tag[]
  quest?: Quest
  improvements: string[]
}
```

## Plan d'Implémentation

### Étape 1: Composant Principal ThemeCard

```vue
<!-- app/components/character/ThemeCard.vue -->
<template>
  <div
    class="theme-card"
    :class="{ 'theme-card--flipped': isFlipped }"
    :data-test="'theme-card-' + themeCard.id"
  >
    <!-- Face avant -->
    <div class="theme-card__front">
      <!-- Header avec type et catégorie -->
      <div class="theme-card__header">
        <span class="theme-card__type">
          {{ t(`theme.type.${themeCard.type}`) }}
        </span>
        <span class="theme-card__category">
          {{ t(`theme.category.${themeCard.category}`) }}
        </span>
      </div>

      <!-- Themebook et Main Tag -->
      <div class="theme-card__identity">
        <h3 class="theme-card__themebook">{{ themeCard.themebook }}</h3>
        <p class="theme-card__main-tag">{{ themeCard.mainTag }}</p>
      </div>

      <!-- Power Tags -->
      <div class="theme-card__tags theme-card__tags--power">
        <h4>{{ t('theme.power_tags') }}</h4>
        <ThemeCardTag
          v-for="tag in themeCard.powerTags"
          :key="tag.id"
          :tag="tag"
          type="power"
          :editable="editable"
          @update="updateTag"
          @remove="removeTag"
        />
        <button
          v-if="editable"
          @click="addTag('power')"
          class="theme-card__add-tag"
          :data-test="'add-power-tag'"
        >
          + {{ t('theme.add_power_tag') }}
        </button>
      </div>

      <!-- Weakness Tags -->
      <div class="theme-card__tags theme-card__tags--weakness">
        <h4>{{ t('theme.weakness_tags') }}</h4>
        <ThemeCardTag
          v-for="tag in themeCard.weaknessTags"
          :key="tag.id"
          :tag="tag"
          type="weakness"
          :editable="editable"
          @update="updateTag"
          @remove="removeTag"
        />
      </div>

      <!-- Quest Section -->
      <ThemeCardQuest
        v-if="themeCard.quest"
        :quest="themeCard.quest"
        :editable="editable"
        @update="updateQuest"
      />

      <!-- Flip Button -->
      <button
        @click="isFlipped = !isFlipped"
        class="theme-card__flip-btn"
        :aria-label="t('theme.flip_card')"
      >
        ↻
      </button>
    </div>

    <!-- Face arrière (Improvements) -->
    <div class="theme-card__back">
      <h3>{{ t('theme.improvements') }}</h3>
      <ul class="theme-card__improvements">
        <li
          v-for="(improvement, index) in themeCard.improvements"
          :key="index"
        >
          {{ improvement }}
        </li>
      </ul>

      <button
        @click="isFlipped = !isFlipped"
        class="theme-card__flip-btn"
      >
        ↻
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useTranslations } from '@/composables/useTranslations';
import { useCharacterStore } from '@/stores/character';
import ThemeCardTag from './ThemeCardTag.vue';
import ThemeCardQuest from './ThemeCardQuest.vue';

const props = defineProps<ThemeCardProps>();

const { t } = useTranslations();
const characterStore = useCharacterStore();
const isFlipped = ref(false);

const updateTag = async (tagId: string, content: string) => {
  await characterStore.updateTag(props.characterId, tagId, content);
};

const removeTag = async (tagId: string) => {
  await characterStore.removeTag(props.characterId, tagId);
};

const addTag = async (type: 'power' | 'weakness') => {
  await characterStore.addTag(
    props.characterId,
    props.themeCard.id,
    type,
    t('theme.new_tag')
  );
};

const updateQuest = async (questId: string, updates: Partial<Quest>) => {
  await characterStore.updateQuest(props.characterId, questId, updates);
};
</script>
```

### Étape 2: Composant Tag

```vue
<!-- app/components/character/ThemeCardTag.vue -->
<template>
  <div
    class="tag"
    :class="`tag--${type}`"
    :data-test="`tag-${tag.id}`"
  >
    <input
      v-if="editable && isEditing"
      v-model="localContent"
      @blur="save"
      @keyup.enter="save"
      @keyup.escape="cancel"
      class="tag__input"
      :data-test="`tag-input-${tag.id}`"
    />
    <span
      v-else
      @click="editable && startEdit()"
      class="tag__content"
      :class="{ 'tag__content--editable': editable }"
    >
      {{ tag.content }}
    </span>

    <button
      v-if="editable"
      @click="$emit('remove', tag.id)"
      class="tag__remove"
      :aria-label="t('theme.remove_tag')"
      :data-test="`remove-tag-${tag.id}`"
    >
      ×
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useTranslations } from '@/composables/useTranslations';

interface TagProps {
  tag: Tag;
  type: 'power' | 'weakness';
  editable?: boolean;
}

const props = defineProps<TagProps>();
const emit = defineEmits(['update', 'remove']);

const { t } = useTranslations();
const isEditing = ref(false);
const localContent = ref(props.tag.content);

const startEdit = () => {
  isEditing.value = true;
  localContent.value = props.tag.content;
};

const save = () => {
  if (localContent.value !== props.tag.content) {
    emit('update', props.tag.id, localContent.value);
  }
  isEditing.value = false;
};

const cancel = () => {
  localContent.value = props.tag.content;
  isEditing.value = false;
};
</script>
```

### Étape 3: Composant Quest

```vue
<!-- app/components/character/ThemeCardQuest.vue -->
<template>
  <div class="quest" :data-test="`quest-${quest.id}`">
    <div class="quest__header">
      <h4>{{ t('theme.quest') }}</h4>
      <div class="quest__pips">
        <button
          v-for="pip in maxPips"
          :key="pip"
          @click="editable && setPips(pip)"
          class="quest__pip"
          :class="{ 'quest__pip--filled': pip <= quest.pips }"
          :disabled="!editable"
          :aria-label="`${t('theme.set_pips')} ${pip}`"
          :data-test="`quest-pip-${pip}`"
        >
          ●
        </button>
      </div>
    </div>

    <div class="quest__content">
      <textarea
        v-if="editable && isEditing"
        v-model="localContent"
        @blur="save"
        class="quest__textarea"
        :data-test="`quest-textarea`"
      />
      <p
        v-else
        @click="editable && startEdit()"
        class="quest__text"
        :class="{ 'quest__text--editable': editable }"
      >
        {{ quest.content }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useTranslations } from '@/composables/useTranslations';

interface QuestProps {
  quest: Quest;
  editable?: boolean;
}

const props = defineProps<QuestProps>();
const emit = defineEmits(['update']);

const { t } = useTranslations();
const isEditing = ref(false);
const localContent = ref(props.quest.content);
const maxPips = computed(() => props.quest.maxPips || 4);

const startEdit = () => {
  isEditing.value = true;
  localContent.value = props.quest.content;
};

const save = () => {
  if (localContent.value !== props.quest.content) {
    emit('update', props.quest.id, { content: localContent.value });
  }
  isEditing.value = false;
};

const setPips = (value: number) => {
  emit('update', props.quest.id, { pips: value });
};
</script>
```

### Étape 4: Styles UnoCSS

```css
/* app/components/character/theme-card.css */
.theme-card {
  @apply relative bg-white dark:bg-gray-800 rounded-lg shadow-md p-4;
  transform-style: preserve-3d;
  transition: transform 0.6s;
}

.theme-card--flipped {
  transform: rotateY(180deg);
}

.theme-card__front,
.theme-card__back {
  @apply absolute inset-0 backface-hidden;
}

.theme-card__back {
  transform: rotateY(180deg);
}

.tag {
  @apply inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm;
}

.tag--power {
  @apply bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200;
}

.tag--weakness {
  @apply bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200;
}

.quest__pip {
  @apply w-6 h-6 rounded-full border-2 transition-colors;
}

.quest__pip--filled {
  @apply bg-primary-500 border-primary-500 text-white;
}
```

### Étape 5: Tests E2E

```typescript
// tests/e2e/components/theme-card.spec.ts
import { test, expect } from '@playwright/test';

test.describe('ThemeCard Component', () => {
  test.beforeEach(async ({ page }) => {
    // Setup playspace LITM/Zamanora
    await setupPlayspace(page, 'litm', 'zamanora');
    await createCharacterWithTheme(page);
  });

  test('should display theme card with translations', async ({ page }) => {
    // Vérifier que les traductions sont correctes selon le playspace
    await expect(page.locator('.theme-card__type'))
      .toContainText('Character'); // ou la traduction du hack

    await expect(page.locator('[data-test="theme-power-tags-title"]'))
      .toContainText('Gift Tags'); // Traduction LITM
  });

  test('should add and edit power tags', async ({ page }) => {
    await page.click('[data-test="add-power-tag"]');

    const newTag = page.locator('.tag--power').last();
    await newTag.click();
    await page.fill('.tag__input', 'Super Strength');
    await page.press('Enter');

    await expect(newTag).toContainText('Super Strength');
  });

  test('should flip card to show improvements', async ({ page }) => {
    await page.click('.theme-card__flip-btn');

    await expect(page.locator('.theme-card__back'))
      .toBeVisible();

    await expect(page.locator('.theme-card__improvements'))
      .toBeVisible();
  });

  test('should update quest pips', async ({ page }) => {
    await page.click('[data-test="quest-pip-3"]');

    const filledPips = page.locator('.quest__pip--filled');
    await expect(filledPips).toHaveCount(3);
  });

  test('should respect edit mode', async ({ page }) => {
    // En mode lecture
    await expect(page.locator('.tag__remove')).not.toBeVisible();
    await expect(page.locator('[data-test="add-power-tag"]')).not.toBeVisible();

    // Passer en mode édition
    await page.click('[data-test="toggle-edit-mode"]');

    await expect(page.locator('.tag__remove')).toBeVisible();
    await expect(page.locator('[data-test="add-power-tag"]')).toBeVisible();
  });
});
```

## Critères d'Acceptation

- [ ] Composant affiche les données correctement
- [ ] Traductions résolues selon le playspace (System→Hack→Universe)
- [ ] Mode édition fonctionne (ajout/modif/suppression tags)
- [ ] Flip card anime correctement
- [ ] Quest pips se mettent à jour
- [ ] Responsive et accessible (ARIA labels)
- [ ] Tests E2E passent
- [ ] Performance <100ms pour render initial

## Dépendances

- **Bloqué par**: TASK-001 (Système traductions)
- **Bloqué par**: TASK-004 (Modèle Prisma)
- **Bloque**: TASK-010 (Page création personnage)

## Notes

Cette approche permet :
- Adaptation automatique selon le hack du playspace
- Traductions contextuelles (Gift Tags pour LITM, Power Tags pour City of Mist)
- Réutilisabilité des sous-composants
- Extension facile pour d'autres hacks

## Références

- [Architecture Composants](../ARCHITECTURE/04-composants-vue-essentiels.md)
- [Système Traductions](../ARCHITECTURE/11-systeme-traductions-multi-niveaux.md)