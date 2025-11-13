<template>
  <div 
    class="group bg-gray-900 rounded-lg p-6 border border-gray-700 transition-all hover:border-gray-600"
    data-carte-systeme
  >
    <!-- Main layout (horizontal) -->
    <div v-if="layout === 'main'" class="flex items-start">
      <div class="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 mr-4"
           :class="[card.classes.bg, card.classes.border]">
        <i :class="card.icon + ' ' + card.classes.text + ' text-2xl'"></i>
      </div>
      <div class="flex-grow">
        <h3 class="text-lg font-bold text-white mb-1">{{ card.nom }}</h3>
        <p class="text-sm text-gray-400 mb-3">
          {{ card.description }}
        </p>
        
        <div v-if="card.univers && card.univers.length > 0" class="flex flex-wrap gap-2 mb-3">
          <NuxtLink
            v-for="univers in card.univers"
            :key="univers.code"
            :to="`/systemes/${card.code}/${univers.code}`"
            class="inline-flex items-center px-3 py-1 text-xs rounded-full bg-gray-800 hover:bg-gray-700 hover:text-white border transition-all"
            :class="[
              card.classes.text,
              card.classes.border,
              `hover:border-${card.classes.text.replace('text-', '')}`
            ]"
          >
            <i :class="(univers.icon || card.icon) + ' ' + card.classes.text + ' mr-1.5'"></i>
            {{ univers.nom }}
          </NuxtLink>
        </div>
        <NuxtLink
          v-else
          :to="`/systemes/${card.code}`"
          class="inline-flex items-center px-3 py-1 text-xs rounded-full bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 hover:border-gray-600 transition-all"
        >
          Accéder au système
        </NuxtLink>
      </div>
    </div>

    <!-- Secondary layout (vertical) -->
    <div v-else class="text-center">
      <div class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
           :class="[card.classes.bg, card.classes.border]">
        <i :class="card.icon + ' ' + card.classes.text + ' text-2xl'"></i>
      </div>
      <h3 class="text-lg font-bold text-white mb-2">{{ card.nom }}</h3>
      <p class="text-sm text-gray-400 mb-4">
        {{ card.description }}
      </p>
      
      <div v-if="card.univers && card.univers.length > 0" class="flex flex-col gap-2 mb-4">
        <NuxtLink
          v-for="univers in card.univers"
          :key="univers.code"
          :to="`/systemes/${card.code}/${univers.code}`"
          class="inline-flex items-center justify-center px-3 py-1 text-xs rounded-full bg-gray-800 hover:bg-gray-700 hover:text-white border transition-all"
          :class="[
            card.classes.text,
            card.classes.border,
            `hover:border-${card.classes.text.replace('text-', '')}`
          ]"
        >
          <Icon :name="univers.icon || card.icon" :class="[card.classes.text, 'mr-1.5']" />
          {{ univers.nom }}
        </NuxtLink>
      </div>
      <NuxtLink
        v-else
        :to="`/systemes/${card.code}`"
        class="inline-flex items-center justify-center px-3 py-1 text-xs rounded-full bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 hover:border-gray-600 transition-all mb-4"
      >
        Accéder au système
      </NuxtLink>
    </div>
  </div>
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
  card: SystemCard
  layout: 'main' | 'secondary'
}

defineProps<Props>()
</script>