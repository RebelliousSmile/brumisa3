/**
 * Tests unitaires pour les composants de base LITM
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { usePips } from '../../../../app/composables/litm/usePips'
import { useEditMode } from '../../../../app/composables/litm/useEditMode'

describe('usePips composable', () => {
  it('should initialize with default values', () => {
    const { pips, max } = usePips()
    expect(pips.value).toBe(0)
    expect(max.value).toBe(4)
  })

  it('should initialize with custom values', () => {
    const { pips, max } = usePips({ initialValue: 2, max: 9 })
    expect(pips.value).toBe(2)
    expect(max.value).toBe(9)
  })

  it('should increment pips correctly', () => {
    const { pips, increment } = usePips({ initialValue: 0, max: 4 })
    increment()
    expect(pips.value).toBe(1)
    increment()
    expect(pips.value).toBe(2)
  })

  it('should not exceed max value', () => {
    const { pips, increment } = usePips({ initialValue: 3, max: 4 })
    increment()
    expect(pips.value).toBe(4)
    increment() // Should not go beyond 4
    expect(pips.value).toBe(4)
  })

  it('should decrement pips correctly', () => {
    const { pips, decrement } = usePips({ initialValue: 3, max: 4 })
    decrement()
    expect(pips.value).toBe(2)
  })

  it('should not go below 0', () => {
    const { pips, decrement } = usePips({ initialValue: 0, max: 4 })
    decrement()
    expect(pips.value).toBe(0)
  })

  it('should set pips with clamping', () => {
    const { pips, setPips } = usePips({ initialValue: 0, max: 4 })

    setPips(2)
    expect(pips.value).toBe(2)

    setPips(-1) // Should clamp to 0
    expect(pips.value).toBe(0)

    setPips(10) // Should clamp to max (4)
    expect(pips.value).toBe(4)
  })

  it('should return default labels', () => {
    const { getLabel, setPips } = usePips({ initialValue: 0, max: 4 })

    expect(getLabel()).toBe('Abandon')

    setPips(1)
    expect(getLabel()).toBe('Faible')

    setPips(4)
    expect(getLabel()).toBe('Améliorer')
  })

  it('should use custom labels', () => {
    const customLabels = {
      0: 'Début',
      2: 'Milieu',
      4: 'Fin',
    }

    const { getLabel, setPips } = usePips({
      initialValue: 0,
      max: 4,
      labels: customLabels,
    })

    expect(getLabel()).toBe('Début')

    setPips(2)
    expect(getLabel()).toBe('Milieu')

    setPips(4)
    expect(getLabel()).toBe('Fin')

    // Should fallback to default for unlabeled values
    setPips(1)
    expect(getLabel()).toBe('Faible')
  })

  it('should compute isMin correctly', () => {
    const { isMin, pips } = usePips({ initialValue: 0, max: 4 })
    expect(isMin.value).toBe(true)

    pips.value = 1
    expect(isMin.value).toBe(false)
  })

  it('should compute isMax correctly', () => {
    const { isMax, pips } = usePips({ initialValue: 4, max: 4 })
    expect(isMax.value).toBe(true)

    pips.value = 3
    expect(isMax.value).toBe(false)
  })

  it('should compute percentage correctly', () => {
    const { percentage, setPips } = usePips({ initialValue: 0, max: 4 })

    setPips(0)
    expect(percentage.value).toBe(0)

    setPips(2)
    expect(percentage.value).toBe(50)

    setPips(4)
    expect(percentage.value).toBe(100)
  })
})

describe('useEditMode composable', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    if (typeof window !== 'undefined') {
      localStorage.clear()
    }
  })

  it('should initialize with default value (false)', () => {
    const { isEditMode } = useEditMode()
    expect(isEditMode.value).toBe(false)
  })

  it('should toggle edit mode', () => {
    const { isEditMode, toggleEditMode } = useEditMode()
    expect(isEditMode.value).toBe(false)

    toggleEditMode()
    expect(isEditMode.value).toBe(true)

    toggleEditMode()
    expect(isEditMode.value).toBe(false)
  })

  it('should set edit mode explicitly', () => {
    const { isEditMode, setEditMode } = useEditMode()

    setEditMode(true)
    expect(isEditMode.value).toBe(true)

    setEditMode(false)
    expect(isEditMode.value).toBe(false)
  })

  it('should share state between multiple instances', () => {
    const instance1 = useEditMode()
    const instance2 = useEditMode()

    instance1.setEditMode(true)
    expect(instance2.isEditMode.value).toBe(true)

    instance2.setEditMode(false)
    expect(instance1.isEditMode.value).toBe(false)
  })
})

// Note: Component tests would require a proper Nuxt test environment
// For now, we're focusing on composable tests which are more critical
// Component tests can be added later with @nuxt/test-utils
