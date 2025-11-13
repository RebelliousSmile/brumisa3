/**
 * API route pour lister tous les hacks disponibles
 *
 * GET /api/hacks
 */

import { getAllHacks } from '../../config/hacks'

export default defineEventHandler(() => {
  const hacks = getAllHacks()

  return hacks.map(hack => ({
    id: hack.id,
    name: hack.name,
    version: hack.version,
    baseSystemId: hack.baseSystemId,
    config: hack
  }))
})
