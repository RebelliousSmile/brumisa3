<script setup lang="ts">
/**
 * Hacks Selection - Choix du hack/univers de jeu
 * Section avec tabs pour filtrer entre Mist Engine et City of Mist
 * Style Otherscape cyberpunk
 * Mode collapsed: résumé compact cliquable pour déplier
 */

import CreatePlayspaceModal from '~/components/playspace/CreatePlayspaceModal.vue'
import { getHackName, getUniverseDisplayName } from '#shared/config/systems.config'

// Props
const props = defineProps<{
  collapsed?: boolean
  activeHackName?: string
  activeUniverseName?: string
  isGM?: boolean
}>()

// Emit pour demander expansion
const emit = defineEmits<{
  expand: []
}>()

// État local pour expansion manuelle
const isExpanded = ref(false)

// Computed pour afficher le contenu complet
const showFullContent = computed(() => !props.collapsed || isExpanded.value)

// Noms lisibles pour le résumé (utilise systems.config)
const getHackDisplayName = (hackId: string | undefined): string => {
  if (!hackId) return 'Non défini'
  return getHackName(hackId)
}

const activeSystem = ref('mist-engine')

const switchSystem = (system: string) => {
  activeSystem.value = system
}

// Modal state
const isModalOpen = ref(false)
const selectedHackId = ref('')

const selectHack = (hackId: string) => {
  selectedHackId.value = hackId
  isModalOpen.value = true
}

const handleModalClose = () => {
  isModalOpen.value = false
}

const handlePlayspaceCreated = (playspaceId: string) => {
  // Retour a l'accueil avec le playspace
  navigateTo('/')
}

const handleExpand = () => {
  emit('expand')
}
</script>

<template>
  <section id="hacks" class="section" :class="{ 'section-collapsed': collapsed && !isExpanded }">
    <div class="container">
      <!-- Mode Replie - Resume compact (client-only pour eviter hydration mismatch) -->
      <ClientOnly>
        <Transition name="collapse">
          <div v-if="collapsed && !isExpanded" class="collapsed-summary">
            <div class="summary-content">
              <div class="summary-badge">
                <Icon name="heroicons:check-circle" class="summary-icon" />
                <span>PLAYSPACE ACTIF</span>
              </div>
              <div class="summary-info">
                <span class="summary-hack">{{ getHackDisplayName(activeHackName) }}</span>
                <span class="summary-separator">/</span>
                <span class="summary-universe">{{ getUniverseDisplayName(activeUniverseName) }}</span>
              </div>
              <div class="summary-role">
                <span v-if="isGM" class="role-indicator mj">MJ - Dangers</span>
                <span v-else class="role-indicator pj">PJ - Personnages</span>
              </div>
            </div>
          </div>
        </Transition>
      </ClientOnly>

      <!-- Contenu Complet (visible si pas replie ou si expandu) -->
      <ClientOnly>
        <Transition name="expand">
          <div v-if="showFullContent">
          <!-- Header -->
          <div class="section-header">
            <span class="section-subtitle">Étape 1</span>
            <h2 class="section-title">Choisissez votre système</h2>
            <p class="section-description">
              Chaque système propose des mécaniques de jeu et des univers uniques.
              Sélectionnez celui qui correspond à votre style de jeu pour créer votre premier Playspace.
            </p>
            <!-- Bouton replier si on a expandu manuellement -->
            <button v-if="collapsed && isExpanded" class="collapse-btn" type="button" @click="isExpanded = false">
              <Icon name="heroicons:chevron-up" />
              <span>Replier</span>
            </button>
          </div>

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

          <!-- Conteneur Mist Engine -->
          <Transition name="fade">
            <div v-if="activeSystem === 'mist-engine'" class="products-grid">
              <!-- Hack LITM -->
              <article class="product-card" @click="selectHack('litm')">
                <div class="product-image">
                  <span class="product-badge">OFFICIEL</span>
                </div>
                <div class="product-content">
                  <div class="product-category">Mist Engine</div>
                  <h3 class="product-title">Legends in the Mist</h3>
                  <p class="product-description">
                    Système complet avec Theme Cards (identité, pouvoir, faiblesse), Hero Card et Trackers.
                    Idéal pour des récits héroïques et épiques.
                  </p>
                  <div class="product-footer">
                    <div class="product-meta">4 univers disponibles</div>
                    <button class="btn product-btn">
                      <span>Créer un Playspace</span>
                    </button>
                  </div>
                </div>
              </article>

              <!-- Hack Otherscape -->
              <article class="product-card otherscape" @click="selectHack('otherscape')">
                <div class="product-image">
                  <span class="product-badge violet">OFFICIEL</span>
                </div>
                <div class="product-content">
                  <div class="product-category violet">Mist Engine</div>
                  <h3 class="product-title">Tokyo:Otherscape</h3>
                  <p class="product-description">
                    Hack cyberpunk japonais. Mégapoles futuristes, technologie mystique
                    et identités fragmentées dans un Tokyo alternatif.
                  </p>
                  <div class="product-footer">
                    <div class="product-meta">2 univers disponibles</div>
                    <button class="btn product-btn violet">
                      <span>Créer un Playspace</span>
                    </button>
                  </div>
                </div>
              </article>
            </div>
          </Transition>

          <!-- Conteneur City of Mist -->
          <Transition name="fade">
            <div v-if="activeSystem === 'city-of-mist'" class="products-grid">
              <!-- Hack City of Mist -->
              <article class="product-card city-of-mist" @click="selectHack('city-of-mist')">
                <div class="product-image">
                  <span class="product-badge rose">OFFICIEL</span>
                </div>
                <div class="product-content">
                  <div class="product-category rose">City of Mist</div>
                  <h3 class="product-title">City of Mist</h3>
                  <p class="product-description">
                    Le système original avec Mythos, Logos et spectrum d'identité.
                    Enquêtes urbaines, mystères et identités mythologiques fragmentées
                    dans une ville brumeuse où les légendes prennent vie.
                  </p>
                  <div class="product-footer">
                    <div class="product-meta">2 univers disponibles</div>
                    <button class="btn product-btn rose">
                      <span>Créer un Playspace</span>
                    </button>
                  </div>
                </div>
              </article>
            </div>
          </Transition>

          <!-- Info box -->
          <div class="info-box">
            <div class="info-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4M12 8h.01" />
              </svg>
            </div>
            <div class="info-content">
              <h4>Qu'est-ce qu'un Playspace ?</h4>
              <p>
                Un Playspace est un ensemble de règles d'un système du Mist Engine (LITM, Otherscape, City of Mist).
                Il contient les types de thèmes, moves et mécaniques nécessaires pour créer vos personnages et dangers.
              </p>
            </div>
          </div>
        </div>
        </Transition>
      </ClientOnly>
    </div>

    <!-- Modal de création -->
    <CreatePlayspaceModal
      :is-open="isModalOpen"
      :preselected-hack-id="selectedHackId"
      @close="handleModalClose"
      @created="handlePlayspaceCreated"
    />
  </section>
