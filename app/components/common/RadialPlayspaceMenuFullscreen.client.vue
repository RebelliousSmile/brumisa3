<script setup lang="ts">
/**
 * Menu Radial Playspaces - Version Fullscreen Cyberpunk v2
 *
 * Design concentrique :
 * - Centre : Bouton "+" (nouveau playspace)
 * - Cercle interieur : 3 infos (Systeme, Hack, Univers) du playspace actif
 * - Cercle exterieur : Playspaces existants
 */

import CreatePlayspaceModal from '~/components/playspace/CreatePlayspaceModal.vue'
import { MAX_PLAYSPACES } from '#shared/stores/playspace'

interface PlayspaceDisplay {
  id: string
  name: string
  role: 'MJ' | 'PJ'
  hackId: string
  universeId: string | null
  systemName: string
  hackName: string
  universeName: string
  isActive: boolean
  isLocal: boolean
}

// State
const isOpen = ref(false)
const isModalOpen = ref(false)

// Store
const playspaceStore = usePlayspaceStore()

// Limite atteinte
const isLimitReached = computed(() => playspaceStore.isMaxPlayspacesReached)

// Noms complets pour les bulles d'info
const getSystemName = (hackId: string): string => {
  switch (hackId) {
    case 'litm':
    case 'otherscape':
      return 'Mist Engine'
    case 'city-of-mist':
      return 'City of Mist'
    default:
      return 'Inconnu'
  }
}

const getHackName = (hackId: string): string => {
  switch (hackId) {
    case 'litm':
      return 'Legends in the Mist'
    case 'otherscape':
      return 'Otherscape'
    case 'city-of-mist':
      return 'City of Mist'
    default:
      return hackId
  }
}

const getUniverseName = (universeId: string | null): string => {
  if (!universeId) return 'Par defaut'
  const nameMap: Record<string, string> = {
    'obojima': 'Obojima',
    'litm-custom': 'Personnalise',
    'tokyo-otherscape': 'Tokyo',
    'otherscape-custom': 'Personnalise',
    'the-city': 'The City',
    'city-of-mist-custom': 'Personnalise'
  }
  return nameMap[universeId] || universeId
}

// Computed
const displayPlayspaces = computed<PlayspaceDisplay[]>(() => {
  return playspaceStore.allPlayspaces.map(p => ({
    id: p.id,
    name: p.name,
    role: p.isGM ? 'MJ' : 'PJ',
    hackId: p.hackId,
    universeId: p.universeId,
    systemName: getSystemName(p.hackId),
    hackName: getHackName(p.hackId),
    universeName: getUniverseName(p.universeId),
    isActive: playspaceStore.activePlayspaceId === p.id,
    isLocal: p.id.startsWith('local_')
  }))
})

// Playspace survole (pour afficher ses infos)
const hoveredPlayspaceId = ref<string | null>(null)

// Playspace a afficher dans les infos (survole > actif > premier)
const displayedPlayspace = computed(() => {
  if (hoveredPlayspaceId.value) {
    return displayPlayspaces.value.find(p => p.id === hoveredPlayspaceId.value)
  }
  const active = displayPlayspaces.value.find(p => p.isActive)
  if (active) return active
  // Fallback: premier playspace disponible
  return displayPlayspaces.value[0] || null
})

const totalCount = computed(() => displayPlayspaces.value.length)

// Position cercle interieur (3 infos) - rayon 15vh (sur le cercle guide-inner de 30vh)
function getInfoPosition(index: number): { left: string; top: string } {
  const startAngle = -90 // Commence en haut
  const angleStep = 120 // 360 / 3
  const angle = startAngle + angleStep * index

  const radiusVh = 15 // vh - rayon du cercle interieur
  const radian = (angle * Math.PI) / 180

  // Position en vh depuis le centre de l'ecran
  const x = Math.cos(radian) * radiusVh
  const y = Math.sin(radian) * radiusVh

  return {
    left: `calc(50% + ${x}vh)`,
    top: `calc(50% + ${y}vh)`
  }
}

