<script setup lang="ts">
/**
 * Page Edition Personnage
 *
 * Sections :
 * - Informations de base (nom, description)
 * - Theme Cards (2-4 cards avec tags)
 * - Hero Card (Identity/Mystery ou Self/Itch)
 * - Trackers (Statuses, Story Tags, Story Themes)
 *
 * Design : Dark immersif avec navigation tabs verticale
 */

definePageMeta({
  layout: 'playspace',
  middleware: ['auth']
})

const route = useRoute()
const router = useRouter()
const characterId = route.params.id as string

// Stores
const characterStore = useCharacterStore()
const playspaceStore = usePlayspaceStore()
const uiStore = useUiStore()

// Composables
const { updateThemeCard, deleteThemeCard, getAvailableThemeTypes } = useThemeCards()
const { createTag, deleteTag, countByType } = useTags()
const { updateHeroCard, getLabels } = useHeroCard()

// State
const character = ref(null)
const loading = ref(true)
const activeSection = ref<'informations' | 'theme-cards' | 'hero-card' | 'trackers'>('informations')

// Modals
const showThemeCardModal = ref(false)
const showTagModal = ref(false)
const editingThemeCard = ref(null)
const editingThemeCardForTag = ref(null)

// Form data
const formData = reactive({
  name: '',
  description: ''
})

// Load character on mount
onMounted(async () => {
  try {
    loading.value = true
    const data = await characterStore.getCharacter(characterId)
    character.value = data

    // Populate form
    formData.name = data.name
    formData.description = data.description || ''
  } catch (err) {
    console.error('Error loading character:', err)
    uiStore.notifierErreur('Erreur', 'Impossible de charger le personnage')
    router.push('/characters')
  } finally {
    loading.value = false
  }
})

// Computed
const playspace = computed(() => playspaceStore.activePlayspace)
const hackId = computed(() => playspace.value?.hackId || 'city-of-mist')
const heroCardLabels = computed(() => getLabels(hackId.value))
const themeTypes = computed(() => getAvailableThemeTypes(hackId.value))

const canAddThemeCard = computed(() => {
  if (!character.value?.themeCards) return true
  return character.value.themeCards.length < 4
})

// Update basic info
async function handleUpdateBasicInfo() {
  try {
    await characterStore.updateCharacter(characterId, {
      name: formData.name,
      description: formData.description
    })

    // Refresh character
    const updated = await characterStore.getCharacter(characterId)
    character.value = updated

    uiStore.notifierSucces('Personnage mis à jour')
  } catch (err) {
    console.error('Error updating character:', err)
  }
}

// Theme Cards
async function handleAddThemeCard() {
  editingThemeCard.value = null
  showThemeCardModal.value = true
}

async function handleEditThemeCard(themeCard) {
  editingThemeCard.value = themeCard
  showThemeCardModal.value = true
}

async function handleThemeCardSubmit(data) {
  try {
    if (editingThemeCard.value) {
      await updateThemeCard(editingThemeCard.value.id, data)
    } else {
      const { createThemeCard } = useThemeCards()
      await createThemeCard(characterId, data)
    }

    // Refresh character
    const updated = await characterStore.getCharacter(characterId)
    character.value = updated

    showThemeCardModal.value = false
    editingThemeCard.value = null
  } catch (err) {
    console.error('Error with theme card:', err)
  }
}

async function handleDeleteThemeCard(themeCardId) {
  try {
    await deleteThemeCard(themeCardId)

    // Refresh character
    const updated = await characterStore.getCharacter(characterId)
    character.value = updated
  } catch (err) {
    console.error('Error deleting theme card:', err)
  }
}

// Tags
async function handleAddTag(themeCard) {
  editingThemeCardForTag.value = themeCard
  showTagModal.value = true
}

async function handleTagSubmit(data) {
  try {
    if (!editingThemeCardForTag.value) return

    await createTag(editingThemeCardForTag.value.id, data)

    // Refresh character
    const updated = await characterStore.getCharacter(characterId)
    character.value = updated

    showTagModal.value = false
    editingThemeCardForTag.value = null
  } catch (err) {
    console.error('Error creating tag:', err)
  }
}

async function handleDeleteTag(tagId) {
  try {
    await deleteTag(tagId)

    // Refresh character
    const updated = await characterStore.getCharacter(characterId)
    character.value = updated
  } catch (err) {
    console.error('Error deleting tag:', err)
  }
}

// Hero Card
async function handleHeroCardSubmit(data) {
  try {
    await updateHeroCard(characterId, data)

    // Refresh character
    const updated = await characterStore.getCharacter(characterId)
    character.value = updated
  } catch (err) {
    console.error('Error updating hero card:', err)
  }
}

// Trackers refresh
async function refreshTrackers() {
  const updated = await characterStore.getCharacter(characterId)
  character.value = updated
}

