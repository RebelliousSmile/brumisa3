import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    // Récupération des témoignages approuvés
    const testimonials = await prisma.temoignages.findMany({
      where: {
        statut: 'APPROUVE'
      },
      orderBy: {
        date_creation: 'desc'
      },
      take: 10, // Limite à 10 témoignages
      select: {
        id: true,
        auteur_nom: true,
        contenu: true,
        note: true,
        date_creation: true
      }
    })
    
    return testimonials
    
  } catch (error) {
    console.error('Erreur récupération témoignages:', error)
    
    // Fallback avec données vides
    return []
  }
})