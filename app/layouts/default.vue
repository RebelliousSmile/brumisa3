<script setup lang="ts">
/**
 * Layout Default - Layout par defaut
 *
 * Structure :
 * - Header (navigation principale)
 * - Slot (contenu page)
 * - Footer (liens utilitaires)
 *
 * Utilise par :
 * - Pages publiques (/, /decouverte, /support, /about, /legal)
 * - Pages auth (/auth/login, /auth/register)
 * - Pages profile (/profile, /settings)
 * - Pages playspaces (/playspaces)
 */
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <!-- Header -->
    <CommonHeader />

    <!-- Main Content -->
    <main class="flex-1 bg-otherscape-noir-profond">
      <slot />
    </main>

    <!-- Footer -->
    <CommonFooter />
  </div>
</template>
