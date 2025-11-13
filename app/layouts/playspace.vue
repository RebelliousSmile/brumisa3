<script setup lang="ts">
/**
 * Layout Playspace Radial - Layout immersif avec navigation radiale
 *
 * Structure:
 * - Header (navigation principale en haut)
 * - Menus radiaux flottants:
 *   - RadialPlayspaceMenu (bottom-left)
 *   - RadialActionMenu (bottom-right)
 * - Slot (contenu page plein écran)
 * - Footer (liens utilitaires)
 *
 * Remplace: playspace.vue (sidebar classique)
 *
 * Avantages:
 * - Plus d'espace pour le contenu (pas de sidebar fixe)
 * - Navigation immersive (arbre de compétences)
 * - Responsive mobile (modales full-screen)
 * - Accessibilité complète (keyboard + screen reader)
 */
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <!-- Header -->
    <CommonHeader />

    <!-- Main Content (plein écran, pas de margin-left) -->
    <main class="flex-1 bg-otherscape-noir-profond relative">
      <!-- Page content -->
      <div class="min-h-full">
        <slot />
      </div>

      <!-- Radial Navigation Menus (flottants) -->
      <CommonRadialPlayspaceMenu position="bottom-left" />
      <CommonRadialActionMenu position="bottom-right" />
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
