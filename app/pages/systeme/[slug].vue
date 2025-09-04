<template>
  <div class="min-h-screen bg-gray-900" v-if="system">
    <div class="relative">
      <!-- Background avec gradient spécifique au système -->
      <div class="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black"></div>
      <div 
        class="absolute inset-0 opacity-20"
        :class="systemBackgroundClass"
      ></div>
      
      <!-- Contenu principal -->
      <div class="relative z-10 px-4 py-16">
        <div class="max-w-6xl mx-auto">
          
          <!-- Header du système -->
          <div class="text-center mb-16">
            <div class="mb-8">
              <img 
                v-if="system.logo" 
                :src="system.logo" 
                :alt="`Logo ${system.nom}`"
                class="h-20 mx-auto mb-6"
              >
              <div v-else class="text-6xl mb-6">🎲</div>
            </div>
            
            <h1 class="text-4xl md:text-6xl font-bold text-white mb-6 font-display">
              {{ system.nom }}
            </h1>
            
            <p class="text-xl text-gray-300 mb-8 max-w-3xl mx-auto" v-if="system.description">
              {{ system.description }}
            </p>
            
            <!-- Actions principales -->
            <div class="flex flex-wrap gap-4 justify-center">
              <NuxtLink 
                :to="`/systemes/${system.slug}/personnage`"
                class="px-8 py-3 bg-generique text-white rounded-lg hover:bg-generique/80 transition-colors font-semibold"
              >
                Créer un personnage
              </NuxtLink>
              
              <NuxtLink 
                :to="`/systemes/${system.slug}/documents`"
                class="px-8 py-3 border border-gray-600 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                Documents génériques
              </NuxtLink>
              
              <NuxtLink 
                v-if="system.oracles_disponibles"
                :to="`/oracles?systeme=${system.slug}`"
                class="px-8 py-3 border border-gray-600 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                Oracles
              </NuxtLink>
            </div>
          </div>
          
          <!-- Section Fonctionnalités -->
          <div class="mb-16" v-if="system.fonctionnalites && system.fonctionnalites.length > 0">
            <h2 class="text-3xl font-bold text-white mb-8 text-center">Fonctionnalités</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div 
                v-for="feature in system.fonctionnalites" 
                :key="feature"
                class="bg-gray-800/50 rounded-lg p-6 text-center"
              >
                <div class="text-generique text-4xl mb-4">✨</div>
                <h3 class="text-white font-semibold mb-2">{{ feature }}</h3>
              </div>
            </div>
          </div>
          
          <!-- Section Univers (si applicable) -->
          <div v-if="system.univers && system.univers.length > 0" class="mb-16">
            <h2 class="text-3xl font-bold text-white mb-8 text-center">Univers disponibles</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div 
                v-for="univers in system.univers" 
                :key="univers.id"
                class="bg-gray-800/50 rounded-lg p-6 hover:bg-gray-800/70 transition-colors cursor-pointer"
                @click="navigateToUnivers(univers.slug)"
              >
                <h3 class="text-white font-semibold mb-2">{{ univers.nom }}</h3>
                <p class="text-gray-300 text-sm" v-if="univers.description">
                  {{ univers.description }}
                </p>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  </div>
  
  <!-- État de chargement -->
  <div v-else-if="pending" class="min-h-screen bg-gray-900 flex items-center justify-center">
    <div class="text-center text-white">
      <div class="text-4xl mb-4">🎲</div>
      <div class="text-xl">Chargement du système...</div>
    </div>
  </div>
  
  <!-- Système non trouvé -->
  <div v-else class="min-h-screen bg-gray-900 flex items-center justify-center">
    <div class="text-center text-white">
      <div class="text-6xl mb-4">❌</div>
      <h1 class="text-3xl mb-2">Système non trouvé</h1>
      <p class="text-gray-300 mb-6">Le système demandé n'existe pas ou n'est plus disponible.</p>
      <NuxtLink 
        to="/systemes" 
        class="px-6 py-2 bg-generique text-white rounded-lg hover:bg-generique/80 transition-colors"
      >
        Voir tous les systèmes
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const { getSystemBySlug } = useSystemes()

const slug = route.params.slug as string

const { data: system, pending } = await useLazyAsyncData(`system-${slug}`, () => 
  getSystemBySlug(slug)
)

// Classe de background spécifique au système
const systemBackgroundClass = computed(() => {
  if (!system.value) return ''
  
  const systemMap: Record<string, string> = {
    'monsterhearts': 'bg-gradient-to-br from-purple-900/50 to-pink-900/50',
    'engrenages': 'bg-gradient-to-br from-amber-900/50 to-orange-900/50',
    'metro2033': 'bg-gradient-to-br from-green-900/50 to-teal-900/50',
    'zombiology': 'bg-gradient-to-br from-red-900/50 to-gray-900/50'
  }
  
  return systemMap[system.value.slug] || 'bg-gradient-to-br from-blue-900/50 to-indigo-900/50'
})

const navigateToUnivers = (universSlug: string) => {
  router.push(`/systemes/${slug}/univers/${universSlug}`)
}

// SEO
watchEffect(() => {
  if (system.value) {
    useSeoMeta({
      title: `${system.value.nom} - Brumisater`,
      description: system.value.description || `Générateur de fiches pour ${system.value.nom}`
    })
  }
})
</script>