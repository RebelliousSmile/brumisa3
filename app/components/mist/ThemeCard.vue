<script setup lang="ts">
/**
 * Carte de thème LITM (Origin, Fellowship, Expertise, Mythos)
 *
 * Affiche:
 * - Type de carte et themebook
 * - Main tag (trait principal)
 * - Power tags (atouts)
 * - Weakness tags (contraintes)
 * - Quest panel (quête avec pips)
 * - Improvements (améliorations spéciales)
 */

export interface ThemeCardTag {
  id: string
  text: string
  isPower: boolean
}

export interface ThemeCardQuest {
  text: string
  progressPips: number
  totalPips: number
}

export interface ThemeCardProps {
  id: string
  type: 'origin' | 'fellowship' | 'expertise' | 'mythos'
  themebook: string
  title: string
  mainTag?: string
  powerTags?: ThemeCardTag[]
  weaknessTags?: ThemeCardTag[]
  quest?: ThemeCardQuest
  improvements?: string[]
  flippable?: boolean
}

const props = withDefaults(defineProps<ThemeCardProps>(), {
  mainTag: '',
  powerTags: () => [],
  weaknessTags: () => [],
  improvements: () => [],
  flippable: true,
})

const emit = defineEmits<{
  'update:mainTag': [value: string]
  'update:powerTags': [tags: ThemeCardTag[]]
  'update:weaknessTags': [tags: ThemeCardTag[]]
  'update:quest': [quest: ThemeCardQuest]
  'update:improvements': [improvements: string[]]
  'delete': []
}>()

const { tCard } = useI18nLitm()
const { isEditMode } = useEditMode()

const isEditing = computed(() => isEditMode.value)

// Type label mapping
const typeLabels: Record<string, string> = {
  origin: 'Origine',
  fellowship: 'Compagnie',
  expertise: 'Expertise',
  mythos: 'Mythe',
}

const typeLabel = computed(() => typeLabels[props.type] || props.type)

// Colors per type
const typeColors: Record<string, string> = {
  origin: 'border-blue-500 bg-blue-50',
  fellowship: 'border-green-500 bg-green-50',
  expertise: 'border-purple-500 bg-purple-50',
  mythos: 'border-red-500 bg-red-50',
}

const cardColor = computed(() => typeColors[props.type] || 'border-gray-500 bg-gray-50')

// Tag management
const handleAddPowerTag = () => {
  const newTag: ThemeCardTag = {
    id: `power-${Date.now()}`,
    text: '',
    isPower: true,
  }
  emit('update:powerTags', [...props.powerTags, newTag])
}

const handleAddWeaknessTag = () => {
  const newTag: ThemeCardTag = {
    id: `weakness-${Date.now()}`,
    text: '',
    isPower: false,
  }
  emit('update:weaknessTags', [...props.weaknessTags, newTag])
}

const handleDeletePowerTag = (index: number) => {
  const updatedTags = props.powerTags.filter((_, i) => i !== index)
  emit('update:powerTags', updatedTags)
}

const handleDeleteWeaknessTag = (index: number) => {
  const updatedTags = props.weaknessTags.filter((_, i) => i !== index)
  emit('update:weaknessTags', updatedTags)
}

const handleUpdatePowerTag = (index: number, value: string) => {
  const updatedTags = [...props.powerTags]
  updatedTags[index] = { ...updatedTags[index], text: value }
  emit('update:powerTags', updatedTags)
}

const handleUpdateWeaknessTag = (index: number, value: string) => {
  const updatedTags = [...props.weaknessTags]
  updatedTags[index] = { ...updatedTags[index], text: value }
  emit('update:weaknessTags', updatedTags)
}

// Quest management
const handleQuestTextUpdate = (text: string) => {
  if (props.quest) {
    emit('update:quest', { ...props.quest, text })
  }
}

const handleQuestPipsUpdate = (pips: number) => {
  if (props.quest) {
    emit('update:quest', { ...props.quest, progressPips: pips })
  }
}

// Main tag editing
const handleMainTagUpdate = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:mainTag', target.value)
}
</script>

