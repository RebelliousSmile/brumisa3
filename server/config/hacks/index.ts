/**
 * Registry des hacks disponibles
 */

import { LITM_HACK } from './litm'

// Type pour les hacks
export type HackConfig = typeof LITM_HACK

// Registry des hacks
export const HACKS = {
  litm: LITM_HACK
} as const

// Type pour les IDs de hacks
export type HackId = keyof typeof HACKS

// Helper pour récupérer une config de hack
export function getHackConfig(hackId: string): HackConfig | undefined {
  return HACKS[hackId as HackId]
}

// Helper pour vérifier si un hack existe
export function isValidHackId(hackId: string): hackId is HackId {
  return hackId in HACKS
}

// Liste de tous les hacks
export function getAllHacks(): HackConfig[] {
  return Object.values(HACKS)
}
