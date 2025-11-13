import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    // Récupération des documents récents publiés
    const recentDocuments = await prisma.documents.findMany({
      where: {
        statut: 'PUBLIE'
      },
      include: {
        utilisateurs_documents_utilisateur_idToutilisateurs: {
          select: {
            email: true // Nous utiliserons l'email pour générer un nom d'affichage
          }
        }
      },
      orderBy: {
        date_creation: 'desc'
      },
      take: 6 // Limite à 6 résultats
    })
    
    // Transformation des données
    const pdfs = recentDocuments.map(doc => {
      // Extraction du nom depuis le contenu JSON ou utilisation d'un fallback
      let personnageNom = 'Personnage'
      try {
        const contenu = doc.contenu as any
        if (contenu.nom) {
          personnageNom = contenu.nom
        } else if (contenu.personnage?.nom) {
          personnageNom = contenu.personnage.nom
        }
      } catch (error) {
        console.warn('Erreur parsing contenu document:', doc.id)
      }
      
      // Génération d'un nom d'auteur anonymisé
      const auteurEmail = doc.utilisateurs_documents_utilisateur_idToutilisateurs?.email || 'anonymous@example.com'
      const auteurNom = auteurEmail.split('@')[0].charAt(0).toUpperCase() +
                       auteurEmail.split('@')[0].slice(1, 3) + '.'

      return {
        id: doc.id.toString(),
        personnageNom: personnageNom || doc.titre,
        systemeJeu: formatSystemName(doc.systeme_jeu),
        auteurNom,
        dateCreation: doc.date_creation?.toISOString() || new Date().toISOString(),
        nombreTelechargements: doc.nombre_utilisations || 0
      }
    })
    
    return {
      data: pdfs
    }
    
  } catch (error) {
    console.error('Erreur récupération PDFs récents:', error)
    
    // Fallback avec données vides
    return {
      data: []
    }
  }
})

function formatSystemName(systemId: string): string {
  const systemNames: Record<string, string> = {
    mistengine: 'Mist Engine'
  }

  return systemNames[systemId] || systemId
}