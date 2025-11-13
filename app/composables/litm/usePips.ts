import { ref, computed } from 'vue'

/**
 * Composable pour gérer les pips (points de progression)
 *
 * Utilisé pour les trackers, quêtes, et autres mécaniques de progression LITM.
 * Gère l'état des pips, les incréments/décréments, et les labels associés.
 *
 * @param initialValue - Valeur initiale des pips (défaut: 0)
 * @param max - Nombre maximum de pips (défaut: 4)
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * const { pips, increment, decrement, getLabel } = usePips(0, 4)
 * </script>
 *
 * <template>
 *   <div>
 *     <button @click="decrement">-</button>
 *     <span>{{ pips }} / {{ max }} - {{ getLabel() }}</span>
 *     <button @click="increment">+</button>
 *   </div>
 * </template>
 * ```
 */

export interface PipsLabels {
  [key: number]: string
}

export interface UsePipsOptions {
  initialValue?: number
  max?: number
  labels?: PipsLabels
}

export const usePips = (options: UsePipsOptions = {}) => {
  const {
    initialValue = 0,
    max = 4,
    labels = {},
  } = options

  const pips = ref(initialValue)

  /**
   * Labels par défaut pour les pips (0-4)
   */
  const defaultLabels: PipsLabels = {
    0: 'Abandon',
    1: 'Faible',
    2: 'Modéré',
    3: 'Fort',
    4: 'Améliorer',
  }

  /**
   * Incrémente le nombre de pips (max: max)
   */
  const increment = () => {
    if (pips.value < max) {
      pips.value++
    }
  }

  /**
   * Décrémente le nombre de pips (min: 0)
   */
  const decrement = () => {
    if (pips.value > 0) {
      pips.value--
    }
  }

  /**
   * Définit directement la valeur des pips
   * @param value - Nouvelle valeur (sera clampée entre 0 et max)
   */
  const setPips = (value: number) => {
    pips.value = Math.max(0, Math.min(max, value))
  }

  /**
   * Retourne le label associé à la valeur actuelle des pips
   */
  const getLabel = (): string => {
    const customLabel = labels[pips.value]
    if (customLabel !== undefined) {
      return customLabel
    }

    const defaultLabel = defaultLabels[pips.value]
    if (defaultLabel !== undefined) {
      return defaultLabel
    }

    return `${pips.value}/${max}`
  }

  /**
   * Vérifie si on est à la valeur minimale
   */
  const isMin = computed(() => pips.value === 0)

  /**
   * Vérifie si on est à la valeur maximale
   */
  const isMax = computed(() => pips.value === max)

  /**
   * Pourcentage de progression (0-100)
   */
  const percentage = computed(() => {
    if (max === 0) return 0
    return Math.round((pips.value / max) * 100)
  })

  return {
    pips,
    max: ref(max),
    increment,
    decrement,
    setPips,
    getLabel,
    isMin,
    isMax,
    percentage,
  }
}
