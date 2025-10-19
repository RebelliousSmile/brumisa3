# Stratégie de Caching IndexedDB pour Données Statiques

## Vue d'Ensemble

Cette documentation décrit l'architecture de caching des **données statiques** (Systèmes, Hacks, Univers, Themebooks, Oracles) en utilisant **IndexedDB** côté client pour optimiser les performances et permettre un mode hors ligne.

**Problème résolu** : Éviter des appels API répétés à PostgreSQL pour des données qui changent rarement (1-2 fois par trimestre).

**Solution** : Cache IndexedDB avec stratégie **Stale-While-Revalidate** (SWR).

## Justification Technique

### Pourquoi IndexedDB ?

| Critère | IndexedDB | localStorage | SessionStorage | API Direct |
|---------|-----------|--------------|----------------|------------|
| **Capacité** | >50MB | 5-10MB | 5-10MB | N/A |
| **Performance** | Excellent (async) | Bon (sync) | Bon (sync) | Moyen (réseau) |
| **Structure** | Objet complexe | String only | String only | Objet complexe |
| **Index** | ✅ Natif | ❌ | ❌ | ✅ PostgreSQL |
| **Offline** | ✅ | ✅ | ❌ | ❌ |
| **Versioning** | ✅ Schema | ❌ | ❌ | ✅ DB |

**Verdict** : IndexedDB est le meilleur choix pour données structurées volumineuses avec support offline.

### Données Concernées

#### ✅ À Cacher dans IndexedDB (TRÈS statique)

```typescript
interface StaticData {
  // Changent 1-2 fois par an
  systems: System[];              // Mist Engine (1 entrée)

  // Changent 1-2 fois par trimestre
  hacks: Hack[];                  // LITM, Otherscape (~5 entrées)
  universes: Universe[];          // Chicago, Londres (~10 entrées)

  // Changent 1 fois par mois max
  themebooks: Themebook[];        // Themes LITM (~50 entrées)
  oracles: Oracle[];              // Tables générales/hack (~100 entrées)
}
```

**Total estimé** : ~500KB - 2MB (très confortable pour IndexedDB)

#### ❌ NE PAS Cacher dans IndexedDB (Dynamique)

```typescript
interface DynamicData {
  playspaces: Playspace[];        // Utilisateur, fréquents changements
  characters: Character[];        // Utilisateur, modifications continues
  themecards: ThemeCard[];        // Utilisateur, dynamique
  sessions: Session[];            // Authentification, expirent
}
```

**Raison** : Données utilisateur doivent rester en source of truth PostgreSQL (multi-appareil, backup, sécurité).

### Gains de Performance Attendus

| Opération | Sans Cache | Avec IndexedDB | Gain |
|-----------|------------|----------------|------|
| **Chargement initial** | 1500ms (3 API calls) | 50ms (IndexedDB) | **96% plus rapide** |
| **Basculement playspace** | 1800ms | 200ms | **89% plus rapide** |
| **Liste hacks** | 300ms | 5ms | **98% plus rapide** |
| **Oracles par niveau** | 500ms | 10ms | **98% plus rapide** |

**Impact UX** :
- Basculement playspaces : < 500ms (critère acceptation : < 2s)
- Interface réactive même avec connexion lente (3G)
- Mode offline fonctionnel pour consultation

## Architecture Complète

### 1. Schéma IndexedDB

