/**
 * Cache Utility - In-Memory LRU Cache
 *
 * Cache memoire simple avec TTL pour deployments single-instance.
 * Suffisant pour Brumisa3 (single instance sur alwaysdata).
 *
 * Caracteristiques:
 * - TTL configurable par entry
 * - Eviction LRU quand la limite est atteinte
 * - Nettoyage periodique automatique
 * - Pattern matching pour invalidation
 *
 * @module cache
 */

// ===========================================
// TYPES
// ===========================================

interface CacheEntry<T> {
  value: T
  expiresAt: number
}

// ===========================================
// CACHE LRU
// ===========================================

class MemoryCache {
  private cache: Map<string, CacheEntry<unknown>> = new Map()
  private maxSize: number
  private cleanupInterval: ReturnType<typeof setInterval> | null = null

  constructor(maxSize: number = 1000) {
    this.maxSize = maxSize
    this.startCleanup()
  }

  /**
   * Demarre le nettoyage periodique des entries expirees
   */
  private startCleanup(): void {
    // Nettoyage toutes les 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 5 * 60 * 1000)

    // Eviter que le timer bloque le process Node
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref()
    }
  }

  /**
   * Nettoie les entries expirees
   */
  private cleanup(): void {
    const now = Date.now()
    let cleaned = 0

    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt < now) {
        this.cache.delete(key)
        cleaned++
      }
    }

    if (cleaned > 0) {
      console.log(`[Cache] Cleaned ${cleaned} expired entries`)
    }
  }

  /**
   * Eviction LRU si le cache depasse la taille max
   */
  private evictIfNeeded(): void {
    if (this.cache.size >= this.maxSize) {
      // Supprimer les 10% les plus anciens (premiers dans la Map)
      const toDelete = Math.ceil(this.maxSize * 0.1)
      const keys = Array.from(this.cache.keys()).slice(0, toDelete)

      for (const key of keys) {
        this.cache.delete(key)
      }

      console.log(`[Cache] Evicted ${toDelete} entries (LRU)`)
    }
  }

  /**
   * Stocke une valeur avec TTL
   */
  set<T>(key: string, value: T, ttlSeconds: number): void {
    this.evictIfNeeded()

    // Supprimer l'ancienne entry si elle existe (pour la remettre a la fin)
    this.cache.delete(key)

    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000
    })
  }

  /**
   * Recupere une valeur
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)

    if (!entry) return null

    // Verifier expiration
    if (entry.expiresAt < Date.now()) {
      this.cache.delete(key)
      return null
    }

    // Deplacer a la fin (LRU - recently used)
    this.cache.delete(key)
    this.cache.set(key, entry)

    return entry.value as T
  }

  /**
   * Supprime une cle
   */
  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  /**
   * Supprime les cles correspondant a un pattern (avec *)
   */
  deletePattern(pattern: string): number {
    // Convertir le pattern en regex
    const regexPattern = pattern
      .replace(/[.+?^${}()|[\]\\]/g, '\\$&') // Escape special chars
      .replace(/\*/g, '.*') // * -> .*

    const regex = new RegExp('^' + regexPattern + '$')
    let deleted = 0

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key)
        deleted++
      }
    }

    return deleted
  }

  /**
   * Vide tout le cache
   */
  clear(): void {
    this.cache.clear()
    console.log('[Cache] Cache cleared')
  }

  /**
   * Retourne la taille actuelle
   */
  get size(): number {
    return this.cache.size
  }

  /**
   * Arrete le nettoyage periodique
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
    this.cache.clear()
  }
}

// ===========================================
// INSTANCE SINGLETON
// ===========================================

// Cache global avec limite de 1000 entries
const cache = new MemoryCache(1000)

// ===========================================
// API PUBLIQUE
// ===========================================

/**
 * Stocke une valeur dans le cache
 *
 * @param key - Cle unique
 * @param value - Valeur a stocker
 * @param ttlSeconds - Duree de vie en secondes (defaut: 1 heure)
 */
export async function setCache<T>(
  key: string,
  value: T,
  ttlSeconds: number = 3600
): Promise<boolean> {
  cache.set(key, value, ttlSeconds)
  return true
}

/**
 * Recupere une valeur du cache
 *
 * @param key - Cle a recuperer
 * @returns Valeur ou null si non trouvee/expiree
 */
export async function getCache<T>(key: string): Promise<T | null> {
  return cache.get<T>(key)
}

/**
 * Invalide (supprime) des cles correspondant a un pattern
 *
 * @param pattern - Pattern avec wildcards (*) ex: "translations:fr:*"
 * @returns Nombre de cles supprimees
 */
export async function invalidateCache(pattern: string): Promise<number> {
  const deleted = cache.deletePattern(pattern)

  if (deleted > 0) {
    console.log(`[Cache] Invalidated ${deleted} keys matching: ${pattern}`)
  }

  return deleted
}

/**
 * Vide completement le cache
 */
export async function clearCache(): Promise<void> {
  cache.clear()
}

/**
 * Retourne des statistiques du cache
 */
export function getCacheStats(): { size: number; maxSize: number } {
  return {
    size: cache.size,
    maxSize: 1000
  }
}
