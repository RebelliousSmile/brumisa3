<template>
  <!-- Hero Section -->
  <HeroSection 
    :statistics="statistics"
  />

  <!-- Game Systems Section -->
  <SystemCards 
    :systemCards="systemCards"
  />

  <!-- Recent PDFs Section -->
  <RecentPdfs 
    :pdfs="recentPdfs"
  />

  <!-- Newsletter + Join Adventure -->
  <NewsletterJoin 
    :statistics="statistics"
    :user="user"
  />

  <!-- Testimonials CTA -->
  <TestimonialsCta />

  <!-- Testimonial Form -->
  <TestimonialForm 
    v-show="showTestimonialForm"
    @close="showTestimonialForm = false"
  />

  <!-- Features -->
  <FeaturesSection />

  <!-- Boutons flottants -->
  <div class="fixed left-4 md:left-8 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-40 hidden md:flex">
    <div class="relative">
      <button 
        class="w-10 h-10 bg-generique/20 border border-generique/30 rounded-full flex items-center justify-center hover:border-generique transition-all duration-300"
        title="Soutenir le projet"
      >
        <i class="ra ra-crowned-heart text-generique text-xl"></i>
      </button>
    </div>
  </div>

  <!-- Version mobile en bas -->
  <div class="fixed bottom-4 left-1/2 -translate-x-1/2 flex flex-row gap-3 z-40 md:hidden bg-gray-900/70 backdrop-blur-sm px-4 py-3 rounded-full border border-gray-700">
    <button class="w-10 h-10 bg-generique/20 border border-generique/30 rounded-full flex items-center justify-center hover:border-generique transition-all">
      <i class="ra ra-crowned-heart text-generique text-xl"></i>
    </button>
  </div>

  <!-- Bouton retour en haut -->
  <button 
    v-show="showBackToTop"
    @click="scrollToTop"
    class="fixed bottom-6 right-6 w-10 h-10 bg-generique rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 hover:-translate-y-1 transition-all duration-300 z-50 shadow-lg"
  >
    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
    </svg>
  </button>
</template>

<script setup lang="ts">
// Meta tags SEO
useSeoMeta({
  title: 'Générateur PDF JDR - Créez vos fiches de personnages',
  description: 'Créez et partagez des fiches de personnages pour Monsterhearts, Engrenages & Sortilèges, Metro 2033 et Mist Engine',
  ogTitle: 'Générateur PDF JDR - brumisater',
  ogDescription: 'Créez vos fiches de personnages JDR immersives',
  ogImage: '/images/og-image.png',
  twitterCard: 'summary_large_image',
})

// Layout
definePageMeta({
  layout: 'default'
})

// State
const showTestimonialForm = ref(false)
const showBackToTop = ref(false)

// Scroll to top functionality
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

// Watch scroll position
onMounted(() => {
  const handleScroll = () => {
    showBackToTop.value = window.pageYOffset > 300
  }
  
  window.addEventListener('scroll', handleScroll)
  
  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
  })
})

// Data fetching
const { data: statistics } = await $fetch('/api/statistics')
const { data: systemCards } = await $fetch('/api/systems/cards')
const { data: recentPdfs } = await $fetch('/api/pdfs/recent')

// User session - éviter l'hydration mismatch
const user = ref(null)

// Charger la session côté client uniquement
onMounted(async () => {
  try {
    const { data: session } = await $fetch('/api/auth/session')
    user.value = session?.user || null
  } catch (error) {
    console.warn('Erreur chargement session:', error)
    user.value = null
  }
})

// Provide testimonial form state to child components
provide('showTestimonialForm', showTestimonialForm)
</script>