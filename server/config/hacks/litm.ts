/**
 * Configuration du hack LITM (Legends in the Mist)
 * Basé sur le système Mist avec quelques ajustements
 */

import { MIST_SYSTEM } from '../systems/mist'

export const LITM_HACK = {
  ...MIST_SYSTEM,

  // Identité du hack
  id: 'litm',
  code: 'litm',
  name: 'Legends in the Mist',
  version: '1.5.0',
  baseSystemId: 'mist',

  // Override : LITM a une Hero Card obligatoire
  validation: {
    ...MIST_SYSTEM.validation,
    requiresHeroCard: true
  }

  // Note: Tous les autres paramètres (themeTypes, progression, pdf)
  // sont hérités du système Mist de base
} as const

export type LITMHackConfig = typeof LITM_HACK
