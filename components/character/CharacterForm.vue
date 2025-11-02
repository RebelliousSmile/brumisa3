<template>
  <div class="character-form">
    <form @submit.prevent="handleSubmit">
      <!-- Name -->
      <div class="form-group">
        <label for="name">Name *</label>
        <input
          id="name"
          v-model="form.name"
          type="text"
          required
          minlength="2"
          maxlength="100"
          placeholder="Character name"
        />
      </div>

      <!-- Description -->
      <div class="form-group">
        <label for="description">Description</label>
        <textarea
          id="description"
          v-model="form.description"
          maxlength="500"
          rows="3"
          placeholder="Optional description"
        />
      </div>

      <!-- Playspace info (read-only) -->
      <div v-if="playspaceInfo" class="bg-gray-50 p-3 rounded mb-4">
        <p class="text-sm text-gray-600">
          <strong>Playspace:</strong> {{ playspaceInfo.name }}
        </p>
        <p class="text-xs text-gray-500">
          Hack: {{ playspaceInfo.hackName }} | Universe: {{ playspaceInfo.universeName }}
        </p>
      </div>

      <!-- Actions -->
      <div class="form-actions">
        <button type="button" class="btn-secondary" @click="$emit('cancel')">
          Cancel
        </button>
        <button
          type="submit"
          class="btn-primary"
          :disabled="!isValid || loading"
        >
          {{ loading ? 'Saving...' : (initialData ? 'Update' : 'Create') }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { usePlayspaceStore } from '~/shared/stores/playspace'
import { getHackName, getUniverseName } from '~/server/config/systems.config'
import type { Character } from '~/shared/stores/character'

const props = defineProps<{
  initialData?: Partial<Character>
  loading?: boolean
}>()

const emit = defineEmits<{
  submit: [data: { name: string; description?: string; playspaceId: string }]
  cancel: []
}>()

const playspaceStore = usePlayspaceStore()

// Form state
const form = ref({
  name: props.initialData?.name || '',
  description: props.initialData?.description || ''
})

// Playspace info
const playspaceInfo = computed(() => {
  const playspace = playspaceStore.activePlayspace
  if (!playspace) return null

  return {
    name: playspace.name,
    hackName: getHackName(playspace.hackId),
    universeName: getUniverseName(playspace.hackId, playspace.universeId)
  }
})

// Validation
const isValid = computed(() => {
  return form.value.name.length >= 2 && playspaceStore.activePlayspaceId
})

// Handle submit
function handleSubmit() {
  if (!isValid.value || !playspaceStore.activePlayspaceId) return

  emit('submit', {
    name: form.value.name,
    description: form.value.description || undefined,
    playspaceId: playspaceStore.activePlayspaceId
  })
}

// Watch initialData for edit mode
watch(
  () => props.initialData,
  (newData) => {
    if (newData) {
      form.value = {
        name: newData.name || '',
        description: newData.description || ''
      }
    }
  },
  { immediate: true }
)
</script>

<style scoped>
.character-form {
  @apply max-w-2xl;
}

.form-group {
  @apply mb-4;
}

label {
  @apply block text-sm font-semibold mb-1 text-gray-700;
}

input[type="text"],
textarea {
  @apply w-full border border-gray-300 rounded px-3 py-2;
  @apply focus:outline-none focus:ring-2 focus:ring-blue-500;
}

.form-actions {
  @apply flex gap-3 mt-6;
}

.btn-primary {
  @apply bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition;
  @apply disabled:bg-gray-300 disabled:cursor-not-allowed;
}

.btn-secondary {
  @apply bg-gray-200 text-gray-700 px-6 py-2 rounded hover:bg-gray-300 transition;
}
</style>
