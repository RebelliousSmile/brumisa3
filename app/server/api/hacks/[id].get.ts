/**
 * API route pour récupérer la configuration d'un hack
 *
 * GET /api/hacks/:id
 */

import { getHackConfig, isValidHackId } from '../../config/hacks'

export default defineEventHandler((event) => {
  const hackId = getRouterParam(event, 'id')

  if (!hackId || !isValidHackId(hackId)) {
    throw createError({
      statusCode: 404,
      message: `Hack not found: ${hackId}`
    })
  }

  const config = getHackConfig(hackId)

  if (!config) {
    throw createError({
      statusCode: 404,
      message: `Hack configuration not found: ${hackId}`
    })
  }

  return {
    id: config.id,
    name: config.name,
    version: config.version,
    baseSystemId: config.baseSystemId,
    config
  }
})
