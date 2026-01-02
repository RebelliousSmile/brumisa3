/**
 * Configuration des types de Theme Card par hack
 *
 * Source de verite unique pour :
 * - Couleurs neon par type de theme
 * - Icones Heroicons par type
 * - Descriptions pour le selecteur visuel
 *
 * Design System Otherscape:
 * - Couleurs neon: cyan #00d9d9, rose #ff006e, violet #9d4edd
 * - Variantes: vert #22c55e, orange #f97316, bleu #3b82f6
 *
 * @module theme-types.config
 */

export interface ThemeTypeConfig {
  /** Identifiant unique (ex: ORIGIN, NOISE) */
  id: string

  /** Nom affiche */
  label: string

  /** Description courte du type */
  description: string

  /** Couleur neon principale (hex) */
  color: string

  /** Couleur RGB pour les effets CSS (sans rgba) */
  colorRgb: string

  /** Icone Heroicons */
  icon: string

  /** Couleur glow pour les effets shadow */
  glowColor: string
}

/**
 * Types de themes pour Legends in the Mist
 */
const LITM_THEME_TYPES: ThemeTypeConfig[] = [
  {
    id: 'ORIGIN',
    label: 'Origin',
    description: 'Votre histoire et vos racines',
    color: '#00d9d9',
    colorRgb: '0, 217, 217',
    icon: 'heroicons:home',
    glowColor: 'rgba(0, 217, 217, 0.5)'
  },
  {
    id: 'ADVENTURE',
    label: 'Adventure',
    description: 'Vos exploits et votre progression',
    color: '#9d4edd',
    colorRgb: '157, 78, 221',
    icon: 'heroicons:trophy',
    glowColor: 'rgba(157, 78, 221, 0.5)'
  },
  {
    id: 'GREATNESS',
    label: 'Greatness',
    description: 'Votre potentiel legendaire',
    color: '#f97316',
    colorRgb: '249, 115, 22',
    icon: 'heroicons:star',
    glowColor: 'rgba(249, 115, 22, 0.5)'
  },
  {
    id: 'FELLOWSHIP',
    label: 'Fellowship',
    description: 'Vos liens et votre communaute',
    color: '#22c55e',
    colorRgb: '34, 197, 94',
    icon: 'heroicons:user-group',
    glowColor: 'rgba(34, 197, 94, 0.5)'
  },
  {
    id: 'BACKPACK',
    label: 'Backpack',
    description: 'Votre equipement et ressources',
    color: '#3b82f6',
    colorRgb: '59, 130, 246',
    icon: 'heroicons:briefcase',
    glowColor: 'rgba(59, 130, 246, 0.5)'
  }
]

/**
 * Types de themes pour Tokyo: Otherscape
 */
const OTHERSCAPE_THEME_TYPES: ThemeTypeConfig[] = [
  {
    id: 'NOISE',
    label: 'Noise',
    description: 'Le chaos technologique qui vous habite',
    color: '#ff006e',
    colorRgb: '255, 0, 110',
    icon: 'heroicons:signal',
    glowColor: 'rgba(255, 0, 110, 0.5)'
  },
  {
    id: 'SELF',
    label: 'Self',
    description: 'Votre identite profonde',
    color: '#00d9d9',
    colorRgb: '0, 217, 217',
    icon: 'heroicons:user',
    glowColor: 'rgba(0, 217, 217, 0.5)'
  },
  {
    id: 'MYTHOS_OS',
    label: 'Mythos-OS',
    description: 'Votre connexion au surnaturel numerique',
    color: '#9d4edd',
    colorRgb: '157, 78, 221',
    icon: 'heroicons:cpu-chip',
    glowColor: 'rgba(157, 78, 221, 0.5)'
  },
  {
    id: 'CREW_OS',
    label: 'Crew-OS',
    description: 'Votre reseau et vos allies',
    color: '#22c55e',
    colorRgb: '34, 197, 94',
    icon: 'heroicons:users',
    glowColor: 'rgba(34, 197, 94, 0.5)'
  },
  {
    id: 'LOADOUT',
    label: 'Loadout',
    description: 'Votre arsenal cybernetique',
    color: '#f97316',
    colorRgb: '249, 115, 22',
    icon: 'heroicons:wrench-screwdriver',
    glowColor: 'rgba(249, 115, 22, 0.5)'
  }
]

