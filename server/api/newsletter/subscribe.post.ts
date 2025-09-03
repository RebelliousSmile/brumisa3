import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const { email, nom } = await readBody(event)
    
    if (!email) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email requis'
      })
    }
    
    // Validation email basique
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Format email invalide'
      })
    }
    
    // Vérifier si l'email existe déjà
    const existingSubscriber = await prisma.newsletterAbonne.findUnique({
      where: { email: email.toLowerCase() }
    })
    
    if (existingSubscriber) {
      // Si déjà abonné mais inactif, réactiver
      if (!existingSubscriber.actif) {
        await prisma.newsletterAbonne.update({
          where: { email: email.toLowerCase() },
          data: {
            actif: true,
            nom: nom || existingSubscriber.nom,
            dateDesinscription: null
          }
        })
        
        return {
          success: true,
          message: 'Inscription réactivée avec succès'
        }
      }
      
      return {
        success: true,
        message: 'Déjà abonné à la newsletter'
      }
    }
    
    // Créer nouvel abonné
    await prisma.newsletterAbonne.create({
      data: {
        email: email.toLowerCase(),
        nom: nom || null,
        actif: true,
        systemesInterets: [], // Pourra être étendu plus tard
        frequenceEnvoi: 'MENSUELLE'
      }
    })
    
    return {
      success: true,
      message: 'Inscription réussie'
    }
    
  } catch (error) {
    console.error('Erreur inscription newsletter:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur lors de l\'inscription'
    })
  }
})