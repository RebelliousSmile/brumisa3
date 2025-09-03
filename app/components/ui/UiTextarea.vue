<template>
  <div class="space-y-2">
    <label v-if="label" :for="textareaId" class="block text-sm font-medium text-gray-300">
      {{ label }}
      <span v-if="required" class="text-red-400">*</span>
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
        <Icon name="heroicons:exclamation-circle" class="h-5 w-5 text-red-400" />
      </div>
    </div>
    
    <div class="flex justify-between items-center">
      <div>
        <p v-if="error" class="text-sm text-red-400">{{ error }}</p>
        <p v-else-if="hint" class="text-sm text-gray-400">{{ hint }}</p>
      </div>
      
      <div v-if="showCharCount && maxLength" class="text-sm text-gray-400">
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
  const baseClasses = 'w-full border rounded-lg transition-colors focus:outline-none font-serif'
  const resizeClasses = `resize-${props.resize}`
  
  const colorClasses = props.error
    ? 'bg-red-50 border-red-300 text-red-900 placeholder-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200'
    : props.disabled
    ? 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed'
    : 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-brand-violet focus:ring-2 focus:ring-brand-violet/20'
  
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