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

const slug = route.params.slug as string
const univers = route.params.univers as string

// Configuration des systèmes et univers
const systemConfigurations: Record<string, Record<string, any>> = {
  'engrenages': {
    'roue_du_temps': {
      hero: {
        gradient: 'bg-gradient-to-br from-emerald-900 via-emerald-800 to-green-900',
        icone: 'ra ra-gear-hammer',
        couleurIcone: 'text-emerald-300',
        titre: 'Engrenages & Sortilèges',
        description: 'Créez des aides de jeu immersives pour la Roue du Temps, l\'univers de fantasy épique de Robert Jordan.',
        couleurTexte: 'text-emerald-200',
        couleurBoutonPrimaire: 'bg-emerald-600 hover:bg-emerald-700',
        couleurBoutonSecondaire: 'border-emerald-300 text-emerald-300 hover:bg-emerald-300 hover:text-emerald-900',
        texteBoutonPrimaire: 'Créer un document',
        texteBoutonSecondaire: 'Voir les oracles'
      },
      commentCreer: {
        nomSysteme: 'Engrenages',
        couleurBordure: 'border-emerald-500/20',
        couleurFond: 'bg-emerald-600',
        couleurIcone: 'text-emerald-400',
        texteEtape1: 'Parcourez notre collection de templates pour la Roue du Temps et sélectionnez celui qui correspond à vos besoins.',
        texteEtape2: 'Utilisez notre éditeur pour remplir les champs, ajuster les valeurs et personnaliser votre aide de jeu.',
        texteEtape3: 'Cliquez sur "Générer" pour créer un PDF élégant dans le style parchemin médiéval.'
      },
      templates: [
        {
          titre: 'Document Générique',
          description: 'Template flexible pour créer tout type de document avec structure hiérarchique.',
          icone: 'ra ra-scroll-unfurled',
          inclus: [
            'Structure hiérarchique (sections/sous-sections)',
            'Paragraphes et listes formatés',
            'Encadrés spéciaux (conseils, exemples)',
            'Mise en page style parchemin médiéval',
            'Styles thématiques Roue du Temps',
            'Export PDF haute qualité'
          ]
        }
      ],
      oracles: {
        nomSysteme: 'Engrenages',
        couleurBordure: 'border-emerald-500/30',
        couleurIcone: 'text-emerald-400',
        couleurBouton: 'bg-emerald-600 hover:bg-emerald-700',
        lienOracles: '/oracles?systeme=engrenages',
        descriptionOracles: 'Les oracles sont des outils essentiels pour enrichir vos parties dans l\'univers de la Roue du Temps. Ces tables aléatoires vous aident à générer des nations, des monstres et des PNJ de manière improvisée, ajoutant de la surprise et de la profondeur à vos campagnes épiques.',
        oracles: [
          { icone: 'ra ra-tower', nom: 'Nations', description: 'Peuples et royaumes de la Roue du Temps' },
          { icone: 'ra ra-dragon', nom: 'Monstres', description: 'Créatures de l\'Ombre et servants du Ténébreux' },
          { icone: 'ra ra-player', nom: 'PNJ Connus', description: 'Personnages célèbres de l\'univers' }
        ]
      },
      downloads: {
        nomSysteme: 'Engrenages',
        couleurBordure: 'border-emerald-500/20',
        couleurHover: 'emerald-400',
        couleurBouton: 'bg-emerald-600 hover:bg-emerald-700',
        downloads: [
          {
            titre: 'Aide-mémoire MJ',
            description: 'Référence rapide des Voies du Pouvoir',
            auteur: 'AesSedai_MJ',
            telechargements: '856',
            taille: '2.1 MB',
            format: 'PDF'
          }
        ]
      },
      cta: {
        gradient: 'from-emerald-600 to-green-600',
        titreCTA: 'La Roue tisse comme la Roue veut',
        descriptionCTA: 'Rejoignez la lutte contre le Ténébreux dans l\'univers de Robert Jordan.',
        couleurTexte: 'text-emerald-100',
        couleurTexteBouton: 'text-emerald-600',
        couleurTexteBoutonSecondaire: 'hover:text-emerald-600'
      }
    }
  },
  'monsterhearts': {
    'default': {
      hero: {
        gradient: 'bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900',
        icone: '💜',
        couleurIcone: 'text-purple-300',
        titre: 'Monsterhearts',
        description: 'Créez des fiches de personnages immersives pour Monsterhearts, le jeu de rôle des adolescents monstres modernes.',
        couleurTexte: 'text-purple-200',
        couleurBoutonPrimaire: 'bg-purple-600 hover:bg-purple-700',
        couleurBoutonSecondaire: 'border-purple-300 text-purple-300 hover:bg-purple-300 hover:text-purple-900',
        texteBoutonPrimaire: 'Créer un personnage',
        texteBoutonSecondaire: 'Voir les exemples'
      },
      commentCreer: {
        nomSysteme: 'Monsterhearts',
        couleurBordure: 'border-purple-500/20',
        couleurIcone: 'text-purple-400',
        texteEtape1: 'Parcourez notre collection de templates pré-conçus pour Monsterhearts et sélectionnez celui qui correspond à vos besoins.',
        texteEtape2: 'Utilisez notre éditeur intuitif pour remplir les champs, ajuster les valeurs et personnaliser votre aide de jeu.',
        texteEtape3: 'Cliquez sur "Générer" pour créer un PDF professionnel prêt à imprimer ou à partager avec votre table.'
      },
      templates: [
        {
          titre: 'Fiche de Personnage',
          description: 'Template complet pour créer des fiches de personnages avec tous les éléments du système Monsterhearts.',
          icone: '⚔️',
          inclus: [
            'Caractéristiques (Hot, Cold, Volatile, Dark)',
            'Archétypes de monstres complets',
            'Actions spécifiques et sexuelles',
            'Gestion des Cordes sur les autres PJ',
            'Conditions et leur gestion',
            'Expérience et évolution'
          ]
        }
      ],
      oracles: {
        nomSysteme: 'Monsterhearts',
        couleurBordure: 'border-purple-500/30',
        couleurIcone: 'text-purple-400',
        couleurBouton: 'bg-purple-600 hover:bg-purple-700',
        lienOracles: '/oracles?systeme=monsterhearts',
        descriptionOracles: 'Les oracles sont des outils essentiels pour le jeu en mode "solo" ou pour enrichir vos parties en tant que MJ.',
        oracles: [
          { icone: '🔮', nom: 'Révélations', description: 'Secrets qui éclatent au grand jour' },
          { icone: '💔', nom: 'Relations', description: 'Complications romantiques et sociales' }
        ]
      },
      cta: {
        gradient: 'from-purple-600 to-pink-600',
        titreCTA: 'Prêt à créer votre monstre adolescent ?',
        descriptionCTA: 'Rejoignez notre communauté et commencez à créer des histoires inoubliables.',
        couleurTexte: 'text-purple-100',
        couleurTexteBouton: 'text-purple-600',
        couleurTexteBoutonSecondaire: 'hover:text-purple-600'
      }
    }
  }
}

// Récupération de la configuration
const systemConfig = computed(() => {
  const config = systemConfigurations[slug]?.[univers] || systemConfigurations[slug]?.['default']
  
  if (!config) {
    return null
  }
  
  return config
})

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