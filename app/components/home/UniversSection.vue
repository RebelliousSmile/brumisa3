<script setup lang="ts">
/**
 * Univers Section - Popular Settings
 * Section avec grille d'univers populaires
 */

const openModal = () => {
  // TODO: Ouvrir modal de creation de playspace
  console.log('Ouvrir modal playspace')
}
</script>

<template>
  <section id="univers" class="section">
    <div class="container">
      <div class="showcase-header">
        <div class="showcase-subtitle">POPULAR SETTINGS</div>
        <h2 class="showcase-title">UNIVERS POPULAIRES</h2>
        <p class="showcase-description">
          Explorez nos univers les plus joues, du noir des annees 40 au cyberpunk futuriste.
          Chaque univers offre une atmosphere unique et des possibilites narratives infinies pour vos parties.
        </p>
      </div>

      <div class="system-grid">
        <!-- Univers LITM 1 -->
        <article class="system-card litm">
          <span class="system-badge litm-badge">Legends in the Mist</span>
          <h3 class="system-title">Chicago Noir 1940s</h3>
          <p class="system-description">Detectives et mysteres dans le Chicago des annees 40. Brume, gangsters et secrets surnaturels dans une atmosphere noir.</p>
          <button class="btn btn-secondary" @click="openModal">
            <span>Lancer un Playspace</span>
          </button>
        </article>

        <!-- Univers LITM 2 -->
        <article class="system-card litm">
          <span class="system-badge litm-badge">Legends in the Mist</span>
          <h3 class="system-title">Cyberpunk 2077</h3>
          <p class="system-description">Megacorporations, hackers et technologie de pointe dans un futur dystopique baigne de Brume.</p>
          <button class="btn btn-secondary" @click="openModal">
            <span>Lancer un Playspace</span>
          </button>
        </article>

        <!-- Univers Otherscape -->
        <article class="system-card otherscape">
          <span class="system-badge otherscape-badge">Tokyo:Otherscape</span>
          <h3 class="system-title">Tokyo:Otherscape Officiel</h3>
          <p class="system-description">Megapole japonaise futuriste ou technologie et mysticisme se melangent dans un cyberpunk unique.</p>
          <button class="btn btn-secondary" @click="openModal">
            <span>Lancer un Playspace</span>
          </button>
        </article>

        <!-- Univers City of Mist -->
        <article class="system-card city-of-mist">
          <span class="system-badge com-badge">City of Mist</span>
          <h3 class="system-title">City of Mist Standard</h3>
          <p class="system-description">La Cite brumeuse originale avec Mythos et Logos. Enquetes urbaines et identites fragmentees.</p>
          <button class="btn btn-secondary" @click="openModal">
            <span>Lancer un Playspace</span>
          </button>
        </article>
      </div>
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

/* GRILLE SYSTÈME JDR */
.system-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(32rem, 1fr));
  gap: 2rem;
}

.system-card {
  background: var(--noir-card);
  border: 2px solid transparent;
  padding: 3rem;
  transition: all 0.4s ease;
  position: relative;
}

.system-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: var(--system-color);
  box-shadow: 0 0 20px var(--system-color);
  transition: width 0.4s ease;
}

.system-card:hover::before {
  width: 100%;
  opacity: 0.1;
}

.system-card:hover {
  border-color: var(--system-color);
  transform: translateX(10px);
}

/* Couleurs par système */
.system-card.litm {
  --system-color: var(--cyan-neon);
}

.system-card.otherscape {
  --system-color: var(--violet-neon);
}

.system-card.city-of-mist {
  --system-color: var(--rose-neon);
}

.system-badge {
  display: inline-block;
  padding: 0.5rem 1.5rem;
  background: transparent;
  border: 2px solid var(--system-color);
  color: var(--system-color);
  font-size: 1.2rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  margin-bottom: 2rem;
}

.litm-badge {
  background: var(--cyan-neon);
  color: var(--noir-profond);
}

.otherscape-badge {
  background: var(--violet-neon);
  color: var(--blanc);
}

.com-badge {
  background: var(--rose-neon);
  color: var(--blanc);
}

.system-title {
  color: var(--blanc);
  margin-bottom: 1.5rem;
  font-size: clamp(1.8rem, 3vw, 2.4rem);
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.15em;
}

.system-description {
  color: var(--gris-clair);
  margin-bottom: 2.5rem;
  line-height: 1.8;
  font-size: 1.4rem;
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
@media (max-width: 768px) {
  .system-grid {
    grid-template-columns: 1fr;
  }
}
</style>
