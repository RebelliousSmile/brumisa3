<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <!-- Type de Tag -->
    <div>
      <label class="block text-sm font-medium text-gray-300 mb-2">
        Type de Tag *
      </label>
      <div class="grid grid-cols-3 gap-2">
        <button
          v-for="type in tagTypes"
          :key="type.value"
          type="button"
          :class="tagTypeButtonClasses(type.value)"
          @click="formData.type = type.value"
          :disabled="!canAddType(type.value)"
        >
          <div class="flex flex-col items-center gap-1">
            <span class="font-bold text-sm">{{ type.label }}</span>
            <span class="text-xs opacity-75">{{ type.count }}</span>
          </div>
        </button>
      </div>
      <p v-if="errors.type" class="mt-2 text-sm text-red-400">
        {{ errors.type }}
      </p>
    </div>

    <!-- Nom du Tag -->
    <div>
      <label for="tag-name" class="block text-sm font-medium text-gray-300 mb-2">
        Nom du Tag *
      </label>
      <UiInput
        id="tag-name"
        v-model="formData.name"
        :placeholder="tagPlaceholder"
        required
        :error="errors.name"
      />
      <p v-if="errors.name" class="mt-1 text-sm text-red-400">
        {{ errors.name }}
      </p>
    </div>

    <!-- Flags (burned, inverted) - Mode édition uniquement -->
    <div v-if="isEditing" class="grid grid-cols-2 gap-3">
      <label class="flex items-center gap-2 p-3 bg-navy-700 border border-navy-600 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
        <input
          v-model="formData.burned"
          type="checkbox"
          class="w-4 h-4 text-blue-500 bg-navy-600 border-navy-500 rounded focus:ring-blue-500 focus:ring-2"
        />
        <span class="text-sm text-gray-300">
          Burned (brûlé)
        </span>
      </label>

      <label class="flex items-center gap-2 p-3 bg-navy-700 border border-navy-600 rounded-lg cursor-pointer hover:border-purple-500 transition-colors">
        <input
          v-model="formData.inverted"
          type="checkbox"
          class="w-4 h-4 text-purple-500 bg-navy-600 border-navy-500 rounded focus:ring-purple-500 focus:ring-2"
        />
        <span class="text-sm text-gray-300">
          Inverted (inversé)
        </span>
      </label>
    </div>

    <!-- Validation Info -->
    <div v-if="validationMessage" :class="validationMessageClasses">
      <Icon :name="validationIcon" class="w-5 h-5" />
      <span class="text-sm">{{ validationMessage }}</span>
    </div>

    <!-- Actions -->
    <div class="flex items-center justify-end gap-3 pt-2">
      <UiButton
        type="button"
        variant="ghost"
        size="sm"
        @click="handleCancel"
        :disabled="loading"
      >
        Annuler
      </UiButton>
      <UiButton
        type="submit"
        variant="primary"
        size="sm"
        :loading="loading"
        :disabled="!canSubmit"
      >
        {{ isEditing ? 'Mettre à jour' : 'Ajouter' }}
      </UiButton>
    </div>
  </form>
</template>

<script setup lang="ts">
import { useTags } from '~/composables/useTags'
import type { Tag } from '~/shared/stores/character'

interface Props {
  themeCardId: string
  existingTags: Tag[]
  tag?: Tag // Si mode édition
}

const props = defineProps<Props>()

const emit = defineEmits<{
  submit: [data: any]
  cancel: []
}>()

const { canAddTag, countByType } = useTags()

// Form data
const formData = reactive({
  name: props.tag?.name || '',
  type: (props.tag?.type as 'POWER' | 'WEAKNESS' | 'STORY') || 'POWER',
  burned: props.tag?.burned || false,
  inverted: props.tag?.inverted || false
})

// Errors
const errors = reactive({
  name: '',
  type: ''
})

// Loading state
const loading = ref(false)

// Mode édition ou création
const isEditing = computed(() => !!props.tag)

// Count tags par type
const tagCounts = computed(() => countByType(props.existingTags))

