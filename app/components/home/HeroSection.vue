<script setup lang="ts">
/**
 * Hero Section - Style Otherscape Cyberpunk
 * Section hero avec titre principal, sous-titre et slider nouveautes
 */

// Nouveautes du site (a terme: depuis API ou CMS)
const news = ref([
  {
    id: 1,
    date: '2026-01-02',
    title: 'Nouvelle navigation MVP',
    description: '4 outils principaux : Personnages, Trackers, Dangers et Actions',
    image: '/images/news/navigation-mvp.webp',
    icon: 'heroicons:squares-2x2'
  },
  {
    id: 2,
    date: '2026-01-02',
    title: 'Collection de Dangers',
    description: 'Base de donnees des menaces et adversaires Mist Engine disponible',
    image: '/images/news/dangers.webp',
    icon: 'heroicons:exclamation-triangle'
  },
  {
    id: 3,
    date: '2026-01-02',
    title: 'Action Database',
    description: 'Consultez les actions JDR reinterpretees pour le Mist Engine',
    image: '/images/news/actions.webp',
    icon: 'heroicons:bolt'
  },
  {
    id: 4,
    date: '2025-12-15',
    title: 'Support Legends in the Mist',
    description: 'Creation de personnages LITM avec Theme Cards et Hero Card',
    image: '/images/news/litm.webp',
    icon: 'heroicons:user-group'
  }
])

// Slider state
const currentSlide = ref(0)
const isAutoPlaying = ref(true)
let autoPlayInterval: ReturnType<typeof setInterval> | null = null

// Navigation
function nextSlide() {
  currentSlide.value = (currentSlide.value + 1) % news.value.length
}

function prevSlide() {
  currentSlide.value = (currentSlide.value - 1 + news.value.length) % news.value.length
}

function goToSlide(index: number) {
  currentSlide.value = index
}

// Auto-play
function startAutoPlay() {
  if (autoPlayInterval) clearInterval(autoPlayInterval)
  autoPlayInterval = setInterval(() => {
    if (isAutoPlaying.value) nextSlide()
  }, 5000)
}

function pauseAutoPlay() {
  isAutoPlaying.value = false
}

function resumeAutoPlay() {
  isAutoPlaying.value = true
}

// Lifecycle
onMounted(() => {
  startAutoPlay()
})

onUnmounted(() => {
  if (autoPlayInterval) clearInterval(autoPlayInterval)
})
</script>

<template>
  <section class="hero-section">
    <div class="hero-content">
      <!-- News Slider -->
      <div
        class="news-slider"
        @mouseenter="pauseAutoPlay"
        @mouseleave="resumeAutoPlay"
      >
        <div class="slider-header">
          <span class="slider-label">Nouveautes</span>
          <div class="slider-nav">
            <button class="nav-btn" @click="prevSlide" aria-label="Precedent">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button class="nav-btn" @click="nextSlide" aria-label="Suivant">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>

        <div class="slider-viewport">
          <TransitionGroup name="slide">
            <div
              v-for="(item, index) in news"
              v-show="index === currentSlide"
              :key="item.id"
              class="slide-item"
            >
              <!-- Gauche/Centre : Image + CTA -->
              <div class="slide-left">
                <div class="slide-image">
                  <img
                    v-if="item.image"
                    :src="item.image"
                    :alt="item.title"
                    @error="($event.target as HTMLImageElement).style.display = 'none'"
                  />
                  <div class="slide-icon-fallback">
                    <Icon :name="item.icon || 'heroicons:newspaper'" class="icon" />
                  </div>
                </div>
                <NuxtLink to="/characters" class="slide-cta">
                  <span>Decouvrir</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </NuxtLink>
              </div>

              <!-- Droite : Texte -->
              <div class="slide-content">
                <span class="slide-date">{{ item.date }}</span>
                <h3 class="slide-title">{{ item.title }}</h3>
                <p class="slide-description">{{ item.description }}</p>
              </div>
            </div>
          </TransitionGroup>
        </div>

        <!-- Dots -->
        <div class="slider-dots">
          <button
            v-for="(item, index) in news"
            :key="item.id"
            class="dot"
            :class="{ active: index === currentSlide }"
            @click="goToSlide(index)"
            :aria-label="`Aller a la nouveaute ${index + 1}`"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* HERO SECTION - News Only */
.hero-section {
  padding: 10rem 2rem 2rem;
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
  width: 100%;
  max-width: 140rem;
  margin: 0 auto;
  padding: 0 2rem;
}

/* NEWS SLIDER CYBERPUNK */
.news-slider {
  width: 100%;
  background: rgba(0, 217, 217, 0.05);
  border: 1px solid rgba(0, 217, 217, 0.3);
  border-radius: 1.2rem;
  padding: 3rem 4rem;
  position: relative;
  overflow: hidden;
}

.news-slider::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, transparent, var(--cyan-neon), transparent);
  animation: scan-line 3s ease-in-out infinite;
}

@keyframes scan-line {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}

.slider-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(0, 217, 217, 0.2);
}

.slider-label {
  color: var(--cyan-neon);
  font-size: 1.4rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.2em;
}

.slider-nav {
  display: flex;
  gap: 0.5rem;
}

