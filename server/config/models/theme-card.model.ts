/**
 * Définition du modèle ThemeCard (générique pour tous les systèmes Mist)
 *
 * Les types de thèmes varient selon le système :
 * - Mist/LITM : origin, adventure, greatness, fellowship, backpack
 * - City of Mist : mythos, logos, mist, crew, loadout
 *
 * La validation du type se fait via la config du système (server/config/systems)
 */

import type { ModelDefinition } from './types'

export const THEME_CARD_MODEL: ModelDefinition = {
  name: 'ThemeCard',
  tableName: 'theme_cards',
  description: 'Carte de thème générique pour systèmes Mist Engine',

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
      description: 'Type de thème (origin, mythos, etc.) - validé via config système',
      example: 'origin'
    },

    themebook: {
      type: 'string',
      required: false,
      maxLength: 100,
      description: 'Nom du themebook (si applicable, surtout pour CoM)',
      example: 'Bastion'
    },

    title: {
      type: 'string',
      required: true,
      maxLength: 255,
      description: 'Titre du thème',
      example: 'Le Gardien de la Brume'
    },

    description: {
      type: 'text',
      required: false,
      description: 'Description du thème',
      example: 'Mon origine est liée à...'
    },

    powerTags: {
      type: 'json',
      required: true,
      default: [],
      description: 'Liste des power tags',
      example: ['Manipulation de la brume', 'Vision à travers le voile']
    },

    weaknessTags: {
      type: 'json',
      required: true,
      default: [],
      description: 'Liste des weakness tags',
      example: ['Vulnérable au soleil direct']
    },

    attention: {
      type: 'number',
      required: true,
      default: 0,
      min: 0,
      max: 3,
      description: 'Niveau d\'attention (City of Mist uniquement, 0-3)',
      example: 0
    },

    crack: {
      type: 'number',
      required: true,
      default: 0,
      min: 0,
      max: 3,
      description: 'Nombre de cracks (City of Mist uniquement, 0-3)',
      example: 0
    },

    order: {
      type: 'number',
      required: true,
      default: 0,
      description: 'Ordre d\'affichage',
      example: 1
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
      description: 'Personnage auquel appartient ce thème'
    }
  },

  indexes: [
    ['characterId'],
    ['type'],
    ['order']
  ],

  unique: []
}
