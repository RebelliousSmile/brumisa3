<script setup lang="ts">
/**
 * Page Hub Preparation (Context-Sensitive MJ/PJ)
 *
 * Section 2 de la navigation principale
 * Dashboard adaptatif selon role du playspace actif :
 * - [Mode PJ] : Dashboard Personnages (liste personnages)
 * - [Mode MJ] : Dashboard MJ complet (onglets Personnages / Dangers / Lieux)
 */

definePageMeta({
  layout: 'playspace', // Layout avec contexte playspace
  middleware: ['auth', 'playspace'] // Necessite authentification + playspace actif
})

// TODO: Implementer logique adaptative MJ/PJ
// const playspaceStore = usePlayspaceStore()
// const isMJ = computed(() => playspaceStore.activePlayspace?.role === 'MJ')

useSeoMeta({
  title: 'Preparation - Brumisater',
  description: 'Dashboard de preparation : gerez vos personnages, dangers et lieux selon votre role MJ ou PJ'
})
