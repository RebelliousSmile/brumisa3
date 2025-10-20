/**
 * Définition du modèle Utilisateur
 */

import type { ModelDefinition } from './types'
import { Role, StatutUtilisateur, TypeCompte, TypePremium } from './types'

export const USER_MODEL: ModelDefinition = {
  name: 'User',
  tableName: 'utilisateurs',
  description: 'Utilisateur de la plateforme',

  fields: {
    id: {
      type: 'number',
      required: true,
      description: 'Identifiant unique auto-incrémenté',
      example: 1
    },

    nom: {
      type: 'string',
      required: true,
      maxLength: 255,
      description: 'Nom complet de l\'utilisateur',
      example: 'Jean Dupont'
    },

    email: {
      type: 'email',
      required: false,
      unique: true,
      maxLength: 255,
      description: 'Adresse email (optionnelle pour invités)',
      example: 'jean.dupont@example.com'
    },

    motDePasse: {
      type: 'string',
      required: false,
      maxLength: 255,
      description: 'Hash du mot de passe (optionnel pour invités)',
      example: '$2b$10$...'
    },

    role: {
      type: 'enum',
      enum: Object.values(Role),
      required: true,
      default: Role.UTILISATEUR,
      description: 'Rôle de l\'utilisateur dans l\'application',
      example: Role.UTILISATEUR
    },

    statut: {
      type: 'enum',
      enum: Object.values(StatutUtilisateur),
      required: true,
      default: StatutUtilisateur.ACTIF,
      description: 'Statut du compte utilisateur',
      example: StatutUtilisateur.ACTIF
    },

    typeCompte: {
      type: 'enum',
      enum: Object.values(TypeCompte),
      required: false,
      default: TypeCompte.STANDARD,
      description: 'Type de compte (standard, premium, admin)',
      example: TypeCompte.STANDARD
    },

    typePremium: {
      type: 'enum',
      enum: Object.values(TypePremium),
      required: false,
      description: 'Type d\'abonnement premium si applicable',
      example: TypePremium.MENSUEL
    },

    dateExpiration: {
      type: 'datetime',
      required: false,
      description: 'Date d\'expiration du compte premium',
      example: new Date('2025-12-31')
    },

    estInvite: {
      type: 'boolean',
      required: true,
      default: false,
      description: 'Indique si l\'utilisateur est un invité temporaire',
      example: false
    },

    derniereConnexion: {
      type: 'datetime',
      required: false,
      description: 'Date et heure de la dernière connexion',
      example: new Date()
    },

    dateCreation: {
      type: 'datetime',
      required: true,
      default: () => new Date(),
      description: 'Date de création du compte',
      example: new Date()
    },

    dateModification: {
      type: 'datetime',
      required: true,
      default: () => new Date(),
      description: 'Date de dernière modification',
      example: new Date()
    }
  },

  relations: {
    documents: {
      model: 'Document',
      type: 'many',
      description: 'Documents créés par cet utilisateur'
    },

    votes: {
      model: 'DocumentVote',
      type: 'many',
      description: 'Votes émis par cet utilisateur'
    },

    commentaires: {
      model: 'Commentaire',
      type: 'many',
      description: 'Commentaires postés par cet utilisateur'
    },

    characters: {
      model: 'Character',
      type: 'many',
      description: 'Personnages créés par cet utilisateur (tous systèmes)'
    }
  },

  indexes: [
    ['email'],
    ['role'],
    ['statut'],
    ['typeCompte']
  ],

  unique: [
    ['email']  // Contrainte d'unicité sur email
  ]
}
