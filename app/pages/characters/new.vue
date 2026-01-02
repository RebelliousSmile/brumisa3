<script setup lang="ts">
/**
 * Page Creation Personnage - Wizard
 *
 * Workflow (< 60s target) :
 * 1. Informations de base (nom, description)
 * 2. Theme Cards (min 2 requis)
 * 3. Hero Card (Identity/Mystery)
 * 4. Validation et creation
 *
 * Note: Trackers crees automatiquement, edition apres creation
 */

import { getThemeTypeConfig } from '#shared/config/theme-types.config'

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
const selectedThemeType = ref<string>('')

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
  selectedThemeType.value = ''
  showThemeCardForm.value = false
}

function handleThemeTypeSelect(typeId: string) {
  selectedThemeType.value = typeId
  tempThemeCard.type = typeId
  showThemeCardForm.value = true
}

function handleEditThemeCardStep(index: number) {
  const card = formData.themeCards[index]
  tempThemeCard.name = card.name
  tempThemeCard.type = card.type
  tempThemeCard.description = card.description
  tempThemeCard.attention = card.attention
  selectedThemeType.value = card.type
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
  selectedThemeType.value = ''
}

function handleThemeCardFormCancel() {
  showThemeCardForm.value = false
  resetTempThemeCard()
  editingThemeCardIndex.value = null
  selectedThemeType.value = ''
}

function handleDeleteThemeCardStep(index: number) {
  formData.themeCards.splice(index, 1)
}

/**
 * Retourne les styles CSS pour un type de theme
 */
