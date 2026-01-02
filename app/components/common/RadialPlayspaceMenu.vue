<script setup lang="ts">
/**
 * Menu Radial Playspaces - Selection/creation de playspace
 *
 * Features:
 * - Orbe flottant bottom-left avec deploiement radial (couleur cyan)
 * - Hover: pre-visualisation avec glow
 * - Click: deploiement arc 120 deg vers le haut
 * - Animations GPU-accelerated (transform + opacity)
 * - Responsive: mobile = modal full-screen
 * - Accessibilite WCAG 2.1 AAA (keyboard, screen reader, reduced motion)
 *
 * Comportement:
 * - S'affiche sur toutes les pages utilisant layout 'playspace'
 * - Affiche les playspaces depuis localStorage + BDD
 * - Permet de switcher entre playspaces ou d'en creer un nouveau
 */

import CreatePlayspaceModal from '~/components/playspace/CreatePlayspaceModal.vue'

interface PlayspaceDisplay {
  id: string
  name: string
  role: 'MJ' | 'PJ'
  hackId: string
  universeId: string | null
  systemAbbr: string  // ME, CoM
  hackAbbr: string    // LITM, OS, CoM
  universeAbbr: string // Obo, TKO, City, etc.
  characterCount: number
  isActive: boolean
  systemIcon: string
  isLocal: boolean
}

// Props
interface Props {
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right'
  maxVisible?: number
}

const props = withDefaults(defineProps<Props>(), {
  position: 'bottom-left',
  maxVisible: 8
})

// State
const isExpanded = ref(false)
const isHovering = ref(false)
const isMobile = ref(false)
const isModalOpen = ref(false)
const hoveredPlayspaceId = ref<string | null>(null) // Playspace survole pour afficher details
const viewportHeight = ref(800) // Hauteur viewport par defaut (sera mis a jour onMounted)

// Store
const playspaceStore = usePlayspaceStore()

// Abbreviations pour systeme, hack, univers
const getSystemAbbr = (hackId: string): string => {
  switch (hackId) {
    case 'litm':
    case 'otherscape':
      return 'ME' // Mist Engine
    case 'city-of-mist':
      return 'CoM' // City of Mist
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
  if (!universeId) return 'Def'
  const abbrMap: Record<string, string> = {
    'obojima': 'Obo',
    'litm-custom': 'Cust',
    'tokyo-otherscape': 'TKO',
    'otherscape-custom': 'Cust',
    'the-city': 'City',
    'city-of-mist-custom': 'Cust'
  }
  return abbrMap[universeId] || universeId.substring(0, 3)
}

// Map hackId to icon
const getHackIcon = (hackId: string): string => {
  switch (hackId) {
    case 'litm':
      return 'heroicons:star-solid'
    case 'otherscape':
      return 'heroicons:cpu-chip'
    case 'city-of-mist':
      return 'heroicons:building-office-2'
    default:
      return 'heroicons:squares-2x2'
  }
}

// Computed: transformer les playspaces du store pour l'affichage
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
    characterCount: p._count?.characters || 0,
    isActive: playspaceStore.activePlayspaceId === p.id,
    systemIcon: getHackIcon(p.hackId),
    isLocal: p.id.startsWith('local_')
  }))
})

const visiblePlayspaces = computed(() =>
  displayPlayspaces.value.slice(0, props.maxVisible)
)

const hasMore = computed(() =>
  displayPlayspaces.value.length > props.maxVisible
)

const totalCount = computed(() => displayPlayspaces.value.length)

const activePlayspace = computed(() =>
  displayPlayspaces.value.find(p => p.isActive)
)

// Position classes
const positionClasses = computed(() => {
  const base = 'fixed z-50'
  switch (props.position) {
    case 'bottom-left':
      return `${base} bottom-8 left-8`
    case 'bottom-right':
      return `${base} bottom-8 right-8`
    case 'top-left':
      return `${base} top-24 left-8`
    case 'top-right':
      return `${base} top-24 right-8`
    default:
      return `${base} bottom-8 left-8`
  }
})

// Rayon en vh pour responsive (converti en px via ref reactive)
const getRadiusInPx = (vhValue: number): number => {
  return (vhValue / 100) * viewportHeight.value
}

