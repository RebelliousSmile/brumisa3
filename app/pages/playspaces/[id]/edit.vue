<script setup lang="ts">
/**
 * Page Modification Playspace
 *
 * Formulaire edition :
 * - Role (MJ / PJ)
 * - Hack
 * - Univers
 * - Nom
 */

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'playspace']
})

const route = useRoute()
const playspaceId = route.params.id as string

// TODO: Implementer formulaire edition playspace
// const playspaceStore = usePlayspaceStore()
// const playspace = computed(() => playspaceStore.getPlayspaceById(playspaceId))

// const formData = ref({
//   role: playspace.value?.role,
//   hackId: playspace.value?.hackId,
//   universeId: playspace.value?.universeId,
//   name: playspace.value?.name
// })

useSeoMeta({
  title: 'Modifier Playspace - Brumisater',
  description: 'Modifiez votre playspace : role, hack, univers et nom'
})
</script>

<template>
  <div>
    <!-- TODO: Implementer contenu -->
  </div>
</template>
