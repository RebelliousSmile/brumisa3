<script setup lang="ts">
/**
 * Liste de relations de compagnie pour HeroCard
 *
 * Affiche et gère les relations entre personnages
 */

export interface Relationship {
  id: string
  name: string
  description?: string
}

export interface RelationshipListProps {
  relationships: Relationship[]
  editable?: boolean
}

const props = withDefaults(defineProps<RelationshipListProps>(), {
  editable: false,
  relationships: () => [],
})

const emit = defineEmits<{
  'update:relationships': [relationships: Relationship[]]
}>()

const { tCharacter } = useI18nLitm()
const { isEditMode } = useEditMode()

const isEditing = computed(() => props.editable && isEditMode.value)

const handleAdd = () => {
  const newRelationship: Relationship = {
    id: `rel-${Date.now()}`,
    name: '',
    description: '',
  }
  emit('update:relationships', [...props.relationships, newRelationship])
}

const handleDelete = (index: number) => {
  const updated = props.relationships.filter((_, i) => i !== index)
  emit('update:relationships', updated)
}

const handleUpdateName = (index: number, value: string) => {
  const updated = [...props.relationships]
  updated[index] = { ...updated[index], name: value }
  emit('update:relationships', updated)
}

const handleUpdateDescription = (index: number, value: string) => {
  const updated = [...props.relationships]
  updated[index] = { ...updated[index], description: value }
  emit('update:relationships', updated)
}
</script>

<template>
  <div class="relationship-list">
    <div class="flex items-center justify-between mb-3">
      <h4 class="text-sm font-semibold text-gray-700 uppercase tracking-wide">
        {{ tCharacter('heroCard.relationships') }}
      </h4>
      <LitmButton
        v-if="isEditing"
        variant="secondary"
        size="sm"
        @click="handleAdd"
      >
        {{ tCharacter('heroCard.addRelationship') }}
      </LitmButton>
    </div>

    <div v-if="relationships.length === 0" class="text-sm text-gray-400 italic">
      Aucune relation
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="(relationship, index) in relationships"
        :key="relationship.id"
        class="bg-gray-50 border border-gray-200 rounded-md p-3"
      >
        <div class="flex items-start gap-2">
          <div class="flex-1 space-y-2">
            <!-- Name -->
            <div>
              <label class="block text-xs text-gray-600 mb-1">
                {{ tCharacter('heroCard.companion') }}
              </label>
              <input
                v-if="isEditing"
                :value="relationship.name"
                :placeholder="tCharacter('heroCard.companionPlaceholder')"
                class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                @input="handleUpdateName(index, ($event.target as HTMLInputElement).value)"
              />
              <div v-else class="text-sm font-medium text-gray-900">
                {{ relationship.name || tCharacter('heroCard.relationshipCompanionNoName') }}
              </div>
            </div>

            <!-- Description -->
            <div>
              <label class="block text-xs text-gray-600 mb-1">
                {{ tCharacter('heroCard.relationship') }}
              </label>
              <input
                v-if="isEditing"
                :value="relationship.description"
                :placeholder="tCharacter('heroCard.relationshipPlaceholder')"
                class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                @input="handleUpdateDescription(index, ($event.target as HTMLInputElement).value)"
              />
              <div v-else class="text-sm text-gray-700">
                {{ relationship.description || tCharacter('heroCard.relationshipRelationNoName') }}
              </div>
            </div>
          </div>

          <!-- Delete button -->
          <button
            v-if="isEditing"
            type="button"
            class="mt-1 text-red-500 hover:text-red-700 transition-colors"
            @click="handleDelete(index)"
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