// Calculate radial position for each option
// Pour bottom-left: deploiement vers le haut-droite (arc de -120 a -30 degres)
const getRadialPosition = (index: number, total: number) => {
  const spreadAngle = 90 // degrees d'arc
  const radiusVh = isMobile.value ? 12 : 16 // vh from center
  const radius = getRadiusInPx(radiusVh)

  // Angle de depart selon la position du menu
  // bottom-left: vers le haut-droite (-120 a -30)
  // bottom-right: vers le haut-gauche (-150 a -60)
  let startAngle: number
  switch (props.position) {
    case 'bottom-left':
      startAngle = -120
      break
    case 'bottom-right':
      startAngle = -150
      break
    case 'top-left':
      startAngle = 30
      break
    case 'top-right':
      startAngle = 120
      break
    default:
      startAngle = -120
  }

  // Calculer l'angle pour cet element
  // Si un seul element, le placer au milieu de l'arc
  let angle: number
  if (total <= 1) {
    angle = startAngle + spreadAngle / 2
  } else {
    angle = startAngle + (spreadAngle / (total - 1)) * index
  }

  const radian = (angle * Math.PI) / 180
  const x = Math.cos(radian) * radius
  const y = Math.sin(radian) * radius

  return {
    transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
    transitionDelay: `${index * 50}ms`
  }
}

// Handlers
const toggleMenu = () => {
  isExpanded.value = !isExpanded.value
  if (!isExpanded.value) {
    hoveredPlayspaceId.value = null
  }
}

const closeMenu = () => {
  isExpanded.value = false
  hoveredPlayspaceId.value = null
}

// Survol d'un playspace : afficher les 3 ronds d'info
const onPlayspaceHover = (playspaceId: string) => {
  hoveredPlayspaceId.value = playspaceId
}

const onPlayspaceLeave = () => {
  hoveredPlayspaceId.value = null
}

// Clic sur un playspace : naviguer directement
const goToPlayspace = (playspaceId: string) => {
  playspaceStore.switchPlayspace(playspaceId)
  navigateTo(`/playspaces/${playspaceId}`)
  closeMenu()
}

const createNewPlayspace = () => {
  isModalOpen.value = true
  closeMenu()
}

const handleModalClose = () => {
  isModalOpen.value = false
}

const handlePlayspaceCreated = (playspaceId: string) => {
  isModalOpen.value = false
  navigateTo(`/playspaces/${playspaceId}`)
}

// Position des 3 petits ronds d'info autour d'un playspace
// Les bulles s'orientent vers l'exterieur du menu radial (opposees au centre)
const getInfoBubblePosition = (bubbleIndex: number, playspaceIndex: number, totalPlayspaces: number): { x: number; y: number } => {
  const spreadAngle = 90 // degrees d'arc
  const radiusVh = isMobile.value ? 8 : 11 // vh - equidistant avec playspace (16vh du centre, bulles a 11vh du playspace)
  const radius = getRadiusInPx(radiusVh)

  // Calculer l'angle du playspace (meme logique que getRadialPosition)
  let startAngle: number
  switch (props.position) {
    case 'bottom-left':
      startAngle = -120
      break
    case 'bottom-right':
      startAngle = -150
      break
    case 'top-left':
      startAngle = 30
      break
    case 'top-right':
      startAngle = 120
      break
    default:
      startAngle = -120
  }

  // Angle du playspace par rapport au centre
  let playspaceAngle: number
  if (totalPlayspaces <= 1) {
    playspaceAngle = startAngle + spreadAngle / 2
  } else {
    playspaceAngle = startAngle + (spreadAngle / (totalPlayspaces - 1)) * playspaceIndex
  }

  // Les bulles sont disposees en arc de 60 degres, centrees sur la direction du playspace
  const bubbleSpread = 60
  // bubbleIndex: 0, 1, 2 -> offsets: -30, 0, +30
  const bubbleOffset = (bubbleIndex - 1) * (bubbleSpread / 2)
  const bubbleAngle = playspaceAngle + bubbleOffset

  const radian = (bubbleAngle * Math.PI) / 180

  return {
    x: Math.cos(radian) * radius,
    y: Math.sin(radian) * radius
  }
}

// Keyboard navigation
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isExpanded.value) {
    closeMenu()
  }
}


// Close on outside click
const menuRef = ref<HTMLElement | null>(null)

const handleClickOutside = (event: MouseEvent) => {
  if (menuRef.value && !menuRef.value.contains(event.target as Node)) {
    closeMenu()
  }
}

