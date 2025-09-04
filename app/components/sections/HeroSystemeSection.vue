<template>
  <header class="relative pt-20 pb-16 px-4 overflow-hidden">
    <!-- Background Effects -->
    <div class="absolute inset-0" :class="`bg-gradient-to-br ${config.hero.gradient}`"></div>
    <div class="absolute inset-0">
      <div class="absolute top-20 left-10 w-72 h-72 bg-white/5 rounded-full filter blur-3xl"></div>
      <div class="absolute bottom-20 right-10 w-96 h-96 bg-white/5 rounded-full filter blur-3xl"></div>
    </div>
    
    <div class="max-w-7xl mx-auto relative z-10">
      <div class="text-center">
        <!-- Icône et titre système -->
        <div class="flex items-center justify-center mb-6">
          <div class="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center border-2 border-current mr-4" 
               :class="config.hero.couleurIcone">
            <i class="text-3xl" :class="[config.hero.icone, config.hero.couleurIcone]"></i>
          </div>
          <div>
            <h1 class="text-4xl md:text-6xl font-bold text-white font-display">
              {{ config.hero.titre }}
            </h1>
          </div>
        </div>
        
        <p class="text-xl md:text-2xl leading-relaxed font-serif max-w-4xl mx-auto mb-8"
           :class="config.hero.couleurTexte">
          {{ config.hero.description }}
        </p>
        
        <!-- CTA Buttons -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <button class="px-8 py-4 text-white font-display font-semibold rounded-lg transition-all"
                  :class="config.hero.couleurBoutonPrimaire">
            <i class="ra ra-scroll mr-2"></i>
            {{ config.hero.texteBoutonPrimaire }}
          </button>
          <button class="px-8 py-4 font-display font-semibold rounded-lg border-2 transition-all"
                  :class="config.hero.couleurBoutonSecondaire">
            <i class="ra ra-book mr-2"></i>
            {{ config.hero.texteBoutonSecondaire }}
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
interface Props {
  config: any
}

defineProps<Props>()
</script>