<template>
  <div class="min-h-screen bg-black" v-if="systemConfig">
    <!-- Hero Section avec thématique dynamique -->
    <section class="relative pt-20 pb-16 px-4 overflow-hidden">
      <!-- Background avec gradient spécifique -->
      <div class="absolute inset-0" :class="systemConfig.hero.gradient"></div>
      <div class="absolute inset-0">
        <div class="absolute top-20 left-10 w-72 h-72 bg-emerald-500/20 rounded-full filter blur-3xl"></div>
        <div class="absolute bottom-20 right-10 w-96 h-96 bg-amber-500/20 rounded-full filter blur-3xl"></div>
      </div>
      
      <div class="max-w-7xl mx-auto relative z-10">
        <div class="text-center">
          <!-- Icône du système -->
          <i class="ra ra-gear-hammer text-6xl text-emerald-300 mb-6 block"></i>
          
          <!-- Titre -->
          <h1 class="text-4xl md:text-6xl font-bold text-white mb-6 font-display">
            {{ systemConfig.hero.titre }}
          </h1>
          
          <!-- Description -->
          <p class="text-xl text-emerald-200 mb-8 max-w-3xl mx-auto">
            {{ systemConfig.hero.description }}
          </p>
          
          <!-- Boutons d'actions -->
          <div class="flex flex-wrap gap-4 justify-center">
            <NuxtLink 
              to="/personnages/nouveau?systeme=engrenages"
              class="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-semibold"
            >
              {{ systemConfig.hero.texteBoutonPrimaire }}
            </NuxtLink>
            <NuxtLink 
              to="/oracles?systeme=engrenages"
              class="px-8 py-3 border border-emerald-300 text-emerald-300 hover:bg-emerald-300 hover:text-emerald-900 rounded-lg transition-colors"
            >
              {{ systemConfig.hero.texteBoutonSecondaire }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Section Comment Créer -->
    <div class="py-16 px-4" v-if="systemConfig.commentCreer">
      <div class="max-w-6xl mx-auto">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-white mb-4">
            Comment créer pour {{ systemConfig.commentCreer.nomSysteme }}
          </h2>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div 
            class="bg-gray-800/50 rounded-lg p-6 text-center"
            :class="systemConfig.commentCreer.couleurBordure"
          >
            <div 
              class="text-4xl mb-4"
              :class="systemConfig.commentCreer.couleurIcone"
            >
              1️⃣
            </div>
            <h3 class="text-white font-semibold text-lg mb-2">Sélection</h3>
            <p class="text-gray-300 text-sm">
              {{ systemConfig.commentCreer.texteEtape1 }}
            </p>
          </div>
          
          <div 
            class="bg-gray-800/50 rounded-lg p-6 text-center"
            :class="systemConfig.commentCreer.couleurBordure"
          >
            <div 
              class="text-4xl mb-4"
              :class="systemConfig.commentCreer.couleurIcone"
            >
              2️⃣
            </div>
            <h3 class="text-white font-semibold text-lg mb-2">Personnalisation</h3>
            <p class="text-gray-300 text-sm">
              {{ systemConfig.commentCreer.texteEtape2 }}
            </p>
          </div>
          
          <div 
            class="bg-gray-800/50 rounded-lg p-6 text-center"
            :class="systemConfig.commentCreer.couleurBordure"
          >
            <div 
              class="text-4xl mb-4"
              :class="systemConfig.commentCreer.couleurIcone"
            >
              3️⃣
            </div>
            <h3 class="text-white font-semibold text-lg mb-2">Génération</h3>
            <p class="text-gray-300 text-sm">
              {{ systemConfig.commentCreer.texteEtape3 }}
            </p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Section Templates -->
    <div class="py-16 px-4 bg-gray-800/20" v-if="systemConfig.templates && systemConfig.templates.length > 0">
      <div class="max-w-6xl mx-auto">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-white mb-4">Templates disponibles</h2>
          <p class="text-gray-300">Choisissez parmi nos templates pré-conçus</p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div 
            v-for="template in systemConfig.templates" 
            :key="template.titre"
            class="bg-gray-800/50 rounded-lg p-6 hover:bg-gray-800/70 transition-colors border border-gray-700"
          >
            <div class="text-center mb-4">
              <div class="text-4xl mb-2">{{ template.icone || '📄' }}</div>
              <h3 class="text-white font-semibold text-lg">{{ template.titre }}</h3>
            </div>
            
            <p class="text-gray-300 text-sm mb-4">{{ template.description }}</p>
            
            <div class="space-y-2" v-if="template.inclus">
              <h4 class="text-white font-medium text-sm">Inclus :</h4>
              <ul class="text-gray-400 text-xs space-y-1">
                <li v-for="item in template.inclus" :key="item" class="flex items-center">
                  <span class="text-green-400 mr-2">✓</span>
                  {{ item }}
                </li>
              </ul>
            </div>
            
            <button class="w-full mt-4 px-4 py-2 bg-generique text-white rounded hover:bg-generique/80 transition-colors">
              Utiliser ce template
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Section Oracles -->
    <div class="py-16 px-4 bg-gray-900/20" v-if="systemConfig.oracles">
      <div class="max-w-6xl mx-auto">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-white mb-4">
            Oracles {{ systemConfig.oracles.nomSysteme }}
          </h2>
          <p class="text-gray-300 max-w-3xl mx-auto">
            {{ systemConfig.oracles.descriptionOracles }}
          </p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div 
            v-for="oracle in systemConfig.oracles.oracles" 
            :key="oracle.nom"
            class="bg-gray-800/50 rounded-lg p-6 text-center hover:bg-gray-800/70 transition-colors cursor-pointer border"
            :class="systemConfig.oracles.couleurBordure"
          >
            <i 
              :class="`${oracle.icone} text-4xl mb-4 ${systemConfig.oracles.couleurIcone}`"
            ></i>
            <h3 class="text-white font-semibold text-lg mb-2">{{ oracle.nom }}</h3>
            <p class="text-gray-400 text-sm">{{ oracle.description }}</p>
          </div>
        </div>
        
        <div class="text-center">
          <NuxtLink 
            :to="systemConfig.oracles.lienOracles"
            :class="systemConfig.oracles.couleurBouton"
            class="px-8 py-3 text-white rounded-lg transition-colors font-semibold"
          >
            Voir tous les oracles
          </NuxtLink>
        </div>
      </div>
    </div>
    
    <!-- Section Downloads -->
    <div class="py-16 px-4" v-if="systemConfig.downloads && systemConfig.downloads.downloads.length > 0">
      <div class="max-w-6xl mx-auto">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-white mb-4">Téléchargements</h2>
          <p class="text-gray-300">Ressources et aides de jeu créées par la communauté</p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            v-for="download in systemConfig.downloads.downloads" 
            :key="download.titre"
            class="bg-gray-800/50 rounded-lg p-6 border hover:bg-gray-800/70 transition-colors"
            :class="systemConfig.downloads.couleurBordure"
          >
            <div class="flex items-start justify-between mb-4">
              <div class="flex-1">
                <h3 class="text-white font-semibold text-lg mb-1">{{ download.titre }}</h3>
                <p class="text-gray-400 text-sm mb-2">{{ download.description }}</p>
                <p class="text-gray-500 text-xs">par {{ download.auteur }}</p>
              </div>
              <div class="text-emerald-400 text-2xl">
                <i class="ra ra-scroll-unfurled"></i>
              </div>
            </div>
            
            <div class="flex items-center justify-between text-xs text-gray-500 mb-4">
              <span>{{ download.telechargements }} téléchargements</span>
              <span>{{ download.taille }} • {{ download.format }}</span>
            </div>
            
            <button 
              :class="systemConfig.downloads.couleurBouton"
              class="w-full px-4 py-2 text-white rounded transition-colors text-sm font-medium"
            >
              <i class="ra ra-download mr-2"></i>
              Télécharger
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Section CTA -->
    <div class="py-20 px-4">
      <div 
        class="max-w-4xl mx-auto text-center rounded-lg p-12"
        :class="`bg-gradient-to-r ${systemConfig.cta.gradient}`"
      >
        <h2 class="text-3xl font-bold mb-4" :class="systemConfig.cta.couleurTexte">
          {{ systemConfig.cta.titreCTA }}
        </h2>
        <p class="text-lg mb-8" :class="systemConfig.cta.couleurTexte">
          {{ systemConfig.cta.descriptionCTA }}
        </p>
        
        <div class="flex flex-wrap gap-4 justify-center">
          <button class="px-8 py-3 bg-white rounded-lg font-semibold transition-colors" :class="systemConfig.cta.couleurTexteBouton">
            Commencer maintenant
          </button>
          <button class="px-8 py-3 border border-white/30 rounded-lg font-semibold transition-colors" :class="systemConfig.cta.couleurTexte + ' ' + systemConfig.cta.couleurTexteBoutonSecondaire">
            En savoir plus
          </button>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Système/Univers non trouvé -->
  <div v-else class="min-h-screen bg-gray-900 flex items-center justify-center">
    <div class="text-center text-white">
      <div class="text-6xl mb-4">❌</div>
      <h1 class="text-3xl mb-2">Système ou Univers non trouvé</h1>
      <p class="text-gray-300 mb-6">Le système "{{ slug }}" ou l'univers "{{ univers }}" demandé n'existe pas.</p>
      <NuxtLink 
        to="/systemes" 
        class="px-6 py-2 bg-generique text-white rounded-lg hover:bg-generique/80 transition-colors"
      >
        Voir tous les systèmes
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { obtenirSysteme, getCouleursPourSysteme, getIconPourSysteme } = useSystemes()

const slug = route.params.slug as string
const univers = route.params.univers as string

// Récupérer les données du système via API
const { data: systemData, pending } = await useLazyAsyncData(`system-${slug}`, () => 
  obtenirSysteme(slug)
)

// Récupérer les oracles pour ce système
const { data: oracles } = await useLazyAsyncData(`oracles-${slug}`, () => 
  $fetch(`/api/oracles?systeme=${slug}`)
)

// Récupérer les templates disponibles
const { data: templates } = await useLazyAsyncData(`templates-${slug}`, () => 
  $fetch(`/api/templates?systeme=${slug}`).catch(() => [])
)

// Configuration dynamique basée sur les données API
const systemConfig = computed(() => {
  if (!systemData.value) return null

  const colors = getCouleursPourSysteme(slug)
  const system = systemData.value

  // Configuration de base adaptée dynamiquement
  const baseConfig = {
    hero: {
      gradient: getGradientForSystem(slug),
      icone: getIconPourSysteme(slug),
      couleurIcone: colors.classes.text,
      titre: system.nomComplet,
      description: system.description || `Créez des aides de jeu immersives pour ${system.nomComplet}.`,
      couleurTexte: colors.classes.text.replace('400', '200'),
      couleurBoutonPrimaire: colors.primary ? `bg-${colors.primary} hover:bg-${colors.primary}/80` : colors.classes.bg,
      couleurBoutonSecondaire: `border-${colors.classes.text.split('-')[1]} text-${colors.classes.text.split('-')[1]} hover:bg-${colors.classes.text.split('-')[1]} hover:text-white`,
      texteBoutonPrimaire: 'Créer un document',
      texteBoutonSecondaire: 'Voir les oracles'
    },
    commentCreer: {
      nomSysteme: system.nomComplet,
      couleurBordure: colors.classes.border,
      couleurIcone: colors.classes.text,
      texteEtape1: `Parcourez notre collection de templates pour ${system.nomComplet} et sélectionnez celui qui correspond à vos besoins.`,
      texteEtape2: 'Utilisez notre éditeur pour remplir les champs, ajuster les valeurs et personnaliser votre aide de jeu.',
      texteEtape3: 'Cliquez sur "Générer" pour créer un PDF professionnel prêt à imprimer ou à partager.'
    },
    templates: Array.isArray(templates.value) ? templates.value : [],
    oracles: oracles.value && Array.isArray(oracles.value) && oracles.value.length > 0 ? {
      nomSysteme: system.nomComplet,
      couleurBordure: colors.classes.border,
      couleurIcone: colors.classes.text,
      couleurBouton: colors.classes.bg.replace('/20', ''),
      lienOracles: `/oracles?systeme=${slug}`,
      descriptionOracles: `Découvrez nos générateurs d'oracles pour enrichir vos parties de ${system.nomComplet}.`,
      oracles: (oracles.value as any[]).slice(0, 3).map((oracle: any) => ({
        icone: 'ra ra-crystal-ball',
        nom: oracle.nom,
        description: oracle.description || 'Table aléatoire pour vos parties'
      }))
    } : null,
    downloads: {
      nomSysteme: system.nomComplet,
      couleurBordure: colors.classes.border,
      couleurBouton: colors.classes.bg.replace('/20', ''),
      downloads: [] // À implémenter avec API téléchargements
    },
    cta: {
      gradient: `from-${colors.classes.text.split('-')[1]}-600 to-${colors.classes.text.split('-')[1]}-800`,
      titreCTA: `Prêt à créer pour ${system.nomComplet} ?`,
      descriptionCTA: 'Rejoignez notre communauté et commencez à créer des histoires inoubliables.',
      couleurTexte: colors.classes.text.replace('400', '100'),
      couleurTexteBouton: colors.classes.text.replace('400', '600'),
      couleurTexteBoutonSecondaire: `hover:${colors.classes.text.replace('400', '600')}`
    }
  }

  // Configurations spécifiques par système pour préserver l'authenticité
  if (slug === 'engrenages' && univers === 'roue_du_temps') {
    baseConfig.hero.gradient = 'bg-gradient-to-br from-emerald-900 via-emerald-800 to-green-900'
    baseConfig.hero.icone = 'ra ra-gear-hammer'
    baseConfig.hero.titre = 'Engrenages & Sortilèges'
    baseConfig.hero.description = 'Créez des aides de jeu immersives pour la Roue du Temps, l\'univers de fantasy épique de Robert Jordan.'
    baseConfig.cta.titreCTA = 'La Roue tisse comme la Roue veut'
    baseConfig.cta.descriptionCTA = 'Rejoignez la lutte contre le Ténébreux dans l\'univers de Robert Jordan.'
  }

  return baseConfig
})

// Fonction helper pour les gradients
const getGradientForSystem = (systemSlug: string) => {
  const gradients: Record<string, string> = {
    'engrenages': 'bg-gradient-to-br from-emerald-900 via-emerald-800 to-green-900',
    'monsterhearts': 'bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900',
    'metro2033': 'bg-gradient-to-br from-red-900 via-gray-800 to-black',
    'zombiology': 'bg-gradient-to-br from-yellow-900 via-orange-800 to-red-900',
    'mistengine': 'bg-gradient-to-br from-pink-900 via-purple-800 to-indigo-900'
  }
  return gradients[systemSlug] || 'bg-gradient-to-br from-gray-900 via-blue-900 to-generique'
}

// SEO
watchEffect(() => {
  if (systemConfig.value) {
    useSeoMeta({
      title: `${systemConfig.value.hero.titre} - Brumisater`,
      description: systemConfig.value.hero.description
    })
  }
})

// Configuration complète - page prête
</script>
