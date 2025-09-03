<template>
  <section class="relative z-10 px-4 mb-16">
    <div class="max-w-2xl mx-auto bg-gray-900 rounded-lg p-8 border border-gray-700">
      <h3 class="text-xl font-bold text-white mb-6">Partagez votre expérience</h3>
      
      <form @submit.prevent="submitTestimonial">
        <div class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UiInput
              v-model="testimonial.nom"
              label="Votre nom"
              placeholder="Votre nom *"
              required
            />
            <UiInput
              v-model="testimonial.email"
              type="email"
              label="Email"
              placeholder="Email (optionnel)"
            />
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UiSelect
              v-model="testimonial.systemeUtilise"
              label="Système utilisé"
              :options="systemOptions"
              placeholder="Système utilisé (optionnel)"
            />
            <UiSelect
              v-model="testimonial.note"
              label="Note"
              :options="noteOptions"
              placeholder="Note *"
              required
            />
          </div>
          
          <UiInput
            v-model="testimonial.titre"
            label="Titre"
            placeholder="Titre de votre témoignage (optionnel)"
          />
          
          <UiTextarea
            v-model="testimonial.contenu"
            label="Témoignage"
            placeholder="Votre témoignage *"
            :rows="4"
            required
          />
          
          <div class="flex items-center justify-between">
            <button 
              type="button"
              @click="$emit('close')"
              class="text-gray-400 hover:text-gray-300 transition-colors"
            >
              Annuler
            </button>
            <button 
              type="submit"
              :disabled="loading"
              class="bg-gradient-to-r from-brand-violet to-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-brand-violet disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed transition-all"
            >
              <span v-show="!loading">Envoyer</span>
              <span v-show="loading">Envoi...</span>
            </button>
          </div>
        </div>
      </form>
      
      <p class="text-gray-400 mt-6">
        Votre témoignage sera examiné avant publication pour s'assurer qu'il respecte nos conditions d'utilisation.
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
defineEmits<{
  close: []
}>()

const testimonial = reactive({
  nom: '',
  email: '',
  systemeUtilise: '',
  note: '',
  titre: '',
  contenu: ''
})

const loading = ref(false)

const systemOptions = [
  { value: '', label: 'Système utilisé (optionnel)' },
  { value: 'monsterhearts', label: 'Monsterhearts' },
  { value: 'engrenages', label: 'Engrenages & Sortilèges' },
  { value: 'metro2033', label: 'Metro 2033' },
  { value: 'mistengine', label: 'Mist Engine' },
  { value: 'zombiology', label: 'Zombiology' }
]

const noteOptions = [
  { value: '', label: 'Note *' },
  { value: '5', label: '5 étoiles (5/5)' },
  { value: '4', label: '4 étoiles (4/5)' },
  { value: '3', label: '3 étoiles (3/5)' },
  { value: '2', label: '2 étoiles (2/5)' },
  { value: '1', label: '1 étoile (1/5)' }
]

const submitTestimonial = async () => {
  try {
    loading.value = true
    
    await $fetch('/api/testimonials', {
      method: 'POST',
      body: {
        nom: testimonial.nom,
        email: testimonial.email,
        systemeUtilise: testimonial.systemeUtilise,
        note: parseInt(testimonial.note),
        titre: testimonial.titre,
        contenu: testimonial.contenu
      }
    })
    
    // Reset form
    Object.assign(testimonial, {
      nom: '',
      email: '',
      systemeUtilise: '',
      note: '',
      titre: '',
      contenu: ''
    })
    
    // Close form
    emit('close')
    
    // TODO: Show success message
    
  } catch (error) {
    console.error('Erreur envoi témoignage:', error)
    // TODO: Show error message
  } finally {
    loading.value = false
  }
}
</script>