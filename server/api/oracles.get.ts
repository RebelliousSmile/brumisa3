export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const systeme = query.systeme as string
    
    // Pour l'instant, données statiques
    // TODO: Intégrer avec Prisma quand les modèles d'oracles seront prêts
    const oracles = getStaticOracles(systeme)
    
    return oracles.filter(oracle => !systeme || oracle.systeme === systeme)
    
  } catch (error) {
    console.error('Erreur récupération oracles:', error)
    return []
  }
})

function getStaticOracles(systemeFilter?: string) {
  const allOracles = [
    {
      id: 'noms-engrenages',
      nom: 'Générateur de noms',
      description: 'Génère des noms de personnages pour Engrenages & Sortilèges',
      systeme: 'engrenages',
      categorie: 'personnages',
      icone: 'ra:ra-scroll-unfurled'
    },
    {
      id: 'lieux-engrenages',
      nom: 'Lieux mystérieux',
      description: 'Génère des lieux étranges pour vos aventures steampunk',
      systeme: 'engrenages',
      categorie: 'lieux',
      icone: 'ra:ra-tower'
    },
    {
      id: 'complications-engrenages',
      nom: 'Complications mécaniques',
      description: 'Complications liées aux inventions et mécanismes',
      systeme: 'engrenages',
      categorie: 'evenements',
      icone: 'ra:ra-gear'
    },
    {
      id: 'noms-monsterhearts',
      nom: 'Noms de monstres adolescents',
      description: 'Noms appropriés pour les personnages de Monsterhearts',
      systeme: 'pbta',
      categorie: 'personnages',
      icone: 'ra:ra-heartburn'
    },
    {
      id: 'rumeurs-metro',
      nom: 'Rumeurs du métro',
      description: 'Rumeurs et légendes urbaines dans les tunnels',
      systeme: 'myz',
      categorie: 'intrigue',
      icone: 'ra:ra-tunnel'
    }
  ]
  
  return allOracles
}