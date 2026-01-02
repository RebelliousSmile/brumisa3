<script setup lang="ts">
/**
 * Page Action Database
 *
 * Base de donnees consultable des actions JDR classiques
 * reinterpretees dans le Mist Engine
 * Combat, Social, Exploration, Mythos/Magie, Cyberspace
 */

definePageMeta({
  layout: 'default'
})

// State
const loading = ref(true)
const actions = ref<any[]>([])
const filters = ref({
  category: '',
  subcategory: '',
  search: ''
})

// Filter options
const categoryOptions = [
  { value: 'COMBAT', label: 'Combat', icon: 'heroicons:bolt' },
  { value: 'SOCIAL', label: 'Social', icon: 'heroicons:chat-bubble-left-right' },
  { value: 'EXPLORATION', label: 'Exploration', icon: 'heroicons:map' },
  { value: 'MYTHOS', label: 'Mythos/Magie', icon: 'heroicons:sparkles' },
  { value: 'CYBERSPACE', label: 'Cyberspace', icon: 'heroicons:cpu-chip' }
]

// Load actions on mount
onMounted(async () => {
  try {
    loading.value = true
    // TODO: Implement API call to load actions
    // const response = await $fetch('/api/actions', { query: filters.value })
    // actions.value = response
    actions.value = []
  } catch (err) {
    console.error('Error loading actions:', err)
  } finally {
    loading.value = false
  }
})

// Computed - filtered actions
const filteredActions = computed(() => {
  return actions.value.filter(action => {
    if (filters.value.category && action.category !== filters.value.category) return false
    if (filters.value.subcategory && action.subcategory !== filters.value.subcategory) return false
    if (filters.value.search) {
      const search = filters.value.search.toLowerCase()
      return action.name.toLowerCase().includes(search) ||
             action.description?.toLowerCase().includes(search)
    }
    return true
  })
})

// Group actions by category
const actionsByCategory = computed(() => {
  const grouped: Record<string, any[]> = {}
  for (const action of filteredActions.value) {
    if (!grouped[action.category]) {
      grouped[action.category] = []
    }
    grouped[action.category].push(action)
  }
  return grouped
})

// Actions
function handleNew() {
  // TODO: Implement new action modal/page
  console.log('Create new action')
}

function handleView(actionId: string) {
  // TODO: Implement action detail modal
  console.log('View action:', actionId)
}

function selectCategory(category: string) {
  filters.value.category = filters.value.category === category ? '' : category
}

useSeoMeta({
  title: 'Action Database - Brumisa3',
  description: 'Base de donnees des actions JDR pour le Mist Engine'
})
</script>

<template>
  <div class="min-h-screen bg-navy-900 p-8 pt-24">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl font-bold text-white mb-2">
            Action Database
          </h1>
          <p class="text-gray-400">
            Actions JDR classiques reinterpretees pour le Mist Engine
          </p>
        </div>

        <UiButton
          variant="primary"
          icon="heroicons:plus"
          @click="handleNew"
        >
          Ajouter une Action
        </UiButton>
      </div>

      <!-- Category Filters -->
      <div class="flex flex-wrap gap-3 mb-6">
        <button
          v-for="cat in categoryOptions"
          :key="cat.value"
          class="flex items-center gap-2 px-4 py-2 rounded-xl border transition-all"
          :class="filters.category === cat.value
            ? 'bg-purple-900/50 border-purple-500 text-purple-300'
            : 'bg-navy-800 border-navy-600 text-gray-400 hover:border-gray-500'"
          @click="selectCategory(cat.value)"
        >
          <Icon :name="cat.icon" class="w-5 h-5" />
          <span>{{ cat.label }}</span>
        </button>
      </div>

      <!-- Search -->
      <div class="mb-6">
        <UiInput
          v-model="filters.search"
          placeholder="Rechercher une action..."
          icon="heroicons:magnifying-glass"
          class="max-w-md"
        />
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center min-h-96">
        <div class="text-center">
          <Icon name="heroicons:arrow-path" class="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
          <p class="text-gray-400">Chargement des actions...</p>
        </div>
      </div>

      <!-- Actions by Category -->
      <div v-else-if="Object.keys(actionsByCategory).length > 0" class="space-y-8">
        <div
          v-for="(categoryActions, category) in actionsByCategory"
          :key="category"
          class="bg-navy-800 border border-navy-600 rounded-2xl p-6"
        >
          <h2 class="text-xl font-bold text-purple-400 mb-4 uppercase tracking-wider">
            {{ category }}
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="action in categoryActions"
              :key="action.id"
              class="bg-navy-700 border border-navy-500 rounded-xl p-4 hover:border-purple-500 transition-all cursor-pointer"
              @click="handleView(action.id)"
            >
              <div class="flex items-start justify-between mb-2">
                <h3 class="font-bold text-white">{{ action.name }}</h3>
                <span class="text-xs text-gray-500 uppercase">{{ action.subcategory }}</span>
              </div>
              <p class="text-sm text-gray-400 line-clamp-2">{{ action.description }}</p>

              <!-- Examples -->
              <div v-if="action.examples?.length" class="mt-3 pt-3 border-t border-navy-600">
                <p class="text-xs text-gray-500 italic">
                  Ex: {{ action.examples[0] }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="bg-navy-800 border border-navy-600 rounded-2xl p-16 text-center">
        <Icon name="heroicons:bolt" class="w-20 h-20 text-gray-600 mx-auto mb-6" />
        <h2 class="text-2xl font-bold text-white mb-3">Aucune action trouvee</h2>
        <p class="text-gray-400 mb-6 max-w-md mx-auto">
          La base de donnees d'actions est vide ou aucun resultat ne correspond a vos filtres.
        </p>
        <UiButton
          variant="primary"
          size="lg"
          icon="heroicons:plus"
          @click="handleNew"
        >
          Ajouter une action
        </UiButton>
      </div>
    </div>
  </div>
</template>
