<script setup lang="ts">
/**
 * Tag éditable pour LITM
 *
 * Supporte deux modes:
 * - Lecture: affichage simple avec style power/weakness
 * - Edition: input inline avec bouton de suppression
 */

export interface EditableTagProps {
  modelValue: string
  editable?: boolean
  type?: 'power' | 'weakness' | 'neutral'
  placeholder?: string
}

const props = withDefaults(defineProps<EditableTagProps>(), {
  editable: false,
  type: 'neutral',
  placeholder: 'Saisir un tag...',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'delete': []
}>()

const isEditing = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

const handleDelete = () => {
  if (props.editable) {
    emit('delete')
  }
}

const startEditing = () => {
  if (props.editable) {
    isEditing.value = true
    nextTick(() => {
      inputRef.value?.focus()
    })
  }
}

const stopEditing = () => {
  isEditing.value = false
}

const typeClasses = computed(() => {
  const types = {
    power: 'bg-green-100 text-green-800 border-green-300',
    weakness: 'bg-red-100 text-red-800 border-red-300',
    neutral: 'bg-gray-100 text-gray-800 border-gray-300',
  }
  return types[props.type]
})
</script>

<template>
  <div
    :class="[
      'inline-flex items-center gap-1',
      'px-2 py-1 rounded-md border',
      'text-sm font-medium',
      typeClasses,
      editable && 'cursor-pointer',
    ]"
    @click="startEditing"
  >
    <input
      v-if="editable && isEditing"
      ref="inputRef"
      :value="modelValue"
      :placeholder="placeholder"
      :class="[
        'bg-transparent border-none outline-none',
        'min-w-[100px] max-w-[200px]',
        'text-sm font-medium',
      ]"
      @input="handleInput"
      @blur="stopEditing"
      @keydown.enter="stopEditing"
      @keydown.esc="stopEditing"
    />

    <span v-else>
      {{ modelValue || placeholder }}
    </span>

    <button
      v-if="editable"
      type="button"
      class="ml-1 text-gray-500 hover:text-red-600 transition-colors"
      @click.stop="handleDelete"
    >
      <svg
        class="w-3 h-3"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>
  </div>
</template>
