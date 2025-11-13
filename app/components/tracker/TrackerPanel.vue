<template>
  <div class="space-y-6">
    <!-- Statuses Tracker -->
    <div class="bg-navy-700 border border-navy-600 rounded-2xl p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-bold text-white flex items-center gap-2">
          <Icon name="heroicons:heart" class="w-5 h-5 text-red-400" />
          Statuses
        </h3>
        <UiButton
          size="sm"
          variant="outline"
          icon="heroicons:plus"
          @click="showAddStatusForm = true"
          :disabled="showAddStatusForm"
        >
          Ajouter
        </UiButton>
      </div>

      <!-- Add Status Form -->
      <div v-if="showAddStatusForm" class="mb-4 p-4 bg-navy-800 border border-navy-600 rounded-lg">
        <div class="space-y-3">
          <UiInput
            v-model="newStatus.name"
            placeholder="Ex: Blessé, Enhardi, Effrayé..."
            @keyup.enter="handleAddStatus"
          />

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs text-gray-400 mb-2">Tier (1-5)</label>
              <div class="flex items-center gap-2">
                <input
                  v-model.number="newStatus.tier"
                  type="range"
                  min="1"
                  max="5"
                  class="flex-1 h-2 bg-navy-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <span class="w-8 text-center text-white font-bold">{{ newStatus.tier }}</span>
              </div>
            </div>

            <div>
              <label class="block text-xs text-gray-400 mb-2">Type</label>
              <div class="flex gap-2">
                <button
                  type="button"
                  :class="statusTypeButtonClasses(true)"
                  @click="newStatus.positive = true"
                >
                  Positif
                </button>
                <button
                  type="button"
                  :class="statusTypeButtonClasses(false)"
                  @click="newStatus.positive = false"
                >
                  Négatif
                </button>
              </div>
            </div>
          </div>

          <div class="flex gap-2">
            <UiButton
              size="sm"
              variant="ghost"
              @click="cancelAddStatus"
            >
              Annuler
            </UiButton>
            <UiButton
              size="sm"
              variant="primary"
              @click="handleAddStatus"
              :disabled="!newStatus.name"
            >
              Ajouter
            </UiButton>
          </div>
        </div>
      </div>

      <!-- Statuses List -->
      <div v-if="trackers?.statuses && trackers.statuses.length > 0" class="space-y-2">
        <div
          v-for="status in trackers.statuses"
          :key="status.id"
          class="flex items-center gap-3 p-3 bg-navy-800 border border-navy-600 rounded-lg hover:border-blue-500/50 transition-colors"
        >
          <div class="flex-1">
            <div class="text-sm font-medium text-white">{{ status.name }}</div>
            <div class="text-xs text-gray-500">{{ getTierLabel(status.tier) }}</div>
          </div>

          <!-- Tier Pills -->
          <div class="flex gap-1">
            <div
              v-for="i in 5"
              :key="i"
              :class="tierPillClasses(i, status.tier, status.positive)"
            />
          </div>

          <!-- Delete Button -->
          <button
            type="button"
            class="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
            @click="handleRemoveStatus(status.id)"
          >
            <Icon name="heroicons:trash" class="w-4 h-4" />
          </button>
        </div>
      </div>

      <p v-else class="text-sm text-gray-500 italic">Aucun status actif</p>
    </div>

    <!-- Story Tags Tracker -->
    <div class="bg-navy-700 border border-navy-600 rounded-2xl p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-bold text-white flex items-center gap-2">
          <Icon name="heroicons:bookmark" class="w-5 h-5 text-blue-400" />
          Story Tags
        </h3>
        <UiButton
          size="sm"
          variant="outline"
          icon="heroicons:plus"
          @click="showAddStoryTagForm = true"
          :disabled="showAddStoryTagForm"
        >
          Ajouter
        </UiButton>
      </div>

      <!-- Add Story Tag Form -->
      <div v-if="showAddStoryTagForm" class="mb-4 p-4 bg-navy-800 border border-navy-600 rounded-lg">
        <div class="flex gap-2">
          <UiInput
            v-model="newStoryTag.name"
            placeholder="Ex: Recherche son père, Fuit son passé..."
            class="flex-1"
            @keyup.enter="handleAddStoryTag"
          />
          <UiButton
            size="sm"
            variant="ghost"
            @click="cancelAddStoryTag"
          >
            Annuler
          </UiButton>
          <UiButton
            size="sm"
            variant="primary"
            @click="handleAddStoryTag"
            :disabled="!newStoryTag.name"
          >
            Ajouter
          </UiButton>
        </div>
      </div>

      <!-- Story Tags List -->
      <div v-if="trackers?.storyTags && trackers.storyTags.length > 0" class="flex flex-wrap gap-2">
        <div
          v-for="tag in trackers.storyTags"
          :key="tag.id"
          class="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-600 text-white rounded-lg text-sm font-medium border border-blue-500/50 shadow-md"
        >
          <span>{{ tag.name }}</span>
          <button
            type="button"
            class="w-5 h-5 flex items-center justify-center hover:bg-white/20 rounded transition-colors"
            @click="handleRemoveStoryTag(tag.id)"
          >
            <Icon name="heroicons:x-mark" class="w-4 h-4" />
          </button>
        </div>
      </div>

      <p v-else class="text-sm text-gray-500 italic">Aucun story tag</p>
    </div>

    <!-- Story Themes Tracker -->
    <div class="bg-navy-700 border border-navy-600 rounded-2xl p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-bold text-white flex items-center gap-2">
          <Icon name="heroicons:sparkles" class="w-5 h-5 text-purple-400" />
          Story Themes
        </h3>
        <UiButton
          size="sm"
          variant="outline"
          icon="heroicons:plus"
          @click="showAddStoryThemeForm = true"
          :disabled="showAddStoryThemeForm"
        >
          Ajouter
        </UiButton>
      </div>

      <!-- Add Story Theme Form -->
      <div v-if="showAddStoryThemeForm" class="mb-4 p-4 bg-navy-800 border border-navy-600 rounded-lg">
        <div class="flex gap-2">
          <UiInput
            v-model="newStoryTheme.name"
            placeholder="Ex: Vengeance, Rédemption, Découverte..."
            class="flex-1"
            @keyup.enter="handleAddStoryTheme"
          />
          <UiButton
            size="sm"
            variant="ghost"
            @click="cancelAddStoryTheme"
          >
            Annuler
          </UiButton>
          <UiButton
            size="sm"
            variant="primary"
            @click="handleAddStoryTheme"
            :disabled="!newStoryTheme.name"
          >
            Ajouter
          </UiButton>
        </div>
      </div>

      <!-- Story Themes List -->
      <div v-if="trackers?.storyThemes && trackers.storyThemes.length > 0" class="flex flex-wrap gap-2">
        <div
          v-for="theme in trackers.storyThemes"
          :key="theme.id"
          class="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-sm font-medium border border-purple-500/50 shadow-md"
        >
          <span>{{ theme.name }}</span>
          <button
            type="button"
            class="w-5 h-5 flex items-center justify-center hover:bg-white/20 rounded transition-colors"
            @click="handleRemoveStoryTheme(theme.id)"
          >
            <Icon name="heroicons:x-mark" class="w-4 h-4" />
          </button>
        </div>
      </div>

      <p v-else class="text-sm text-gray-500 italic">Aucun story theme</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTrackers } from '~/composables/useTrackers'
