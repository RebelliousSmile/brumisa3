/**
 * Définition du modèle Document
 */

import type { ModelDefinition } from './types'
import { StatutDocument, Visibilite, StatutModeration } from './types'

export const DOCUMENT_MODEL: ModelDefinition = {
  name: 'Document',
  tableName: 'documents',
  description: 'Document de jeu (fiche de personnage, aide de jeu, etc.)',

  fields: {
    id: {
      type: 'number',
      required: true,
      description: 'Identifiant unique',
      example: 1
    },

    utilisateurId: {
      type: 'number',
      required: true,
      description: 'ID de l\'utilisateur créateur',
      example: 42
    },

    type: {
      type: 'string',
      required: true,
      maxLength: 20,
      description: 'Type de document (fiche_personnage, aide_jeu, etc.)',
      example: 'fiche_personnage'
    },

    titre: {
      type: 'string',
      required: true,
      maxLength: 255,
      description: 'Titre du document',
      example: 'Mon personnage LITM'
    },

    description: {
      type: 'text',
      required: false,
      description: 'Description du document',
      example: 'Un guerrier mystique de la brume'
    },

    systemeJeu: {
      type: 'string',
      required: true,
      maxLength: 50,
      description: 'Système de jeu (litm, city-of-mist, mist)',
      example: 'litm'
    },

    contenu: {
      type: 'json',
      required: false,
      description: 'Contenu JSON du document',
      example: { themes: [], heroCard: {} }
    },

    statut: {
      type: 'enum',
      enum: Object.values(StatutDocument),
      required: true,
      default: StatutDocument.ACTIF,
      description: 'Statut du document',
      example: StatutDocument.ACTIF
    },

    visibilite: {
      type: 'enum',
      enum: Object.values(Visibilite),
      required: true,
      default: Visibilite.PRIVE,
      description: 'Niveau de visibilité',
      example: Visibilite.PRIVE
    },

    statutModeration: {
      type: 'enum',
      enum: Object.values(StatutModeration),
      required: true,
      default: StatutModeration.EN_ATTENTE,
      description: 'Statut de modération pour documents publics',
      example: StatutModeration.APPROUVE
    },

    nbConsultations: {
      type: 'number',
      required: true,
      default: 0,
      min: 0,
      description: 'Nombre de consultations',
      example: 42
    },

    nbTelechargements: {
      type: 'number',
      required: true,
      default: 0,
      min: 0,
      description: 'Nombre de téléchargements',
      example: 15
    },

    noteGlobale: {
      type: 'number',
      required: false,
      min: 0,
      max: 5,
      description: 'Note moyenne globale (0-5)',
      example: 4.5
    },

    dateCreation: {
      type: 'datetime',
      required: true,
      default: () => new Date(),
      description: 'Date de création',
      example: new Date()
    },

    dateModification: {
      type: 'datetime',
      required: true,
      default: () => new Date(),
      description: 'Date de dernière modification',
      example: new Date()
    },

    datePublication: {
      type: 'datetime',
      required: false,
      description: 'Date de publication (si publié)',
      example: new Date()
    }
  },

  relations: {
    utilisateur: {
      model: 'User',
      type: 'one',
      foreignKey: 'utilisateurId',
      onDelete: 'CASCADE',
      description: 'Créateur du document'
    },

    votes: {
      model: 'DocumentVote',
      type: 'many',
      description: 'Votes reçus'
    },

    commentaires: {
      model: 'Commentaire',
      type: 'many',
      description: 'Commentaires sur ce document'
    }
  },

  indexes: [
    ['utilisateurId'],
    ['systemeJeu'],
    ['statut'],
    ['visibilite'],
    ['dateCreation'],
    ['noteGlobale']
  ],

  unique: []
}
