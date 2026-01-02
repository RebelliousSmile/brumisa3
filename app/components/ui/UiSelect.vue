<template>
  <div class="space-y-2">
    <label v-if="label" :for="selectId" class="block text-sm font-medium text-otherscape-cyan-neon">
      {{ label }}
      <span v-if="required" class="text-otherscape-rose-neon">*</span>
    </label>
    
    <div class="relative">
      <select
        :id="selectId"
        :value="modelValue"
        :required="required"
        :disabled="disabled"
        :class="selectClasses"
        @change="handleChange"
        @blur="$emit('blur', $event)"
        @focus="$emit('focus', $event)"
      >
        <option v-if="placeholder" value="">{{ placeholder }}</option>
        <option
          v-for="option in options"
          :key="option.value"
          :value="option.value"
          :disabled="option.disabled"
        >
          {{ option.label }}
        </option>
      </select>
      
      <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        <Icon
          v-if="error"
          name="heroicons:exclamation-circle"
          class="h-5 w-5 text-otherscape-rose-neon"
        />
        <Icon
          v-else
          name="heroicons:chevron-down"
          class="h-5 w-5 text-otherscape-cyan-neon"
        />
      </div>
    </div>

    <p v-if="error" class="text-sm text-otherscape-rose-neon">{{ error }}</p>
    <p v-else-if="hint" class="text-sm text-otherscape-gris-clair">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
interface Option {
  value: string | number
  label: string
  disabled?: boolean
}

interface Props {
  modelValue?: string | number
  label?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  error?: string
  hint?: string
  options: Option[]
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md'
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]
}>()

const selectId = computed(() => `select-${Math.random().toString(36).substr(2, 9)}`)

const selectClasses = computed(() => {
  const baseClasses = 'w-full border rounded-lg transition-colors focus:outline-none font-otherscape appearance-none'
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-4 py-4 text-lg'
  }
  
  const colorClasses = props.error
    ? 'bg-otherscape-noir-card border-otherscape-rose-neon text-otherscape-blanc focus:border-otherscape-rose-neon focus:ring-2 focus:ring-otherscape-rose-neon/20'
    : props.disabled
    ? 'bg-otherscape-noir-card border-otherscape-gris-moyen/30 text-otherscape-gris-moyen cursor-not-allowed opacity-50'
    : 'bg-otherscape-noir-card border-otherscape-cyan-neon/30 text-otherscape-blanc focus:border-otherscape-cyan-neon focus:ring-2 focus:ring-otherscape-cyan-neon/20'
  
  return `${baseClasses} ${sizeClasses[props.size]} ${colorClasses}`
})

const handleChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  emit('update:modelValue', target.value)
}
</script>