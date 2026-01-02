<script setup lang="ts">
/**
 * Page Collection de Dangers
 *
 * Base de donnees des menaces et adversaires Mist Engine
 * Challenges, Journeys, Vignettes, Adversaires
 * Filtrage par type, categorie, rating, role, hack
 */

definePageMeta({
  layout: 'default'
})

// State
const loading = ref(true)
const dangers = ref<any[]>([])
const filters = ref({
  type: '',
  category: '',
  rating: 0,
  search: ''
})

// Filter options
const typeOptions = ['CHALLENGE', 'JOURNEY', 'VIGNETTE']
const categoryOptions = ['CREATURE', 'NPC', 'ENVIRONMENT', 'SOCIAL', 'MYTHIC']
const ratingOptions = [1, 2, 3, 4, 5]

// Load dangers on mount
onMounted(async () => {
  try {
    loading.value = true
    // TODO: Implement API call to load dangers
    // const response = await $fetch('/api/dangers', { query: filters.value })
    // dangers.value = response
    dangers.value = []
  } catch (err) {
    console.error('Error loading dangers:', err)
  } finally {
    loading.value = false
  }
})

// Computed - filtered dangers
const filteredDangers = computed(() => {
  return dangers.value.filter(danger => {
    if (filters.value.type && danger.type !== filters.value.type) return false
    if (filters.value.category && danger.category !== filters.value.category) return false
    if (filters.value.rating && danger.rating !== filters.value.rating) return false
    if (filters.value.search) {
      const search = filters.value.search.toLowerCase()
      return danger.name.toLowerCase().includes(search) ||
             danger.description?.toLowerCase().includes(search)
    }
    return true
  })
})

// Actions
function handleNew() {
  // TODO: Implement new danger modal/page
  console.log('Create new danger')
}

function handleView(dangerId: string) {
  // TODO: Implement danger detail modal
  console.log('View danger:', dangerId)
}

useSeoMeta({
  title: 'Collection de Dangers - Brumisa3',
  description: 'Base de donnees des menaces et adversaires Mist Engine'
})
</script>

<template>
  <div class="min-h-screen bg-navy-900 p-8 pt-24">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl font-bold text-white mb-2">
            Collection de Dangers
          </h1>
          <p class="text-gray-400">
            Menaces, adversaires et defis pour le Mist Engine
          </p>
        </div>

        <UiButton
          variant="primary"
          icon="heroicons:plus"
          @click="handleNew"
        >
          Ajouter un Danger
        </UiButton>
      </div>

      <!-- Filters -->
      <div class="bg-navy-800 border border-navy-600 rounded-xl p-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
          <!-- Search -->
          <div class="md:col-span-2">
            <UiInput
              v-model="filters.search"
              placeholder="Rechercher un danger..."
              icon="heroicons:magnifying-glass"
            />
          </div>

          <!-- Type Filter -->
          <UiSelect
            v-model="filters.type"
            :options="[{ value: '', label: 'Tous les types' }, ...typeOptions.map(t => ({ value: t, label: t }))]"
            placeholder="Type"
          />

          <!-- Category Filter -->
          <UiSelect
            v-model="filters.category"
            :options="[{ value: '', label: 'Toutes categories' }, ...categoryOptions.map(c => ({ value: c, label: c }))]"
            placeholder="Categorie"
          />

          <!-- Rating Filter -->
          <UiSelect
            v-model="filters.rating"
            :options="[{ value: 0, label: 'Tous ratings' }, ...ratingOptions.map(r => ({ value: r, label: `Rating ${r}` }))]"
            placeholder="Rating"
          />
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center min-h-96">
        <div class="text-center">
          <Icon name="heroicons:arrow-path" class="w-12 h-12 text-red-500 animate-spin mx-auto mb-4" />
          <p class="text-gray-400">Chargement des dangers...</p>
        </div>
      </div>

      <!-- Dangers Grid -->
      <div v-else-if="filteredDangers.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="danger in filteredDangers"
          :key="danger.id"
          class="bg-navy-800 border border-navy-600 rounded-2xl p-6 hover:border-red-500 hover:shadow-xl hover:shadow-red-500/20 transition-all cursor-pointer"
          @click="handleView(danger.id)"
        >
          <!-- Header -->
          <div class="flex items-start justify-between mb-3">
            <h3 class="text-xl font-bold text-white">{{ danger.name }}</h3>
            <span class="px-2 py-1 bg-red-900/50 text-red-400 text-xs rounded">
              {{ danger.type }}
            </span>
          </div>

          <!-- Category & Rating -->
          <div class="flex items-center gap-3 mb-3">
            <span class="text-xs text-gray-500 uppercase">{{ danger.category }}</span>
            <div class="flex">
              <Icon
                v-for="i in 5"
                :key="i"
                name="heroicons:star-solid"
                class="w-4 h-4"
                :class="i <= danger.rating ? 'text-yellow-500' : 'text-gray-700'"
              />
            </div>
          </div>

          <!-- Description -->
          <p v-if="danger.description" class="text-sm text-gray-400 line-clamp-3">
            {{ danger.description }}
          </p>

          <!-- Tags -->
          <div v-if="danger.tags?.length" class="flex flex-wrap gap-1 mt-3">
            <span
              v-for="tag in danger.tags.slice(0, 5)"
              :key="tag"
              class="text-xs text-gray-500"
            >
              #{{ tag }}
            </span>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="bg-navy-800 border border-navy-600 rounded-2xl p-16 text-center">
        <Icon name="heroicons:exclamation-triangle" class="w-20 h-20 text-gray-600 mx-auto mb-6" />
        <h2 class="text-2xl font-bold text-white mb-3">Aucun danger trouve</h2>
        <p class="text-gray-400 mb-6 max-w-md mx-auto">
          La collection de dangers est vide ou aucun resultat ne correspond a vos filtres.
        </p>
        <UiButton
          variant="primary"
          size="lg"
          icon="heroicons:plus"
          @click="handleNew"
        >
          Ajouter un danger
        </UiButton>
      </div>
    </div>
  </div>
</template>
