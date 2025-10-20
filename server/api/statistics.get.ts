import { prisma } from '../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    // Statistiques utilisateurs
    const nbUtilisateursInscrits = await prisma.utilisateurs.count()

    // Statistiques PDFs stockés
    const nbPdfsStockes = await prisma.documents.count({
      where: {
        statut: 'PUBLIE'
      }
    })

    // Statistiques vues ce mois (approximation basée sur les documents récents)
    const debutMois = new Date()
    debutMois.setDate(1)
    debutMois.setHours(0, 0, 0, 0)

    const nbContenusOuvertsMois = await prisma.documents.aggregate({
      where: {
        date_modification: {
          gte: debutMois
        }
      },
      _sum: {
        nombre_vues: true
      }
    })

    // Statistiques newsletter
    const nbAbonnesNewsletter = await prisma.newsletter_abonnes.count({
      where: {
        statut: 'CONFIRME'
      }
    })
    
    return {
      data: {
        nbUtilisateursInscrits,
        nbPdfsStockes,
        nbContenusOuvertsMois: nbContenusOuvertsMois._sum.nombre_vues || 0,
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