<template>
  <div class="min-h-screen bg-gray-900">
    <div class="relative">
      <!-- Background -->
      <div class="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-900/20 to-black"></div>
      
      <!-- Contenu principal -->
      <div class="relative z-10 px-4 py-16">
        <div class="max-w-4xl mx-auto">
          
          <!-- Header -->
          <div class="text-center mb-12">
            <div class="text-6xl mb-6">⚔️</div>
            <h1 class="text-3xl md:text-5xl font-bold text-white mb-4 font-display">
              Nouveau Personnage
            </h1>
            <p class="text-lg text-gray-300 max-w-2xl mx-auto">
              Choisissez un système de jeu pour créer votre personnage
            </p>
          </div>
          
          <!-- Sélection du système -->
          <div v-if="!selectedSystem" class="space-y-8">
            <div class="text-center mb-8">
              <h2 class="text-xl font-semibold text-white mb-4">Choisissez un système de jeu</h2>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" v-if="systems.length > 0">
              <div 
                v-for="system in systems" 
                :key="system.slug"
                @click="selectSystem(system)"
                class="bg-gray-800/50 rounded-lg p-6 cursor-pointer hover:bg-gray-800/70 transition-colors border border-gray-700 hover:border-generique/50"
              >
                <div class="text-center">
                  <div class="text-4xl mb-4">🎲</div>
                  <h3 class="text-white font-semibold text-lg mb-2">{{ system.nom }}</h3>
                  <p class="text-gray-300 text-sm" v-if="system.description">
                    {{ system.description }}
                  </p>
                </div>
              </div>
            </div>
            
            <div v-else class="text-center text-gray-400">
              <div class="text-6xl mb-4">🎲</div>
              <h3 class="text-2xl mb-2">Aucun système disponible</h3>
              <p>Les systèmes de jeu seront bientôt disponibles.</p>
            </div>
          </div>
          
          <!-- Formulaire de création -->
          <div v-else class="bg-gray-800/50 rounded-lg p-8">
            <div class="flex items-center justify-between mb-6">
              <div>
                <h2 class="text-xl font-bold text-white">{{ selectedSystem.nom }}</h2>
                <p class="text-gray-300 text-sm">Créer un nouveau personnage</p>
              </div>
              <button 
                @click="selectedSystem = null"
                class="text-gray-400 hover:text-white"
              >
                ← Changer de système
              </button>
            </div>
            
            <form @submit.prevent="createPersonnage" class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-white font-medium mb-2">
                    Nom du personnage *
                  </label>
                  <input 
                    v-model="form.nom" 
                    type="text" 
                    required
                    class="w-full px-4 py-2 bg-gray-900 text-white rounded border border-gray-600 focus:border-generique focus:ring-generique"
                    placeholder="Nom de votre personnage"
                  >
                </div>
                
                <div>
                  <label class="block text-white font-medium mb-2">
                    Classe / Archétype
                  </label>
                  <input 
                    v-model="form.classe" 
                    type="text"
                    class="w-full px-4 py-2 bg-gray-900 text-white rounded border border-gray-600 focus:border-generique focus:ring-generique"
                    placeholder="Guerrier, Mage, etc."
                  >
                </div>
                
                <div>
                  <label class="block text-white font-medium mb-2">
                    Niveau
                  </label>
                  <input 
                    v-model.number="form.niveau" 
                    type="number"
                    min="1"
                    class="w-full px-4 py-2 bg-gray-900 text-white rounded border border-gray-600 focus:border-generique focus:ring-generique"
                    placeholder="1"
                  >
                </div>
                
                <div>
                  <label class="block text-white font-medium mb-2">
                    Race / Espèce
                  </label>
                  <input 
                    v-model="form.race" 
                    type="text"
                    class="w-full px-4 py-2 bg-gray-900 text-white rounded border border-gray-600 focus:border-generique focus:ring-generique"
                    placeholder="Humain, Elfe, etc."
                  >
                </div>
              </div>
              
              <div>
                <label class="block text-white font-medium mb-2">
                  Description / Background
                </label>
                <textarea 
                  v-model="form.description" 
                  rows="4"
                  class="w-full px-4 py-2 bg-gray-900 text-white rounded border border-gray-600 focus:border-generique focus:ring-generique"
                  placeholder="Histoire et description de votre personnage..."
                ></textarea>
              </div>
              
              <div class="flex gap-4 justify-end">
                <NuxtLink 
                  to="/personnages"
                  class="px-6 py-2 border border-gray-600 text-white rounded hover:bg-gray-800 transition-colors"
                >
                  Annuler
                </NuxtLink>
                <button 
                  type="submit" 
                  :disabled="loading || !form.nom"
                  class="px-6 py-2 bg-generique text-white rounded hover:bg-generique/80 transition-colors disabled:opacity-50"
                >
                  <span v-if="loading">Création...</span>
                  <span v-else>Créer le personnage</span>
                </button>
              </div>
            </form>
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

const { getSystems } = useSystemes()
const { createPersonnage: createNewPersonnage } = usePersonnages()
const router = useRouter()

// État
const selectedSystem = ref(null)
const loading = ref(false)
const form = reactive({
  nom: '',
  classe: '',
  niveau: 1,
  race: '',
  description: ''
})

// Données
const { data: systems } = await useLazyAsyncData('systems', () => getSystems())

const selectSystem = (system: any) => {
  selectedSystem.value = system
}

const createPersonnage = async () => {
  if (!selectedSystem.value) return
  
  loading.value = true
  
  try {
    const personnageData = {
      ...form,
      systeme_slug: selectedSystem.value.slug,
      systeme: selectedSystem.value.nom
    }
    
    const newPersonnage = await createNewPersonnage(personnageData)
    
    // Rediriger vers l'édition du personnage créé
    router.push(`/personnages/${newPersonnage.id}/edit`)
  } catch (error) {
    console.error('Erreur lors de la création:', error)
    alert('Erreur lors de la création du personnage')
  } finally {
    loading.value = false
  }
}

useSeoMeta({
  title: 'Nouveau Personnage - Brumisater',
  description: 'Créez un nouveau personnage JDR'
})
</script>