<script setup lang="ts">
/**
 * Menu Radial Playspaces - Version Fullscreen Cyberpunk
 *
 * Design immersif avec:
 * - Overlay plein ecran avec grid holographique
 * - Playspaces sur cercle central 360deg
 * - Bulles d'info sur cercle interne au survol
 * - Effets neon, scanlines, glitch
 * - Animations de deploiement spatial
 */

import CreatePlayspaceModal from '~/components/playspace/CreatePlayspaceModal.vue'

interface PlayspaceDisplay {
  id: string
  name: string
  role: 'MJ' | 'PJ'
  hackId: string
  universeId: string | null
  systemAbbr: string
  hackAbbr: string
  universeAbbr: string
  isActive: boolean
  isLocal: boolean
}

// State
const isOpen = ref(false)
const hoveredId = ref<string | null>(null)
const isModalOpen = ref(false)

// Store
const playspaceStore = usePlayspaceStore()

// Abbreviations
const getSystemAbbr = (hackId: string): string => {
  switch (hackId) {
    case 'litm':
    case 'otherscape':
      return 'ME'
    case 'city-of-mist':
      return 'CoM'
    default:
      return '?'
  }
}

const getHackAbbr = (hackId: string): string => {
  switch (hackId) {
    case 'litm':
      return 'LITM'
    case 'otherscape':
      return 'OS'
    case 'city-of-mist':
      return 'CoM'
    default:
      return hackId.substring(0, 3).toUpperCase()
  }
}

const getUniverseAbbr = (universeId: string | null): string => {
  if (!universeId) return 'DEF'
  const abbrMap: Record<string, string> = {
    'obojima': 'OBO',
    'litm-custom': 'CUST',
    'tokyo-otherscape': 'TKO',
    'otherscape-custom': 'CUST',
    'the-city': 'CITY',
    'city-of-mist-custom': 'CUST'
  }
  return abbrMap[universeId] || universeId.substring(0, 4).toUpperCase()
}

// Computed
const displayPlayspaces = computed<PlayspaceDisplay[]>(() => {
  return playspaceStore.allPlayspaces.map(p => ({
    id: p.id,
    name: p.name,
    role: p.isGM ? 'MJ' : 'PJ',
    hackId: p.hackId,
    universeId: p.universeId,
    systemAbbr: getSystemAbbr(p.hackId),
    hackAbbr: getHackAbbr(p.hackId),
    universeAbbr: getUniverseAbbr(p.universeId),
    isActive: playspaceStore.activePlayspaceId === p.id,
    isLocal: p.id.startsWith('local_')
  }))
})

const hoveredPlayspace = computed(() =>
  displayPlayspaces.value.find(p => p.id === hoveredId.value)
)

const activePlayspace = computed(() =>
  displayPlayspaces.value.find(p => p.isActive)
)

const hoveredIndex = computed(() =>
  displayPlayspaces.value.findIndex(p => p.id === hoveredId.value)
)

const totalCount = computed(() => displayPlayspaces.value.length)

// Position sur cercle 360deg (commence en haut)
function getNodePosition(index: number, total: number): { left: string; top: string; delay: string } {
  const startAngle = -90 // Commence en haut
  const angleStep = 360 / (total + 1) // +1 pour le bouton "+"
  const angle = startAngle + angleStep * index

  const radiusPercent = 38
  const radian = (angle * Math.PI) / 180

  const x = 50 + Math.cos(radian) * radiusPercent
  const y = 50 + Math.sin(radian) * radiusPercent

  return {
    left: `${x}%`,
    top: `${y}%`,
    delay: `${index * 80}ms`
  }
}

// Position bulles info vers le centre
function getInfoPosition(bubbleIndex: number): { left: string; top: string; delay: string } {
  if (hoveredIndex.value === -1) return { left: '50%', top: '50%', delay: '0ms' }

  const total = displayPlayspaces.value.length + 1
  const startAngle = -90
  const angleStep = 360 / total
  const playspaceAngle = startAngle + angleStep * hoveredIndex.value

  // Bulles vers le centre (angle oppose)
  const reverseAngle = playspaceAngle + 180
  const bubbleSpread = 30
  const offset = (bubbleIndex - 1) * bubbleSpread
  const finalAngle = reverseAngle + offset

  const radiusPercent = 22
  const radian = (finalAngle * Math.PI) / 180

  const x = 50 + Math.cos(radian) * radiusPercent
  const y = 50 + Math.sin(radian) * radiusPercent

  return {
    left: `${x}%`,
    top: `${y}%`,
    delay: `${bubbleIndex * 60}ms`
  }
}

