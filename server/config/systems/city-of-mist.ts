/**
 * Configuration du système City of Mist
 */

export const CITY_OF_MIST_SYSTEM = {
  id: 'city-of-mist',
  code: 'com',
  name: 'City of Mist',
  version: '1.0.0',

  // Types de thèmes disponibles
  themeTypes: [
    {
      code: 'mythos',
      name: 'Mythos',
      minTags: 3,
      maxTags: 5,
      allowWeaknessTags: true,
      color: '#8B0000',
      order: 1
    },
    {
      code: 'logos',
      name: 'Logos',
      minTags: 3,
      maxTags: 5,
      allowWeaknessTags: true,
      color: '#1E3A8A',
      order: 2
    },
    {
      code: 'mist',
      name: 'Mist',
      minTags: 0,
      maxTags: 3,
      allowWeaknessTags: false,
      color: '#6B7280',
      order: 3
    },
    {
      code: 'crew',
      name: 'Crew',
      minTags: 3,
      maxTags: 5,
      allowWeaknessTags: true,
      color: '#059669',
      order: 4
    },
    {
      code: 'loadout',
      name: 'Loadout',
      minTags: 0,
      maxTags: 10,
      allowWeaknessTags: false,
      color: '#9333EA',
      order: 5
    }
  ],

  // Mécanique de progression
  progression: {
    type: 'attention' as const,
    cracksToAttention: 3,
    attentionToFade: 3
  },

  // Règles de validation
  validation: {
    minThemes: 4,
    maxThemes: 8,
    requiresHeroCard: false,
    maxTagsPerTheme: 5,
    maxPowerTags: 4,
    maxWeaknessTags: 1
  },

  // Configuration PDF
  pdf: {
    includeHeroCard: false,
    themeOrder: ['mythos', 'logos', 'crew', 'mist', 'loadout']
  }
} as const

export type CityOfMistSystemConfig = typeof CITY_OF_MIST_SYSTEM
