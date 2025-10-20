/**
 * Configuration du système Mist (système de base)
 *
 * Note: LITM (Legends in the Mist) est un hack de ce système de base
 */

export const MIST_SYSTEM = {
  id: 'mist',
  code: 'mist',
  name: 'Mist',
  version: '1.0.0',

  // Types de thèmes disponibles
  themeTypes: [
    {
      code: 'origin',
      name: 'Origin',
      minTags: 3,
      maxTags: 5,
      allowWeaknessTags: true,
      color: '#1E40AF',
      order: 1
    },
    {
      code: 'adventure',
      name: 'Adventure',
      minTags: 3,
      maxTags: 5,
      allowWeaknessTags: true,
      color: '#DC2626',
      order: 2
    },
    {
      code: 'greatness',
      name: 'Greatness',
      minTags: 3,
      maxTags: 5,
      allowWeaknessTags: true,
      color: '#CA8A04',
      order: 3
    },
    {
      code: 'fellowship',
      name: 'Fellowship',
      minTags: 3,
      maxTags: 5,
      allowWeaknessTags: true,
      color: '#059669',
      order: 4
    },
    {
      code: 'backpack',
      name: 'Backpack',
      minTags: 0,
      maxTags: 10,
      allowWeaknessTags: false,
      color: '#7C3AED',
      order: 5
    }
  ],

  // Mécanique de progression
  progression: {
    type: 'milestone' as const,
    maxLevel: 20,
    milestonesPerLevel: 10
  },

  // Règles de validation
  validation: {
    minThemes: 4,
    maxThemes: 6,
    requiresHeroCard: true,
    maxTagsPerTheme: 5,
    maxPowerTags: 4,
    maxWeaknessTags: 1
  },

  // Configuration PDF
  pdf: {
    includeHeroCard: true,
    themeOrder: ['origin', 'adventure', 'greatness', 'fellowship', 'backpack']
  }
} as const

export type MistSystemConfig = typeof MIST_SYSTEM
