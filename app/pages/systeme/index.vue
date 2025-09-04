<template>
  <div class="min-h-screen bg-gray-900">
    <div class="relative">
      <!-- Background -->
      <div class="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black"></div>
      <div class="absolute inset-0 bg-gradient-to-r from-transparent via-gray-800/20 to-transparent"></div>
      
      <!-- Contenu principal -->
      <div class="relative z-10 px-4 py-16">
        <div class="max-w-6xl mx-auto">
          <!-- En-tête -->
          <div class="text-center mb-12">
            <h1 class="text-4xl md:text-6xl font-bold text-white mb-6">
              Systèmes de Jeu
            </h1>
            <p class="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Découvrez nos générateurs de fiches de personnages pour différents univers de jeu de rôle
            </p>
          </div>
          
          <!-- Grille des systèmes -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" v-if="systems.length > 0">
            <SystemCard
              v-for="system in systems"
              :key="system.id"
              :system="system"
              class="transform hover:scale-105 transition-transform duration-200"
            />
          </div>
          
          <!-- État de chargement -->
          <div v-else-if="pending" class="text-center">
            <div class="text-white text-xl">Chargement des systèmes...</div>
          </div>
          
          <!-- Aucun système -->
          <div v-else class="text-center text-gray-400">
            <div class="text-6xl mb-4">🎲</div>
            <h3 class="text-2xl mb-2">Aucun système disponible</h3>
            <p>Les systèmes de jeu seront bientôt disponibles.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { getSystems } = useSystemes()

const { data: systems, pending } = await useLazyAsyncData('systems', () => getSystems())

useSeoMeta({
  title: 'Systèmes de Jeu - Brumisater',
  description: 'Découvrez tous les systèmes de jeu de rôle disponibles sur Brumisater'
})
</script>