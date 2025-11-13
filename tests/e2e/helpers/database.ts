import { PrismaClient } from '@prisma/client'

/**
 * Helper functions for database operations in E2E tests
 */

const prisma = new PrismaClient()

export async function resetDatabase() {
  // Clean all data
  await prisma.storyTheme.deleteMany()
  await prisma.storyTag.deleteMany()
  await prisma.status.deleteMany()
  await prisma.trackers.deleteMany()
  await prisma.tag.deleteMany()
  await prisma.themeCard.deleteMany()
  await prisma.relationship.deleteMany()
  await prisma.heroCard.deleteMany()
  await prisma.character.deleteMany()
  await prisma.danger.deleteMany()
  await prisma.playspace.deleteMany()
  await prisma.user.deleteMany()
}

export async function createTestUser() {
  return await prisma.user.create({
    data: {
      email: 'test@brumisa3.com',
      name: 'Test User'
    }
  })
}

export async function createTestPlayspace(
  userId: string,
  hackId: 'city-of-mist' | 'litm' | 'otherscape' = 'city-of-mist',
  universeId: string | null = null,
  isGM: boolean = false // PC mode par défaut
) {
  const names = {
    'city-of-mist': 'Test City of Mist Playspace',
    'litm': 'Test LITM Playspace',
    'otherscape': 'Test Otherscape Playspace'
  }

  return await prisma.playspace.create({
    data: {
      name: names[hackId],
      description: 'Test playspace for E2E tests',
      userId,
      hackId,
      universeId,
      isGM
    }
  })
}

export async function createTestCharacter(
  playspaceId: string,
  name: string = 'Test Character'
) {
  return await prisma.character.create({
    data: {
      name,
      description: 'Test character for E2E tests',
      playspaceId,
      heroCard: {
        create: {
          identity: 'Test Identity',
          mystery: 'Test Mystery'
        }
      },
      trackers: {
        create: {}
      }
    },
    include: {
      heroCard: true,
      trackers: true
    }
  })
}

export async function createTestThemeCard(
  characterId: string,
  type: string = 'MYTHOS',
  name: string = 'Test Theme Card'
) {
  return await prisma.themeCard.create({
    data: {
      name,
      type: type as any,
      description: 'Test theme card for E2E tests',
      attention: 0,
      characterId
    }
  })
}

export async function createTestTag(
  themeCardId: string,
  type: 'POWER' | 'WEAKNESS' | 'STORY' = 'POWER',
  name: string = 'Test Tag'
) {
  return await prisma.tag.create({
    data: {
      name,
      type,
      burned: false,
      inverted: false,
      themeCardId
    }
  })
}

export { prisma }