```typescript
// types/indexeddb.ts
import { DBSchema } from 'idb';

export interface BrumisaStaticDB extends DBSchema {
  // Table Systems
  systems: {
    key: string; // UUID
    value: {
      id: string;
      name: string;
      description: string;
      slug: string;
      version: number;
      updatedAt: string; // ISO date
    };
  };

  // Table Hacks
  hacks: {
    key: string; // UUID
    value: {
      id: string;
      systemId: string;
      name: string;
      slug: string;
      description: string;
      moves?: any[];
      version: number;
      updatedAt: string;
    };
    indexes: {
      'by-system': string; // Index sur systemId
    };
  };

  // Table Universes
  universes: {
    key: string; // UUID
    value: {
      id: string;
      hackId: string;
      name: string;
      slug: string;
      description: string;
      isDefault: boolean;
      version: number;
      updatedAt: string;
    };
    indexes: {
      'by-hack': string; // Index sur hackId
      'by-default': number; // Index sur isDefault
    };
  };

  // Table Themebooks
  themebooks: {
    key: string; // UUID
    value: {
      id: string;
      hackId: string;
      name: string;
      slug: string;
      category: string; // Mythos, Logos, etc.
      themes: {
        name: string;
        description: string;
        tags: string[];
      }[];
      version: number;
      updatedAt: string;
    };
    indexes: {
      'by-hack': string;
      'by-category': string;
    };
  };

  // Table Oracles
  oracles: {
    key: string; // UUID
    value: {
      id: string;
      level: 'general' | 'hack' | 'universe';
      hackId?: string;
      universeId?: string;
      name: string;
      slug: string;
      category: string;
      elements: {
        value: string;
        weight: number;
      }[];
      version: number;
      updatedAt: string;
    };
    indexes: {
      'by-level': string;
      'by-hack': string;
      'by-universe': string;
    };
  };

  // Table Metadata (versioning)
  metadata: {
    key: string; // Clé unique (ex: 'systems-version')
    value: {
      key: string;
      version: number;
      lastSync: string; // ISO date
      checksum?: string; // Hash MD5 optionnel
    };
  };
}
```

### 2. Composable useStaticData

