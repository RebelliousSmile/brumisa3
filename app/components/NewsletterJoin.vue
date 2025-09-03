<template>
  <section class="relative z-10 px-4 mb-16">
    <div class="max-w-6xl mx-auto">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        <!-- Newsletter -->
        <div class="bg-gray-900 rounded-lg p-6 border border-gray-700">
          <h3 class="text-xl font-bold text-white mb-4 font-display">
            Restez informé
          </h3>
          <p class="text-gray-300 mb-6 font-serif">
            Soyez averti des nouvelles fonctionnalités pour les 5 jeux de la plateforme : Monsterhearts, Engrenages, Metro 2033, Mist Engine et Zombiology.
          </p>
          
          <form v-show="!newsletterSubscribed" @submit.prevent="subscribeNewsletter">
            <div class="space-y-4">
              <input 
                v-model="newsletterEmail"
                type="email" 
                placeholder="votre@email.com"
                required
                class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-brand-violet focus:outline-none font-serif"
              >
              <input 
                v-model="newsletterName"
                type="text" 
                placeholder="Votre nom (optionnel)"
                class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-brand-violet focus:outline-none font-serif"
              >
              <button 
                type="submit"
                :disabled="newsletterLoading"
                class="w-full bg-gradient-to-r from-brand-violet to-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-600 hover:to-brand-violet disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed transition-all font-display"
              >
                <span v-show="!newsletterLoading">S'inscrire à la newsletter</span>
                <span v-show="newsletterLoading">Inscription...</span>
              </button>
            </div>
          </form>
          
          <div v-show="newsletterSubscribed" class="text-center">
            <div class="text-green-400 mb-2 flex items-center justify-center">
              <Icon name="heroicons:check-circle" class="w-5 h-5 mr-2" />
              Inscription réussie !
            </div>
            <p class="text-gray-400 font-serif">Vous recevrez les prochaines actualités par email.</p>
          </div>
          
          <div class="mt-6 pt-4 border-t border-gray-700">
            <p class="text-gray-400 text-center font-serif">
              {{ statistics?.nbAbonnesNewsletter || '...' }} abonnés
            </p>
          </div>
        </div>

        <!-- Rejoignez l'aventure -->
        <div class="bg-gray-900 rounded-lg p-6 border border-gray-700">
          <h3 class="text-xl font-bold text-white mb-4 font-display">
            Rejoignez l'aventure
          </h3>
          <p class="text-gray-300 mb-6 font-serif">
            Créez un compte pour débloquer toutes les fonctionnalités :
          </p>
          
          <!-- Avantages -->
          <dl class="space-y-4 mb-6">
            <div>
              <dt class="text-white font-medium font-serif">Sauvegarde automatique</dt>
              <dd class="text-gray-400 text-sm font-serif">Vos brouillons sont conservés en sécurité</dd>
            </div>
            <div>
              <dt class="text-white font-medium font-serif">PDFs permanents</dt>
              <dd class="text-gray-400 text-sm font-serif">Accès illimité à toutes vos créations</dd>
            </div>
            <div>
              <dt class="text-white font-medium font-serif">Partage communauté</dt>
              <dd class="text-gray-400 text-sm font-serif">Inspirez d'autres joueurs avec vos créations</dd>
            </div>
          </dl>
          
          <div v-if="!user" class="text-center">
            <NuxtLink 
              to="/inscription" 
              class="inline-block w-full bg-gradient-to-r from-brand-violet to-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-600 hover:to-brand-violet transition-all font-display"
            >
              Créer un compte gratuit
            </NuxtLink>
            
            <div class="mt-6 pt-4 border-t border-gray-700">
              <p class="text-gray-400 text-center font-serif">
                <NuxtLink 
                  to="/connexion" 
                  class="text-brand-violet hover:text-blue-600 transition-colors"
                >
                  J'ai déjà un compte
                </NuxtLink>
              </p>
            </div>
          </div>
          
          <div v-else class="text-center">
            <p class="text-green-400 mb-4 font-serif">Vous êtes déjà connecté !</p>
            <NuxtLink 
              to="/personnages" 
              class="inline-block w-full bg-gray-700 text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-600 transition-all font-display"
            >
              Créer un personnage
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface Props {
  statistics?: {
    nbAbonnesNewsletter: number
  }
  user?: {
    id: number
    email: string
    role: string
  }
}

defineProps<Props>()

// Newsletter state
const newsletterEmail = ref('')
const newsletterName = ref('')
const newsletterLoading = ref(false)
const newsletterSubscribed = ref(false)

const subscribeNewsletter = async () => {
  try {
    newsletterLoading.value = true
    
    await $fetch('/api/newsletter/subscribe', {
      method: 'POST',
      body: {
        email: newsletterEmail.value,
        nom: newsletterName.value
      }
    })
    
    newsletterSubscribed.value = true
    newsletterEmail.value = ''
    newsletterName.value = ''
  } catch (error) {
    console.error('Erreur inscription newsletter:', error)
    // TODO: Show error message to user
  } finally {
    newsletterLoading.value = false
  }
}
</script>