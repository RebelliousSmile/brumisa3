<template>
  <section class="relative z-10 px-4 mb-16">
    <div class="max-w-4xl mx-auto text-center">
      <div class="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 border border-gray-600">
        <h2 class="text-2xl md:text-3xl font-bold text-white mb-4 font-display">
          Partagez votre expérience
        </h2>
        <p class="text-gray-300 mb-8 font-serif">
          Vous avez utilisé notre générateur ? Aidez d'autres joueurs en partageant votre retour d'expérience !
        </p>
        
        <!-- Existing testimonials display -->
        <div v-if="testimonials && testimonials.length > 0" class="mb-8">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div 
              v-for="testimonial in displayedTestimonials"
              :key="testimonial.id"
              class="bg-gray-800 rounded-lg p-6 border border-gray-700"
            >
              <div class="flex items-center mb-3">
                <div class="flex text-yellow-400 mr-2">
                  <Icon 
                    v-for="star in 5"
                    :key="star"
                    name="heroicons:star"
                    :class="star <= testimonial.note ? 'text-yellow-400' : 'text-gray-600'"
                    class="w-4 h-4"
                  />
                </div>
                <span class="text-sm text-gray-400">{{ testimonial.note }}/5</span>
              </div>
              <p class="text-gray-300 text-sm mb-3 font-serif">
                "{{ testimonial.contenu }}"
              </p>
              <p class="text-gray-500 text-xs font-serif">
                - {{ testimonial.auteurNom }}
              </p>
            </div>
          </div>
        </div>
        
        <button 
          @click="showTestimonialForm"
          class="bg-gradient-to-r from-brand-violet to-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-brand-violet transition-all font-display"
        >
          Laisser un témoignage
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface Testimonial {
  id: number
  auteurNom: string
  contenu: string
  note: number
  systemeUtilise?: string
}

// Get testimonials data
const { data: testimonials } = await $fetch('/api/testimonials')

// Display only first 3 testimonials
const displayedTestimonials = computed(() => {
  return testimonials?.slice(0, 3) || []
})

// Access the form state from parent
const showTestimonialFormState = inject('showTestimonialForm')

const showTestimonialForm = () => {
  if (showTestimonialFormState) {
    showTestimonialFormState.value = true
  }
}
</script>