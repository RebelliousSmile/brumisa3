<script setup lang="ts">
/**
 * Page Liste Playspaces
 *
 * Affiche tous les playspaces de l'utilisateur
 * Grille/Liste avec badge role [MJ] ou [PJ]
 * Actions : Modifier, Dupliquer, Supprimer
 */

definePageMeta({
  layout: 'default',
  middleware: ['auth'] // Necessite authentification (guest ou compte)
})

// TODO: Implementer liste playspaces
// const playspaceStore = usePlayspaceStore()
// const { playspaces, isLoading } = storeToRefs(playspaceStore)

useSeoMeta({
  title: 'Mes Playspaces - Brumisater',
  description: 'Gerez tous vos playspaces Mist Engine : creation, modification, suppression'
})
