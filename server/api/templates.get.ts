export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const systeme = query.systeme as string
    
    // Pour l'instant, données statiques
    // TODO: Intégrer avec Prisma quand les modèles de templates seront prêts
    const templates = getStaticTemplates(systeme)
    
    return templates.filter(template => !systeme || template.systeme === systeme)
    
  } catch (error) {
    console.error('Erreur récupération templates:', error)
    return []
  }
})

function getStaticTemplates(systemeFilter?: string) {
  const allTemplates = [
    {
      id: 'personnage-engrenages',
      titre: 'Fiche de personnage',
      description: 'Fiche complète pour personnage Engrenages & Sortilèges',
      systeme: 'engrenages',
      type: 'CHARACTER',
      icone: '👤',
      inclus: [
        'Caractéristiques et compétences',
        'Historique et motivations',
        'Équipement et inventions',
        'Notes de jeu'
      ]
    },
    {
      id: 'invention-engrenages',
      titre: 'Fiche d\'invention',
      description: 'Template pour créer des inventions steampunk',
      systeme: 'engrenages',
      type: 'GENERIQUE',
      icone: '⚙️',
      inclus: [
        'Description technique',
        'Mécanismes et fonctionnement',
        'Complications possibles',
        'Histoire de l\'invention'
      ]
    },
    {
      id: 'organisation-engrenages',
      titre: 'Organisation secrète',
      description: 'Template pour sociétés secrètes et guildes',
      systeme: 'engrenages',
      type: 'ORGANIZATION',
      icone: '🏛️',
      inclus: [
        'Structure hiérarchique',
        'Objectifs et méthodes',
        'Membres importants',
        'Ressources et influence'
      ]
    },
    {
      id: 'skin-monsterhearts',
      titre: 'Skin personnalisée',
      description: 'Créer une nouvelle Skin pour Monsterhearts',
      systeme: 'pbta',
      type: 'CHARACTER',
      icone: '🎭',
      inclus: [
        'Statistiques de base',
        'Mouvements spéciaux',
        'Conditions et strings',
        'Advance et évolution'
      ]
    }
  ]
  
  return allTemplates
}