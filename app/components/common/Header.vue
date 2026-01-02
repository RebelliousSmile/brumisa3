<script setup lang="ts">
/**
 * Header Principal - Navigation Cyberpunk Otherscape
 *
 * Conforme au wireframe: documentation/DESIGN-SYSTEM/wireframe-otherscape-authentique.html
 */

const route = useRoute()

// Navigation items - 4 outils principaux MVP
const navItems = [
  { label: 'Personnages', path: '/characters' },
  { label: 'Trackers', path: '/trackers' },
  { label: 'Dangers', path: '/dangers' },
  { label: 'Actions', path: '/actions' }
]

// Active route check
const isActive = (path: string) => {
  return route.path === path
}

// Dropdowns
const showUserDropdown = ref(false)
const currentLang = ref('fr')

// TODO: Logout handler
const handleLogout = async () => {
  showUserDropdown.value = false
}

// Toggle user dropdown
const toggleUserDropdown = () => {
  showUserDropdown.value = !showUserDropdown.value
}

// Close dropdown when clicking outside
const closeDropdown = () => {
  showUserDropdown.value = false
}

// Language switch
const switchLanguage = (lang: string) => {
  currentLang.value = lang
}
</script>

<template>
  <nav
    class="fixed top-0 left-0 right-0 z-[1000] border-b border-otherscape-cyan-neon backdrop-blur-[10px] transition-all duration-300"
    :class="[
      'bg-[rgba(10,10,10,0.95)]'
    ]"
  >
    <div class="max-w-[140rem] mx-auto px-16 py-6 flex items-center justify-between">
      <!-- Logo -->
      <NuxtLink
        to="/"
        class="group no-underline"
      >
        <span
          class="font-otherscape font-extrabold text-[2.4rem] uppercase tracking-[0.2em] text-otherscape-cyan-neon text-shadow-glow-cyan-fort transition-all duration-300 group-hover:text-otherscape-cyan-hover group-hover:text-shadow-[0_0_15px_#00d9d9,0_0_30px_#00d9d9,0_0_50px_#00d9d9]"
        >
          BRUMISA3
        </span>
      </NuxtLink>

      <!-- Navigation Principale -->
      <ul class="hidden md:flex items-center gap-12 list-none">
        <li v-for="item in navItems" :key="item.path">
          <NuxtLink
            :to="item.path"
            class="relative inline-block text-otherscape-blanc no-underline font-bold text-[1.4rem] uppercase tracking-[0.1em] transition-all duration-300 group hover:text-otherscape-cyan-neon"
            :class="{ 'text-otherscape-cyan-neon': isActive(item.path) }"
          >
            {{ item.label }}
            <!-- Underline effect -->
            <span
              class="absolute bottom-[-5px] left-0 w-0 h-[2px] bg-otherscape-cyan-neon shadow-glow-cyan transition-all duration-300 group-hover:w-full"
              :class="{ '!w-full': isActive(item.path) }"
            ></span>
          </NuxtLink>
        </li>
      </ul>

      <!-- Zone Utilisateur -->
      <div class="flex items-center gap-6">
        <!-- Selecteur de langue -->
        <div class="flex items-center gap-3 px-6" role="navigation" aria-label="Selecteur de langue">
          <button
            class="relative bg-transparent border-none text-otherscape-gris-clair font-otherscape font-bold text-[1.3rem] uppercase tracking-[0.15em] cursor-pointer px-[0.8rem] py-[0.5rem] transition-all duration-300 hover:text-otherscape-cyan-hover focus-visible:outline-2 focus-visible:outline-otherscape-cyan-neon focus-visible:outline-offset-4 after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-[2px] after:bg-otherscape-cyan-neon after:shadow-[0_0_5px_#00d9d9] after:transition-all after:duration-300 hover:after:w-[80%]"
            :class="{
              'text-otherscape-cyan-neon text-shadow-glow-cyan after:!w-[80%]': currentLang === 'fr'
            }"
            @click="switchLanguage('fr')"
            aria-current="true"
            aria-label="Francais - Langue active"
          >
            FR
          </button>
          <span class="text-[rgba(0,217,217,0.3)] text-[1.6rem] select-none" aria-hidden="true">/</span>
          <button
            class="relative bg-transparent border-none text-otherscape-gris-clair font-otherscape font-bold text-[1.3rem] uppercase tracking-[0.15em] cursor-pointer px-[0.8rem] py-[0.5rem] transition-all duration-300 hover:text-otherscape-cyan-hover focus-visible:outline-2 focus-visible:outline-otherscape-cyan-neon focus-visible:outline-offset-4 after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-[2px] after:bg-otherscape-cyan-neon after:shadow-[0_0_5px_#00d9d9] after:transition-all after:duration-300 hover:after:w-[80%]"
            :class="{
              'text-otherscape-cyan-neon text-shadow-glow-cyan after:!w-[80%]': currentLang === 'en'
            }"
            @click="switchLanguage('en')"
            aria-label="English"
          >
            EN
          </button>
        </div>

        <!-- User Menu Button -->
        <div class="relative ml-8">
          <button
            class="flex items-center gap-[0.8rem] px-[1.5rem] py-[0.8rem] bg-transparent border-none text-otherscape-cyan-neon font-otherscape font-bold text-[1.3rem] uppercase tracking-[0.15em] cursor-pointer transition-all duration-300 hover:text-otherscape-cyan-hover focus-visible:outline-2 focus-visible:outline-otherscape-cyan-neon focus-visible:outline-offset-4"
            @click="toggleUserDropdown"
            :aria-expanded="showUserDropdown"
            aria-haspopup="true"
          >
            <!-- Icone utilisateur -->
            <svg
              class="w-[1.8rem] h-[1.8rem] stroke-current fill-none stroke-[2]"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 3-7 8-7s8 3 8 7" />
            </svg>
            <span>Valkyrie</span>
            <!-- Chevron dropdown -->
            <svg
              class="w-[1.2rem] h-[1.2rem] stroke-current fill-none stroke-[2] transition-transform duration-300"
              :class="{ 'rotate-180': showUserDropdown }"
              viewBox="0 0 12 8"
              aria-hidden="true"
            >
              <path d="M1 1L6 6L11 1" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- User Dropdown Menu - Gauge Style HUD (Horizontal Full Width) -->
    <Transition
      enter-active-class="transition-all duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
      leave-active-class="transition-all duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
      enter-from-class="opacity-0 scale-y-0 origin-top"
      leave-to-class="opacity-0 scale-y-0 origin-top"
      enter-to-class="opacity-100 scale-y-100"
      leave-from-class="opacity-100 scale-y-100"
    >
      <div v-if="showUserDropdown" class="absolute top-full left-0 right-0 w-full bg-transparent z-[1000]">
        <ul
          class="user-dropdown-list list-none p-0 m-0 flex w-full items-stretch gap-0 bg-[rgba(10,10,10,0.95)] border-t border-b-2 border-otherscape-cyan-neon shadow-[0_4px_20px_rgba(0,217,217,0.3)] backdrop-blur-[10px] relative animate-gauge-bar-appear"
        >
          <!-- Profile -->
          <li class="group">
            <span class="segment-number">01</span>
            <a
              href="#profil"
              class="flex items-center justify-center gap-[0.8rem] px-[2.5rem] py-[2rem] bg-transparent border-none text-otherscape-gris-clair font-otherscape text-[1.2rem] font-bold uppercase tracking-[0.15em] text-left no-underline cursor-pointer transition-all duration-300 whitespace-nowrap relative z-[2] w-full [clip-path:polygon(0_0,calc(100%-10px)_0,100%_10px,100%_100%,0_100%)] group-hover:text-otherscape-cyan-neon group-hover:text-shadow-[0_0_10px_rgba(0,217,217,0.5)]"
              @click="closeDropdown"
            >
              <svg
                class="w-[1.6rem] h-[1.6rem] stroke-current fill-none stroke-[2] transition-all duration-300 group-hover:drop-shadow-[0_0_5px_#00d9d9]"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 3-7 8-7s8 3 8 7" />
              </svg>
              <span>Profil</span>
            </a>
          </li>

          <!-- Playspaces -->
          <li class="group">
            <span class="segment-number">02</span>
            <a
              href="#playspaces"
              class="flex items-center justify-center gap-[0.8rem] px-[2.5rem] py-[2rem] bg-transparent border-none text-otherscape-gris-clair font-otherscape text-[1.2rem] font-bold uppercase tracking-[0.15em] text-left no-underline cursor-pointer transition-all duration-300 whitespace-nowrap relative z-[2] w-full [clip-path:polygon(0_0,calc(100%-10px)_0,100%_10px,100%_100%,0_100%)] group-hover:text-otherscape-cyan-neon group-hover:text-shadow-[0_0_10px_rgba(0,217,217,0.5)]"
              @click="closeDropdown"
            >
              <svg
                class="w-[1.6rem] h-[1.6rem] stroke-current fill-none stroke-[2] transition-all duration-300 group-hover:drop-shadow-[0_0_5px_#00d9d9]"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 9h18M9 3v18" />
              </svg>
              <span>Playspaces</span>
            </a>
          </li>

          <!-- Personnages -->
          <li class="group">
            <span class="segment-number">03</span>
            <a
              href="#personnages"
              class="flex items-center justify-center gap-[0.8rem] px-[2.5rem] py-[2rem] bg-transparent border-none text-otherscape-gris-clair font-otherscape text-[1.2rem] font-bold uppercase tracking-[0.15em] text-left no-underline cursor-pointer transition-all duration-300 whitespace-nowrap relative z-[2] w-full [clip-path:polygon(0_0,calc(100%-10px)_0,100%_10px,100%_100%,0_100%)] group-hover:text-otherscape-cyan-neon group-hover:text-shadow-[0_0_10px_rgba(0,217,217,0.5)]"
              @click="closeDropdown"
            >
              <svg
                class="w-[1.6rem] h-[1.6rem] stroke-current fill-none stroke-[2] transition-all duration-300 group-hover:drop-shadow-[0_0_5px_#00d9d9]"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span>Personnages</span>
            </a>
          </li>

          <!-- Parametres -->
          <li class="group">
            <span class="segment-number">04</span>
            <a
              href="#parametres"
              class="flex items-center justify-center gap-[0.8rem] px-[2.5rem] py-[2rem] bg-transparent border-none text-otherscape-gris-clair font-otherscape text-[1.2rem] font-bold uppercase tracking-[0.15em] text-left no-underline cursor-pointer transition-all duration-300 whitespace-nowrap relative z-[2] w-full [clip-path:polygon(0_0,calc(100%-10px)_0,100%_10px,100%_100%,0_100%)] group-hover:text-otherscape-cyan-neon group-hover:text-shadow-[0_0_10px_rgba(0,217,217,0.5)]"
              @click="closeDropdown"
            >
              <svg
                class="w-[1.6rem] h-[1.6rem] stroke-current fill-none stroke-[2] transition-all duration-300 group-hover:drop-shadow-[0_0_5px_#00d9d9]"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v6m0 6v6M5 5l4 4m6 6l4 4M1 12h6m6 0h6M5 19l4-4m6-6l4-4" />
              </svg>
              <span>Parametres</span>
            </a>
          </li>

          <!-- Deconnexion -->
          <li class="group">
            <span class="segment-number">05</span>
            <button
              class="flex items-center justify-center gap-[0.8rem] px-[2.5rem] py-[2rem] bg-transparent border-none text-otherscape-rose-neon font-otherscape text-[1.2rem] font-bold uppercase tracking-[0.15em] text-left cursor-pointer transition-all duration-300 whitespace-nowrap relative z-[2] w-full [clip-path:polygon(0_0,calc(100%-10px)_0,100%_10px,100%_100%,0_100%)] group-hover:text-otherscape-rose-neon group-hover:text-shadow-[0_0_10px_rgba(255,0,110,0.5)]"
              @click="handleLogout"
            >
              <svg
                class="w-[1.6rem] h-[1.6rem] stroke-current fill-none stroke-[2] transition-all duration-300 group-hover:drop-shadow-[0_0_5px_#ff006e]"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span>Deconnexion</span>
            </button>
          </li>
        </ul>
      </div>
    </Transition>
  </nav>
