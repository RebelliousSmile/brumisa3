<template>
  <div class="min-h-screen bg-gray-900">
    <div class="relative">
      <!-- Background -->
      <div class="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-900/20 to-black"></div>
      
      <!-- Contenu principal -->
      <div class="relative z-10 px-4 py-16">
        <div class="max-w-6xl mx-auto">
          
          <!-- En-tête -->
          <div class="text-center mb-12">
            <div class="text-6xl mb-6">⚔️</div>
            <h1 class="text-4xl md:text-6xl font-bold text-white mb-6 font-display">
              Mes Personnages
            </h1>
            <p class="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Gérez vos personnages et générez leurs fiches PDF
            </p>
            
            <!-- Action principale -->
            <div class="mb-8">
              <NuxtLink 
                to="/personnages/nouveau"
                class="px-8 py-3 bg-generique text-white rounded-lg hover:bg-generique/80 transition-colors font-semibold text-lg"
              >
                + Créer un nouveau personnage
              </NuxtLink>
            </div>
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
            
            <input 
              v-model="searchTerm"
              type="text"
              placeholder="Rechercher un personnage..."
              class="px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-600 focus:ring-generique focus:border-generique"
            >
          </div>
          
          <!-- Liste des personnages -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" v-if="filteredPersonnages.length > 0">
            <div 
              v-for="personnage in filteredPersonnages" 
              :key="personnage.id"
              class="bg-gray-800/50 rounded-lg p-6 hover:bg-gray-800/70 transition-colors border border-gray-700 hover:border-generique/50"
            >
              <!-- En-tête de la carte -->
              <div class="flex items-start justify-between mb-4">
                <div class="flex-1">
                  <h3 class="text-white font-semibold text-lg mb-1">{{ personnage.nom }}</h3>
                  <p class="text-generique text-sm">{{ personnage.systeme }}</p>
                </div>
                <div class="text-2xl">⚔️</div>
              </div>
              
              <!-- Métadonnées -->
              <div class="text-gray-300 text-sm mb-4">
                <div v-if="personnage.classe">Classe: {{ personnage.classe }}</div>
                <div v-if="personnage.niveau">Niveau: {{ personnage.niveau }}</div>
                <div class="text-gray-400 text-xs mt-2">
                  Créé le {{ formatDate(personnage.created_at) }}
                </div>
              </div>
              
              <!-- Actions -->
              <div class="flex gap-2">
                <button 
                  @click="editPersonnage(personnage.id)"
                  class="flex-1 px-3 py-1 bg-generique text-white rounded text-sm hover:bg-generique/80 transition-colors"
                >
                  Modifier
                </button>
                <button 
                  @click="generatePdf(personnage.id)"
                  :disabled="generatingPdf === personnage.id"
                  class="flex-1 px-3 py-1 bg-gray-700 text-white rounded text-sm hover:bg-gray-600 transition-colors disabled:opacity-50"
                >
                  <span v-if="generatingPdf === personnage.id">PDF...</span>
                  <span v-else>PDF</span>
                </button>
                <button 
                  @click="deletePersonnage(personnage.id)"
                  class="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
          
          <!-- État de chargement -->
          <div v-else-if="pending" class="text-center">
            <div class="text-white text-xl">Chargement des personnages...</div>
          </div>
          
          <!-- Aucun personnage -->
          <div v-else class="text-center text-gray-400">
            <div class="text-6xl mb-4">⚔️</div>
            <h3 class="text-2xl mb-2">Aucun personnage</h3>
            <p class="mb-6">
              <span v-if="searchTerm || selectedSystem">Aucun personnage ne correspond à vos critères.</span>
              <span v-else>Vous n'avez pas encore créé de personnage.</span>
            </p>
            <NuxtLink 
              to="/personnages/nouveau"
              class="px-6 py-2 bg-generique text-white rounded-lg hover:bg-generique/80 transition-colors"
            >
              Créer votre premier personnage
            </NuxtLink>
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

const { getPersonnages, deletePersonnage: removePersonnage } = usePersonnages()
const { getSystems } = useSystemes()
const { generatePdf: generatePersonnagePdf } = usePdf()

// Filtres
const selectedSystem = ref('')
const searchTerm = ref('')
const generatingPdf = ref<number | null>(null)

// Données
const { data: systems } = await useLazyAsyncData('systems', () => getSystems())
const { data: personnages, pending, refresh } = await useLazyAsyncData('personnages', () => 
  getPersonnages()
)

// Personnages filtrés
const filteredPersonnages = computed(() => {
  if (!personnages.value) return []
  
  let filtered = personnages.value
  
  if (selectedSystem.value) {
    filtered = filtered.filter(p => p.systeme_slug === selectedSystem.value)
  }
  
  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase()
    filtered = filtered.filter(p => 
      p.nom.toLowerCase().includes(term) ||
      (p.classe && p.classe.toLowerCase().includes(term))
    )
  }
  
  return filtered.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
})

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR')
}

const editPersonnage = (id: number) => {
  navigateTo(`/personnages/${id}/edit`)
}

const generatePdf = async (id: number) => {
  generatingPdf.value = id
  
  try {
    await generatePersonnagePdf(id)
  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error)
  } finally {
    generatingPdf.value = null
  }
}

const deletePersonnage = async (id: number) => {
  const personnage = personnages.value?.find(p => p.id === id)
  if (!personnage) return
  
  const confirmed = confirm(`Êtes-vous sûr de vouloir supprimer le personnage "${personnage.nom}" ?`)
  if (!confirmed) return
  
  try {
    await removePersonnage(id)
    await refresh()
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
    alert('Erreur lors de la suppression du personnage')
  }
}

useSeoMeta({
  title: 'Mes Personnages - Brumisa3',
  description: 'Gérez vos personnages JDR et générez leurs fiches PDF'
})
</script>