<template>
  <LitmCardBase
    :class="['theme-card', cardColor]"
    :flippable="flippable"
    elevation="md"
  >
    <template #header>
      <div class="flex items-center justify-between">
        <div>
          <div class="text-xs text-gray-600 uppercase tracking-wider">
            {{ typeLabel }}
          </div>
          <div class="text-lg font-bold text-gray-900">
            {{ themebook || tCard('themeCard.noName') }}
          </div>
        </div>
        <div v-if="isEditing" class="flex gap-2">
          <LitmButton
            variant="danger"
            size="sm"
            @click="$emit('delete')"
          >
            Supprimer
          </LitmButton>
        </div>
      </div>
    </template>

    <template #front>
      <div class="space-y-4">
        <!-- Main Tag -->
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">
            Trait Principal
          </label>
          <input
            v-if="isEditing"
            :value="mainTag"
            :placeholder="tCard('themeCard.placeholderName')"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            @input="handleMainTagUpdate"
          />
          <div
            v-else
            class="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900 font-medium"
          >
            {{ mainTag || tCard('themeCard.placeholderName') }}
          </div>
        </div>

        <!-- Power Tags -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <label class="text-xs font-medium text-gray-700 uppercase">
              {{ tCard('themeCard.power') }}
            </label>
            <LitmButton
              v-if="isEditing"
              variant="secondary"
              size="sm"
              @click="handleAddPowerTag"
            >
              {{ tCard('themeCard.addPowerTag') }}
            </LitmButton>
          </div>
          <div class="flex flex-wrap gap-2">
            <LitmEditableTag
              v-for="(tag, index) in powerTags"
              :key="tag.id"
              :model-value="tag.text"
              :editable="isEditing"
              type="power"
              :placeholder="tCard('tagItem.placeholder')"
              @update:model-value="handleUpdatePowerTag(index, $event)"
              @delete="handleDeletePowerTag(index)"
            />
            <div
              v-if="powerTags.length === 0"
              class="text-sm text-gray-400 italic"
            >
              Aucun atout
            </div>
          </div>
        </div>

        <!-- Weakness Tags -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <label class="text-xs font-medium text-gray-700 uppercase">
              {{ tCard('themeCard.weakness') }}
            </label>
            <LitmButton
              v-if="isEditing"
              variant="secondary"
              size="sm"
              @click="handleAddWeaknessTag"
            >
              {{ tCard('themeCard.addWeaknessTag') }}
            </LitmButton>
          </div>
          <div class="flex flex-wrap gap-2">
            <LitmEditableTag
              v-for="(tag, index) in weaknessTags"
              :key="tag.id"
              :model-value="tag.text"
              :editable="isEditing"
              type="weakness"
              :placeholder="tCard('tagItem.placeholder')"
              @update:model-value="handleUpdateWeaknessTag(index, $event)"
              @delete="handleDeleteWeaknessTag(index)"
            />
            <div
              v-if="weaknessTags.length === 0"
              class="text-sm text-gray-400 italic"
            >
              Aucune contrainte
            </div>
          </div>
        </div>

        <!-- Quest -->
        <LitmQuestPanel
          v-if="quest"
          :text="quest.text"
          :progress-pips="quest.progressPips"
          :total-pips="quest.totalPips"
          :editable="true"
          @update:text="handleQuestTextUpdate"
          @update:progress-pips="handleQuestPipsUpdate"
        />
      </div>
    </template>

    <template #back>
      <div class="space-y-4">
        <div class="text-center text-gray-600">
          <p class="text-lg font-semibold mb-2">{{ themebook }}</p>
          <p class="text-sm">Type: {{ typeLabel }}</p>
        </div>

        <!-- Improvements on back -->
        <div v-if="improvements && improvements.length > 0">
          <h4 class="text-sm font-semibold text-gray-700 mb-2">
            {{ tCard('themeCard.improvements') }}
          </h4>
          <ul class="space-y-1">
            <li
              v-for="(improvement, index) in improvements"
              :key="index"
              class="text-sm text-gray-600"
            >
              {{ improvement }}
            </li>
          </ul>
        </div>
      </div>
    </template>
  </LitmCardBase>
</template>

<style scoped>
.theme-card {
  transition: all 0.3s ease;
  min-width: 300px;
  max-width: 400px;
}

.theme-card:hover {
  transform: translateY(-2px);
}
</style>
