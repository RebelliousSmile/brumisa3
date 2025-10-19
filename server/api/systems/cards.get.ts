import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    // Récupération des systèmes avec leurs univers
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
    
    // Mapping des données pour l'affichage
    const systemCards = systemes.map(systeme => ({
      code: systeme.id,
      nom: systeme.nomComplet,
      description: systeme.description || '',
      icon: getSystemIcon(systeme.id),
      classes: getSystemClasses(systeme.id),
      univers: systeme.univers_jeu.map(univers => ({
        code: univers.id,
        nom: univers.nomComplet,
        icon: getUniversIcon(univers.id)
      }))
    }))
    
    // Séparation en colonnes (après cleanup: seul mistengine reste)
    const mainColumn = systemCards.filter(card =>
      ['mistengine'].includes(card.code)
    )

    const secondColumn: typeof systemCards = []
    
    return {
      data: {
        mainColumn,
        secondColumn
      }
    }
    
  } catch (error) {
    console.error('Erreur récupération cartes systèmes:', error)
    
    // Fallback avec données Mist Engine uniquement
    return {
      data: {
        mainColumn: [
          {
            code: 'mistengine',
            nom: 'Mist Engine',
            description: 'Moteur de jeu narratif et mystique',
            icon: getSystemIcon('mistengine'),
            classes: getSystemClasses('mistengine'),
            univers: [
              { code: 'city-of-mist', nom: 'City of Mist', icon: getUniversIcon('city-of-mist') },
              { code: 'obojima', nom: 'Obojima', icon: getUniversIcon('obojima') },
              { code: 'otherscape', nom: 'Tokyo:Otherscape', icon: getUniversIcon('otherscape') },
              { code: 'post_mortem', nom: 'Post-Mortem', icon: getUniversIcon('post_mortem') },
              { code: 'zamanora', nom: 'Zamanora', icon: getUniversIcon('zamanora') }
            ]
          }
        ],
        secondColumn: []
      }
    }
  }
})

function getSystemIcon(systemId: string): string {
  const icons: Record<string, string> = {
    mistengine: 'ra:ra-ocarina'
  }
  return icons[systemId] || 'ra:ra-dice'
}

function getSystemClasses(systemId: string) {
  const classes: Record<string, any> = {
    mistengine: {
      bg: 'bg-purple-500/20',
      border: 'border-purple-500/30',
      text: 'text-purple-400',
      badgeBg: 'bg-purple-500/20',
      badgeBorder: 'border-purple-500/30'
    }
  }

  return classes[systemId] || {
    bg: 'bg-gray-600/20',
    border: 'border-gray-500/30',
    text: 'text-gray-400',
    badgeBg: 'bg-gray-500/20',
    badgeBorder: 'border-gray-500/30'
  }
}

function getUniversIcon(universId: string): string {
  // À adapter selon vos univers spécifiques
  return 'game-icons:planet-core'
}