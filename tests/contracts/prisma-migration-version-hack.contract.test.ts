/**
 * Tests de contrat : Prisma Migration Hack+Univers
 *
 * Valide :
 * - City of Mist playspaces migrated to hackId city-of-mist
 * - LITM playspaces migrated to hackId litm
 * - universeId ajouté (optionnel)
 */

import { describe, it, expect } from 'vitest'
import { PrismaClient } from '@prisma/client'
import { getVersionId } from '../../server/config/systems.config'

const prisma = new PrismaClient()

describe('Prisma Migration Hack+Univers', () => {
  it('City of Mist playspaces migrated to hackId city-of-mist', async () => {
    const comPlayspaces = await prisma.playspace.findMany({
      where: { hackId: 'city-of-mist' }
    })

    expect(comPlayspaces.length).toBeGreaterThanOrEqual(1)

    for (const playspace of comPlayspaces) {
      expect(playspace.hackId).toBe('city-of-mist')
      // Version dérivée depuis config
      expect(getVersionId(playspace.hackId)).toBe('1.0')
    }
  })

  it('LITM playspaces migrated to hackId litm', async () => {
    const litmPlayspaces = await prisma.playspace.findMany({
      where: { hackId: 'litm' }
    })

    expect(litmPlayspaces.length).toBeGreaterThanOrEqual(1)

    for (const playspace of litmPlayspaces) {
      expect(playspace.hackId).toBe('litm')
      // Version dérivée depuis config
      expect(getVersionId(playspace.hackId)).toBe('2.0')
    }
  })

  it('All playspaces have universeId field (nullable)', async () => {
    const playspaces = await prisma.playspace.findMany()

    for (const playspace of playspaces) {
      // universeId peut être null ou string (pas undefined)
      expect(playspace).toHaveProperty('universeId')
    }
  })
})
