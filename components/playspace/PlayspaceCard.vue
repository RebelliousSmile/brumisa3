<template>
  <div
    class="playspace-card"
    :class="{ 'active': isActive }"
    @click="$emit('select')"
  >
    <!-- Header -->
    <div class="card-header">
      <h3 class="font-bold text-lg">{{ playspace.name }}</h3>
      <div class="flex gap-2">
        <!-- Badge GM/PC -->
        <span class="badge" :class="playspace.isGM ? 'badge-gm' : 'badge-pc'">
          {{ playspace.isGM ? 'GM' : 'PC' }}
        </span>
        <!-- Badge Hack -->
        <span class="badge badge-hack">
          {{ hackName }}
        </span>
      </div>
    </div>

    <!-- Description -->
    <p v-if="playspace.description" class="text-sm text-gray-600 mb-3">
      {{ playspace.description }}
    </p>

    <!-- Info -->
    <div class="text-xs text-gray-500 space-y-1">
      <div><strong>Hack:</strong> {{ hackName }}</div>
      <div><strong>Universe:</strong> {{ universeName }}</div>
      <div><strong>Version:</strong> {{ versionName }}</div>
      <div v-if="playspace._count">
        <strong>Characters:</strong> {{ playspace._count.characters }}
      </div>
    </div>

    <!-- Actions -->
    <div class="card-actions">
      <button
        class="btn-sm btn-secondary"
        @click.stop="$emit('edit')"
      >
        Edit
      </button>
      <button
        class="btn-sm btn-danger"
        @click.stop="$emit('delete')"
      >
        Delete
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Playspace } from '~/shared/stores/playspace'
import { getVersionId, getVersionName, getHackName, getUniverseName } from '~/server/config/systems.config'

const props = defineProps<{
  playspace: Playspace
  isActive: boolean
}>()

defineEmits<{
  select: []
  edit: []
  delete: []
}>()

// Computed properties from config
const versionId = computed(() => getVersionId(props.playspace.hackId))
const versionName = computed(() => getVersionName(versionId.value))
const hackName = computed(() => getHackName(props.playspace.hackId))
const universeName = computed(() => getUniverseName(props.playspace.hackId, props.playspace.universeId))
</script>

<style scoped>
.playspace-card {
  @apply border rounded-lg p-4 cursor-pointer hover:shadow-lg transition;
  @apply bg-white border-gray-200;
}

.playspace-card.active {
  @apply border-blue-500 bg-blue-50;
}

.card-header {
  @apply flex justify-between items-start mb-3;
}

.badge {
  @apply px-2 py-1 rounded text-xs font-semibold;
}

.badge-gm {
  @apply bg-purple-100 text-purple-700;
}

.badge-pc {
  @apply bg-green-100 text-green-700;
}

.badge-hack {
  @apply bg-gray-100 text-gray-700;
}

.card-actions {
  @apply flex gap-2 mt-4 pt-3 border-t border-gray-200;
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