// Position cercle exterieur (playspaces) - rayon 32vh (sur le cercle guide-outer de 64vh)
function getPlayspacePosition(index: number, total: number): { left: string; top: string; delay: string } {
  const startAngle = -90 // Commence en haut
  const angleStep = total > 0 ? 360 / total : 360
  const angle = startAngle + angleStep * index

  const radiusVh = 32 // vh - rayon du cercle exterieur
  const radian = (angle * Math.PI) / 180

  const x = Math.cos(radian) * radiusVh
  const y = Math.sin(radian) * radiusVh

  return {
    left: `calc(50% + ${x}vh)`,
    top: `calc(50% + ${y}vh)`,
    delay: `${index * 60}ms`
  }
}

// Handlers
function toggleMenu() {
  isOpen.value = !isOpen.value
}

function closeMenu() {
  isOpen.value = false
}

function selectPlayspace(id: string) {
  playspaceStore.switchPlayspace(id)
  closeMenu()
  // Retour a l'accueil avec le playspace selectionne
  navigateTo('/')
}

function openCreateModal() {
  isModalOpen.value = true
}

function handlePlayspaceCreated(playspaceId: string) {
  isModalOpen.value = false
  closeMenu()
  // Retour a l'accueil avec le playspace selectionne
  navigateTo('/')
}

// Keyboard
function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && isOpen.value) {
    closeMenu()
  }
}

