<script setup lang="ts">
/**
 * Danger Showcase - Section dangers style Otherscape
 * Layout 3 colonnes : Galerie + Image + Details
 */

import { ref } from 'vue'

const activeGalleryIndex = ref(0)

const selectGalleryItem = (index: number) => {
  activeGalleryIndex.value = index
}
</script>

<template>
  <section class="section danger-section">
    <div class="container">
      <div class="danger-showcase">
        <!-- Header Section -->
        <div class="showcase-header">
          <div class="showcase-subtitle">THREATS & DANGERS</div>
          <h2 class="showcase-title">DANGERS, ADVERSAIRES & OBSTACLES</h2>
          <p class="showcase-description">
            Créez des dangers complexes pour vos parties : adversaires avec Theme Cards, obstacles environnementaux,
            défis narratifs. Système complet pour MJ avec gestion des menaces et progression.
          </p>
        </div>

        <!-- Layout Galerie + Image + Description -->
        <div class="danger-layout">
          <!-- Galerie Vignettes Gauche -->
          <div class="danger-gallery">
            <div
              v-for="index in 6"
              :key="index"
              class="gallery-item"
              :class="{ active: activeGalleryIndex === index - 1 }"
              @click="selectGalleryItem(index - 1)"
            >
              <div class="gallery-placeholder">{{ index }}</div>
            </div>
          </div>

          <!-- Image Principale Centre -->
          <div class="danger-main-image">
            <div class="main-image-placeholder">
              <span>NEMESIS</span>
            </div>
          </div>

          <!-- Description Droite -->
          <div class="danger-details">
            <div class="danger-tag danger">ADVERSAIRE</div>
            <h3 class="danger-name">NEMESIS</h3>
            <p class="danger-bio">
              Intelligence artificielle corrompue contrôlant un réseau tentaculaire de drones de combat.
              Nemesis représente la menace ultime : une machine qui a appris à haïr l'humanité.
            </p>
            <div class="danger-stats">
              <div class="stat-item">
                <span class="stat-label">Theme Cards:</span>
                <span class="stat-value">2</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Danger Level:</span>
                <span class="stat-value">5</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Type:</span>
                <span class="stat-value">Boss</span>
              </div>
            </div>
            <div class="danger-actions">
              <NuxtLink to="/preparation" class="btn btn-danger">
                <span>Créer ce Danger</span>
              </NuxtLink>
              <NuxtLink to="/decouverte" class="btn btn-secondary">
                <span>Voir Détails</span>
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* SECTION DANGERS STYLE OTHERSCAPE */
.danger-section {
  background: var(--noir-profond);
}

.section {
  padding: 8rem 2rem;
  position: relative;
}

.container {
  max-width: 140rem;
  margin: 0 auto;
}

.danger-showcase {
  margin: 6rem 0;
}

.showcase-header {
  text-align: center;
  margin-bottom: 6rem;
}

.showcase-subtitle {
  color: var(--rose-neon);
  font-size: 1.4rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3em;
  margin-bottom: 2rem;
}

.showcase-title {
  font-size: clamp(2.5rem, 5vw, 4.5rem);
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 3rem;
  color: var(--blanc);
}

.showcase-description {
  color: var(--gris-clair);
  font-size: 1.6rem;
  line-height: 1.8;
  max-width: 90rem;
  margin: 0 auto;
}

/* LAYOUT GALERIE + IMAGE + DESCRIPTION (3 colonnes) */
.danger-layout {
  display: grid;
  grid-template-columns: 30rem 1fr 2fr;
  gap: 4rem;
  align-items: start;
}

/* GALERIE VIGNETTES - Grille compacte style Otherscape */
.danger-gallery {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 1rem;
}

.gallery-item {
  aspect-ratio: 1;
  border: 2px solid rgba(255, 0, 110, 0.3);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.gallery-item:hover {
  border-color: var(--rose-neon);
  transform: scale(1.05);
}

.gallery-item.active {
  border-color: var(--rose-neon);
  box-shadow: var(--glow-rose);
}

.gallery-item.active::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, transparent 0%, rgba(255, 0, 110, 0.2) 100%);
}

.gallery-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  font-weight: 800;
  color: rgba(255, 0, 110, 0.3);
}

/* IMAGE PRINCIPALE CENTRE */
.danger-main-image {
  position: relative;
  aspect-ratio: 3 / 4;
  border: 2px solid rgba(255, 0, 110, 0.3);
  overflow: hidden;
}

.main-image-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #1a1a1a 0%, #2a1a1a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 2rem;
}

.main-image-placeholder span {
  font-size: 2.5rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: rgba(255, 0, 110, 0.4);
}

.main-image-placeholder::after {
  content: 'Image par défaut';
  font-size: 1.2rem;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.3);
  letter-spacing: 0.1em;
}

/* DETAILS DANGER */
.danger-details {
  padding: 2rem 0;
}

.danger-tag {
  display: inline-block;
  padding: 0.5rem 1.5rem;
  background: rgba(255, 0, 110, 0.1);
  border: 1px solid var(--rose-neon);
  color: var(--rose-neon);
  font-size: 1.2rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  margin-bottom: 2rem;
}

.danger-name {
  font-size: 3.5rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--blanc);
  margin-bottom: 2.5rem;
}

.danger-bio {
  color: var(--gris-clair);
  font-size: 1.6rem;
  line-height: 1.8;
  margin-bottom: 3rem;
}

.danger-stats {
  margin-bottom: 3rem;
  padding: 2rem 0;
  border-top: 1px solid rgba(255, 0, 110, 0.2);
  border-bottom: 1px solid rgba(255, 0, 110, 0.2);
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.stat-item:last-child {
  margin-bottom: 0;
}

.stat-label {
  color: var(--gris-clair);
  font-size: 1.4rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.stat-value {
  color: var(--rose-neon);
  font-size: 2rem;
  font-weight: 800;
}

.danger-actions {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

/* Boutons */
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

.btn-danger {
  background: var(--rose-neon);
  color: var(--noir-profond);
  border: 2px solid var(--rose-neon);
  box-shadow: var(--glow-rose);
}

.btn-danger:hover {
  box-shadow: 0 0 30px rgba(255, 0, 110, 0.8), 0 0 50px rgba(255, 0, 110, 0.8);
  transform: translateY(-2px);
}

.btn span {
  position: relative;
  z-index: 1;
}

.btn-secondary {
  background: transparent;
  color: var(--rose-neon);
  border: 2px solid var(--rose-neon);
}

.btn-secondary:hover {
  background: var(--rose-neon);
  color: var(--noir-profond);
}

/* RESPONSIVE */
@media (max-width: 1024px) {
  .danger-layout {
    grid-template-columns: 1fr;
    gap: 3rem;
  }

  .danger-gallery {
    grid-template-columns: repeat(6, 1fr);
    grid-template-rows: 1fr;
  }
}

@media (max-width: 768px) {
  .danger-actions {
    flex-direction: column;
  }

  .danger-actions .btn {
    width: 100%;
  }
}

@media (max-width: 640px) {
  .danger-gallery {
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(2, 1fr);
  }
}
</style>
