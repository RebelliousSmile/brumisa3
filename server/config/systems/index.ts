/**
 * Registry central des systèmes de jeu
 */

import { MIST_SYSTEM } from './mist'
import { CITY_OF_MIST_SYSTEM } from './city-of-mist'

// Type générique pour les configs
export type SystemConfig = typeof MIST_SYSTEM | typeof CITY_OF_MIST_SYSTEM

// Registry des systèmes disponibles
export const SYSTEMS = {
  mist: MIST_SYSTEM,
  'city-of-mist': CITY_OF_MIST_SYSTEM
} as const

// Type pour les IDs de systèmes
export type SystemId = keyof typeof SYSTEMS

// Helper pour récupérer une config
export function getSystemConfig(systemId: string): SystemConfig | undefined {
  return SYSTEMS[systemId as SystemId]
}

// Helper pour vérifier si un système existe
export function isValidSystemId(systemId: string): systemId is SystemId {
  return systemId in SYSTEMS
}

// Liste de tous les systèmes
export function getAllSystems(): SystemConfig[] {
  return Object.values(SYSTEMS)
}

// Récupère le système parent d'un hack (utile pour résolution config)
export function getParentSystem(hackId: string): SystemConfig | undefined {
  // Pour l'instant, mapping simple
  // LITM -> Mist
  const hackToSystem: Record<string, SystemId> = {
    'litm': 'mist'
  }

  const parentSystemId = hackToSystem[hackId]
  return parentSystemId ? SYSTEMS[parentSystemId] : undefined
}
