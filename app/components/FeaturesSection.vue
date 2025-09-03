<template>
  <section class="relative z-10 px-4 mb-16">
    <div class="max-w-6xl mx-auto">
      <h2 class="text-2xl md:text-3xl font-bold text-white mb-12 text-center font-display">
        Pourquoi choisir notre générateur ?
      </h2>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="text-center bg-gray-900 rounded-lg p-8 border border-gray-700">
          <div class="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6 border border-brand-violet">
            <Icon name="fa-solid:mobile-alt" class="text-brand-violet text-2xl" />
          </div>
          <h3 class="text-xl font-bold text-white mb-4">Mobile-First</h3>
          <p class="text-gray-300">
            Optimisé pour créer vos fiches sur mobile et tablette avec une interface intuitive
          </p>
        </div>
        
        <div class="text-center bg-gray-900 rounded-lg p-8 border border-gray-700">
          <div class="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6 border border-brand-violet">
            <Icon name="fa-solid:palette" class="text-brand-violet text-2xl" />
          </div>
          <h3 class="text-xl font-bold text-white mb-4">Thèmes Uniques</h3>
          <p class="text-gray-300">
            Chaque système possède son propre design visuel immersif et ses couleurs thématiques
          </p>
        </div>
        
        <div class="text-center bg-gray-900 rounded-lg p-8 border border-gray-700">
          <div class="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6 border border-brand-violet">
            <Icon name="fa-solid:bolt" class="text-brand-violet text-2xl" />
          </div>
          <h3 class="text-xl font-bold text-white mb-4">Partage Facile</h3>
          <p class="text-gray-300">
            Partagez vos fiches instantanément via liens directs, QR codes ou export PDF
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
// No props needed for this static component
</script>