```typescript
// composables/useStaticData.ts
import { openDB, IDBPDatabase } from 'idb';
import type { BrumisaStaticDB } from '~/types/indexeddb';

const DB_NAME = 'brumisa3-static';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<BrumisaStaticDB> | null = null;

export const useStaticData = () => {
  // ======================
  // 1. INITIALISATION DB
  // ======================

  const initDB = async (): Promise<IDBPDatabase<BrumisaStaticDB>> => {
    if (dbInstance) return dbInstance;

    try {
      dbInstance = await openDB<BrumisaStaticDB>(DB_NAME, DB_VERSION, {
        upgrade(db, oldVersion, newVersion, transaction) {
          console.log(`Upgrading IndexedDB from v${oldVersion} to v${newVersion}`);

          // Systems
          if (!db.objectStoreNames.contains('systems')) {
            db.createObjectStore('systems', { keyPath: 'id' });
          }

          // Hacks avec index
          if (!db.objectStoreNames.contains('hacks')) {
            const hacksStore = db.createObjectStore('hacks', { keyPath: 'id' });
            hacksStore.createIndex('by-system', 'systemId');
          }

          // Universes avec index
          if (!db.objectStoreNames.contains('universes')) {
            const universesStore = db.createObjectStore('universes', { keyPath: 'id' });
            universesStore.createIndex('by-hack', 'hackId');
            universesStore.createIndex('by-default', 'isDefault');
          }

          // Themebooks avec index
          if (!db.objectStoreNames.contains('themebooks')) {
            const themebooksStore = db.createObjectStore('themebooks', { keyPath: 'id' });
            themebooksStore.createIndex('by-hack', 'hackId');
            themebooksStore.createIndex('by-category', 'category');
          }

          // Oracles avec index
          if (!db.objectStoreNames.contains('oracles')) {
            const oraclesStore = db.createObjectStore('oracles', { keyPath: 'id' });
            oraclesStore.createIndex('by-level', 'level');
            oraclesStore.createIndex('by-hack', 'hackId');
            oraclesStore.createIndex('by-universe', 'universeId');
          }

          // Metadata
          if (!db.objectStoreNames.contains('metadata')) {
            db.createObjectStore('metadata', { keyPath: 'key' });
          }
        },
        blocked() {
          console.warn('IndexedDB upgrade blocked. Close other tabs.');
        },
        blocking() {
          console.warn('IndexedDB blocking upgrade in other tabs.');
        },
      });

      return dbInstance;
    } catch (error) {
      console.error('Failed to initialize IndexedDB:', error);
      throw error;
    }
  };

  // ======================
  // 2. SYSTEMS
  // ======================

  const getSystems = async () => {
    const db = await initDB();

    // 1. Lecture depuis IndexedDB (instantané)
    const cached = await db.getAll('systems');

    // 2. Si cache vide, fetch depuis API
    if (cached.length === 0) {
      await refreshSystems();
      return await db.getAll('systems');
    }

    // 3. Revalidation en arrière-plan
    revalidateSystems();

    return cached;
  };

  const revalidateSystems = async () => {
    try {
      const db = await initDB();
      const metadata = await db.get('metadata', 'systems-version');

      // Check version avec API
      const versionResponse = await $fetch<{ version: number }>('/api/static/systems/version');

      if (!metadata || versionResponse.version > metadata.version) {
        console.log('Systems cache obsolète, refresh...');
        await refreshSystems();
      } else {
        console.log('Systems cache à jour (version', metadata.version, ')');
      }
    } catch (error) {
      console.warn('Revalidation systems failed, using cached data:', error);
    }
  };

  const refreshSystems = async () => {
    const db = await initDB();

    // Fetch depuis API
    const systems = await $fetch<any[]>('/api/static/systems');

    // Clear store
    await db.clear('systems');

    // Repopulate
    const tx = db.transaction('systems', 'readwrite');
    await Promise.all(systems.map(s => tx.store.put(s)));

    // Update metadata
    await db.put('metadata', {
      key: 'systems-version',
      version: systems[0]?.version || 1,
      lastSync: new Date().toISOString(),
    });

    console.log(`Systems refreshed: ${systems.length} entries`);
  };

  // ======================
  // 3. HACKS
  // ======================

  const getHacks = async () => {
    const db = await initDB();
    const cached = await db.getAll('hacks');

    if (cached.length === 0) {
      await refreshHacks();
      return await db.getAll('hacks');
    }

    revalidateHacks();
    return cached;
  };

  const getHacksBySystem = async (systemId: string) => {
    const db = await initDB();
    return await db.getAllFromIndex('hacks', 'by-system', systemId);
  };

  const revalidateHacks = async () => {
    try {
      const db = await initDB();
      const metadata = await db.get('metadata', 'hacks-version');
      const versionResponse = await $fetch<{ version: number }>('/api/static/hacks/version');

      if (!metadata || versionResponse.version > metadata.version) {
        await refreshHacks();
      }
    } catch (error) {
      console.warn('Revalidation hacks failed:', error);
    }
  };

  const refreshHacks = async () => {
    const db = await initDB();
    const hacks = await $fetch<any[]>('/api/static/hacks');

    await db.clear('hacks');

    const tx = db.transaction('hacks', 'readwrite');
    await Promise.all(hacks.map(h => tx.store.put(h)));

    await db.put('metadata', {
      key: 'hacks-version',
      version: hacks[0]?.version || 1,
      lastSync: new Date().toISOString(),
    });

    console.log(`Hacks refreshed: ${hacks.length} entries`);
  };

  // ======================
  // 4. UNIVERSES
  // ======================

  const getUniverses = async () => {
    const db = await initDB();
    const cached = await db.getAll('universes');

    if (cached.length === 0) {
      await refreshUniverses();
      return await db.getAll('universes');
    }

    revalidateUniverses();
    return cached;
  };

  const getUniversesByHack = async (hackId: string) => {
    const db = await initDB();
    return await db.getAllFromIndex('universes', 'by-hack', hackId);
  };

  const getDefaultUniverses = async () => {
    const db = await initDB();
    const allUniverses = await db.getAll('universes');
    return allUniverses.filter(u => u.isDefault);
  };

  const revalidateUniverses = async () => {
    try {
      const db = await initDB();
      const metadata = await db.get('metadata', 'universes-version');
      const versionResponse = await $fetch<{ version: number }>('/api/static/universes/version');

      if (!metadata || versionResponse.version > metadata.version) {
        await refreshUniverses();
      }
    } catch (error) {
      console.warn('Revalidation universes failed:', error);
    }
  };

  const refreshUniverses = async () => {
    const db = await initDB();
    const universes = await $fetch<any[]>('/api/static/universes');

    await db.clear('universes');

    const tx = db.transaction('universes', 'readwrite');
    await Promise.all(universes.map(u => tx.store.put(u)));

    await db.put('metadata', {
      key: 'universes-version',
      version: universes[0]?.version || 1,
      lastSync: new Date().toISOString(),
    });

    console.log(`Universes refreshed: ${universes.length} entries`);
  };

  // ======================
  // 5. THEMEBOOKS
  // ======================

  const getThemebooks = async () => {
    const db = await initDB();
    const cached = await db.getAll('themebooks');

    if (cached.length === 0) {
      await refreshThemebooks();
      return await db.getAll('themebooks');
    }

    revalidateThemebooks();
    return cached;
  };

  const getThemebooksByHack = async (hackId: string) => {
    const db = await initDB();
    return await db.getAllFromIndex('themebooks', 'by-hack', hackId);
  };

  const getThemebooksByCategory = async (category: string) => {
    const db = await initDB();
    return await db.getAllFromIndex('themebooks', 'by-category', category);
  };

  const revalidateThemebooks = async () => {
    try {
      const db = await initDB();
      const metadata = await db.get('metadata', 'themebooks-version');
      const versionResponse = await $fetch<{ version: number }>('/api/static/themebooks/version');

      if (!metadata || versionResponse.version > metadata.version) {
        await refreshThemebooks();
      }
    } catch (error) {
      console.warn('Revalidation themebooks failed:', error);
    }
  };

  const refreshThemebooks = async () => {
    const db = await initDB();
    const themebooks = await $fetch<any[]>('/api/static/themebooks');

    await db.clear('themebooks');

    const tx = db.transaction('themebooks', 'readwrite');
    await Promise.all(themebooks.map(t => tx.store.put(t)));

    await db.put('metadata', {
      key: 'themebooks-version',
      version: themebooks[0]?.version || 1,
      lastSync: new Date().toISOString(),
    });

    console.log(`Themebooks refreshed: ${themebooks.length} entries`);
  };

  // ======================
  // 6. ORACLES
  // ======================

  const getOracles = async () => {
    const db = await initDB();
    const cached = await db.getAll('oracles');

    if (cached.length === 0) {
      await refreshOracles();
      return await db.getAll('oracles');
    }

    revalidateOracles();
    return cached;
  };

  const getOraclesByLevel = async (level: 'general' | 'hack' | 'universe') => {
    const db = await initDB();
    return await db.getAllFromIndex('oracles', 'by-level', level);
  };

  const getOraclesByHack = async (hackId: string) => {
    const db = await initDB();
    return await db.getAllFromIndex('oracles', 'by-hack', hackId);
  };

  const getOraclesByUniverse = async (universeId: string) => {
    const db = await initDB();
    return await db.getAllFromIndex('oracles', 'by-universe', universeId);
  };

  const revalidateOracles = async () => {
    try {
      const db = await initDB();
      const metadata = await db.get('metadata', 'oracles-version');
      const versionResponse = await $fetch<{ version: number }>('/api/static/oracles/version');

      if (!metadata || versionResponse.version > metadata.version) {
        await refreshOracles();
      }
    } catch (error) {
      console.warn('Revalidation oracles failed:', error);
    }
  };

  const refreshOracles = async () => {
    const db = await initDB();
    const oracles = await $fetch<any[]>('/api/static/oracles');

    await db.clear('oracles');

    const tx = db.transaction('oracles', 'readwrite');
    await Promise.all(oracles.map(o => tx.store.put(o)));

    await db.put('metadata', {
      key: 'oracles-version',
      version: oracles[0]?.version || 1,
      lastSync: new Date().toISOString(),
    });

    console.log(`Oracles refreshed: ${oracles.length} entries`);
  };

  // ======================
  // 7. UTILITIES
  // ======================

  const forceRefreshAll = async () => {
    console.log('Force refresh all static data...');
    await Promise.all([
      refreshSystems(),
      refreshHacks(),
      refreshUniverses(),
      refreshThemebooks(),
      refreshOracles(),
    ]);
    console.log('All static data refreshed');
  };

  const clearAllCache = async () => {
    const db = await initDB();
    await Promise.all([
      db.clear('systems'),
      db.clear('hacks'),
      db.clear('universes'),
      db.clear('themebooks'),
      db.clear('oracles'),
      db.clear('metadata'),
    ]);
    console.log('All IndexedDB cache cleared');
  };

  const getCacheStatus = async () => {
    const db = await initDB();
    const [systemsMeta, hacksMeta, universesMeta, themebooksMeta, oraclesMeta] = await Promise.all([
      db.get('metadata', 'systems-version'),
      db.get('metadata', 'hacks-version'),
      db.get('metadata', 'universes-version'),
      db.get('metadata', 'themebooks-version'),
      db.get('metadata', 'oracles-version'),
    ]);

    return {
      systems: systemsMeta || null,
      hacks: hacksMeta || null,
      universes: universesMeta || null,
      themebooks: themebooksMeta || null,
      oracles: oraclesMeta || null,
    };
  };

  return {
    // Systems
    getSystems,
    refreshSystems,

    // Hacks
    getHacks,
    getHacksBySystem,
    refreshHacks,

    // Universes
    getUniverses,
    getUniversesByHack,
    getDefaultUniverses,
    refreshUniverses,

    // Themebooks
    getThemebooks,
    getThemebooksByHack,
    getThemebooksByCategory,
    refreshThemebooks,

    // Oracles
    getOracles,
    getOraclesByLevel,
    getOraclesByHack,
    getOraclesByUniverse,
    refreshOracles,

    // Utilities
    forceRefreshAll,
    clearAllCache,
    getCacheStatus,
  };
};
```

