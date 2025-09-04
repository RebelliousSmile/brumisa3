<template>
  <div class="min-h-screen bg-gray-900" v-if="oracle">
    <div class="relative">
      <!-- Background -->
      <div class="absolute inset-0 bg-gradient-to-br from-gray-900 via-purple-900/20 to-black"></div>
      
      <!-- Contenu principal -->
      <div class="relative z-10 px-4 py-16">
        <div class="max-w-4xl mx-auto">
          
          <!-- Header -->
          <div class="text-center mb-12">
            <div class="text-6xl mb-6">🔮</div>
            <h1 class="text-3xl md:text-5xl font-bold text-white mb-4 font-display">
              {{ oracle.nom }}
            </h1>
            <div class="flex items-center justify-center gap-4 text-gray-300 mb-6">
              <span class="px-3 py-1 bg-generique/20 text-generique rounded-full text-sm">
                {{ oracle.systeme }}
              </span>
              <span v-if="oracle.categorie" class="px-3 py-1 bg-gray-800 rounded-full text-sm">
                {{ oracle.categorie }}
              </span>
            </div>
            <p class="text-lg text-gray-300 max-w-2xl mx-auto" v-if="oracle.description">
              {{ oracle.description }}
            </p>
          </div>
          
          <!-- Interface de génération -->
          <div class="bg-gray-800/50 rounded-lg p-8 mb-8">
            <div class="text-center">
              <button 
                @click="generateResult"
                :disabled="loading"
                class="px-8 py-3 bg-generique text-white rounded-lg hover:bg-generique/80 transition-colors font-semibold text-lg disabled:opacity-50"
              >
                <span v-if="loading">Génération...</span>
                <span v-else>🎲 Lancer l'Oracle</span>
              </button>
            </div>
            
            <!-- Résultat -->
            <div v-if="currentResult" class="mt-8 p-6 bg-gray-900/50 rounded-lg border border-generique/30">
              <div class="text-center">
                <div class="text-generique font-semibold mb-2">Résultat :</div>
                <div class="text-white text-xl">{{ currentResult.texte }}</div>
                <div class="text-gray-400 text-sm mt-2" v-if="currentResult.description">
                  {{ currentResult.description }}
                </div>
                <div class="text-gray-500 text-xs mt-2">
                  Jet : {{ currentResult.jet }}/{{ oracle.nombre_elements }}
                </div>
              </div>
            </div>
          </div>
          
          <!-- Historique -->
          <div v-if="history.length > 0" class="mb-8">
            <h3 class="text-white font-semibold text-lg mb-4 text-center">Historique des jets</h3>
            <div class="space-y-2">
              <div 
                v-for="(result, index) in history.slice(-5)" 
                :key="index"
                class="bg-gray-800/30 rounded p-3 text-gray-300 text-sm"
              >
                <span class="text-white">{{ result.texte }}</span>
                <span class="text-gray-500 ml-2">({{ result.jet }}/{{ oracle.nombre_elements }})</span>
              </div>
            </div>
            <div class="text-center mt-4">
              <button 
                @click="clearHistory"
                class="text-gray-400 hover:text-white text-sm"
              >
                Effacer l'historique
              </button>
            </div>
          </div>
          
          <!-- Navigation -->
          <div class="text-center">
            <NuxtLink 
              to="/oracles" 
              class="text-generique hover:text-generique/80 transition-colors"
            >
              ← Retour aux oracles
            </NuxtLink>
          </div>
          
        </div>
      </div>
    </div>
  </div>
  
  <!-- État de chargement -->
  <div v-else-if="pending" class="min-h-screen bg-gray-900 flex items-center justify-center">
    <div class="text-center text-white">
      <div class="text-4xl mb-4">🔮</div>
      <div class="text-xl">Chargement de l'oracle...</div>
    </div>
  </div>
  
  <!-- Oracle non trouvé -->
  <div v-else class="min-h-screen bg-gray-900 flex items-center justify-center">
    <div class="text-center text-white">
      <div class="text-6xl mb-4">❌</div>
      <h1 class="text-3xl mb-2">Oracle non trouvé</h1>
      <p class="text-gray-300 mb-6">L'oracle demandé n'existe pas ou n'est plus disponible.</p>
      <NuxtLink 
        to="/oracles" 
        class="px-6 py-2 bg-generique text-white rounded-lg hover:bg-generique/80 transition-colors"
      >
        Voir tous les oracles
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const oracleId = route.params.id as string

// Données
const { data: oracle, pending } = await useLazyAsyncData(`oracle-${oracleId}`, () => 
  $fetch(`/api/oracles/${oracleId}`)
)

// État local
const loading = ref(false)
const currentResult = ref<any>(null)
const history = ref<any[]>([])

const generateResult = async () => {
  if (!oracle.value) return
  
  loading.value = true
  
  try {
    const result = await $fetch(`/api/oracles/${oracleId}/generate`, {
      method: 'POST'
    })
    
    currentResult.value = result
    history.value.push(result)
    
    // Limiter l'historique à 20 éléments
    if (history.value.length > 20) {
      history.value = history.value.slice(-20)
    }
    
  } catch (error) {
    console.error('Erreur lors de la génération:', error)
  } finally {
    loading.value = false
  }
}

const clearHistory = () => {
  history.value = []
  currentResult.value = null
}

// SEO
watchEffect(() => {
  if (oracle.value) {
    useSeoMeta({
      title: `${oracle.value.nom} - Oracles - Brumisater`,
      description: oracle.value.description || `Oracle ${oracle.value.nom} pour ${oracle.value.systeme}`
    })
  }
})
</script>