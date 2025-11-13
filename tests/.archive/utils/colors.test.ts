import { describe, it, expect } from 'vitest'

// Simple utility functions to test
export function getCouleursPourSysteme(systeme: string) {
  const couleursSystmes: Record<string, any> = {
    monsterhearts: {
      primary: '#ec4899', // pink-500
      secondary: '#be185d' // pink-700
    },
    engrenages: {
      primary: '#f59e0b', // amber-500
      secondary: '#d97706' // amber-600
    },
    metro2033: {
      primary: '#10b981', // emerald-500
      secondary: '#059669' // emerald-600
    }
  }

  return couleursSystmes[systeme] || {
    primary: '#6b7280', // gray-500
    secondary: '#4b5563' // gray-600
  }
}

export function getIconPourSysteme(systeme: string): string {
  const icons: Record<string, string> = {
    monsterhearts: 'ra:ra-heart',
    engrenages: 'ra:ra-gear',
    metro2033: 'ra:ra-tunnel',
    mistengine: 'ra:ra-fog',
    zombiology: 'ra:ra-skull'
  }
  return icons[systeme] || 'ra:ra-dice'
}

describe('Color Utils', () => {
  describe('getCouleursPourSysteme', () => {
    it('should return correct colors for monsterhearts', () => {
      const colors = getCouleursPourSysteme('monsterhearts')
      
      expect(colors.primary).toBe('#ec4899')
      expect(colors.secondary).toBe('#be185d')
    })

    it('should return correct colors for engrenages', () => {
      const colors = getCouleursPourSysteme('engrenages')
      
      expect(colors.primary).toBe('#f59e0b')
      expect(colors.secondary).toBe('#d97706')
    })

    it('should return default colors for unknown system', () => {
      const colors = getCouleursPourSysteme('unknown-system')
      
      expect(colors.primary).toBe('#6b7280')
      expect(colors.secondary).toBe('#4b5563')
    })
  })

  describe('getIconPourSysteme', () => {
    it('should return correct icon for known systems', () => {
      expect(getIconPourSysteme('monsterhearts')).toBe('ra:ra-heart')
      expect(getIconPourSysteme('engrenages')).toBe('ra:ra-gear')
      expect(getIconPourSysteme('metro2033')).toBe('ra:ra-tunnel')
    })

    it('should return default icon for unknown system', () => {
      expect(getIconPourSysteme('unknown-system')).toBe('ra:ra-dice')
    })
  })
})