import type { Trackers } from '~/shared/stores/character'

interface Props {
  characterId: string
  trackers: Trackers | null
  hackId: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  refresh: []
}>()

const { getTierLabel, getStatusColor, addStatus, removeStatus, addStoryTag, removeStoryTag, addStoryTheme, removeStoryTheme } = useTrackers()

// Show/hide forms
const showAddStatusForm = ref(false)
const showAddStoryTagForm = ref(false)
const showAddStoryThemeForm = ref(false)

// New status data
const newStatus = reactive({
  name: '',
  tier: 1,
  positive: true
})

// New story tag data
const newStoryTag = reactive({
  name: ''
})

// New story theme data
const newStoryTheme = reactive({
  name: ''
})

// Add status
async function handleAddStatus() {
  if (!newStatus.name || !props.trackers) return

  try {
    await addStatus(props.characterId, props.trackers, {
      name: newStatus.name,
      tier: newStatus.tier,
      positive: newStatus.positive
    })

    // Reset form
    newStatus.name = ''
    newStatus.tier = 1
    newStatus.positive = true
    showAddStatusForm.value = false

    emit('refresh')
  } catch (err) {
    console.error('Error adding status:', err)
  }
}

function cancelAddStatus() {
  newStatus.name = ''
  newStatus.tier = 1
  newStatus.positive = true
  showAddStatusForm.value = false
}

