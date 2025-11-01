<template>
  <div class="playspace-form">
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
          placeholder="My Campaign"
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

      <!-- Hack Selection -->
      <div class="form-group">
        <label for="hackId">Hack *</label>
        <select id="hackId" v-model="form.hackId" required @change="onHackChange">
          <option value="">Select a hack</option>
          <option value="city-of-mist">City of Mist (v1.0)</option>
          <option value="litm">Legends in the Mist (v2.0)</option>
          <option value="otherlands">Otherlands (v2.0)</option>
        </select>
      </div>

      <!-- Universe (optional) -->
      <div class="form-group">
        <label for="universeId">Universe (optional)</label>
        <input
          id="universeId"
          v-model="form.universeId"
          type="text"
          maxlength="100"
          :placeholder="defaultUniversePlaceholder"
        />
        <p class="text-xs text-gray-500 mt-1">
          Leave empty to use default universe: {{ defaultUniverseName }}
        </p>
      </div>

      <!-- Game Master Mode -->
      <div class="form-group">
        <label class="flex items-center gap-2">
          <input
            v-model="form.isGM"
            type="checkbox"
          />
          <span>Game Master Mode</span>
        </label>
        <p class="text-xs text-gray-500 mt-1">
          {{ form.isGM ? 'GM tools: NPCs, dangers, campaign management' : 'PC mode: Player character focus' }}
        </p>
      </div>

      <!-- Actions -->
      <div class="form-actions">
        <button
          type="button"
          class="btn-secondary"
          @click="$emit('cancel')"
        >
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
import type { Playspace } from '~/shared/stores/playspace'
import { HACKS } from '~/server/config/systems.config'

const props = defineProps<{
  initialData?: Partial<Playspace>
  loading?: boolean
}>()

const emit = defineEmits<{
  submit: [data: { name: string; description?: string; hackId: string; universeId?: string | null; isGM: boolean }]
  cancel: []
}>()

// Form state
const form = ref({
  name: props.initialData?.name || '',
  description: props.initialData?.description || '',
  hackId: props.initialData?.hackId || '',
  universeId: props.initialData?.universeId || '',
  isGM: props.initialData?.isGM ?? false
})

// Default universe info
const defaultUniverseName = computed(() => {
  if (!form.value.hackId) return 'N/A'
  return HACKS[form.value.hackId as keyof typeof HACKS]?.defaultUniverse || 'N/A'
})

const defaultUniversePlaceholder = computed(() => {
  return `Default: ${defaultUniverseName.value}`
})

// Validation
const isValid = computed(() => {
  return form.value.name.length >= 2 && form.value.hackId.length > 0
})

// Handle hack change (reset universe if switching hack)
function onHackChange() {
  // Optionnel : reset universeId si on change de hack
  // form.value.universeId = ''
}

// Handle submit
function handleSubmit() {
  if (!isValid.value) return

  emit('submit', {
    name: form.value.name,
    description: form.value.description || undefined,
    hackId: form.value.hackId,
    universeId: form.value.universeId || null,
    isGM: form.value.isGM
  })
}

// Watch initialData changes (for edit mode)
watch(
  () => props.initialData,
  (newData) => {
    if (newData) {
      form.value = {
        name: newData.name || '',
        description: newData.description || '',
        hackId: newData.hackId || '',
        universeId: newData.universeId || '',
        isGM: newData.isGM ?? false
      }
    }
  },
  { immediate: true }
)
</script>

<style scoped>
.playspace-form {
  @apply max-w-2xl;
}

.form-group {
  @apply mb-4;
}

label {
  @apply block text-sm font-semibold mb-1 text-gray-700;
}

input[type="text"],
input[type="email"],
textarea,
select {
  @apply w-full border border-gray-300 rounded px-3 py-2;
  @apply focus:outline-none focus:ring-2 focus:ring-blue-500;
}

input[type="checkbox"] {
  @apply w-4 h-4;
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
