<template>
  <div class="space-y-2">
    <label v-if="label" :for="inputId" class="block text-sm font-medium text-otherscape-cyan-neon">
      {{ label }}
      <span v-if="required" class="text-otherscape-rose-neon">*</span>
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
        <Icon name="heroicons:exclamation-circle" class="h-5 w-5 text-otherscape-rose-neon" />
      </div>
    </div>

    <p v-if="error" class="text-sm text-otherscape-rose-neon">{{ error }}</p>
    <p v-else-if="hint" class="text-sm text-otherscape-gris-clair">{{ hint }}</p>
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
  const baseClasses = 'w-full border rounded-lg transition-colors focus:outline-none font-otherscape'
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-4 py-4 text-lg'
  }
  
  const colorClasses = props.error
    ? 'bg-otherscape-noir-card border-otherscape-rose-neon text-otherscape-blanc placeholder-otherscape-rose-neon/50 focus:border-otherscape-rose-neon focus:ring-2 focus:ring-otherscape-rose-neon/20'
    : props.disabled
    ? 'bg-otherscape-noir-card border-otherscape-gris-moyen/30 text-otherscape-gris-moyen cursor-not-allowed opacity-50'
    : 'bg-otherscape-noir-card border-otherscape-cyan-neon/30 text-otherscape-blanc placeholder-otherscape-gris-moyen focus:border-otherscape-cyan-neon focus:ring-2 focus:ring-otherscape-cyan-neon/20'
  
  return `${baseClasses} ${sizeClasses[props.size]} ${colorClasses}`
})

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = props.type === 'number' ? Number(target.value) : target.value
  emit('update:modelValue', value)
}
</script>