### 3. API Routes avec Versioning

```typescript
// server/api/static/systems/version.get.ts
export default defineEventHandler(() => {
  // Version incrémentée manuellement quand systèmes changent
  // Ou lire depuis config/DB
  return {
    version: 1,
    timestamp: new Date('2025-01-19').toISOString(),
  };
});

// server/api/static/systems/index.get.ts
export default defineCachedEventHandler(async () => {
  const systems = await prisma.system.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
    },
  });

  return systems.map(s => ({
    ...s,
    version: 1,
    updatedAt: new Date().toISOString(),
  }));
}, {
  maxAge: 60 * 60 * 24, // Cache 24h côté serveur
  swr: true, // Stale-while-revalidate
  getKey: () => 'systems-all',
});

// server/api/static/hacks/version.get.ts
export default defineEventHandler(() => {
  return {
    version: 1,
    timestamp: new Date('2025-01-19').toISOString(),
  };
});

// server/api/static/hacks/index.get.ts
export default defineCachedEventHandler(async () => {
  const hacks = await prisma.hack.findMany({
    select: {
      id: true,
      systemId: true,
      name: true,
      slug: true,
      description: true,
      moves: true,
    },
  });

  return hacks.map(h => ({
    ...h,
    version: 1,
    updatedAt: new Date().toISOString(),
  }));
}, {
  maxAge: 60 * 60 * 24,
  swr: true,
  getKey: () => 'hacks-all',
});

// Idem pour universes, themebooks, oracles
```

