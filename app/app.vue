<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup>
// Configuration globale de l'application Brumisater
useHead({
  title: 'Brumisater - Générateur PDF JDR',
  meta: [
    {
      name: 'description', 
      content: 'Créateur de fiches de personnages JDR immersives avec Nuxt 4 et architecture moderne'
    }
  ]
})
</script>
