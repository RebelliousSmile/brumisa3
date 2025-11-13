<script setup lang="ts">
/**
 * Products Section - Hacks & Extensions
 * Section avec tabs pour filtrer entre Mist Engine et City of Mist
 */

import { ref } from 'vue'

const activeSystem = ref('mist-engine')

const switchSystem = (system: string) => {
  activeSystem.value = system
}

const openModal = () => {
  // TODO: Ouvrir modal de creation de playspace
  console.log('Ouvrir modal playspace')
}
</script>

<template>
  <section id="produits" class="section">
    <div class="container">
      <!-- TABS OTHERSCAPE - Moteurs de jeu -->
      <div class="tabs-container">
        <div class="tabs">
          <button
            class="tab"
            :class="{ active: activeSystem === 'mist-engine' }"
            @click="switchSystem('mist-engine')"
          >
            <span>MIST ENGINE</span>
          </button>
          <button
            class="tab"
            :class="{ active: activeSystem === 'city-of-mist' }"
            @click="switchSystem('city-of-mist')"
          >
            <span>CITY OF MIST</span>
          </button>
        </div>
      </div>

      <h2 class="section-title">HACKS & EXTENSIONS</h2>
      <p class="section-description">
        Choisissez parmi nos extensions officielles pour Mist Engine et City of Mist.
        Chaque hack propose un univers unique avec ses propres regles, themes et mecaniques de jeu adaptes.
      </p>

      <!-- Conteneur Mist Engine -->
      <Transition name="fade">
        <div v-if="activeSystem === 'mist-engine'" class="products-grid">
          <!-- Hack LITM -->
          <article class="product-card">
            <div class="product-image">
              <span class="product-badge">OFFICIEL</span>
            </div>
            <div class="product-content">
              <div class="product-category">Mist Engine</div>
              <h3 class="product-title">Legends in the Mist</h3>
              <p class="product-description">Systeme complet avec Theme Cards, Hero Card, Relations et Trackers.</p>
              <div class="product-footer">
                <div class="product-price">4 univers</div>
                <button class="btn product-btn" @click="openModal">
                  <span>Lancer un Playspace</span>
                </button>
              </div>
            </div>
          </article>

          <!-- Hack Otherscape -->
          <article class="product-card">
            <div class="product-image">
              <span class="product-badge">OFFICIEL</span>
            </div>
            <div class="product-content">
              <div class="product-category">Mist Engine</div>
              <h3 class="product-title">Tokyo:Otherscape</h3>
              <p class="product-description">Hack cyberpunk japonais avec megapoles et technologie mystique.</p>
              <div class="product-footer">
                <div class="product-price">3 univers</div>
                <button class="btn product-btn" @click="openModal">
                  <span>Lancer un Playspace</span>
                </button>
              </div>
            </div>
          </article>
        </div>
      </Transition>

      <!-- Conteneur City of Mist -->
      <Transition name="fade">
        <div v-if="activeSystem === 'city-of-mist'" class="products-grid">
          <!-- Hack CoM Standard -->
          <article class="product-card">
            <div class="product-image">
              <span class="product-badge">OFFICIEL</span>
            </div>
            <div class="product-content">
              <div class="product-category">City of Mist</div>
              <h3 class="product-title">City of Mist Standard</h3>
              <p class="product-description">Systeme original avec Mythos, Logos et spectrum identity.</p>
              <div class="product-footer">
                <div class="product-price">1 univers</div>
                <button class="btn product-btn" @click="openModal">
                  <span>Lancer un Playspace</span>
                </button>
              </div>
            </div>
          </article>

          <!-- Hack CoM Noir -->
          <article class="product-card">
            <div class="product-image">
              <span class="product-badge">OFFICIEL</span>
            </div>
            <div class="product-content">
              <div class="product-category">City of Mist</div>
              <h3 class="product-title">City of Mist Noir</h3>
              <p class="product-description">Variante noir detective avec themes sombres et enquetes.</p>
              <div class="product-footer">
                <div class="product-price">1 univers</div>
                <button class="btn product-btn" @click="openModal">
                  <span>Lancer un Playspace</span>
                </button>
              </div>
            </div>
          </article>
        </div>
      </Transition>
    </div>
  </section>
</template>

<style scoped>
/* SECTION */
.section {
  padding: 8rem 2rem;
  position: relative;
}

.container {
  max-width: 140rem;
  margin: 0 auto;
}

.section-title {
  text-align: center;
  font-size: clamp(2.5rem, 4vw, 4.5rem);
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: var(--blanc);
  margin-bottom: 3rem;
}

.section-description {
  text-align: center;
  color: var(--gris-clair);
  font-size: 1.6rem;
  line-height: 1.8;
  max-width: 90rem;
  margin: 0 auto 6rem;
}

/* TABS OTHERSCAPE STYLE - Minimaliste */
.tabs-container {
  display: flex;
  justify-content: center;
  margin-bottom: 3rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.tabs {
  display: flex;
  gap: 6rem;
}

.tab {
  padding: 1rem 0 1.5rem 0;
  background: transparent;
  border: none;
  color: var(--gris-clair);
  font-family: 'Assistant', sans-serif;
  font-weight: 400;
  font-size: 1.6rem;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  cursor: pointer;
  position: relative;
  transition: color 0.3s ease;
  border-bottom: 3px solid transparent;
}

.tab:hover {
  color: var(--blanc);
}

.tab.active {
  color: var(--cyan-neon);
  border-bottom-color: var(--cyan-neon);
}

/* GRILLE CARTES PRODUITS */
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(28rem, 1fr));
  gap: 3rem;
}

/* CARTES PRODUITS CYBERPUNK */
.product-card {
  background: var(--noir-card);
  border: 2px solid rgba(0, 217, 217, 0.3);
  position: relative;
  overflow: hidden;
  transition: all 0.4s ease;
  cursor: pointer;
}

.product-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, transparent 0%, rgba(0, 217, 217, 0.1) 100%);
  opacity: 0;
  transition: opacity 0.4s ease;
}

.product-card:hover {
  border-color: var(--cyan-neon);
  transform: translateY(-5px);
  box-shadow: var(--glow-cyan-fort);
}

.product-card:hover::before {
  opacity: 1;
}

.product-image {
  width: 100%;
  height: 35rem;
  background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.product-image::after {
  content: 'IMAGE';
  font-size: 2rem;
  font-weight: 800;
  color: rgba(0, 217, 217, 0.3);
  letter-spacing: 0.3em;
}

.product-badge {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  padding: 0.5rem 1.5rem;
  background: var(--cyan-neon);
  color: var(--noir-profond);
  font-size: 1.2rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.product-content {
  padding: 2.5rem;
  position: relative;
}

.product-category {
  color: var(--cyan-neon);
  font-size: 1.2rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  margin-bottom: 1rem;
}

.product-title {
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
  text-transform: uppercase;
  color: var(--blanc);
}

.product-description {
  color: var(--gris-clair);
  font-size: 1.4rem;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 2rem;
  border-top: 1px solid rgba(0, 217, 217, 0.2);
}

.product-price {
  font-size: 2.4rem;
  font-weight: 800;
  color: var(--cyan-neon);
}

.product-btn {
  padding: 1rem 2rem;
  font-size: 1.2rem;
  letter-spacing: 0.1em;
}

/* Bouton */
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

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* RESPONSIVE */
@media (max-width: 768px) {
  .tabs {
    gap: 3rem;
    flex-wrap: wrap;
    justify-content: center;
  }

  .tab {
    font-size: 1.4rem;
  }

  .products-grid {
    grid-template-columns: 1fr;
  }
}
</style>