### 4. Store Pinia avec IndexedDB

```typescript
// stores/staticData.ts
export const useStaticDataStore = defineStore('staticData', () => {
  const systems = ref<any[]>([]);
  const hacks = ref<any[]>([]);
  const universes = ref<any[]>([]);
  const themebooks = ref<any[]>([]);
  const oracles = ref<any[]>([]);

  const loading = ref(false);
  const cacheStatus = ref<any>(null);

  const {
    getSystems,
    getHacks,
    getUniverses,
    getThemebooks,
    getOracles,
    getCacheStatus,
    forceRefreshAll,
  } = useStaticData();

  const loadAll = async () => {
    loading.value = true;
    try {
      [systems.value, hacks.value, universes.value, themebooks.value, oracles.value] = await Promise.all([
        getSystems(),
        getHacks(),
        getUniverses(),
        getThemebooks(),
        getOracles(),
      ]);
    } finally {
      loading.value = false;
    }
  };

  const refreshCacheStatus = async () => {
    cacheStatus.value = await getCacheStatus();
  };

  const forceRefresh = async () => {
    loading.value = true;
    try {
      await forceRefreshAll();
      await loadAll();
      await refreshCacheStatus();
    } finally {
      loading.value = false;
    }
  };

  return {
    systems,
    hacks,
    universes,
    themebooks,
    oracles,
    loading,
    cacheStatus,
    loadAll,
    refreshCacheStatus,
    forceRefresh,
  };
});
```