onMounted(() => {
  playspaceStore.init()
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div class="radial-menu-fullscreen">
    <!-- Orbe Declencheur -->
    <button
      type="button"
      class="orb-trigger"
      :class="{ 'is-active': isOpen }"
      aria-label="Ouvrir le selecteur de playspace"
      :aria-expanded="isOpen"
      @click="toggleMenu"
    >
      <div class="orb-inner">
        <Icon name="heroicons:squares-2x2" class="orb-icon" />
      </div>
      <div class="orb-ring"></div>

      <span v-if="totalCount > 0" class="orb-badge">
        {{ totalCount }}
      </span>
    </button>

    <!-- Overlay Fullscreen -->
    <Teleport to="body">
      <Transition name="overlay">
        <div
          v-if="isOpen"
          class="cyber-overlay"
          role="dialog"
          aria-modal="true"
          @click.self="closeMenu"
        >
          <!-- Background Effects -->
          <div class="bg-grid" aria-hidden="true"></div>
          <div class="bg-scanlines" aria-hidden="true"></div>
          <div class="bg-vignette" aria-hidden="true"></div>

          <!-- Cercles guides -->
          <div class="guide-circle guide-inner" aria-hidden="true"></div>
          <div class="guide-circle guide-outer" aria-hidden="true"></div>

          <!-- HUB CENTRAL - Bouton + -->
          <button
            type="button"
            class="center-hub"
            :class="{ 'is-disabled': isLimitReached }"
            :aria-label="isLimitReached ? 'Limite atteinte' : 'Nouveau playspace'"
            :disabled="isLimitReached"
            @click="!isLimitReached && openCreateModal()"
          >
            <div class="hub-glow"></div>
            <div class="hub-content">
              <Icon :name="isLimitReached ? 'heroicons:lock-closed' : 'heroicons:plus'" class="hub-icon" />
              <span class="hub-label">{{ isLimitReached ? `${MAX_PLAYSPACES}/${MAX_PLAYSPACES}` : 'NOUVEAU' }}</span>
            </div>
          </button>

          <!-- CERCLE INTERIEUR - 3 Infos (Systeme, Hack, Univers) - visible au survol -->
          <div class="info-ring" :class="{ 'is-visible': hoveredPlayspaceId !== null }">
            <!-- Systeme -->
            <div
              class="info-node"
              :class="{ 'has-data': displayedPlayspace }"
              :style="getInfoPosition(0)"
            >
              <span class="info-label">Systeme</span>
              <span class="info-value">{{ displayedPlayspace?.systemName || '--' }}</span>
            </div>

            <!-- Hack -->
            <div
              class="info-node"
              :class="{ 'has-data': displayedPlayspace }"
              :style="getInfoPosition(1)"
            >
              <span class="info-label">Hack</span>
              <span class="info-value">{{ displayedPlayspace?.hackName || '--' }}</span>
            </div>

            <!-- Univers -->
            <div
              class="info-node"
              :class="{ 'has-data': displayedPlayspace }"
              :style="getInfoPosition(2)"
            >
              <span class="info-label">Univers</span>
              <span class="info-value">{{ displayedPlayspace?.universeName || '--' }}</span>
            </div>
          </div>

          <!-- CERCLE EXTERIEUR - Playspaces -->
          <TransitionGroup name="node" tag="div" class="playspace-ring">
            <button
              v-for="(ps, index) in displayPlayspaces"
              :key="ps.id"
              type="button"
              class="playspace-node"
              :class="{
                'is-active': ps.isActive,
                'is-mj': ps.role === 'MJ',
                'is-hovered': hoveredPlayspaceId === ps.id
              }"
              :style="{
                left: getPlayspacePosition(index, displayPlayspaces.length).left,
                top: getPlayspacePosition(index, displayPlayspaces.length).top,
                animationDelay: getPlayspacePosition(index, displayPlayspaces.length).delay
              }"
              :aria-label="`Ouvrir ${ps.name}`"
              @click="selectPlayspace(ps.id)"
              @mouseenter="hoveredPlayspaceId = ps.id"
              @mouseleave="hoveredPlayspaceId = null"
            >
              <div class="node-glow"></div>
              <div class="node-content">
                <span class="node-role">{{ ps.role }}</span>
              </div>
              <span class="node-name">{{ ps.name }}</span>
            </button>

          </TransitionGroup>

          <!-- Titre -->
          <div class="overlay-title">
            <span class="title-line"></span>
            <span class="title-text">PLAYSPACE SELECT</span>
            <span class="title-line"></span>
          </div>

          <!-- Bouton Fermer -->
          <button type="button" class="close-btn" @click="closeMenu">
            <Icon name="heroicons:x-mark" />
            <span>ESC</span>
          </button>
        </div>
      </Transition>
    </Teleport>

    <!-- Modal Creation -->
    <CreatePlayspaceModal
      :is-open="isModalOpen"
      @close="isModalOpen = false"
      @created="handlePlayspaceCreated"
    />
  </div>
</template>

<style scoped>
/* ===== VARIABLES - Palette 3 couleurs ===== */
.radial-menu-fullscreen {
  --color-primary: #00d9d9;      /* Cyan - PJ, elements principaux */
  --color-primary-bright: #00ffff;
  --color-secondary: #ffaa44;    /* Or/Ambre - MJ */
  --color-secondary-bright: #ffcc66;
  --color-tertiary: #ffffff;     /* Blanc - textes, accents */
  --color-tertiary-dim: #aaaaaa;
  --color-dark: #0a0a0a;
  --color-dark-mid: #1a1a1a;
}

/* ===== ORB TRIGGER ===== */
.orb-trigger {
  position: fixed;
  bottom: 2rem;
  left: 2rem;
  width: 4rem;
  height: 4rem;
  z-index: 100;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
}

