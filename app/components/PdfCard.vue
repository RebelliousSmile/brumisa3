<template>
  <div class="bg-gray-900 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-all">
    <div class="flex items-start justify-between mb-3">
      <h3 class="font-semibold text-white text-sm font-serif">
        {{ pdf.personnageNom }}
      </h3>
      <span 
        class="text-xs px-2 py-1 rounded-full border font-display"
        :class="getSystemClasses(pdf.systemeJeu)"
      >
        {{ pdf.systemeJeu }}
      </span>
    </div>
    
    <p class="text-xs text-gray-400 mb-3 font-serif">
      par <span>{{ pdf.auteurNom }}</span>
    </p>
    
    <div class="flex items-center justify-between text-xs text-gray-500 font-serif">
      <span>{{ formatDate(pdf.dateCreation) }}</span>
      
      <button 
        v-if="!isExample"
        @click="$emit('download', pdf.id)"
        class="inline-flex items-center px-3 py-1 bg-brand-violet text-white rounded-full text-xs font-medium hover:bg-brand-violet-dark transition-colors"
      >
        <Icon name="heroicons:arrow-down-tray" class="w-4 h-4 mr-1" />
        Télécharger
      </button>
      
      <span v-else class="text-xs text-gray-500">
        {{ pdf.nombreTelechargements }} téléch.
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Pdf {
  id: string
  personnageNom: string
  systemeJeu: string
  auteurNom: string
  dateCreation: string
  nombreTelechargements?: number
}

interface Props {
  pdf: Pdf
  isExample?: boolean
}

defineProps<Props>()
defineEmits<{
  download: [id: string]
}>()

const getSystemClasses = (system: string) => {
  const systemClasses = {
    'Monsterhearts': 'bg-pink-500/20 text-pink-400 border-pink-500',
    'Engrenages': 'bg-emerald-500/20 text-emerald-400 border-emerald-500',
    'Metro 2033': 'bg-red-500/20 text-red-400 border-red-500',
    'Mist Engine': 'bg-purple-500/20 text-purple-400 border-purple-500',
    'Zombiology': 'bg-orange-500/20 text-orange-400 border-orange-500'
  }
  
  return systemClasses[system as keyof typeof systemClasses] || 'bg-gray-700 text-gray-300 border-gray-600'
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}
</script>