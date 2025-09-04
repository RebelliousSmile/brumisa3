import { prisma } from '../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    // Statistiques utilisateurs
    const nbUtilisateursInscrits = await prisma.utilisateur.count()
    
    // Statistiques PDFs stockés
    const nbPdfsStockes = await prisma.document.count({
      where: {
        statut: 'PUBLIE'
      }
    })
    
    // Statistiques vues ce mois (approximation basée sur les documents récents)
    const debutMois = new Date()
    debutMois.setDate(1)
    debutMois.setHours(0, 0, 0, 0)
    
    const nbContenusOuvertsMois = await prisma.document.aggregate({
      where: {
        dateModification: {
          gte: debutMois
        }
      },
      _sum: {
        nombreVues: true
      }
    })
    
    // Statistiques newsletter
    const nbAbonnesNewsletter = await prisma.newsletterAbonne.count({
      where: {
        statut: 'CONFIRME'
      }
    })
    
    return {
      data: {
        nbUtilisateursInscrits,
        nbPdfsStockes,
        nbContenusOuvertsMois: nbContenusOuvertsMois._sum.nombreVues || 0,
        nbAbonnesNewsletter
      }
    }
    
  } catch (error) {
    console.error('Erreur récupération statistiques:', error)
    
    // Fallback avec des données par défaut
    return {
      data: {
        nbUtilisateursInscrits: 0,
        nbPdfsStockes: 0,
        nbContenusOuvertsMois: 0,
        nbAbonnesNewsletter: 0
      }
    }
  }
})