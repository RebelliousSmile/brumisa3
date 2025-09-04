<template>
  <div class="min-h-screen bg-black">
    <!-- Telex Topline -->
    <div class="bg-gradient-to-r from-blue-600 to-generique text-white py-2 px-4 text-center relative overflow-hidden">
      <div class="absolute inset-0 bg-gray-800"></div>
      <div class="relative z-10 flex items-center justify-center space-x-2 text-sm font-display">
        <i class="ra ra-lightning-bolt text-yellow-300 animate-pulse"></i>
        <span>Nouvelle fonctionnalité : Export PDF amélioré pour tous les systèmes !</span>
        <i class="ra ra-lightning-bolt text-yellow-300 animate-pulse"></i>
      </div>
    </div>
    
    <!-- Header/Navigation -->
    <nav class="bg-gray-900 border-b border-gray-800 sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex justify-between items-center h-16">
          <!-- Logo -->
          <div class="flex items-center">
            <NuxtLink to="/" class="text-xl font-bold flex items-center font-display">
              <i class="ra ra-brain-freeze text-generique text-2xl mr-2"></i>
              <span class="hidden sm:inline text-generique">brumisater</span>
            </NuxtLink>
          </div>
          
          <!-- Game Links (public pages) -->
          <div class="hidden md:flex items-center space-x-6 font-display">
            <!-- PBTA avec dropdown -->
            <div class="relative" @mouseenter="pbta = true" @mouseleave="pbta = false">
              <button class="flex items-center text-purple-500 hover:text-gray-300 transition-colors">
                <i class="ra ra-heartburn text-purple-500 mr-2"></i>
                <span class="text-sm">PBTA</span>
                <svg class="w-3 h-3 ml-1" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
              </button>
              <div v-show="pbta" class="absolute left-0 top-full w-48 bg-gray-800 rounded-lg shadow-lg py-2 border border-gray-700">
                <NuxtLink to="/systemes/pbta/monsterhearts" class="flex items-center px-4 py-2 text-sm text-purple-400 hover:bg-purple-900/20 hover:text-purple-300">
                  <i class="ra ra-heartburn mr-2"></i>Monsterhearts
                </NuxtLink>
                <NuxtLink to="/systemes/pbta/urban_shadows" class="flex items-center px-4 py-2 text-sm text-purple-400 hover:bg-purple-900/20 hover:text-purple-300">
                  <i class="ra ra-moon-sun mr-2"></i>Urban Shadows
                </NuxtLink>
              </div>
            </div>
            
            <!-- Engrenages avec dropdown -->
            <div class="relative" @mouseenter="engrenages = true" @mouseleave="engrenages = false">
              <button class="flex items-center text-amber-600 hover:text-gray-300 transition-colors">
                <i class="ra ra-cog text-amber-600 mr-2"></i>
                <span class="text-sm">Engrenages</span>
                <svg class="w-3 h-3 ml-1" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
              </button>
              <div v-show="engrenages" class="absolute left-0 top-full w-48 bg-gray-800 rounded-lg shadow-lg py-2 border border-gray-700">
                <NuxtLink to="/systemes/engrenages/roue_du_temps" class="flex items-center px-4 py-2 text-sm text-amber-600 hover:bg-amber-900/20 hover:text-amber-500">
                  <i class="ra ra-candle mr-2"></i>La Roue du Temps
                </NuxtLink>
                <NuxtLink to="/systemes/engrenages/ecryme" class="flex items-center px-4 py-2 text-sm text-amber-600 hover:bg-amber-900/20 hover:text-amber-500">
                  <i class="ra ra-chemical-arrow mr-2"></i>Ecryme
                </NuxtLink>
              </div>
            </div>
            
            <!-- Mist Engine avec dropdown -->
            <div class="relative" @mouseenter="mist = true" @mouseleave="mist = false">
              <button class="flex items-center text-pink-500 hover:text-gray-300 transition-colors">
                <i class="ra ra-ocarina text-pink-500 mr-2"></i>
                <span class="text-sm">Mist Engine</span>
                <svg class="w-3 h-3 ml-1" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
              </button>
              <div v-show="mist" class="absolute left-0 top-full w-48 bg-gray-800 rounded-lg shadow-lg py-2 border border-gray-700">
                <NuxtLink to="/systemes/mistengine/obojima" class="flex items-center px-4 py-2 text-sm text-pink-400 hover:bg-pink-900/20 hover:text-pink-300">
                  <i class="ra ra-ocarina mr-2"></i>Obojima
                </NuxtLink>
                <NuxtLink to="/systemes/mistengine/zamanora" class="flex items-center px-4 py-2 text-sm text-pink-400 hover:bg-pink-900/20 hover:text-pink-300">
                  <i class="ra ra-rune-stone mr-2"></i>Zamanora
                </NuxtLink>
                <NuxtLink to="/systemes/mistengine/post_mortem" class="flex items-center px-4 py-2 text-sm text-pink-400 hover:bg-pink-900/20 hover:text-pink-300">
                  <i class="ra ra-skull mr-2"></i>Post-Mortem
                </NuxtLink>
                <NuxtLink to="/systemes/mistengine/otherscape" class="flex items-center px-4 py-2 text-sm text-pink-400 hover:bg-pink-900/20 hover:text-pink-300">
                  <i class="ra ra-surveillance-camera mr-2"></i>Tokyo:Otherscape
                </NuxtLink>
              </div>
            </div>
            
            <!-- MYZ avec Metro 2033 -->
            <NuxtLink to="/systemes/myz/metro2033" class="flex items-center text-red-600 hover:text-gray-300 transition-colors">
              <i class="ra ra-pills text-red-600 mr-2"></i>
              <span class="text-sm">MYZ - Metro 2033</span>
            </NuxtLink>
            
            <!-- Zombiology lien direct -->
            <NuxtLink to="/systemes/zombiology/zombiology" class="flex items-center text-yellow-500 hover:text-gray-300 transition-colors">
              <i class="ra ra-death-skull text-yellow-500 mr-2"></i>
              <span class="text-sm">Zombiology</span>
            </NuxtLink>
          </div>
          
          <!-- User Menu -->
          <div class="flex items-center">
            <NuxtLink 
              v-if="!user"
              to="/auth/login" 
              class="w-10 h-10 bg-generique rounded-full flex items-center justify-center border border-generique hover:border-blue-400 transition-colors"
            >
              <i class="ra ra-player-king text-white text-lg"></i>
            </NuxtLink>
            <div v-if="user" class="flex items-center space-x-3">
              <span class="text-gray-300 text-sm">{{ user.nom || user.email }}</span>
              <button 
                @click="logout"
                class="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors"
              >
                <svg class="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Contenu principal -->
    <main>
      <slot />
    </main>

    <!-- Footer -->
    <footer class="bg-gray-900 border-t border-gray-800 mt-auto">
      <div class="max-w-7xl mx-auto px-4 py-8">
        <div class="flex flex-col md:flex-row justify-between items-center">
          <div class="text-gray-400 text-sm">
            © 2025 brumisater. Créé avec ❤️ pour la communauté JDR.
          </div>
          <div class="flex space-x-6 mt-4 md:mt-0">
            <NuxtLink to="/mentions-legales" class="text-gray-400 hover:text-white text-sm transition-colors">
              Mentions légales
            </NuxtLink>
            <NuxtLink to="/rgpd" class="text-gray-400 hover:text-white text-sm transition-colors">
              RGPD
            </NuxtLink>
            <NuxtLink to="/aide" class="text-gray-400 hover:text-white text-sm transition-colors">
              Aide
            </NuxtLink>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
// Utiliser le store d'authentification
const { user, logout: logoutUser } = useAuthStore()

// États des dropdowns
const pbta = ref(false)
const engrenages = ref(false)
const mist = ref(false)

// Fonction de déconnexion
const logout = async () => {
  try {
    await logoutUser()
    await navigateTo('/')
  } catch (error) {
    console.error('Erreur déconnexion:', error)
  }
}
</script>