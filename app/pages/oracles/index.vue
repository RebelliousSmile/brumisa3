<template>
  <div class="min-h-screen bg-gray-900">
    <div class="relative">
      <!-- Background -->
      <div class="absolute inset-0 bg-gradient-to-br from-gray-900 via-purple-900/20 to-black"></div>
      
      <!-- Contenu principal -->
      <div class="relative z-10 px-4 py-16">
        <div class="max-w-6xl mx-auto">
          <!-- En-tête -->
          <div class="text-center mb-12">
            <div class="text-6xl mb-6">🔮</div>
            <h1 class="text-4xl md:text-6xl font-bold text-white mb-6 font-display">
              Oracles JDR
            </h1>
            <p class="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Découvrez nos générateurs d'oracles pour enrichir vos parties de jeu de rôle
            </p>
          </div>
          
          <!-- Filtres -->
          <div class="mb-8 flex flex-wrap gap-4 justify-center">
            <select 
              v-model="selectedSystem" 
              class="px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-600 focus:ring-generique focus:border-generique"
            >
              <option value="">Tous les systèmes</option>
              <option v-for="system in systems" :key="system.slug" :value="system.slug">
                {{ system.nom }}
              </option>
            </select>
            
            <select 
              v-model="selectedCategory" 
              class="px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-600 focus:ring-generique focus:border-generique"
            >
              <option value="">Toutes les catégories</option>
              <option v-for="category in categories" :key="category" :value="category">
                {{ category }}
              </option>
            </select>
          </div>
          
          <!-- Liste des oracles -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" v-if="filteredOracles.length > 0">
            <div 
              v-for="oracle in filteredOracles" 
              :key="oracle.id"
              class="bg-gray-800/50 rounded-lg p-6 hover:bg-gray-800/70 transition-colors cursor-pointer border border-gray-700 hover:border-generique/50"
              @click="navigateToOracle(oracle.id)"
            >
              <!-- En-tête de la carte -->
              <div class="flex items-start justify-between mb-4">
                <div class="flex-1">
                  <h3 class="text-white font-semibold text-lg mb-1">{{ oracle.nom }}</h3>
                  <p class="text-generique text-sm">{{ oracle.systeme }}</p>
                </div>
                <div class="text-2xl">🎲</div>
              </div>
              
              <!-- Description -->
              <p class="text-gray-300 text-sm mb-4 line-clamp-3" v-if="oracle.description">
                {{ oracle.description }}
              </p>
              
              <!-- Métadonnées -->
              <div class="flex items-center justify-between text-xs text-gray-400">
                <span v-if="oracle.categorie">{{ oracle.categorie }}</span>
                <span v-if="oracle.nombre_elements">{{ oracle.nombre_elements }} éléments</span>
              </div>
            </div>
          </div>
          
          <!-- État de chargement -->
          <div v-else-if="pending" class="text-center">
            <div class="text-white text-xl">Chargement des oracles...</div>
          </div>
          
          <!-- Aucun oracle -->
          <div v-else class="text-center text-gray-400">
            <div class="text-6xl mb-4">🔮</div>
            <h3 class="text-2xl mb-2">Aucun oracle trouvé</h3>
            <p>Aucun oracle ne correspond à vos critères de recherche.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { getSystems } = useSystemes()
const route = useRoute()

// Filtres depuis l'URL
const selectedSystem = ref(route.query.systeme as string || '')
const selectedCategory = ref(route.query.categorie as string || '')

// Données
const { data: systems } = await useLazyAsyncData('systems', () => getSystems())
const { data: allOracles, pending } = await useLazyAsyncData('oracles', () => 
  $fetch('/api/oracles')
)

// Catégories uniques
const categories = computed(() => {
  if (!allOracles.value) return []
  return [...new Set(allOracles.value.map(o => o.categorie).filter(Boolean))]
})

// Oracles filtrés
const filteredOracles = computed(() => {
  if (!allOracles.value) return []
  
  let filtered = allOracles.value
  
  if (selectedSystem.value) {
    filtered = filtered.filter(o => o.systeme_slug === selectedSystem.value)
  }
  
  if (selectedCategory.value) {
    filtered = filtered.filter(o => o.categorie === selectedCategory.value)
  }
  
  return filtered
})

const navigateToOracle = (oracleId: number) => {
  navigateTo(`/oracles/${oracleId}`)
}

// Watch pour mettre à jour l'URL
watch([selectedSystem, selectedCategory], ([newSystem, newCategory]) => {
  const query: Record<string, string> = {}
  if (newSystem) query.systeme = newSystem
  if (newCategory) query.categorie = newCategory
  
  navigateTo({ query }, { replace: true })
})

useSeoMeta({
  title: 'Oracles JDR - Brumisater',
  description: 'Découvrez nos générateurs d\'oracles pour enrichir vos parties de jeu de rôle'
})
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>