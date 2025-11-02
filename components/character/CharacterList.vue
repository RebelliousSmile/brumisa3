<template>
  <div class="character-list">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold">Characters</h2>
      <button class="btn-primary" @click="$emit('create')">
        New Character
      </button>
    </div>

    <!-- Loading -->
    <div v-if="characterStore.loading" class="text-center py-8">
      <p>Loading characters...</p>
    </div>

    <!-- Error -->
    <div v-else-if="characterStore.error" class="bg-red-100 text-red-700 p-4 rounded">
      {{ characterStore.error }}
    </div>

    <!-- Empty State -->
    <div v-else-if="!characterStore.hasCharacters" class="text-center py-12">
      <p class="text-gray-500 mb-4">No characters yet</p>
      <button class="btn-primary" @click="$emit('create')">
        Create your first character
      </button>
    </div>

    <!-- List -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <CharacterCard
        v-for="character in characterStore.currentPlayspaceCharacters"
        :key="character.id"
        :character="character"
        :is-active="character.id === characterStore.activeCharacterId"
        @select="handleSelect(character.id)"
        @edit="$emit('edit', character)"
        @delete="$emit('delete', character)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useCharacterStore } from '~/shared/stores/character'
import { usePlayspaceStore } from '~/shared/stores/playspace'
import type { Character } from '~/shared/stores/character'

const characterStore = useCharacterStore()
const playspaceStore = usePlayspaceStore()

defineEmits<{
  create: []
  edit: [character: Character]
  delete: [character: Character]
}>()

// Load characters on mount
onMounted(async () => {
  if (playspaceStore.activePlayspaceId) {
    await characterStore.loadCharacters(playspaceStore.activePlayspaceId)
  }
})

function handleSelect(id: string) {
  characterStore.activeCharacterId = id
}
</script>

<style scoped>
.btn-primary {
  @apply bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition;
}
</style>
