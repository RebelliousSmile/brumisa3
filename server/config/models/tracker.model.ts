/**
 * Définition du modèle Tracker (générique pour tous les systèmes Mist)
 *
 * Types de trackers selon le système :
 * - Mist/LITM : milestones, status, story_tag, story_theme
 * - City of Mist : status, spectrum, etc.
 */

import type { ModelDefinition } from './types'

export const TRACKER_MODEL: ModelDefinition = {
  name: 'Tracker',
  tableName: 'trackers',
  description: 'Tracker générique pour systèmes Mist Engine',

  fields: {
    id: {
      type: 'uuid',
      required: true,
      description: 'Identifiant unique',
      example: '550e8400-e29b-41d4-a716-446655440000'
    },

    characterId: {
      type: 'uuid',
      required: true,
      description: 'ID du personnage',
      example: '550e8400-e29b-41d4-a716-446655440000'
    },

    type: {
      type: 'string',
      required: true,
      maxLength: 50,
      description: 'Type de tracker (status, story_tag, milestone, etc.)',
      example: 'status'
    },

    name: {
      type: 'string',
      required: true,
      maxLength: 255,
      description: 'Nom du tracker',
      example: 'Injured'
    },

    description: {
      type: 'text',
      required: false,
      description: 'Description du tracker',
      example: 'Blessé suite au combat'
    },

    tier: {
      type: 'number',
      required: false,
      min: 1,
      max: 6,
      description: 'Tier du status (1-6, pour statuses)',
      example: 3
    },

    totalPips: {
      type: 'number',
      required: true,
      default: 3,
      min: 1,
      description: 'Nombre total de pips/cases',
      example: 3
    },

    activePips: {
      type: 'number',
      required: true,
      default: 0,
      min: 0,
      description: 'Nombre de pips/cases actifs',
      example: 2
    },

    positive: {
      type: 'boolean',
      required: true,
      default: true,
      description: 'Si le tracker est positif ou négatif',
      example: false
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
    character: {
      model: 'Character',
      type: 'one',
      foreignKey: 'characterId',
      onDelete: 'CASCADE',
      description: 'Personnage auquel appartient ce tracker'
    }
  },

  indexes: [
    ['characterId'],
    ['type']
  ],

  unique: []
}
