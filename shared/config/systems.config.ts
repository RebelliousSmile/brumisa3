/**
 * Configuration des versions et hacks du Mist Engine
 *
 * Source de vérité unique pour :
 * - Noms des versions (City of Mist 1.0, Mist Engine 2.0)
 * - Hacks valides par version
 * - Validation business rules
 *
 * @module systems.config
 */

export interface SystemConfig {
  /** Nom affiché de la version (ex: "City of Mist", "Mist Engine") */
  name: string

  /** Description de la version */
  description: string

  /** Hacks valides pour cette version */
  validHacks: readonly string[]

  /** Éditeur du système */
  publisher: string
}

export interface HackConfig {
  /** Identifiant unique du hack */
  id: string

  /** Nom affiché du hack */
  name: string

  /** Description du hack */
  description: string

  /** Version parente (1.0, 2.0, etc.) */
  versionId: string

  /** Univers par défaut du hack */
  defaultUniverse: string

  /** ThemeTypes valides pour ce hack */
  validThemeTypes: readonly string[]

  /** Nombre min/max de ThemeCards par character */
  themeCardsRange: { min: number; max: number }

  /** Nombre min/max de Tags par ThemeCard */
  tagsPerCardRange: { min: number; max: number }
}

/**
 * Configuration des versions Mist Engine
 *
 * @constant
 */
export const SYSTEMS = {
  '1.0': {
    name: 'City of Mist',
    description: 'Première édition - Jeu moderne/noir urbain',
    validHacks: ['city-of-mist'] as const,
    publisher: 'Son of Oak Game Studio'
  },
  '2.0': {
    name: 'Mist Engine',
    description: 'Deuxième édition - Système générique avec hacks',
    validHacks: ['litm', 'otherscape'] as const,
    publisher: 'Son of Oak Game Studio'
  }
} as const satisfies Record<string, SystemConfig>

/**
 * Configuration des hacks disponibles
 *
 * @constant
 */
export const HACKS = {
  'city-of-mist': {
    id: 'city-of-mist',
    name: 'City of Mist',
    description: 'Jeu original moderne/noir urbain (version 1.0)',
    versionId: '1.0',
    defaultUniverse: 'the-city',
    validThemeTypes: ['MYTHOS', 'LOGOS', 'MIST', 'CREW'] as const,
    themeCardsRange: { min: 1, max: 4 },
    tagsPerCardRange: { min: 3, max: 5 }
  },
  'litm': {
    id: 'litm',
    name: 'Legends in the Mist',
    description: 'Hack fantasy médiéval-japonais (version 2.0)',
    versionId: '2.0',
    defaultUniverse: 'obojima',
    validThemeTypes: ['ORIGIN', 'ADVENTURE', 'GREATNESS', 'FELLOWSHIP', 'BACKPACK'] as const,
    themeCardsRange: { min: 1, max: 4 },
    tagsPerCardRange: { min: 3, max: 5 }
  },
  'otherscape': {
    id: 'otherscape',
    name: 'Tokyo:Otherscape',
    description: 'Hack cyberpunk japonais (version 2.0)',
    versionId: '2.0',
    defaultUniverse: 'tokyo-otherscape',
    validThemeTypes: ['NOISE', 'SELF', 'MYTHOS_OS', 'CREW_OS', 'LOADOUT'] as const,
    themeCardsRange: { min: 1, max: 4 },
    tagsPerCardRange: { min: 3, max: 5 }
  }
} as const satisfies Record<string, HackConfig>

/**
 * Types dérivés pour TypeScript strict
 */
/**
 * Configuration des univers disponibles
 * Noms d'affichage pour l'UI
 *
 * @constant
 */
export const UNIVERSES = {
  // City of Mist
  'the-city': {
    id: 'the-city',
    name: 'The City',
    hackId: 'city-of-mist'
  },
  // Legends in the Mist
  'obojima': {
    id: 'obojima',
    name: 'Obojima',
    hackId: 'litm'
  },
  // Tokyo:Otherscape
  'tokyo-otherscape': {
    id: 'tokyo-otherscape',
    name: 'Tokyo',
    hackId: 'otherscape'
  }
} as const

export type VersionId = keyof typeof SYSTEMS
export type HackId = keyof typeof HACKS
export type UniverseId = keyof typeof UNIVERSES

/**
 * Valide qu'un hack est compatible avec une version
 *
 * @param versionId - Identifiant de version ("1.0", "2.0")
 * @param hackId - Identifiant du hack ("city-of-mist", "litm", "otherscape")
 * @returns true si le hack est valide pour cette version
 *
 * @example
 * ```typescript
 * validateVersionHack('1.0', 'city-of-mist') // true
 * validateVersionHack('1.0', 'litm')         // false (litm = v2.0 uniquement)
 * validateVersionHack('2.0', 'litm')         // true
 * ```
 */
export function validateVersionHack(versionId: string, hackId: string): boolean {
  const system = SYSTEMS[versionId as VersionId]
  if (!system) return false

  return system.validHacks.includes(hackId as any)
}

/**
 * Récupère le versionId depuis un hackId
 *
 * @param hackId - Identifiant du hack
 * @returns versionId ("1.0", "2.0")
 *
 * @example
 * ```typescript
 * getVersionId('city-of-mist') // "1.0"
 * getVersionId('litm')          // "2.0"
 * ```
 */
export function getVersionId(hackId: string): string {
  return HACKS[hackId as HackId]?.versionId ?? '1.0'
}