</template>

<style scoped>
/* SECTION */
.section {
  padding: 8rem 2rem;
  position: relative;
  background: var(--noir-profond);
}

.container {
  max-width: 140rem;
  margin: 0 auto;
}

/* HEADER */
.section-header {
  text-align: center;
  margin-bottom: 6rem;
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
  font-size: clamp(2.5rem, 4vw, 4.5rem);
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: var(--blanc);
  margin-bottom: 3rem;
}

.section-description {
  color: var(--gris-clair);
  font-size: 1.6rem;
  line-height: 1.8;
  max-width: 90rem;
  margin: 0 auto;
}

/* TABS OTHERSCAPE STYLE - Minimaliste */
.tabs-container {
  display: flex;
  justify-content: center;
  margin-bottom: 4rem;
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
  margin-bottom: 4rem;
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

/* Variantes couleurs */
.product-card.otherscape {
  border-color: rgba(157, 78, 221, 0.3);
}
.product-card.otherscape::before {
  background: linear-gradient(135deg, transparent 0%, rgba(157, 78, 221, 0.1) 100%);
}
.product-card.otherscape:hover {
  border-color: var(--violet-neon);
  box-shadow: 0 0 30px rgba(157, 78, 221, 0.4);
}

.product-card.city-of-mist {
  border-color: rgba(255, 45, 85, 0.3);
}
.product-card.city-of-mist::before {
  background: linear-gradient(135deg, transparent 0%, rgba(255, 45, 85, 0.1) 100%);
}
.product-card.city-of-mist:hover {
  border-color: var(--rose-neon);
  box-shadow: 0 0 30px rgba(255, 45, 85, 0.4);
}

.product-image {
  width: 100%;
  height: 20rem;
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

.product-badge.violet {
  background: var(--violet-neon);
  color: var(--blanc);
}

.product-badge.rose {
  background: var(--rose-neon);
  color: var(--blanc);
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

.product-category.violet {
  color: var(--violet-neon);
}

.product-category.rose {
  color: var(--rose-neon);
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

.product-meta {
  font-size: 1.4rem;
  color: var(--gris-clair);
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

.btn.violet {
  background: var(--violet-neon);
  border-color: var(--violet-neon);
  color: var(--blanc);
  box-shadow: 0 0 15px rgba(157, 78, 221, 0.3);
}

.btn.violet:hover {
  box-shadow: 0 0 25px rgba(157, 78, 221, 0.5);
}

.btn.rose {
  background: var(--rose-neon);
  border-color: var(--rose-neon);
  color: var(--blanc);
  box-shadow: 0 0 15px rgba(255, 45, 85, 0.3);
}

.btn.rose:hover {
  box-shadow: 0 0 25px rgba(255, 45, 85, 0.5);
}

.btn span {
  position: relative;
  z-index: 1;
}

/* INFO BOX */
.info-box {
  display: flex;
  gap: 2rem;
  padding: 2.5rem;
  background: rgba(0, 217, 217, 0.05);
  border: 1px solid rgba(0, 217, 217, 0.3);
}

.info-icon {
  flex-shrink: 0;
  width: 4rem;
  height: 4rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.info-icon svg {
  width: 3rem;
  height: 3rem;
  color: var(--cyan-neon);
}

.info-content h4 {
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--blanc);
  margin-bottom: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.info-content p {
  color: var(--gris-clair);
  font-size: 1.4rem;
  line-height: 1.7;
  margin: 0;
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

/* MODE REPLIE */
.section-collapsed {
  padding: 2rem;
}

.collapsed-summary {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem 3rem;
  background: rgba(0, 217, 217, 0.08);
  border: 2px solid rgba(0, 217, 217, 0.4);
  transition: all 0.3s ease;
}


.summary-content {
  display: flex;
  align-items: center;
  gap: 3rem;
}

.summary-badge {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.6rem 1.5rem;
  background: var(--cyan-neon);
  color: var(--noir-profond);
  font-size: 1.1rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.summary-icon {
  width: 1.6rem;
  height: 1.6rem;
}

.summary-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.summary-hack {
  font-size: 1.8rem;
  font-weight: 800;
  color: var(--blanc);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.summary-separator {
  color: rgba(0, 217, 217, 0.5);
  font-size: 1.6rem;
}

.summary-universe {
  font-size: 1.4rem;
  font-weight: 600;
  color: var(--gris-clair);
}

.summary-role {
  display: flex;
  gap: 2rem;
  margin-left: 2rem;
  padding-left: 2rem;
  border-left: 1px solid rgba(0, 217, 217, 0.3);
}

.role-indicator {
  font-size: 1.2rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.role-indicator.pj {
  color: var(--cyan-neon);
}

.role-indicator.mj {
  color: #ffaa44;
}


.collapse-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 2rem;
  padding: 0.8rem 1.5rem;
  background: transparent;
  border: 1px solid rgba(0, 217, 217, 0.3);
  color: var(--cyan-neon);
  font-family: 'Assistant', sans-serif;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.collapse-btn:hover {
  background: rgba(0, 217, 217, 0.1);
  border-color: var(--cyan-neon);
}

.collapse-btn svg {
  width: 1.2rem;
  height: 1.2rem;
}

/* Transitions expand/collapse */
.collapse-enter-active,
.collapse-leave-active {
  transition: all 0.3s ease;
}

.collapse-enter-from,
.collapse-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.4s ease;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
  overflow: hidden;
}

/* RESPONSIVE */
@media (max-width: 768px) {
  .section {
    padding: 6rem 1rem;
  }

  .section-collapsed {
    padding: 1rem;
  }

  .collapsed-summary {
    flex-direction: column;
    gap: 1.5rem;
    padding: 1.5rem;
  }

  .summary-content {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .summary-hack {
    font-size: 1.4rem;
  }

  .summary-role {
    margin-left: 0;
    padding-left: 0;
    border-left: none;
    justify-content: center;
    gap: 1.5rem;
  }

  .role-indicator {
    font-size: 1rem;
  }

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

  .info-box {
    flex-direction: column;
    gap: 1.5rem;
    text-align: center;
  }

  .info-icon {
    margin: 0 auto;
  }
}
</style>
