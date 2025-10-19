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
    // Templates Mist Engine uniquement
    // TODO: Ajouter les vrais templates pour City of Mist, Otherscape, Post-Mortem, et Legends in the Mist
  ]

  return allTemplates
}