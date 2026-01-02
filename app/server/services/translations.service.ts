/**
 * Service de Traductions Multi-Niveaux
 *
 * Gere la resolution en cascade des traductions avec heritage:
 * SYSTEM (base) -> HACK (override) -> UNIVERSE (override final)
 *
 * Architecture:
 * - Priority 1: SYSTEM (Mist Engine - traductions de base)
 * - Priority 2: HACK (LITM, Otherscape, City of Mist - terminologie specifique)
 * - Priority 3: UNIVERSE (custom settings - vocabulaire personnalise)
 *
 * @module translations.service
 */

import type { TranslationCategory, TranslationLevel, TranslationEntry } from '@prisma/client'
import { prisma } from '../utils/prisma'
import { getCache, setCache, invalidateCache } from '../utils/cache'
import { getVersionId } from '#shared/config/systems.config'

// ===========================================
// TYPES
// ===========================================

export interface TranslationContext {
  locale: string
  hackId: string
  universeId?: string | null
}

export interface ResolvedTranslation {
  key: string
  value: string
  category: TranslationCategory
  level: TranslationLevel
  sourceId: string | null // systemId, hackId, ou universeId selon le level
}

export interface TranslationHierarchy {
  key: string
  category: TranslationCategory
  resolved: ResolvedTranslation
  sources: {
    level: TranslationLevel
    value: string | null
    sourceId: string | null
  }[]
}

export interface CreateTranslationInput {
  key: string
  value: string
  locale: string
  category: TranslationCategory
  level: TranslationLevel
  description?: string
  systemId?: string
  hackId?: string
  universeId?: string
  createdBy?: string
}

// ===========================================
// CONSTANTES
// ===========================================

const CACHE_TTL_SECONDS = 3600 // 1 heure
const DEFAULT_SYSTEM_ID = 'mist-engine'

// ===========================================
// FONCTIONS UTILITAIRES
// ===========================================

/**
 * Genere la cle de cache pour un contexte de traduction
 */
function getCacheKey(
  context: TranslationContext,
  category: TranslationCategory
): string {
  const systemId = getSystemIdFromHack(context.hackId)
  return `translations:${context.locale}:${systemId}:${context.hackId}:${context.universeId || 'default'}:${category}`
}

/**
 * Recupere le systemId depuis un hackId
 */
function getSystemIdFromHack(hackId: string): string {
  const versionId = getVersionId(hackId)
  return versionId === '1.0' ? 'city-of-mist-system' : DEFAULT_SYSTEM_ID
}

// ===========================================
// SERVICE PRINCIPAL
// ===========================================

/**
 * Resout les traductions pour une categorie donnee avec heritage en cascade
 *
 * Algorithme:
 * 1. Requete unique PostgreSQL avec OR + ORDER BY priority DESC
 * 2. Resolution en memoire - les plus prioritaires ecrasent les moins prioritaires
 * 3. Cache Redis pour acces rapide
 *
 * @param context - Contexte de resolution (locale, hackId, universeId)
 * @param category - Categorie de traductions a charger
 * @returns Map des traductions resolues (key -> ResolvedTranslation)
 */
