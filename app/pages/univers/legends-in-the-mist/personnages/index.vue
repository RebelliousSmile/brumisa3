<script setup lang="ts">
/**
 * Liste des personnages Legends in the Mist
 */

definePageMeta({
  layout: 'default',
  middleware: 'auth',
})

const router = useRouter()
const store = useLitmCharacterStore()

// Charger les personnages au montage
const isLoading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    await store.fetchCharacters()
    isLoading.value = false
  } catch (err: any) {
    error.value = err.message || 'Impossible de charger les personnages'
    isLoading.value = false
  }
})

// Personnages filtrés
const characters = computed(() => store.filteredCharacters)

// Naviguer vers la création
const createNew = () => {
  router.push('/univers/legends-in-the-mist/personnages/nouveau')
}

// Naviguer vers l'édition
const editCharacter = (id: string) => {
  router.push(`/univers/legends-in-the-mist/personnages/${id}`)
}

// Supprimer un personnage
const deleteCharacter = async (character: any) => {
  const confirmed = confirm(`Êtes-vous sûr de vouloir supprimer "${character.name}" ?`)
  if (!confirmed) return

  await store.deleteCharacter(character.id)
}

// Formater la date
const formatDate = (date: Date | string) => {
  const d = new Date(date)
  return d.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Header -->
    <div class="mb-8">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">
            Mes Personnages
          </h1>
          <p class="text-gray-600">
            Legends in the Mist
          </p>
        </div>
        <button
          class="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
          @click="createNew"
        >
          Nouveau personnage
        </button>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="isLoading" class="flex items-center justify-center h-64">
      <div class="text-center">
        <svg class="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <p class="text-gray-600">Chargement des personnages...</p>
      </div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6 max-w-2xl mx-auto">
      <h2 class="text-xl font-bold text-red-900 mb-2">Erreur</h2>
      <p class="text-red-800">{{ error }}</p>
    </div>

    <!-- Empty state -->
    <div v-else-if="characters.length === 0" class="text-center py-16">
      <svg class="mx-auto h-24 w-24 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
      <h3 class="text-lg font-medium text-gray-900 mb-2">
        Aucun personnage
      </h3>
      <p class="text-gray-600 mb-6">
        Commencez par créer votre premier personnage Legends in the Mist
      </p>
      <button
        class="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
        @click="createNew"
      >
        Créer mon premier personnage
      </button>
    </div>

    <!-- Characters list -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="character in characters"
        :key="character.id"
        class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
      >
        <!-- Character header -->
        <div class="p-6">
          <div class="flex items-start justify-between mb-3">
            <h3 class="text-xl font-bold text-gray-900 line-clamp-1">
              {{ character.name }}
            </h3>
            <span
              class="px-2 py-1 text-xs font-medium rounded"
              :class="character.gameType === 'litm' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'"
            >
              {{ character.gameType === 'litm' ? 'LITM' : 'COTM' }}
            </span>
          </div>

          <!-- Stats -->
          <div class="flex gap-4 text-sm text-gray-600 mb-4">
            <div class="flex items-center gap-1">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
              <span>{{ character.themeCards?.length || 0 }} cartes</span>
            </div>
            <div class="flex items-center gap-1">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span>{{ character.trackers?.length || 0 }} trackers</span>
            </div>
          </div>

          <!-- Last update -->
          <p class="text-xs text-gray-500 mb-4">
            Modifié le {{ formatDate(character.updatedAt) }}
          </p>

          <!-- Actions -->
          <div class="flex gap-2">
            <button
              class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
              @click="editCharacter(character.id)"
            >
              Ouvrir
            </button>
            <button
              class="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-sm font-medium"
              @click="deleteCharacter(character)"
            >
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
