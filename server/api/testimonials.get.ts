import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    // Récupération des témoignages approuvés
    const testimonials = await prisma.temoignage.findMany({
      where: {
        statut: 'APPROUVE'
      },
      orderBy: {
        dateCreation: 'desc'
      },
      take: 10, // Limite à 10 témoignages
      select: {
        id: true,
        auteurNom: true,
        contenu: true,
        note: true,
        dateCreation: true
      }
    })
    
    return testimonials
    
  } catch (error) {
    console.error('Erreur récupération témoignages:', error)
    
    // Fallback avec données vides
    return []
  }
})