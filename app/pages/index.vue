<script setup lang="ts">
/**
 * Page Accueil - Parcours progressif d'onboarding
 *
 * Structure du parcours :
 * 1. Hero/News - Actualités du site
 * 2. Hacks - Choix du hack/système de jeu
 * 3. Personnages - Liste des personnages (si playspace sélectionné)
 * 4. FAQ - Questions fréquentes
 */

// Import des composants home
import HeroSection from '~/components/home/HeroSection.vue'
import HacksSelection from '~/components/home/HacksSelection.vue'
import CharacterShowcase from '~/components/home/CharacterShowcase.vue'
import FAQSection from '~/components/home/FAQSection.vue'

definePageMeta({
  layout: 'default'
})

useSeoMeta({
  title: 'Brumisa3 - Créateur de fiches Mist Engine',
  description: 'Créez et gérez vos fiches de personnages pour Legends in the Mist et autres jeux Mist Engine'
})

// TODO: Récupérer le playspace actif depuis le store
const hasPlayspace = ref(false)
</script>

<template>
  <div class="home-page">
    <!-- 1. Hero Section - Actualités -->
    <HeroSection />

    <!-- 2. Hacks - Choix du système de jeu -->
    <HacksSelection />

    <!-- 3. Personnages - Visible si playspace actif -->
    <CharacterShowcase v-if="hasPlayspace" />

    <!-- 4. FAQ - Questions fréquentes -->
    <FAQSection />
  </div>
</template>
