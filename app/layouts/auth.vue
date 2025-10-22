<script setup lang="ts">
/**
 * Layout Auth - Layout simplifie pour pages authentification
 *
 * Structure :
 * - Logo centre
 * - Slot (formulaire login/register)
 * - Liens utilitaires (bas de page)
 *
 * Utilise par :
 * - /auth/login
 * - /auth/register
 * - /auth/forgot-password
 */
</script>

<template>
  <div class="flex min-h-screen flex-col bg-otherscape-noir-profond">
    <!-- Header Simplifie -->
    <div class="flex items-center justify-center py-8">
      <NuxtLink to="/" class="flex items-center space-x-2">
        <span class="text-3xl font-bold text-otherscape-cyan-neon text-shadow-glow-cyan">Brumisa3</span>
      </NuxtLink>
    </div>

    <!-- Main Content Centre -->
    <main class="flex flex-1 items-center justify-center px-4 sm:px-6 lg:px-8">
      <div class="w-full max-w-md">
        <slot />
      </div>
    </main>

    <!-- Footer Simplifie -->
    <footer class="border-t border-otherscape-cyan-neon/30 bg-otherscape-noir-card py-4">
      <div class="mx-auto max-w-7xl px-4 text-center">
        <div class="flex justify-center space-x-6 text-sm text-otherscape-gris-clair">
          <NuxtLink to="/about" class="hover:text-otherscape-cyan-neon transition-colors">
            A Propos
          </NuxtLink>
          <NuxtLink to="/legal" class="hover:text-otherscape-cyan-neon transition-colors">
            Legal
          </NuxtLink>
          <NuxtLink to="/support" class="hover:text-otherscape-cyan-neon transition-colors">
            Support
          </NuxtLink>
        </div>
      </div>
    </footer>
  </div>
</template>
