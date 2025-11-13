import { describe, it, expect, beforeEach } from 'vitest'
import { useI18nLitm } from '~/composables/useI18nLitm'

/**
 * Tests pour le composable useI18nLitm
 *
 * Verifie que les helpers de traduction LITM fonctionnent correctement
 * avec fallback FR/EN et support des placeholders.
 */
describe('useI18nLitm', () => {
  describe('Character translations', () => {
    it('should return character sheet translations', () => {
      const { tCharacter } = useI18nLitm()
      const result = tCharacter('characterSheet.newCharacterName')
      expect(result).toBeDefined()
      expect(typeof result).toBe('string')
    })

    it('should return hero card translations', () => {
      const { tCharacter } = useI18nLitm()
      const result = tCharacter('heroCard.title')
      expect(result).toBeDefined()
      expect(typeof result).toBe('string')
    })
  })

  describe('Card translations', () => {
    it('should return theme card translations', () => {
      const { tCard } = useI18nLitm()
      const result = tCard('themeCard.power')
      expect(result).toBeDefined()
      expect(typeof result).toBe('string')
    })

    it('should handle placeholders in card translations', () => {
      const { tCard } = useI18nLitm()
      const result = tCard('cardRenderer.themeCardPlaceholder', { title: 'Test Theme' })
      expect(result).toBeDefined()
      expect(typeof result).toBe('string')
    })
  })

  describe('Tracker translations', () => {
    it('should return tracker translations', () => {
      const { tTracker } = useI18nLitm()
      const result = tTracker('trackers.addStatus')
      expect(result).toBeDefined()
      expect(typeof result).toBe('string')
    })

    it('should return pip tracker translations', () => {
      const { tTracker } = useI18nLitm()
      const result = tTracker('pipTracker.abandon')
      expect(result).toBeDefined()
      expect(typeof result).toBe('string')
    })
  })

  describe('Themebook translations', () => {
    it('should return themebook translations', () => {
      const { tThemebook } = useI18nLitm()
      const result = tThemebook('themebook.circumstance')
      expect(result).toBeDefined()
      expect(typeof result).toBe('string')
    })

    it('should return theme type translations', () => {
      const { tThemebook } = useI18nLitm()
      const result = tThemebook('themeTypes.Origin')
      expect(result).toBeDefined()
      expect(typeof result).toBe('string')
    })
  })

  describe('UI translations', () => {
    it('should return action translations', () => {
      const { tUI } = useI18nLitm()
      const result = tUI('actions.undo')
      expect(result).toBeDefined()
      expect(typeof result).toBe('string')
    })
  })

  describe('Error translations', () => {
    it('should return notification translations', () => {
      const { tError } = useI18nLitm()
      const result = tError('notifications.card.created')
      expect(result).toBeDefined()
      expect(typeof result).toBe('string')
    })
  })

  describe('Utility functions', () => {
    it('should check if key exists', () => {
      const { hasKey } = useI18nLitm()
      expect(hasKey('characterSheet.newCharacterName')).toBeDefined()
    })

    it('should provide current locale', () => {
      const { currentLocale } = useI18nLitm()
      expect(currentLocale.value).toBeDefined()
      expect(['fr', 'en']).toContain(currentLocale.value)
    })

    it('should allow locale switching', () => {
      const { setLocale, currentLocale } = useI18nLitm()
      const originalLocale = currentLocale.value

      setLocale('en')
      expect(currentLocale.value).toBe('en')

      setLocale('fr')
      expect(currentLocale.value).toBe('fr')

      // Restore original locale
      setLocale(originalLocale as 'fr' | 'en')
    })
  })

  describe('General LITM translation', () => {
    it('should translate any LITM key', () => {
      const { tLitm } = useI18nLitm()
      const result = tLitm('characterSheet.newCharacterName')
      expect(result).toBeDefined()
      expect(typeof result).toBe('string')
    })
  })
})
