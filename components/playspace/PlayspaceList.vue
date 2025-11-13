<template>
  <div class="playspace-list">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold">Playspaces</h2>
      <button
        class="btn-primary"
        @click="$emit('create')"
      >
        New Playspace
      </button>
    </div>

    <!-- Loading -->
    <div v-if="playspaceStore.loading" class="text-center py-8">
      <p>Loading playspaces...</p>
    </div>

    <!-- Error -->
    <div v-else-if="playspaceStore.error" class="bg-red-100 text-red-700 p-4 rounded">
      {{ playspaceStore.error }}
    </div>

    <!-- Empty State -->
    <div v-else-if="!playspaceStore.hasPlayspaces" class="text-center py-12">
      <p class="text-gray-500 mb-4">No playspaces yet</p>
      <button class="btn-primary" @click="$emit('create')">
        Create your first playspace
      </button>
    </div>

    <!-- Grid/List -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <PlayspaceCard
        v-for="playspace in playspaceStore.playspaces"
        :key="playspace.id"
        :playspace="playspace"
        :is-active="playspace.id === playspaceStore.activePlayspaceId"
        @select="handleSelect(playspace.id)"
        @edit="$emit('edit', playspace)"
        @delete="$emit('delete', playspace)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { usePlayspaceStore } from '~/shared/stores/playspace'
import type { Playspace } from '~/shared/stores/playspace'

const playspaceStore = usePlayspaceStore()

// Emit events
defineEmits<{
  create: []
  edit: [playspace: Playspace]
  delete: [playspace: Playspace]
}>()

// Load playspaces on mount
onMounted(async () => {
  await playspaceStore.loadPlayspaces()
})

// Handle playspace selection
async function handleSelect(id: string) {
  await playspaceStore.switchPlayspace(id)
}
</script>

<style scoped>
.btn-primary {
  @apply bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition;
}
</style>
