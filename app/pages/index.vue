<template>
  <div class="min-h-screen bg-black relative overflow-hidden">
    
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
  </div>
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

// Data fetching
const { data: statistics } = await $fetch('/api/statistics')
const { data: systemCards } = await $fetch('/api/systems/cards')
const { data: recentPdfs } = await $fetch('/api/pdfs/recent')

// User session
const { user } = useUserSession()

// Provide testimonial form state to child components
provide('showTestimonialForm', showTestimonialForm)
</script>