</template>

<style scoped>
/* Keyframes pour animations */
@keyframes gauge-bar-appear {
  0% {
    opacity: 0;
    transform: scaleY(0);
    transform-origin: top;
  }
  100% {
    opacity: 1;
    transform: scaleY(1);
  }
}

@keyframes gauge-fill {
  0% {
    width: 4px;
    opacity: 0.6;
  }
  100% {
    width: 100%;
    opacity: 0.15;
  }
}

/* Effet gauge sur les items du dropdown */
.user-dropdown-list li {
  position: relative;
  flex: 1;
  display: flex;
  align-items: stretch;
}

/* Barre de remplissage gauge à gauche */
.user-dropdown-list li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(180deg, var(--cyan-neon) 0%, rgba(0, 217, 217, 0.3) 100%);
  box-shadow: 0 0 10px var(--cyan-neon);
  opacity: 0.6;
  transition: all 0.3s ease;
}

/* Effet alternance sur les items pairs */
.user-dropdown-list li:nth-child(2n)::before {
  box-shadow: 0 0 10px var(--cyan-neon), inset 0 0 5px rgba(255, 255, 255, 0.2);
}

/* Barre rose pour déconnexion */
.user-dropdown-list li:last-child::before {
  background: linear-gradient(180deg, var(--rose-neon) 0%, rgba(255, 0, 110, 0.3) 100%);
  box-shadow: 0 0 10px var(--rose-neon);
}

