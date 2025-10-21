<script setup lang="ts">
/**
 * Layout Playspace - Layout avec contexte playspace
 *
 * Structure :
 * - Header (navigation principale)
 * - Sidebar (liste playspaces avec role MJ/PJ)
 * - Slot (contenu page)
 * - Footer (liens utilitaires)
 *
 * Utilise par :
 * - Pages preparation (/preparation, /preparation/characters)
 * - Pages playspaces detail (/playspaces/[id])
 * - Pages characters (/characters/[id], /characters/[id]/edit)
 */
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <!-- Header -->
    <CommonHeader />

    <!-- Layout avec Sidebar -->
    <div class="flex flex-1">
      <!-- Sidebar -->
      <CommonSidebar />

      <!-- Main Content (avec margin-left pour sidebar) -->
      <main class="ml-64 flex-1 bg-gray-50 p-6">
        <slot />
      </main>
    </div>

    <!-- Footer -->
    <CommonFooter />
  </div>
</template>
