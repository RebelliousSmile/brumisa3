import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const { nom, email, systemeUtilise, note, titre, contenu } = await readBody(event)
    
    if (!nom || !note || !contenu) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Nom, note et contenu sont requis'
      })
    }
    
    // Validation de la note
    const noteNum = parseInt(note)
    if (isNaN(noteNum) || noteNum < 1 || noteNum > 5) {
      throw createError({
        statusCode: 400,
        statusMessage: 'La note doit être entre 1 et 5'
      })
    }
    
    // Validation de l'email si fourni
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Format email invalide'
        })
      }
    }
    
    // Validation du contenu (longueur minimale/maximale)
    if (contenu.length < 10) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Le témoignage doit contenir au moins 10 caractères'
      })
    }
    
    if (contenu.length > 1000) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Le témoignage ne peut pas dépasser 1000 caractères'
      })
    }
    
    // Créer le témoignage
    const testimonial = await prisma.temoignage.create({
      data: {
        auteurNom: nom.trim(),
        auteurEmail: email?.toLowerCase() || '',
        contenu: contenu.trim(),
        note: noteNum,
        statut: 'EN_ATTENTE' // Nécessite modération
      }
    })
    
    return {
      success: true,
      message: 'Témoignage envoyé avec succès. Il sera examiné avant publication.',
      id: testimonial.id
    }
    
  } catch (error) {
    console.error('Erreur création témoignage:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur lors de l\'envoi du témoignage'
    })
  }
})