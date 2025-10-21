<script setup lang="ts">
/**
 * Liste du sac à dos pour HeroCard
 *
 * Gère les objets du sac à dos du personnage
 */

export interface BackpackItem {
  id: string
  name: string
}

export interface BackpackListProps {
  items: BackpackItem[]
  editable?: boolean
}

const props = withDefaults(defineProps<BackpackListProps>(), {
  editable: false,
  items: () => [],
})

const emit = defineEmits<{
  'update:items': [items: BackpackItem[]]
}>()

const { tCharacter } = useI18nLitm()
const { isEditMode } = useEditMode()

const isEditing = computed(() => props.editable && isEditMode.value)

const handleAdd = () => {
  const newItem: BackpackItem = {
    id: `item-${Date.now()}`,
    name: '',
  }
  emit('update:items', [...props.items, newItem])
}

const handleDelete = (index: number) => {
  const updated = props.items.filter((_, i) => i !== index)
  emit('update:items', updated)
}

const handleUpdate = (index: number, value: string) => {
  const updated = [...props.items]
  updated[index] = { ...updated[index], name: value }
  emit('update:items', updated)
}
</script>

<template>
  <div class="backpack-list">
    <div class="flex items-center justify-between mb-3">
      <h4 class="text-sm font-semibold text-gray-700 uppercase tracking-wide">
        {{ tCharacter('backpack.title') }}
      </h4>
      <LitmButton
        v-if="isEditing"
        variant="secondary"
        size="sm"
        @click="handleAdd"
      >
        {{ tCharacter('backpack.addItem') }}
      </LitmButton>
    </div>

    <div v-if="items.length === 0" class="text-sm text-gray-400 italic">
      Sac à dos vide
    </div>

    <ul v-else class="space-y-2">
      <li
        v-for="(item, index) in items"
        :key="item.id"
        class="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded px-3 py-2"
      >
        <span class="text-gray-400">•</span>
        <input
          v-if="isEditing"
          :value="item.name"
          :placeholder="tCharacter('backpack.placeholder')"
          class="flex-1 bg-transparent border-none outline-none text-sm focus:ring-0"
          @input="handleUpdate(index, ($event.target as HTMLInputElement).value)"
        />
        <span v-else class="flex-1 text-sm text-gray-900">
          {{ item.name || tCharacter('backpack.noName') }}
        </span>
        <button
          v-if="isEditing"
          type="button"
          class="text-red-500 hover:text-red-700 transition-colors"
          @click="handleDelete(index)"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </li>
    </ul>
  </div>
</template>
