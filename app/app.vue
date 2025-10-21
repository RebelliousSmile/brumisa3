<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup>
// Configuration globale de l'application Brumisa3
useHead({
  title: 'Brumisa3 - Générateur PDF JDR',
  meta: [
    {
      name: 'description', 
      content: 'Créateur de fiches de personnages JDR immersives avec Nuxt 4 et architecture moderne'
    }
  ],
  link: [
    {
      rel: 'stylesheet',
      href: 'https://cdnjs.cloudflare.com/ajax/libs/rpg-awesome/0.2.0/css/rpg-awesome.min.css'
    },
    {
      rel: 'stylesheet', 
      href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
    },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,wght@0,400;0,500;0,700;1,400&display=swap'
    },
    {
      rel: 'stylesheet', 
      href: 'https://use.typekit.net/vpm3oax.css'
    }
  ]
})
</script>