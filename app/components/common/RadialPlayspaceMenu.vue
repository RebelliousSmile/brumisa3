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
 * - Invite l'utilisateur a selectionner un playspace s'il n'en a pas
 * - Permet de switcher entre playspaces ou d'en creer un nouveau
 */

interface Playspace {
  id: string
  name: string
  role: 'MJ' | 'PJ'
  characterCount: number
  isActive: boolean
  systemIcon?: string
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

// TODO: Replace with store
// const playspaceStore = usePlayspaceStore()
// const { playspaces, activePlayspace } = storeToRefs(playspaceStore)

// Mock data
const mockPlayspaces = ref<Playspace[]>([
  {
    id: '1',
    name: 'LITM - Chicago Noir',
    role: 'PJ',
    characterCount: 3,
    isActive: true,
    systemIcon: 'heroicons:star-solid'
  },
  {
    id: '2',
    name: 'Campagne Test',
    role: 'MJ',
    characterCount: 5,
    isActive: false,
    systemIcon: 'heroicons:squares-2x2'
  },
  {
    id: '3',
    name: 'Otherscape - Cyberpunk',
    role: 'PJ',
    characterCount: 2,
    isActive: false,
    systemIcon: 'heroicons:cpu-chip'
  }
])

// Computed
const visiblePlayspaces = computed(() =>
  mockPlayspaces.value.slice(0, props.maxVisible)
)

const hasMore = computed(() =>
  mockPlayspaces.value.length > props.maxVisible
)

const totalCount = computed(() => mockPlayspaces.value.length)

const activePlayspace = computed(() =>
  mockPlayspaces.value.find(p => p.isActive)
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

// Calculate radial position for each option
const getRadialPosition = (index: number, total: number) => {
  const spreadAngle = 120 // degrees
  const startAngle = props.position.includes('bottom') ? -150 : -30 // Adjust based on position
  const radius = isMobile.value ? 100 : 140 // px from center

  const angle = startAngle + (spreadAngle / (total - 1)) * index
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
}

const closeMenu = () => {
  isExpanded.value = false
}

const switchPlayspace = (playspaceId: string) => {
  // TODO: await playspaceStore.setActivePlayspace(playspaceId)
  console.log('Switch to playspace:', playspaceId)
  closeMenu()
}

const createNewPlayspace = () => {
  // TODO: Navigate to creation
  console.log('Create new playspace')
  closeMenu()
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

// Setup event listeners
onMounted(() => {
  // Check mobile
  isMobile.value = window.innerWidth < 768

  // Check reduced motion preference
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  prefersReducedMotion.value = mediaQuery.matches

  const handleResize = () => {
    isMobile.value = window.innerWidth < 768
  }

  // Add event listeners
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('resize', handleResize)
  window.addEventListener('keydown', handleKeydown)

  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
    window.removeEventListener('resize', handleResize)
    window.removeEventListener('keydown', handleKeydown)
  })
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
        <button
          v-for="(playspace, index) in visiblePlayspaces"
          :key="playspace.id"
          type="button"
          :style="getRadialPosition(index, visiblePlayspaces.length)"
          :class="[
            'absolute top-1/2 left-1/2',
            'flex flex-col items-center justify-center gap-1',
            'h-16 w-16 rounded-full',
            'transition-all duration-300',
            'focus:outline-none focus:ring-3 focus:ring-offset-2',
            playspace.isActive
              ? 'bg-gradient-to-br from-cyan-500 to-cyan-700 text-white shadow-xl ring-2 ring-white focus:ring-cyan-500'
              : 'bg-white text-gray-700 shadow-lg hover:shadow-xl hover:scale-110 focus:ring-gray-400'
          ]"
          role="menuitem"
          :aria-label="`Switch to ${playspace.name}`"
          @click="switchPlayspace(playspace.id)"
        >
          <!-- System Icon -->
          <Icon
            :name="playspace.systemIcon || 'heroicons:squares-2x2'"
            class="h-5 w-5"
          />

          <!-- Role Badge -->
          <span
            :class="[
              'text-xs font-bold px-1.5 py-0.5 rounded-full',
              playspace.isActive
                ? 'bg-white text-cyan-600'
                : playspace.role === 'MJ'
                  ? 'bg-orange-100 text-orange-800'
                  : 'bg-blue-100 text-blue-800'
            ]"
          >
            {{ playspace.role }}
          </span>

          <!-- Tooltip on hover (absolute positioned) -->
          <span
            :class="[
              'absolute left-full ml-3 px-3 py-1.5 rounded-lg',
              'bg-gray-900 text-white text-sm font-medium whitespace-nowrap',
              'opacity-0 group-hover:opacity-100 transition-opacity duration-200',
              'pointer-events-none z-50'
            ]"
          >
            {{ playspace.name }}
            <span class="text-gray-400 text-xs ml-2">
              ({{ playspace.characterCount }} perso{{ playspace.characterCount > 1 ? 's' : '' }})
            </span>
          </span>
        </button>

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
            v-for="playspace in mockPlayspaces"
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
            @click="switchPlayspace(playspace.id)"
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
                :name="playspace.systemIcon || 'heroicons:squares-2x2'"
                class="h-6 w-6"
              />
            </div>

            <!-- Info -->
            <div class="flex-1 min-w-0 text-left">
              <div class="flex items-center gap-2 mb-1">
                <Icon
                  v-if="playspace.isActive"
                  name="heroicons:star-solid"
                  class="h-4 w-4 flex-shrink-0"
                />
                <h3 class="text-sm font-semibold truncate">
                  {{ playspace.name }}
                </h3>
              </div>
              <div class="flex items-center gap-2 text-xs">
                <span
                  :class="[
                    'inline-flex items-center rounded-full border px-2 py-0.5 font-medium',
                    playspace.isActive
                      ? 'bg-white text-cyan-600 border-white'
                      : playspace.role === 'MJ'
                        ? 'bg-orange-100 text-orange-800 border-orange-300'
                        : 'bg-blue-100 text-blue-800 border-blue-300'
                  ]"
                >
                  {{ playspace.role }}
                </span>
                <span :class="playspace.isActive ? 'text-white/80' : 'text-gray-500'">
                  {{ playspace.characterCount }} perso{{ playspace.characterCount > 1 ? 's' : '' }}
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
