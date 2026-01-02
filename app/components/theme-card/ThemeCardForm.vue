<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <!-- Nom de la Theme Card -->
    <div>
      <UiInput
        id="name"
        v-model="formData.name"
        label="Nom de la Theme Card"
        placeholder="Ex: Shadow Dancer, Tech Wizard..."
        required
        :error="errors.name"
      />
    </div>

    <!-- Type de Theme Card (selon hack) -->
    <div v-if="!preselectedType">
      <UiSelect
        id="type"
        v-model="formData.type"
        label="Type de Theme"
        placeholder="Selectionnez un type"
        required
        :error="errors.type"
        :options="themeTypeOptions"
        :hint="`Types disponibles pour ${hackLabel}`"
      />
    </div>
    <div v-else class="preselected-type-display">
      <label class="form-label">Type de Theme</label>
      <div class="type-badge-container">
        <span class="type-badge-large" :style="typeStyle">
          <Icon :name="typeIcon" class="w-5 h-5" />
          <span>{{ typeLabel }}</span>
        </span>
      </div>
    </div>

    <!-- Description (optionnel) -->
    <div>
      <UiTextarea
        id="description"
        v-model="formData.description"
        label="Description (optionnel)"
        placeholder="Decrivez les pouvoirs et capacites de ce theme..."
        :rows="4"
        :error="errors.description"
      />
    </div>

    <!-- Attention (progression) -->
    <div v-if="showAttention">
      <label for="attention" class="form-label">
        Attention (0-10)
      </label>
      <div class="flex items-center gap-4">
        <input
          id="attention"
          v-model.number="formData.attention"
          type="range"
          min="0"
          max="10"
          class="range-slider"
        />
        <span class="attention-value">
          {{ formData.attention }}
        </span>
      </div>
      <p class="form-hint">
        Progression de ce theme (0 = debut, 10 = maitrise)
      </p>
    </div>

    <!-- Count Theme Cards (si mode création) -->
    <div v-if="!isEditing && currentThemeCardCount !== undefined" class="info-card">
      <div class="flex items-center justify-between">
        <span class="info-label">
          Theme Cards actuelles
        </span>
        <span class="font-bold" :class="themeCardCountColor">
          {{ currentThemeCardCount }} / 4
        </span>
      </div>
      <p class="form-hint mt-2">
        Min: 2, Max: 4 (regle Mist Engine)
      </p>
    </div>

    <!-- Actions -->
    <div class="flex items-center justify-end gap-3 pt-4">
      <UiButton
        type="button"
        variant="ghost"
        @click="handleCancel"
        :disabled="loading"
      >
        Annuler
      </UiButton>
      <UiButton
        type="submit"
        variant="primary"
        :loading="loading"
        :disabled="!canSubmit"
      >
        {{ isEditing ? 'Mettre à jour' : 'Créer' }}
      </UiButton>
    </div>
  </form>
</template>

<script setup lang="ts">
import { useThemeCards } from '~/composables/useThemeCards'
import { getThemeTypeConfig } from '#shared/config/theme-types.config'
import type { ThemeCard } from '~/shared/stores/character'

interface Props {
  hackId: string
  characterId?: string
  themeCard?: ThemeCard // Si mode edition
  currentThemeCardCount?: number // Pour validation max 4
  preselectedType?: string // Type preselectionne depuis ThemeTypeSelector
}

const props = defineProps<Props>()

const emit = defineEmits<{
  submit: [data: any]
  cancel: []
}>()

const { getAvailableThemeTypes, canAddThemeCard } = useThemeCards()

// Form data
const formData = reactive({
  name: props.themeCard?.name || '',
  type: props.themeCard?.type || props.preselectedType || '',
  description: props.themeCard?.description || '',
  attention: props.themeCard?.attention || 0
})

// Watch for preselectedType changes (when coming from ThemeTypeSelector)
watch(() => props.preselectedType, (newType) => {
  if (newType && !props.themeCard) {
    formData.type = newType
  }
}, { immediate: true })

// Errors
const errors = reactive({
  name: '',
  type: '',
  description: ''
})

// Loading state
const loading = ref(false)

// Mode édition ou création
const isEditing = computed(() => !!props.themeCard)

// Types de thèmes disponibles selon le hack
const themeTypes = computed(() => getAvailableThemeTypes(props.hackId))

// Format options pour UiSelect
const themeTypeOptions = computed(() => themeTypes.value.map(t => ({
  value: t.value,
  label: t.label
})))

// Label du hack
const hackLabel = computed(() => {
  const labels: Record<string, string> = {
    'litm': 'Legends in the Mist',
    'otherscape': 'Tokyo: Otherscape',
    'city-of-mist': 'City of Mist'
  }
  return labels[props.hackId] || props.hackId
})

// Afficher le slider Attention (tous les hacks)
const showAttention = computed(() => true)

