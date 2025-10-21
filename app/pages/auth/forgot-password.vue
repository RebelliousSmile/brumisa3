<template>
  <div class="min-h-screen bg-noir text-white">
    <div class="flex items-center justify-center px-4 py-12">
      <div class="max-w-md w-full space-y-8">
        <div class="text-center">
          <div class="text-generique text-6xl mb-4 font-bold">🔐</div>
          <h2 class="text-3xl font-bold text-white font-display">Mot de passe oublié</h2>
          <p class="mt-2 text-gris-clair">Saisissez votre email pour recevoir un lien de réinitialisation</p>
        </div>
        
        <form class="mt-8 space-y-6" @submit.prevent="handleForgotPassword" v-if="!sent">
          <div>
            <label for="email" class="block text-sm font-medium text-gris-clair">Email</label>
            <input 
              v-model="email" 
              type="email" 
              id="email" 
              required
              class="mt-1 block w-full px-3 py-2 bg-gris-fonce border border-gris text-white rounded-md focus:ring-generique focus:border-generique"
              placeholder="votre@email.com">
          </div>
          
          <div v-if="error" class="text-red-400 text-sm text-center">
            {{ error }}
          </div>
          
          <div>
            <button 
              type="submit" 
              :disabled="loading"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-generique hover:bg-generique/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-generique disabled:opacity-50">
              <span v-if="loading">Envoi...</span>
              <span v-else>Envoyer le lien</span>
            </button>
          </div>
        </form>
        
        <div v-else class="text-center space-y-4">
          <div class="text-green-400 text-lg">✅ Email envoyé !</div>
          <p class="text-gris-clair">
            Vérifiez votre boîte email et cliquez sur le lien pour réinitialiser votre mot de passe.
          </p>
        </div>
        
        <div class="text-center">
          <NuxtLink to="/auth/login" class="text-generique hover:text-generique/80">
            Retour à la connexion
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'guest'
})

const email = ref('')
const loading = ref(false)
const error = ref('')
const sent = ref(false)

const handleForgotPassword = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const { data } = await $fetch('/api/auth/forgot-password', {
      method: 'POST',
      body: { email: email.value }
    })
    sent.value = true
  } catch (err: any) {
    error.value = err.data?.message || 'Erreur lors de l\'envoi'
  } finally {
    loading.value = false
  }
}

useSeoMeta({
  title: 'Mot de passe oublié - Brumisa3',
  description: 'Réinitialisez votre mot de passe'
})
</script>