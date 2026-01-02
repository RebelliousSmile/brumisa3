/**
 * Tests de contrat : Playspace Hack+Univers Business Rules
 *
 * Valide :
 * - All playspaces MUST have hackId defined
 * - hackId MUST be valid (city-of-mist, litm, otherscape)
 * - universeId null = utilise defaultUniverse du hack
 * - isGM MUST be Boolean (false = PC mode, true = GM mode)
 */

import { describe, it, expect } from 'vitest'
import { PrismaClient } from '@prisma/client'
import { getVersionId, getUniverseName, HACKS } from '../../server/config/systems.config'

const prisma = new PrismaClient()

describe('Playspace Hack+Univers Business Rules', () => {
  it('All playspaces MUST have hackId defined (not null)', async () => {
    const playspaces = await prisma.playspace.findMany()

    expect(playspaces.length).toBeGreaterThan(0) // Au moins 1 playspace dans DB

    for (const playspace of playspaces) {
      expect(playspace.hackId).toBeDefined()
      expect(playspace.hackId).not.toBeNull()
      expect(playspace.hackId.length).toBeGreaterThan(0)
    }
  })

  it('All playspaces MUST have valid hackId', async () => {
    const playspaces = await prisma.playspace.findMany()
    const validHacks = Object.keys(HACKS)

    for (const playspace of playspaces) {
      expect(validHacks).toContain(playspace.hackId)
    }
  })

  it('All playspaces MUST have isGM Boolean (GM vs PC mode)', async () => {
    const playspaces = await prisma.playspace.findMany()

    for (const playspace of playspaces) {
      // isGM doit être Boolean (false = PC mode, true = GM mode)
      expect(playspace).toHaveProperty('isGM')
      expect(typeof playspace.isGM).toBe('boolean')
    }
  })

  it('hackId derives correct versionId via config', async () => {
    // City of Mist → v1.0
    expect(getVersionId('city-of-mist')).toBe('1.0')

    // LITM → v2.0
    expect(getVersionId('litm')).toBe('2.0')

    // Otherscape → v2.0
    expect(getVersionId('otherscape')).toBe('2.0')
  })

  it('universeId null uses defaultUniverse from hack config', async () => {
    // LITM universeId null → "obojima"
    expect(getUniverseName('litm', null)).toBe('obojima')

    // City of Mist universeId null → "the-city"
    expect(getUniverseName('city-of-mist', null)).toBe('the-city')
  })
})
