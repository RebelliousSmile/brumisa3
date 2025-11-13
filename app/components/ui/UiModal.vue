<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click="handleBackdropClick"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" />

        <!-- Modal Container -->
        <Transition
          enter-active-class="transition-all duration-300"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition-all duration-200"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="modelValue"
            :class="modalClasses"
            @click.stop
          >
            <!-- Header -->
            <div v-if="$slots.header || title" class="flex items-center justify-between p-6 border-b border-navy-600">
              <slot name="header">
                <h2 class="text-xl font-bold text-white">
                  {{ title }}
                </h2>
              </slot>

              <button
                v-if="!persistent"
                type="button"
                class="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                @click="handleClose"
              >
                <Icon name="heroicons:x-mark" class="w-5 h-5" />
              </button>
            </div>

            <!-- Body -->
            <div :class="bodyClasses">
              <slot />
            </div>

            <!-- Footer -->
            <div v-if="$slots.footer" class="flex items-center justify-end gap-3 p-6 border-t border-navy-600">
              <slot name="footer" />
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  persistent?: boolean
  scrollable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  persistent: false,
  scrollable: true
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  close: []
}>()

const modalClasses = computed(() => {
  const baseClasses = 'relative bg-navy-800 border border-navy-600 rounded-2xl shadow-2xl z-10 flex flex-col'

  const sizeClasses = {
    sm: 'max-w-md w-full',
    md: 'max-w-2xl w-full',
    lg: 'max-w-4xl w-full',
    xl: 'max-w-6xl w-full',
    full: 'max-w-7xl w-full mx-4'
  }

  const heightClass = props.scrollable ? 'max-h-[90vh]' : ''

  return `${baseClasses} ${sizeClasses[props.size]} ${heightClass}`
})

const bodyClasses = computed(() => {
  const baseClasses = 'p-6 text-gray-300'
  const scrollClass = props.scrollable ? 'overflow-y-auto' : ''

  return `${baseClasses} ${scrollClass}`
})

const handleClose = () => {
  if (!props.persistent) {
    emit('update:modelValue', false)
    emit('close')
  }
}

const handleBackdropClick = () => {
  handleClose()
}

// Lock body scroll when modal is open
watch(() => props.modelValue, (newValue) => {
  if (import.meta.client) {
    if (newValue) {
      document.body.classList.add('overflow-hidden')
    } else {
      document.body.classList.remove('overflow-hidden')
    }
  }
})

// Cleanup on unmount
onUnmounted(() => {
  if (import.meta.client) {
    document.body.classList.remove('overflow-hidden')
  }
})

// Escape key to close
onMounted(() => {
  if (import.meta.client) {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && props.modelValue && !props.persistent) {
        handleClose()
      }
    }

    document.addEventListener('keydown', handleEscape)

    onUnmounted(() => {
      document.removeEventListener('keydown', handleEscape)
    })
  }
})
</script>
