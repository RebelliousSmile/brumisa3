<script setup lang="ts">
/**
 * Bouton stylisé pour l'interface LITM
 *
 * Variantes disponibles: primary, secondary, danger, ghost
 * Tailles disponibles: sm, md, lg
 */

export interface LitmButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  type?: 'button' | 'submit' | 'reset'
}

const props = withDefaults(defineProps<LitmButtonProps>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  type: 'button',
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}

const variantClasses = computed(() => {
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white border-blue-700',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900 border-gray-300',
    danger: 'bg-red-600 hover:bg-red-700 text-white border-red-700',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 border-gray-300',
  }
  return variants[props.variant]
})

const sizeClasses = computed(() => {
  const sizes = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }
  return sizes[props.size]
})

const disabledClasses = computed(() => {
  return props.disabled || props.loading
    ? 'opacity-50 cursor-not-allowed'
    : 'cursor-pointer'
})
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="[
      'inline-flex items-center justify-center',
      'font-medium rounded-md border',
      'transition-colors duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
      variantClasses,
      sizeClasses,
      disabledClasses,
    ]"
    @click="handleClick"
  >
    <span v-if="loading" class="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
    <slot />
  </button>
</template>
