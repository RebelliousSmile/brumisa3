<script setup lang="ts">
/**
 * Layout Playspace - Layout avec menu radial playspace
 *
 * Structure:
 * - Header (navigation principale avec 4 outils)
 * - Menu radial playspace (bottom-left) : selection/creation playspace
 * - Slot (contenu page plein ecran)
 * - Footer (liens utilitaires)
 *
 * Note: Le menu radial droit (actions) a ete supprime car les pages
 * /trackers, /dangers et /actions offrent ces fonctionnalites.
 */
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <!-- Header -->
    <CommonHeader />

    <!-- Main Content (plein ecran) -->
    <main class="flex-1 bg-otherscape-noir-profond relative pt-20">
      <!-- Page content -->
      <div class="min-h-full">
        <slot />
      </div>

      <!-- Menu Radial Playspace Fullscreen (selection/creation) -->
      <CommonRadialPlayspaceMenuFullscreen />
    </main>

    <!-- Footer -->
    <CommonFooter />
  </div>
</template>

<style scoped>
/* Ensure main content can use full viewport */
main {
  /* Reserve space for radial menus on desktop (optional) */
  /* padding-bottom: 6rem; */
}

/* Mobile: ensure menus don't overlap content */
@media (max-width: 768px) {
  main {
    padding-bottom: 5rem;
  }
}
</style>
