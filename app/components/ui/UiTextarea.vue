<template>
  <div class="space-y-2">
    <label v-if="label" :for="textareaId" class="block text-sm font-medium text-otherscape-cyan-neon">
      {{ label }}
      <span v-if="required" class="text-otherscape-rose-neon">*</span>
    </label>
    
    <div class="relative">
      <textarea
        :id="textareaId"
        :value="modelValue"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        :rows="rows"
        :class="textareaClasses"
        @input="handleInput"
        @blur="$emit('blur', $event)"
        @focus="$emit('focus', $event)"
      />
      
      <div v-if="error" class="absolute top-3 right-3">
        <Icon name="heroicons:exclamation-circle" class="h-5 w-5 text-otherscape-rose-neon" />
      </div>
    </div>

    <div class="flex justify-between items-center">
      <div>
        <p v-if="error" class="text-sm text-otherscape-rose-neon">{{ error }}</p>
        <p v-else-if="hint" class="text-sm text-otherscape-gris-clair">{{ hint }}</p>
      </div>

      <div v-if="showCharCount && maxLength" class="text-sm text-otherscape-gris-clair">
        {{ characterCount }}/{{ maxLength }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue?: string
  label?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  error?: string
  hint?: string
  rows?: number
  maxLength?: number
  showCharCount?: boolean
  resize?: 'none' | 'vertical' | 'horizontal' | 'both'
}

const props = withDefaults(defineProps<Props>(), {
  rows: 4,
  resize: 'vertical',
  showCharCount: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]
}>()

const textareaId = computed(() => `textarea-${Math.random().toString(36).substr(2, 9)}`)

const characterCount = computed(() => (props.modelValue || '').length)

const textareaClasses = computed(() => {
  const baseClasses = 'w-full border rounded-lg transition-colors focus:outline-none font-otherscape'
  const resizeClasses = `resize-${props.resize}`
  
  const colorClasses = props.error
    ? 'bg-otherscape-noir-card border-otherscape-rose-neon text-otherscape-blanc placeholder-otherscape-rose-neon/50 focus:border-otherscape-rose-neon focus:ring-2 focus:ring-otherscape-rose-neon/20'
    : props.disabled
    ? 'bg-otherscape-noir-card border-otherscape-gris-moyen/30 text-otherscape-gris-moyen cursor-not-allowed opacity-50'
    : 'bg-otherscape-noir-card border-otherscape-cyan-neon/30 text-otherscape-blanc placeholder-otherscape-gris-moyen focus:border-otherscape-cyan-neon focus:ring-2 focus:ring-otherscape-cyan-neon/20'
  
  return `${baseClasses} ${resizeClasses} ${colorClasses} px-4 py-3`
})

const handleInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  const value = target.value
  
  // Enforce max length if specified
  if (props.maxLength && value.length > props.maxLength) {
    return
  }
  
  emit('update:modelValue', value)
}
</script>