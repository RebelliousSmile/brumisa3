<script setup lang="ts">
/**
 * Page Parametres (v1.1+)
 *
 * Parametres application :
 * - Theme (Clair / Sombre)
 * - Preferences UX
 */

definePageMeta({
  layout: 'default',
  middleware: ['auth']
})

// TODO: Implementer parametres
// const uiStore = useUiStore()
// const { theme, preferences } = storeToRefs(uiStore)

useSeoMeta({
  title: 'Parametres - Brumisa3',
  description: 'Parametres de l\'application : theme, preferences et options'
})
</script>

<template>
  <div>
    <!-- TODO: Implementer contenu -->
  </div>
</template>
