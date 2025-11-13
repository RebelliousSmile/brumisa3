/**
 * Composable pour faciliter l'acces aux traductions Legends in the Mist
 *
 * Fournit des helpers types pour acceder aux differents domaines de traduction
 * avec fallback automatique FR/EN.
 *
 * @example
 * ```ts
 * const { tCharacter, tCard } = useI18nLitm()
 * const charName = tCharacter('characterSheet.newCharacterName')
 * const cardTitle = tCard('themeCard.fellowshipTitle')
 * ```
 */
export const useI18nLitm = () => {
  const { t, locale } = useI18n()

  /**
   * Helper pour les traductions de personnages
   * Namespace: characterSheet, heroCard, backpack, quintessences
   */
  const tCharacter = (key: string, params?: Record<string, any>): string => {
    return t(key, params)
  }

  /**
   * Helper pour les traductions de cartes
   * Namespace: themeCard, tagItem, improvements, createCardDialog
   */
  const tCard = (key: string, params?: Record<string, any>): string => {
    return t(key, params)
  }

  /**
   * Helper pour les traductions de suivis
   * Namespace: trackers, pipTracker
   */
  const tTracker = (key: string, params?: Record<string, any>): string => {
    return t(key, params)
  }

  /**
   * Helper pour les traductions de themebooks
   * Namespace: themebook, themeTypes
   */
  const tThemebook = (key: string, params?: Record<string, any>): string => {
    return t(key, params)
  }

  /**
   * Helper pour les traductions d'interface
   * Namespace: actions, tooltips, cardRenderer
   */
  const tUI = (key: string, params?: Record<string, any>): string => {
    return t(key, params)
  }

  /**
   * Helper pour les messages d'erreur et notifications
   * Namespace: notifications, errors
   */
  const tError = (key: string, params?: Record<string, any>): string => {
    return t(key, params)
  }

  /**
   * Traduction generale LITM (tous les namespaces)
   */
  const tLitm = (key: string, params?: Record<string, any>): string => {
    return t(key, params)
  }

  /**
   * Verifie si une cle de traduction existe
   */
  const hasKey = (key: string): boolean => {
    return t(key) !== key
  }

  /**
   * Change la locale courante
   */
  const setLocale = (newLocale: 'fr' | 'en') => {
    locale.value = newLocale
  }

  /**
   * Recupere la locale courante
   */
  const currentLocale = computed(() => locale.value)

  return {
    // Helpers par domaine
    tCharacter,
    tCard,
    tTracker,
    tThemebook,
    tUI,
    tError,
    tLitm,

    // Utilitaires
    hasKey,
    setLocale,
    currentLocale,
    locale
  }
}
