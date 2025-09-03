import { prisma } from '~/server/utils/prisma'

interface CreatePersonnageData {
  nom: string
  systemeJeu: string
  universJeu?: string
  contenu: Record<string, any>
}

interface UpdatePersonnageData {
  nom?: string
  contenu?: Record<string, any>
  statut?: string
}

/**
 * Service pour la gestion des personnages
 */
export class PersonnageService {

  /**
   * Crée un nouveau personnage
   */
  async creerPersonnage(data: CreatePersonnageData, utilisateurId?: number) {
    try {
      const personnage = await prisma.document.create({
        data: {
          titre: data.nom,
          type: 'CHARACTER',
          systemeJeu: data.systemeJeu,
          universJeu: data.universJeu,
          contenu: data.contenu,
          utilisateurId: utilisateurId || null,
          statut: utilisateurId ? 'BROUILLON' : 'TEMPORAIRE'
        },
        select: {
          id: true,
          titre: true,
          systemeJeu: true,
          universJeu: true,
          contenu: true,
          statut: true,
          dateModification: true,
          nombreVues: true
        }
      })

      return personnage
    } catch (error) {
      console.error('Erreur création personnage:', error)
      throw new Error('Impossible de créer le personnage')
    }
  }

  /**
   * Récupère un personnage par ID
   */
  async obtenirPersonnage(id: number, utilisateurId?: number) {
    try {
      const whereClause: any = { 
        id, 
        type: 'CHARACTER',
        OR: [
          { statut: 'PUBLIE' },
          { utilisateurId: utilisateurId }
        ]
      }

      const personnage = await prisma.document.findFirst({
        where: whereClause,
        select: {
          id: true,
          titre: true,
          systemeJeu: true,
          universJeu: true,
          contenu: true,
          statut: true,
          dateModification: true,
          nombreVues: true,
          utilisateur: {
            select: {
              id: true,
              email: true
            }
          }
        }
      })

      if (personnage) {
        // Incrémenter le nombre de vues
        await prisma.document.update({
          where: { id },
          data: { nombreVues: { increment: 1 } }
        })
        
        personnage.nombreVues += 1
      }

      return personnage
    } catch (error) {
      console.error('Erreur récupération personnage:', error)
      throw new Error('Impossible de récupérer le personnage')
    }
  }

  /**
   * Met à jour un personnage
   */
  async mettreAJourPersonnage(id: number, data: UpdatePersonnageData, utilisateurId: number) {
    try {
      const personnage = await prisma.document.updateMany({
        where: { 
          id, 
          type: 'CHARACTER',
          utilisateurId 
        },
        data: {
          titre: data.nom,
          contenu: data.contenu,
          statut: data.statut
        }
      })

      if (personnage.count === 0) {
        throw new Error('Personnage non trouvé ou non autorisé')
      }

      return await this.obtenirPersonnage(id, utilisateurId)
    } catch (error) {
      console.error('Erreur mise à jour personnage:', error)
      throw error
    }
  }

  /**
   * Supprime un personnage
   */
  async supprimerPersonnage(id: number, utilisateurId: number) {
    try {
      const personnage = await prisma.document.deleteMany({
        where: { 
          id, 
          type: 'CHARACTER',
          utilisateurId 
        }
      })

      if (personnage.count === 0) {
        throw new Error('Personnage non trouvé ou non autorisé')
      }

      return { success: true, message: 'Personnage supprimé avec succès' }
    } catch (error) {
      console.error('Erreur suppression personnage:', error)
      throw error
    }
  }

  /**
   * Liste les personnages d'un utilisateur
   */
  async obtenirPersonnagesUtilisateur(utilisateurId: number, page: number = 1, limit: number = 20) {
    try {
      const skip = (page - 1) * limit

      const [personnages, total] = await Promise.all([
        prisma.document.findMany({
          where: { 
            type: 'CHARACTER',
            utilisateurId 
          },
          select: {
            id: true,
            titre: true,
            systemeJeu: true,
            universJeu: true,
            statut: true,
            dateModification: true,
            nombreVues: true
          },
          orderBy: { dateModification: 'desc' },
          skip,
          take: limit
        }),
        prisma.document.count({
          where: { 
            type: 'CHARACTER',
            utilisateurId 
          }
        })
      ])

      return {
        data: personnages,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      }
    } catch (error) {
      console.error('Erreur récupération personnages utilisateur:', error)
      throw new Error('Impossible de récupérer les personnages')
    }
  }

