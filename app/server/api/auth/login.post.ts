import bcrypt from 'bcrypt'
import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const { email, password } = await readBody(event)
    
    if (!email || !password) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email et mot de passe requis'
      })
    }
    
    // Recherche utilisateur
    const utilisateur = await prisma.utilisateur.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        role: true,
        createdAt: true
      }
    })
    
    if (!utilisateur) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Identifiants invalides'
      })
    }
    
    // Vérification mot de passe
    const passwordValid = await bcrypt.compare(password, utilisateur.passwordHash)
    
    if (!passwordValid) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Identifiants invalides'
      })
    }
    
    // Création session utilisateur
    await setUserSession(event, {
      user: {
        id: utilisateur.id,
        email: utilisateur.email,
        role: utilisateur.role,
        createdAt: utilisateur.createdAt
      }
    })
    
    return {
      success: true,
      user: {
        id: utilisateur.id,
        email: utilisateur.email,
        role: utilisateur.role,
        createdAt: utilisateur.createdAt
      }
    }
    
  } catch (error) {
    console.error('Erreur login:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur interne du serveur'
    })
  }
})