// Handlers
function toggleMenu() {
  isOpen.value = !isOpen.value
  if (!isOpen.value) {
    hoveredId.value = null
  }
}

function closeMenu() {
  isOpen.value = false
  hoveredId.value = null
}

function selectPlayspace(id: string) {
  playspaceStore.switchPlayspace(id)
  navigateTo(`/playspaces/${id}`)
  closeMenu()
}

function openCreateModal() {
  isModalOpen.value = true
}

function handlePlayspaceCreated(playspaceId: string) {
  isModalOpen.value = false
  closeMenu()
  navigateTo(`/playspaces/${playspaceId}`)
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
      <div class="orb-ring orb-ring-1"></div>
      <div class="orb-ring orb-ring-2"></div>
      <div class="orb-ring orb-ring-3"></div>

      <!-- Badge count -->
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
          aria-label="Selection de playspace"
          @click.self="closeMenu"
        >
          <!-- Background Effects -->
          <div class="bg-grid" aria-hidden="true"></div>
          <div class="bg-scanlines" aria-hidden="true"></div>
          <div class="bg-vignette" aria-hidden="true"></div>

          <!-- Cercles decoratifs -->
          <div class="deco-circle deco-circle-outer" aria-hidden="true"></div>
          <div class="deco-circle deco-circle-middle" aria-hidden="true"></div>
          <div class="deco-circle deco-circle-inner" aria-hidden="true"></div>

          <!-- Lignes de connexion -->
          <svg class="connection-lines" aria-hidden="true">
            <line
              v-for="(ps, index) in displayPlayspaces"
              :key="`line-${ps.id}`"
              x1="50%"
              y1="50%"
              :x2="getNodePosition(index, displayPlayspaces.length).left"
              :y2="getNodePosition(index, displayPlayspaces.length).top"
              class="connection-line"
              :class="{ 'is-active': ps.isActive, 'is-hovered': hoveredId === ps.id }"
            />
          </svg>

          <!-- Indicateur Central -->
          <div class="center-hub">
            <div class="hub-core">
              <div class="hub-pulse"></div>
              <span class="hub-label">ACTIF</span>
              <span class="hub-value">{{ activePlayspace?.name || 'AUCUN' }}</span>
            </div>
          </div>

          <!-- Playspace Nodes -->
          <TransitionGroup name="node">
            <button
              v-for="(ps, index) in displayPlayspaces"
              :key="ps.id"
              type="button"
              class="playspace-node"
              :class="{
                'is-active': ps.isActive,
                'is-hovered': hoveredId === ps.id,
                'is-mj': ps.role === 'MJ'
              }"
              :style="{
                left: getNodePosition(index, displayPlayspaces.length).left,
                top: getNodePosition(index, displayPlayspaces.length).top,
                transitionDelay: getNodePosition(index, displayPlayspaces.length).delay
              }"
              :aria-label="`Ouvrir ${ps.name}`"
              @click="selectPlayspace(ps.id)"
              @mouseenter="hoveredId = ps.id"
              @mouseleave="hoveredId = null"
            >
              <div class="node-glow"></div>
              <div class="node-border"></div>
              <div class="node-content">
                <span class="node-role">{{ ps.role }}</span>
                <span class="node-hack">{{ ps.hackAbbr }}</span>
              </div>
              <span class="node-name">{{ ps.name }}</span>
            </button>
          </TransitionGroup>

          <!-- Bouton Nouveau Playspace -->
          <button
            type="button"
            class="playspace-node new-node"
            :style="{
              left: getNodePosition(displayPlayspaces.length, displayPlayspaces.length).left,
              top: getNodePosition(displayPlayspaces.length, displayPlayspaces.length).top,
              transitionDelay: getNodePosition(displayPlayspaces.length, displayPlayspaces.length).delay
            }"
            aria-label="Creer un nouveau playspace"
            @click="openCreateModal"
          >
            <div class="node-glow"></div>
            <div class="node-border node-border-dashed"></div>
            <div class="node-content">
              <Icon name="heroicons:plus" class="new-icon" />
            </div>
            <span class="node-name">NOUVEAU</span>
          </button>

          <!-- Bulles d'Info au Survol -->
          <Transition name="info">
            <div v-if="hoveredPlayspace" class="info-bubbles">
              <!-- Systeme -->
              <div
                class="info-bubble info-system"
                :style="{
                  left: getInfoPosition(0).left,
                  top: getInfoPosition(0).top,
                  transitionDelay: getInfoPosition(0).delay
                }"
              >
                <span class="bubble-label">SYS</span>
                <span class="bubble-value">{{ hoveredPlayspace.systemAbbr }}</span>
              </div>

              <!-- Hack -->
              <div
                class="info-bubble info-hack"
                :style="{
                  left: getInfoPosition(1).left,
                  top: getInfoPosition(1).top,
                  transitionDelay: getInfoPosition(1).delay
                }"
              >
                <span class="bubble-label">HACK</span>
                <span class="bubble-value">{{ hoveredPlayspace.hackAbbr }}</span>
              </div>

              <!-- Univers -->
              <div
                class="info-bubble info-universe"
                :style="{
                  left: getInfoPosition(2).left,
                  top: getInfoPosition(2).top,
                  transitionDelay: getInfoPosition(2).delay
                }"
              >
                <span class="bubble-label">UNIV</span>
                <span class="bubble-value">{{ hoveredPlayspace.universeAbbr }}</span>
              </div>
            </div>
          </Transition>

          <!-- Bouton Fermer -->
          <button
            type="button"
            class="close-btn"
            aria-label="Fermer"
            @click="closeMenu"
          >
            <Icon name="heroicons:x-mark" />
            <span class="close-label">ESC</span>
          </button>

          <!-- Titre -->
          <div class="overlay-title">
            <span class="title-deco">//</span>
            <span class="title-text">PLAYSPACE_SELECT</span>
            <span class="title-deco">//</span>
          </div>
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
/* ===== VARIABLES CYBERPUNK ===== */
:root {
  --cyber-cyan: #00d9d9;
  --cyber-cyan-dim: #007a7a;
  --cyber-violet: #9b59b6;
  --cyber-violet-dim: #5b3469;
  --cyber-pink: #ff006e;
  --cyber-orange: #ff6b35;
  --cyber-dark: #0a0a0a;
  --cyber-darker: #050505;
  --cyber-gray: #1a1a1a;
}

