<script setup lang="ts">
/**
 * Page Detail Playspace
 *
 * Dashboard avec badge role [MJ] ou [PJ]
 * Stats (X personnages, derniere modif)
 * Actions rapides : Modifier, Dupliquer, Exporter ZIP, Supprimer
 */

import { isLocalPlayspace } from '#shared/stores/playspace'

definePageMeta({
  layout: 'playspace',
  middleware: ['playspace']
})

const route = useRoute()
const playspaceId = route.params.id as string

const playspaceStore = usePlayspaceStore()

// Charger les playspaces locaux au demarrage
onMounted(() => {
  playspaceStore.init()
})

// Recuperer le playspace
const playspace = computed(() => playspaceStore.getPlayspaceById(playspaceId))
const isLocal = computed(() => isLocalPlayspace(playspaceId))

// SEO
useSeoMeta({
  title: computed(() => playspace.value?.name ? `${playspace.value.name} - Brumisa3` : 'Playspace - Brumisa3'),
  description: 'Dashboard de votre playspace'
})
</script>

<template>
  <div class="playspace-page">
    <!-- Playspace non trouve -->
    <div v-if="!playspace" class="not-found">
      <h1>Playspace non trouve</h1>
      <p>Ce playspace n'existe pas ou a ete supprime.</p>
      <NuxtLink to="/" class="btn-home">Retour a l'accueil</NuxtLink>
    </div>

    <!-- Contenu playspace -->
    <div v-else class="playspace-content">
      <!-- Header -->
      <header class="playspace-header">
        <div class="header-info">
          <span class="badge" :class="playspace.isGM ? 'badge-gm' : 'badge-pj'">
            {{ playspace.isGM ? 'MJ' : 'PJ' }}
          </span>
          <h1 class="playspace-name">{{ playspace.name }}</h1>
          <span v-if="isLocal" class="local-badge">Local</span>
        </div>
        <div class="header-meta">
          <span class="hack-name">{{ playspace.hackId }}</span>
          <span v-if="playspace.universeId" class="universe-name">{{ playspace.universeId }}</span>
        </div>
      </header>

      <!-- Zone principale -->
      <main class="playspace-main">
        <div class="welcome-card">
          <h2>Bienvenue dans votre Playspace</h2>
          <p v-if="isLocal" class="local-notice">
            Ce playspace est stocke localement. Connectez-vous pour le sauvegarder dans le cloud.
          </p>
          <p v-else>
            Votre playspace est sauvegarde dans le cloud.
          </p>

          <div class="actions">
            <button class="btn btn-primary" disabled>
              Creer un personnage (bientot)
            </button>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.playspace-page {
  min-height: 100vh;
  background: var(--noir-profond);
  padding: 2rem;
}

.not-found {
  text-align: center;
  padding: 6rem 2rem;
}

.not-found h1 {
  font-size: 2.4rem;
  color: var(--blanc);
  margin-bottom: 1rem;
}

.not-found p {
  color: var(--gris-clair);
  margin-bottom: 2rem;
}

.btn-home {
  display: inline-block;
  padding: 1rem 2rem;
  background: var(--cyan-neon);
  color: var(--noir-profond);
  text-decoration: none;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.playspace-content {
  max-width: 120rem;
  margin: 0 auto;
}

.playspace-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 2rem;
  background: var(--noir-card);
  border: 1px solid rgba(0, 217, 217, 0.3);
  margin-bottom: 2rem;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.badge {
  padding: 0.5rem 1rem;
  font-size: 1.2rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.badge-gm {
  background: var(--violet-neon);
  color: var(--blanc);
}

.badge-pj {
  background: var(--cyan-neon);
  color: var(--noir-profond);
}

.playspace-name {
  font-size: 2.4rem;
  font-weight: 800;
  color: var(--blanc);
  margin: 0;
}

.local-badge {
  padding: 0.4rem 0.8rem;
  font-size: 1rem;
  background: rgba(255, 165, 0, 0.2);
  color: orange;
  border: 1px solid orange;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.header-meta {
  display: flex;
  gap: 1rem;
  color: var(--gris-clair);
  font-size: 1.4rem;
}

.hack-name {
  color: var(--cyan-neon);
  text-transform: uppercase;
}

.playspace-main {
  padding: 2rem;
}

.welcome-card {
  background: var(--noir-card);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 3rem;
  text-align: center;
}

.welcome-card h2 {
  font-size: 2rem;
  color: var(--blanc);
  margin-bottom: 1.5rem;
}

.welcome-card p {
  color: var(--gris-clair);
  font-size: 1.4rem;
  margin-bottom: 2rem;
}

.local-notice {
  color: orange !important;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.btn {
  padding: 1rem 2rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  cursor: pointer;
  border: none;
}

.btn-primary {
  background: var(--cyan-neon);
  color: var(--noir-profond);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