.orb-inner {
  position: absolute;
  inset: 10%;
  background: linear-gradient(135deg, var(--color-primary) 0%, #007a7a 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 25px rgba(0, 217, 217, 0.6);
  transition: all 0.3s ease;
}

.orb-trigger:hover .orb-inner {
  transform: scale(1.1);
  box-shadow: 0 0 40px rgba(0, 255, 255, 0.8);
}

.orb-trigger.is-active .orb-inner {
  background: linear-gradient(135deg, var(--color-primary-bright) 0%, var(--color-primary) 100%);
  box-shadow: 0 0 40px rgba(0, 255, 255, 0.9);
}

.orb-icon {
  width: 1.5rem;
  height: 1.5rem;
  color: #051515;
}

.orb-trigger.is-active .orb-icon {
  color: #051515;
  transform: rotate(45deg);
}

.orb-ring {
  position: absolute;
  inset: 0;
  border: 2px solid var(--color-primary);
  border-radius: 50%;
  opacity: 0.4;
  animation: ring-pulse 2s ease-in-out infinite;
}

.orb-trigger.is-active .orb-ring {
  border-color: var(--color-primary-bright);
  opacity: 0.6;
}

@keyframes ring-pulse {
  0%, 100% { transform: scale(1); opacity: 0.4; }
  50% { transform: scale(1.2); opacity: 0.2; }
}

.orb-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 1.25rem;
  height: 1.25rem;
  background: var(--color-secondary);
  border-radius: 50%;
  font-size: 0.7rem;
  font-weight: 800;
  color: #1a1000;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 10px rgba(255, 170, 68, 0.6);
}

/* ===== OVERLAY ===== */
.cyber-overlay {
  position: fixed;
  inset: 0;
  z-index: 99;
  background: rgba(5, 5, 5, 0.98);
  backdrop-filter: blur(10px);
  overflow: hidden;
}

/* Background effects */
.bg-grid {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(90deg, rgba(0, 217, 217, 0.03) 1px, transparent 1px),
    linear-gradient(0deg, rgba(0, 217, 217, 0.03) 1px, transparent 1px);
  background-size: 3rem 3rem;
  animation: grid-move 30s linear infinite;
}

@keyframes grid-move {
  0% { transform: translate(0, 0); }
  100% { transform: translate(3rem, 3rem); }
}

.bg-scanlines {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent 0px,
    transparent 2px,
    rgba(0, 217, 217, 0.02) 2px,
    rgba(0, 217, 217, 0.02) 4px
  );
  pointer-events: none;
}

.bg-vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, transparent 30%, rgba(0, 0, 0, 0.7) 100%);
  pointer-events: none;
}

/* Guide circles - cercles neon lumineux */
.guide-circle {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  pointer-events: none;
}

.guide-inner {
  width: 30vh;
  height: 30vh;
  border: 2px solid rgba(0, 217, 217, 0.5);
  box-shadow:
    0 0 15px rgba(0, 217, 217, 0.4),
    0 0 30px rgba(0, 217, 217, 0.2),
    inset 0 0 15px rgba(0, 217, 217, 0.1);
  animation: neon-pulse-cyan 4s ease-in-out infinite 2s;
}

.guide-outer {
  width: 64vh;
  height: 64vh;
  border: 2px solid rgba(0, 217, 217, 0.6);
  box-shadow:
    0 0 10px rgba(0, 217, 217, 0.4),
    0 0 25px rgba(0, 217, 217, 0.2),
    inset 0 0 10px rgba(0, 217, 217, 0.1);
  animation: neon-pulse-cyan 4s ease-in-out infinite;
}

@keyframes neon-pulse-cyan {
  0%, 100% {
    box-shadow:
      0 0 10px rgba(0, 217, 217, 0.5),
      0 0 20px rgba(0, 217, 217, 0.3),
      0 0 40px rgba(0, 217, 217, 0.2),
      inset 0 0 10px rgba(0, 217, 217, 0.2),
      inset 0 0 20px rgba(0, 217, 217, 0.1);
  }
  50% {
    box-shadow:
      0 0 15px rgba(0, 217, 217, 0.7),
      0 0 30px rgba(0, 217, 217, 0.5),
      0 0 60px rgba(0, 217, 217, 0.3),
      inset 0 0 15px rgba(0, 217, 217, 0.3),
      inset 0 0 30px rgba(0, 217, 217, 0.15);
  }
}