/* ===== ORB TRIGGER ===== */
.orb-trigger {
  position: fixed;
  bottom: 2rem;
  left: 2rem;
  width: 4.5rem;
  height: 4.5rem;
  z-index: 100;

  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
}

.orb-inner {
  position: absolute;
  inset: 15%;
  background: linear-gradient(135deg, var(--cyber-cyan) 0%, var(--cyber-cyan-dim) 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;

  box-shadow:
    0 0 20px rgba(0, 217, 217, 0.6),
    0 0 40px rgba(0, 217, 217, 0.3),
    inset 0 0 20px rgba(255, 255, 255, 0.1);

  transition: all 0.3s ease;
}

.orb-trigger:hover .orb-inner {
  box-shadow:
    0 0 30px rgba(0, 217, 217, 0.8),
    0 0 60px rgba(0, 217, 217, 0.4),
    inset 0 0 30px rgba(255, 255, 255, 0.2);
}

.orb-trigger.is-active .orb-inner {
  background: linear-gradient(135deg, var(--cyber-violet) 0%, var(--cyber-violet-dim) 100%);
  box-shadow:
    0 0 30px rgba(155, 89, 182, 0.8),
    0 0 60px rgba(155, 89, 182, 0.4);
}

.orb-icon {
  width: 1.5rem;
  height: 1.5rem;
  color: var(--cyber-dark);
  transition: transform 0.3s ease;
}

.orb-trigger.is-active .orb-icon {
  transform: rotate(45deg);
  color: white;
}

/* Anneaux orbitaux */
.orb-ring {
  position: absolute;
  inset: 0;
  border: 1px solid var(--cyber-cyan);
  border-radius: 50%;
  opacity: 0.3;
  animation: orbit-pulse 3s ease-in-out infinite;
}

.orb-ring-1 {
  animation-delay: 0s;
}

.orb-ring-2 {
  inset: -15%;
  animation-delay: 0.5s;
  opacity: 0.2;
}

.orb-ring-3 {
  inset: -30%;
  animation-delay: 1s;
  opacity: 0.1;
}

@keyframes orbit-pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.3;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.5;
  }
}