/**
 * Récupère le nom affiché d'une version
 *
 * @param versionId - Identifiant de version ("1.0", "2.0")
 * @returns Nom affiché ("City of Mist", "Mist Engine")
 *
 * @example
 * ```typescript
 * getVersionName('1.0') // "City of Mist"
 * getVersionName('2.0') // "Mist Engine"
 * ```
 */
export function getVersionName(versionId: string): string {
  return SYSTEMS[versionId as VersionId]?.name ?? versionId
}

/**
 * Récupère le nom affiché d'un hack
 *
 * @param hackId - Identifiant du hack
 * @returns Nom affiché du hack
 *
 * @example
 * ```typescript
 * getHackName('litm') // "Legends in the Mist"
 * getHackName('otherscape') // "Tokyo:Otherscape"
 * ```
 */
export function getHackName(hackId: string): string {
  return HACKS[hackId as HackId]?.name ?? hackId
}

/**
 * Récupère le nom complet "Version + Hack"
 *
 * @param versionId - Identifiant de version
 * @param hackId - Identifiant du hack
 * @returns Nom complet (ex: "Mist Engine 2.0 - Legends in the Mist")
 *
 * @example
 * ```typescript
 * getFullSystemName('2.0', 'litm') // "Mist Engine 2.0 - Legends in the Mist"
 * getFullSystemName('1.0', 'city-of-mist') // "City of Mist 1.0"
 * ```
 */
export function getFullSystemName(versionId: string, hackId: string): string {
  const versionName = getVersionName(versionId)
  const hackName = getHackName(hackId)

  // City of Mist 1.0 = pas de redondance (hack name = version name)
  if (versionId === '1.0' && hackId === 'city-of-mist') {
    return `${versionName} ${versionId}`
  }

  // Mist Engine 2.0 - Legends in the Mist
  return `${versionName} ${versionId} - ${hackName}`
}

/**
 * Récupère la liste des hacks valides pour une version
 *
 * @param versionId - Identifiant de version
 * @returns Liste des hacks valides avec leurs infos complètes
 *
 * @example
 * ```typescript
 * getValidHacksForVersion('2.0')
 * // [
 * //   { id: 'litm', name: 'Legends in the Mist', ... },
 * //   { id: 'otherscape', name: 'Tokyo:Otherscape', ... }
 * // ]
 * ```
 */
export function getValidHacksForVersion(versionId: string): HackConfig[] {
  const system = SYSTEMS[versionId as VersionId]
  if (!system) return []

  return system.validHacks
    .map(hackId => HACKS[hackId])
    .filter(Boolean)
}

/**
 * Récupère l'ID de l'univers (default ou custom)
 *
 * @param hackId - Identifiant du hack
 * @param universeId - ID univers custom (null = default)
 * @returns ID de l'univers
 *
 * @example
 * ```typescript
 * getUniverseName('litm', null)       // "obojima" (default)
 * getUniverseName('litm', 'paris-1920') // "paris-1920" (custom)
 * ```
 */
export function getUniverseName(hackId: string, universeId: string | null): string {
  if (universeId) return universeId

  const hack = HACKS[hackId as HackId]
  return hack?.defaultUniverse ?? 'unknown'
}

/**
 * Récupère le nom d'affichage d'un univers
 *
 * @param universeId - ID de l'univers
 * @returns Nom d'affichage de l'univers
 *
 * @example
 * ```typescript
 * getUniverseDisplayName('tokyo-otherscape') // "Tokyo"
 * getUniverseDisplayName('obojima')          // "Obojima"
 * getUniverseDisplayName('custom-world')     // "custom-world" (fallback)
 * ```
 */
export function getUniverseDisplayName(universeId: string | null): string {
  if (!universeId) return 'Par défaut'
  return UNIVERSES[universeId as UniverseId]?.name ?? universeId
}

/**
 * Valide qu'un ThemeType est valide pour un hack
 *
 * @param hackId - Identifiant du hack
 * @param themeType - Type de theme à valider
 * @returns true si le ThemeType est valide pour ce hack
 *
 * @example
 * ```typescript
 * validateThemeType('city-of-mist', 'MYTHOS')  // true
 * validateThemeType('city-of-mist', 'ORIGIN')  // false (ORIGIN = LITM uniquement)
 * validateThemeType('litm', 'ORIGIN')          // true
 * ```
 */
export function validateThemeType(hackId: string, themeType: string): boolean {
  const hack = HACKS[hackId as HackId]
  if (!hack) return false

  return hack.validThemeTypes.includes(themeType as any)
}

/**
 * Récupère les règles du hack (ThemeCards, Tags)
 *
 * @param hackId - Identifiant du hack
 * @returns Règles du hack (ranges, validThemeTypes)
 *
 * @example
 * ```typescript
 * getHackRules('litm')
 * // {
 * //   themeCardsRange: { min: 1, max: 4 },
 * //   tagsPerCardRange: { min: 3, max: 5 },
 * //   validThemeTypes: ['ORIGIN', 'ADVENTURE', ...]
 * // }
 * ```
 */
export function getHackRules(hackId: string) {
  const hack = HACKS[hackId as HackId]
  if (!hack) return null

  return {
    themeCardsRange: hack.themeCardsRange,
    tagsPerCardRange: hack.tagsPerCardRange,
    validThemeTypes: hack.validThemeTypes
  }
}
