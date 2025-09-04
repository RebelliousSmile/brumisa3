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
    
    // Séparation en colonnes selon la production
    const mainColumn = systemCards.filter(card => 
      ['pbta', 'engrenages', 'myz', 'zombiology'].includes(card.code)
    )
    
    const secondColumn = systemCards.filter(card => 
      ['mistengine'].includes(card.code)
    )
    
    return {
      data: {
        mainColumn,
        secondColumn
      }
    }
    
  } catch (error) {
    console.error('Erreur récupération cartes systèmes:', error)
    
    // Fallback avec données de production
    return {
      data: {
        mainColumn: [
          {
            code: 'pbta',
            nom: 'PBTA',
            description: 'Système Powered by the Apocalypse - Jeux narratifs basés sur les mouvements',
            icon: getSystemIcon('pbta'),
            classes: getSystemClasses('pbta'),
            univers: [
              { code: 'monsterhearts', nom: 'Monsterhearts', icon: getUniversIcon('monsterhearts') },
              { code: 'urban_shadows', nom: 'Urban Shadows', icon: getUniversIcon('urban_shadows') }
            ]
          },
          {
            code: 'engrenages',
            nom: 'Engrenages',
            description: 'Système steampunk/fantasy avec dés à 10 faces',
            icon: getSystemIcon('engrenages'),
            classes: getSystemClasses('engrenages'),
            univers: [
              { code: 'roue_du_temps', nom: 'La Roue du Temps', icon: getUniversIcon('roue_du_temps') },
              { code: 'ecryme', nom: 'Ecryme', icon: getUniversIcon('ecryme') }
            ]
          },
          {
            code: 'myz',
            nom: 'MYZ (Mutant Year Zero)',
            description: 'Système Year Zero Engine - Survie post-apocalyptique',
            icon: getSystemIcon('myz'),
            classes: getSystemClasses('myz'),
            univers: [
              { code: 'metro2033', nom: 'Metro 2033', icon: getUniversIcon('metro2033') }
            ]
          },
          {
            code: 'zombiology',
            nom: 'Zombiology d100 System',
            description: 'Système d100 pour jeux de survie',
            icon: getSystemIcon('zombiology'),
            classes: getSystemClasses('zombiology'),
            univers: [
              { code: 'zombiology', nom: 'Zombiology', icon: getUniversIcon('zombiology') }
            ]
          }
        ],
        secondColumn: [
          {
            code: 'mistengine',
            nom: 'Mist Engine',
            description: 'Moteur de jeu narratif et mystique',
            icon: getSystemIcon('mistengine'),
            classes: getSystemClasses('mistengine'),
            univers: [
              { code: 'obojima', nom: 'Obojima', icon: getUniversIcon('obojima') },
              { code: 'zamanora', nom: 'Zamanora', icon: getUniversIcon('zamanora') },
              { code: 'post_mortem', nom: 'Post-Mortem', icon: getUniversIcon('post_mortem') },
              { code: 'otherscape', nom: 'Tokyo:Otherscape', icon: getUniversIcon('otherscape') }
            ]
          }
        ]
      }
    }
  }
})

function getSystemIcon(systemId: string): string {
  const icons: Record<string, string> = {
    pbta: 'ra:ra-heartburn',
    monsterhearts: 'ra:ra-heartburn',
    engrenages: 'ra:ra-cog',
    metro2033: 'ra:ra-pills',
    myz: 'ra:ra-pills',
    mistengine: 'ra:ra-ocarina',
    zombiology: 'ra:ra-death-skull'
  }
  return icons[systemId] || 'ra:ra-dice'
}

function getSystemClasses(systemId: string) {
  const classes: Record<string, any> = {
    pbta: {
      bg: 'bg-purple-500/20',
      border: 'border-purple-500/30',
      text: 'text-purple-500',
      badgeBg: 'bg-purple-500/20',
      badgeBorder: 'border-purple-500/30'
    },
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
      bg: 'bg-red-600/20',
      border: 'border-red-600/30',
      text: 'text-red-600',
      badgeBg: 'bg-red-600/20',
      badgeBorder: 'border-red-600/30'
    },
    myz: {
      bg: 'bg-red-600/20',
      border: 'border-red-600/30',
      text: 'text-red-600',
      badgeBg: 'bg-red-600/20',
      badgeBorder: 'border-red-600/30'
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
  return 'game-icons:planet-core'
}