// Remove status
async function handleRemoveStatus(statusId: string) {
  if (!props.trackers) return

  try {
    await removeStatus(props.characterId, props.trackers, statusId)
    emit('refresh')
  } catch (err) {
    console.error('Error removing status:', err)
  }
}

// Add story tag
async function handleAddStoryTag() {
  if (!newStoryTag.name || !props.trackers) return

  try {
    await addStoryTag(props.characterId, props.trackers, {
      name: newStoryTag.name
    })

    newStoryTag.name = ''
    showAddStoryTagForm.value = false

    emit('refresh')
  } catch (err) {
    console.error('Error adding story tag:', err)
  }
}

function cancelAddStoryTag() {
  newStoryTag.name = ''
  showAddStoryTagForm.value = false
}

// Remove story tag
async function handleRemoveStoryTag(storyTagId: string) {
  if (!props.trackers) return

  try {
    await removeStoryTag(props.characterId, props.trackers, storyTagId)
    emit('refresh')
  } catch (err) {
    console.error('Error removing story tag:', err)
  }
}

// Add story theme
async function handleAddStoryTheme() {
  if (!newStoryTheme.name || !props.trackers) return

  try {
    await addStoryTheme(props.characterId, props.trackers, {
      name: newStoryTheme.name
    })

    newStoryTheme.name = ''
    showAddStoryThemeForm.value = false

    emit('refresh')
  } catch (err) {
    console.error('Error adding story theme:', err)
  }
}

function cancelAddStoryTheme() {
  newStoryTheme.name = ''
  showAddStoryThemeForm.value = false
}

// Remove story theme
async function handleRemoveStoryTheme(storyThemeId: string) {
  if (!props.trackers) return

  try {
    await removeStoryTheme(props.characterId, props.trackers, storyThemeId)
    emit('refresh')
  } catch (err) {
    console.error('Error removing story theme:', err)
  }
}

// Status type button classes
function statusTypeButtonClasses(isPositive: boolean) {
  const isSelected = newStatus.positive === isPositive
  const baseClasses = 'flex-1 px-3 py-2 text-xs font-medium rounded-lg border-2 transition-all'

  if (isSelected) {
    return isPositive
      ? `${baseClasses} bg-gradient-to-r from-green-600 to-emerald-600 border-green-500 text-white`
      : `${baseClasses} bg-gradient-to-r from-red-600 to-rose-600 border-red-500 text-white`
  }

  return isPositive
    ? `${baseClasses} bg-navy-700 border-green-500/30 text-green-400 hover:border-green-500`
    : `${baseClasses} bg-navy-700 border-red-500/30 text-red-400 hover:border-red-500`
}

// Tier pills classes
function tierPillClasses(position: number, currentTier: number, positive: boolean) {
  const baseClasses = 'w-2 h-6 rounded-full transition-all'
  const isFilled = position <= currentTier

  if (!isFilled) {
    return `${baseClasses} bg-navy-600`
  }

  return positive
    ? `${baseClasses} bg-green-500`
    : `${baseClasses} bg-red-500`
}
</script>
