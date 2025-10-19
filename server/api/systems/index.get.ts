import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    // Récupération de tous les systèmes avec leurs univers
    const systemes = await prisma.systemeJeu.findMany({
      where: {
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
      },
      orderBy: {
        ordreAffichage: 'asc'
      }
    })
    
    if (!systemes || systemes.length === 0) {
      // Fallback avec données statiques
      return Object.values(getStaticSystemsData())
    }
    
    // Mapping des données Prisma
    return systemes.map(systeme => ({
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
    }))
    
  } catch (error) {
    console.error('Erreur récupération systèmes:', error)
    
    // Fallback complet en cas d'erreur
    return Object.values(getStaticSystemsData())
  }
})

function getStaticSystemsData() {
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