/* Biseau droit */
.user-dropdown-list li::after {
  content: '';
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 1px;
  background: linear-gradient(135deg, transparent 0%, rgba(0, 217, 217, 0.3) 50%, transparent 100%);
  transform: skewX(-45deg);
  transform-origin: top right;
}

/* Hover - gauge se remplit */
.user-dropdown-list li:hover::before {
  width: 100%;
  opacity: 0.15;
  animation: gauge-fill 0.4s ease-out forwards;
}

/* Numéros de segments */
.segment-number {
  position: absolute;
  left: 8px;
  top: 6px;
  font-size: 1rem;
  font-weight: 800;
  color: rgba(0, 217, 217, 0.4);
  font-variant-numeric: tabular-nums;
  z-index: 10;
  transition: all 0.3s ease;
  pointer-events: none;
}

.user-dropdown-list li:hover .segment-number {
  color: var(--cyan-neon);
  text-shadow: 0 0 8px rgba(0, 217, 217, 0.5);
}

/* Numéro déconnexion en rose */
.user-dropdown-list li:last-child .segment-number {
  color: rgba(255, 0, 110, 0.4);
}

.user-dropdown-list li:last-child:hover .segment-number {
  color: var(--rose-neon);
  text-shadow: 0 0 8px rgba(255, 0, 110, 0.5);
}

/* Mobile responsive adjustments */
@media (max-width: 768px) {
  nav {
    padding: 1.5rem 2rem;
  }

  .segment-number {
    display: none;
  }

  /* Gauge vertical sur mobile */
  .user-dropdown-list li::before {
    left: 0;
    right: 0;
    top: 0;
    bottom: auto;
    width: 100%;
    height: 3px;
  }

  .user-dropdown-list li:hover::before {
    height: 100%;
  }

  .user-dropdown-list li::after {
    display: none;
  }
}
</style>