// Accessibility: reduced motion
const prefersReducedMotion = ref(false)

// Resize handler (defined here for cleanup)
const handleResize = () => {
  isMobile.value = window.innerWidth < 768
  viewportHeight.value = window.innerHeight
}

// Setup event listeners
onMounted(() => {
  // Charger les playspaces locaux depuis localStorage
  playspaceStore.init()

  // Check mobile et viewport height
  isMobile.value = window.innerWidth < 768
  viewportHeight.value = window.innerHeight

  // Check reduced motion preference
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  prefersReducedMotion.value = mediaQuery.matches

  // Add event listeners
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('resize', handleResize)
  window.addEventListener('keydown', handleKeydown)
})

// Cleanup on unmount (must be at top level of setup)
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div
    ref="menuRef"
    :class="positionClasses"
    role="navigation"
    aria-label="Playspace navigation"
  >
    <!-- Backdrop blur when expanded (mobile) -->
    <Transition name="fade">
      <div
        v-if="isExpanded && isMobile"
        class="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
        @click="closeMenu"
      />
    </Transition>

    <!-- Central Orb (Cyan theme) -->
    <button
      type="button"
      :class="[
        'relative flex items-center justify-center rounded-full transition-all duration-200',
        'bg-gradient-to-br from-cyan-500 to-cyan-700',
        'text-white shadow-lg hover:shadow-xl',
        'focus:outline-none focus:ring-4 focus:ring-cyan-500/50 focus:ring-offset-2',
        isMobile ? 'h-14 w-14' : 'h-18 w-18',
        isHovering && !prefersReducedMotion ? 'scale-110' : 'scale-100',
        isExpanded ? 'ring-4 ring-cyan-500/30' : ''
      ]"
      :aria-expanded="isExpanded"
      aria-controls="playspace-menu"
      @click="toggleMenu"
      @mouseenter="isHovering = true"
      @mouseleave="isHovering = false"
    >
      <!-- Icon -->
      <Icon
        name="heroicons:squares-2x2"
        :class="[
          'transition-transform duration-300',
          isMobile ? 'h-6 w-6' : 'h-8 w-8',
          isExpanded ? 'rotate-90' : 'rotate-0'
        ]"
      />

      <!-- Badge notification -->
      <span
        v-if="totalCount > 0"
        :class="[
          'absolute -top-1 -right-1 flex items-center justify-center',
          'rounded-full bg-orange-500 text-white text-xs font-bold',
          'ring-2 ring-white',
          isMobile ? 'h-5 w-5' : 'h-6 w-6'
        ]"
      >
        {{ totalCount }}
      </span>

      <!-- Pulsing glow (decorative, hidden from screen readers) -->
      <span
        v-if="!prefersReducedMotion && isHovering"
        class="absolute inset-0 rounded-full bg-cyan-500/50 animate-ping"
        aria-hidden="true"
      />
    </button>

    <!-- Radial Options (Desktop) -->
    <Transition name="radial-expand">
      <div
        v-if="isExpanded && !isMobile"
        id="playspace-menu"
        class="absolute"
        role="menu"
      >
        <!-- Playspace Options -->
        <div
          v-for="(playspace, index) in visiblePlayspaces"
          :key="playspace.id"
          class="absolute top-1/2 left-1/2"
          :style="getRadialPosition(index, visiblePlayspaces.length)"
        >
          <!-- Bouton principal du playspace -->
          <button
            type="button"
            :class="[
              'relative flex flex-col items-center justify-center gap-1',
              'h-16 w-16 rounded-full',
              'transition-all duration-300',
              'focus:outline-none focus:ring-3 focus:ring-offset-2',
              hoveredPlayspaceId === playspace.id
                ? 'bg-gradient-to-br from-violet-500 to-violet-700 text-white shadow-xl ring-2 ring-violet-300 scale-110 focus:ring-violet-500'
                : playspace.isActive
                  ? 'bg-gradient-to-br from-cyan-500 to-cyan-700 text-white shadow-xl ring-2 ring-white focus:ring-cyan-500'
                  : 'bg-white text-gray-700 shadow-lg hover:shadow-xl hover:scale-105 focus:ring-gray-400'
            ]"
            role="menuitem"
            :aria-label="`Ouvrir ${playspace.name}`"
            @click="goToPlayspace(playspace.id)"
            @mouseenter="onPlayspaceHover(playspace.id)"
            @mouseleave="onPlayspaceLeave"
          >
            <!-- System Icon -->
            <Icon
              :name="playspace.systemIcon"
              class="h-5 w-5"
            />

            <!-- Role Badge -->
            <span
              :class="[
                'text-xs font-bold px-1.5 py-0.5 rounded-full',
                hoveredPlayspaceId === playspace.id
                  ? 'bg-white text-violet-600'
                  : playspace.isActive
                    ? 'bg-white text-cyan-600'
                    : playspace.role === 'MJ'
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-blue-100 text-blue-800'
              ]"
            >
              {{ playspace.role }}
            </span>
          </button>

          <!-- 3 petits ronds d'info au survol -->
          <Transition name="fade">
            <div
              v-if="hoveredPlayspaceId === playspace.id"
              class="absolute inset-0 pointer-events-none"
            >
              <!-- Systeme -->
              <span
                class="absolute flex items-center justify-center h-8 w-8 rounded-full bg-gray-800 text-white text-xs font-bold shadow-lg border border-gray-600"
                :style="{
                  left: `calc(50% + ${getInfoBubblePosition(0, index, visiblePlayspaces.length).x}px)`,
                  top: `calc(50% + ${getInfoBubblePosition(0, index, visiblePlayspaces.length).y}px)`,
                  transform: 'translate(-50%, -50%)'
                }"
              >
                {{ playspace.systemAbbr }}
              </span>
              <!-- Hack -->
              <span
                class="absolute flex items-center justify-center h-8 w-8 rounded-full bg-cyan-600 text-white text-xs font-bold shadow-lg"
                :style="{
                  left: `calc(50% + ${getInfoBubblePosition(1, index, visiblePlayspaces.length).x}px)`,
                  top: `calc(50% + ${getInfoBubblePosition(1, index, visiblePlayspaces.length).y}px)`,
                  transform: 'translate(-50%, -50%)'
                }"
              >
                {{ playspace.hackAbbr }}
              </span>
              <!-- Univers -->
              <span
                class="absolute flex items-center justify-center h-8 w-8 rounded-full bg-violet-600 text-white text-xs font-bold shadow-lg"
                :style="{
                  left: `calc(50% + ${getInfoBubblePosition(2, index, visiblePlayspaces.length).x}px)`,
                  top: `calc(50% + ${getInfoBubblePosition(2, index, visiblePlayspaces.length).y}px)`,
                  transform: 'translate(-50%, -50%)'
                }"
              >
                {{ playspace.universeAbbr }}
              </span>
            </div>
          </Transition>
        </div>

        <!-- New Playspace Button -->
        <button
          type="button"
          :style="getRadialPosition(visiblePlayspaces.length, visiblePlayspaces.length + 1)"
          :class="[
            'absolute top-1/2 left-1/2',
            'flex items-center justify-center',
            'h-16 w-16 rounded-full',
            'bg-white text-cyan-600 shadow-lg',
            'border-2 border-dashed border-cyan-500',
            'hover:bg-cyan-500 hover:text-white hover:border-solid',
            'hover:shadow-xl hover:scale-110',
            'transition-all duration-300',
            'focus:outline-none focus:ring-3 focus:ring-cyan-500 focus:ring-offset-2'
          ]"
          role="menuitem"
          aria-label="Create new playspace"
          @click="createNewPlayspace"
        >
          <Icon name="heroicons:plus" class="h-8 w-8" />
        </button>
      </div>
    </Transition>

    <!-- Mobile Modal -->
    <Transition name="slide-up">
      <div
        v-if="isExpanded && isMobile"
        id="playspace-menu"
        class="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-2xl max-h-[70vh] overflow-y-auto"
        role="menu"
      >
        <!-- Header -->
        <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 class="text-lg font-bold text-gray-900">
            Playspaces
          </h2>
          <button
            type="button"
            class="p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            aria-label="Close menu"
            @click="closeMenu"
          >
            <Icon name="heroicons:x-mark" class="h-6 w-6 text-gray-600" />
          </button>
        </div>

        <!-- Playspace List -->
        <div class="p-4 space-y-2">
          <button
            v-for="playspace in displayPlayspaces"
            :key="playspace.id"
            type="button"
            :class="[
              'w-full flex items-center gap-4 p-4 rounded-xl transition-all',
              'focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2',
              playspace.isActive
                ? 'bg-gradient-to-r from-cyan-500 to-cyan-700 text-white shadow-lg'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            ]"
            role="menuitem"
            @click="goToPlayspace(playspace.id)"
          >
            <!-- Icon -->
            <div
              :class="[
                'flex items-center justify-center h-12 w-12 rounded-full flex-shrink-0',
                playspace.isActive
                  ? 'bg-white text-cyan-600'
                  : 'bg-gray-200 text-gray-700'
              ]"
            >
              <Icon
                :name="playspace.systemIcon"
                class="h-6 w-6"
              />
            </div>

            <!-- Info -->
            <div class="flex-1 min-w-0 text-left">
              <div class="flex items-center gap-2 mb-1">
                <h3 class="text-sm font-semibold truncate">
                  {{ playspace.name }}
                </h3>
                <span v-if="playspace.isLocal" class="text-xs opacity-70">(local)</span>
              </div>
              <div class="flex items-center gap-2 text-xs flex-wrap">
                <span
                  :class="[
                    'inline-flex items-center rounded-full border px-2 py-0.5 font-medium',
                    playspace.isActive
                      ? 'bg-white/20 text-white border-white/30'
                      : playspace.role === 'MJ'
                        ? 'bg-orange-100 text-orange-800 border-orange-300'
                        : 'bg-blue-100 text-blue-800 border-blue-300'
                  ]"
                >
                  {{ playspace.role }}
                </span>
                <span :class="playspace.isActive ? 'text-white/70' : 'text-gray-500'">
                  {{ playspace.systemAbbr }} / {{ playspace.hackAbbr }} / {{ playspace.universeAbbr }}
                </span>
              </div>
            </div>

            <!-- Arrow -->
            <Icon
              name="heroicons:chevron-right"
              :class="[
                'h-5 w-5 flex-shrink-0',
                playspace.isActive ? 'text-white' : 'text-gray-400'
              ]"
            />
          </button>

          <!-- New Playspace -->
          <button
            type="button"
            class="w-full flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-cyan-500 text-cyan-600 hover:bg-cyan-500 hover:text-white hover:border-solid transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
            role="menuitem"
            @click="createNewPlayspace"
          >
            <Icon name="heroicons:plus" class="h-5 w-5" />
            <span class="font-medium">Nouveau Playspace</span>
          </button>
        </div>
      </div>
    </Transition>

    <!-- Modal de creation de playspace -->
    <CreatePlayspaceModal
      :is-open="isModalOpen"
      @close="handleModalClose"
      @created="handlePlayspaceCreated"
    />
  </div>
