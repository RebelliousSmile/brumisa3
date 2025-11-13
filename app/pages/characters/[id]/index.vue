<script setup lang="ts">
/**
 * Page Vue Personnage (Lecture Seule)
 *
 * Affichage complet :
 * - Header avec actions (Modifier, Dupliquer, Exporter, Supprimer)
 * - Informations de base
 * - Theme Cards avec tous les tags
 * - Hero Card (Identity/Mystery)
 * - Trackers (Statuses, Story Tags, Story Themes)
 *
 * Design : Dark immersif style showcase
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
const { deleteTag } = useTags()
const { getLabels } = useHeroCard()

// State
const character = ref(null)
const loading = ref(true)

// Load character
onMounted(async () => {
  try {
    loading.value = true
    const data = await characterStore.getCharacter(characterId)
    character.value = data
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
const hackId = computed(() => character.value?.playspace?.hackId || playspace.value?.hackId || 'city-of-mist')
const heroCardLabels = computed(() => getLabels(hackId.value))

// Actions
async function handleEdit() {
  router.push(`/characters/${characterId}/edit`)
}

async function handleExport() {
  try {
    const data = await $fetch(`/api/characters/${characterId}/export`)

    // Download JSON file
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${character.value?.name || 'character'}-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)

    uiStore.notifierSucces('Export réussi', 'Personnage exporté en JSON')
  } catch (err) {
    console.error('Error exporting character:', err)
    uiStore.notifierErreur('Erreur d\'export', 'Impossible d\'exporter le personnage')
  }
}

async function handleDelete() {
  try {
    const confirme = await uiStore.confirmer(
      'Supprimer le personnage',
      `Êtes-vous sûr de vouloir supprimer ${character.value?.name} ? Cette action est irréversible.`,
      {
        labelConfirmer: 'Supprimer définitivement',
        typeConfirmer: 'danger'
      }
    )

    if (!confirme) return

    await characterStore.deleteCharacter(characterId)
    uiStore.notifierSucces('Personnage supprimé')
    router.push('/characters')
  } catch (err) {
    console.error('Error deleting character:', err)
  }
}

useSeoMeta({
  title: `${character.value?.name || 'Personnage'} - Brumisa3`,
  description: 'Vue detaillee de votre personnage'
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
    <div v-else-if="character" class="p-8">
      <div class="max-w-6xl mx-auto">
        <!-- Header avec Actions -->
        <div class="mb-8">
          <div class="flex items-start justify-between">
            <div>
              <h1 class="text-4xl font-bold text-white mb-2">
                {{ character.name }}
              </h1>
              <p class="text-gray-400">
                {{ playspace?.name }} · {{ hackId }}
              </p>
            </div>

            <div class="flex gap-3">
              <UiButton
                variant="primary"
                icon="heroicons:pencil"
                @click="handleEdit"
              >
                Modifier
              </UiButton>

              <UiButton
                variant="outline"
                icon="heroicons:arrow-down-tray"
                @click="handleExport"
              >
                Exporter
              </UiButton>

              <UiButton
                variant="danger"
                icon="heroicons:trash"
                @click="handleDelete"
              >
                Supprimer
              </UiButton>
            </div>
          </div>
        </div>

        <!-- Description -->
        <div v-if="character.description" class="mb-8">
          <div class="bg-navy-800 border border-navy-600 rounded-2xl p-6">
            <p class="text-gray-300">{{ character.description }}</p>
          </div>
        </div>

        <!-- Theme Cards -->
        <section class="mb-8">
          <h2 class="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Icon name="heroicons:squares-2x2" class="w-6 h-6 text-purple-400" />
            Theme Cards
            <span class="text-lg font-normal text-gray-400">
              ({{ character.themeCards?.length || 0 }}/4)
            </span>
          </h2>

          <div v-if="character.themeCards && character.themeCards.length > 0" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div
              v-for="themeCard in character.themeCards"
              :key="themeCard.id"
              class="bg-navy-800 border border-navy-600 rounded-2xl p-6"
            >
              <!-- Theme Card Header -->
              <div class="mb-4">
                <h3 class="text-lg font-bold text-white mb-1">{{ themeCard.name }}</h3>
                <span class="inline-block px-3 py-1 bg-purple-900/50 border border-purple-500 text-purple-300 rounded-full text-xs font-bold">
                  {{ themeCard.type }}
                </span>
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
                <span class="text-xs font-bold text-gray-400 uppercase block mb-2">Power Tags</span>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="tag in themeCard.tags?.filter(t => t.type === 'POWER')"
                    :key="tag.id"
                    :class="[
                      'px-4 py-2 rounded-lg text-sm font-medium border shadow-md',
                      tag.burned
                        ? 'bg-gray-600 text-gray-300 border-gray-500/50 line-through'
                        : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white border-green-500/50'
                    ]"
                  >
                    {{ tag.name }}
                    <span v-if="tag.inverted" class="ml-1 text-xs">(Inv)</span>
                  </span>
                </div>
              </div>

              <!-- Weakness Tags -->
              <div>
                <span class="text-xs font-bold text-gray-400 uppercase block mb-2">Weakness Tags</span>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="tag in themeCard.tags?.filter(t => t.type === 'WEAKNESS')"
                    :key="tag.id"
                    :class="[
                      'px-4 py-2 rounded-lg text-sm font-medium border shadow-md',
                      tag.burned
                        ? 'bg-gray-600 text-gray-300 border-gray-500/50 line-through'
                        : 'bg-gradient-to-r from-red-600 to-rose-600 text-white border-red-500/50'
                    ]"
                  >
                    {{ tag.name }}
                    <span v-if="tag.inverted" class="ml-1 text-xs">(Inv)</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="bg-navy-800 border border-navy-600 rounded-2xl p-12 text-center">
            <Icon name="heroicons:squares-2x2" class="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p class="text-gray-400">Aucune Theme Card</p>
          </div>
        </section>

        <!-- Hero Card -->
        <section class="mb-8">
          <h2 class="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Icon name="heroicons:heart" class="w-6 h-6 text-pink-400" />
            Hero Card
          </h2>

          <div v-if="character.heroCard" class="bg-navy-800 border border-navy-600 rounded-2xl p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 class="text-sm font-bold text-gray-400 uppercase mb-2">
                  {{ heroCardLabels.identity }}
                </h3>
                <p class="text-gray-300">{{ character.heroCard.identity }}</p>
              </div>

              <div>
                <h3 class="text-sm font-bold text-gray-400 uppercase mb-2">
                  {{ heroCardLabels.mystery }}
                </h3>
                <p class="text-gray-300">{{ character.heroCard.mystery }}</p>
              </div>
            </div>

            <!-- Relationships -->
            <div v-if="character.heroCard.relationships && character.heroCard.relationships.length > 0" class="mt-6 pt-6 border-t border-navy-600">
              <h3 class="text-sm font-bold text-gray-400 uppercase mb-3">Relations</h3>
              <div class="space-y-2">
                <div
                  v-for="rel in character.heroCard.relationships"
                  :key="rel.id"
                  class="p-3 bg-navy-700 border border-navy-600 rounded-lg"
                >
                  <div class="font-medium text-white">{{ rel.name }}</div>
                  <p v-if="rel.description" class="text-sm text-gray-400 mt-1">{{ rel.description }}</p>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="bg-navy-800 border border-navy-600 rounded-2xl p-12 text-center">
            <p class="text-gray-400">Hero Card non disponible</p>
          </div>
        </section>

        <!-- Trackers -->
        <section class="mb-8">
          <h2 class="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Icon name="heroicons:chart-bar" class="w-6 h-6 text-yellow-400" />
            Trackers
          </h2>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Statuses -->
            <div class="bg-navy-800 border border-navy-600 rounded-2xl p-6">
              <h3 class="font-bold text-white mb-4 flex items-center gap-2">
                <Icon name="heroicons:heart" class="w-5 h-5 text-red-400" />
                Statuses
              </h3>

              <div v-if="character.trackers?.statuses && character.trackers.statuses.length > 0" class="space-y-2">
                <div
                  v-for="status in character.trackers.statuses"
                  :key="status.id"
                  class="flex items-center gap-3 p-3 bg-navy-700 border border-navy-600 rounded-lg"
                >
                  <div class="flex-1">
                    <div class="text-sm font-medium text-white">{{ status.name }}</div>
                    <div class="text-xs text-gray-500">Tier {{ status.tier }}</div>
                  </div>

                  <!-- Tier Pills -->
                  <div class="flex gap-1">
                    <div
                      v-for="i in 5"
                      :key="i"
                      :class="[
                        'w-2 h-6 rounded-full transition-all',
                        i <= status.tier
                          ? (status.positive ? 'bg-green-500' : 'bg-red-500')
                          : 'bg-navy-600'
                      ]"
                    />
                  </div>
                </div>
              </div>

              <p v-else class="text-sm text-gray-500 italic">Aucun status</p>
            </div>

            <!-- Story Tags -->
            <div class="bg-navy-800 border border-navy-600 rounded-2xl p-6">
              <h3 class="font-bold text-white mb-4 flex items-center gap-2">
                <Icon name="heroicons:bookmark" class="w-5 h-5 text-blue-400" />
                Story Tags
              </h3>

              <div v-if="character.trackers?.storyTags && character.trackers.storyTags.length > 0" class="flex flex-wrap gap-2">
                <span
                  v-for="tag in character.trackers.storyTags"
                  :key="tag.id"
                  class="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-600 text-white rounded-lg text-sm font-medium border border-blue-500/50 shadow-md"
                >
                  {{ tag.name }}
                </span>
              </div>

              <p v-else class="text-sm text-gray-500 italic">Aucun story tag</p>
            </div>

            <!-- Story Themes -->
            <div class="bg-navy-800 border border-navy-600 rounded-2xl p-6">
              <h3 class="font-bold text-white mb-4 flex items-center gap-2">
                <Icon name="heroicons:sparkles" class="w-5 h-5 text-purple-400" />
                Story Themes
              </h3>

              <div v-if="character.trackers?.storyThemes && character.trackers.storyThemes.length > 0" class="flex flex-wrap gap-2">
                <span
                  v-for="theme in character.trackers.storyThemes"
                  :key="theme.id"
                  class="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-sm font-medium border border-purple-500/50 shadow-md"
                >
                  {{ theme.name }}
                </span>
              </div>

              <p v-else class="text-sm text-gray-500 italic">Aucun story theme</p>
            </div>
          </div>
        </section>

        <!-- Back to List -->
        <div class="flex justify-center">
          <UiButton
            variant="ghost"
            icon="heroicons:arrow-left"
            to="/characters"
          >
            Retour à la liste
          </UiButton>
        </div>
      </div>
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
  </div>
</template>
