<script setup lang="ts">
/**
 * Modal de création de Playspace
 * Wizard 5 étapes : Rôle → Système → Hack → Univers → Nom
 */

interface System {
  id: string
  name: string
  description: string
}

interface Hack {
  id: string
  systemId: string
  name: string
  description: string
}

interface Universe {
  id: string
  hackId: string
  name: string
  description: string
}

interface Props {
  isOpen: boolean
  preselectedHackId?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  created: [playspaceId: string]
}>()

// Données de référence - IDs alignés avec systems.config.ts
const systems: System[] = [
  { id: '2.0', name: 'Mist Engine', description: 'Le moteur de jeu narratif moderne et flexible' },
  { id: '1.0', name: 'City of Mist', description: 'Le système original avec Mythos et Logos' }
]

const hacks: Hack[] = [
  { id: 'litm', systemId: '2.0', name: 'Legends in the Mist', description: 'Theme Cards, Hero Card et Trackers pour récits héroïques' },
  { id: 'otherscape', systemId: '2.0', name: 'Tokyo:Otherscape', description: 'Cyberpunk japonais, technologie et mysticisme' },
  { id: 'city-of-mist', systemId: '1.0', name: 'City of Mist', description: 'Enquêtes urbaines et identités mythologiques' }
]

const universes: Universe[] = [
  // LITM universes
  { id: 'obojima', hackId: 'litm', name: 'Obojima', description: 'L\'univers par défaut de Legends in the Mist' },
  { id: 'litm-custom', hackId: 'litm', name: 'Univers personnalisé', description: 'Créez votre propre univers de jeu' },
  // Otherscape universes
  { id: 'tokyo-otherscape', hackId: 'otherscape', name: 'Tokyo:Otherscape', description: 'Megapole japonaise futuriste' },
  { id: 'otherscape-custom', hackId: 'otherscape', name: 'Univers personnalisé', description: 'Créez votre propre univers cyberpunk' },
  // City of Mist universes
  { id: 'the-city', hackId: 'city-of-mist', name: 'La Cité', description: 'La ville brumeuse originale' },
  { id: 'city-of-mist-custom', hackId: 'city-of-mist', name: 'Univers personnalisé', description: 'Créez votre propre cité' }
]

// Étapes du wizard
const currentStep = ref(1)
const totalSteps = 5

// Form state
const role = ref<'MJ' | 'PJ'>('PJ')
const selectedSystem = ref('')
const selectedHack = ref('')
const selectedUniverse = ref('')
const name = ref('')
const isLoading = ref(false)
const error = ref('')

// Computed: filtrer les options selon les sélections
const availableHacks = computed(() => {
  return hacks.filter(h => h.systemId === selectedSystem.value)
})

const availableUniverses = computed(() => {
  return universes.filter(u => u.hackId === selectedHack.value)
})

// Suggestions de noms
const nameSuggestions = computed(() => {
  const hack = hacks.find(h => h.id === selectedHack.value)
  const hackName = hack?.name.split(' ')[0] || 'Campagne'

  if (role.value === 'MJ') {
    return [
      `${hackName} - Ma Campagne`,
      `Campagne ${hackName}`,
      `${hackName} - Nouvelle Partie`
    ]
  }
  return [
    `${hackName} - Mon Personnage`,
    `Aventures ${hackName}`,
    `${hackName} - Session`
  ]
})

// Reset et présélection quand la modale s'ouvre
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    currentStep.value = 1
    role.value = 'PJ'
    error.value = ''
    name.value = ''

    // Présélectionner si hackId fourni
    if (props.preselectedHackId) {
      const hack = hacks.find(h => h.id === props.preselectedHackId)
      if (hack) {
        selectedSystem.value = hack.systemId
        selectedHack.value = hack.id
        // Sélectionner le premier univers
        const firstUniverse = universes.find(u => u.hackId === hack.id)
        selectedUniverse.value = firstUniverse?.id || ''
      }
    } else {
      selectedSystem.value = systems[0]?.id || ''
      selectedHack.value = ''
      selectedUniverse.value = ''
    }
  }
})

// Reset hack quand système change
watch(selectedSystem, () => {
  const firstHack = availableHacks.value[0]
  if (firstHack && selectedHack.value && !availableHacks.value.find(h => h.id === selectedHack.value)) {
    selectedHack.value = firstHack.id
  } else if (!selectedHack.value && firstHack) {
    selectedHack.value = firstHack.id
  }
})

