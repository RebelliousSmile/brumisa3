/**
 * IndexedDB Service - Cache local pour les donnees de jeu
 *
 * Un Playspace = ensemble des regles d'un systeme du Mist Engine
 * (LITM, Otherscape, City of Mist) necessaires pour creer des
 * personnages et dangers.
 *
 * Stocke les donnees dans IndexedDB pour:
 * - Acces rapide aux regles (pas de requete API a chaque fois)
 * - Mode offline (donnees disponibles meme sans connexion)
 * - Persistence entre les sessions
 *
 * Stores:
 * - characters: Personnages crees avec ce playspace
 * - dangers: Dangers crees avec ce playspace
 * - actions: Actions disponibles selon le hack
 * - systemRules: Regles du systeme (moves, statuts, types de themes)
 * - metadata: Informations de cache (timestamps, versions)
 */

const DB_NAME = 'brumisa3_cache'
const DB_VERSION = 1

// Noms des object stores
const STORES = {
  characters: 'characters',
  dangers: 'dangers',
  actions: 'actions',
  systemRules: 'systemRules',
  metadata: 'metadata'
} as const

type StoreName = typeof STORES[keyof typeof STORES]

// Metadata pour le cache
export interface CacheMetadata {
  playspaceId: string
  hackId: string
  lastSync: number
  version: number
}

let dbInstance: IDBDatabase | null = null

/**
 * Ouvre ou cree la base de donnees IndexedDB
 */
export function openDatabase(): Promise<IDBDatabase> {
  console.log('[IndexedDB] openDatabase called, existing instance:', !!dbInstance)

  if (dbInstance) {
    return Promise.resolve(dbInstance)
  }

  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      console.error('[IndexedDB] Window is undefined (SSR context)')
      reject(new Error('IndexedDB not available - SSR context'))
      return
    }

    if (!window.indexedDB) {
      console.error('[IndexedDB] IndexedDB not supported in this browser')
      reject(new Error('IndexedDB not supported'))
      return
    }

    console.log('[IndexedDB] Opening database:', DB_NAME, 'version:', DB_VERSION)
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => {
      console.error('[IndexedDB] Failed to open database:', request.error)
      reject(request.error)
    }

    request.onsuccess = () => {
      dbInstance = request.result
      console.log('[IndexedDB] Database opened successfully, stores:', Array.from(dbInstance.objectStoreNames))
      resolve(dbInstance)
    }

    request.onupgradeneeded = (event) => {
      console.log('[IndexedDB] Upgrade needed, creating stores...')
      const db = (event.target as IDBOpenDBRequest).result

      // Characters store - index par playspaceId
      if (!db.objectStoreNames.contains(STORES.characters)) {
        const charStore = db.createObjectStore(STORES.characters, { keyPath: 'id' })
        charStore.createIndex('playspaceId', 'playspaceId', { unique: false })
      }

      // Dangers store - index par playspaceId
      if (!db.objectStoreNames.contains(STORES.dangers)) {
        const dangerStore = db.createObjectStore(STORES.dangers, { keyPath: 'id' })
        dangerStore.createIndex('playspaceId', 'playspaceId', { unique: false })
      }

      // Actions store - index par hackId
      if (!db.objectStoreNames.contains(STORES.actions)) {
        const actionStore = db.createObjectStore(STORES.actions, { keyPath: 'id' })
        actionStore.createIndex('hackId', 'hackId', { unique: false })
      }

      // System rules store - index par hackId
      if (!db.objectStoreNames.contains(STORES.systemRules)) {
        const rulesStore = db.createObjectStore(STORES.systemRules, { keyPath: 'hackId' })
        rulesStore.createIndex('systemId', 'systemId', { unique: false })
      }

      // Metadata store - pour gerer les timestamps de sync
      if (!db.objectStoreNames.contains(STORES.metadata)) {
        db.createObjectStore(STORES.metadata, { keyPath: 'playspaceId' })
      }

      console.log('[IndexedDB] Database schema created/upgraded')
    }
  })
}

