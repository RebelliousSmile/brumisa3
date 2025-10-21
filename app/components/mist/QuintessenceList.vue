<script setup lang="ts">
/**
 * Liste de quintessences pour HeroCard
 *
 * Gère les quintessences du personnage
 */

export interface Quintessence {
  id: string
  name: string
  description?: string
}

export interface QuintessenceListProps {
  quintessences: Quintessence[]
  editable?: boolean
}

const props = withDefaults(defineProps<QuintessenceListProps>(), {
  editable: false,
  quintessences: () => [],
})

const emit = defineEmits<{
  'update:quintessences': [quintessences: Quintessence[]]
}>()

const { tCharacter } = useI18nLitm()
const { isEditMode } = useEditMode()

const isEditing = computed(() => props.editable && isEditMode.value)

const handleAdd = () => {
  const newQuintessence: Quintessence = {
    id: `quint-${Date.now()}`,
    name: '',
    description: '',
  }
  emit('update:quintessences', [...props.quintessences, newQuintessence])
}

const handleDelete = (index: number) => {
  const updated = props.quintessences.filter((_, i) => i !== index)
  emit('update:quintessences', updated)
}

const handleUpdate = (index: number, value: string) => {
  const updated = [...props.quintessences]
  updated[index] = { ...updated[index], name: value }
  emit('update:quintessences', updated)
}
</script>

<template>
  <div class="quintessence-list">
    <div class="flex items-center justify-between mb-3">
      <h4 class="text-sm font-semibold text-gray-700 uppercase tracking-wide">
        {{ tCharacter('heroCard.quintessences') }}
      </h4>
      <LitmButton
        v-if="isEditing"
        variant="secondary"
        size="sm"
        @click="handleAdd"
      >
        {{ tCharacter('heroCard.addQuintessence') }}
      </LitmButton>
    </div>

    <div v-if="quintessences.length === 0" class="text-sm text-gray-400 italic">
      Aucune quintessence
    </div>

    <div v-else class="flex flex-wrap gap-2">
      <LitmEditableTag
        v-for="(quintessence, index) in quintessences"
        :key="quintessence.id"
        :model-value="quintessence.name"
        :editable="isEditing"
        type="neutral"
        :placeholder="tCharacter('quintessences.placeholder')"
        @update:model-value="handleUpdate(index, $event)"
        @delete="handleDelete(index)"
      />
    </div>
  </div>
</template>
