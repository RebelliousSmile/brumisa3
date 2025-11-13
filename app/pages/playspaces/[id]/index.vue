<script setup lang="ts">
/**
 * Page Detail Playspace
 *
 * Dashboard avec badge role [MJ] ou [PJ]
 * Stats (X personnages, derniere modif)
 * Actions rapides : Modifier, Dupliquer, Exporter ZIP, Supprimer
 * Redirect auto selon role :
 * - [PJ] vers /preparation/characters
 * - [MJ] vers /preparation (dashboard MJ)
 */

definePageMeta({
  layout: 'playspace',
  middleware: ['auth', 'playspace']
})

const route = useRoute()
const playspaceId = route.params.id as string

// TODO: Implementer detail playspace + redirect auto
// const playspaceStore = usePlayspaceStore()
// const playspace = computed(() => playspaceStore.getPlayspaceById(playspaceId))

// Auto-redirect selon role
// watchEffect(() => {
//   if (playspace.value?.role === 'PJ') {
//     navigateTo('/preparation/characters')
//   } else if (playspace.value?.role === 'MJ') {
//     navigateTo('/preparation')
//   }
// })

useSeoMeta({
  title: 'Playspace - Brumisa3',
  description: 'Dashboard de votre playspace'
})
</script>

<template>
  <div>
    <!-- TODO: Implementer contenu -->
  </div>
</template>
