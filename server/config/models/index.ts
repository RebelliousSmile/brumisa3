/**
 * Registry central des modèles
 */

import { USER_MODEL } from './user.model'
import { DOCUMENT_MODEL } from './document.model'
import { CHARACTER_MODEL } from './character.model'
import { THEME_CARD_MODEL } from './theme-card.model'
import { TRACKER_MODEL } from './tracker.model'
import type { ModelDefinition } from './types'

// Registry de tous les modèles
export const MODELS = {
  User: USER_MODEL,
  Document: DOCUMENT_MODEL,
  Character: CHARACTER_MODEL,
  ThemeCard: THEME_CARD_MODEL,
  Tracker: TRACKER_MODEL
} as const

export type ModelName = keyof typeof MODELS

/**
 * Récupère la définition d'un modèle
 */
export function getModel(modelName: string): ModelDefinition | undefined {
  return MODELS[modelName as ModelName]
}

/**
 * Vérifie si un modèle existe
 */
export function isValidModel(modelName: string): modelName is ModelName {
  return modelName in MODELS
}

/**
 * Liste tous les modèles
 */
export function getAllModels(): ModelDefinition[] {
  return Object.values(MODELS)
}

/**
 * Liste les noms de tous les modèles
 */
export function getModelNames(): string[] {
  return Object.keys(MODELS)
}

// Export des modèles individuels
export { USER_MODEL } from './user.model'
export { DOCUMENT_MODEL } from './document.model'
export { CHARACTER_MODEL } from './character.model'
export { THEME_CARD_MODEL } from './theme-card.model'
export { TRACKER_MODEL } from './tracker.model'

// Export des types
export * from './types'
