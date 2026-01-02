<script setup lang="ts">
/**
 * Page Accueil - Parcours progressif d'onboarding
 *
 * Structure du parcours :
 * 1. Hero/News - Actualites du site
 * 2. Hacks - Choix du hack/systeme (repliable si playspace actif)
 * 3. Personnages - Liste des personnages (si playspace selectionne)
 * 4. FAQ - Questions frequentes
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
  title: 'Brumisa3 - Createur de fiches Mist Engine',
  description: 'Creez et gerez vos fiches de personnages pour Legends in the Mist et autres jeux Mist Engine'
})

// Store playspace
const playspaceStore = usePlayspaceStore()

// Initialiser le store au montage
onMounted(() => {
  playspaceStore.init()
})

// Playspace actif
const hasPlayspace = computed(() => playspaceStore.hasPlayspaces && playspaceStore.activePlayspaceId !== null)
const activePlayspace = computed(() => playspaceStore.activePlayspace)

// Sections repliees si playspace actif
const sectionsCollapsed = computed(() => hasPlayspace.value)
</script>

<template>
  <div class="home-page">
    <!-- 1. Hero Section - Actualités -->
    <HeroSection />

    <!-- 2. Hacks - Choix du système de jeu (replie si playspace actif) -->
    <HacksSelection
      :collapsed="sectionsCollapsed"
      :active-hack-name="activePlayspace?.hackId"
      :active-universe-name="activePlayspace?.universeId"
      :is-g-m="activePlayspace?.isGM"
    />

    <!-- 3. Personnages - Visible si playspace actif -->
    <CharacterShowcase v-if="hasPlayspace" />

    <!-- 4. FAQ - Questions fréquentes -->
    <FAQSection />
  </div>
</template>
