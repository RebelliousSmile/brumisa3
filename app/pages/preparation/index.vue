<script setup lang="ts">
/**
 * Page Hub Preparation (Context-Sensitive MJ/PJ)
 *
 * Section 2 de la navigation principale
 * Dashboard adaptatif selon role du playspace actif :
 * - [Mode PJ] : Dashboard Personnages (liste personnages)
 * - [Mode MJ] : Dashboard MJ complet (onglets Personnages / Dangers / Lieux)
 */

import { usePlayspaceStore } from '#shared/stores/playspace'

definePageMeta({
  layout: 'playspace' // Layout avec contexte playspace et sidebar
  // Pas de middleware pour permettre l'acces direct depuis navigation
})

const playspaceStore = usePlayspaceStore()

useSeoMeta({
  title: 'Preparation - Brumisa3',
  description: 'Dashboard de preparation : gerez vos personnages, dangers et lieux selon votre role MJ ou PJ'
})
</script>

<template>
  <div>
    <!-- Section conditionnelle : Tutoriel ou Informations Playspace -->
    <section v-if="!playspaceStore.hasPlayspaces" class="section tutorial-section">
      <div class="container">
        <div class="tutorial-card">
          <div class="tutorial-header">
            <div class="tutorial-icon">
              <Icon name="heroicons:academic-cap" class="w-16 h-16 text-otherscape-cyan-neon" />
            </div>
            <h2 class="tutorial-title">BIENVENUE DANS BRUMISA3</h2>
            <p class="tutorial-subtitle">Commencez par créer votre premier Playspace</p>
          </div>

          <div class="tutorial-content">
            <div class="tutorial-step">
              <div class="step-number">1</div>
              <div class="step-content">
                <h3>Utilisez le menu radial</h3>
                <p>Cliquez sur le bouton en bas à gauche de l'écran pour ouvrir le menu radial de navigation</p>
              </div>
            </div>

            <div class="tutorial-step">
              <div class="step-number">2</div>
              <div class="step-content">
                <h3>Créez votre Playspace</h3>
                <p>Sélectionnez "Nouveau Playspace" et suivez les étapes : Système, Hack, Univers, Nom</p>
              </div>
            </div>

            <div class="tutorial-step">
              <div class="step-number">3</div>
              <div class="step-content">
                <h3>Commencez à jouer</h3>
                <p>Une fois créé, vous pourrez gérer vos personnages et dangers depuis cette page</p>
              </div>
            </div>
          </div>

          <div class="tutorial-actions">
            <NuxtLink to="/decouverte" class="btn btn-secondary">
              <span>En savoir plus</span>
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Section Informations Playspace Actif -->
    <section v-else-if="playspaceStore.activePlayspace" class="section playspace-info-section">
      <div class="container">
        <div class="playspace-card">
          <div class="playspace-header">
            <div class="playspace-badge" :class="playspaceStore.isMJ ? 'badge-mj' : 'badge-pj'">
              {{ playspaceStore.activePlayspace.role }}
            </div>
            <h2 class="playspace-name">{{ playspaceStore.activePlayspace.nom }}</h2>
          </div>

          <div class="playspace-details">
            <div class="detail-item">
              <span class="detail-label">Système</span>
              <span class="detail-value">{{ playspaceStore.activePlayspace.systeme }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Hack</span>
              <span class="detail-value">{{ playspaceStore.activePlayspace.hack }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Univers</span>
              <span class="detail-value">{{ playspaceStore.activePlayspace.univers }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Character Showcase (toujours affiché) -->
    <SectionsCharacterShowcase />

    <!-- Danger Showcase (affiché uniquement en mode MJ) -->
    <SectionsDangerShowcase v-if="playspaceStore.isMJ" />
  </div>
</template>

<style scoped>
/* SECTIONS COMMUNES */
.section {
  padding: 8rem 2rem;
  position: relative;
}

.container {
  max-width: 140rem;
  margin: 0 auto;
}

/* SECTION TUTORIEL */
.tutorial-section {
  background: var(--noir-profond);
  min-height: 60vh;
  display: flex;
  align-items: center;
}

.tutorial-card {
  background: var(--noir-card);
  border: 2px solid rgba(0, 217, 217, 0.3);
  padding: 6rem;
  text-align: center;
  max-width: 90rem;
  margin: 0 auto;
}

.tutorial-header {
  margin-bottom: 5rem;
}

.tutorial-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 10rem;
  height: 10rem;
  margin-bottom: 3rem;
  border: 2px solid var(--cyan-neon);
  border-radius: 50%;
  background: rgba(0, 217, 217, 0.1);
}

.tutorial-title {
  font-size: 3.5rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: var(--cyan-neon);
  margin-bottom: 2rem;
  text-shadow: var(--glow-cyan);
}

.tutorial-subtitle {
  font-size: 1.8rem;
  color: var(--gris-clair);
}

.tutorial-content {
  display: flex;
  flex-direction: column;
  gap: 3rem;
  margin-bottom: 5rem;
  text-align: left;
}

.tutorial-step {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
  padding: 2rem;
  background: rgba(0, 217, 217, 0.05);
  border-left: 3px solid var(--cyan-neon);
}

.step-number {
  flex-shrink: 0;
  width: 4rem;
  height: 4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--cyan-neon);
  color: var(--noir-profond);
  font-size: 2rem;
  font-weight: 800;
  border-radius: 50%;
}

.step-content h3 {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--blanc);
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.step-content p {
  font-size: 1.5rem;
  color: var(--gris-clair);
  line-height: 1.6;
}

.tutorial-actions {
  display: flex;
  justify-content: center;
  gap: 2rem;
}

/* SECTION PLAYSPACE INFO */
.playspace-info-section {
  background: var(--noir-profond);
}

.playspace-card {
  background: var(--noir-card);
  border: 2px solid rgba(0, 217, 217, 0.3);
  padding: 4rem;
  max-width: 90rem;
  margin: 0 auto;
}

.playspace-header {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 3rem;
  padding-bottom: 3rem;
  border-bottom: 1px solid rgba(0, 217, 217, 0.2);
}

.playspace-badge {
  padding: 0.8rem 2rem;
  font-size: 1.4rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  border-radius: 0.4rem;
}

.badge-mj {
  background: rgba(255, 107, 0, 0.2);
  color: #ff6b00;
  border: 2px solid #ff6b00;
}

.badge-pj {
  background: rgba(0, 119, 255, 0.2);
  color: #0077ff;
  border: 2px solid #0077ff;
}

.playspace-name {
  flex: 1;
  font-size: 3rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--cyan-neon);
}

.playspace-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(25rem, 1fr));
  gap: 3rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 2rem;
  background: rgba(0, 217, 217, 0.05);
  border-left: 3px solid var(--cyan-neon);
}

.detail-label {
  font-size: 1.3rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: var(--gris-moyen);
}

.detail-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--blanc);
}

/* BOUTONS */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem 4rem;
  font-family: 'Assistant', sans-serif;
  font-weight: 800;
  font-size: 1.4rem;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.btn-secondary {
  background: transparent;
  color: var(--cyan-neon);
  border: 2px solid var(--cyan-neon);
}

.btn-secondary:hover {
  background: var(--cyan-neon);
  color: var(--noir-profond);
  box-shadow: var(--glow-cyan);
}

.btn span {
  position: relative;
  z-index: 1;
}

/* RESPONSIVE */
@media (max-width: 768px) {
  .tutorial-card,
  .playspace-card {
    padding: 3rem;
  }

  .tutorial-title {
    font-size: 2.5rem;
  }

  .playspace-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .playspace-details {
    grid-template-columns: 1fr;
  }
}
</style>
