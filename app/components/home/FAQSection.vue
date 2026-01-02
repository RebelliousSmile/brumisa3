<script setup lang="ts">
/**
 * FAQ Section - Questions fréquentes
 * Section accordéon avec les questions les plus courantes
 * Style Otherscape cyberpunk
 */

interface FAQItem {
  id: number
  question: string
  answer: string
}

const faqs: FAQItem[] = [
  {
    id: 1,
    question: 'Qu\'est-ce que le Mist Engine ?',
    answer: 'Le Mist Engine est un système de jeu de rôle narratif créé par Son of Oak. Il met l\'accent sur les histoires personnelles des personnages, leurs dilemmes internes et leurs relations. Les mécaniques de jeu sont conçues pour soutenir la narration plutôt que de la contraindre.'
  },
  {
    id: 2,
    question: 'Quelle différence entre LITM et City of Mist ?',
    answer: 'City of Mist est le jeu original où les personnages sont des Rifts, des gens ordinaires canalisant des Mythes. Legends in the Mist (LITM) est une version plus flexible qui permet de jouer dans n\'importe quel univers, avec un système de Theme Cards plus modulaire.'
  },
  {
    id: 3,
    question: 'Puis-je utiliser Brumisa3 gratuitement ?',
    answer: 'Oui, Brumisa3 est entièrement gratuit. Vous pouvez créer des personnages, gérer vos playspaces et exporter vos fiches sans aucun frais. Le projet est open-source et développé par la communauté.'
  },
  {
    id: 4,
    question: 'Comment fonctionne un Playspace ?',
    answer: 'Un Playspace est votre espace de jeu personnel. Il contient tous vos personnages pour une campagne ou un groupe. Vous pouvez en créer plusieurs pour différentes parties et passer de l\'un à l\'autre facilement.'
  },
  {
    id: 5,
    question: 'Puis-je jouer hors ligne ?',
    answer: 'Actuellement, Brumisa3 nécessite une connexion internet. Cependant, vous pouvez exporter vos fiches de personnages en JSON pour les sauvegarder localement et les réimporter plus tard.'
  },
  {
    id: 6,
    question: 'Comment créer mon premier personnage ?',
    answer: 'Commencez par choisir un hack (LITM recommandé pour débuter), puis sélectionnez un univers. Créez ensuite un Playspace et vous pourrez accéder à la création de personnage avec l\'assistant guidé qui vous accompagnera étape par étape.'
  }
]

const openFAQ = ref<number | null>(null)

const toggleFAQ = (id: number) => {
  openFAQ.value = openFAQ.value === id ? null : id
}
</script>

<template>
  <section class="faq-section">
    <div class="container">
      <div class="section-header">
        <span class="section-subtitle">Aide</span>
        <h2 class="section-title">Questions fréquentes</h2>
        <p class="section-description">
          Tout ce que vous devez savoir pour bien démarrer avec Brumisa3
        </p>
      </div>

      <div class="faq-list">
        <div
          v-for="faq in faqs"
          :key="faq.id"
          class="faq-item"
          :class="{ open: openFAQ === faq.id }"
        >
          <button
            class="faq-question"
            @click="toggleFAQ(faq.id)"
            :aria-expanded="openFAQ === faq.id"
          >
            <span>{{ faq.question }}</span>
            <svg
              class="faq-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
          <div class="faq-answer">
            <p>{{ faq.answer }}</p>
          </div>
        </div>
      </div>

      <!-- CTA final -->
      <div class="cta-box">
        <p class="cta-text">Prêt à créer votre premier personnage ?</p>
        <NuxtLink to="/characters/new" class="cta-btn">
          <span>Commencer maintenant</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* SECTION FAQ - Style Otherscape */
.faq-section {
  padding: 8rem 2rem;
  background: var(--noir-profond);
}

.container {
  max-width: 90rem;
  margin: 0 auto;
}

.section-header {
  text-align: center;
  margin-bottom: 5rem;
}

.section-subtitle {
  color: var(--cyan-neon);
  font-size: 1.4rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3em;
  margin-bottom: 2rem;
  display: block;
}

.section-title {
  font-size: clamp(2.5rem, 4vw, 3.5rem);
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--blanc);
  margin-bottom: 1.5rem;
}

.section-description {
  color: var(--gris-clair);
  font-size: 1.6rem;
  line-height: 1.6;
}

/* FAQ List */
.faq-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 5rem;
}

.faq-item {
  background: var(--noir-card);
  border: 2px solid rgba(0, 217, 217, 0.2);
  overflow: hidden;
  transition: all 0.3s ease;
}

.faq-item:hover {
  border-color: rgba(0, 217, 217, 0.4);
}

.faq-item.open {
  border-color: var(--cyan-neon);
  box-shadow: var(--glow-cyan);
}

.faq-question {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem 2.5rem;
  background: transparent;
  border: none;
  color: var(--blanc);
  font-family: 'Assistant', sans-serif;
  font-size: 1.6rem;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
  transition: all 0.3s ease;
}

.faq-question:hover {
  color: var(--cyan-neon);
}

.faq-icon {
  width: 2rem;
  height: 2rem;
  color: var(--cyan-neon);
  transition: transform 0.3s ease;
  flex-shrink: 0;
}

.faq-item.open .faq-icon {
  transform: rotate(180deg);
}

.faq-answer {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease, padding 0.3s ease;
}

.faq-item.open .faq-answer {
  max-height: 30rem;
}

.faq-answer p {
  padding: 0 2.5rem 2rem;
  color: var(--gris-clair);
  font-size: 1.5rem;
  line-height: 1.8;
  margin: 0;
}

/* CTA Box */
.cta-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  padding: 4rem;
  background: linear-gradient(135deg, rgba(0, 217, 217, 0.1) 0%, rgba(157, 78, 221, 0.1) 100%);
  border: 1px solid rgba(0, 217, 217, 0.3);
  text-align: center;
}

.cta-text {
  font-size: 2rem;
  font-weight: 700;
  color: var(--blanc);
  margin: 0;
}

.cta-btn {
  display: inline-flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem 4rem;
  background: var(--cyan-neon);
  color: var(--noir-profond);
  font-weight: 800;
  font-size: 1.4rem;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: var(--glow-cyan);
}

.cta-btn:hover {
  transform: translateY(-3px);
  box-shadow: var(--glow-cyan-fort);
}

.cta-btn svg {
  width: 1.8rem;
  height: 1.8rem;
}

/* RESPONSIVE */
@media (max-width: 768px) {
  .faq-section {
    padding: 6rem 1rem;
  }

  .faq-question {
    padding: 1.5rem;
    font-size: 1.4rem;
  }

  .faq-answer p {
    padding: 0 1.5rem 1.5rem;
    font-size: 1.4rem;
  }

  .cta-box {
    padding: 3rem 2rem;
  }

  .cta-text {
    font-size: 1.8rem;
  }

  .cta-btn {
    padding: 1.2rem 3rem;
    font-size: 1.3rem;
  }
}
</style>
