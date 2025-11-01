/**
 * Tests de contrat : Seed Playspaces Hack+Univers
 *
 * Valide :
 * - Seed creates 2 playspaces
 * - City of Mist playspace (hackId city-of-mist)
 * - LITM playspace (hackId litm)
 * - universeId null = utilise defaultUniverse
 */

import { describe, it, expect } from 'vitest'
import { PrismaClient } from '@prisma/client'
import { getVersionId, getUniverseName } from '../../server/config/systems.config'

const prisma = new PrismaClient()

describe('Seed Playspaces Hack+Univers', () => {
  it('Database has at least 2 playspaces (from seed)', async () => {
    const playspaces = await prisma.playspace.findMany()
    expect(playspaces.length).toBeGreaterThanOrEqual(2)
  })

  it('Seed creates City of Mist playspace (hackId city-of-mist)', async () => {
    const comPlayspace = await prisma.playspace.findFirst({
      where: { hackId: 'city-of-mist' }
    })

    expect(comPlayspace).toBeDefined()
    expect(comPlayspace!.name).toBe('Chicago Investigations')
    expect(comPlayspace!.hackId).toBe('city-of-mist')
    expect(comPlayspace!.universeId).toBeNull() // null = defaultUniverse "the-city"

    // Version dérivée depuis config
    expect(getVersionId(comPlayspace!.hackId)).toBe('1.0')
  })

  it('Seed creates LITM playspace (hackId litm)', async () => {
    const litmPlayspace = await prisma.playspace.findFirst({
      where: { hackId: 'litm' }
    })

    expect(litmPlayspace).toBeDefined()
    expect(litmPlayspace!.hackId).toBe('litm')
    expect(litmPlayspace!.universeId).toBeNull() // null = defaultUniverse "obojima"
    expect(litmPlayspace!.name).toBe('Legends of Obojima')

    // Version dérivée depuis config
    expect(getVersionId(litmPlayspace!.hackId)).toBe('2.0')

    // Univers par défaut
    expect(getUniverseName(litmPlayspace!.hackId, litmPlayspace!.universeId)).toBe('obojima')
  })

  it('All seed playspaces have valid hackId', async () => {
    const playspaces = await prisma.playspace.findMany()
    const validHacks = ['city-of-mist', 'litm', 'otherlands']

    for (const playspace of playspaces) {
      expect(validHacks).toContain(playspace.hackId)
    }
  })
})