function getTypeStyle(typeId: string): Record<string, string> {
  const config = getThemeTypeConfig(hackId.value, typeId)
  if (!config) {
    return {
      '--type-color': '#9d4edd',
      '--type-color-rgb': '157, 78, 221',
      '--type-glow': 'rgba(157, 78, 221, 0.5)'
    }
  }
  return {
    '--type-color': config.color,
    '--type-color-rgb': config.colorRgb,
    '--type-glow': config.glowColor
  }
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
  <div class="character-creation-page">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="page-header">
        <h1 class="page-title">
          Nouveau Personnage
        </h1>
        <p class="page-subtitle">
          {{ playspace?.name }} - {{ hackId }}
        </p>
      </div>

      <!-- Progress Stepper -->
      <UiStepper
        :current-step="currentStep"
        :labels="['Infos', 'Theme Cards', 'Hero Card', 'Finaliser']"
      />

      <!-- Step Content -->
      <div class="content-card">
        <!-- Step 1: Basic Info -->
        <div v-if="currentStep === 1" class="space-y-6">
          <h2 class="text-xl font-bold text-white mb-6">Informations de base</h2>

          <UiInput
            id="name"
            v-model="formData.name"
            label="Nom du personnage"
            placeholder="Ex: Aria, Kaito, Shadow..."
            required
            autofocus
          />

          <UiTextarea
            id="description"
            v-model="formData.description"
            label="Description (optionnel)"
            placeholder="Decrivez votre personnage..."
            :rows="6"
          />
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
              v-if="!showThemeCardForm && !selectedThemeType"
              variant="primary"
              icon="heroicons:plus"
              size="sm"
              @click="handleAddThemeCardStep"
              :disabled="formData.themeCards.length >= 4"
            >
              Ajouter
            </UiButton>
          </div>

          <!-- Theme Type Selector (step 1 of add flow) -->
          <div v-if="selectedThemeType === '' && editingThemeCardIndex === null && formData.themeCards.length < 4" class="theme-type-selector-container">
            <ThemeTypeSelector
              :hack-id="hackId"
              v-model="selectedThemeType"
              :show-title="formData.themeCards.length === 0"
              @select="(type) => handleThemeTypeSelect(type.id)"
              :hint="formData.themeCards.length === 0 ? 'Selectionnez le type de votre premiere Theme Card' : ''"
            />
          </div>

          <!-- Theme Cards Form (step 2 of add flow, or edit mode) -->
          <div v-if="showThemeCardForm" class="theme-card-form-container">
            <div class="form-header">
              <button
                v-if="editingThemeCardIndex === null"
                type="button"
                class="back-button"
                @click="handleThemeCardFormCancel"
              >
                <Icon name="heroicons:arrow-left" class="w-4 h-4" />
                <span>Changer de type</span>
              </button>
              <span v-if="selectedThemeType" class="selected-type-badge" :style="getTypeStyle(selectedThemeType)">
                {{ selectedThemeType }}
              </span>
            </div>
            <ThemeCardForm
              :hack-id="hackId"
              :current-theme-card-count="formData.themeCards.length"
              :theme-card="editingThemeCardIndex !== null ? formData.themeCards[editingThemeCardIndex] : undefined"
              :preselected-type="selectedThemeType"
              @submit="handleThemeCardFormSubmit"
              @cancel="handleThemeCardFormCancel"
            />
          </div>

          <!-- Theme Cards Preview -->
          <div v-if="formData.themeCards.length > 0 && !showThemeCardForm && selectedThemeType !== ''" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              v-for="(card, index) in formData.themeCards"
              :key="index"
              class="theme-card-preview"
              :style="getTypeStyle(card.type)"
            >
              <div class="flex items-start justify-between mb-2">
                <div class="flex-1">
                  <h3 class="font-bold text-white">{{ card.name }}</h3>
                  <span class="text-xs" :style="{ color: 'var(--type-color)' }">{{ card.type }}</span>
                </div>
                <div class="flex gap-1">
                  <button
                    type="button"
                    class="w-7 h-7 flex items-center justify-center text-gray-400 action-btn rounded"
                    @click="handleEditThemeCardStep(index)"
                  >
                    <Icon name="heroicons:pencil" class="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    class="w-7 h-7 flex items-center justify-center text-gray-400 action-btn action-btn-danger rounded"
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

          <!-- Theme Cards Preview when in selection mode -->
          <div v-else-if="formData.themeCards.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              v-for="(card, index) in formData.themeCards"
              :key="index"
              class="theme-card-preview"
              :style="getTypeStyle(card.type)"
            >
              <div class="flex items-start justify-between mb-2">
                <div class="flex-1">
                  <h3 class="font-bold text-white">{{ card.name }}</h3>
                  <span class="text-xs" :style="{ color: 'var(--type-color)' }">{{ card.type }}</span>
                </div>
                <div class="flex gap-1">
                  <button
                    type="button"
                    class="w-7 h-7 flex items-center justify-center text-gray-400 action-btn rounded"
                    @click="handleEditThemeCardStep(index)"
                  >
                    <Icon name="heroicons:pencil" class="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    class="w-7 h-7 flex items-center justify-center text-gray-400 action-btn action-btn-danger rounded"
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

          <div v-else-if="formData.themeCards.length === 0 && selectedThemeType === ''" class="empty-state-hint">
            <Icon name="heroicons:arrow-up" class="w-6 h-6 text-otherscape-cyan-neon/60 mx-auto mb-2" />
            <p class="text-sm text-gray-500">Selectionnez un type ci-dessus pour commencer</p>
          </div>
        </div>

        <!-- Step 3: Hero Card -->
        <div v-if="currentStep === 3" class="space-y-6">
          <h2 class="text-xl font-bold text-white mb-6">Hero Card</h2>

          <UiTextarea
            id="identity"
            v-model="formData.identity"
            :label="heroCardLabels.identity"
            :placeholder="`Decrivez ${heroCardLabels.identity.toLowerCase()}...`"
            rows="4"
            required
          />

          <UiTextarea
            id="mystery"
            v-model="formData.mystery"
            :label="heroCardLabels.mystery"
            :placeholder="`Decrivez ${heroCardLabels.mystery.toLowerCase()}...`"
            rows="4"
            required
          />

          <div class="info-box-cyan">
            <div class="flex items-start gap-3">
              <Icon name="heroicons:information-circle" class="w-5 h-5 text-otherscape-cyan-neon flex-shrink-0 mt-0.5" />
              <div class="text-sm text-gray-400">
                <p class="font-medium text-white mb-1">{{ hackId }}</p>
                <p>
                  Le {{ heroCardLabels.identity }} et le {{ heroCardLabels.mystery }} definissent
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
          <div class="recap-card">
            <h3 class="font-bold text-white mb-2">{{ formData.name }}</h3>
            <p class="text-sm text-gray-400">{{ formData.description || 'Pas de description' }}</p>
          </div>

          <!-- Theme Cards Count -->
          <div class="recap-card">
            <div class="flex items-center justify-between">
              <span class="font-medium text-gray-300">Theme Cards</span>
              <span class="font-bold text-otherscape-cyan-neon">{{ formData.themeCards.length }}</span>
            </div>
            <div class="mt-2 flex flex-wrap gap-2">
              <span
                v-for="(card, index) in formData.themeCards"
                :key="index"
                class="theme-badge"
              >
                {{ card.name }} ({{ card.type }})
              </span>
            </div>
          </div>

          <!-- Hero Card -->
          <div class="recap-card">
            <h3 class="font-bold text-white mb-3">Hero Card</h3>
            <div class="space-y-2 text-sm">
              <div>
                <span class="text-otherscape-cyan-neon">{{ heroCardLabels.identity }}:</span>
                <span class="text-gray-300 ml-2">{{ formData.identity }}</span>
              </div>
              <div>
                <span class="text-otherscape-cyan-neon">{{ heroCardLabels.mystery }}:</span>
                <span class="text-gray-300 ml-2">{{ formData.mystery }}</span>
              </div>
            </div>
          </div>

          <!-- Performance Info -->
          <div class="info-box-green">
            <div class="flex items-start gap-3">
              <Icon name="heroicons:check-circle" class="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div class="text-sm text-gray-400">
                <p class="font-medium text-green-400 mb-1">Pret a creer</p>
                <p>
                  Votre personnage sera cree avec ses Theme Cards et Hero Card.
                  Les Trackers seront initialises automatiquement.
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

    </div>
  </div>
</template>

<style scoped>
/* Page container */
.character-creation-page {
  min-height: 100vh;
  background: #0a0a0a;
  padding: 2rem;
}

/* Header */
.page-header {
  margin-bottom: 2rem;
}

.page-title {
  font-size: 1.875rem;
  font-weight: 800;
  color: #ffffff;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.page-subtitle {
  color: #00d9d9;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Content card */
.content-card {
  background: #1a1a1a;
  border: 1px solid rgba(0, 217, 217, 0.3);
  border-radius: 1rem;
  padding: 2rem;
  position: relative;
}

/* Scanline effect on card */
.content-card::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0, 217, 217, 0.02) 2px,
    rgba(0, 217, 217, 0.02) 4px
  );
  border-radius: inherit;
}

