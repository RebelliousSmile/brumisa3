<template>
  <div class="min-h-screen bg-noir text-white">
    <div class="flex items-center justify-center px-4 py-12">
      <div class="max-w-md w-full space-y-8">
        <div class="text-center">
          <div class="text-generique text-6xl mb-4 font-bold">⚔️</div>
          <h2 class="text-3xl font-bold text-white font-display">Connexion</h2>
          <p class="mt-2 text-gris-clair">Connectez-vous pour accéder à vos personnages</p>
        </div>
        
        <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
          <div class="space-y-4">
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
                placeholder="Votre mot de passe">
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
              <span v-if="loading">Connexion...</span>
              <span v-else>Se connecter</span>
            </button>
          </div>
          
          <div class="text-center space-y-2">
            <NuxtLink to="/auth/register" class="text-generique hover:text-generique/80">
              Créer un compte
            </NuxtLink>
            <br>
            <NuxtLink to="/auth/forgot-password" class="text-gris-clair hover:text-white text-sm">
              Mot de passe oublié ?
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

const { login } = useAuth()
const router = useRouter()

const form = reactive({
  email: '',
  password: ''
})

const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  loading.value = true
  error.value = ''
  
  try {
    await login(form.email, form.password)
    router.push('/dashboard')
  } catch (err: any) {
    error.value = err.message || 'Erreur de connexion'
  } finally {
    loading.value = false
  }
}

useSeoMeta({
  title: 'Connexion - Brumisa3',
  description: 'Connectez-vous à votre compte Brumisa3'
})
</script>