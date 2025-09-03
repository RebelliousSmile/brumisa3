<template>
  <component
    :is="tag"
    :to="to"
    :href="href"
    :type="buttonType"
    :disabled="disabled || loading"
    :class="buttonClasses"
    v-bind="$attrs"
    @click="handleClick"
  >
    <Icon
      v-if="loading"
      name="heroicons:arrow-path"
      class="animate-spin mr-2"
      :class="iconSizeClasses"
    />
    <Icon
      v-else-if="icon"
      :name="icon"
      :class="[iconSizeClasses, { 'mr-2': $slots.default }]"
    />
    
    <slot />
    
    <Icon
      v-if="iconRight"
      :name="iconRight"
      :class="[iconSizeClasses, { 'ml-2': $slots.default }]"
    />
  </component>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
  disabled?: boolean
  icon?: string
  iconRight?: string
  to?: string
  href?: string
  type?: 'button' | 'submit' | 'reset'
  fullWidth?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  type: 'button'
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const tag = computed(() => {
  if (props.to) return 'NuxtLink'
  if (props.href) return 'a'
  return 'button'
})

const buttonType = computed(() => {
  return tag.value === 'button' ? props.type : undefined
})

const buttonClasses = computed(() => {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-display'
  
  const sizeClasses = {
    xs: 'px-2.5 py-1.5 text-xs rounded',
    sm: 'px-3 py-2 text-sm rounded-md',
    md: 'px-4 py-2.5 text-sm rounded-lg',
    lg: 'px-5 py-3 text-base rounded-lg',
    xl: 'px-6 py-4 text-lg rounded-xl'
  }
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-brand-violet to-blue-600 text-white hover:from-blue-600 hover:to-brand-violet focus:ring-brand-violet',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
  }
  
  const widthClass = props.fullWidth ? 'w-full' : ''
  
  return `${baseClasses} ${sizeClasses[props.size]} ${variantClasses[props.variant]} ${widthClass}`
})

const iconSizeClasses = computed(() => {
  const sizeMap = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6'
  }
  return sizeMap[props.size]
})

const handleClick = (event: MouseEvent) => {
  if (props.disabled || props.loading) {
    event.preventDefault()
    return
  }
  emit('click', event)
}
</script>