// Reset univers quand hack change
watch(selectedHack, () => {
  const firstUniverse = availableUniverses.value[0]
  if (firstUniverse && selectedUniverse.value && !availableUniverses.value.find(u => u.id === selectedUniverse.value)) {
    selectedUniverse.value = firstUniverse.id
  } else if (!selectedUniverse.value && firstUniverse) {
    selectedUniverse.value = firstUniverse.id
  }
})

// Mettre à jour le nom quand on arrive à l'étape 5
watch([currentStep, role, selectedHack], () => {
  if (currentStep.value === 5 && (!name.value || nameSuggestions.value.includes(name.value))) {
    name.value = nameSuggestions.value[0]
  }
})

// Navigation
const canGoNext = computed(() => {
  switch (currentStep.value) {
    case 1: return !!role.value
    case 2: return !!selectedSystem.value
    case 3: return !!selectedHack.value
    case 4: return !!selectedUniverse.value
    case 5: return !!name.value.trim()
    default: return false
  }
})

const nextStep = () => {
  if (currentStep.value < totalSteps && canGoNext.value) {
    currentStep.value++
  }
}

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const goToStep = (step: number) => {
  if (step >= 1 && step <= totalSteps) {
    currentStep.value = step
  }
}

const selectSuggestion = (suggestion: string) => {
  name.value = suggestion
}

// Submit
const handleSubmit = async () => {
  if (!name.value.trim()) {
    error.value = 'Veuillez entrer un nom pour votre playspace'
    return
  }

  isLoading.value = true
  error.value = ''

  try {
    const response = await $fetch('/api/playspaces', {
      method: 'POST',
      body: {
        name: name.value.trim(),
        hackId: selectedHack.value,
        universeId: selectedUniverse.value || null,
        isGM: role.value === 'MJ'
      }
    })

    emit('created', response.id)
    handleClose()
  } catch (err: any) {
    error.value = err.data?.message || 'Erreur lors de la création du playspace'
  } finally {
    isLoading.value = false
  }
}

const handleClose = () => {
  currentStep.value = 1
  emit('close')
}

