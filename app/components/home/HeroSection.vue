<script setup lang="ts">
/**
 * Hero Section - Style Otherscape Cyberpunk
 * Section hero avec titre principal, sous-titre et CTAs
 */
</script>

<template>
  <section class="hero-section">
    <div class="hero-content">
      <div class="hero-subtitle">Mist Engine RPG</div>
      <h1>Generateur de Fiches JDR</h1>
      <p>Creez des fiches de personnages immersives pour vos parties. Design cyberpunk inspire de Tokyo:Otherscape. Materiel officiel pour le Mist Engine.</p>
      <div class="btn-group">
        <NuxtLink to="/preparation" class="btn glow-pulse">
          <span>Creer une Fiche</span>
        </NuxtLink>
        <NuxtLink to="/decouverte" class="btn btn-secondary">
          <span>Explorer</span>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* HERO SECTION CYBERPUNK */
.hero-section {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 10rem 2rem 6rem;
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(circle at 20% 50%, rgba(0, 217, 217, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 50%, rgba(157, 78, 221, 0.1) 0%, transparent 50%),
    var(--noir-profond);
}

.hero-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(0, 217, 217, 0.03) 2px,
      rgba(0, 217, 217, 0.03) 4px
    );
  pointer-events: none;
}

.hero-content {
  position: relative;
  z-index: 10;
  max-width: 90rem;
}

.hero-subtitle {
  color: var(--cyan-neon);
  font-size: 1.6rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3em;
  margin-bottom: 2rem;
}

.hero-section h1 {
  font-size: clamp(3rem, 6vw, 6rem);
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: var(--blanc);
  text-shadow: var(--glow-cyan);
  margin-bottom: 3rem;
}

.hero-section p {
  font-size: 1.8rem;
  color: var(--gris-clair);
  margin-bottom: 4rem;
  line-height: 1.8;
}

/* BOUTONS CYBERPUNK */
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

.btn::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: var(--cyan-hover);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: width 0.6s ease, height 0.6s ease;
}

.btn:hover::before {
  width: 300%;
  height: 300%;
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

.btn-group {
  display: flex;
  gap: 2rem;
  justify-content: center;
  flex-wrap: wrap;
}

/* ANIMATIONS */
@keyframes glow-pulse {
  0%, 100% {
    box-shadow: var(--glow-cyan);
  }
  50% {
    box-shadow: var(--glow-cyan-fort);
  }
}

.glow-pulse {
  animation: glow-pulse 2s ease-in-out infinite;
}

/* RESPONSIVE */
@media (max-width: 768px) {
  .hero-section {
    padding: 12rem 2rem 6rem;
  }
}
</style>