.orb-trigger.is-active .orb-ring {
  border-color: var(--cyber-violet);
}

.orb-badge {
  position: absolute;
  top: -0.25rem;
  right: -0.25rem;
  min-width: 1.5rem;
  height: 1.5rem;
  padding: 0 0.4rem;

  display: flex;
  align-items: center;
  justify-content: center;

  background: var(--cyber-orange);
  border-radius: 0.75rem;
  font-size: 0.75rem;
  font-weight: 800;
  color: white;
  z-index: 3;

  box-shadow: 0 0 10px rgba(255, 107, 53, 0.6);
}

/* ===== OVERLAY FULLSCREEN ===== */
.cyber-overlay {
  position: fixed;
  inset: 0;
  z-index: 99;
  background: rgba(5, 5, 5, 0.97);
  backdrop-filter: blur(8px);
  overflow: hidden;
}

/* Grid holographique */
.bg-grid {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(90deg, rgba(0, 217, 217, 0.03) 1px, transparent 1px),
    linear-gradient(0deg, rgba(0, 217, 217, 0.03) 1px, transparent 1px);
  background-size: 4rem 4rem;
  animation: grid-scroll 20s linear infinite;
}

@keyframes grid-scroll {
  0% { transform: translate(0, 0); }
  100% { transform: translate(4rem, 4rem); }
}

/* Scanlines */
.bg-scanlines {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent 0px,
    transparent 2px,
    rgba(0, 217, 217, 0.015) 2px,
    rgba(0, 217, 217, 0.015) 4px
  );
  pointer-events: none;
  animation: scanline-flicker 0.1s steps(2) infinite;
}

@keyframes scanline-flicker {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.98; }
}

/* Vignette */
.bg-vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    ellipse at center,
    transparent 0%,
    transparent 40%,
    rgba(0, 0, 0, 0.6) 100%
  );
  pointer-events: none;
}

/* Cercles decoratifs */
.deco-circle {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  border: 1px solid;
  pointer-events: none;
}

.deco-circle-outer {
  width: min(85vh, 85vw);
  height: min(85vh, 85vw);
  border-color: rgba(0, 217, 217, 0.1);
}

.deco-circle-middle {
  width: min(60vh, 60vw);
  height: min(60vh, 60vw);
  border-color: rgba(0, 217, 217, 0.15);
  border-style: dashed;
}

.deco-circle-inner {
  width: min(35vh, 35vw);
  height: min(35vh, 35vw);
  border-color: rgba(0, 217, 217, 0.2);
}

