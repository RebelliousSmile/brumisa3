<script setup lang="ts">
/**
 * Carte de héros LITM
 *
 * Affiche:
 * - Nom du personnage
 * - Relations de compagnie
 * - Quintessences
 * - Sac à dos
 * - Backstory et Birthright (optionnels)
 */

import type { Relationship } from './RelationshipList.vue'
import type { Quintessence } from './QuintessenceList.vue'
import type { BackpackItem } from './BackpackList.vue'

export interface HeroCardProps {
  id: string
  name: string
  backstory?: string
  birthright?: string
  relationships?: Relationship[]
  quintessences?: Quintessence[]
  backpackItems?: BackpackItem[]
}

const props = withDefaults(defineProps<HeroCardProps>(), {
  backstory: '',
  birthright: '',
  relationships: () => [],
  quintessences: () => [],
  backpackItems: () => [],
})

const emit = defineEmits<{
  'update:name': [value: string]
  'update:backstory': [value: string]
  'update:birthright': [value: string]
  'update:relationships': [relationships: Relationship[]]
  'update:quintessences': [quintessences: Quintessence[]]
  'update:backpackItems': [items: BackpackItem[]]
  'delete': []
}>()

const { tCharacter } = useI18nLitm()
const { isEditMode } = useEditMode()

const isEditing = computed(() => isEditMode.value)

const handleNameUpdate = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:name', target.value)
}

const handleBackstoryUpdate = (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  emit('update:backstory', target.value)
}

const handleBirthrightUpdate = (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  emit('update:birthright', target.value)
}
</script>

<template>
  <LitmCardBase
    class="hero-card border-yellow-500 bg-yellow-50"
    elevation="lg"
    :flippable="false"
  >
    <template #header>
      <div class="flex items-center justify-between">
        <div class="flex-1">
          <div class="text-xs text-gray-600 uppercase tracking-wider mb-1">
            {{ tCharacter('heroCard.title') }}
          </div>
          <input
            v-if="isEditing"
            :value="name"
            :placeholder="tCharacter('heroCard.characterNamePlaceholder')"
            class="w-full text-xl font-bold text-gray-900 bg-transparent border-b-2 border-yellow-600 focus:outline-none focus:border-yellow-700"
            @input="handleNameUpdate"
          />
          <div v-else class="text-xl font-bold text-gray-900">
            {{ name || tCharacter('heroCard.noName') }}
          </div>
        </div>
        <div v-if="isEditing" class="ml-4">
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
      <div class="space-y-6">
        <!-- Backstory -->
        <div v-if="isEditing || backstory">
          <label class="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">
            Histoire (Backstory)
          </label>
          <textarea
            v-if="isEditing"
            :value="backstory"
            placeholder="Histoire du personnage..."
            class="w-full p-3 text-sm border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white"
            rows="3"
            @input="handleBackstoryUpdate"
          />
          <p v-else class="text-sm text-gray-800 whitespace-pre-wrap bg-white p-3 rounded-md border border-gray-200">
            {{ backstory }}
          </p>
        </div>

        <!-- Birthright -->
        <div v-if="isEditing || birthright">
          <label class="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">
            Droit de Naissance (Birthright)
          </label>
          <textarea
            v-if="isEditing"
            :value="birthright"
            placeholder="Droit de naissance..."
            class="w-full p-3 text-sm border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white"
            rows="2"
            @input="handleBirthrightUpdate"
          />
          <p v-else class="text-sm text-gray-800 whitespace-pre-wrap bg-white p-3 rounded-md border border-gray-200">
            {{ birthright }}
          </p>
        </div>

        <!-- Relationships -->
        <LitmRelationshipList
          :relationships="relationships"
          :editable="true"
          @update:relationships="$emit('update:relationships', $event)"
        />

        <!-- Quintessences -->
        <LitmQuintessenceList
          :quintessences="quintessences"
          :editable="true"
          @update:quintessences="$emit('update:quintessences', $event)"
        />

        <!-- Backpack -->
        <LitmBackpackList
          :items="backpackItems"
          :editable="true"
          @update:items="$emit('update:backpackItems', $event)"
        />
      </div>
    </template>
  </LitmCardBase>
</template>

<style scoped>
.hero-card {
  min-width: 350px;
  max-width: 500px;
}
</style>