</template>

<style scoped>
/* Radial expansion animation */
.radial-expand-enter-active,
.radial-expand-leave-active {
  transition: opacity 300ms cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.radial-expand-enter-active button,
.radial-expand-leave-active button {
  transition:
    transform 300ms cubic-bezier(0.68, -0.55, 0.265, 1.55),
    opacity 300ms ease;
}

.radial-expand-enter-from,
.radial-expand-leave-to {
  opacity: 0;
}

.radial-expand-enter-from button,
.radial-expand-leave-to button {
  transform: translate(-50%, -50%) scale(0) !important;
  opacity: 0;
}

/* Mobile slide up animation */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}

/* Slide down animation for details panel */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 200ms ease;
  overflow: hidden;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
}

.slide-down-enter-to,
.slide-down-leave-from {
  opacity: 1;
  max-height: 200px;
}

/* Fade animation for backdrop */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 200ms ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .radial-expand-enter-active,
  .radial-expand-leave-active,
  .radial-expand-enter-active button,
  .radial-expand-leave-active button,
  .slide-up-enter-active,
  .slide-up-leave-active,
  .fade-enter-active,
  .fade-leave-active {
    transition-duration: 1ms !important;
    animation-duration: 1ms !important;
  }

  .animate-ping {
    animation: none !important;
  }
}

/* Tooltip arrow (optional enhancement) */
button[role="menuitem"]:hover .tooltip-arrow::before {
  content: '';
  position: absolute;
  right: 100%;
  top: 50%;
  transform: translateY(-50%);
  border: 4px solid transparent;
  border-right-color: #111827;
}
</style>
