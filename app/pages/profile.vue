<script setup lang="ts">
/**
 * Page Profil Utilisateur
 *
 * Informations compte :
 * - Email, Date creation
 * - Statistiques (X playspaces, Y personnages)
 * - Actions : Modifier Email, Changer Password
 */

definePageMeta({
  layout: 'default',
  middleware: ['auth']
})

// TODO: Implementer profil utilisateur
// const authStore = useAuthStore()
// const { user } = storeToRefs(authStore)

useSeoMeta({
  title: 'Mon Profil - Brumisa3',
  description: 'Gerez votre profil utilisateur : informations, statistiques et parametres'
})
</script>

<template>
  <div>
    <!-- TODO: Implementer contenu -->
  </div>
</template>
