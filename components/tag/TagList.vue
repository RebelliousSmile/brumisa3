<template>
  <div class="tag-list">
    <div class="flex flex-wrap gap-2">
      <span
        v-for="tag in tags"
        :key="tag.id"
        class="tag"
        :class="`tag-${tag.type.toLowerCase()}`"
      >
        {{ tag.name }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Tag } from '~/shared/stores/character'

defineProps<{
  tags: Tag[]
}>()
</script>

<style scoped>
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
</style>
