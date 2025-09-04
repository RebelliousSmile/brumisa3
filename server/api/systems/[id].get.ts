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
    pbta: {
      id: 'pbta',
      nomComplet: 'PBTA (Powered by the Apocalypse)',
      description: 'Système narratif basé sur les mouvements et les conséquences.',
      actif: true,
      univers: [
        {
          id: 'monsterhearts',
          nomComplet: 'Monsterhearts',
          description: 'Jeu de rôle sur les adolescents monstres et leurs relations complexes.',
          actif: true
        }
      ]
    },
    engrenages: {
      id: 'engrenages',
      nomComplet: 'Engrenages & Sortilèges',
      description: 'Système de jeu steampunk-fantasy mêlant magie et technologie.',
      actif: true,
      univers: [
        {
          id: 'roue_du_temps',
          nomComplet: 'La Roue du Temps',
          description: 'Adaptation du célèbre univers de fantasy de Robert Jordan.',
          actif: true
        },
        {
          id: 'ecryme',
          nomComplet: 'Ecryme',
          description: 'Univers steampunk original avec magie et technologie.',
          actif: true
        }
      ]
    },
    myz: {
      id: 'myz',
      nomComplet: 'Mutant Year Zero Engine',
      description: 'Système post-apocalyptique axé sur la survie et la reconstruction.',
      actif: true,
      univers: [
        {
          id: 'metro2033',
          nomComplet: 'Metro 2033',
          description: 'Survie dans les tunnels du métro moscovite post-apocalyptique.',
          actif: true
        }
      ]
    },
    mistengine: {
      id: 'mistengine',
      nomComplet: 'Mist Engine',
      description: 'Moteur de jeu narratif pour univers mystiques et atmosphériques.',
      actif: true,
      univers: [
        {
          id: 'obojima',
          nomComplet: 'Obojima',
          description: 'Île mystérieuse aux secrets ancestraux.',
          actif: true
        },
        {
          id: 'zamanora',
          nomComplet: 'Zamanora',
          description: 'Monde de magie et de mystères.',
          actif: true
        },
        {
          id: 'post_mortem',
          nomComplet: 'Post-Mortem',
          description: 'Enquêtes surnaturelles dans l\'au-delà.',
          actif: true
        },
        {
          id: 'otherscape',
          nomComplet: 'Tokyo: Otherscape',
          description: 'Tokyo moderne avec des éléments surnaturels.',
          actif: true
        }
      ]
    },
    zombiology: {
      id: 'zombiology',
      nomComplet: 'Zombiology d100 System',
      description: 'Système d100 dédié à la survie zombie et post-apocalyptique.',
      actif: true,
      univers: [
        {
          id: 'zombiology',
          nomComplet: 'Zombiology',
          description: 'Survie dans un monde envahi par les zombies.',
          actif: true
        }
      ]
    }
  }
}