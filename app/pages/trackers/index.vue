<script setup lang="ts">
/**
 * Page Suivi de Trackers (Scene/Session)
 *
 * Tableaux de suivi pour scenes et sessions de jeu
 * Status, Story Tags, Story Themes temporaires (non lies aux personnages)
 */

definePageMeta({
  layout: 'playspace',
  middleware: ['auth']
})

const router = useRouter()
const playspaceStore = usePlayspaceStore()
const uiStore = useUiStore()

// State
const loading = ref(true)
const trackers = ref<any[]>([])

// Load trackers on mount
onMounted(async () => {
  if (!playspaceStore.activePlayspaceId) {
    uiStore.notifierErreur('Erreur', 'Aucun playspace actif')
    router.push('/playspaces')
    return
  }

  try {
    loading.value = true
    // TODO: Implement API call to load session trackers
    // const response = await $fetch(`/api/trackers?playspaceId=${playspaceStore.activePlayspaceId}`)
    // trackers.value = response
    trackers.value = []
  } catch (err) {
    console.error('Error loading trackers:', err)
    uiStore.notifierErreur('Erreur', 'Impossible de charger les trackers')
  } finally {
    loading.value = false
  }
})

// Computed
const playspace = computed(() => playspaceStore.activePlayspace)

// Actions
function handleNew() {
  // TODO: Implement new tracker modal/page
  uiStore.notifierInfo('Info', 'Creation de tracker a implementer')
}

useSeoMeta({
  title: `Trackers - ${playspace.value?.name || 'Brumisa3'}`,
  description: 'Suivi de trackers de scene et session'
})
</script>

<template>
  <div class="min-h-screen bg-navy-900 p-8">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl font-bold text-white mb-2">
            Suivi de Trackers
          </h1>
          <p class="text-gray-400">
            {{ playspace?.name }} - Trackers de scene et session
          </p>
        </div>

        <UiButton
          variant="primary"
          icon="heroicons:plus"
          @click="handleNew"
        >
          Nouveau Tracker
        </UiButton>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center min-h-96">
        <div class="text-center">
          <Icon name="heroicons:arrow-path" class="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p class="text-gray-400">Chargement des trackers...</p>
        </div>
      </div>

      <!-- Trackers Grid -->
      <div v-else-if="trackers.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="tracker in trackers"
          :key="tracker.id"
          class="bg-navy-800 border border-navy-600 rounded-2xl p-6 hover:border-cyan-500 hover:shadow-xl hover:shadow-cyan-500/20 transition-all"
        >
          <h3 class="text-xl font-bold text-white mb-2">{{ tracker.name }}</h3>
          <p v-if="tracker.description" class="text-sm text-gray-400 mb-4">{{ tracker.description }}</p>

          <!-- Status -->
          <div class="mb-3">
            <span class="text-xs text-cyan-400 uppercase tracking-wider">Status</span>
            <div class="flex flex-wrap gap-2 mt-1">
              <span
                v-for="status in tracker.statuses"
                :key="status.name"
                class="px-2 py-1 text-xs rounded"
                :class="status.positive ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'"
              >
                {{ status.name }}-{{ status.tier }}
              </span>
            </div>
          </div>

          <!-- Story Tags -->
          <div class="mb-3">
            <span class="text-xs text-purple-400 uppercase tracking-wider">Story Tags</span>
            <div class="flex flex-wrap gap-1 mt-1">
              <span
                v-for="tag in tracker.storyTags"
                :key="tag.name"
                class="text-xs text-gray-400"
              >
                #{{ tag.name }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="bg-navy-800 border border-navy-600 rounded-2xl p-16 text-center">
        <Icon name="heroicons:chart-bar" class="w-20 h-20 text-gray-600 mx-auto mb-6" />
        <h2 class="text-2xl font-bold text-white mb-3">Aucun tracker</h2>
        <p class="text-gray-400 mb-6 max-w-md mx-auto">
          Creez un tracker pour suivre les status, story tags et story themes de vos scenes.
        </p>
        <UiButton
          variant="primary"
          size="lg"
          icon="heroicons:plus"
          @click="handleNew"
        >
          Creer mon premier tracker
        </UiButton>
      </div>
    </div>
  </div>
</template>