// Preselected type display properties
const preselectedTypeConfig = computed(() => {
  if (!props.preselectedType) return null
  return getThemeTypeConfig(props.hackId, props.preselectedType)
})

const typeStyle = computed(() => {
  const config = preselectedTypeConfig.value
  if (!config) return {}
  return {
    '--type-color': config.color,
    '--type-color-rgb': config.colorRgb,
    background: `rgba(${config.colorRgb}, 0.2)`,
    borderColor: config.color,
    color: config.color
  }
})

const typeIcon = computed(() => {
  return preselectedTypeConfig.value?.icon || 'heroicons:squares-2x2'
})

const typeLabel = computed(() => {
  return preselectedTypeConfig.value?.label || props.preselectedType || ''
})

// Validation max 4 theme cards
const canAddNewCard = computed(() => {
  if (isEditing.value) return true
  if (props.currentThemeCardCount === undefined) return true
  return canAddThemeCard(props.currentThemeCardCount)
})

// Couleur count
const themeCardCountColor = computed(() => {
  if (props.currentThemeCardCount === undefined) return 'text-gray-400'
  if (props.currentThemeCardCount >= 4) return 'text-red-400'
  if (props.currentThemeCardCount >= 3) return 'text-yellow-400'
  return 'text-green-400'
})

// Can submit
const canSubmit = computed(() => {
  return formData.name.length >= 2 && formData.type && canAddNewCard.value
})

// Validate
function validate(): boolean {
  let isValid = true

  // Reset errors
  errors.name = ''
  errors.type = ''
  errors.description = ''

  // Name
  if (formData.name.length < 2) {
    errors.name = 'Le nom doit contenir au moins 2 caractères'
    isValid = false
  }
  if (formData.name.length > 100) {
    errors.name = 'Le nom ne peut pas dépasser 100 caractères'
    isValid = false
  }

  // Type
  if (!formData.type) {
    errors.type = 'Veuillez sélectionner un type de thème'
    isValid = false
  }

  // Description
  if (formData.description && formData.description.length > 1000) {
    errors.description = 'La description ne peut pas dépasser 1000 caractères'
    isValid = false
  }

  return isValid
}

// Submit
function handleSubmit() {
  if (!validate()) return
  if (!canAddNewCard.value) {
    alert('Maximum 4 Theme Cards par personnage')
    return
  }

  loading.value = true

  emit('submit', {
    name: formData.name,
    type: formData.type,
    description: formData.description || null,
    attention: formData.attention
  })

  // Loading will be handled by parent
  setTimeout(() => {
    loading.value = false
  }, 500)
}

// Cancel
function handleCancel() {
  emit('cancel')
}
</script>

<style scoped>
/* Form label */
.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #00d9d9;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Form hint */
.form-hint {
  font-size: 0.75rem;
  color: #999999;
  margin-top: 0.25rem;
}

/* Range slider - Otherscape style */
.range-slider {
  flex: 1;
  height: 0.5rem;
  background: #1a1a1a;
  border-radius: 9999px;
  appearance: none;
  cursor: pointer;
}

.range-slider::-webkit-slider-thumb {
  appearance: none;
  width: 1rem;
  height: 1rem;
  background: #00d9d9;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 0 10px rgba(0, 217, 217, 0.5);
  transition: all 0.2s ease;
}

.range-slider::-webkit-slider-thumb:hover {
  box-shadow: 0 0 15px rgba(0, 217, 217, 0.8);
  transform: scale(1.1);
}

.range-slider::-moz-range-thumb {
  width: 1rem;
  height: 1rem;
  background: #00d9d9;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 0 10px rgba(0, 217, 217, 0.5);
}

/* Attention value badge */
.attention-value {
  width: 3rem;
  text-align: center;
  font-weight: 700;
  color: #ffffff;
  background: #1a1a1a;
  border: 1px solid rgba(0, 217, 217, 0.3);
  padding: 0.25rem 0.75rem;
  border-radius: 0.5rem;
}

/* Info card */
.info-card {
  background: #1a1a1a;
  border: 1px solid rgba(0, 217, 217, 0.3);
  border-radius: 0.5rem;
  padding: 1rem;
}

.info-label {
  font-size: 0.875rem;
  color: #999999;
}

/* Theme card count colors */
:deep(.text-red-400) {
  color: #ff006e;
}

:deep(.text-yellow-400) {
  color: #ffaa44;
}

:deep(.text-green-400) {
  color: #22c55e;
}

/* Preselected type display */
.preselected-type-display {
  margin-bottom: 0.5rem;
}

.type-badge-container {
  display: flex;
  align-items: center;
}

.type-badge-large {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  border: 1px solid;
  font-weight: 600;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  box-shadow: 0 0 15px var(--type-glow, rgba(0, 217, 217, 0.3));
}
</style>
