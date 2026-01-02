<script setup lang="ts">
/**
 * Layout Default - Layout par defaut avec menu radial playspace
 *
 * Structure :
 * - Header (navigation principale avec 4 outils)
 * - Menu radial playspace (bottom-left) : selection/creation playspace
 * - Slot (contenu page)
 * - Footer (liens utilitaires)
 *
 * Utilise par :
 * - Pages publiques (/, /support, /about, /legal)
 * - Pages auth (/auth/login, /auth/register)
 * - Pages profile (/profile, /settings)
 * - Pages playspaces (/playspaces)
 * - Pages outils (/dangers, /actions)
 */
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <!-- Header -->
    <CommonHeader />

    <!-- Main Content -->
    <main class="flex-1 bg-otherscape-noir-profond relative">
      <slot />

      <!-- Menu Radial Playspace Fullscreen (selection/creation) -->
      <CommonRadialPlayspaceMenuFullscreen />
    </main>

    <!-- Footer -->
    <CommonFooter />
  </div>
</template>
