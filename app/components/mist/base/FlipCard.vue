<script setup lang="ts">
/**
 * Carte avec animation de flip recto/verso
 *
 * Supporte le v-model pour contrôler l'état flipped depuis le parent
 */

export interface FlipCardProps {
  flipped?: boolean
  duration?: number
}

const props = withDefaults(defineProps<FlipCardProps>(), {
  flipped: false,
  duration: 600,
})

const emit = defineEmits<{
  'update:flipped': [value: boolean]
}>()

const isFlipped = ref(props.flipped)

watch(() => props.flipped, (newValue) => {
  isFlipped.value = newValue
})

const toggleFlip = () => {
  isFlipped.value = !isFlipped.value
  emit('update:flipped', isFlipped.value)
}
</script>

<template>
  <div class="flip-card-container" @click="toggleFlip">
    <div
      :class="['flip-card-inner', { flipped: isFlipped }]"
      :style="{ transitionDuration: `${duration}ms` }"
    >
      <!-- Face avant -->
      <div class="flip-card-face flip-card-front">
        <slot name="front">
          <div class="p-4 bg-white rounded-lg border border-gray-200">
            <p class="text-gray-500">Face avant</p>
          </div>
        </slot>
      </div>

      <!-- Face arrière -->
      <div class="flip-card-face flip-card-back">
        <slot name="back">
          <div class="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p class="text-gray-500">Face arrière</p>
          </div>
        </slot>
      </div>
    </div>
  </div>
</template>

<style scoped>
.flip-card-container {
  perspective: 1000px;
  cursor: pointer;
}

.flip-card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.6s;
  transform-style: preserve-3d;
}

.flip-card-inner.flipped {
  transform: rotateY(180deg);
}

.flip-card-face {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.flip-card-front {
  transform: rotateY(0deg);
}

.flip-card-back {
  transform: rotateY(180deg);
}
</style>
