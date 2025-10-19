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
    // Oracles Mist Engine uniquement (déjà en base de données)
    // Ce fallback ne devrait être utilisé qu'en cas d'erreur de connexion
  ]

  return allOracles
}