@keyframes neon-pulse-violet {
  0%, 100% {
    box-shadow:
      0 0 10px rgba(155, 89, 182, 0.5),
      0 0 20px rgba(155, 89, 182, 0.3),
      0 0 40px rgba(155, 89, 182, 0.2),
      inset 0 0 10px rgba(155, 89, 182, 0.2),
      inset 0 0 20px rgba(155, 89, 182, 0.1);
  }
  50% {
    box-shadow:
      0 0 15px rgba(155, 89, 182, 0.7),
      0 0 30px rgba(155, 89, 182, 0.5),
      0 0 60px rgba(155, 89, 182, 0.3),
      inset 0 0 15px rgba(155, 89, 182, 0.3),
      inset 0 0 30px rgba(155, 89, 182, 0.15);
  }
}

/* ===== HUB CENTRAL ===== */
.center-hub {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 20;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: transform 0.3s ease;
}

.center-hub:hover {
  transform: translate(-50%, -50%) scale(1.1);
}

.center-hub:hover .hub-content {
  border-color: #00ffff;
  border-style: solid;
  box-shadow:
    0 0 30px rgba(0, 255, 255, 0.7),
    0 0 60px rgba(0, 217, 217, 0.4),
    inset 0 0 30px rgba(0, 255, 255, 0.2);
}

.center-hub:hover .hub-icon {
  transform: rotate(90deg);
  color: #00ffff;
}

.center-hub:hover .hub-label {
  color: #00ffff;
}

/* Hub desactive (limite atteinte) */
.center-hub.is-disabled {
  cursor: not-allowed;
}

.center-hub.is-disabled .hub-content {
  border-color: #666666;
  border-style: dashed;
  background: linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%);
  box-shadow:
    0 0 10px rgba(100, 100, 100, 0.2),
    inset 0 0 10px rgba(100, 100, 100, 0.1);
}

.center-hub.is-disabled .hub-icon {
  color: #666666;
}

.center-hub.is-disabled .hub-label {
  color: #666666;
  text-shadow: none;
}

.center-hub.is-disabled .hub-glow {
  opacity: 0.2;
}

.center-hub.is-disabled:hover .hub-content {
  border-color: #888888;
  transform: none;
}

.hub-glow {
  position: absolute;
  inset: -30%;
  background: radial-gradient(circle, rgba(0, 217, 217, 0.15) 0%, transparent 70%);
  animation: hub-pulse 3s ease-in-out infinite;
}

@keyframes hub-pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.7; }
}

