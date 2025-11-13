<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <!-- Identity (ou Self pour Otherscape) -->
    <div>
      <label for="identity" class="block text-sm font-medium text-gray-300 mb-2">
        {{ labels.identity }} *
      </label>
      <UiTextarea
        id="identity"
        v-model="formData.identity"
        :placeholder="placeholders.identity"
        rows="4"
        required
        :error="errors.identity"
      />
      <p v-if="errors.identity" class="mt-1 text-sm text-red-400">
        {{ errors.identity }}
      </p>
      <p class="mt-1 text-xs text-gray-500">
        {{ helpText.identity }}
      </p>
    </div>

    <!-- Mystery (ou Itch pour Otherscape) -->
    <div>
      <label for="mystery" class="block text-sm font-medium text-gray-300 mb-2">
        {{ labels.mystery }} *
      </label>
      <UiTextarea
        id="mystery"
        v-model="formData.mystery"
        :placeholder="placeholders.mystery"
        rows="4"
        required
        :error="errors.mystery"
      />
      <p v-if="errors.mystery" class="mt-1 text-sm text-red-400">
        {{ errors.mystery }}
      </p>
      <p class="mt-1 text-xs text-gray-500">
        {{ helpText.mystery }}
      </p>
    </div>

    <!-- Aide contextuelle selon le hack -->
    <div class="p-4 bg-navy-700 border border-navy-600 rounded-lg">
      <div class="flex items-start gap-3">
        <Icon name="heroicons:information-circle" class="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <div class="text-sm text-gray-400">
          <p class="font-medium text-gray-300 mb-1">{{ hackLabel }}</p>
          <p>{{ hackDescription }}</p>
        </div>
      </div>
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
        Mettre à jour
      </UiButton>
    </div>
  </form>
</template>

<script setup lang="ts">
import { useHeroCard } from '~/composables/useHeroCard'
import type { HeroCard } from '~/shared/stores/character'

interface Props {
  hackId: string
  characterId: string
  heroCard?: HeroCard
}

const props = defineProps<Props>()

const emit = defineEmits<{
  submit: [data: { identity: string; mystery: string }]
  cancel: []
}>()

const { getLabels, getPlaceholders, getHelpText } = useHeroCard()

// Form data
const formData = reactive({
  identity: props.heroCard?.identity || '',
  mystery: props.heroCard?.mystery || ''
})

// Errors
const errors = reactive({
  identity: '',
  mystery: ''
})

// Loading state
const loading = ref(false)

// Labels contextuels selon le hack
const labels = computed(() => getLabels(props.hackId))
const placeholders = computed(() => getPlaceholders(props.hackId))
const helpText = computed(() => getHelpText(props.hackId))

// Label et description du hack
const hackLabel = computed(() => {
  const labels: Record<string, string> = {
    'litm': 'Legends in the Mist',
    'otherscape': 'Tokyo: Otherscape',
    'city-of-mist': 'City of Mist'
  }
  return labels[props.hackId] || props.hackId
})

const hackDescription = computed(() => {
  const descriptions: Record<string, string> = {
    'litm': 'Votre Identity et Mystery définissent votre héros légendaire et sa quête.',
    'otherscape': 'Votre Self et Itch représentent qui vous êtes dans ce monde technologique et ce qui vous pousse à agir.',
    'city-of-mist': 'Votre Identity mundane et votre Mystery mythique forment les deux facettes de votre personnage.'
  }
  return descriptions[props.hackId] || ''
})

// Can submit
const canSubmit = computed(() => {
  return formData.identity.length >= 2 && formData.mystery.length >= 2
})

// Validate
function validate(): boolean {
  let isValid = true

  // Reset errors
  errors.identity = ''
  errors.mystery = ''

  // Identity
  if (formData.identity.length < 2) {
    errors.identity = `${labels.value.identity} doit contenir au moins 2 caractères`
    isValid = false
  }
  if (formData.identity.length > 500) {
    errors.identity = `${labels.value.identity} ne peut pas dépasser 500 caractères`
    isValid = false
  }

  // Mystery
  if (formData.mystery.length < 2) {
    errors.mystery = `${labels.value.mystery} doit contenir au moins 2 caractères`
    isValid = false
  }
  if (formData.mystery.length > 500) {
    errors.mystery = `${labels.value.mystery} ne peut pas dépasser 500 caractères`
    isValid = false
  }

  return isValid
}

// Submit
function handleSubmit() {
  if (!validate()) return

  loading.value = true

  emit('submit', {
    identity: formData.identity,
    mystery: formData.mystery
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
