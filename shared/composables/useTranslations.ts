/**
 * useTranslations - Composable pour les traductions multi-niveaux
 *
 * Charge et cache les traductions JdR avec resolution en cascade:
 * SYSTEM -> HACK -> UNIVERSE
 *
 * Utilise un cache client Map pour acces instantane apres le chargement initial.
 *
 * @example
 * ```typescript
 * const { t, loadCategory, isLoading } = useTranslations()
 *
 * // Charger une categorie
 * await loadCategory('THEMES')
 *
 * // Utiliser une traduction
 * const label = t('theme.power_tags', 'Power Tags') // Fallback si non trouvee
 * ```
 *
 * @module useTranslations
 */

import { ref, computed, readonly } from 'vue'
import { usePlayspaceStore } from '#shared/stores/playspace'
import type { TranslationCategory } from '@prisma/client'

// ===========================================
// TYPES
// ===========================================

export interface TranslationContext {
  locale: string
  hackId: string
  universeId: string | null
}

interface TranslationCache {
  [category: string]: {
    translations: Record<string, string>
    loadedAt: number
    context: TranslationContext
  }
}

// ===========================================
// STATE GLOBAL (partage entre tous les composants)
// ===========================================

const cache = ref<TranslationCache>({})
const loadingCategories = ref<Set<TranslationCategory>>(new Set())
const errors = ref<Record<string, string>>({})

// Duree de validite du cache client (30 minutes)
const CACHE_TTL_MS = 30 * 60 * 1000

// ===========================================
// COMPOSABLE
// ===========================================

/**
 * Composable pour charger et utiliser les traductions JdR
 *
 * @param overrideContext - Contexte personnalise (optionnel, utilise le playspace actif sinon)
 */