export async function resolveTranslations(
  context: TranslationContext,
  category: TranslationCategory
): Promise<Map<string, ResolvedTranslation>> {
  const cacheKey = getCacheKey(context, category)

  // 1. Verifier le cache
  const cached = await getCache<ResolvedTranslation[]>(cacheKey)
  if (cached) {
    console.log(`[TranslationsService] Cache HIT for ${cacheKey}`)
    return new Map(cached.map(t => [t.key, t]))
  }

  console.log(`[TranslationsService] Cache MISS for ${cacheKey}, loading from DB`)

  // 2. Charger depuis PostgreSQL avec requete optimisee
  const systemId = getSystemIdFromHack(context.hackId)

  const entries = await prisma.translationEntry.findMany({
    where: {
      locale: context.locale,
      category,
      OR: [
        // Niveau SYSTEM
        { level: 'SYSTEM', systemId },
        // Niveau HACK
        { level: 'HACK', hackId: context.hackId },
        // Niveau UNIVERSE (si specifie)
        ...(context.universeId
          ? [{ level: 'UNIVERSE' as TranslationLevel, universeId: context.universeId }]
          : [])
      ]
    },
    orderBy: { priority: 'asc' } // Tri ascendant pour que les plus prioritaires ecrasent
  })

  // 3. Resolution en memoire - construire la map
  const resolved = new Map<string, ResolvedTranslation>()

  for (const entry of entries) {
    // Les entries sont tries par priority ASC, donc chaque nouvelle entry ecrase
    resolved.set(entry.key, {
      key: entry.key,
      value: entry.value,
      category: entry.category,
      level: entry.level,
      sourceId: entry.universeId || entry.hackId || entry.systemId
    })
  }

  // 4. Mettre en cache
  const resolvedArray = Array.from(resolved.values())
  await setCache(cacheKey, resolvedArray, CACHE_TTL_SECONDS)

  console.log(`[TranslationsService] Resolved ${resolved.size} translations for ${category}`)

  return resolved
}

/**
 * Resout une traduction unique par sa cle
 *
 * @param key - Cle de traduction (ex: "theme.power_tags")
 * @param context - Contexte de resolution
 * @param category - Categorie de la traduction
 * @returns Traduction resolue ou null si non trouvee
 */
export async function resolveTranslation(
  key: string,
  context: TranslationContext,
  category: TranslationCategory
): Promise<ResolvedTranslation | null> {
  const translations = await resolveTranslations(context, category)
  return translations.get(key) || null
}

/**
 * Recupere la hierarchie complete d'une traduction (pour l'editeur)
 * Montre toutes les sources: SYSTEM, HACK, UNIVERSE
 *
 * @param key - Cle de traduction
 * @param context - Contexte de resolution
 * @param category - Categorie de la traduction
 */
export async function getTranslationHierarchy(
  key: string,
  context: TranslationContext,
  category: TranslationCategory
): Promise<TranslationHierarchy | null> {
  const systemId = getSystemIdFromHack(context.hackId)

  // Charger toutes les sources pour cette cle
  const entries = await prisma.translationEntry.findMany({
    where: {
      key,
      locale: context.locale,
      category,
      OR: [
        { level: 'SYSTEM', systemId },
        { level: 'HACK', hackId: context.hackId },
        ...(context.universeId
          ? [{ level: 'UNIVERSE' as TranslationLevel, universeId: context.universeId }]
          : [])
      ]
    },
    orderBy: { priority: 'desc' }
  })

  if (entries.length === 0) return null

  // Construire la hierarchie
  const sources: TranslationHierarchy['sources'] = [
    { level: 'SYSTEM', value: null, sourceId: systemId },
    { level: 'HACK', value: null, sourceId: context.hackId },
    { level: 'UNIVERSE', value: null, sourceId: context.universeId || null }
  ]

  for (const entry of entries) {
    const sourceIndex = sources.findIndex(s => s.level === entry.level)
    if (sourceIndex !== -1) {
      sources[sourceIndex].value = entry.value
    }
  }

  // La valeur resolue est la plus prioritaire
  const resolved = entries[0]

  return {
    key,
    category,
    resolved: {
      key: resolved.key,
      value: resolved.value,
      category: resolved.category,
      level: resolved.level,
      sourceId: resolved.universeId || resolved.hackId || resolved.systemId
    },
    sources
  }
}

/**
 * Cree ou met a jour un override de traduction
 *
 * @param input - Donnees de la traduction
 * @returns Traduction creee ou mise a jour
 */
