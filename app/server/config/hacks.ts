/**
 * Configuration des hacks - Fonctions utilitaires serveur
 */

import { HACKS, type HackConfig } from './systems.config'

export type HackId = keyof typeof HACKS

/**
 * Verifie si un hackId est valide
 */
export function isValidHackId(hackId: string): hackId is HackId {
  return hackId in HACKS
}

/**
 * Recupere la configuration d'un hack
 */
export function getHackConfig(hackId: string): HackConfig | null {
  if (!isValidHackId(hackId)) {
    return null
  }
  return HACKS[hackId]
}

/**
 * Liste tous les hacks disponibles
 */
export function getAllHacks(): HackConfig[] {
  return Object.values(HACKS)
}

/**
 * Liste les IDs de tous les hacks
 */
export function getAllHackIds(): HackId[] {
  return Object.keys(HACKS) as HackId[]
}
