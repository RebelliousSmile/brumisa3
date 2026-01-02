/**
 * Tests de contrat : Seed Playspaces Hack+Univers
 *
 * Valide :
 * - Seed creates 2 playspaces
 * - City of Mist playspace (hackId city-of-mist, isGM: true)
 * - LITM playspace (hackId litm, isGM: false)
 * - universeId null = utilise defaultUniverse
 * - isGM Boolean (false = PC mode, true = GM mode)
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

  it('Seed creates City of Mist playspace with GM mode', async () => {
    const comPlayspace = await prisma.playspace.findFirst({
      where: {
        hackId: 'city-of-mist',
        name: 'Chicago Investigations'
      }
    })

    expect(comPlayspace).toBeDefined()
    expect(comPlayspace!.name).toBe('Chicago Investigations')
    expect(comPlayspace!.hackId).toBe('city-of-mist')
    expect(comPlayspace!.universeId).toBeNull() // null = defaultUniverse "the-city"
    expect(comPlayspace!.isGM).toBe(true) // GM mode (Game Master)

    // Version dérivée depuis config
    expect(getVersionId(comPlayspace!.hackId)).toBe('1.0')
  })

  it('Seed creates LITM playspace with PC mode', async () => {
    const litmPlayspace = await prisma.playspace.findFirst({
      where: {
        hackId: 'litm',
        name: 'Legends of Obojima'
      }
    })

    expect(litmPlayspace).toBeDefined()
    expect(litmPlayspace!.hackId).toBe('litm')
    expect(litmPlayspace!.universeId).toBeNull() // null = defaultUniverse "obojima"
    expect(litmPlayspace!.name).toBe('Legends of Obojima')
    expect(litmPlayspace!.isGM).toBe(false) // PC mode (Player Character)

    // Version dérivée depuis config
    expect(getVersionId(litmPlayspace!.hackId)).toBe('2.0')

    // Univers par défaut
    expect(getUniverseName(litmPlayspace!.hackId, litmPlayspace!.universeId)).toBe('obojima')
  })

  it('All seed playspaces have valid hackId', async () => {
    const playspaces = await prisma.playspace.findMany()
    const validHacks = ['city-of-mist', 'litm', 'otherscape']

    for (const playspace of playspaces) {
      expect(validHacks).toContain(playspace.hackId)
    }
  })

  it('All seed playspaces have isGM Boolean field', async () => {
    const playspaces = await prisma.playspace.findMany()

    for (const playspace of playspaces) {
      // isGM doit être Boolean (false ou true)
      expect(playspace).toHaveProperty('isGM')
      expect(typeof playspace.isGM).toBe('boolean')
    }
  })

  it('Seed demonstrates both GM and PC modes', async () => {
    const playspaces = await prisma.playspace.findMany()

    // Au moins un playspace GM mode (isGM: true)
    const gmPlayspace = playspaces.find(p => p.isGM === true && p.name === 'Chicago Investigations')
    expect(gmPlayspace).toBeDefined()
    expect(gmPlayspace!.hackId).toBe('city-of-mist')

    // Au moins un playspace PC mode (isGM: false)
    const pcPlayspace = playspaces.find(p => p.isGM === false && p.name === 'Legends of Obojima')
    expect(pcPlayspace).toBeDefined()
    expect(pcPlayspace!.hackId).toBe('litm')
  })
})
