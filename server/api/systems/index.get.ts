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