export function useTranslations(overrideContext?: Partial<TranslationContext>) {
  const playspaceStore = usePlayspaceStore()

  // ===========================================
  // COMPUTED
  // ===========================================

  /**
   * Contexte de traduction actuel
   */
  const context = computed<TranslationContext>(() => {
    const activePlayspace = playspaceStore.activePlayspace

    return {
      locale: overrideContext?.locale || 'fr',
      hackId: overrideContext?.hackId || activePlayspace?.hackId || 'litm',
      universeId: overrideContext?.universeId !== undefined
        ? overrideContext.universeId
        : activePlayspace?.universeId || null
    }
  })

  /**
   * Indique si une categorie est en cours de chargement
   */
  const isLoading = computed(() => loadingCategories.value.size > 0)

  /**
   * Liste des categories chargees
   */
  const loadedCategories = computed(() => Object.keys(cache.value))

  // ===========================================
  // METHODS
  // ===========================================

  /**
   * Genere une cle de cache unique pour le contexte
   */
  function getCacheKey(category: TranslationCategory): string {
    const ctx = context.value
    return `${ctx.locale}:${ctx.hackId}:${ctx.universeId || 'default'}:${category}`
  }

  /**
   * Verifie si le cache est valide pour une categorie
   */
  function isCacheValid(category: TranslationCategory): boolean {
    const key = getCacheKey(category)
    const entry = cache.value[key]

    if (!entry) return false

    // Verifier le TTL
    if (Date.now() - entry.loadedAt > CACHE_TTL_MS) return false

    // Verifier si le contexte a change
    const ctx = context.value
    if (
      entry.context.locale !== ctx.locale ||
      entry.context.hackId !== ctx.hackId ||
      entry.context.universeId !== ctx.universeId
    ) {
      return false
    }

    return true
  }

  /**
   * Charge une categorie de traductions depuis l'API
   */
  async function loadCategory(category: TranslationCategory): Promise<void> {
    // Skip si deja valide en cache
    if (isCacheValid(category)) {
      console.log(`[useTranslations] Cache HIT for ${category}`)
      return
    }

    // Skip si deja en cours de chargement
    if (loadingCategories.value.has(category)) {
      console.log(`[useTranslations] Already loading ${category}`)
      return
    }

    console.log(`[useTranslations] Loading ${category}...`)
    loadingCategories.value.add(category)
    delete errors.value[category]

    try {
      const ctx = context.value
      const response = await $fetch<{
        translations: Record<string, string>
        count: number
      }>('/api/translations/resolve', {
        query: {
          locale: ctx.locale,
          hackId: ctx.hackId,
          universeId: ctx.universeId,
          category
        }
      })

      // Stocker en cache
      const key = getCacheKey(category)
      cache.value[key] = {
        translations: response.translations,
        loadedAt: Date.now(),
        context: { ...ctx }
      }

      console.log(`[useTranslations] Loaded ${response.count} translations for ${category}`)
    } catch (err: any) {
      console.error(`[useTranslations] Failed to load ${category}:`, err)
      errors.value[category] = err.message || 'Failed to load translations'
    } finally {
      loadingCategories.value.delete(category)
    }
  }

  /**
   * Precharge plusieurs categories en parallele
   */
  async function preloadCategories(categories: TranslationCategory[]): Promise<void> {
    await Promise.all(categories.map(cat => loadCategory(cat)))
  }

  /**
   * Recupere une traduction par sa cle
   *
   * @param key - Cle de traduction (ex: "theme.power_tags")
   * @param fallback - Valeur par defaut si non trouvee
   * @returns Valeur traduite ou fallback
   */
  function t(key: string, fallback?: string): string {
    // Chercher dans toutes les categories chargees
    for (const cacheKey of Object.keys(cache.value)) {
      const entry = cache.value[cacheKey]
      if (entry.translations[key]) {
        return entry.translations[key]
      }
    }

    // Retourner le fallback ou la cle
    return fallback ?? key
  }

  /**
   * Recupere une traduction d'une categorie specifique
   */
  function tCategory(
    category: TranslationCategory,
    key: string,
    fallback?: string
  ): string {
    const cacheKey = getCacheKey(category)
    const entry = cache.value[cacheKey]

    if (entry?.translations[key]) {
      return entry.translations[key]
    }

    return fallback ?? key
  }

  /**
   * Recupere toutes les traductions d'une categorie
   */
  function getCategory(category: TranslationCategory): Record<string, string> {
    const cacheKey = getCacheKey(category)
    return cache.value[cacheKey]?.translations || {}
  }

  /**
   * Cree ou met a jour un override de traduction
   */
  async function createOverride(params: {
    key: string
    value: string
    category: TranslationCategory
    level: 'SYSTEM' | 'HACK' | 'UNIVERSE'
    description?: string
  }): Promise<boolean> {
    const ctx = context.value

    try {
      await $fetch('/api/translations/override', {
        method: 'POST',
        body: {
          key: params.key,
          value: params.value,
          locale: ctx.locale,
          category: params.category,
          level: params.level,
          description: params.description,
          // Determiner l'ID selon le level
          ...(params.level === 'SYSTEM' && { systemId: 'mist-engine' }),
          ...(params.level === 'HACK' && { hackId: ctx.hackId }),
          ...(params.level === 'UNIVERSE' && { universeId: ctx.universeId })
        }
      })

      // Invalider le cache pour cette categorie
      const cacheKey = getCacheKey(params.category)
      delete cache.value[cacheKey]

      // Recharger
      await loadCategory(params.category)

      return true
    } catch (err) {
      console.error('[useTranslations] createOverride error:', err)
      return false
    }
  }

  /**
   * Supprime un override de traduction
   */
  async function removeOverride(params: {
    key: string
    category: TranslationCategory
    level: 'SYSTEM' | 'HACK' | 'UNIVERSE'
  }): Promise<boolean> {
    const ctx = context.value

    try {
      await $fetch('/api/translations/override', {
        method: 'DELETE',
        query: {
          key: params.key,
          locale: ctx.locale,
          category: params.category,
          level: params.level,
          hackId: ctx.hackId,
          universeId: ctx.universeId
        }
      })

      // Invalider le cache pour cette categorie
      const cacheKey = getCacheKey(params.category)
      delete cache.value[cacheKey]

      // Recharger
      await loadCategory(params.category)

      return true
    } catch (err) {
      console.error('[useTranslations] removeOverride error:', err)
      return false
    }
  }

  /**
   * Invalide tout le cache client
   */
  function invalidateCache(): void {
    cache.value = {}
    console.log('[useTranslations] Cache invalidated')
  }

  // ===========================================
  // RETURN
  // ===========================================

  return {
    // State (readonly)
    context: readonly(context),
    isLoading: readonly(isLoading),
    loadedCategories: readonly(loadedCategories),
    errors: readonly(errors),

    // Methods
    t,
    tCategory,
    getCategory,
    loadCategory,
    preloadCategories,
    createOverride,
    removeOverride,
    invalidateCache,
    isCacheValid
  }
}
