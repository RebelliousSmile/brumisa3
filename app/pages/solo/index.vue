<script setup lang="ts">
/**
 * Page HUD Solo (Placeholder v1.3+)
 *
 * Interface style Foundry VTT pour jeu en solo
 * MVP v1.0 : Placeholder avec message "Disponible en v1.3+"
 *
 * Fonctionnalites prevues v1.3+ :
 * - Personnage actif (selection dans playspace)
 * - Theme Cards (lecture seule, liens vers edition)
 * - Hero Card (lecture seule)
 * - Trackers (modification temps reel : Status, Story Tags, Story Themes)
 * - Action Database (12 briques generiques Mist Engine)
 */

definePageMeta({
  layout: 'default'
})

useSeoMeta({
  title: 'Jouer en Solo - Brumisa3 (v1.3+)',
  description: 'Interface de jeu solo Mist Engine - Sessions, trackers, oracles et des (disponible v1.3+)'
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-violet-50 to-indigo-50 flex items-center justify-center p-4">
    <div class="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 md:p-12">
      <!-- Badge Version -->
      <div class="flex justify-center mb-6">
        <span class="inline-flex items-center rounded-full bg-violet-100 px-4 py-2 text-sm font-semibold text-violet-800">
          Disponible en v1.3+
        </span>
      </div>

      <!-- Titre -->
      <h1 class="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-4">
        Jouer en Solo
      </h1>

      <!-- Description -->
      <p class="text-xl text-center text-gray-600 mb-8">
        Interface de jeu solo style Foundry VTT pour vos parties en solitaire
      </p>

      <!-- Fonctionnalites prevues -->
      <div class="bg-violet-50 rounded-xl p-6 mb-8">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Fonctionnalites prevues :</h2>
        <ul class="space-y-3 text-gray-700">
          <li class="flex items-start">
            <span class="text-violet-600 mr-3">✓</span>
            <span>Selection de personnage actif depuis votre playspace</span>
          </li>
          <li class="flex items-start">
            <span class="text-violet-600 mr-3">✓</span>
            <span>Theme Cards et Hero Card en lecture seule avec edition rapide</span>
          </li>
          <li class="flex items-start">
            <span class="text-violet-600 mr-3">✓</span>
            <span>Trackers temps reel (Status, Story Tags, Story Themes)</span>
          </li>
          <li class="flex items-start">
            <span class="text-violet-600 mr-3">✓</span>
            <span>Action Database avec 12 briques generiques Mist Engine</span>
          </li>
        </ul>
      </div>

      <!-- CTA -->
      <div class="text-center">
        <NuxtLink
          to="/preparation"
          class="inline-flex items-center rounded-lg bg-violet-600 px-6 py-3 text-white font-semibold hover:bg-violet-700 transition-colors"
        >
          En attendant, preparez vos personnages
          <Icon name="heroicons:arrow-right" class="ml-2 h-5 w-5" />
        </NuxtLink>
      </div>

      <!-- Info roadmap -->
      <p class="text-center text-sm text-gray-500 mt-8">
        Cette fonctionnalite est planifiee pour la version 1.3 de Brumisa3
      </p>
    </div>
  </div>
</template>
