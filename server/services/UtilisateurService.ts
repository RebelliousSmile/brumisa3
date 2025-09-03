import { prisma } from '~/server/utils/prisma'
import bcrypt from 'bcrypt'
import type { Prisma } from '@prisma/client'

interface CreateUtilisateurData {
  email: string
  password: string
  nom?: string
}

interface UpdateUtilisateurData {
  email?: string
  password?: string
  nom?: string
}

/**
 * Service pour la gestion des utilisateurs
 */
export class UtilisateurService {
  
  /**
   * Crée un nouveau utilisateur
   */
  async creerUtilisateur(data: CreateUtilisateurData) {
    try {
      // Vérifier si l'email existe déjà
      const utilisateurExistant = await prisma.utilisateur.findUnique({
        where: { email: data.email.toLowerCase() }
      })

      if (utilisateurExistant) {
        throw new Error('Cette adresse email est déjà utilisée')
      }

      // Hasher le mot de passe
      const saltRounds = 12
      const passwordHash = await bcrypt.hash(data.password, saltRounds)

      // Créer l'utilisateur
      const utilisateur = await prisma.utilisateur.create({
        data: {
          email: data.email.toLowerCase(),
          passwordHash,
          role: 'UTILISATEUR'
        },
        select: {
          id: true,
          email: true,
          role: true,
          createdAt: true
        }
      })

      return utilisateur
    } catch (error) {
      console.error('Erreur création utilisateur:', error)
      if (error.message === 'Cette adresse email est déjà utilisée') {
        throw error
      }
      throw new Error('Impossible de créer l\'utilisateur')
    }
  }

