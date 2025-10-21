<script setup lang="ts">
/**
 * Page Liste Personnages du Playspace Actif
 *
 * Affiche tous les personnages du playspace actif
 * - [Mode PJ] : Personnages joueurs uniquement
 * - [Mode MJ] : Badge filtre Tous / PJ / PNJ
 */

definePageMeta({
  layout: 'playspace',
  middleware: ['auth', 'playspace']
})

// TODO: Implementer logique liste personnages
// const playspaceStore = usePlayspaceStore()
// const characterStore = useCharacterStore()

// Filtres MJ
// const characterTypeFilter = ref<'all' | 'pc' | 'npc'>('all')

useSeoMeta({
  title: 'Mes Personnages - Brumisater',
  description: 'Liste de vos personnages pour le playspace actif'
})
</script>

<template>
  <div>
    <!-- TODO: Implementer contenu -->
  </div>
</template>