// Navigation
function scrollToSection(section: string) {
  activeSection.value = section as any
  const element = document.getElementById(section)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

useSeoMeta({
  title: `Editer ${character.value?.name || 'Personnage'} - Brumisa3`,
  description: 'Editez votre personnage : informations, Theme Cards, Hero Card, Trackers'
})
</script>

<template>
  <div class="min-h-screen bg-navy-900">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <Icon name="heroicons:arrow-path" class="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
        <p class="text-gray-400">Chargement du personnage...</p>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else-if="character" class="flex">
      <!-- Sidebar Navigation -->
      <aside class="w-64 bg-navy-800 border-r border-navy-600 min-h-screen sticky top-0">
        <div class="p-6">
          <h2 class="text-lg font-bold text-white mb-6">Sections</h2>

          <nav class="space-y-2">
            <button
              v-for="section in [
                { id: 'informations', label: 'Informations', icon: 'heroicons:user' },
                { id: 'theme-cards', label: 'Theme Cards', icon: 'heroicons:squares-2x2' },
                { id: 'hero-card', label: 'Hero Card', icon: 'heroicons:heart' },
                { id: 'trackers', label: 'Trackers', icon: 'heroicons:chart-bar' }
              ]"
              :key="section.id"
              :class="[
                'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors',
                activeSection === section.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-navy-700'
              ]"
              @click="scrollToSection(section.id)"
            >
              <Icon :name="section.icon" class="w-5 h-5" />
              <span class="font-medium">{{ section.label }}</span>
            </button>
          </nav>

          <!-- Back Button -->
          <div class="mt-8 pt-6 border-t border-navy-600">
            <NuxtLink
              :to="`/characters/${characterId}`"
              class="w-full flex items-center gap-2 px-4 py-3 text-gray-400 hover:text-white hover:bg-navy-700 rounded-lg transition-colors"
            >
              <Icon name="heroicons:arrow-left" class="w-5 h-5" />
              <span>Retour</span>
            </NuxtLink>
          </div>
        </div>
      </aside>

      <!-- Content Area -->
      <main class="flex-1 p-8">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-white mb-2">
            Editer {{ character.name }}
          </h1>
          <p class="text-gray-400">
            {{ playspace?.name }} · {{ hackId }}
          </p>
        </div>

        <!-- Section: Informations -->
        <section id="informations" class="mb-12">
          <h2 class="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Icon name="heroicons:user" class="w-6 h-6 text-blue-400" />
            Informations
          </h2>

          <div class="bg-navy-800 border border-navy-600 rounded-2xl p-6 space-y-6">
            <div>
              <label for="name" class="block text-sm font-medium text-gray-300 mb-2">
                Nom *
              </label>
              <UiInput
                id="name"
                v-model="formData.name"
                placeholder="Nom du personnage"
                required
              />
            </div>

            <div>
              <label for="description" class="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <UiTextarea
                id="description"
                v-model="formData.description"
                placeholder="Description du personnage..."
                rows="6"
              />
            </div>

            <div class="flex justify-end">
              <UiButton
                variant="primary"
                @click="handleUpdateBasicInfo"
              >
                Sauvegarder
              </UiButton>
            </div>
          </div>
        </section>

        <!-- Section: Theme Cards -->
        <section id="theme-cards" class="mb-12">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold text-white flex items-center gap-3">
              <Icon name="heroicons:squares-2x2" class="w-6 h-6 text-purple-400" />
              Theme Cards
              <span class="text-lg font-normal text-gray-400">
                ({{ character.themeCards?.length || 0 }}/4)
              </span>
            </h2>

            <UiButton
              variant="primary"
              icon="heroicons:plus"
              @click="handleAddThemeCard"
              :disabled="!canAddThemeCard"
            >
              Ajouter Theme Card
            </UiButton>
          </div>

          <!-- Theme Cards List -->
          <div v-if="character.themeCards && character.themeCards.length > 0" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div
              v-for="themeCard in character.themeCards"
              :key="themeCard.id"
              class="bg-navy-800 border border-navy-600 rounded-2xl p-6 hover:border-blue-500/50 transition-colors"
            >
              <!-- Theme Card Header -->
              <div class="flex items-start justify-between mb-4">
                <div class="flex-1">
                  <h3 class="text-lg font-bold text-white mb-1">{{ themeCard.name }}</h3>
                  <span class="inline-block px-3 py-1 bg-purple-900/50 border border-purple-500 text-purple-300 rounded-full text-xs font-bold">
                    {{ themeCard.type }}
                  </span>
                </div>

                <div class="flex gap-2">
                  <button
                    type="button"
                    class="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-blue-400 hover:bg-blue-900/20 rounded-lg transition-colors"
                    @click="handleEditThemeCard(themeCard)"
                  >
                    <Icon name="heroicons:pencil" class="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    class="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                    @click="handleDeleteThemeCard(themeCard.id)"
                    :disabled="character.themeCards.length <= 2"
                  >
                    <Icon name="heroicons:trash" class="w-4 h-4" />
                  </button>
                </div>
              </div>

              <!-- Description -->
              <p v-if="themeCard.description" class="text-sm text-gray-400 mb-4">
                {{ themeCard.description }}
              </p>

              <!-- Attention -->
              <div class="mb-4">
                <div class="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span>Attention</span>
                  <span>{{ themeCard.attention }}/10</span>
                </div>
                <div class="w-full bg-navy-600 rounded-full h-2">
                  <div
                    class="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                    :style="{ width: `${(themeCard.attention / 10) * 100}%` }"
                  />
                </div>
              </div>

              <!-- Power Tags -->
              <div class="mb-4">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-xs font-bold text-gray-400 uppercase">Power Tags</span>
                  <button
                    type="button"
                    class="text-xs text-green-400 hover:text-green-300"
                    @click="handleAddTag(themeCard)"
                  >
                    + Ajouter
                  </button>
                </div>
                <div class="flex flex-wrap gap-2">
                  <div
                    v-for="tag in themeCard.tags?.filter(t => t.type === 'POWER')"
                    :key="tag.id"
                    class="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg text-sm font-medium border border-green-500/50 shadow-md"
                  >
                    <span>{{ tag.name }}</span>
                    <button
                      type="button"
                      class="w-4 h-4 flex items-center justify-center hover:bg-white/20 rounded transition-colors"
                      @click="handleDeleteTag(tag.id)"
                    >
                      <Icon name="heroicons:x-mark" class="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              <!-- Weakness Tags -->
              <div>
                <div class="flex items-center justify-between mb-2">
                  <span class="text-xs font-bold text-gray-400 uppercase">Weakness Tags</span>
                  <button
                    type="button"
                    class="text-xs text-red-400 hover:text-red-300"
                    @click="handleAddTag(themeCard)"
                  >
                    + Ajouter
                  </button>
                </div>
                <div class="flex flex-wrap gap-2">
                  <div
                    v-for="tag in themeCard.tags?.filter(t => t.type === 'WEAKNESS')"
                    :key="tag.id"
                    class="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-lg text-sm font-medium border border-red-500/50 shadow-md"
                  >
                    <span>{{ tag.name }}</span>
                    <button
                      type="button"
                      class="w-4 h-4 flex items-center justify-center hover:bg-white/20 rounded transition-colors"
                      @click="handleDeleteTag(tag.id)"
                    >
                      <Icon name="heroicons:x-mark" class="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="bg-navy-800 border border-navy-600 rounded-2xl p-12 text-center">
            <Icon name="heroicons:squares-2x2" class="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p class="text-gray-400 mb-4">Aucune Theme Card</p>
            <UiButton variant="primary" @click="handleAddThemeCard">
              Créer la première Theme Card
            </UiButton>
          </div>
        </section>

        <!-- Section: Hero Card -->
        <section id="hero-card" class="mb-12">
          <h2 class="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Icon name="heroicons:heart" class="w-6 h-6 text-pink-400" />
            Hero Card
          </h2>

          <div class="bg-navy-800 border border-navy-600 rounded-2xl p-6">
            <template v-if="character.heroCard">
              <HeroCardForm
                :hack-id="hackId"
                :character-id="characterId"
                :hero-card="character.heroCard"
                @submit="handleHeroCardSubmit"
                @cancel="() => {}"
              />
            </template>
            <template v-else>
              <p class="text-gray-400 italic">Hero Card non disponible</p>
            </template>
          </div>
        </section>

        <!-- Section: Trackers -->
        <section id="trackers" class="mb-12">
          <h2 class="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Icon name="heroicons:chart-bar" class="w-6 h-6 text-yellow-400" />
            Trackers
          </h2>

          <TrackerPanel
            :character-id="characterId"
            :trackers="character.trackers"
            :hack-id="hackId"
            @refresh="refreshTrackers"
          />
        </section>
      </main>
    </div>

    <!-- Error State -->
    <div v-else class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <Icon name="heroicons:exclamation-triangle" class="w-16 h-16 text-red-500 mx-auto mb-4" />
        <p class="text-gray-400 mb-4">Personnage introuvable</p>
        <UiButton variant="primary" to="/characters">
          Retour aux personnages
        </UiButton>
      </div>
    </div>

    <!-- Modals (outside conditional structure) -->
    <UiModal
      v-model="showThemeCardModal"
      :title="editingThemeCard ? 'Modifier Theme Card' : 'Nouvelle Theme Card'"
      size="lg"
    >
      <ThemeCardForm
        :hack-id="hackId"
        :character-id="characterId"
        :theme-card="editingThemeCard"
        :current-theme-card-count="character?.themeCards?.length"
        @submit="handleThemeCardSubmit"
        @cancel="showThemeCardModal = false"
      />
    </UiModal>

    <UiModal
      v-model="showTagModal"
      title="Nouveau Tag"
      size="md"
    >
      <TagForm
        v-if="editingThemeCardForTag"
        :theme-card-id="editingThemeCardForTag.id"
        :existing-tags="editingThemeCardForTag.tags || []"
        @submit="handleTagSubmit"
        @cancel="showTagModal = false"
      />
    </UiModal>
  </div>
</template>