// Fermer avec Escape
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    handleClose()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="modal-overlay"
        @click.self="handleClose"
      >
        <div class="modal-container" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <!-- Header -->
          <div class="modal-header">
            <div>
              <h2 id="modal-title" class="modal-title">Créer un Playspace</h2>
            </div>
            <button
              type="button"
              class="close-btn"
              aria-label="Fermer"
              @click="handleClose"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Progress Steps -->
          <div class="steps-nav">
            <button
              v-for="step in totalSteps"
              :key="step"
              type="button"
              class="step-dot"
              :class="{ active: currentStep === step, completed: currentStep > step }"
              @click="goToStep(step)"
              :disabled="step > currentStep"
            >
              <span class="step-number">{{ step }}</span>
            </button>
          </div>
          <div class="step-label">
            {{ ['Rôle', 'Système', 'Hack', 'Univers', 'Nom'][currentStep - 1] }}
          </div>

          <!-- Content -->
          <div class="modal-content">
            <!-- Étape 1: Rôle -->
            <div v-if="currentStep === 1" class="step-content">
              <h3 class="step-title">Quel est votre rôle ?</h3>
              <div class="role-selector">
                <button
                  type="button"
                  class="role-btn"
                  :class="{ active: role === 'PJ' }"
                  @click="role = 'PJ'"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <span class="option-name">Joueur (PJ)</span>
                  <span class="option-desc">Créez et jouez vos personnages</span>
                </button>
                <button
                  type="button"
                  class="role-btn"
                  :class="{ active: role === 'MJ' }"
                  @click="role = 'MJ'"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                  </svg>
                  <span class="option-name">Maître du Jeu (MJ)</span>
                  <span class="option-desc">Gérez la partie et les PNJ</span>
                </button>
              </div>
            </div>

            <!-- Étape 2: Système -->
            <div v-if="currentStep === 2" class="step-content">
              <h3 class="step-title">Choisissez votre système</h3>
              <div class="option-selector">
                <button
                  v-for="system in systems"
                  :key="system.id"
                  type="button"
                  class="option-btn"
                  :class="{ active: selectedSystem === system.id }"
                  @click="selectedSystem = system.id"
                >
                  <span class="option-name">{{ system.name }}</span>
                  <span class="option-desc">{{ system.description }}</span>
                </button>
              </div>
            </div>

            <!-- Étape 3: Hack -->
            <div v-if="currentStep === 3" class="step-content">
              <h3 class="step-title">Choisissez votre hack</h3>
              <div class="option-selector">
                <button
                  v-for="hack in availableHacks"
                  :key="hack.id"
                  type="button"
                  class="option-btn"
                  :class="{ active: selectedHack === hack.id }"
                  @click="selectedHack = hack.id"
                >
                  <span class="option-name">{{ hack.name }}</span>
                  <span class="option-desc">{{ hack.description }}</span>
                </button>
              </div>
            </div>

            <!-- Étape 4: Univers -->
            <div v-if="currentStep === 4" class="step-content">
              <h3 class="step-title">Choisissez votre univers</h3>
              <div class="option-selector">
                <button
                  v-for="universe in availableUniverses"
                  :key="universe.id"
                  type="button"
                  class="option-btn"
                  :class="{ active: selectedUniverse === universe.id }"
                  @click="selectedUniverse = universe.id"
                >
                  <span class="option-name">{{ universe.name }}</span>
                  <span class="option-desc">{{ universe.description }}</span>
                </button>
              </div>
            </div>

            <!-- Étape 5: Nom -->
            <div v-if="currentStep === 5" class="step-content">
              <h3 class="step-title">Nommez votre playspace</h3>
              <div class="form-group">
                <input
                  id="playspace-name"
                  v-model="name"
                  type="text"
                  class="form-input"
                  placeholder="Ex: Ma Campagne LITM"
                  required
                  @keyup.enter="handleSubmit"
                />
                <div class="suggestions">
                  <button
                    v-for="suggestion in nameSuggestions"
                    :key="suggestion"
                    type="button"
                    class="suggestion-btn"
                    :class="{ active: name === suggestion }"
                    @click="selectSuggestion(suggestion)"
                  >
                    {{ suggestion }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Erreur -->
            <p v-if="error" class="error-message">{{ error }}</p>
          </div>

          <!-- Actions -->
          <div class="modal-actions">
            <button
              v-if="currentStep > 1"
              type="button"
              class="btn btn-secondary"
              @click="prevStep"
            >
              Précédent
            </button>
            <button
              v-else
              type="button"
              class="btn btn-secondary"
              @click="handleClose"
            >
              Annuler
            </button>

            <button
              v-if="currentStep < totalSteps"
              type="button"
              class="btn btn-primary"
              :disabled="!canGoNext"
              @click="nextStep"
            >
              Suivant
            </button>
            <button
              v-else
              type="button"
              class="btn btn-primary"
              :disabled="isLoading || !name.trim()"
              @click="handleSubmit"
            >
              <span v-if="isLoading">Création...</span>
              <span v-else>Créer le Playspace</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* OVERLAY */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
}

/* CONTAINER */
.modal-container {
  width: 100%;
  max-width: 55rem;
  background: var(--noir-card);
  border: 2px solid rgba(0, 217, 217, 0.3);
  position: relative;
  overflow: hidden;
}

.modal-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--cyan-neon), var(--violet-neon));
}

/* HEADER */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem 2.5rem 1.5rem;
}

.modal-title {
  font-size: 2.2rem;
  font-weight: 800;
  color: var(--blanc);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin: 0;
}

.close-btn {
  width: 4rem;
  height: 4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: var(--gris-clair);
  cursor: pointer;
  transition: all 0.3s ease;
}

.close-btn:hover {
  border-color: var(--cyan-neon);
  color: var(--cyan-neon);
}

.close-btn svg {
  width: 2rem;
  height: 2rem;
}

/* STEPS NAV */
.steps-nav {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  padding: 0 2.5rem;
}

.step-dot {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 2px solid rgba(255, 255, 255, 0.2);
  color: var(--gris-clair);
  font-size: 1.4rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
}

.step-dot:hover:not(:disabled) {
  border-color: rgba(0, 217, 217, 0.5);
}

.step-dot:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.step-dot.active {
  border-color: var(--cyan-neon);
  background: var(--cyan-neon);
  color: var(--noir-profond);
  box-shadow: var(--glow-cyan);
}

.step-dot.completed {
  border-color: var(--cyan-neon);
  background: rgba(0, 217, 217, 0.2);
  color: var(--cyan-neon);
}

.step-number {
  line-height: 1;
}

.step-label {
  text-align: center;
  color: var(--cyan-neon);
  font-size: 1.2rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  margin-top: 1rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-left: 2.5rem;
  margin-right: 2.5rem;
}