.nav-btn {
  width: 3.2rem;
  height: 3.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid rgba(0, 217, 217, 0.4);
  color: var(--cyan-neon);
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 0.4rem;
}

.nav-btn:hover {
  background: rgba(0, 217, 217, 0.2);
  border-color: var(--cyan-neon);
  box-shadow: 0 0 10px rgba(0, 217, 217, 0.3);
}

.nav-btn svg {
  width: 1.6rem;
  height: 1.6rem;
}

.slider-viewport {
  height: 22rem;
  position: relative;
  overflow: hidden;
}

.slide-item {
  display: flex;
  gap: 4rem;
  align-items: stretch;
  height: 22rem;
  position: absolute;
  inset: 0;
}

/* Partie gauche : Image + CTA */
.slide-left {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  flex-shrink: 0;
  width: 45%;
}

/* Image container */
.slide-image {
  flex: 1;
  border-radius: 0.8rem;
  overflow: hidden;
  position: relative;
  background: rgba(0, 217, 217, 0.1);
  border: 1px solid rgba(0, 217, 217, 0.2);
}

.slide-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.slide-icon-fallback {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(0, 217, 217, 0.1) 0%, rgba(157, 78, 221, 0.1) 100%);
}

.slide-icon-fallback .icon {
  width: 6rem;
  height: 6rem;
  color: var(--cyan-neon);
  opacity: 0.6;
}

.slide-image img + .slide-icon-fallback {
  display: none;
}

/* CTA Button */
.slide-cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 1.2rem 2.5rem;
  background: var(--cyan-neon);
  color: var(--noir-profond);
  font-weight: 700;
  font-size: 1.3rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  text-decoration: none;
  border-radius: 0.4rem;
  transition: all 0.3s ease;
  box-shadow: 0 0 15px rgba(0, 217, 217, 0.3);
}

.slide-cta:hover {
  background: var(--cyan-hover);
  box-shadow: 0 0 25px rgba(0, 217, 217, 0.5);
  transform: translateY(-2px);
}

.slide-cta svg {
  width: 1.6rem;
  height: 1.6rem;
}

/* Partie droite : Texte */
.slide-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: left;
}

.slide-date {
  color: var(--gris-clair);
  font-size: 1.2rem;
  font-variant-numeric: tabular-nums;
  margin-bottom: 1rem;
}

.slide-title {
  font-size: 2.4rem;
  font-weight: 700;
  color: var(--blanc);
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.slide-description {
  font-size: 1.6rem;
  color: var(--gris-clair);
  line-height: 1.6;
  margin: 0;
}

.slider-dots {
  display: flex;
  justify-content: center;
  gap: 0.8rem;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(0, 217, 217, 0.2);
}

.dot {
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  background: rgba(0, 217, 217, 0.3);
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.dot:hover {
  background: rgba(0, 217, 217, 0.6);
}

.dot.active {
  background: var(--cyan-neon);
  box-shadow: 0 0 10px var(--cyan-neon);
  transform: scale(1.2);
}

/* Slide Transitions */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.4s ease;
}

.slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* RESPONSIVE */
@media (max-width: 1024px) {
  .slide-item {
    gap: 2rem;
  }

  .slide-left {
    width: 40%;
  }

  .slide-title {
    font-size: 2rem;
  }
}

@media (max-width: 768px) {
  .hero-section {
    padding: 10rem 1rem 2rem;
  }

  .hero-content {
    padding: 0 1rem;
  }

  .news-slider {
    padding: 2rem 1.5rem;
  }

  .slider-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .slider-nav {
    align-self: flex-end;
  }

  .slider-viewport {
    height: auto;
    min-height: 32rem;
  }

  .slide-item {
    flex-direction: column;
    gap: 1.5rem;
    height: auto;
    min-height: 32rem;
    position: relative;
  }

  .slide-left {
    width: 100%;
    flex-direction: row;
    gap: 1rem;
  }

  .slide-image {
    flex: 1;
    height: 12rem;
  }

  .slide-cta {
    align-self: stretch;
    padding: 1rem 1.5rem;
    font-size: 1.2rem;
    writing-mode: vertical-rl;
    text-orientation: mixed;
  }

  .slide-cta svg {
    transform: rotate(90deg);
  }

  .slide-icon-fallback .icon {
    width: 4rem;
    height: 4rem;
  }

  .slide-content {
    flex: 1;
    text-align: center;
  }

  .slide-title {
    font-size: 1.8rem;
  }

  .slide-description {
    font-size: 1.4rem;
  }
}

@media (max-width: 480px) {
  .news-slider {
    padding: 1.5rem 1rem;
  }

  .slider-viewport {
    min-height: 28rem;
  }

  .slide-item {
    min-height: 28rem;
  }

  .slide-left {
    flex-direction: column;
  }

  .slide-image {
    height: 10rem;
  }

  .slide-cta {
    writing-mode: horizontal-tb;
    text-orientation: initial;
    width: 100%;
  }

  .slide-cta svg {
    transform: none;
  }

  .slide-title {
    font-size: 1.6rem;
  }

  .slide-description {
    font-size: 1.3rem;
  }
}
</style>