  /**
   * Recherche des personnages
   */
  async rechercherPersonnages(terme: string, systemeJeu?: string, utilisateurId?: number) {
    try {
      const whereClause: any = {
        type: 'CHARACTER',
        OR: [
          { statut: 'PUBLIE' },
          { utilisateurId: utilisateurId }
        ],
        AND: [
          {
            OR: [
              { titre: { contains: terme, mode: 'insensitive' } },
              { contenu: { path: '$', string_contains: terme } }
            ]
          }
        ]
      }

      if (systemeJeu) {
        whereClause.systemeJeu = systemeJeu
      }

      const personnages = await prisma.document.findMany({
        where: whereClause,
        select: {
          id: true,
          titre: true,
          systemeJeu: true,
          universJeu: true,
          statut: true,
          dateModification: true,
          nombreVues: true,
          utilisateur: {
            select: {
              id: true,
              email: true
            }
          }
        },
        orderBy: { dateModification: 'desc' },
        take: 50
      })

      return { data: personnages }
    } catch (error) {
      console.error('Erreur recherche personnages:', error)
      throw new Error('Impossible de rechercher les personnages')
    }
  }

  /**
   * Récupère les personnages publics par système
   */
  async obtenirPersonnagesPublics(systemeJeu: string, page: number = 1, limit: number = 20) {
    try {
      const skip = (page - 1) * limit

      const [personnages, total] = await Promise.all([
        prisma.document.findMany({
          where: { 
            type: 'CHARACTER',
            systemeJeu,
            statut: 'PUBLIE'
          },
          select: {
            id: true,
            titre: true,
            systemeJeu: true,
            universJeu: true,
            statut: true,
            dateModification: true,
            nombreVues: true,
            utilisateur: {
              select: {
                id: true,
                email: true
              }
            }
          },
          orderBy: { nombreVues: 'desc' },
          skip,
          take: limit
        }),
        prisma.document.count({
          where: { 
            type: 'CHARACTER',
            systemeJeu,
            statut: 'PUBLIE'
          }
        })
      ])

      return {
        data: personnages,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      }
    } catch (error) {
      console.error('Erreur récupération personnages publics:', error)
      throw new Error('Impossible de récupérer les personnages publics')
    }
  }

  /**
   * Change la visibilité d'un personnage
   */
  async changerVisibilitePersonnage(id: number, estPublic: boolean, utilisateurId: number) {
    try {
      const personnage = await prisma.document.updateMany({
        where: { 
          id, 
          type: 'CHARACTER',
          utilisateurId 
        },
        data: {
          statut: estPublic ? 'PUBLIE' : 'BROUILLON'
        }
      })

      if (personnage.count === 0) {
        throw new Error('Personnage non trouvé ou non autorisé')
      }

      return await this.obtenirPersonnage(id, utilisateurId)
    } catch (error) {
      console.error('Erreur changement visibilité personnage:', error)
      throw error
    }
  }

  /**
   * Récupère les statistiques des personnages d'un utilisateur
   */
  async obtenirStatistiquesPersonnages(utilisateurId: number) {
    try {
      const stats = await prisma.document.groupBy({
        by: ['systemeJeu', 'statut'],
        where: { 
          type: 'CHARACTER',
          utilisateurId 
        },
        _count: true,
        _sum: {
          nombreVues: true
        }
      })

      const statistiques = {
        totalPersonnages: 0,
        personnagesPublics: 0,
        personnagesBrouillon: 0,
        totalVues: 0,
        parSysteme: {} as Record<string, number>
      }

      stats.forEach(stat => {
        statistiques.totalPersonnages += stat._count
        statistiques.totalVues += stat._sum.nombreVues || 0
        
        if (stat.statut === 'PUBLIE') {
          statistiques.personnagesPublics += stat._count
        } else if (stat.statut === 'BROUILLON') {
          statistiques.personnagesBrouillon += stat._count
        }

        statistiques.parSysteme[stat.systemeJeu] = (statistiques.parSysteme[stat.systemeJeu] || 0) + stat._count
      })

      return statistiques
    } catch (error) {
      console.error('Erreur récupération statistiques personnages:', error)
      throw new Error('Impossible de récupérer les statistiques')
    }
  }
}