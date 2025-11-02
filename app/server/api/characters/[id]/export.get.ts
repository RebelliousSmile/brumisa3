/**
 * GET /api/characters/[id]/export
 * Export character as JSON (complete data)
 */

import { PrismaClient } from '@prisma/client'
import { getVersionId, getHackName, getUniverseName } from '~/server/config/systems.config'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const requestId = crypto.randomUUID()
  const id = getRouterParam(event, 'id')

  try {
    // Auth
    const userId = event.context.user?.id
    if (!userId) {
      throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    // Fetch character complet
    const character = await prisma.character.findUnique({
      where: { id },
      include: {
        playspace: {
          select: {
            id: true,
            name: true,
            hackId: true,
            universeId: true,
            isGM: true,
            userId: true
          }
        },
        themeCards: {
          include: {
            tags: true
          },
          orderBy: { createdAt: 'asc' }
        },
        heroCard: {
          include: {
            relationships: true
          }
        },
        trackers: {
          include: {
            statuses: true,
            storyTags: true,
            storyThemes: true
          }
        }
      }
    })

    if (!character) {
      throw createError({ statusCode: 404, message: 'Character not found' })
    }

    // Check ownership
    if (character.playspace.userId !== userId) {
      throw createError({ statusCode: 403, message: 'Forbidden' })
    }

    // Build export JSON
    const exportData = {
      character: {
        id: character.id,
        name: character.name,
        description: character.description,
        createdAt: character.createdAt,
        updatedAt: character.updatedAt
      },
      playspace: {
        id: character.playspace.id,
        name: character.playspace.name,
        hackId: character.playspace.hackId,
        hackName: getHackName(character.playspace.hackId),
        versionId: getVersionId(character.playspace.hackId),
        universeId: character.playspace.universeId,
        universeName: getUniverseName(character.playspace.hackId, character.playspace.universeId),
        isGM: character.playspace.isGM
      },
      themeCards: character.themeCards.map(card => ({
        id: card.id,
        name: card.name,
        type: card.type,
        description: card.description,
        attention: card.attention,
        tags: card.tags.map(tag => ({
          id: tag.id,
          name: tag.name,
          type: tag.type,
          burned: tag.burned,
          inverted: tag.inverted
        }))
      })),
      heroCard: character.heroCard ? {
        id: character.heroCard.id,
        identity: character.heroCard.identity,
        mystery: character.heroCard.mystery,
        relationships: character.heroCard.relationships.map(rel => ({
          id: rel.id,
          name: rel.name,
          description: rel.description
        }))
      } : null,
      trackers: character.trackers ? {
        statuses: character.trackers.statuses.map(s => ({
          id: s.id,
          name: s.name,
          tier: s.tier,
          positive: s.positive
        })),
        storyTags: character.trackers.storyTags.map(t => ({
          id: t.id,
          name: t.name
        })),
        storyThemes: character.trackers.storyThemes.map(t => ({
          id: t.id,
          name: t.name
        }))
      } : null,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    }

    console.log('[API SUCCESS] Character exported', { requestId, characterId: id })

    return exportData
  } catch (error) {
    console.error('[API ERROR] GET /api/characters/[id]/export', {
      requestId,
      error: error.message
    })
    throw error
  }
})
