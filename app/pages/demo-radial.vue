<script setup lang="ts">
/**
 * Page Démo - Navigation Radiale
 *
 * Démonstration complète de la navigation radiale:
 * - Menu Playspaces (bottom-left)
 * - Menu Action Database (bottom-right)
 * - Interactions clavier, souris, touch
 * - Responsive desktop/mobile
 */

definePageMeta({
  layout: 'playspace'
})

// Composable pour état menus
const { activeMenu, isAnyMenuOpen } = useRadialMenu()

// Mock data pour la démo
const demoContent = ref({
  title: 'Navigation Radiale - Démonstration',
  subtitle: 'Interface immersive inspirée des arbres de compétences',
  features: [
    {
      title: 'Menu Playspaces',
      description: 'Orbe violet en bas à gauche - Gestion de vos univers de jeu',
      icon: 'heroicons:squares-2x2',
      color: 'from-brand-violet to-purple-700'
    },
    {
      title: 'Menu Action Database',
      description: 'Orbe orange en bas à droite - Accès aux outils de jeu',
      icon: 'heroicons:book-open',
      color: 'from-orange-500 to-orange-700'
    },
    {
      title: 'Navigation Radiale',
      description: 'Déploiement en arc autour du point central (120°)',
      icon: 'heroicons:arrow-path',
      color: 'from-blue-500 to-blue-700'
    },
    {
      title: 'Responsive Mobile',
      description: 'Modal full-screen avec liste verticale sur mobile',
      icon: 'heroicons:device-phone-mobile',
      color: 'from-green-500 to-green-700'
    },
    {
      title: 'Accessibilité',
      description: 'Keyboard navigation, screen reader, reduced motion',
      icon: 'heroicons:hand-raised',
      color: 'from-pink-500 to-pink-700'
    },
    {
      title: 'Performance',
      description: 'Animations GPU-accelerated (transform + opacity)',
      icon: 'heroicons:bolt',
      color: 'from-yellow-500 to-yellow-700'
    }
  ],
  instructions: [
    {
      key: 'Desktop',
      actions: [
        'Hover sur les orbes pour pré-visualisation',
        'Click pour déployer le menu radial',
        'Keyboard: Tab pour naviguer, Enter pour sélectionner, Esc pour fermer'
      ]
    },
    {
      key: 'Mobile',
      actions: [
        'Tap sur les orbes pour ouvrir le modal',
        'Swipe down pour fermer',
        'Touch & hold pour accès rapide'
      ]
    }
  ]
})
</script>

<template>
  <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="text-center mb-12">
      <h1 class="text-4xl font-bold text-gray-900 mb-4">
        {{ demoContent.title }}
      </h1>
      <p class="text-xl text-gray-600 max-w-3xl mx-auto">
        {{ demoContent.subtitle }}
      </p>

      <!-- Status indicator -->
      <div class="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100">
        <span class="relative flex h-3 w-3">
          <span
            :class="[
              'absolute inline-flex h-full w-full rounded-full opacity-75',
              isAnyMenuOpen ? 'bg-green-400 animate-ping' : 'bg-gray-400'
            ]"
          />
          <span
            :class="[
              'relative inline-flex rounded-full h-3 w-3',
              isAnyMenuOpen ? 'bg-green-500' : 'bg-gray-500'
            ]"
          />
        </span>
        <span class="text-sm font-medium text-gray-700">
          {{ isAnyMenuOpen ? `Menu ${activeMenu} ouvert` : 'Aucun menu ouvert' }}
        </span>
      </div>
    </div>

    <!-- Features Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
      <div
        v-for="feature in demoContent.features"
        :key="feature.title"
        class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
      >
        <div
          :class="[
            'inline-flex items-center justify-center h-12 w-12 rounded-lg mb-4',
            'bg-gradient-to-br text-white',
            feature.color
          ]"
        >
          <Icon :name="feature.icon" class="h-6 w-6" />
        </div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">
          {{ feature.title }}
        </h3>
        <p class="text-gray-600 text-sm">
          {{ feature.description }}
        </p>
      </div>
    </div>

    <!-- Instructions -->
    <div class="bg-white rounded-xl shadow-lg p-8 mb-12">
      <h2 class="text-2xl font-bold text-gray-900 mb-6">
        Guide d'Utilisation
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div
          v-for="instruction in demoContent.instructions"
          :key="instruction.key"
          class="space-y-3"
        >
          <h3 class="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Icon
              :name="instruction.key === 'Desktop' ? 'heroicons:computer-desktop' : 'heroicons:device-phone-mobile'"
              class="h-5 w-5 text-brand-violet"
            />
            {{ instruction.key }}
          </h3>
          <ul class="space-y-2">
            <li
              v-for="(action, index) in instruction.actions"
              :key="index"
              class="flex items-start gap-2 text-gray-700"
            >
              <Icon name="heroicons:check-circle" class="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span class="text-sm">{{ action }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Demo Content Area -->
    <div class="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-2xl p-12 text-center text-white min-h-[400px] flex items-center justify-center">
      <div class="max-w-2xl">
        <Icon name="heroicons:cursor-arrow-rays" class="h-16 w-16 mx-auto mb-6 text-brand-violet" />
        <h2 class="text-3xl font-bold mb-4">
          Essayez les Menus Radiaux
        </h2>
        <p class="text-gray-300 text-lg mb-8">
          Cliquez sur les orbes en bas à gauche et à droite pour tester la navigation radiale.
          Chaque menu déploie ses options en arc autour du point central.
        </p>
        <div class="flex flex-wrap items-center justify-center gap-4">
          <div class="flex items-center gap-2 bg-white/10 rounded-lg px-4 py-2">
            <div class="h-3 w-3 rounded-full bg-brand-violet" />
            <span class="text-sm">Playspaces</span>
          </div>
          <div class="flex items-center gap-2 bg-white/10 rounded-lg px-4 py-2">
            <div class="h-3 w-3 rounded-full bg-orange-500" />
            <span class="text-sm">Action Database</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Technical Details -->
    <div class="mt-12 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg p-6">
      <div class="flex items-start gap-3">
        <Icon name="heroicons:information-circle" class="h-6 w-6 text-blue-600 flex-shrink-0" />
        <div>
          <h3 class="text-lg font-semibold text-blue-900 mb-2">
            Détails Techniques
          </h3>
          <ul class="space-y-1 text-sm text-blue-800">
            <li>Stack: Vue 3 Composition API + UnoCSS (Tailwind-style)</li>
            <li>Animations: GPU-accelerated (transform, opacity, will-change)</li>
            <li>Accessibilité: WCAG 2.1 AAA (keyboard, aria, reduced-motion)</li>
            <li>Responsive: Desktop (radial) / Mobile (modal full-screen)</li>
            <li>Performance: Lazy load components, optimized transitions</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