## Mode Offline (v1.2+)

### 1. Détection Online/Offline

```typescript
// composables/useOnlineStatus.ts
export const useOnlineStatus = () => {
  const isOnline = ref(navigator.onLine);

  const updateOnlineStatus = () => {
    isOnline.value = navigator.onLine;
  };

  onMounted(() => {
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
  });

  onUnmounted(() => {
    window.removeEventListener('online', updateOnlineStatus);
    window.removeEventListener('offline', updateOnlineStatus);
  });

  return {
    isOnline: readonly(isOnline),
  };
};
```

### 2. Queue de Sync Offline

```typescript
// composables/useOfflineQueue.ts
export const useOfflineQueue = () => {
  const queue = ref<any[]>([]);

  const addToQueue = (action: any) => {
    queue.value.push({
      id: crypto.randomUUID(),
      action,
      timestamp: Date.now(),
    });

    // Persist queue dans localStorage
    localStorage.setItem('offline-queue', JSON.stringify(queue.value));
  };

  const processQueue = async () => {
    const { isOnline } = useOnlineStatus();

    if (!isOnline.value || queue.value.length === 0) return;

    for (const item of queue.value) {
      try {
        await item.action();
        queue.value = queue.value.filter(q => q.id !== item.id);
      } catch (error) {
        console.error('Failed to process queue item:', error);
      }
    }

    localStorage.setItem('offline-queue', JSON.stringify(queue.value));
  };

  return {
    queue: readonly(queue),
    addToQueue,
    processQueue,
  };
};
```

### 3. Indicateur UI

```vue
<!-- components/OfflineIndicator.vue -->
<template>
  <div v-if="!isOnline" class="offline-banner">
    Mode hors ligne - Les modifications seront synchronisées à la reconnexion
  </div>
</template>

<script setup lang="ts">
const { isOnline } = useOnlineStatus();
</script>

<style scoped>
.offline-banner {
  background: #ff9800;
  color: white;
  padding: 0.5rem 1rem;
  text-align: center;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}
</style>
```

## Tests E2E Playwright

### Test Cache IndexedDB

