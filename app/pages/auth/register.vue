<template>
  <div class="min-h-screen bg-noir text-white">
    <div class="flex items-center justify-center px-4 py-12">
      <div class="max-w-md w-full space-y-8">
        <div class="text-center">
          <div class="text-generique text-6xl mb-4 font-bold">⚔️</div>
          <h2 class="text-3xl font-bold text-white font-display">Inscription</h2>
          <p class="mt-2 text-gris-clair">Créez votre compte pour commencer</p>
        </div>
        
        <form class="mt-8 space-y-6" @submit.prevent="handleRegister">
          <div class="space-y-4">
            <div>
              <label for="nom" class="block text-sm font-medium text-gris-clair">Nom</label>
              <input 
                v-model="form.nom" 
                type="text" 
                id="nom" 
                required
                class="mt-1 block w-full px-3 py-2 bg-gris-fonce border border-gris text-white rounded-md focus:ring-generique focus:border-generique"
                placeholder="Votre nom">
            </div>
            
            <div>
              <label for="email" class="block text-sm font-medium text-gris-clair">Email</label>
              <input 
                v-model="form.email" 
                type="email" 
                id="email" 
                required
                class="mt-1 block w-full px-3 py-2 bg-gris-fonce border border-gris text-white rounded-md focus:ring-generique focus:border-generique"
                placeholder="votre@email.com">
            </div>
            
            <div>
              <label for="password" class="block text-sm font-medium text-gris-clair">Mot de passe</label>
              <input 
                v-model="form.password" 
                type="password" 
                id="password" 
                required
                class="mt-1 block w-full px-3 py-2 bg-gris-fonce border border-gris text-white rounded-md focus:ring-generique focus:border-generique"
                placeholder="Minimum 8 caractères">
            </div>
            
            <div>
              <label for="confirmPassword" class="block text-sm font-medium text-gris-clair">Confirmer le mot de passe</label>
              <input 
                v-model="form.confirmPassword" 
                type="password" 
                id="confirmPassword" 
                required
                class="mt-1 block w-full px-3 py-2 bg-gris-fonce border border-gris text-white rounded-md focus:ring-generique focus:border-generique"
                placeholder="Répétez le mot de passe">
            </div>
          </div>
          
          <div v-if="error" class="text-red-400 text-sm text-center">
            {{ error }}
          </div>
          
          <div>
            <button 
              type="submit" 
              :disabled="loading"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-generique hover:bg-generique/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-generique disabled:opacity-50">
              <span v-if="loading">Création...</span>
              <span v-else>Créer mon compte</span>
            </button>
          </div>
          
          <div class="text-center">
            <NuxtLink to="/auth/login" class="text-generique hover:text-generique/80">
              Déjà un compte ? Se connecter
            </NuxtLink>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'guest'
})

const { register } = useAuth()
const router = useRouter()

const form = reactive({
  nom: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const loading = ref(false)
const error = ref('')

const handleRegister = async () => {
  if (form.password !== form.confirmPassword) {
    error.value = 'Les mots de passe ne correspondent pas'
    return
  }
  
  if (form.password.length < 8) {
    error.value = 'Le mot de passe doit contenir au moins 8 caractères'
    return
  }
  
  loading.value = true
  error.value = ''
  
  try {
    await register({
      nom: form.nom,
      email: form.email,
      password: form.password
    })
    router.push('/dashboard')
  } catch (err: any) {
    error.value = err.message || 'Erreur lors de la création du compte'
  } finally {
    loading.value = false
  }
}

useSeoMeta({
  title: 'Inscription - Brumisa3',
  description: 'Créez votre compte Brumisa3'
})
</script>