/**
 * Sauvegarde des donnees dans un store
 */
async function saveToStore<T>(storeName: StoreName, data: T[]): Promise<void> {
  const db = await openDatabase()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite')
    const store = transaction.objectStore(storeName)

    transaction.onerror = () => {
      console.error(`[IndexedDB] Transaction error on ${storeName}:`, transaction.error)
      reject(transaction.error)
    }

    transaction.oncomplete = () => {
      console.log(`[IndexedDB] Saved ${data.length} items to ${storeName}`)
      resolve()
    }

    // Ajouter chaque element
    for (const item of data) {
      store.put(item)
    }
  })
}

/**
 * Charge les donnees d'un store par index
 */
async function loadFromStoreByIndex<T>(
  storeName: StoreName,
  indexName: string,
  indexValue: string
): Promise<T[]> {
  const db = await openDatabase()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly')
    const store = transaction.objectStore(storeName)
    const index = store.index(indexName)
    const request = index.getAll(indexValue)

    request.onerror = () => {
      console.error(`[IndexedDB] Load error on ${storeName}:`, request.error)
      reject(request.error)
    }

    request.onsuccess = () => {
      console.log(`[IndexedDB] Loaded ${request.result.length} items from ${storeName}`)
      resolve(request.result as T[])
    }
  })
}

/**
 * Charge les donnees d'un store par cle
 */
async function loadFromStoreByKey<T>(
  storeName: StoreName,
  key: string
): Promise<T | null> {
  const db = await openDatabase()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly')
    const store = transaction.objectStore(storeName)
    const request = store.get(key)

    request.onerror = () => {
      console.error(`[IndexedDB] Load error on ${storeName}:`, request.error)
      reject(request.error)
    }

    request.onsuccess = () => {
      resolve(request.result as T | null)
    }
  })
}

/**
 * Supprime les donnees d'un store par index
 */
async function clearStoreByIndex(
  storeName: StoreName,
  indexName: string,
  indexValue: string
): Promise<void> {
  const db = await openDatabase()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite')
    const store = transaction.objectStore(storeName)
    const index = store.index(indexName)
    const request = index.getAllKeys(indexValue)

    request.onerror = () => {
      reject(request.error)
    }

    request.onsuccess = () => {
      const keys = request.result
      for (const key of keys) {
        store.delete(key)
      }
      console.log(`[IndexedDB] Cleared ${keys.length} items from ${storeName}`)
    }

    transaction.oncomplete = () => {
      resolve()
    }
  })
}

/**
 * Supprime toutes les donnees d'un store
 */
async function clearStore(storeName: StoreName): Promise<void> {
  const db = await openDatabase()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite')
    const store = transaction.objectStore(storeName)
    const request = store.clear()

    request.onerror = () => {
      reject(request.error)
    }

    request.onsuccess = () => {
      console.log(`[IndexedDB] Cleared all items from ${storeName}`)
      resolve()
    }
  })
}

// ===== API Publique =====

/**
 * Sauvegarde les personnages d'un playspace
 */
export async function saveCharacters(characters: any[]): Promise<void> {
  return saveToStore(STORES.characters, characters)
}

/**
 * Charge les personnages d'un playspace
 */
export async function loadCharacters(playspaceId: string): Promise<any[]> {
  return loadFromStoreByIndex(STORES.characters, 'playspaceId', playspaceId)
}

/**
 * Supprime les personnages d'un playspace
 */
export async function clearCharacters(playspaceId: string): Promise<void> {
  return clearStoreByIndex(STORES.characters, 'playspaceId', playspaceId)
}

/**
 * Sauvegarde les dangers d'un playspace
 */
export async function saveDangers(dangers: any[]): Promise<void> {
  return saveToStore(STORES.dangers, dangers)
}

/**
 * Charge les dangers d'un playspace
 */
export async function loadDangers(playspaceId: string): Promise<any[]> {
  return loadFromStoreByIndex(STORES.dangers, 'playspaceId', playspaceId)
}