/* Form labels */
.content-card :deep(label) {
  color: #00d9d9;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Section titles */
.content-card h2 {
  color: #ffffff;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Theme card form container */
.theme-card-form-container {
  background: #1a1a1a;
  border: 1px solid #00d9d9;
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

/* Theme card preview */
.theme-card-preview {
  background: #1a1a1a;
  border: 1px solid rgba(0, 217, 217, 0.3);
  border-radius: 0.5rem;
  padding: 1rem;
  transition: all 0.2s ease;
}

.theme-card-preview:hover {
  border-color: #00d9d9;
  box-shadow: 0 0 15px rgba(0, 217, 217, 0.2);
}

/* Empty state */
.empty-state {
  background: rgba(0, 217, 217, 0.05);
  border: 2px dashed rgba(0, 217, 217, 0.3);
  border-radius: 0.75rem;
  padding: 3rem;
  text-align: center;
}

.empty-state:hover {
  border-color: rgba(0, 217, 217, 0.5);
  background: rgba(0, 217, 217, 0.08);
}

/* Info boxes */
.info-box-cyan {
  background: rgba(0, 217, 217, 0.1);
  border: 1px solid rgba(0, 217, 217, 0.3);
  border-radius: 0.5rem;
  padding: 1rem;
}

.info-box-green {
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 0.5rem;
  padding: 1rem;
}

/* Recap cards */
.recap-card {
  background: #1a1a1a;
  border: 1px solid rgba(0, 217, 217, 0.3);
  border-radius: 0.5rem;
  padding: 1rem;
}

/* Theme type badges */
.theme-badge {
  background: rgba(157, 78, 221, 0.2);
  border: 1px solid rgba(157, 78, 221, 0.5);
  color: #9d4edd;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
}

/* Action buttons hover */
.action-btn {
  transition: all 0.2s ease;
}

.action-btn:hover {
  color: #00d9d9;
  background: rgba(0, 217, 217, 0.1);
}

.action-btn-danger:hover {
  color: #ff006e;
  background: rgba(255, 0, 110, 0.1);
}

/* Theme type selector container */
.theme-type-selector-container {
  margin-bottom: 1.5rem;
}

/* Form header with back button */
.form-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(0, 217, 217, 0.2);
}

.back-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #999999;
  font-size: 0.875rem;
  transition: color 0.2s ease;
  background: none;
  border: none;
  cursor: pointer;
}

.back-button:hover {
  color: #00d9d9;
}

/* Selected type badge in form */
.selected-type-badge {
  background: rgba(var(--type-color-rgb, 157, 78, 221), 0.2);
  border: 1px solid var(--type-color, #9d4edd);
  color: var(--type-color, #9d4edd);
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Theme card preview with type colors */
.theme-card-preview {
  border-color: var(--type-color, rgba(0, 217, 217, 0.3));
}

.theme-card-preview:hover {
  border-color: var(--type-color, #00d9d9);
  box-shadow: 0 0 15px var(--type-glow, rgba(0, 217, 217, 0.2));
}

/* Empty state hint */
.empty-state-hint {
  text-align: center;
  padding: 2rem;
}
</style>