/**
 * Types de themes pour City of Mist (1ere edition)
 */
const CITY_OF_MIST_THEME_TYPES: ThemeTypeConfig[] = [
  {
    id: 'MYTHOS',
    label: 'Mythos',
    description: 'Votre legende et pouvoirs mythiques',
    color: '#9d4edd',
    colorRgb: '157, 78, 221',
    icon: 'heroicons:sparkles',
    glowColor: 'rgba(157, 78, 221, 0.5)'
  },
  {
    id: 'LOGOS',
    label: 'Logos',
    description: 'Votre vie quotidienne et identite',
    color: '#00d9d9',
    colorRgb: '0, 217, 217',
    icon: 'heroicons:identification',
    glowColor: 'rgba(0, 217, 217, 0.5)'
  },
  {
    id: 'MIST',
    label: 'Mist',
    description: 'Les mysteres qui vous entourent',
    color: '#6b7280',
    colorRgb: '107, 114, 128',
    icon: 'heroicons:cloud',
    glowColor: 'rgba(107, 114, 128, 0.5)'
  },
  {
    id: 'CREW',
    label: 'Crew',
    description: 'Votre equipe et ressources partagees',
    color: '#22c55e',
    colorRgb: '34, 197, 94',
    icon: 'heroicons:user-group',
    glowColor: 'rgba(34, 197, 94, 0.5)'
  }
]

/**
 * Mapping des types de themes par hack
 */
export const THEME_TYPES_BY_HACK: Record<string, ThemeTypeConfig[]> = {
  'litm': LITM_THEME_TYPES,
  'otherscape': OTHERSCAPE_THEME_TYPES,
  'city-of-mist': CITY_OF_MIST_THEME_TYPES
}

/**
 * Recupere les types de themes disponibles pour un hack
 *
 * @param hackId - Identifiant du hack (litm, otherscape, city-of-mist)
 * @returns Liste des configurations de types de themes
 *
 * @example
 * ```typescript
 * const types = getThemeTypesForHack('litm')
 * // [{ id: 'ORIGIN', label: 'Origin', ... }, ...]
 * ```
 */
export function getThemeTypesForHack(hackId: string): ThemeTypeConfig[] {
  return THEME_TYPES_BY_HACK[hackId] || THEME_TYPES_BY_HACK['city-of-mist']
}

/**
 * Recupere la configuration d'un type de theme specifique
 *
 * @param hackId - Identifiant du hack
 * @param typeId - Identifiant du type de theme (ex: ORIGIN, NOISE)
 * @returns Configuration du type ou null si non trouve
 *
 * @example
 * ```typescript
 * const config = getThemeTypeConfig('litm', 'ORIGIN')
 * // { id: 'ORIGIN', color: '#00d9d9', icon: 'heroicons:home', ... }
 * ```
 */
export function getThemeTypeConfig(hackId: string, typeId: string): ThemeTypeConfig | null {
  const types = getThemeTypesForHack(hackId)
  return types.find(t => t.id === typeId) || null
}

/**
 * Recupere la couleur d'un type de theme
 *
 * @param hackId - Identifiant du hack
 * @param typeId - Identifiant du type de theme
 * @returns Couleur hex ou couleur par defaut (#00d9d9)
 */
export function getThemeTypeColor(hackId: string, typeId: string): string {
  const config = getThemeTypeConfig(hackId, typeId)
  return config?.color || '#00d9d9'
}

/**
 * Recupere l'icone d'un type de theme
 *
 * @param hackId - Identifiant du hack
 * @param typeId - Identifiant du type de theme
 * @returns Nom de l'icone Heroicons ou icone par defaut
 */
export function getThemeTypeIcon(hackId: string, typeId: string): string {
  const config = getThemeTypeConfig(hackId, typeId)
  return config?.icon || 'heroicons:squares-2x2'
}
