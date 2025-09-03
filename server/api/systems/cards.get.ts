import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    // Récupération des systèmes avec leurs univers
    const systemes = await prisma.systemeJeu.findMany({
      where: {
        actif: true
      },
      include: {
        univers: {
          where: {
            actif: true
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
      univers: systeme.univers.map(univers => ({
        code: univers.id,
        nom: univers.nomComplet,
        icon: getUniversIcon(univers.id)
      }))
    }))
    
    // Séparation en colonnes (logique à adapter selon vos besoins)
    const mainColumn = systemCards.filter(card => 
      ['monsterhearts', 'engrenages'].includes(card.code)
    )
    
    const secondColumn = systemCards.filter(card => 
      !['monsterhearts', 'engrenages'].includes(card.code)
    )
    
    return {
      data: {
        mainColumn,
        secondColumn
      }
    }
    
  } catch (error) {
    console.error('Erreur récupération cartes systèmes:', error)
    
    // Fallback avec données exemple
    return {
      data: {
        mainColumn: [
          {
            code: 'monsterhearts',
            nom: 'Monsterhearts',
            description: 'Romance surnaturelle adolescente',
            icon: 'ra:ra-heart',
            classes: getSystemClasses('monsterhearts'),
            univers: []
          }
        ],
        secondColumn: [
          {
            code: 'engrenages',
            nom: 'Engrenages & Sortilèges',
            description: 'Steampunk et magie',
            icon: 'ra:ra-gear',
            classes: getSystemClasses('engrenages'),
            univers: []
          }
        ]
      }
    }
  }
})

function getSystemIcon(systemId: string): string {
  const icons: Record<string, string> = {
    monsterhearts: 'ra:ra-heart',
    engrenages: 'ra:ra-gear',
    metro2033: 'ra:ra-tunnel',
    mistengine: 'ra:ra-fog',
    zombiology: 'ra:ra-skull'
  }
  return icons[systemId] || 'ra:ra-dice'
}

function getSystemClasses(systemId: string) {
  const classes: Record<string, any> = {
    monsterhearts: {
      bg: 'bg-pink-500/20',
      border: 'border-pink-500/30',
      text: 'text-pink-400',
      badgeBg: 'bg-pink-500/20',
      badgeBorder: 'border-pink-500/30'
    },
    engrenages: {
      bg: 'bg-amber-500/20',
      border: 'border-amber-500/30',
      text: 'text-amber-400',
      badgeBg: 'bg-amber-500/20',
      badgeBorder: 'border-amber-500/30'
    },
    metro2033: {
      bg: 'bg-green-500/20',
      border: 'border-green-500/30',
      text: 'text-green-400',
      badgeBg: 'bg-green-500/20',
      badgeBorder: 'border-green-500/30'
    },
    mistengine: {
      bg: 'bg-purple-500/20',
      border: 'border-purple-500/30',
      text: 'text-purple-400',
      badgeBg: 'bg-purple-500/20',
      badgeBorder: 'border-purple-500/30'
    },
    zombiology: {
      bg: 'bg-red-500/20',
      border: 'border-red-500/30',
      text: 'text-red-400',
      badgeBg: 'bg-red-500/20',
      badgeBorder: 'border-red-500/30'
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
  return 'ra:ra-planet'
}