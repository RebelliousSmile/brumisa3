<template>
  <header class="relative pt-20 pb-16 px-4 overflow-hidden">
    <!-- Background Effects -->
    <div class="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-900 to-brand-violet"></div>
    <div class="absolute inset-0">
      <div class="absolute top-20 left-10 w-72 h-72 bg-brand-violet/20 rounded-full filter blur-3xl"></div>
      <div class="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full filter blur-3xl"></div>
    </div>
    
    <div class="max-w-7xl mx-auto">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <!-- Character Image -->
        <div class="relative lg:order-first order-first">
          <div class="relative max-w-md mx-auto lg:ml-0">
            <!-- Hero Glow Effect -->
            <div class="absolute inset-0 bg-gradient-to-r from-brand-violet/30 to-purple-500/30 rounded-full filter blur-3xl"></div>
            
            <!-- Character -->
            <img 
              src="/images/transhumans-bueno.png" 
              alt="Personnage cyberpunk" 
              class="relative z-10 w-full h-auto hero-character-filter"
            >
          </div>
        </div>
        
        <!-- Content -->
        <div class="text-center lg:text-left lg:order-last relative z-10">
          <h1 class="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight font-display">
            N'EMBARQUEZ PAS DANS LA BRUME
            <span class="text-brand-violet">
              LES MAINS VIDES
            </span>
          </h1>
          <p class="text-xl md:text-2xl text-gray-300 leading-relaxed font-serif">
            Transformez vos héros en légendes épiques dans des fiches de personnages immersives.
            Créez vos aventuriers impeccables et préparez-vous pour des expériences épiques.
          </p>
        </div>
      </div>
    </div>

    <!-- Stats Section -->
    <section class="relative z-10 px-4 mt-16">
      <div class="max-w-6xl mx-auto">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Stat 1 - Utilisateurs inscrits -->
          <div class="text-center">
            <div class="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-brand-violet">
              <Icon name="ra:ra-player-king" class="text-brand-violet text-2xl" />
            </div>
            <div class="text-3xl md:text-4xl font-bold text-white mb-2">
              {{ formatNumber(statistics?.nbUtilisateursInscrits) || '...' }}
            </div>
            <div class="text-brand-violet font-medium font-display">UTILISATEURS</div>
            <div class="text-gray-400 text-sm mt-1">
              Joueuses inscrites créant des personnages épiques et partageant leurs aventures.
            </div>
          </div>
          
          <!-- Stat 2 - Contenus ouverts ce mois -->
          <div class="text-center">
            <div class="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-brand-violet">
              <Icon name="fa-solid:eye" class="text-brand-violet text-2xl" />
            </div>
            <div class="text-3xl md:text-4xl font-bold text-white mb-2">
              {{ formatNumber(statistics?.nbContenusOuvertsMois) || '...' }}
            </div>
            <div class="text-brand-violet font-medium font-display">VUES CE MOIS</div>
            <div class="text-gray-400 text-sm mt-1">
              PDFs consultés et téléchargés par la communauté ce mois-ci.
            </div>
          </div>
          
          <!-- Stat 3 - PDFs stockés -->
          <div class="text-center">
            <div class="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-brand-violet">
              <Icon name="fa-solid:scroll" class="text-brand-violet text-2xl" />
            </div>
            <div class="text-3xl md:text-4xl font-bold text-white mb-2">
              {{ formatNumber(statistics?.nbPdfsStockes) || '...' }}
            </div>
            <div class="text-brand-violet font-medium font-display">PDFS STOCKÉS</div>
            <div class="text-gray-400 text-sm mt-1">
              Fiches de personnages et aides de jeu sauvegardées.
            </div>
          </div>
        </div>
      </div>
    </section>
  </header>
</template>

<script setup lang="ts">
interface Props {
  statistics?: {
    nbUtilisateursInscrits: number
    nbContenusOuvertsMois: number
    nbPdfsStockes: number
  }
}

defineProps<Props>()

// Utility function to format numbers
const formatNumber = (num: number | undefined) => {
  if (!num) return '...'
  return num.toLocaleString('fr-FR')
}
</script>

<style scoped>
/* Filter pour adapter l'image aux couleurs du site */
.hero-character-filter {
  filter: 
    hue-rotate(280deg)     /* Ajuste vers les violets du site */
    saturate(0.7)          /* Réduit la saturation */
    brightness(0.8)        /* Assombrit pour s'adapter au thème sombre */
    contrast(1.2);         /* Augmente le contraste */
  transition: all 0.3s ease-in-out;
}

/* Animation hover pour l'image */
.hero-character-filter:hover {
  filter: 
    hue-rotate(280deg)
    saturate(0.9)
    brightness(0.9)
    contrast(1.3);
  transform: scale(1.05);
}
</style>