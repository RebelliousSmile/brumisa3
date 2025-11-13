<script setup lang="ts">
/**
 * Page Liste Personnages
 *
 * Affiche tous les personnages du playspace actif
 * Design : Grid cards dark avec preview theme cards
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

// State
const loading = ref(true)

// Load characters on mount
onMounted(async () => {
  if (!playspaceStore.activePlayspaceId) {
    uiStore.notifierErreur('Erreur', 'Aucun playspace actif')
    router.push('/playspaces')
    return
  }

  try {
    loading.value = true
    await characterStore.loadCharacters(playspaceStore.activePlayspaceId)
  } catch (err) {
    console.error('Error loading characters:', err)
    uiStore.notifierErreur('Erreur', 'Impossible de charger les personnages')
  } finally {
    loading.value = false
  }
})

// Computed
const playspace = computed(() => playspaceStore.activePlayspace)
const characters = computed(() => characterStore.currentPlayspaceCharacters)

// Actions
function handleNew() {
  router.push('/characters/new')
}

function handleView(characterId: string) {
  router.push(`/characters/${characterId}`)
}

function handleEdit(characterId: string) {
  router.push(`/characters/${characterId}/edit`)
}

async function handleDelete(character: any) {
  try {
    const confirme = await uiStore.confirmer(
      'Supprimer le personnage',
      `Êtes-vous sûr de vouloir supprimer ${character.name} ?`,
      {
        labelConfirmer: 'Supprimer',
        typeConfirmer: 'danger'
      }
    )

    if (!confirme) return

    await characterStore.deleteCharacter(character.id)
  } catch (err) {
    console.error('Error deleting character:', err)
  }
}

useSeoMeta({
  title: `Personnages - ${playspace.value?.name || 'Brumisa3'}`,
  description: 'Liste de tous vos personnages dans ce playspace'
})
</script>

<template>
  <div class="min-h-screen bg-navy-900 p-8">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl font-bold text-white mb-2">
            Personnages
          </h1>
          <p class="text-gray-400">
            {{ playspace?.name }} · {{ playspace?.hackId }}
          </p>
        </div>

        <UiButton
          variant="primary"
          icon="heroicons:plus"
          @click="handleNew"
        >
          Nouveau Personnage
        </UiButton>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center min-h-96">
        <div class="text-center">
          <Icon name="heroicons:arrow-path" class="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p class="text-gray-400">Chargement des personnages...</p>
        </div>
      </div>

      <!-- Characters Grid -->
      <div v-else-if="characters.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="character in characters"
          :key="character.id"
          class="bg-navy-800 border border-navy-600 rounded-2xl p-6 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/20 transition-all cursor-pointer group"
          @click="handleView(character.id)"
        >
          <!-- Character Header -->
          <div class="mb-4">
            <h3 class="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
              {{ character.name }}
            </h3>
            <p v-if="character.description" class="text-sm text-gray-400 line-clamp-2">
              {{ character.description }}
            </p>
          </div>

          <!-- Theme Cards Count -->
          <div class="flex items-center gap-2 mb-4">
            <Icon name="heroicons:squares-2x2" class="w-4 h-4 text-purple-400" />
            <span class="text-sm text-gray-400">
              {{ character._count?.themeCards || 0 }} Theme Cards
            </span>
          </div>

          <!-- Actions -->
          <div class="flex gap-2 pt-4 border-t border-navy-600">
            <UiButton
              size="sm"
              variant="outline"
              icon="heroicons:pencil"
              @click.stop="handleEdit(character.id)"
              class="flex-1"
            >
              Modifier
            </UiButton>

            <button
              type="button"
              class="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors border border-navy-600"
              @click.stop="handleDelete(character)"
            >
              <Icon name="heroicons:trash" class="w-4 h-4" />
            </button>
          </div>

          <!-- Dates -->
          <div class="mt-3 pt-3 border-t border-navy-700 text-xs text-gray-500">
            Créé le {{ new Date(character.createdAt).toLocaleDateString('fr-FR') }}
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="bg-navy-800 border border-navy-600 rounded-2xl p-16 text-center">
        <Icon name="heroicons:user-group" class="w-20 h-20 text-gray-600 mx-auto mb-6" />
        <h2 class="text-2xl font-bold text-white mb-3">Aucun personnage</h2>
        <p class="text-gray-400 mb-6 max-w-md mx-auto">
          Créez votre premier personnage pour commencer à jouer avec le Mist Engine.
        </p>
        <UiButton
          variant="primary"
          size="lg"
          icon="heroicons:plus"
          @click="handleNew"
        >
          Créer mon premier personnage
        </UiButton>
      </div>
    </div>
  </div>
</template>
