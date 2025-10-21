<script setup lang="ts">
/**
 * Page Creation Personnage
 *
 * Formulaire creation personnage dans playspace actif
 * - [Mode MJ] : Champ supplementaire Type (PJ / PNJ)
 * - [Mode PJ] : Pas de champ Type (toujours PJ)
 *
 * Champs : Nom, Description, Avatar, Niveau
 */

definePageMeta({
  layout: 'playspace',
  middleware: ['auth', 'playspace']
})

// TODO: Implementer formulaire creation personnage
// const playspaceStore = usePlayspaceStore()
// const isMJ = computed(() => playspaceStore.activePlayspace?.role === 'MJ')

// const formData = ref({
//   name: '',
//   description: '',
//   avatarUrl: '',
//   level: 1,
//   type: 'PC' as 'PC' | 'NPC' // Visible uniquement si MJ
// })

useSeoMeta({
  title: 'Nouveau Personnage - Brumisa3',
  description: 'Creez un nouveau personnage dans votre playspace actif'
})
</script>

<template>
  <div>
    <!-- TODO: Implementer contenu -->
  </div>
</template>
