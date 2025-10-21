<script setup lang="ts">
/**
 * Page HUD VTT Partage (Placeholder v2.0+)
 *
 * Interface style Foundry VTT pour jeu multi-joueurs
 * MVP v1.0 : Placeholder avec message "Disponible en v2.0+"
 *
 * Fonctionnalites prevues v2.0+ :
 * - Personnages actifs (selection multi-joueurs)
 * - Theme Cards (lecture seule, sync temps reel)
 * - Hero Card (lecture seule, sync temps reel)
 * - Trackers partages (modification collaborative)
 * - Action Database partagee
 * - Investigation Board (v2.0+)
 * - Mode multi-joueurs (v2.5+)
 */

definePageMeta({
  layout: 'default'
})

useSeoMeta({
  title: 'Table VTT - Brumisa3 (v2.0+)',
  description: 'Interface VTT multi-joueurs Mist Engine - Investigation Board et sync temps reel (disponible v2.0+)'
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
    <div class="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 md:p-12">
      <!-- Badge Version -->
      <div class="flex justify-center mb-6">
        <span class="inline-flex items-center rounded-full bg-indigo-100 px-4 py-2 text-sm font-semibold text-indigo-800">
          Disponible en v2.0+
        </span>
      </div>

      <!-- Titre -->
      <h1 class="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-4">
        Table VTT
      </h1>

      <!-- Description -->
      <p class="text-xl text-center text-gray-600 mb-8">
        Interface VTT multi-joueurs avec synchronisation temps reel
      </p>

      <!-- Fonctionnalites prevues -->
      <div class="bg-indigo-50 rounded-xl p-6 mb-8">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Fonctionnalites prevues :</h2>
        <ul class="space-y-3 text-gray-700">
          <li class="flex items-start">
            <span class="text-indigo-600 mr-3">✓</span>
            <span>Personnages multiples avec selection collaborative</span>
          </li>
          <li class="flex items-start">
            <span class="text-indigo-600 mr-3">✓</span>
            <span>Theme Cards et Hero Cards synchronises en temps reel</span>
          </li>
          <li class="flex items-start">
            <span class="text-indigo-600 mr-3">✓</span>
            <span>Trackers partages avec modifications collaboratives</span>
          </li>
          <li class="flex items-start">
            <span class="text-indigo-600 mr-3">✓</span>
            <span>Action Database partagee pour toute la table</span>
          </li>
          <li class="flex items-start">
            <span class="text-indigo-600 mr-3">✓</span>
            <span>Investigation Board (collectif Mist Engine)</span>
          </li>
          <li class="flex items-start">
            <span class="text-indigo-600 mr-3">✓</span>
            <span>Mode multi-joueurs complet (v2.5+)</span>
          </li>
        </ul>
      </div>

      <!-- CTA -->
      <div class="text-center">
        <NuxtLink
          to="/preparation"
          class="inline-flex items-center rounded-lg bg-indigo-600 px-6 py-3 text-white font-semibold hover:bg-indigo-700 transition-colors"
        >
          En attendant, preparez vos personnages
          <Icon name="heroicons:arrow-right" class="ml-2 h-5 w-5" />
        </NuxtLink>
      </div>

      <!-- Info roadmap -->
      <p class="text-center text-sm text-gray-500 mt-8">
        Cette fonctionnalite est planifiee pour la version 2.0 de Brumisa3
      </p>
    </div>
  </div>
</template>
