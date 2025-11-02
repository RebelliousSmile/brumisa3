<template>
  <div class="tracker-list">
    <h3 class="text-lg font-bold mb-4">Trackers</h3>

    <!-- Statuses -->
    <div v-if="trackers.statuses && trackers.statuses.length > 0" class="mb-4">
      <h4 class="font-semibold text-sm mb-2">Statuses</h4>
      <div class="flex flex-wrap gap-2">
        <span
          v-for="status in trackers.statuses"
          :key="status.id"
          class="badge"
          :class="status.positive ? 'badge-positive' : 'badge-negative'"
        >
          {{ status.name }} (Tier {{ status.tier }})
        </span>
      </div>
    </div>

    <!-- Story Tags -->
    <div v-if="trackers.storyTags && trackers.storyTags.length > 0" class="mb-4">
      <h4 class="font-semibold text-sm mb-2">Story Tags</h4>
      <div class="flex flex-wrap gap-2">
        <span
          v-for="tag in trackers.storyTags"
          :key="tag.id"
          class="badge badge-story"
        >
          {{ tag.name }}
        </span>
      </div>
    </div>

    <!-- Story Themes -->
    <div v-if="trackers.storyThemes && trackers.storyThemes.length > 0">
      <h4 class="font-semibold text-sm mb-2">Story Themes</h4>
      <div class="flex flex-wrap gap-2">
        <span
          v-for="theme in trackers.storyThemes"
          :key="theme.id"
          class="badge badge-theme"
        >
          {{ theme.name }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Trackers } from '~/shared/stores/character'

defineProps<{
  trackers: Trackers
}>()
</script>

<style scoped>
.tracker-list {
  @apply border rounded-lg p-4 bg-white border-gray-200;
}

.badge {
  @apply px-2 py-1 rounded text-xs font-semibold;
}

.badge-positive {
  @apply bg-green-100 text-green-700;
}

.badge-negative {
  @apply bg-red-100 text-red-700;
}

.badge-story {
  @apply bg-blue-100 text-blue-700;
}

.badge-theme {
  @apply bg-purple-100 text-purple-700;
}
</style>
