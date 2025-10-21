<script setup lang="ts">
/**
 * Page Hub Preparation (Context-Sensitive MJ/PJ)
 *
 * Section 2 de la navigation principale
 * Dashboard adaptatif selon role du playspace actif :
 * - [Mode PJ] : Dashboard Personnages (liste personnages)
 * - [Mode MJ] : Dashboard MJ complet (onglets Personnages / Dangers / Lieux)
 */

definePageMeta({
  layout: 'playspace' // Layout avec contexte playspace et sidebar
  // Pas de middleware pour permettre l'acces direct depuis navigation
})

// TODO: Implementer logique adaptative MJ/PJ
// const playspaceStore = usePlayspaceStore()
// const isMJ = computed(() => playspaceStore.activePlayspace?.role === 'MJ')

useSeoMeta({
  title: 'Preparation - Brumisa3',
  description: 'Dashboard de preparation : gerez vos personnages, dangers et lieux selon votre role MJ ou PJ'
})
</script>

<template>
  <div class="max-w-7xl">
    <!-- Header Section -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Preparation</h1>
      <p class="mt-2 text-gray-600">
        Gerez vos personnages, dangers et lieux pour votre playspace actif
      </p>
    </div>

    <!-- Dashboard adaptatif MJ/PJ -->
    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <!-- Card Personnages -->
      <NuxtLink
        to="/preparation/characters"
        class="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-violet-300 hover:shadow-md"
      >
        <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-violet-100 text-violet-600 group-hover:bg-violet-200">
          <Icon name="heroicons:user-group" class="h-6 w-6" />
        </div>
        <h3 class="text-lg font-semibold text-gray-900">Personnages</h3>
        <p class="mt-2 text-sm text-gray-600">
          Gerez vos personnages joueurs et PNJ
        </p>
        <div class="mt-4 flex items-center text-sm font-medium text-violet-600">
          Voir la liste
          <Icon name="heroicons:arrow-right" class="ml-1 h-4 w-4" />
        </div>
      </NuxtLink>

      <!-- Card Dangers (Mode MJ) -->
      <div class="rounded-xl border border-gray-200 bg-gray-50 p-6 opacity-50">
        <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gray-200 text-gray-400">
          <Icon name="heroicons:exclamation-triangle" class="h-6 w-6" />
        </div>
        <h3 class="text-lg font-semibold text-gray-700">Dangers</h3>
        <p class="mt-2 text-sm text-gray-500">
          Disponible en mode MJ
        </p>
        <div class="mt-4 flex items-center text-sm font-medium text-gray-400">
          Mode MJ uniquement
        </div>
      </div>

      <!-- Card Lieux (Mode MJ v1.2+) -->
      <div class="rounded-xl border border-gray-200 bg-gray-50 p-6 opacity-50">
        <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gray-200 text-gray-400">
          <Icon name="heroicons:map-pin" class="h-6 w-6" />
        </div>
        <h3 class="text-lg font-semibold text-gray-700">Lieux</h3>
        <p class="mt-2 text-sm text-gray-500">
          Disponible en v1.2+
        </p>
        <div class="mt-4 flex items-center text-sm font-medium text-gray-400">
          A venir
        </div>
      </div>
    </div>

    <!-- Info Playspace -->
    <div class="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-4">
      <div class="flex items-start">
        <Icon name="heroicons:information-circle" class="mt-0.5 h-5 w-5 text-blue-600" />
        <div class="ml-3">
          <h4 class="text-sm font-medium text-blue-900">Playspace actif</h4>
          <p class="mt-1 text-sm text-blue-700">
            Selectionnez un playspace dans la sidebar pour acceder a vos contenus
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
