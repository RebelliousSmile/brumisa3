import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useSystemes } from '~/composables/useSystemes'

// Mock $fetch
vi.mock('#app', () => ({
  $fetch: vi.fn()
}))

describe('useSystemes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return correct initial state', () => {
    const { systemes, loading, error } = useSystemes()
    
    expect(systemes.value).toEqual([])
    expect(loading.value).toBe(false)
    expect(error.value).toBe(null)
  })

  it('should get colors for known system', () => {
    const { getCouleursPourSysteme } = useSystemes()

    const colors = getCouleursPourSysteme('mistengine')

    expect(colors.primary).toBe('#8b5cf6')
    expect(colors.secondary).toBe('#7c3aed')
    expect(colors.classes.bg).toBe('bg-violet-500/20')
  })

  it('should get default colors for unknown system', () => {
    const { getCouleursPourSysteme } = useSystemes()
    
    const colors = getCouleursPourSysteme('unknown-system')
    
    expect(colors.primary).toBe('#6b7280')
    expect(colors.secondary).toBe('#4b5563')
    expect(colors.classes.bg).toBe('bg-gray-500/20')
  })

  it('should get icon for known system', () => {
    const { getIconPourSysteme } = useSystemes()

    expect(getIconPourSysteme('mistengine')).toBe('ra:ra-fog')
  })

  it('should get default icon for unknown system', () => {
    const { getIconPourSysteme } = useSystemes()
    
    expect(getIconPourSysteme('unknown-system')).toBe('ra:ra-dice')
  })

  it('should get full name for known system', () => {
    const { getNomCompletSysteme } = useSystemes()

    expect(getNomCompletSysteme('mistengine')).toBe('Mist Engine')
  })

  it('should return system id as name for unknown system', () => {
    const { getNomCompletSysteme } = useSystemes()
    
    expect(getNomCompletSysteme('unknown-system')).toBe('unknown-system')
  })

  it('should check if system is supported', () => {
    const { estSystemeSupporte } = useSystemes()

    expect(estSystemeSupporte('mistengine')).toBe(true)
    expect(estSystemeSupporte('unknown-system')).toBe(false)
    expect(estSystemeSupporte('monsterhearts')).toBe(false)
    expect(estSystemeSupporte('engrenages')).toBe(false)
  })
})