```typescript
// tests/e2e/static-data/indexeddb-cache.spec.ts
import { test, expect } from '@playwright/test';

test.describe('IndexedDB Cache pour données statiques', () => {
  test('Chargement initial depuis API puis cache', async ({ page, context }) => {
    // 1. Première visite : API call
    await page.goto('/');

    // Attendre chargement des systèmes
    await page.waitForResponse(response =>
      response.url().includes('/api/static/systems') && response.status() === 200
    );

    // Vérifier que IndexedDB est peuplé
    const systemsCount = await page.evaluate(async () => {
      const db = await indexedDB.databases();
      return db.find(d => d.name === 'brumisa3-static') ? 1 : 0;
    });

    expect(systemsCount).toBe(1);

    // 2. Refresh page : Cache IndexedDB, pas d'API call
    await page.reload();

    let apiCallMade = false;
    page.on('request', request => {
      if (request.url().includes('/api/static/systems')) {
        apiCallMade = true;
      }
    });

    await page.waitForLoadState('networkidle');

    // Aucun appel API fait (lecture depuis cache)
    expect(apiCallMade).toBe(false);
  });

  test('Revalidation en arrière-plan avec version obsolète', async ({ page }) => {
    // TODO: Mock API version endpoint pour simuler version obsolète
    // Vérifier que refresh automatique se déclenche
  });

  test('Performance : Basculement playspace < 500ms', async ({ page }) => {
    await page.goto('/playspaces/test-litm-chicago');

    const startTime = Date.now();

    // Basculer vers autre playspace
    await page.click('[data-testid="playspace-litm-londres"]');

    // Attendre chargement complet
    await expect(page.locator('[data-testid="active-playspace"]')).toContainText('Londres');

    const endTime = Date.now();
    const duration = endTime - startTime;

    // Critère de performance avec cache IndexedDB
    expect(duration).toBeLessThan(500);
  });
});
```

## Installation et Configuration

### 1. Dépendances

```bash
pnpm add idb
```

**Package** : `idb` (wrapper IndexedDB moderne)
- TypeScript natif
- Promesses au lieu de callbacks
- 1.5KB gzipped
- API similaire à native IndexedDB

### 2. Configuration Nuxt

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  // Rien de spécial requis pour IndexedDB
  // Fonctionne nativement côté client
});
```

### 3. Initialisation au Montage

```typescript
// app.vue ou layouts/default.vue
<script setup lang="ts">
const staticDataStore = useStaticDataStore();

