<script setup lang="ts">
/**
 * Page Creation Personnage - Wizard
 *
 * Workflow (< 60s target) :
 * 1. Informations de base (nom, description)
 * 2. Theme Cards (min 2 requis)
 * 3. Hero Card (Identity/Mystery)
 * 4. Validation et création
 *
 * Note: Trackers créés automatiquement, édition après création
 */

definePageMeta({
  layout: 'playspace',
  middleware: ['auth']
})

const router = useRouter()

// Stores
const characterStore = useCharacterStore()
const playspaceStore = usePlayspaceStore()
const uiStore = useUiStore()

// Composables
const { getAvailableThemeTypes } = useThemeCards()
const { getLabels } = useHeroCard()

// Wizard state
const currentStep = ref(1)
const totalSteps = 4

// Form data
const formData = reactive({
  // Step 1: Basic info
  name: '',
  description: '',

  // Step 2: Theme Cards (min 2)
  themeCards: [] as Array<{
    name: string
    type: string
    description: string
    attention: number
  }>,

  // Step 3: Hero Card
  identity: '',
  mystery: ''
})

// Computed
const playspace = computed(() => playspaceStore.activePlayspace)
const hackId = computed(() => playspace.value?.hackId || 'city-of-mist')
const heroCardLabels = computed(() => getLabels(hackId.value))
const themeTypes = computed(() => getAvailableThemeTypes(hackId.value))

const canProceedStep1 = computed(() => {
  return formData.name.length >= 2
})

const canProceedStep2 = computed(() => {
  return formData.themeCards.length >= 2
})

const canProceedStep3 = computed(() => {
  return formData.identity.length >= 2 && formData.mystery.length >= 2
})

const canFinalize = computed(() => {
  return canProceedStep1.value && canProceedStep2.value && canProceedStep3.value
})

// Navigation
function nextStep() {
  if (currentStep.value < totalSteps) {
    currentStep.value++
  }
}

