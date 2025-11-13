<script setup lang="ts">
/**
 * Page Accueil - MVP v1.0
 *
 * Design Otherscape cyberpunk avec sections Hero, Produits, Personnages et Univers
 */

// Import explicit des composants home
import HeroSection from '~/components/home/HeroSection.vue'
import ProductsSection from '~/components/home/ProductsSection.vue'
import UniversSection from '~/components/home/UniversSection.vue'

definePageMeta({
  layout: 'default'
})

useSeoMeta({
  title: 'Brumisa3 - Createur de fiches Mist Engine',
  description: 'Creez et gerez vos fiches de personnages pour Legends in the Mist et autres jeux Mist Engine'
})
</script>

<template>
  <div class="home-page">
    <!-- Hero Section Otherscape -->
    <HeroSection />

    <!-- Section Produits/Hacks -->
    <ProductsSection />

    <!-- Section Univers Populaires -->
    <UniversSection />
  </div>
</template>
