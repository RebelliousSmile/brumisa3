<template>
  <div class="space-y-2">
    <label v-if="label" :for="inputId" class="block text-sm font-medium text-gray-300">
      {{ label }}
      <span v-if="required" class="text-red-400">*</span>
    </label>
    
    <div class="relative">
      <input
        :id="inputId"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        :class="inputClasses"
        @input="handleInput"
        @blur="$emit('blur', $event)"
        @focus="$emit('focus', $event)"
      />
      
      <div v-if="error" class="absolute inset-y-0 right-0 pr-3 flex items-center">
        <Icon name="heroicons:exclamation-circle" class="h-5 w-5 text-red-400" />
      </div>
    </div>
    
    <p v-if="error" class="text-sm text-red-400">{{ error }}</p>
    <p v-else-if="hint" class="text-sm text-gray-400">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue?: string | number
  type?: string
  label?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  error?: string
  hint?: string
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  size: 'md'
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]
}>()

const inputId = computed(() => `input-${Math.random().toString(36).substr(2, 9)}`)

const inputClasses = computed(() => {
  const baseClasses = 'w-full border rounded-lg transition-colors focus:outline-none font-serif'
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-4 py-4 text-lg'
  }
  
  const colorClasses = props.error
    ? 'bg-red-50 border-red-300 text-red-900 placeholder-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200'
    : props.disabled
    ? 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed'
    : 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-brand-violet focus:ring-2 focus:ring-brand-violet/20'
  
  return `${baseClasses} ${sizeClasses[props.size]} ${colorClasses}`
})

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = props.type === 'number' ? Number(target.value) : target.value
  emit('update:modelValue', value)
}
</script>