function previousStep() {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

// Step 2: Theme Cards management
const showThemeCardForm = ref(false)
const editingThemeCardIndex = ref<number | null>(null)

const tempThemeCard = reactive({
  name: '',
  type: '',
  description: '',
  attention: 0
})

function resetTempThemeCard() {
  tempThemeCard.name = ''
  tempThemeCard.type = ''
  tempThemeCard.description = ''
  tempThemeCard.attention = 0
}

function handleAddThemeCardStep() {
  resetTempThemeCard()
  editingThemeCardIndex.value = null
  showThemeCardForm.value = true
}

function handleEditThemeCardStep(index: number) {
  const card = formData.themeCards[index]
  tempThemeCard.name = card.name
  tempThemeCard.type = card.type
  tempThemeCard.description = card.description
  tempThemeCard.attention = card.attention
  editingThemeCardIndex.value = index
  showThemeCardForm.value = true
}

function handleThemeCardFormSubmit(data: any) {
  if (editingThemeCardIndex.value !== null) {
    // Edit existing
    formData.themeCards[editingThemeCardIndex.value] = { ...data }
  } else {
    // Add new
    formData.themeCards.push({ ...data })
  }

  showThemeCardForm.value = false
  resetTempThemeCard()
  editingThemeCardIndex.value = null
}

function handleDeleteThemeCardStep(index: number) {
  formData.themeCards.splice(index, 1)
}

// Finalize: Create character
const creating = ref(false)

async function handleFinalize() {
  if (!canFinalize.value || !playspace.value) {
    uiStore.notifierErreur('Erreur', 'Veuillez compléter toutes les étapes')
    return
  }

  const startTime = Date.now()
  creating.value = true

  try {
    // Step 1: Create character with basic info
    const newCharacter = await characterStore.createCharacter({
      name: formData.name,
      description: formData.description,
      playspaceId: playspace.value.id
    })

    // Step 2: Add theme cards
    const { createThemeCard } = useThemeCards()
    for (const themeCardData of formData.themeCards) {
      await createThemeCard(newCharacter.id, themeCardData)
    }

    // Step 3: Update hero card
    const { updateHeroCard } = useHeroCard()
    await updateHeroCard(newCharacter.id, {
      identity: formData.identity,
      mystery: formData.mystery
    })

    const duration = Date.now() - startTime
    console.log(`[Character Creation] Completed in ${duration}ms`)

    if (duration > 60000) {
      console.warn('[Character Creation] Exceeded 60s target:', duration)
    }

    uiStore.notifierSucces(
      'Personnage créé',
      `${formData.name} a été créé en ${Math.round(duration / 1000)}s`
    )

    // Redirect to character view
    router.push(`/characters/${newCharacter.id}`)
  } catch (err) {
    console.error('Error creating character:', err)
    uiStore.notifierErreur('Erreur de création', 'Impossible de créer le personnage')
    creating.value = false
  }
}

useSeoMeta({
  title: 'Nouveau Personnage - Brumisa3',
  description: 'Creez un nouveau personnage dans votre playspace actif'
})
</script>

<template>
  <div class="min-h-screen bg-navy-900 p-8">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-white mb-2">
          Nouveau Personnage
        </h1>
        <p class="text-gray-400">
          {{ playspace?.name }} · {{ hackId }}
        </p>
      </div>

      <!-- Progress Stepper -->
      <div class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <div
            v-for="step in totalSteps"
            :key="step"
            class="flex items-center flex-1"
          >
            <div class="flex flex-col items-center">
              <div
                :class="[
                  'w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all',
                  currentStep >= step
                    ? 'bg-blue-600 text-white'
                    : 'bg-navy-700 text-gray-500 border-2 border-navy-600'
                ]"
              >
                {{ step }}
              </div>
              <span class="text-xs text-gray-400 mt-2">
                {{ ['Infos', 'Theme Cards', 'Hero Card', 'Finaliser'][step - 1] }}
              </span>
            </div>

            <div
              v-if="step < totalSteps"
              :class="[
                'flex-1 h-1 mx-2',
                currentStep > step ? 'bg-blue-600' : 'bg-navy-700'
              ]"
            />
          </div>
        </div>
      </div>

      <!-- Step Content -->
      <div class="bg-navy-800 border border-navy-600 rounded-2xl p-8">
        <!-- Step 1: Basic Info -->
        <div v-if="currentStep === 1" class="space-y-6">
          <h2 class="text-xl font-bold text-white mb-6">Informations de base</h2>

          <div>
            <label for="name" class="block text-sm font-medium text-gray-300 mb-2">
              Nom du personnage *
            </label>
            <UiInput
              id="name"
              v-model="formData.name"
              placeholder="Ex: Aria, Kaito, Shadow..."
              required
              autofocus
            />
          </div>

          <div>
            <label for="description" class="block text-sm font-medium text-gray-300 mb-2">
              Description (optionnel)
            </label>
            <UiTextarea
              id="description"
              v-model="formData.description"
              placeholder="Décrivez votre personnage..."
              :rows="6"
            />
          </div>
        </div>

        <!-- Step 2: Theme Cards -->
        <div v-if="currentStep === 2" class="space-y-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-bold text-white">
              Theme Cards
              <span class="text-lg font-normal text-gray-400 ml-2">
                ({{ formData.themeCards.length }}/4, min 2)
              </span>
            </h2>

            <UiButton
              variant="primary"
              icon="heroicons:plus"
              size="sm"
              @click="handleAddThemeCardStep"
              :disabled="formData.themeCards.length >= 4"
            >
              Ajouter
            </UiButton>
          </div>

          <!-- Theme Cards Form (inline) -->
          <div v-if="showThemeCardForm" class="mb-6 p-6 bg-navy-700 border border-blue-500 rounded-xl">
            <ThemeCardForm
              :hack-id="hackId"
              :current-theme-card-count="formData.themeCards.length"
              :theme-card="editingThemeCardIndex !== null ? formData.themeCards[editingThemeCardIndex] : undefined"
              @submit="handleThemeCardFormSubmit"
              @cancel="showThemeCardForm = false"
            />
          </div>

          <!-- Theme Cards Preview -->
          <div v-if="formData.themeCards.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              v-for="(card, index) in formData.themeCards"
              :key="index"
              class="p-4 bg-navy-700 border border-navy-600 rounded-lg"
            >
              <div class="flex items-start justify-between mb-2">
                <div class="flex-1">
                  <h3 class="font-bold text-white">{{ card.name }}</h3>
                  <span class="text-xs text-purple-400">{{ card.type }}</span>
                </div>
                <div class="flex gap-1">
                  <button
                    type="button"
                    class="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-blue-400 hover:bg-blue-900/20 rounded transition-colors"
                    @click="handleEditThemeCardStep(index)"
                  >
                    <Icon name="heroicons:pencil" class="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    class="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded transition-colors"
                    @click="handleDeleteThemeCardStep(index)"
                  >
                    <Icon name="heroicons:trash" class="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p v-if="card.description" class="text-xs text-gray-500 line-clamp-2">
                {{ card.description }}
              </p>
            </div>
          </div>

          <div v-else class="p-12 bg-navy-700 border-2 border-dashed border-navy-600 rounded-xl text-center">
            <Icon name="heroicons:squares-2x2" class="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p class="text-gray-400 mb-4">Aucune Theme Card créée</p>
            <p class="text-sm text-gray-500 mb-4">Minimum 2 Theme Cards requis pour continuer</p>
            <UiButton variant="primary" size="sm" @click="handleAddThemeCardStep">
              Créer la première Theme Card
            </UiButton>
          </div>
        </div>

        <!-- Step 3: Hero Card -->
        <div v-if="currentStep === 3" class="space-y-6">
          <h2 class="text-xl font-bold text-white mb-6">Hero Card</h2>

          <div>
            <label for="identity" class="block text-sm font-medium text-gray-300 mb-2">
              {{ heroCardLabels.identity }} *
            </label>
            <UiTextarea
              id="identity"
              v-model="formData.identity"
              :placeholder="`Décrivez ${heroCardLabels.identity.toLowerCase()}...`"
              rows="4"
              required
            />
          </div>

          <div>
            <label for="mystery" class="block text-sm font-medium text-gray-300 mb-2">
              {{ heroCardLabels.mystery }} *
            </label>
            <UiTextarea
              id="mystery"
              v-model="formData.mystery"
              :placeholder="`Décrivez ${heroCardLabels.mystery.toLowerCase()}...`"
              rows="4"
              required
            />
          </div>

          <div class="p-4 bg-blue-900/20 border border-blue-500/50 rounded-lg">
            <div class="flex items-start gap-3">
              <Icon name="heroicons:information-circle" class="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div class="text-sm text-gray-400">
                <p class="font-medium text-gray-300 mb-1">{{ hackId }}</p>
                <p>
                  Le {{ heroCardLabels.identity }} et le {{ heroCardLabels.mystery }} définissent
                  les deux facettes de votre personnage.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 4: Recap -->
        <div v-if="currentStep === 4" class="space-y-6">
          <h2 class="text-xl font-bold text-white mb-6">Récapitulatif</h2>

          <!-- Basic Info -->
          <div class="p-4 bg-navy-700 border border-navy-600 rounded-lg">
            <h3 class="font-bold text-white mb-2">{{ formData.name }}</h3>
            <p class="text-sm text-gray-400">{{ formData.description || 'Pas de description' }}</p>
          </div>

          <!-- Theme Cards Count -->
          <div class="p-4 bg-navy-700 border border-navy-600 rounded-lg">
            <div class="flex items-center justify-between">
              <span class="font-medium text-gray-300">Theme Cards</span>
              <span class="font-bold text-white">{{ formData.themeCards.length }}</span>
            </div>
            <div class="mt-2 flex flex-wrap gap-2">
              <span
                v-for="(card, index) in formData.themeCards"
                :key="index"
                class="px-3 py-1 bg-purple-900/50 border border-purple-500 text-purple-300 rounded-full text-xs"
              >
                {{ card.name }} ({{ card.type }})
              </span>
            </div>
          </div>

          <!-- Hero Card -->
          <div class="p-4 bg-navy-700 border border-navy-600 rounded-lg">
            <h3 class="font-bold text-white mb-3">Hero Card</h3>
            <div class="space-y-2 text-sm">
              <div>
                <span class="text-gray-500">{{ heroCardLabels.identity }}:</span>
                <span class="text-gray-300 ml-2">{{ formData.identity }}</span>
              </div>
              <div>
                <span class="text-gray-500">{{ heroCardLabels.mystery }}:</span>
                <span class="text-gray-300 ml-2">{{ formData.mystery }}</span>
              </div>
            </div>
          </div>

          <!-- Performance Info -->
          <div class="p-4 bg-green-900/20 border border-green-500/50 rounded-lg">
            <div class="flex items-start gap-3">
              <Icon name="heroicons:check-circle" class="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div class="text-sm text-gray-400">
                <p class="font-medium text-green-400 mb-1">Prêt à créer</p>
                <p>
                  Votre personnage sera créé avec ses Theme Cards et Hero Card.
                  Les Trackers seront initialisés automatiquement.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Navigation Buttons -->
      <div class="flex items-center justify-between mt-8">
        <UiButton
          v-if="currentStep > 1"
          variant="ghost"
          icon="heroicons:arrow-left"
          @click="previousStep"
          :disabled="creating"
        >
          Précédent
        </UiButton>
        <div v-else></div>

        <div class="flex gap-3">
          <UiButton
            variant="outline"
            @click="router.push('/characters')"
            :disabled="creating"
          >
            Annuler
          </UiButton>

          <UiButton
            v-if="currentStep < 3"
            variant="primary"
            icon-right="heroicons:arrow-right"
            @click="nextStep"
            :disabled="currentStep === 1 ? !canProceedStep1 : !canProceedStep2"
          >
            Suivant
          </UiButton>

          <UiButton
            v-else-if="currentStep === 3"
            variant="primary"
            icon-right="heroicons:arrow-right"
            @click="nextStep"
            :disabled="!canProceedStep3"
          >
            Suivant
          </UiButton>

          <UiButton
            v-else
            variant="primary"
            icon="heroicons:check"
            @click="handleFinalize"
            :loading="creating"
            :disabled="!canFinalize"
          >
            Créer le personnage
          </UiButton>
        </div>
      </div>

      <!-- Modal: Theme Card Form (for step 2) -->
      <UiModal
        v-model="showThemeCardForm"
        :title="editingThemeCardIndex !== null ? 'Modifier Theme Card' : 'Nouvelle Theme Card'"
        size="lg"
      >
        <ThemeCardForm
          :hack-id="hackId"
          :current-theme-card-count="formData.themeCards.length"
          :theme-card="editingThemeCardIndex !== null ? formData.themeCards[editingThemeCardIndex] : undefined"
          @submit="handleThemeCardFormSubmit"
          @cancel="showThemeCardForm = false"
        />
      </UiModal>
    </div>
  </div>
</template>
