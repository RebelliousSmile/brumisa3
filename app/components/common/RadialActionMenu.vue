<script setup lang="ts">
/**
 * Menu Radial Action Database - Navigation contexte de jeu
 *
 * Features:
 * - Orbe flottant bottom-right avec déploiement radial
 * - Contexte-sensitive : options dépendent du playspace actif
 * - Couleur orange (vs violet pour playspaces)
 * - Actions disponibles : Oracles, Moves, Themebooks, Investigation Board (v2.0+)
 * - Animations identiques à RadialPlayspaceMenu (cohérence UX)
 *
 * Structure:
 * - Orbe central (72px desktop, 56px mobile)
 * - Options en arc radial (max 6 actions)
 * - Badge contexte (système actif : LITM, CoM, etc.)
 */

interface ActionItem {
  id: string
  label: string
  icon: string
  path: string
  enabled: boolean
  badge?: string
  description?: string
}

// Props
interface Props {
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right'
}

const props = withDefaults(defineProps<Props>(), {
  position: 'bottom-right'
})

// State
const isExpanded = ref(false)
const isHovering = ref(false)
const isMobile = ref(false)

// TODO: Replace with store
// const playspaceStore = usePlayspaceStore()
// const { activePlayspace } = storeToRefs(playspaceStore)

// Mock active context
const activeContext = ref('LITM')

// Actions disponibles (context-sensitive)
const availableActions = computed<ActionItem[]>(() => {
  const baseActions: ActionItem[] = [
    {
      id: 'oracles',
      label: 'Oracles',
      icon: 'heroicons:sparkles',
      path: '/oracles',
      enabled: true,
      description: 'Tables aleatoires et inspiration'
    },
    {
      id: 'moves',
      label: 'Moves',
      icon: 'heroicons:bolt',
      path: '/moves',
      enabled: true,
      description: 'Actions et mecaniques de jeu'
    },
    {
      id: 'themebooks',
      label: 'Themebooks',
      icon: 'heroicons:book-open',
      path: '/themebooks',
      enabled: true,
      description: 'Catalogue de themes disponibles'
    },
    {
      id: 'investigation',
      label: 'Investigation',
      icon: 'heroicons:chart-bar-square',
      path: '/investigation',
      enabled: false,
      badge: 'v2.0',
      description: 'Investigation Board (bientot disponible)'
    },
    {
      id: 'reference',
      label: 'Reference',
      icon: 'heroicons:document-text',
      path: '/reference',
      enabled: true,
      description: 'Regles et aide de jeu'
    }
  ]

  return baseActions
})

const enabledActions = computed(() =>
  availableActions.value.filter(a => a.enabled)
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
      return `${base} bottom-8 right-8`
  }
})

