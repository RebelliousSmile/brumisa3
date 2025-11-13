<template>
  <div class="theme-card" :class="`attention-${themeCard.attention}`">
    <!-- Header -->
    <div class="card-header">
      <h3 class="font-bold">{{ themeCard.name }}</h3>
      <span class="badge-type">{{ themeCard.type }}</span>
    </div>

    <!-- Description -->
    <p v-if="themeCard.description" class="text-sm text-gray-600 mb-3">
      {{ themeCard.description }}
    </p>

    <!-- Attention (crack/mark/fade) -->
    <div class="attention-tracker mb-3">
      <span class="text-xs text-gray-500">Attention:</span>
      <div class="flex gap-1">
        <div
          v-for="i in 3"
          :key="i"
          class="attention-box"
          :class="{ 'filled': i <= themeCard.attention }"
        />
      </div>
    </div>

    <!-- Tags -->
    <div v-if="themeCard.tags && themeCard.tags.length > 0" class="tags-section">
      <div class="flex flex-wrap gap-2">
        <span
          v-for="tag in themeCard.tags"
          :key="tag.id"
          class="tag"
          :class="`tag-${tag.type.toLowerCase()}`"
        >
          {{ tag.name }}
          <span v-if="tag.burned" class="ml-1 text-xs">(Burned)</span>
          <span v-if="tag.inverted" class="ml-1 text-xs">(Inverted)</span>
        </span>
      </div>
    </div>

    <!-- Actions -->
    <div class="card-actions">
      <button class="btn-sm btn-secondary" @click="$emit('edit')">
        Edit
      </button>
      <button class="btn-sm btn-danger" @click="$emit('delete')">
        Delete
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ThemeCard } from '~/shared/stores/character'

defineProps<{
  themeCard: ThemeCard
}>()

defineEmits<{
  edit: []
  delete: []
}>()
</script>

<style scoped>
.theme-card {
  @apply border rounded-lg p-4 bg-white;
  @apply border-gray-200;
}

.theme-card.attention-1 {
  @apply border-yellow-300 bg-yellow-50;
}

.theme-card.attention-2 {
  @apply border-orange-300 bg-orange-50;
}

.theme-card.attention-3 {
  @apply border-red-300 bg-red-50;
}

.card-header {
  @apply flex justify-between items-start mb-2;
}

.badge-type {
  @apply px-2 py-1 rounded text-xs font-semibold;
  @apply bg-purple-100 text-purple-700;
}

.attention-tracker {
  @apply flex items-center gap-2;
}

.attention-box {
  @apply w-4 h-4 border-2 border-gray-300 rounded;
}

.attention-box.filled {
  @apply bg-red-500 border-red-500;
}

.tags-section {
  @apply mb-3;
}

.tag {
  @apply px-2 py-1 rounded text-xs font-semibold;
}

.tag-power {
  @apply bg-green-100 text-green-700;
}

.tag-weakness {
  @apply bg-red-100 text-red-700;
}

.tag-story {
  @apply bg-blue-100 text-blue-700;
}

.card-actions {
  @apply flex gap-2 mt-3 pt-3 border-t border-gray-200;
}

.btn-sm {
  @apply px-3 py-1 rounded text-sm transition;
}

.btn-secondary {
  @apply bg-gray-200 text-gray-700 hover:bg-gray-300;
}

.btn-danger {
  @apply bg-red-100 text-red-700 hover:bg-red-200;
}
</style>
