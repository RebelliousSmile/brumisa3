<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <!-- Nom de la Theme Card -->
    <div>
      <label for="name" class="block text-sm font-medium text-gray-300 mb-2">
        Nom de la Theme Card *
      </label>
      <UiInput
        id="name"
        v-model="formData.name"
        placeholder="Ex: Shadow Dancer, Tech Wizard..."
        required
        :error="errors.name"
      />
      <p v-if="errors.name" class="mt-1 text-sm text-red-400">
        {{ errors.name }}
      </p>
    </div>

    <!-- Type de Theme Card (selon hack) -->
    <div>
      <label for="type" class="block text-sm font-medium text-gray-300 mb-2">
        Type de Thème *
      </label>
      <UiSelect
        id="type"
        v-model="formData.type"
        required
        :error="errors.type"
      >
        <option value="" disabled>Sélectionnez un type</option>
        <option
          v-for="option in themeTypes"
          :key="option.value"
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </UiSelect>
      <p v-if="errors.type" class="mt-1 text-sm text-red-400">
        {{ errors.type }}
      </p>
      <p class="mt-1 text-xs text-gray-500">
        Types disponibles pour {{ hackLabel }}
      </p>
    </div>

    <!-- Description (optionnel) -->
    <div>
      <label for="description" class="block text-sm font-medium text-gray-300 mb-2">
        Description (optionnel)
      </label>
      <UiTextarea
        id="description"
        v-model="formData.description"
        placeholder="Décrivez les pouvoirs et capacités de ce thème..."
        rows="4"
        :error="errors.description"
      />
      <p v-if="errors.description" class="mt-1 text-sm text-red-400">
        {{ errors.description }}
      </p>
    </div>

    <!-- Attention (progression) -->
    <div v-if="showAttention">
      <label for="attention" class="block text-sm font-medium text-gray-300 mb-2">
        Attention (0-10)
      </label>
      <div class="flex items-center gap-4">
        <input
          id="attention"
          v-model.number="formData.attention"
          type="range"
          min="0"
          max="10"
          class="flex-1 h-2 bg-navy-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
        <span class="w-12 text-center text-white font-bold bg-navy-700 px-3 py-1 rounded-lg">
          {{ formData.attention }}
        </span>
      </div>
      <p class="mt-1 text-xs text-gray-500">
        Progression de ce thème (0 = début, 10 = maîtrise)
      </p>
    </div>

    <!-- Count Theme Cards (si mode création) -->
    <div v-if="!isEditing && currentThemeCardCount !== undefined" class="p-4 bg-navy-700 border border-navy-600 rounded-lg">
      <div class="flex items-center justify-between">
        <span class="text-sm text-gray-400">
          Theme Cards actuelles
        </span>
        <span class="font-bold" :class="themeCardCountColor">
          {{ currentThemeCardCount }} / 4
        </span>
      </div>
      <p class="mt-2 text-xs text-gray-500">
        Min: 2, Max: 4 (règle City of Mist)
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
import type { ThemeCard } from '~/shared/stores/character'

interface Props {
  hackId: string
  characterId?: string
  themeCard?: ThemeCard // Si mode édition
  currentThemeCardCount?: number // Pour validation max 4
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
  type: props.themeCard?.type || '',
  description: props.themeCard?.description || '',
  attention: props.themeCard?.attention || 0
})

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
