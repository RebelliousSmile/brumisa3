<script setup lang="ts">
/**
 * Header Principal - Navigation Persistante
 *
 * Structure :
 * - Logo Brumisater (lien vers /)
 * - Navigation principale (4 sections) :
 *   1. Decouverte
 *   2. Preparation (context-sensitive MJ/PJ)
 *   3. Jouer en solo (grise en MVP v1.0)
 *   4. Table VTT (grise en MVP v2.0)
 * - Zone utilisateur (droite) :
 *   - [Mode Guest] Banner "Creer un compte"
 *   - [Authentifie] Avatar + Dropdown (Profil, Parametres, Deconnexion)
 *   - [Non connecte] Se connecter / S'inscrire
 */

// TODO: Implementer stores
// const authStore = useAuthStore()
// const playspaceStore = usePlayspaceStore()
// const { user, isAuthenticated, isGuest } = storeToRefs(authStore)
// const { activePlayspace } = storeToRefs(playspaceStore)

const route = useRoute()

// Navigation items
const navItems = [
  {
    label: 'Decouverte',
    path: '/decouverte',
    icon: 'i-heroicons-light-bulb',
    enabled: true
  },
  {
    label: 'Preparation',
    path: '/preparation',
    icon: 'i-heroicons-pencil-square',
    enabled: true,
    contextSensitive: true // UI adaptative selon role MJ/PJ
  },
  {
    label: 'Jouer en solo',
    path: '/solo',
    icon: 'i-heroicons-user',
    enabled: false, // v1.3+
    badge: 'v1.3+'
  },
  {
    label: 'Table VTT',
    path: '/vtt',
    icon: 'i-heroicons-users',
    enabled: false, // v2.0+
    badge: 'v2.0+'
  }
]

// Active route check
const isActive = (path: string) => {
  return route.path.startsWith(path)
}

// Dropdowns
const showUserDropdown = ref(false)
const showLangDropdown = ref(false)

// TODO: Logout handler
const handleLogout = async () => {
  // await authStore.logout()
  // navigateTo('/auth/login')
}

<template>
  <header class="sticky top-0 z-50 w-full border-b border-gray-200 bg-white shadow-sm">
    <div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
      <!-- Logo -->
      <NuxtLink to="/" class="flex items-center space-x-2">
        <span class="text-2xl font-bold text-brand-violet">Brumisater</span>
      </NuxtLink>

      <!-- Navigation Principale (4 sections) -->
      <nav class="hidden md:flex items-center space-x-1">
        <NuxtLink
          v-for="item in navItems"
          :key="item.path"
          :to="item.enabled ? item.path : '#'"
          :class="[
            'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            isActive(item.path)
              ? 'bg-brand-violet text-white'
              : item.enabled
                ? 'text-gray-700 hover:bg-gray-100'
                : 'text-gray-400 cursor-not-allowed',
          ]"
          @click.prevent="!item.enabled && $event.preventDefault()"
        >
          {{ item.label }}
          <span
            v-if="item.badge"
            class="ml-2 inline-flex items-center rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-600"
          >
            {{ item.badge }}
          </span>
        </NuxtLink>
      </nav>

      <!-- Zone Utilisateur (Droite) -->
      <div class="flex items-center space-x-4">
        <!-- Selecteur de langue -->
        <div class="relative">
          <button
            class="flex items-center space-x-1 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
            @click="showLangDropdown = !showLangDropdown"
          >
            <Icon name="heroicons:language" class="h-5 w-5" />
            <span class="hidden sm:inline">FR</span>
            <Icon name="heroicons:chevron-down" class="h-4 w-4" />
          </button>

          <!-- Dropdown Langues (TODO: implementer avec i18n) -->
          <div
            v-if="showLangDropdown"
            class="absolute right-0 top-12 w-32 rounded-lg bg-white shadow-lg border border-gray-200 py-2"
          >
            <button class="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100">
              Francais
            </button>
            <button class="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100">
              English
            </button>
          </div>
        </div>

        <!-- Non connecte -->
        <template v-if="false">
          <UiButton to="/auth/login" variant="ghost" size="sm">
            Se connecter
          </UiButton>
          <UiButton to="/auth/register" variant="primary" size="sm">
            S'inscrire
          </UiButton>
        </template>

        <!-- Mode Guest -->
        <template v-if="false">
          <div class="hidden lg:flex items-center space-x-2 rounded-lg bg-yellow-50 px-3 py-1.5 text-sm">
            <Icon name="heroicons:exclamation-triangle" class="h-4 w-4 text-yellow-600" />
            <span class="text-yellow-900">Mode invité</span>
            <UiButton to="/auth/register" variant="primary" size="xs">
              Créer un compte
            </UiButton>
          </div>
        </template>

        <!-- Authentifie -->
        <template v-if="false">
          <button
            class="flex items-center space-x-2 rounded-lg p-2 hover:bg-gray-100"
            @click="showUserDropdown = !showUserDropdown"
          >
            <div class="h-8 w-8 rounded-full bg-brand-violet text-white flex items-center justify-center text-sm font-medium">
              U
            </div>
            <Icon name="heroicons:chevron-down" class="h-4 w-4 text-gray-500" />
          </button>

          <!-- Dropdown Menu (TODO: implémenter avec Headless UI) -->
          <div
            v-if="showUserDropdown"
            class="absolute right-4 top-14 w-48 rounded-lg bg-white shadow-lg border border-gray-200 py-2"
          >
            <NuxtLink
              to="/profile"
              class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Mon Profil
            </NuxtLink>
            <NuxtLink
              to="/settings"
              class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Paramètres
            </NuxtLink>
            <button
              class="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
              @click="handleLogout"
            >
              Déconnexion
            </button>
          </div>
        </template>

        <!-- Placeholder MVP (affiche "Non connecte" par defaut) -->
        <UiButton to="/auth/login" variant="ghost" size="sm">
          Se connecter
        </UiButton>
        <UiButton to="/auth/register" variant="primary" size="sm">
          S'inscrire
        </UiButton>
      </div>
    </div>
  </header>
</template>