// Calculate radial position
const getRadialPosition = (index: number, total: number) => {
  const spreadAngle = 120 // degrees
  const startAngle = props.position.includes('bottom') ? -30 : 30
  const radius = isMobile.value ? 100 : 140

  const angle = startAngle - (spreadAngle / (total - 1)) * index // Negative for right side
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

const navigateToAction = (action: ActionItem) => {
  if (!action.enabled) return

  // TODO: Navigate to action path
  console.log('Navigate to:', action.path)
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
    aria-label="Action database navigation"
  >
    <!-- Backdrop blur when expanded (mobile) -->
    <Transition name="fade">
      <div
        v-if="isExpanded && isMobile"
        class="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
        @click="closeMenu"
      />
    </Transition>

    <!-- Central Orb (Orange theme) -->
    <button
      type="button"
      :class="[
        'relative flex items-center justify-center rounded-full transition-all duration-200',
        'bg-gradient-to-br from-orange-500 to-orange-700',
        'text-white shadow-lg hover:shadow-xl',
        'focus:outline-none focus:ring-4 focus:ring-orange-500/50 focus:ring-offset-2',
        isMobile ? 'h-14 w-14' : 'h-18 w-18',
        isHovering && !prefersReducedMotion ? 'scale-110' : 'scale-100',
        isExpanded ? 'ring-4 ring-orange-500/30' : ''
      ]"
      :aria-expanded="isExpanded"
      aria-controls="action-menu"
      @click="toggleMenu"
      @mouseenter="isHovering = true"
      @mouseleave="isHovering = false"
    >
      <!-- Icon -->
      <Icon
        name="heroicons:book-open"
        :class="[
          'transition-transform duration-300',
          isMobile ? 'h-6 w-6' : 'h-8 w-8',
          isExpanded ? 'rotate-12' : 'rotate-0'
        ]"
      />

      <!-- Badge context (système actif) -->
      <span
        v-if="activeContext"
        :class="[
          'absolute -bottom-1 -right-1 flex items-center justify-center',
          'rounded-full bg-gray-900 text-white text-xs font-bold px-1.5 py-0.5',
          'ring-2 ring-white',
          'whitespace-nowrap'
        ]"
      >
        {{ activeContext }}
      </span>

      <!-- Pulsing glow (decorative) -->
      <span
        v-if="!prefersReducedMotion && isHovering"
        class="absolute inset-0 rounded-full bg-orange-500/50 animate-ping"
        aria-hidden="true"
      />
    </button>

    <!-- Radial Options (Desktop) -->
    <Transition name="radial-expand">
      <div
        v-if="isExpanded && !isMobile"
        id="action-menu"
        class="absolute"
        role="menu"
      >
        <!-- Action Options -->
        <button
          v-for="(action, index) in enabledActions"
          :key="action.id"
          type="button"
          :style="getRadialPosition(index, enabledActions.length)"
          :class="[
            'group absolute top-1/2 left-1/2',
            'flex flex-col items-center justify-center gap-1',
            'h-16 w-16 rounded-full',
            'transition-all duration-300',
            'focus:outline-none focus:ring-3 focus:ring-offset-2',
            action.enabled
              ? 'bg-white text-orange-600 shadow-lg hover:shadow-xl hover:scale-110 hover:bg-orange-50 focus:ring-orange-400'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
          ]"
          role="menuitem"
          :aria-label="action.label"
          :disabled="!action.enabled"
          @click="navigateToAction(action)"
        >
          <!-- Icon -->
          <Icon
            :name="action.icon"
            class="h-6 w-6"
          />

          <!-- Badge (si présent) -->
          <span
            v-if="action.badge"
            class="absolute -top-1 -right-1 text-xs font-bold px-1.5 py-0.5 rounded-full bg-gray-200 text-gray-600 ring-2 ring-white"
          >
            {{ action.badge }}
          </span>

          <!-- Tooltip on hover -->
          <span
            :class="[
              'absolute right-full mr-3 px-3 py-2 rounded-lg',
              'bg-gray-900 text-white text-sm font-medium',
              'opacity-0 group-hover:opacity-100 transition-opacity duration-200',
              'pointer-events-none z-50 whitespace-nowrap'
            ]"
          >
            <div class="font-semibold">{{ action.label }}</div>
            <div v-if="action.description" class="text-xs text-gray-400 mt-0.5">
              {{ action.description }}
            </div>
          </span>
        </button>
      </div>
    </Transition>

    <!-- Mobile Modal -->
    <Transition name="slide-up">
      <div
        v-if="isExpanded && isMobile"
        id="action-menu"
        class="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-2xl max-h-[70vh] overflow-y-auto"
        role="menu"
      >
        <!-- Header -->
        <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 class="text-lg font-bold text-gray-900">
              Action Database
            </h2>
            <p class="text-xs text-gray-500 mt-0.5">
              Contexte : {{ activeContext }}
            </p>
          </div>
          <button
            type="button"
            class="p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
            aria-label="Close menu"
            @click="closeMenu"
          >
            <Icon name="heroicons:x-mark" class="h-6 w-6 text-gray-600" />
          </button>
        </div>

        <!-- Action List -->
        <div class="p-4 space-y-2">
          <button
            v-for="action in availableActions"
            :key="action.id"
            type="button"
            :class="[
              'w-full flex items-center gap-4 p-4 rounded-xl transition-all',
              'focus:outline-none focus:ring-2 focus:ring-offset-2',
              action.enabled
                ? 'bg-orange-50 text-orange-900 hover:bg-orange-100 focus:ring-orange-500'
                : 'bg-gray-50 text-gray-400 cursor-not-allowed opacity-50'
            ]"
            role="menuitem"
            :disabled="!action.enabled"
            @click="navigateToAction(action)"
          >
            <!-- Icon -->
            <div
              :class="[
                'flex items-center justify-center h-12 w-12 rounded-full flex-shrink-0',
                action.enabled
                  ? 'bg-orange-100 text-orange-600'
                  : 'bg-gray-200 text-gray-400'
              ]"
            >
              <Icon
                :name="action.icon"
                class="h-6 w-6"
              />
            </div>

            <!-- Info -->
            <div class="flex-1 min-w-0 text-left">
              <div class="flex items-center gap-2 mb-0.5">
                <h3 class="text-sm font-semibold">
                  {{ action.label }}
                </h3>
                <span
                  v-if="action.badge"
                  class="text-xs font-bold px-2 py-0.5 rounded-full bg-gray-200 text-gray-600"
                >
                  {{ action.badge }}
                </span>
              </div>
              <p v-if="action.description" class="text-xs text-gray-600">
                {{ action.description }}
              </p>
            </div>

            <!-- Arrow -->
            <Icon
              v-if="action.enabled"
              name="heroicons:chevron-right"
              class="h-5 w-5 flex-shrink-0 text-orange-400"
            />
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/* Reuse same animations as RadialPlayspaceMenu for consistency */

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
</style>
