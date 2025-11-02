/**
 * Utilitaire pour valider des données avec les modèles dans les API routes
 */

import { createValidator } from '../config/models/validator'
import { getModel } from '../config/models'
import type { H3Event } from 'h3'

/**
 * Valide le body d'une requête selon un modèle
 * Renvoie une erreur HTTP 400 si la validation échoue
 */
export async function validateBody(
  event: H3Event,
  modelName: string,
  mode: 'create' | 'update' = 'create'
) {
  const model = getModel(modelName)

  if (!model) {
    throw createError({
      statusCode: 500,
      message: `Model ${modelName} not found`
    })
  }

  const body = await readBody(event)
  const validator = createValidator(model)

  const result = mode === 'create'
    ? validator.validateCreate(body)
    : validator.validateUpdate(body)

  if (!result.success) {
    const errorMessages = result.errors.map(err =>
      `${err.path.join('.')}: ${err.message}`
    )

    throw createError({
      statusCode: 400,
      message: 'Validation failed',
      data: {
        errors: errorMessages,
        details: result.errors
      }
    })
  }

  return result.data
}

/**
 * Exemple d'utilisation dans une API route
 */
export function useModelValidation() {
  return {
    validateBody,

    // Helper pour créer un validateur réutilisable
    createModelValidator: (modelName: string) => {
      const model = getModel(modelName)
      if (!model) {
        throw new Error(`Model ${modelName} not found`)
      }
      return createValidator(model)
    }
  }
}
