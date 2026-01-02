<script setup lang="ts">
/**
 * UiStepper - Stepper avec style neon cyberpunk Otherscape
 *
 * Design system: Cyan neon glow, transitions fluides
 * Accessibilite: aria-current, contrastes WCAG AAA
 */

interface Props {
  /** Etape actuelle (1-based) */
  currentStep: number
  /** Labels des etapes */
  labels: string[]
}

const props = defineProps<Props>()

const totalSteps = computed(() => props.labels.length)
</script>

<template>
  <div class="stepper" role="navigation" aria-label="Progression">
    <div class="stepper-container">
      <template v-for="(label, index) in labels" :key="index">
        <!-- Step item -->
        <div
          class="step-item"
          :class="{
            'step-active': currentStep === index + 1,
            'step-completed': currentStep > index + 1,
            'step-pending': currentStep < index + 1
          }"
        >
          <!-- Circle -->
          <div
            class="step-circle"
            :aria-current="currentStep === index + 1 ? 'step' : undefined"
          >
            <Icon
              v-if="currentStep > index + 1"
              name="heroicons:check"
              class="step-check-icon"
            />
            <span v-else class="step-number">{{ index + 1 }}</span>
          </div>

          <!-- Label -->
          <span class="step-label">{{ label }}</span>
        </div>

        <!-- Connector line -->
        <div
          v-if="index < totalSteps - 1"
          class="step-connector"
          :class="{ 'connector-active': currentStep > index + 1 }"
        />
      </template>
    </div>
  </div>
</template>

<style scoped>
.stepper {
  margin-bottom: 2rem;
}

.stepper-container {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 1;
}

/* Circle styles */
.step-circle {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Assistant', sans-serif;
  font-weight: 800;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  position: relative;
}

/* Pending state */
.step-pending .step-circle {
  background: #1a1a1a;
  color: #666666;
  border: 2px solid #333333;
}

/* Active state */
.step-active .step-circle {
  background: #00d9d9;
  color: #0a0a0a;
  border: 2px solid #00d9d9;
  box-shadow:
    0 0 15px rgba(0, 217, 217, 0.5),
    0 0 30px rgba(0, 217, 217, 0.3),
    inset 0 0 10px rgba(255, 255, 255, 0.2);
}

/* Completed state */
.step-completed .step-circle {
  background: transparent;
  color: #00d9d9;
  border: 2px solid #00d9d9;
  box-shadow: 0 0 10px rgba(0, 217, 217, 0.3);
}

.step-check-icon {
  width: 1.2rem;
  height: 1.2rem;
}

.step-number {
  line-height: 1;
}

/* Label styles */
.step-label {
  margin-top: 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
  transition: color 0.3s ease;
}

.step-pending .step-label {
  color: #666666;
}

.step-active .step-label {
  color: #00d9d9;
  text-shadow: 0 0 10px rgba(0, 217, 217, 0.5);
}

.step-completed .step-label {
  color: #00d9d9;
}

/* Connector line */
.step-connector {
  flex: 1;
  height: 2px;
  margin: 0 0.5rem;
  margin-top: 1.5rem;
  background: #333333;
  transition: all 0.5s ease;
  position: relative;
}

.connector-active {
  background: #00d9d9;
  box-shadow: 0 0 8px rgba(0, 217, 217, 0.5);
}

/* Responsive */
@media (max-width: 640px) {
  .step-circle {
    width: 2.5rem;
    height: 2.5rem;
    font-size: 1rem;
  }

  .step-label {
    font-size: 0.65rem;
    max-width: 60px;
    text-align: center;
    white-space: normal;
    line-height: 1.2;
  }

  .step-connector {
    margin: 0 0.25rem;
    margin-top: 1.25rem;
  }
}
</style>
