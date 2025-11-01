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
  hackId: 'city-of-mist' | 'litm' = 'city-of-mist',
  universeId: string | null = null
) {
  return await prisma.playspace.create({
    data: {
      name: hackId === 'city-of-mist' ? 'Test City of Mist Playspace' : 'Test LITM Playspace',
      description: 'Test playspace for E2E tests',
      userId,
      hackId,
      universeId // null = defaultUniverse du hack
    }
  })
}

export { prisma }