export async function createOrUpdateTranslation(
  input: CreateTranslationInput
): Promise<TranslationEntry> {
  // Determiner la priority selon le level
  const priorityMap: Record<TranslationLevel, number> = {
    SYSTEM: 1,
    HACK: 2,
    UNIVERSE: 3
  }

  // Chercher si l'entry existe deja (upsert ne gere pas bien les nullable)
  const existing = await prisma.translationEntry.findFirst({
    where: {
      key: input.key,
      locale: input.locale,
      category: input.category,
      level: input.level,
      systemId: input.systemId || null,
      hackId: input.hackId || null,
      universeId: input.universeId || null
    }
  })

  let entry: TranslationEntry

  if (existing) {
    // Update
    entry = await prisma.translationEntry.update({
      where: { id: existing.id },
      data: {
        value: input.value,
        description: input.description
      }
    })
  } else {
    // Create
    entry = await prisma.translationEntry.create({
      data: {
        key: input.key,
        value: input.value,
        locale: input.locale,
        category: input.category,
        level: input.level,
        priority: priorityMap[input.level],
        description: input.description,
        systemId: input.systemId || null,
        hackId: input.hackId || null,
        universeId: input.universeId || null,
        createdBy: input.createdBy || null
      }
    })
  }

  // Invalider le cache
  await invalidateTranslationCache(input)

  console.log(`[TranslationsService] Created/updated translation: ${input.key} (${input.level})`)

  return entry
}

/**
 * Supprime un override de traduction (retour a la valeur parente)
 *
 * @param key - Cle de traduction
 * @param context - Contexte (pour identifier l'entry exacte)
 * @param category - Categorie
 * @param level - Niveau a supprimer
 */
export async function deleteTranslationOverride(
  key: string,
  context: TranslationContext,
  category: TranslationCategory,
  level: TranslationLevel
): Promise<boolean> {
  const systemId = level === 'SYSTEM' ? getSystemIdFromHack(context.hackId) : null
  const hackId = level === 'HACK' ? context.hackId : null
  const universeId = level === 'UNIVERSE' ? context.universeId : null

  const deleted = await prisma.translationEntry.deleteMany({
    where: {
      key,
      locale: context.locale,
      category,
      level,
      systemId,
      hackId,
      universeId
    }
  })

  if (deleted.count > 0) {
    // Invalider le cache
    await invalidateTranslationCache({
      key,
      locale: context.locale,
      category,
      level,
      systemId: systemId || undefined,
      hackId: hackId || undefined,
      universeId: universeId || undefined
    } as CreateTranslationInput)

    console.log(`[TranslationsService] Deleted override: ${key} (${level})`)
    return true
  }

  return false
}

/**
 * Invalide le cache pour un contexte donne
 */
async function invalidateTranslationCache(input: Partial<CreateTranslationInput>): Promise<void> {
  // Invalider tous les caches potentiellement affectes
  const patterns: string[] = []

  if (input.systemId) {
    patterns.push(`translations:*:${input.systemId}:*`)
  }
  if (input.hackId) {
    patterns.push(`translations:*:*:${input.hackId}:*`)
  }
  if (input.universeId) {
    patterns.push(`translations:*:*:*:${input.universeId}:*`)
  }

  for (const pattern of patterns) {
    await invalidateCache(pattern)
  }
}

/**
 * Liste toutes les traductions pour une categorie (pour l'admin)
 */
export async function listTranslations(
  category: TranslationCategory,
  locale: string,
  filters?: {
    level?: TranslationLevel
    hackId?: string
    universeId?: string
  }
): Promise<TranslationEntry[]> {
  return prisma.translationEntry.findMany({
    where: {
      category,
      locale,
      ...(filters?.level && { level: filters.level }),
      ...(filters?.hackId && { hackId: filters.hackId }),
      ...(filters?.universeId && { universeId: filters.universeId })
    },
    orderBy: [{ key: 'asc' }, { priority: 'desc' }]
  })
}

/**
 * Recupere les categories disponibles
 */
export function getAvailableCategories(): TranslationCategory[] {
  return [
    'CHARACTER',
    'PLAYSPACE',
    'GAME_MECHANICS',
    'UI',
    'THEMES',
    'MOVES',
    'STATUSES',
    'TAGS'
  ]
}
