/**
 * Définition du modèle Character (générique pour tous les systèmes Mist)
 *
 * Fonctionne pour :
 * - Mist (système de base)
 * - City of Mist
 * - LITM (hack de Mist)
 * - Autres hacks futurs
 */

import type { ModelDefinition } from './types'

export const CHARACTER_MODEL: ModelDefinition = {
  name: 'Character',
  tableName: 'characters',
  description: 'Personnage générique pour systèmes Mist Engine',

  fields: {
    id: {
      type: 'uuid',
      required: true,
      description: 'Identifiant unique',
      example: '550e8400-e29b-41d4-a716-446655440000'
    },

    userId: {
      type: 'number',
      required: true,
      description: 'ID de l\'utilisateur créateur',
      example: 42
    },

    playspaceId: {
      type: 'uuid',
      required: false,
      description: 'ID du playspace (optionnel pour personnages solo)',
      example: '550e8400-e29b-41d4-a716-446655440000'
    },

    systemId: {
      type: 'string',
      required: true,
      maxLength: 50,
      description: 'ID du système de jeu (mist, city-of-mist)',
      example: 'mist'
    },

    hackId: {
      type: 'string',
      required: false,
      maxLength: 50,
      description: 'ID du hack si applicable (litm, etc.)',
      example: 'litm'
    },

    name: {
      type: 'string',
      required: true,
      maxLength: 255,
      description: 'Nom du personnage',
      example: 'Aria la Brumeuse'
    },

    description: {
      type: 'text',
      required: false,
      description: 'Description du personnage',
      example: 'Une guerrière mystique qui...'
    },

    avatar: {
      type: 'url',
      required: false,
      description: 'URL de l\'avatar du personnage',
      example: 'https://example.com/avatar.jpg'
    },

    data: {
      type: 'json',
      required: false,
      description: 'Données spécifiques au système (Hero Card LITM, etc.)',
      example: { heroCard: { name: 'Aria', backstory: '...' } }
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
    }
  },

  relations: {
    user: {
      model: 'User',
      type: 'one',
      foreignKey: 'userId',
      onDelete: 'CASCADE',
      description: 'Créateur du personnage'
    },

    playspace: {
      model: 'Playspace',
      type: 'one',
      foreignKey: 'playspaceId',
      onDelete: 'SET_NULL',
      description: 'Playspace auquel appartient le personnage'
    },

    themes: {
      model: 'ThemeCard',
      type: 'many',
      description: 'Cartes de thèmes du personnage'
    },

    trackers: {
      model: 'Tracker',
      type: 'many',
      description: 'Trackers (status, story tags, etc.)'
    }
  },

  indexes: [
    ['userId'],
    ['playspaceId'],
    ['systemId'],
    ['hackId'],
    ['dateCreation']
  ],

  unique: []
}
