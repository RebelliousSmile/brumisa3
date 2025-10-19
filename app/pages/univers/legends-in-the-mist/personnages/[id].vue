<script setup lang="ts">
/**
 * Page d'édition d'un personnage Legends in the Mist
 */

definePageMeta({
  layout: 'default',
  middleware: 'auth',
})

const route = useRoute()
const router = useRouter()
const store = useLitmCharacterStore()
const { isEditMode, toggleEditMode } = useEditMode()

// ID du personnage
const characterId = computed(() => route.params.id as string)

// État de chargement
const isLoading = ref(true)
const error = ref<string | null>(null)

// Charger le personnage au montage
onMounted(async () => {
  try {
    await store.fetchCharacter(characterId.value)
    isLoading.value = false
  } catch (err: any) {
    error.value = err.message || 'Impossible de charger le personnage'
    isLoading.value = false
  }
})

// Personnage actif
const character = computed(() => store.activeCharacter)

// Créer une hero card
const createHeroCard = async () => {
  if (!character.value) return

  const name = prompt('Nom du héros:', character.value.name)
  if (!name) return

  await store.createHeroCard(character.value.id, { name })
}

// Créer une theme card
const createThemeCard = async () => {
  if (!character.value) return

  await store.createThemeCard(character.value.id, {
    type: 'origin',
    themebook: 'Nouveau Themebook',
    title: 'Nouvelle Theme Card',
  })
}

// Supprimer le personnage
const deleteCharacter = async () => {
  if (!character.value) return

  const confirmed = confirm(`Êtes-vous sûr de vouloir supprimer "${character.value.name}" ?`)
  if (!confirmed) return

  const success = await store.deleteCharacter(character.value.id)
  if (success) {
    router.push('/univers/legends-in-the-mist/personnages')
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Loading state -->
    <div v-if="isLoading" class="container mx-auto px-4 py-8">
      <div class="flex items-center justify-center h-64">
        <div class="text-center">
          <svg class="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p class="text-gray-600">Chargement du personnage...</p>
        </div>
      </div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="container mx-auto px-4 py-8">
      <div class="bg-red-50 border border-red-200 rounded-lg p-6 max-w-2xl mx-auto">
        <h2 class="text-xl font-bold text-red-900 mb-2">Erreur</h2>
        <p class="text-red-800 mb-4">{{ error }}</p>
        <button
          class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          @click="router.push('/univers/legends-in-the-mist/personnages')"
        >
          Retour à la liste
        </button>
      </div>
    </div>

    <!-- Character loaded -->
    <div v-else-if="character" class="container mx-auto px-4 py-8">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">
              {{ character.name }}
            </h1>
            <p class="text-gray-600">
              {{ character.gameType === 'litm' ? 'Legends in the Mist' : 'City of Mist' }}
            </p>
          </div>

          <div class="flex gap-2">
            <LitmEditModeToggle />
            <button
              class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              @click="deleteCharacter"
            >
              Supprimer
            </button>
          </div>
        </div>
      </div>

      <!-- Hero Card Section -->
      <section class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-2xl font-bold text-gray-900">Hero Card</h2>
          <button
            v-if="!character.heroCard && isEditMode"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            @click="createHeroCard"
          >
            Créer Hero Card
          </button>
        </div>

        <LitmHeroCard
          v-if="character.heroCard"
          :id="character.heroCard.id"
          :name="character.heroCard.name"
          :backstory="character.heroCard.backstory ?? undefined"
          :birthright="character.heroCard.birthright ?? undefined"
          :relationships="character.heroCard.relationships"
          :quintessences="character.heroCard.quintessences"
          :backpack-items="character.heroCard.backpackItems"
        />
        <div v-else class="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
          <p>Aucune Hero Card créée</p>
          <p class="text-sm mt-2">Activez le mode édition pour créer votre Hero Card</p>
        </div>
      </section>

      <!-- Theme Cards Section -->
      <section class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-2xl font-bold text-gray-900">Theme Cards</h2>
          <button
            v-if="isEditMode"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            @click="createThemeCard"
          >
            Ajouter Theme Card
          </button>
        </div>

        <div v-if="character.themeCards && character.themeCards.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <LitmThemeCard
            v-for="card in character.themeCards"
            :key="card.id"
            :id="card.id"
            :type="card.type"
            :themebook="card.themebook"
            :title="card.title"
            :main-tag="card.mainTagText ?? undefined"
            :power-tags="card.tags.filter(t => t.isPower).map(t => ({ id: t.id, text: t.text }))"
            :weakness-tags="card.tags.filter(t => !t.isPower).map(t => ({ id: t.id, text: t.text }))"
            :quest="card.quest ? {
              id: card.quest.id,
              text: card.quest.text,
              progressPips: card.quest.progressPips,
              totalPips: card.quest.totalPips
            } : undefined"
            :flippable="true"
          />
        </div>
        <div v-else class="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
          <p>Aucune Theme Card créée</p>
          <p class="text-sm mt-2">Activez le mode édition pour ajouter vos Theme Cards</p>
        </div>
      </section>

      <!-- Trackers Section -->
      <section class="mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Trackers</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Status Trackers -->
          <div>
            <h3 class="text-lg font-semibold text-gray-800 mb-3">Status</h3>
            <LitmTrackerList
              tracker-type="status"
              :trackers="character.trackers"
            />
          </div>

          <!-- Story Tag Trackers -->
          <div>
            <h3 class="text-lg font-semibold text-gray-800 mb-3">Story Tags</h3>
            <LitmTrackerList
              tracker-type="storyTag"
              :trackers="character.trackers"
            />
          </div>
        </div>

        <!-- Story Theme Trackers -->
        <div class="mt-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-3">Story Themes</h3>
          <LitmTrackerList
            tracker-type="storyTheme"
            :trackers="character.trackers"
          />
        </div>
      </section>

      <!-- Debug info (dev only) -->
      <details v-if="import.meta.dev" class="mt-8">
        <summary class="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
          Debug Info
        </summary>
        <pre class="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto">{{ character }}</pre>
      </details>
    </div>
  </div>
</template>
