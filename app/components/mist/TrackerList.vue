<script setup lang="ts">
/**
 * Liste de trackers LITM (Status, Story Tags, Story Themes)
 *
 * Gère les trackers avec système de pips
 * - Status: états temporaires du personnage
 * - Story Tag: traits narratifs
 * - Story Theme: thèmes narratifs
 */

export interface Tracker {
  id: string
  type: 'status' | 'storyTag' | 'storyTheme'
  name: string
  totalPips: number
  activePips: number
}

export interface TrackerListProps {
  trackers: Tracker[]
  trackerType: 'status' | 'storyTag' | 'storyTheme'
  title: string
  addButtonLabel: string
  placeholder: string
  editable?: boolean
}

const props = withDefaults(defineProps<TrackerListProps>(), {
  editable: false,
  trackers: () => [],
})

const emit = defineEmits<{
  'update:trackers': [trackers: Tracker[]]
}>()

const { tTracker } = useI18nLitm()
const { isEditMode } = useEditMode()

const isEditing = computed(() => props.editable && isEditMode.value)

// Filter trackers by type
const filteredTrackers = computed(() => {
  return props.trackers.filter(t => t.type === props.trackerType)
})

const handleAdd = () => {
  const newTracker: Tracker = {
    id: `${props.trackerType}-${Date.now()}`,
    type: props.trackerType,
    name: '',
    totalPips: 3,
    activePips: 0,
  }
  emit('update:trackers', [...props.trackers, newTracker])
}

const handleDelete = (trackerId: string) => {
  const updated = props.trackers.filter(t => t.id !== trackerId)
  emit('update:trackers', updated)
}

const handleUpdateName = (trackerId: string, value: string) => {
  const updated = props.trackers.map(t =>
    t.id === trackerId ? { ...t, name: value } : t
  )
  emit('update:trackers', updated)
}

const handleUpdatePips = (trackerId: string, pips: number) => {
  const updated = props.trackers.map(t =>
    t.id === trackerId ? { ...t, activePips: pips } : t
  )
  emit('update:trackers', updated)
}

// Labels pour les pips (0-3)
const getPipLabels = () => {
  return {
    0: tTracker('pipTracker.abandon'),
    1: '',
    2: '',
    3: tTracker('pipTracker.improve'),
  }
}
</script>

<template>
  <div class="tracker-list">
    <div class="flex items-center justify-between mb-3">
      <h4 class="text-sm font-semibold text-gray-700 uppercase tracking-wide">
        {{ title }}
      </h4>
      <LitmButton
        v-if="isEditing"
        variant="secondary"
        size="sm"
        @click="handleAdd"
      >
        {{ addButtonLabel }}
      </LitmButton>
    </div>

    <div v-if="filteredTrackers.length === 0" class="text-sm text-gray-400 italic">
      Aucun tracker
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="tracker in filteredTrackers"
        :key="tracker.id"
        class="bg-white border border-gray-200 rounded-md p-3 shadow-sm"
      >
        <div class="flex items-start gap-3">
          <div class="flex-1 space-y-2">
            <!-- Name -->
            <input
              v-if="isEditing"
              :value="tracker.name"
              :placeholder="placeholder"
              class="w-full px-2 py-1 text-sm font-medium border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              @input="handleUpdateName(tracker.id, ($event.target as HTMLInputElement).value)"
            />
            <div v-else class="text-sm font-medium text-gray-900">
              {{ tracker.name || placeholder }}
            </div>

            <!-- Pips -->
            <LitmPipIndicator
              :current="tracker.activePips"
              :max="tracker.totalPips"
              :editable="isEditing"
              :labels="getPipLabels()"
              :show-percentage="false"
            />
          </div>

          <!-- Delete button -->
          <button
            v-if="isEditing"
            type="button"
            class="text-red-500 hover:text-red-700 transition-colors"
            @click="handleDelete(tracker.id)"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
