<template>
  <div class="theme-type-selector" role="radiogroup" :aria-label="ariaLabel">
    <h3 v-if="showTitle" class="selector-title">
      Choisissez un type de theme
    </h3>

    <div
      class="types-grid"
      @keydown="handleKeyDown"
    >
      <button
        v-for="(type, index) in availableTypes"
        :key="type.id"
        :ref="el => setButtonRef(el as HTMLButtonElement, index)"
        type="button"
        role="radio"
        :aria-checked="selectedType === type.id"
        :aria-label="`${type.label}: ${type.description}`"
        class="type-card"
        :class="{ selected: selectedType === type.id }"
        :style="{
          '--type-color': type.color,
          '--type-color-rgb': type.colorRgb,
          '--type-glow': type.glowColor
        }"
        :tabindex="selectedType === type.id || (index === 0 && !selectedType) ? 0 : -1"
        @click="selectType(type.id)"
        @focus="focusedIndex = index"
      >
        <div class="type-icon">
          <Icon :name="type.icon" class="w-8 h-8" />
        </div>
        <div class="type-info">
          <span class="type-label">{{ type.label }}</span>
          <span class="type-desc">{{ type.description }}</span>
        </div>
        <div v-if="selectedType === type.id" class="selected-indicator">
          <Icon name="heroicons:check-circle" class="w-5 h-5" />
        </div>
      </button>
    </div>

    <p v-if="hint" class="selector-hint">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
/**
 * ThemeTypeSelector - Selecteur visuel des types de Theme Card
 *
 * Affiche une grille de cartes cliquables pour chaque type de theme
 * disponible selon le hack selectionne. Design cyberpunk avec effets
 * glow neon et animations fluides.
 *
 * @example
 * ```vue
 * <ThemeTypeSelector
 *   :hack-id="hackId"
 *   v-model="selectedThemeType"
 *   @select="handleTypeSelect"
 * />
 * ```
 */
import { getThemeTypesForHack, type ThemeTypeConfig } from '#shared/config/theme-types.config'

interface Props {
  /** Hack ID pour determiner les types disponibles */
  hackId: string

  /** Type actuellement selectionne (v-model) */
  modelValue?: string

  /** Afficher le titre "Choisissez un type de theme" */
  showTitle?: boolean

  /** Texte d'aide sous la grille */
  hint?: string

  /** Label ARIA pour l'accessibilite */
  ariaLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  showTitle: true,
  ariaLabel: 'Selection du type de theme'
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  select: [type: ThemeTypeConfig]
}>()

// Types disponibles selon le hack
const availableTypes = computed(() => getThemeTypesForHack(props.hackId))

// Type selectionne
const selectedType = computed({
  get: () => props.modelValue,
  set: (value: string | undefined) => {
    if (value) {
      emit('update:modelValue', value)
    }
  }
})

// Focus management pour navigation clavier
const focusedIndex = ref(0)
const buttonRefs = ref<(HTMLButtonElement | null)[]>([])

function setButtonRef(el: HTMLButtonElement | null, index: number) {
  buttonRefs.value[index] = el
}

/**
 * Selectionne un type de theme
 */
function selectType(typeId: string) {
  selectedType.value = typeId

  const typeConfig = availableTypes.value.find(t => t.id === typeId)
  if (typeConfig) {
    emit('select', typeConfig)
  }
}

/**
 * Navigation clavier (fleches, Home, End)
 */
function handleKeyDown(event: KeyboardEvent) {
  const itemCount = availableTypes.value.length
  let newIndex = focusedIndex.value

  switch (event.key) {
    case 'ArrowRight':
    case 'ArrowDown':
      event.preventDefault()
      newIndex = (focusedIndex.value + 1) % itemCount
      break
    case 'ArrowLeft':
    case 'ArrowUp':
      event.preventDefault()
      newIndex = (focusedIndex.value - 1 + itemCount) % itemCount
      break
    case 'Home':
      event.preventDefault()
      newIndex = 0
      break
    case 'End':
      event.preventDefault()
      newIndex = itemCount - 1
      break
    case 'Enter':
    case ' ':
      event.preventDefault()
      selectType(availableTypes.value[focusedIndex.value].id)
      return
    default:
      return
  }

  focusedIndex.value = newIndex
  buttonRefs.value[newIndex]?.focus()
}
</script>

<style scoped>
/* Selector container */
.theme-type-selector {
  width: 100%;
}

/* Title */
.selector-title {
  font-size: 1rem;
  font-weight: 600;
  color: #00d9d9;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 1rem;
}

/* Grid layout - responsive */
.types-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 1rem;
}

@media (min-width: 640px) {
  .types-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .types-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Type card */
.type-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  background: #1a1a1a;
  border: 2px solid var(--type-color);
  border-radius: 0.75rem;
  padding: 1.5rem 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  outline: none;
}

/* Hover effect */
.type-card:hover {
  box-shadow: 0 0 20px var(--type-glow);
  transform: translateY(-2px);
}

/* Focus visible pour accessibilite */
.type-card:focus-visible {
  box-shadow: 0 0 0 3px rgba(var(--type-color-rgb), 0.5);
}

/* Selected state */
.type-card.selected {
  background: linear-gradient(
    135deg,
    rgba(var(--type-color-rgb), 0.15) 0%,
    rgba(var(--type-color-rgb), 0.05) 100%
  );
  box-shadow: 0 0 30px var(--type-glow);
  transform: translateY(-2px);
}

/* Selected indicator */
.selected-indicator {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  color: var(--type-color);
}

/* Icon container */
.type-icon {
  width: 3.5rem;
  height: 3.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--type-color);
  margin-bottom: 0.75rem;
  transition: transform 0.3s ease;
}

.type-card:hover .type-icon {
  transform: scale(1.1);
}

.type-card.selected .type-icon {
  filter: drop-shadow(0 0 8px var(--type-glow));
}

/* Type info */
.type-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.type-label {
  font-size: 1rem;
  font-weight: 700;
  color: #ffffff;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.type-desc {
  font-size: 0.75rem;
  color: #999999;
  line-height: 1.4;
}

.type-card.selected .type-desc {
  color: rgba(var(--type-color-rgb), 0.8);
}

/* Hint text */
.selector-hint {
  font-size: 0.75rem;
  color: #666666;
  margin-top: 1rem;
  text-align: center;
}

/* Animation keyframes */
@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 20px var(--type-glow);
  }
  50% {
    box-shadow: 0 0 35px var(--type-glow);
  }
}

.type-card.selected {
  animation: pulse-glow 2s ease-in-out infinite;
}

/* GPU acceleration for smooth animations */
.type-card {
  will-change: transform, box-shadow;
}
</style>
