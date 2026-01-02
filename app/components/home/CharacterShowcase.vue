<script setup lang="ts">
/**
 * Character Showcase - Section personnages style Otherscape
 * Layout 3 colonnes : Galerie + Image + Details
 */

import { ref } from 'vue'

const activeGalleryIndex = ref(0)

const selectGalleryItem = (index: number) => {
  activeGalleryIndex.value = index
}
</script>

<template>
  <section class="section character-section">
    <div class="container">
      <div class="character-showcase">
        <!-- Header Section -->
        <div class="showcase-header">
          <div class="showcase-subtitle">YOUR CHARACTER</div>
          <h2 class="showcase-title">THEME CARDS, HERO CARD & TRACKERS</h2>
          <p class="showcase-description">
            Dans Brumisa3, creez des personnages riches avec leurs Theme Cards (identite, pouvoir, faiblesse),
            Hero Card (liens et motivations) et Trackers (statuts, story tags). Systeme complet Mist Engine.
          </p>
        </div>

        <!-- Layout Galerie + Image + Description -->
        <div class="character-layout">
          <!-- Galerie Vignettes Gauche -->
          <div class="character-gallery">
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
          <div class="character-main-image">
            <div class="main-image-placeholder">
              <span>VALKYRIE</span>
            </div>
          </div>

          <!-- Description Droite -->
          <div class="character-details">
            <div class="character-tag">ARCHETYPE</div>
            <h3 class="character-name">VALKYRIE</h3>
            <p class="character-bio">
              Mercenaire augmentee cybernetiquement, Valkyrie combine puissance brute et technologie de pointe.
              Ses implants militaires lui confèrent des capacités surhumaines, mais à quel prix pour son humanité?
            </p>
            <div class="character-stats">
              <div class="stat-item">
                <span class="stat-label">Theme Cards:</span>
                <span class="stat-value">3</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Status:</span>
                <span class="stat-value">5</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Story Tags:</span>
                <span class="stat-value">8</span>
              </div>
            </div>
            <div class="character-actions">
              <NuxtLink to="/characters/new" class="btn">
                <span>Creer un Personnage</span>
              </NuxtLink>
              <NuxtLink to="/characters" class="btn btn-secondary">
                <span>Voir Tous</span>
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* SECTION PERSONNAGES STYLE OTHERSCAPE */
.character-section {
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

.character-showcase {
  margin: 6rem 0;
}

.showcase-header {
  text-align: center;
  margin-bottom: 6rem;
}

.showcase-subtitle {
  color: var(--cyan-neon);
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
.character-layout {
  display: grid;
  grid-template-columns: 30rem 1fr 2fr;
  gap: 4rem;
  align-items: start;
}

/* GALERIE VIGNETTES - Grille compacte style Otherscape */
.character-gallery {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 1rem;
}

.gallery-item {
  aspect-ratio: 1;
  border: 2px solid rgba(0, 217, 217, 0.3);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.gallery-item:hover {
  border-color: var(--cyan-neon);
  transform: scale(1.05);
}

.gallery-item.active {
  border-color: var(--cyan-neon);
  box-shadow: var(--glow-cyan);
}

.gallery-item.active::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, transparent 0%, rgba(0, 217, 217, 0.2) 100%);
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
  color: rgba(0, 217, 217, 0.3);
}

/* IMAGE PRINCIPALE CENTRE */
.character-main-image {
  position: relative;
  aspect-ratio: 3 / 4;
  border: 2px solid rgba(0, 217, 217, 0.3);
  overflow: hidden;
}

.main-image-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
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
  color: rgba(0, 217, 217, 0.4);
}

.main-image-placeholder::after {
  content: 'Image par defaut';
  font-size: 1.2rem;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.3);
  letter-spacing: 0.1em;
}

/* DETAILS PERSONNAGE */
.character-details {
  padding: 2rem 0;
}

.character-tag {
  display: inline-block;
  padding: 0.5rem 1.5rem;
  background: rgba(0, 217, 217, 0.1);
  border: 1px solid var(--cyan-neon);
  color: var(--cyan-neon);
  font-size: 1.2rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  margin-bottom: 2rem;
}

.character-name {
  font-size: 3.5rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--blanc);
  margin-bottom: 2.5rem;
}

.character-bio {
  color: var(--gris-clair);
  font-size: 1.6rem;
  line-height: 1.8;
  margin-bottom: 3rem;
}

.character-stats {
  margin-bottom: 3rem;
  padding: 2rem 0;
  border-top: 1px solid rgba(0, 217, 217, 0.2);
  border-bottom: 1px solid rgba(0, 217, 217, 0.2);
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
  color: var(--cyan-neon);
  font-size: 2rem;
  font-weight: 800;
}

.character-actions {
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
  background: var(--cyan-neon);
  color: var(--noir-profond);
  border: 2px solid var(--cyan-neon);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  box-shadow: var(--glow-cyan);
}

.btn:hover {
  box-shadow: var(--glow-cyan-fort);
  transform: translateY(-2px);
}

.btn span {
  position: relative;
  z-index: 1;
}

.btn-secondary {
  background: transparent;
  color: var(--cyan-neon);
}

.btn-secondary:hover {
  background: var(--cyan-neon);
  color: var(--noir-profond);
}

/* RESPONSIVE */
@media (max-width: 1024px) {
  .character-layout {
    grid-template-columns: 1fr;
    gap: 3rem;
  }

  .character-gallery {
    grid-template-columns: repeat(6, 1fr);
    grid-template-rows: 1fr;
  }
}

@media (max-width: 768px) {
  .character-actions {
    flex-direction: column;
  }

  .character-actions .btn {
    width: 100%;
  }
}

@media (max-width: 640px) {
  .character-gallery {
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(2, 1fr);
  }
}
</style>
