<template>
  <section class="relative z-10 px-4 mb-16">
    <div class="max-w-6xl mx-auto">
      <!-- Game World Background -->
      <div class="relative rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-600 p-8 mb-12">
        <div class="relative z-10">
          <div class="text-center mb-8">
            <h2 class="text-2xl md:text-3xl font-bold text-white mb-4 font-display">
              Choisissez votre univers
            </h2>
            <p class="text-gray-300 max-w-2xl mx-auto">
              Chaque univers proposé est basé sur un des systèmes décortiqués par le site, pour vous fournir les meilleurs outils et aides de jeu.
            </p>
          </div>
          
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Colonne principale (2/3) -->
            <div class="lg:col-span-2">
              <div class="grid grid-cols-1 gap-6">
                <SystemCard
                  v-for="card in systemCards?.mainColumn || []"
                  :key="card.code"
                  :card="card"
                  layout="main"
                />
              </div>
            </div>
            
            <!-- Colonne secondaire (1/3) -->
            <div class="lg:col-span-1">
              <div class="grid grid-cols-1 gap-6">
                <SystemCard
                  v-for="card in systemCards?.secondColumn || []"
                  :key="card.code"
                  :card="card"
                  layout="secondary"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface SystemCard {
  code: string
  nom: string
  description: string
  icon: string
  classes: {
    bg: string
    border: string
    text: string
    badgeBg: string
    badgeBorder: string
  }
  univers?: Array<{
    code: string
    nom: string
    icon?: string
  }>
}

interface Props {
  systemCards?: {
    mainColumn: SystemCard[]
    secondColumn: SystemCard[]
  }
}

defineProps<Props>()
</script>