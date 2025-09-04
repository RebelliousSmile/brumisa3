<template>
  <div class="min-h-screen bg-gray-900">
    <div class="relative">
      <!-- Background -->
      <div class="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-900/10 to-black"></div>
      
      <!-- Contenu principal -->
      <div class="relative z-10 px-4 py-16">
        <div class="max-w-7xl mx-auto">
          
          <!-- Header -->
          <div class="mb-12">
            <h1 class="text-3xl md:text-4xl font-bold text-white mb-2">
              Tableau de bord
            </h1>
            <p class="text-gray-300">
              Bienvenue, {{ user?.nom || 'Joueur' }} ! Voici un aperçu de votre activité.
            </p>
          </div>
          
          <!-- Statistiques -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div class="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-gray-400 text-sm">Utilisateurs</p>
                  <p class="text-2xl font-bold text-white">{{ stats?.data?.nbUtilisateursInscrits || 0 }}</p>
                </div>
                <div class="text-3xl">👥</div>
              </div>
            </div>
            
            <div class="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-gray-400 text-sm">PDFs générés</p>
                  <p class="text-2xl font-bold text-white">{{ stats?.data?.nbPdfsStockes || 0 }}</p>
                </div>
                <div class="text-3xl">📄</div>
              </div>
            </div>
            
            <div class="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-gray-400 text-sm">Contenus ouverts</p>
                  <p class="text-2xl font-bold text-white">{{ stats?.data?.nbContenusOuvertsMois || 0 }}</p>
                </div>
                <div class="text-3xl">📖</div>
              </div>
            </div>
            
            <div class="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-gray-400 text-sm">Newsletter</p>
                  <p class="text-2xl font-bold text-white">{{ stats?.data?.nbAbonnesNewsletter || 0 }}</p>
                </div>
                <div class="text-3xl">🔮</div>
              </div>
            </div>
          </div>
          
          <!-- Grille principale -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            <!-- Personnages récents -->
            <div class="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <div class="flex items-center justify-between mb-6">
                <h2 class="text-xl font-bold text-white">Personnages récents</h2>
                <NuxtLink 
                  to="/personnages" 
                  class="text-generique hover:text-generique/80 text-sm"
                >
                  Voir tout →
                </NuxtLink>
              </div>
              
              <div v-if="recentPersonnages && recentPersonnages.length > 0" class="space-y-3">
                <div 
                  v-for="personnage in (recentPersonnages as any[]).slice(0, 5)" 
                  :key="personnage.id"
                  class="flex items-center justify-between p-3 bg-gray-900/50 rounded hover:bg-gray-900/70 transition-colors"
                >
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 bg-generique/20 rounded-full flex items-center justify-center text-sm">
                      ⚔️
                    </div>
                    <div>
                      <div class="text-white font-medium">{{ personnage.titre }}</div>
                      <div class="text-gray-400 text-sm">{{ personnage.systemeJeu }}</div>
                    </div>
                  </div>
                  <div class="flex gap-2">
                    <button 
                      @click="editPersonnage(personnage.id)"
                      class="text-gray-400 hover:text-white text-sm"
                    >
                      ✏️
                    </button>
                    <button 
                      @click="handleGeneratePdf(personnage.id)"
                      class="text-gray-400 hover:text-white text-sm"
                    >
                      📄
                    </button>
                  </div>
                </div>
              </div>
              
              <div v-else class="text-center text-gray-400 py-8">
                <div class="text-4xl mb-2">⚔️</div>
                <p class="mb-4">Aucun personnage pour le moment</p>
                <NuxtLink 
                  to="/personnages/nouveau"
                  class="text-generique hover:text-generique/80"
                >
                  Créer votre premier personnage
                </NuxtLink>
              </div>
            </div>
            
            <!-- PDFs récents -->
            <div class="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <div class="flex items-center justify-between mb-6">
                <h2 class="text-xl font-bold text-white">PDFs récents</h2>
                <button 
                  @click="refreshRecentPdfs"
                  class="text-generique hover:text-generique/80 text-sm"
                >
                  ↻ Actualiser
                </button>
              </div>
              
              <RecentPdfs :limit="5" />
            </div>
            
          </div>
          
          <!-- Actions rapides -->
          <div class="mt-12">
            <h2 class="text-xl font-bold text-white mb-6">Actions rapides</h2>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <NuxtLink 
                to="/personnages/nouveau"
                class="bg-gray-800/50 rounded-lg p-4 text-center hover:bg-gray-800/70 transition-colors border border-gray-700 hover:border-generique/50"
              >
                <div class="text-2xl mb-2">⚔️</div>
                <div class="text-white font-medium">Nouveau personnage</div>
              </NuxtLink>
              
              <NuxtLink 
                to="/oracles"
                class="bg-gray-800/50 rounded-lg p-4 text-center hover:bg-gray-800/70 transition-colors border border-gray-700 hover:border-generique/50"
              >
                <div class="text-2xl mb-2">🔮</div>
                <div class="text-white font-medium">Consulter les oracles</div>
              </NuxtLink>
              
              <NuxtLink 
                to="/systemes"
                class="bg-gray-800/50 rounded-lg p-4 text-center hover:bg-gray-800/70 transition-colors border border-gray-700 hover:border-generique/50"
              >
                <div class="text-2xl mb-2">🎲</div>
                <div class="text-white font-medium">Explorer les systèmes</div>
              </NuxtLink>
              
              <button 
                @click="showStats = !showStats"
                class="bg-gray-800/50 rounded-lg p-4 text-center hover:bg-gray-800/70 transition-colors border border-gray-700 hover:border-generique/50"
              >
                <div class="text-2xl mb-2">📊</div>
                <div class="text-white font-medium">Statistiques</div>
              </button>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const { user } = useAuthStore()
const { personnages } = usePersonnagesStore()
const { genererPdf } = usePdfStore()

const showStats = ref(false)

// Données
const { data: stats } = await useLazyAsyncData('dashboard-stats', () => 
  $fetch('/api/statistics')
)

// Personnages récents (simulé pour l'instant)
const recentPersonnages = computed(() => {
  if (!personnages.value) return []
  return [...personnages.value]
    .sort((a: any, b: any) => new Date(b.dateModification).getTime() - new Date(a.dateModification).getTime())
    .slice(0, 5)
})

const refreshRecentPdfs = () => {
  // Actualiser les PDFs récents - à implémenter
}

const editPersonnage = (id: number) => {
  navigateTo(`/personnages/${id}/edit`)
}

const handleGeneratePdf = async (id: number) => {
  try {
    const personnage = personnages.value?.find((p: any) => p.id === id)
    if (personnage) {
      await genererPdf({
        titre: personnage.titre,
        systemeJeu: personnage.systemeJeu,
        universJeu: personnage.universJeu,
        contenu: personnage.contenu
      })
    }
  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error)
  }
}

useSeoMeta({
  title: 'Tableau de bord - Brumisater',
  description: 'Votre espace personnel Brumisater'
})
</script>