  /**
   * Authentifie un utilisateur
   */
  async authentifierUtilisateur(email: string, password: string) {
    try {
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
        throw new Error('Identifiants invalides')
      }

      const passwordValid = await bcrypt.compare(password, utilisateur.passwordHash)
      
      if (!passwordValid) {
        throw new Error('Identifiants invalides')
      }

      // Retourner sans le hash du mot de passe
      const { passwordHash, ...utilisateurSansPassword } = utilisateur
      return utilisateurSansPassword
    } catch (error) {
      console.error('Erreur authentification:', error)
      if (error.message === 'Identifiants invalides') {
        throw error
      }
      throw new Error('Erreur lors de l\'authentification')
    }
  }

  /**
   * Récupère un utilisateur par ID
   */
  async obtenirUtilisateur(id: number) {
    try {
      const utilisateur = await prisma.utilisateur.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true
        }
      })

      return utilisateur
    } catch (error) {
      console.error('Erreur récupération utilisateur:', error)
      throw new Error('Impossible de récupérer l\'utilisateur')
    }
  }

  /**
   * Met à jour un utilisateur
   */
  async mettreAJourUtilisateur(id: number, data: UpdateUtilisateurData) {
    try {
      const updateData: Prisma.UtilisateurUpdateInput = {}

      if (data.email) {
        // Vérifier si le nouvel email n'est pas déjà utilisé
        const emailExistant = await prisma.utilisateur.findFirst({
          where: {
            email: data.email.toLowerCase(),
            NOT: { id }
          }
        })

        if (emailExistant) {
          throw new Error('Cette adresse email est déjà utilisée')
        }

        updateData.email = data.email.toLowerCase()
      }

      if (data.password) {
        const saltRounds = 12
        updateData.passwordHash = await bcrypt.hash(data.password, saltRounds)
      }

      const utilisateur = await prisma.utilisateur.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true
        }
      })

      return utilisateur
    } catch (error) {
      console.error('Erreur mise à jour utilisateur:', error)
      if (error.message === 'Cette adresse email est déjà utilisée') {
        throw error
      }
      throw new Error('Impossible de mettre à jour l\'utilisateur')
    }
  }

  /**
   * Supprime un utilisateur
   */
  async supprimerUtilisateur(id: number) {
    try {
      // Supprimer tous les documents de l'utilisateur
      await prisma.document.deleteMany({
        where: { utilisateurId: id }
      })

      // Supprimer l'utilisateur
      await prisma.utilisateur.delete({
        where: { id }
      })

      return { success: true, message: 'Utilisateur supprimé avec succès' }
    } catch (error) {
      console.error('Erreur suppression utilisateur:', error)
      throw new Error('Impossible de supprimer l\'utilisateur')
    }
  }

  /**
   * Récupère les statistiques d'un utilisateur
   */
  async obtenirStatistiquesUtilisateur(id: number) {
    try {
      const stats = await prisma.document.groupBy({
        by: ['type', 'statut'],
        where: { utilisateurId: id },
        _count: true
      })

      const statistiques = {
        totalDocuments: 0,
        documentsPublics: 0,
        documentsBrouillon: 0,
        parType: {} as Record<string, number>,
        totalVues: 0
      }

      // Calculer les totaux de vues
      const vuesTotal = await prisma.document.aggregate({
        where: { utilisateurId: id },
        _sum: { nombreVues: true }
      })

      statistiques.totalVues = vuesTotal._sum.nombreVues || 0

      // Analyser les statistiques
      stats.forEach(stat => {
        statistiques.totalDocuments += stat._count
        
        if (stat.statut === 'PUBLIE') {
          statistiques.documentsPublics += stat._count
        } else if (stat.statut === 'BROUILLON') {
          statistiques.documentsBrouillon += stat._count
        }

        statistiques.parType[stat.type] = (statistiques.parType[stat.type] || 0) + stat._count
      })

      return statistiques
    } catch (error) {
      console.error('Erreur récupération statistiques utilisateur:', error)
      throw new Error('Impossible de récupérer les statistiques')
    }
  }

  /**
   * Récupère la liste des utilisateurs (admin uniquement)
   */
  async obtenirListeUtilisateurs(page: number = 1, limit: number = 50) {
    try {
      const skip = (page - 1) * limit

      const [utilisateurs, total] = await Promise.all([
        prisma.utilisateur.findMany({
          select: {
            id: true,
            email: true,
            role: true,
            createdAt: true,
            _count: {
              select: {
                documents: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit
        }),
        prisma.utilisateur.count()
      ])

      return {
        utilisateurs,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      }
    } catch (error) {
      console.error('Erreur récupération liste utilisateurs:', error)
      throw new Error('Impossible de récupérer la liste des utilisateurs')
    }
  }

  /**
   * Change le rôle d'un utilisateur (admin uniquement)
   */
  async changerRoleUtilisateur(id: number, nouveauRole: 'ADMIN' | 'UTILISATEUR') {
    try {
      const utilisateur = await prisma.utilisateur.update({
        where: { id },
        data: { role: nouveauRole },
        select: {
          id: true,
          email: true,
          role: true
        }
      })

      return utilisateur
    } catch (error) {
      console.error('Erreur changement rôle utilisateur:', error)
      throw new Error('Impossible de changer le rôle de l\'utilisateur')
    }
  }

  /**
   * Vérifie si un utilisateur existe par email
   */
  async utilisateurExiste(email: string): Promise<boolean> {
    try {
      const utilisateur = await prisma.utilisateur.findUnique({
        where: { email: email.toLowerCase() },
        select: { id: true }
      })

      return !!utilisateur
    } catch (error) {
      console.error('Erreur vérification existence utilisateur:', error)
      return false
    }
  }

  /**
   * Récupère les documents récents d'un utilisateur
   */
  async obtenirDocumentsRecentsUtilisateur(id: number, limit: number = 10) {
    try {
      const documents = await prisma.document.findMany({
        where: { utilisateurId: id },
        orderBy: { dateModification: 'desc' },
        take: limit,
        select: {
          id: true,
          titre: true,
          type: true,
          systemeJeu: true,
          statut: true,
          dateModification: true,
          nombreVues: true
        }
      })

      return documents
    } catch (error) {
      console.error('Erreur récupération documents récents:', error)
      throw new Error('Impossible de récupérer les documents récents')
    }
  }
}