/* Lignes de connexion */
.connection-lines {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.connection-line {
  stroke: rgba(0, 217, 217, 0.1);
  stroke-width: 1;
  stroke-dasharray: 5 5;
}

.connection-line.is-active {
  stroke: rgba(0, 217, 217, 0.4);
  stroke-width: 2;
  stroke-dasharray: none;
}

.connection-line.is-hovered {
  stroke: rgba(0, 217, 217, 0.6);
  stroke-width: 2;
  stroke-dasharray: none;
  filter: drop-shadow(0 0 5px rgba(0, 217, 217, 0.5));
}

/* ===== HUB CENTRAL ===== */
.center-hub {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 5;
}

.hub-core {
  position: relative;
  width: min(12vh, 12vw);
  height: min(12vh, 12vw);
  min-width: 80px;
  min-height: 80px;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;

  background: radial-gradient(circle, var(--cyber-gray) 0%, var(--cyber-dark) 100%);
  border: 2px solid var(--cyber-cyan);
  border-radius: 50%;

  box-shadow:
    0 0 30px rgba(0, 217, 217, 0.3),
    inset 0 0 30px rgba(0, 217, 217, 0.1);
}

.hub-pulse {
  position: absolute;
  inset: -10%;
  border: 2px solid var(--cyber-cyan);
  border-radius: 50%;
  opacity: 0;
  animation: hub-pulse 2s ease-out infinite;
}

@keyframes hub-pulse {
  0% {
    transform: scale(0.8);
    opacity: 0.8;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

.hub-label {
  font-size: clamp(0.5rem, 1vh, 0.625rem);
  font-weight: 600;
  color: var(--cyber-cyan);
  text-transform: uppercase;
  letter-spacing: 0.2em;
  opacity: 0.7;
}

.hub-value {
  font-size: clamp(0.625rem, 1.2vh, 0.75rem);
  font-weight: 800;
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  text-align: center;
  max-width: 90%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ===== PLAYSPACE NODES ===== */
.playspace-node {
  position: absolute;
  transform: translate(-50%, -50%);

  width: min(10vh, 10vw);
  height: min(10vh, 10vw);
  min-width: 70px;
  min-height: 70px;

  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  z-index: 10;
}

.node-glow {
  position: absolute;
  inset: -20%;
  background: radial-gradient(circle, rgba(0, 217, 217, 0.2) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.playspace-node:hover .node-glow,
.playspace-node.is-hovered .node-glow {
  opacity: 1;
}

.playspace-node.is-active .node-glow {
  background: radial-gradient(circle, rgba(0, 217, 217, 0.4) 0%, transparent 70%);
  opacity: 1;
}

.node-border {
  position: absolute;
  inset: 0;
  border: 2px solid rgba(0, 217, 217, 0.4);
  border-radius: 50%;
  transition: all 0.3s ease;
}

.playspace-node:hover .node-border,
.playspace-node.is-hovered .node-border {
  border-color: var(--cyber-cyan);
  box-shadow:
    0 0 20px rgba(0, 217, 217, 0.5),
    inset 0 0 20px rgba(0, 217, 217, 0.1);
}

.playspace-node.is-active .node-border {
  border-color: var(--cyber-cyan);
  border-width: 3px;
  box-shadow:
    0 0 30px rgba(0, 217, 217, 0.6),
    inset 0 0 30px rgba(0, 217, 217, 0.2);
}

.playspace-node.is-mj .node-border {
  border-color: rgba(155, 89, 182, 0.5);
}

.playspace-node.is-mj:hover .node-border,
.playspace-node.is-mj.is-hovered .node-border {
  border-color: var(--cyber-violet);
  box-shadow:
    0 0 20px rgba(155, 89, 182, 0.5),
    inset 0 0 20px rgba(155, 89, 182, 0.1);
}

.node-border-dashed {
  border-style: dashed;
  border-color: rgba(155, 89, 182, 0.4);
}

.new-node:hover .node-border-dashed {
  border-style: solid;
  border-color: var(--cyber-violet);
}

.node-content {
  position: absolute;
  inset: 10%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;

  background: var(--cyber-gray);
  border-radius: 50%;
  transition: all 0.3s ease;
}

.playspace-node:hover .node-content,
.playspace-node.is-hovered .node-content {
  background: rgba(0, 217, 217, 0.1);
}

.playspace-node.is-active .node-content {
  background: linear-gradient(135deg, var(--cyber-cyan) 0%, var(--cyber-cyan-dim) 100%);
}

.node-role {
  font-size: clamp(0.625rem, 1.2vh, 0.875rem);
  font-weight: 800;
  color: var(--cyber-cyan);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.playspace-node.is-mj .node-role {
  color: var(--cyber-violet);
}

.playspace-node.is-active .node-role {
  color: var(--cyber-dark);
}

.node-hack {
  font-size: clamp(0.5rem, 1vh, 0.75rem);
  font-weight: 600;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.playspace-node.is-active .node-hack {
  color: rgba(0, 0, 0, 0.6);
}

.node-name {
  position: absolute;
  bottom: -1.5rem;
  left: 50%;
  transform: translateX(-50%);

  font-size: clamp(0.625rem, 1vh, 0.75rem);
  font-weight: 700;
  color: rgba(255, 255, 255, 0.4);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  white-space: nowrap;

  opacity: 0;
  transition: all 0.3s ease;
}

.playspace-node:hover .node-name,
.playspace-node.is-hovered .node-name {
  opacity: 1;
  color: var(--cyber-cyan);
  text-shadow: 0 0 10px rgba(0, 217, 217, 0.5);
}

.new-icon {
  width: 2rem;
  height: 2rem;
  color: var(--cyber-violet);
  transition: all 0.3s ease;
}

.new-node:hover .new-icon {
  color: white;
  transform: rotate(90deg);
}

/* ===== INFO BUBBLES ===== */
.info-bubbles {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 15;
}

.info-bubble {
  position: absolute;
  transform: translate(-50%, -50%);

  width: min(7vh, 7vw);
  height: min(7vh, 7vw);
  min-width: 50px;
  min-height: 50px;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.125rem;

  background: var(--cyber-gray);
  border-radius: 50%;
  border: 2px solid;

  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
}

.info-system {
  border-color: #606060;
}

.info-hack {
  border-color: var(--cyber-cyan);
  box-shadow: 0 0 15px rgba(0, 217, 217, 0.3);
}

.info-universe {
  border-color: var(--cyber-violet);
  box-shadow: 0 0 15px rgba(155, 89, 182, 0.3);
}

.bubble-label {
  font-size: clamp(0.5rem, 0.8vh, 0.625rem);
  font-weight: 600;
  color: #606060;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.bubble-value {
  font-size: clamp(0.75rem, 1.2vh, 0.875rem);
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.info-system .bubble-value {
  color: #a0a0a0;
}

.info-hack .bubble-value {
  color: var(--cyber-cyan);
}

.info-universe .bubble-value {
  color: var(--cyber-violet);
}

/* ===== CLOSE BUTTON ===== */
.close-btn {
  position: absolute;
  top: 2rem;
  right: 2rem;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;

  background: transparent;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  padding: 0.75rem;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.5);

  transition: all 0.2s ease;
}

.close-btn:hover {
  border-color: var(--cyber-pink);
  color: var(--cyber-pink);
  box-shadow: 0 0 20px rgba(255, 0, 110, 0.3);
}

.close-btn svg {
  width: 1.5rem;
  height: 1.5rem;
}

.close-label {
  font-size: 0.625rem;
  font-weight: 600;
  letter-spacing: 0.1em;
}

/* ===== TITRE ===== */
.overlay-title {
  position: absolute;
  top: 2rem;
  left: 50%;
  transform: translateX(-50%);

  display: flex;
  align-items: center;
  gap: 1rem;

  font-size: clamp(0.75rem, 1.5vh, 1rem);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3em;
}

.title-deco {
  color: var(--cyber-cyan);
  opacity: 0.5;
}

.title-text {
  color: rgba(255, 255, 255, 0.7);
}

/* ===== TRANSITIONS ===== */
.overlay-enter-active {
  animation: overlay-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.overlay-leave-active {
  animation: overlay-out 0.3s ease-in forwards;
}

@keyframes overlay-in {
  0% {
    opacity: 0;
    backdrop-filter: blur(0px);
  }
  100% {
    opacity: 1;
    backdrop-filter: blur(4px);
  }
}

@keyframes overlay-out {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

.node-enter-active {
  animation: node-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

.node-leave-active {
  animation: node-out 0.2s ease-in forwards;
}

@keyframes node-in {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0);
    filter: blur(10px);
  }
  100% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
    filter: blur(0);
  }
}

@keyframes node-out {
  0% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0);
  }
}

.info-enter-active {
  animation: info-in 0.3s ease-out forwards;
}

.info-leave-active {
  animation: info-out 0.15s ease-in forwards;
}

@keyframes info-in {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

@keyframes info-out {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

.info-bubble {
  animation: bubble-pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes bubble-pop {
  0% {
    transform: translate(-50%, -50%) scale(0);
  }
  70% {
    transform: translate(-50%, -50%) scale(1.1);
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
  }
}

/* ===== REDUCED MOTION ===== */
@media (prefers-reduced-motion: reduce) {
  .bg-grid,
  .bg-scanlines,
  .orb-ring,
  .hub-pulse {
    animation: none;
  }

  .overlay-enter-active,
  .overlay-leave-active,
  .node-enter-active,
  .node-leave-active,
  .info-enter-active,
  .info-leave-active {
    animation-duration: 0.01ms !important;
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

  .playspace-node {
    min-width: 60px;
    min-height: 60px;
  }

  .info-bubble {
    min-width: 45px;
    min-height: 45px;
  }

  .overlay-title {
    font-size: 0.625rem;
  }
}
</style>