// Types de tags avec counts
const tagTypes = computed(() => [
  {
    value: 'POWER' as const,
    label: 'Power',
    count: `${tagCounts.value.power}/5`,
    color: 'green'
  },
  {
    value: 'WEAKNESS' as const,
    label: 'Weakness',
    count: `${tagCounts.value.weakness}/2`,
    color: 'red'
  },
  {
    value: 'STORY' as const,
    label: 'Story',
    count: `${tagCounts.value.story}`,
    color: 'blue'
  }
])

// Peut-on ajouter ce type de tag ?
function canAddType(type: 'POWER' | 'WEAKNESS' | 'STORY'): boolean {
  if (isEditing.value && props.tag?.type === type) {
    return true // Editing same type is always allowed
  }
  return canAddTag(props.existingTags, type).valid
}

// Classes pour les boutons de type
function tagTypeButtonClasses(type: 'POWER' | 'WEAKNESS' | 'STORY') {
  const isSelected = formData.type === type
  const canAdd = canAddType(type)

  const baseClasses = 'p-3 rounded-lg border-2 transition-all'

  if (!canAdd) {
    return `${baseClasses} bg-navy-700 border-gray-600 text-gray-500 opacity-50 cursor-not-allowed`
  }

  const colorClasses = {
    POWER: isSelected
      ? 'bg-gradient-to-r from-green-600 to-emerald-600 border-green-500 text-white shadow-lg'
      : 'bg-navy-700 border-green-500/30 text-green-400 hover:border-green-500 hover:bg-green-900/20',
    WEAKNESS: isSelected
      ? 'bg-gradient-to-r from-red-600 to-rose-600 border-red-500 text-white shadow-lg'
      : 'bg-navy-700 border-red-500/30 text-red-400 hover:border-red-500 hover:bg-red-900/20',
    STORY: isSelected
      ? 'bg-gradient-to-r from-blue-600 to-blue-600 border-blue-500 text-white shadow-lg'
      : 'bg-navy-700 border-blue-500/30 text-blue-400 hover:border-blue-500 hover:bg-blue-900/20'
  }

  return `${baseClasses} ${colorClasses[type]}`
}

// Placeholder selon le type
const tagPlaceholder = computed(() => {
  const placeholders = {
    POWER: 'Ex: Teleport through shadows, Tech mastery...',
    WEAKNESS: 'Ex: Vulnerable to light, Afraid of heights...',
    STORY: 'Ex: Haunted by past, Seeking revenge...'
  }
  return placeholders[formData.type]
})

// Message de validation
const validationMessage = computed(() => {
  const validation = canAddTag(props.existingTags, formData.type)
  if (isEditing.value && props.tag?.type === formData.type) {
    return null // No validation message when editing same type
  }
  if (!validation.valid) {
    return validation.reason
  }
  return null
})

const validationMessageClasses = computed(() => {
  const base = 'flex items-center gap-2 p-3 rounded-lg'
  if (!canAddTag(props.existingTags, formData.type).valid) {
    return `${base} bg-red-900/20 border border-red-500/50 text-red-400`
  }
  return `${base} bg-blue-900/20 border border-blue-500/50 text-blue-400`
})

const validationIcon = computed(() => {
  if (!canAddTag(props.existingTags, formData.type).valid) {
    return 'heroicons:exclamation-circle'
  }
  return 'heroicons:information-circle'
})

// Can submit
const canSubmit = computed(() => {
  return formData.name.length >= 2 && canAddType(formData.type)
})

// Validate
function validate(): boolean {
  let isValid = true

  // Reset errors
  errors.name = ''
  errors.type = ''

  // Name
  if (formData.name.length < 2) {
    errors.name = 'Le nom doit contenir au moins 2 caractères'
    isValid = false
  }
  if (formData.name.length > 200) {
    errors.name = 'Le nom ne peut pas dépasser 200 caractères'
    isValid = false
  }

  // Type validation
  if (!canAddType(formData.type)) {
    errors.type = canAddTag(props.existingTags, formData.type).reason || 'Limite atteinte'
    isValid = false
  }

  return isValid
}

// Submit
function handleSubmit() {
  if (!validate()) return

  loading.value = true

  emit('submit', {
    name: formData.name,
    type: formData.type,
    burned: formData.burned,
    inverted: formData.inverted
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