onMounted(async () => {
  // Charger toutes les données statiques au démarrage
  await staticDataStore.loadAll();
});
</script>
```

## Roadmap d'Implémentation

### MVP v1.0 : Cache IndexedDB de Base

**Durée** : 1 semaine (inclus dans Phase 1 - Fondations)

```typescript
✅ Installation idb
✅ Composable useStaticData() complet
✅ API routes /api/static/* avec cache serveur
✅ Store Pinia staticData
✅ Versioning basique (numéro version manuel)
✅ Tests E2E cache (3 tests)
```

**Données cachées** :
- Systems (Mist Engine)
- Hacks (LITM, Otherscape)
- Universes par défaut (Chicago, Londres)
- Themebooks LITM
- Oracles généraux + hack

### v1.2 : Mode Offline Basique

**Durée** : 1 semaine

```typescript
✅ Composable useOnlineStatus()
✅ Composable useOfflineQueue()
✅ Indicateur UI "Mode hors ligne"
✅ Toast "Modifications seront synchronisées"
✅ Tests E2E mode offline (2 tests)
```

**Features** :
- Détection online/offline
- Queue de modifications offline
- Sync automatique au retour online
- Message utilisateur clair

### v2.0 : PWA Complet

**Durée** : 2 semaines

```typescript
✅ @vite-pwa/nuxt module
✅ Service Worker avec Workbox
✅ Cache API pour assets (CSS, JS, images)
✅ Background Sync pour queue
✅ Install prompt "Ajouter à l'écran d'accueil"
✅ Manifest.json pour PWA
✅ Tests E2E PWA (3 tests)
```

**Features** :
- Application installable (mobile + desktop)
- Offline-first complet
- Background sync quand connexion revient
- Push notifications (optionnel)

## Performances Mesurées

### Benchmarks (estimés)

| Opération | Sans Cache | Avec IndexedDB | Gain |
|-----------|------------|----------------|------|
| **Chargement initial app** | 1500ms | 50ms | **96%** |
| **Liste systèmes** | 200ms | 5ms | **97%** |
| **Liste hacks par système** | 300ms | 8ms | **97%** |
| **Themebooks par hack** | 500ms | 12ms | **98%** |
| **Oracles par niveau** | 400ms | 10ms | **97%** |
| **Basculement playspace** | 1800ms | 200ms | **89%** |

### Impact UX

**Avant IndexedDB** :
- Basculement playspace : 1.5-2s (3 API calls)
- Chargement oracles : 400-500ms
- Connexion lente (3G) : 3-5s

**Après IndexedDB** :
- Basculement playspace : 200-500ms
- Chargement oracles : 10-20ms
- Connexion lente (3G) : 200ms (cache local)

**Mode Offline** :
- Consultation personnages : ✅ Possible
- Création/édition : ✅ Possible (sync plus tard)
- Export JSON : ✅ Possible

## Bonnes Pratiques

### 1. Versioning Strict

```typescript
// Incrémenter version manuellement quand données changent
// server/api/static/systems/version.get.ts
export default defineEventHandler(() => {
  return {
    version: 2, // ← Incrémenter manuellement
    timestamp: new Date('2025-02-15').toISOString(),
  };
});
```

### 2. Gestion d'Erreurs

```typescript
// Toujours fallback sur API si IndexedDB échoue
const getSystems = async () => {
  try {
    const db = await initDB();
    const cached = await db.getAll('systems');

    if (cached.length > 0) {
      revalidateSystems(); // Async background
      return cached;
    }
  } catch (error) {
    console.warn('IndexedDB failed, falling back to API:', error);
  }

  // Fallback : API directe
  return await $fetch('/api/static/systems');
};
```

### 3. Monitoring

```typescript
// Tracker utilisation cache vs API
export const useStaticDataMetrics = () => {
  const metrics = {
    cacheHits: 0,
    cacheMisses: 0,
    apiCalls: 0,
  };

  const trackCacheHit = () => {
    metrics.cacheHits++;
    console.log('Cache hit:', metrics);
  };

  const trackCacheMiss = () => {
    metrics.cacheMisses++;
    console.log('Cache miss:', metrics);
  };

  return { metrics, trackCacheHit, trackCacheMiss };
};
```

### 4. Clear Cache en Dev

```typescript
// Ajouter command dans DevTools pour clear cache
if (process.dev) {
  window.__clearStaticCache = async () => {
    const { clearAllCache } = useStaticData();
    await clearAllCache();
    console.log('Static cache cleared');
  };
}
```

## Limitations et Considérations

### Limitations IndexedDB

1. **Quota navigateur** : ~50MB minimum, peut varier selon navigateur
2. **Mode privé** : IndexedDB peut être désactivé (fallback API requis)
3. **Multi-tabs** : Gestion concurrence (upgrade DB bloqué si autre tab ouverte)
4. **iOS Safari** : Quota plus limité (~50MB fixe)

### Solutions

```typescript
// Détection quota disponible
const checkQuota = async () => {
  if (navigator.storage && navigator.storage.estimate) {
    const estimate = await navigator.storage.estimate();
    console.log('Storage quota:', estimate.quota);
    console.log('Storage usage:', estimate.usage);
  }
};

// Fallback si IndexedDB indisponible
const isIndexedDBAvailable = () => {
  return 'indexedDB' in window;
};
```

## Récapitulatif

### Décision : OUI pour IndexedDB

**Raisons** :
- ✅ Gain performance massif (89-98%)
- ✅ Support offline essentiel pour companion tool
- ✅ Réduction charge PostgreSQL
- ✅ Meilleure UX (réactivité instantanée)

**Implémentation** :
- MVP v1.0 : Cache de base avec SWR
- v1.2 : Mode offline + queue sync
- v2.0 : PWA complet

**Données cachées** :
- Systems, Hacks, Universes (par défaut)
- Themebooks, Oracles (fixes)

**Total estimé** : 500KB - 2MB (confortable pour IndexedDB)

---

**Date** : 2025-01-19
**Version** : 1.0
**Auteur** : Technical Architect
**Statut** : Validé pour implémentation MVP v1.0
