import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const systemId = getRouterParam(event, 'id')
    
    if (!systemId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID du système requis'
      })
    }
    
    // Récupération du système avec ses univers
    const systeme = await prisma.systemeJeu.findFirst({
      where: {
        id: systemId,
        actif: true
      },
      include: {
        univers_jeu: {
          where: {
            statut: 'ACTIF'
          },
          orderBy: {
            ordreAffichage: 'asc'
          }
        }
      }
    })
    
    if (!systeme) {
      // Fallback avec données statiques si pas trouvé en base
      const systemsData = getStaticSystemData()
      const staticSystem = systemsData[systemId]
      
      if (!staticSystem) {
        throw createError({
          statusCode: 404,
          statusMessage: `Système ${systemId} non trouvé`
        })
      }
      
      return staticSystem
    }
    
    // Mapping des données Prisma
    return {
      id: systeme.id,
      nomComplet: systeme.nomComplet,
      description: systeme.description,
      siteOfficiel: systeme.siteOfficiel,
      versionSupportee: systeme.versionSupportee,
      actif: systeme.actif,
      couleurPrimaire: systeme.couleurPrimaire,
      couleurSecondaire: systeme.couleurSecondaire,
      pictogramme: systeme.pictogramme,
      univers: systeme.univers_jeu.map(univers => ({
        id: univers.id,
        nomComplet: univers.nomComplet,
        description: univers.description,
        siteOfficiel: univers.siteOfficiel,
        actif: univers.statut === 'ACTIF',
        couleurPrimaire: univers.couleurPrimaire,
        couleurSecondaire: univers.couleurSecondaire,
        pictogramme: univers.pictogramme
      }))
    }
    
  } catch (error) {
    console.error('Erreur récupération système:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur lors de la récupération du système'
    })
  }
})

function getStaticSystemData() {
  return {
    mistengine: {
      id: 'mistengine',
      nomComplet: 'Mist Engine',
      description: 'Moteur de jeu narratif pour univers mystiques et atmosphériques.',
      actif: true,
      univers: [
        {
          id: 'city-of-mist',
          nomComplet: 'City of Mist',
          description: 'Enquêtes urbaines dans une cité embrumée où légendes et réalité se mêlent.',
          actif: true
        },
        {
          id: 'obojima',
          nomComplet: 'Obojima',
          description: 'Île mystérieuse aux secrets ancestraux (Legends in the Mist).',
          actif: true
        },
        {
          id: 'otherscape',
          nomComplet: 'Tokyo: Otherscape',
          description: 'Tokyo moderne avec des éléments surnaturels.',
          actif: true
        },
        {
          id: 'post_mortem',
          nomComplet: 'Post-Mortem',
          description: 'Enquêtes surnaturelles dans l\'au-delà (City of Mist hack).',
          actif: true
        },
        {
          id: 'zamanora',
          nomComplet: 'Zamanora',
          description: 'Monde de magie et de mystères (Legends in the Mist).',
          actif: true
        }
      ]
    }
  }
}