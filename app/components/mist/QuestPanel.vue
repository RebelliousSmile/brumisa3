<script setup lang="ts">
/**
 * Panel de quête pour les cartes de thème LITM
 *
 * Affiche le texte de la quête et les pips de progression
 * Éditable en mode édition
 */

export interface QuestPanelProps {
  text: string
  progressPips?: number
  totalPips?: number
  editable?: boolean
}

const props = withDefaults(defineProps<QuestPanelProps>(), {
  progressPips: 0,
  totalPips: 9,
  editable: false,
})

const emit = defineEmits<{
  'update:text': [value: string]
  'update:progressPips': [value: number]
}>()

const { tCard } = useI18nLitm()
const { isEditMode } = useEditMode()

const isEditing = computed(() => props.editable && isEditMode.value)

const handleTextInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  emit('update:text', target.value)
}

const handlePipsUpdate = (newValue: number) => {
  emit('update:progressPips', newValue)
}
</script>

<template>
  <div class="quest-panel bg-amber-50 border border-amber-200 rounded-lg p-4">
    <!-- En-tête -->
    <div class="flex items-center justify-between mb-3">
      <h4 class="text-sm font-semibold text-amber-900 uppercase tracking-wide">
        {{ tCard('themeCard.questTitle') }}
      </h4>
    </div>

    <!-- Texte de la quête -->
    <div class="mb-4">
      <textarea
        v-if="isEditing"
        :value="text"
        :placeholder="tCard('themeCard.questPlaceholder')"
        class="w-full p-2 text-sm border border-amber-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
        rows="3"
        @input="handleTextInput"
      />
      <p
        v-else
        class="text-sm text-gray-800 whitespace-pre-wrap"
        :class="{ 'italic text-gray-400': !text }"
      >
        {{ text || tCard('themeCard.noQuest') }}
      </p>
    </div>

    <!-- Indicateur de progression -->
    <div class="flex items-center gap-2">
      <span class="text-xs text-gray-600 font-medium">Progression:</span>
      <LitmPipIndicator
        :current="progressPips"
        :max="totalPips"
        :editable="isEditing"
        @update:current="handlePipsUpdate"
      />
    </div>
  </div>
</template>

<style scoped>
.quest-panel {
  transition: all 0.2s ease;
}

.quest-panel:hover {
  box-shadow: 0 2px 8px rgba(217, 119, 6, 0.1);
}
</style>
