<script setup lang="ts">
/**
 * Footer Otherscape Cyberpunk
 *
 * Footer avec design cyberpunk authentique
 */

const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="footer-otherscape">
    <div class="footer-content">
      <!-- Section A Propos -->
      <div class="footer-section">
        <h3>Brumisa3</h3>
        <p class="footer-description">
          Generateur de fiches de personnages pour Mist Engine. Materiel officiel pour Tokyo:Otherscape, Legends in the Mist et autres univers.
        </p>
        <div class="footer-social">
          <a href="#" class="social-link" aria-label="Discord">D</a>
          <a href="#" class="social-link" aria-label="Twitter">X</a>
          <a href="#" class="social-link" aria-label="Facebook">F</a>
          <a href="#" class="social-link" aria-label="Instagram">I</a>
        </div>
      </div>

      <!-- Section Navigation -->
      <div class="footer-section">
        <h3>Navigation</h3>
        <ul class="footer-links">
          <li><NuxtLink to="/" class="footer-link">Accueil</NuxtLink></li>
          <li><NuxtLink to="/preparation" class="footer-link">Produits</NuxtLink></li>
          <li><NuxtLink to="/decouverte" class="footer-link">Systemes JDR</NuxtLink></li>
          <li><NuxtLink to="/decouverte/guide" class="footer-link">Guide d'utilisation</NuxtLink></li>
          <li><NuxtLink to="/support" class="footer-link">Contact</NuxtLink></li>
        </ul>
      </div>

      <!-- Section Ressources -->
      <div class="footer-section">
        <h3>Ressources</h3>
        <ul class="footer-links">
          <li><NuxtLink to="/decouverte/guide" class="footer-link">Documentation</NuxtLink></li>
          <li><NuxtLink to="/decouverte/tutoriels" class="footer-link">Tutoriels</NuxtLink></li>
          <li><NuxtLink to="/decouverte/exemples" class="footer-link">Exemples</NuxtLink></li>
          <li><NuxtLink to="/decouverte/guide#faq" class="footer-link">FAQ</NuxtLink></li>
          <li><NuxtLink to="/support" class="footer-link">Support</NuxtLink></li>
        </ul>
      </div>

      <!-- Section Newsletter -->
      <div class="footer-section">
        <h3>Newsletter</h3>
        <p class="newsletter-description">
          Recevez les nouveaux systemes et mises a jour.
        </p>
        <form class="newsletter-form" @submit.prevent>
          <input
            type="email"
            class="newsletter-input"
            placeholder="votre@email.com"
            required
          >
          <button type="submit" class="btn newsletter-btn">
            <span>S'abonner</span>
          </button>
        </form>
      </div>
    </div>

    <!-- Footer Bottom -->
    <div class="footer-bottom">
      <p>&copy; {{ currentYear }} Brumisa3 - Tous droits reserves</p>
      <p class="footer-credits">
        Materiel officiel pour <a href="https://sonofoak.com" target="_blank">Tokyo:Otherscape</a> et Mist Engine par Son of Oak Game Studio
      </p>
      <p class="footer-credits footer-legal">
        <NuxtLink to="/legal">Mentions Legales</NuxtLink> •
        <NuxtLink to="/legal#rgpd">Confidentialite</NuxtLink> •
        <NuxtLink to="/legal#cgu">CGU</NuxtLink>
      </p>
    </div>
  </footer>
</template>

<style scoped>
/* FOOTER CYBERPUNK */
.footer-otherscape {
  background: var(--noir-card);
  border-top: 1px solid rgba(0, 217, 217, 0.3);
  padding: 6rem 2rem 3rem;
}

.footer-content {
  max-width: 140rem;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(25rem, 1fr));
  gap: 4rem;
  margin-bottom: 4rem;
}

.footer-section h3 {
  color: var(--cyan-neon);
  font-size: 1.4rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  margin-bottom: 2rem;
}

.footer-description {
  color: var(--gris-clair);
  line-height: 1.8;
  font-size: 1.4rem;
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-links li {
  margin-bottom: 1.2rem;
}

.footer-link {
  color: var(--gris-clair);
  text-decoration: none;
  font-size: 1.4rem;
  transition: all 0.3s ease;
  display: inline-block;
}

.footer-link:hover {
  color: var(--cyan-neon);
  transform: translateX(5px);
}

.footer-social {
  display: flex;
  gap: 2rem;
  margin-top: 2rem;
}

.social-link {
  width: 4rem;
  height: 4rem;
  border: 2px solid rgba(0, 217, 217, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gris-clair);
  text-decoration: none;
  font-size: 2rem;
  transition: all 0.3s ease;
}

.social-link:hover {
  border-color: var(--cyan-neon);
  color: var(--cyan-neon);
  box-shadow: var(--glow-cyan);
}

.newsletter-description {
  color: var(--gris-clair);
  font-size: 1.4rem;
  margin-bottom: 1.5rem;
}

.newsletter-form {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.newsletter-input {
  flex: 1;
  padding: 1.2rem;
  background: rgba(0, 217, 217, 0.05);
  border: 2px solid rgba(0, 217, 217, 0.3);
  color: var(--blanc);
  font-family: 'Assistant', sans-serif;
  font-size: 1.4rem;
  transition: all 0.3s ease;
}

.newsletter-input:focus {
  outline: none;
  border-color: var(--cyan-neon);
  background: rgba(0, 217, 217, 0.1);
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 1.2rem 2.5rem;
  font-family: 'Assistant', sans-serif;
  font-weight: 800;
  font-size: 1.3rem;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  text-decoration: none;
  background: var(--cyan-neon);
  color: var(--noir-profond);
  border: 2px solid var(--cyan-neon);
  cursor: pointer;
  transition: all 0.3s ease;
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

.newsletter-btn {
  padding: 1.2rem 2.5rem;
  font-size: 1.3rem;
  letter-spacing: 0.1em;
}

.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 3rem;
  text-align: center;
}

.footer-bottom p {
  color: var(--gris-moyen);
  font-size: 1.3rem;
  margin-bottom: 0.5rem;
}

.footer-credits {
  color: var(--gris-moyen);
  font-size: 1.2rem;
}

.footer-credits a {
  color: var(--cyan-neon);
  text-decoration: none;
  transition: all 0.3s ease;
}

.footer-credits a:hover {
  text-decoration: underline;
}

.footer-legal {
  margin-top: 1rem;
}

/* RESPONSIVE */
@media (max-width: 768px) {
  .newsletter-form {
    flex-direction: column;
  }

  .newsletter-btn {
    width: 100%;
  }
}
</style>