.hub-content {
  width: 12vh;
  height: 12vh;
  min-width: 80px;
  min-height: 80px;
  background: linear-gradient(135deg, #0d2530 0%, #051520 100%);
  border: 3px dashed #00d9d9;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  box-shadow:
    0 0 20px rgba(0, 217, 217, 0.4),
    0 0 40px rgba(0, 217, 217, 0.2),
    inset 0 0 20px rgba(0, 217, 217, 0.15);
}

.hub-icon {
  width: 2.5rem;
  height: 2.5rem;
  color: #00ffff;
  transition: all 0.3s ease;
}

.hub-label {
  font-size: 0.65rem;
  font-weight: 700;
  color: #00ffff;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.8);
  transition: color 0.3s ease;
}

/* ===== CERCLE INTERIEUR - INFOS ===== */
.info-ring {
  position: absolute;
  inset: 0;
  z-index: 15;
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.3s ease;
  pointer-events: none;
}

.info-ring.is-visible {
  opacity: 1;
  transform: scale(1);
}

/* Info bubbles - palette unifiee cyan/blanc */
.info-node {
  position: absolute;
  transform: translate(-50%, -50%);
  width: 7vh;
  height: 7vh;
  min-width: 50px;
  min-height: 50px;
  background: linear-gradient(135deg, #0d2530 0%, #051015 100%);
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 4px;
  border: 2px solid #00d9d9;
  transition: all 0.3s ease;
  box-shadow:
    0 0 15px rgba(0, 217, 217, 0.5),
    0 0 30px rgba(0, 217, 217, 0.2),
    inset 0 0 10px rgba(0, 217, 217, 0.1);
}

.info-label {
  font-size: 0.5rem;
  font-weight: 700;
  color: #aaaaaa;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.info-value {
  font-size: clamp(0.55rem, 1vh, 0.7rem);
  font-weight: 800;
  color: #ffffff;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
  text-align: center;
  line-height: 1.1;
  max-width: 95%;
  word-wrap: break-word;
}

/* Info node avec donnees - plus lumineux */
.info-node.has-data {
  transform: translate(-50%, -50%) scale(1.05);
  border-color: #00ffff;
  background: linear-gradient(135deg, #1a3540 0%, #0d2025 100%);
  box-shadow:
    0 0 20px rgba(0, 255, 255, 0.7),
    0 0 40px rgba(0, 217, 217, 0.3),
    inset 0 0 15px rgba(0, 255, 255, 0.15);
}

.info-node.has-data .info-value {
  color: #00ffff;
  text-shadow: 0 0 12px rgba(0, 255, 255, 1);
}

/* ===== CERCLE EXTERIEUR - PLAYSPACES ===== */
.playspace-ring {
  position: absolute;
  inset: 0;
  z-index: 10;
}

.playspace-node {
  position: absolute;
  transform: translate(-50%, -50%);
  width: 8vh;
  height: 8vh;
  min-width: 55px;
  min-height: 55px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
}

.node-glow {
  position: absolute;
  inset: -20%;
  background: radial-gradient(circle, rgba(0, 217, 217, 0.2) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.playspace-node:hover .node-glow {
  opacity: 1;
}

.playspace-node.is-active .node-glow {
  opacity: 1;
  background: radial-gradient(circle, rgba(0, 217, 217, 0.4) 0%, transparent 70%);
}

/* Playspace node - PJ = cyan */
.node-content {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #0d2530 0%, #051520 100%);
  border: 3px solid #00d9d9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow:
    0 0 15px rgba(0, 217, 217, 0.6),
    0 0 30px rgba(0, 217, 217, 0.3),
    inset 0 0 15px rgba(0, 217, 217, 0.2);
}

.playspace-node:hover .node-content {
  background: linear-gradient(135deg, #1a3540 0%, #0d2530 100%);
  border-color: #00ffff;
  box-shadow:
    0 0 20px rgba(0, 255, 255, 0.8),
    0 0 40px rgba(0, 217, 217, 0.5),
    inset 0 0 20px rgba(0, 255, 255, 0.3);
  transform: scale(1.15);
}

/* PJ actif = cyan lumineux */
.playspace-node.is-active:not(.is-mj) .node-content {
  background: linear-gradient(135deg, #00d9d9 0%, #00a0a0 100%);
  border-color: #ffffff;
  box-shadow:
    0 0 25px rgba(0, 255, 255, 1),
    0 0 50px rgba(0, 217, 217, 0.6),
    inset 0 0 20px rgba(255, 255, 255, 0.3);
}

/* MJ = or/ambre */
.playspace-node.is-mj .node-content {
  background: linear-gradient(135deg, #302510 0%, #1a1508 100%);
  border-color: #ffaa44;
  box-shadow:
    0 0 15px rgba(255, 170, 68, 0.6),
    0 0 30px rgba(255, 170, 68, 0.3),
    inset 0 0 15px rgba(255, 170, 68, 0.2);
}

.playspace-node.is-mj:hover .node-content {
  background: linear-gradient(135deg, #4a3a1a 0%, #302510 100%);
  border-color: #ffcc66;
  box-shadow:
    0 0 20px rgba(255, 204, 102, 0.8),
    0 0 40px rgba(255, 170, 68, 0.5),
    inset 0 0 20px rgba(255, 204, 102, 0.3);
}

.playspace-node.is-mj.is-active .node-content {
  background: linear-gradient(135deg, #ffaa44 0%, #cc8800 100%);
  border-color: #ffffff;
  box-shadow:
    0 0 25px rgba(255, 204, 102, 1),
    0 0 50px rgba(255, 170, 68, 0.6),
    inset 0 0 20px rgba(255, 255, 255, 0.3);
}

.node-role {
  font-size: clamp(1.4rem, 3vh, 1.8rem);
  font-weight: 900;
  color: #00ffff;
  text-shadow:
    0 0 10px rgba(0, 255, 255, 0.8),
    0 0 20px rgba(0, 217, 217, 0.5);
}

.playspace-node.is-mj .node-role {
  color: #ffcc66;
  text-shadow:
    0 0 10px rgba(255, 204, 102, 0.8),
    0 0 20px rgba(255, 170, 68, 0.5);
}

/* PJ actif - texte blanc */
.playspace-node.is-active:not(.is-mj) .node-role {
  color: #ffffff;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
}

/* MJ actif - texte blanc */
.playspace-node.is-mj.is-active .node-role {
  color: #ffffff;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
}

/* Nom toujours visible */
.node-name {
  position: absolute;
  bottom: -1.8rem;
  left: 50%;
  transform: translateX(-50%);
  font-size: clamp(0.7rem, 1.2vh, 0.85rem);
  font-weight: 700;
  color: #00d9d9;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
  text-shadow: 0 0 8px rgba(0, 217, 217, 0.6);
  transition: all 0.3s ease;
}

.playspace-node:hover .node-name {
  color: #00ffff;
  text-shadow: 0 0 12px rgba(0, 255, 255, 0.8);
}

.playspace-node.is-mj .node-name {
  color: #ffaa44;
  text-shadow: 0 0 8px rgba(255, 170, 68, 0.6);
}

.playspace-node.is-mj:hover .node-name {
  color: #ffcc66;
  text-shadow: 0 0 12px rgba(255, 204, 102, 0.8);
}

/* ===== TITRE ===== */
.overlay-title {
  position: absolute;
  top: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.title-line {
  width: 3rem;
  height: 1px;
  background: linear-gradient(90deg, transparent, #00d9d9, transparent);
}

.title-text {
  font-size: 0.75rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.3em;
}

/* ===== CLOSE BTN ===== */
.close-btn {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.6rem;
  font-weight: 600;
  transition: all 0.2s ease;
}

.close-btn:hover {
  border-color: #00d9d9;
  color: #00d9d9;
}

.close-btn svg {
  width: 1.25rem;
  height: 1.25rem;
}

/* ===== TRANSITIONS ===== */
.overlay-enter-active {
  animation: overlay-in 0.35s ease-out forwards;
}

.overlay-leave-active {
  animation: overlay-out 0.25s ease-in forwards;
}

@keyframes overlay-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes overlay-out {
  from { opacity: 1; }
  to { opacity: 0; }
}

.node-enter-active {
  animation: node-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

.node-leave-active {
  animation: node-pop 0.2s ease-in reverse forwards;
}

@keyframes node-pop {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

/* ===== RESPONSIVE ===== */
@media (max-width: 768px) {
  .orb-trigger {
    width: 3.5rem;
    height: 3.5rem;
    bottom: 1.5rem;
    left: 1.5rem;
  }

  .guide-inner { width: 30vw; height: 30vw; }
  .guide-outer { width: 70vw; height: 70vw; }

  .hub-content {
    width: 15vw;
    height: 15vw;
  }

  .info-node {
    width: 12vw;
    height: 12vw;
  }

  .playspace-node {
    width: 13vw;
    height: 13vw;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .bg-grid, .orb-ring, .hub-glow {
    animation: none;
  }
}
</style>