/**
 * Supprime les dangers d'un playspace
 */
export async function clearDangers(playspaceId: string): Promise<void> {
  return clearStoreByIndex(STORES.dangers, 'playspaceId', playspaceId)
}

/**
 * Sauvegarde les actions d'un hack
 */
export async function saveActions(actions: any[]): Promise<void> {
  return saveToStore(STORES.actions, actions)
}

/**
 * Charge les actions d'un hack
 */
export async function loadActions(hackId: string): Promise<any[]> {
  return loadFromStoreByIndex(STORES.actions, 'hackId', hackId)
}

/**
 * Sauvegarde les regles du systeme
 */
export async function saveSystemRules(rules: any): Promise<void> {
  return saveToStore(STORES.systemRules, [rules])
}

/**
 * Charge les regles du systeme par hackId
 */
export async function loadSystemRules(hackId: string): Promise<any | null> {
  return loadFromStoreByKey(STORES.systemRules, hackId)
}

/**
 * Sauvegarde les metadata du cache
 */
export async function saveCacheMetadata(metadata: CacheMetadata): Promise<void> {
  console.log('[IndexedDB] saveCacheMetadata called:', metadata)
  const db = await openDatabase()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.metadata, 'readwrite')
    const store = transaction.objectStore(STORES.metadata)
    const request = store.put(metadata)

    request.onerror = () => {
      console.error('[IndexedDB] Failed to save cache metadata:', request.error)
      reject(request.error)
    }
    request.onsuccess = () => {
      console.log('[IndexedDB] Cache metadata saved successfully')
      resolve()
    }
  })
}

/**
 * Charge les metadata du cache
 */
export async function loadCacheMetadata(playspaceId: string): Promise<CacheMetadata | null> {
  return loadFromStoreByKey(STORES.metadata, playspaceId)
}

/**
 * Nettoie tout le cache d'un playspace
 */
export async function clearPlayspaceCache(playspaceId: string): Promise<void> {
  console.log(`[IndexedDB] Clearing cache for playspace: ${playspaceId}`)

  await Promise.all([
    clearCharacters(playspaceId),
    clearDangers(playspaceId)
  ])

  // Supprimer les metadata
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.metadata, 'readwrite')
    const store = transaction.objectStore(STORES.metadata)
    const request = store.delete(playspaceId)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      console.log('[IndexedDB] Playspace cache cleared')
      resolve()
    }
  })
}

/**
 * Nettoie tout le cache (tous les playspaces)
 */
export async function clearAllCache(): Promise<void> {
  console.log('[IndexedDB] Clearing all cache')

  await Promise.all([
    clearStore(STORES.characters),
    clearStore(STORES.dangers),
    clearStore(STORES.actions),
    clearStore(STORES.systemRules),
    clearStore(STORES.metadata)
  ])
}

/**
 * Verifie si le cache est valide (moins de X heures)
 */
export async function isCacheValid(
  playspaceId: string,
  maxAgeHours: number = 24
): Promise<boolean> {
  console.log('[IndexedDB] isCacheValid called for:', playspaceId)
  try {
    const metadata = await loadCacheMetadata(playspaceId)
    console.log('[IndexedDB] Cache metadata:', metadata)
    if (!metadata) {
      console.log('[IndexedDB] No cache metadata found, cache invalid')
      return false
    }

    const maxAgeMs = maxAgeHours * 60 * 60 * 1000
    const age = Date.now() - metadata.lastSync
    const isValid = age < maxAgeMs

    console.log(`[IndexedDB] Cache age: ${age}ms, max: ${maxAgeMs}ms, valid: ${isValid}`)
    return isValid
  } catch (err) {
    console.error('[IndexedDB] Error checking cache validity:', err)
    return false
  }
}

/**
 * Ferme la connexion a la base de donnees
 */
export function closeDatabase(): void {
  if (dbInstance) {
    dbInstance.close()
    dbInstance = null
    console.log('[IndexedDB] Database connection closed')
  }
}
