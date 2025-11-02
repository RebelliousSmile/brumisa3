<template>
  <div class="hero-card">
    <h3 class="text-lg font-bold mb-4">Hero Card</h3>

    <!-- Identity -->
    <div class="mb-4">
      <h4 class="font-semibold text-sm mb-1">Identity</h4>
      <p class="text-gray-700">{{ heroCard.identity }}</p>
    </div>

    <!-- Mystery -->
    <div class="mb-4">
      <h4 class="font-semibold text-sm mb-1">Mystery</h4>
      <p class="text-gray-700">{{ heroCard.mystery }}</p>
    </div>

    <!-- Relationships -->
    <div v-if="heroCard.relationships && heroCard.relationships.length > 0">
      <h4 class="font-semibold text-sm mb-2">Relationships</h4>
      <div class="space-y-2">
        <div
          v-for="rel in heroCard.relationships"
          :key="rel.id"
          class="bg-gray-50 p-2 rounded text-sm"
        >
          <strong>{{ rel.name }}</strong>
          <p v-if="rel.description" class="text-xs text-gray-600">{{ rel.description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { HeroCard } from '~/shared/stores/character'

defineProps<{
  heroCard: HeroCard
}>()
</script>

<style scoped>
.hero-card {
  @apply border rounded-lg p-4 bg-white border-gray-200;
}
</style>