/* CONTENT */
.modal-content {
  padding: 2rem 2.5rem;
  min-height: 26rem;
}

.step-content {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateX(10px); }
  to { opacity: 1; transform: translateX(0); }
}

.step-title {
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--blanc);
  margin-bottom: 2rem;
  text-align: center;
}

/* ROLE SELECTOR (2 colonnes) */
.role-selector {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.role-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  background: transparent;
  border: 2px solid rgba(255, 255, 255, 0.1);
  color: var(--gris-clair);
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.role-btn:hover {
  border-color: rgba(0, 217, 217, 0.5);
}

.role-btn.active {
  border-color: var(--cyan-neon);
  background: rgba(0, 217, 217, 0.1);
  color: var(--blanc);
  box-shadow: var(--glow-cyan);
}

.role-btn svg {
  width: 3.5rem;
  height: 3.5rem;
  color: var(--cyan-neon);
}

/* OPTION SELECTOR (liste) */
.option-selector {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 22rem;
  overflow-y: auto;
}

.option-btn {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.4rem;
  padding: 1.4rem 1.8rem;
  background: transparent;
  border: 2px solid rgba(255, 255, 255, 0.1);
  color: var(--gris-clair);
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
}

.option-btn:hover {
  border-color: rgba(0, 217, 217, 0.5);
}

.option-btn.active {
  border-color: var(--cyan-neon);
  background: rgba(0, 217, 217, 0.1);
  color: var(--blanc);
}

.option-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: inherit;
}

.option-desc {
  font-size: 1.2rem;
  opacity: 0.7;
}

/* FORM */
.form-group {
  margin-bottom: 1.5rem;
}

.form-input {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  padding: 1.4rem 1.6rem;
  background: rgba(0, 0, 0, 0.3);
  border: 2px solid rgba(255, 255, 255, 0.1);
  color: var(--blanc);
  font-family: 'Assistant', sans-serif;
  font-size: 1.6rem;
  transition: all 0.3s ease;
}

.form-input::placeholder {
  color: var(--gris-clair);
  opacity: 0.5;
}

.form-input:focus {
  outline: none;
  border-color: var(--cyan-neon);
  box-shadow: 0 0 10px rgba(0, 217, 217, 0.2);
}

/* SUGGESTIONS */
.suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
  margin-top: 1.2rem;
}

.suggestion-btn {
  padding: 0.6rem 1.2rem;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--gris-clair);
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.suggestion-btn:hover {
  border-color: rgba(0, 217, 217, 0.5);
  color: var(--blanc);
}

.suggestion-btn.active {
  border-color: var(--cyan-neon);
  background: rgba(0, 217, 217, 0.1);
  color: var(--cyan-neon);
}

/* ERROR */
.error-message {
  color: var(--rose-neon);
  font-size: 1.4rem;
  text-align: center;
  margin-top: 1rem;
}

/* ACTIONS */
.modal-actions {
  display: flex;
  justify-content: space-between;
  gap: 1.5rem;
  padding: 1.5rem 2.5rem 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.btn {
  padding: 1.2rem 2.5rem;
  font-family: 'Assistant', sans-serif;
  font-weight: 700;
  font-size: 1.3rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary {
  background: transparent;
  border: 2px solid rgba(255, 255, 255, 0.2);
  color: var(--gris-clair);
}

.btn-secondary:hover {
  border-color: var(--blanc);
  color: var(--blanc);
}

.btn-primary {
  background: var(--cyan-neon);
  border: 2px solid var(--cyan-neon);
  color: var(--noir-profond);
  box-shadow: var(--glow-cyan);
}

.btn-primary:hover:not(:disabled) {
  box-shadow: var(--glow-cyan-fort);
  transform: translateY(-2px);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* TRANSITIONS */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.95) translateY(-20px);
  opacity: 0;
}

/* RESPONSIVE */
@media (max-width: 640px) {
  .modal-overlay {
    padding: 1rem;
    align-items: flex-end;
  }

  .modal-container {
    max-height: 90vh;
    overflow-y: auto;
  }

  .modal-content {
    min-height: auto;
  }

  .role-selector {
    grid-template-columns: 1fr;
  }

  .steps-nav {
    gap: 1rem;
  }

  .step-dot {
    width: 3rem;
    height: 3rem;
    font-size: 1.2rem;
  }

  .modal-actions {
    flex-direction: column-reverse;
  }

  .modal-actions .btn {
    width: 100%;
  }
}
</style>
