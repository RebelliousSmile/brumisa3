/**
 * Types de base pour la définition des modèles
 */

// Types de champs disponibles
export type FieldType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'date'
  | 'datetime'
  | 'json'
  | 'uuid'
  | 'email'
  | 'url'
  | 'text'

// Enums globaux
export const Role = {
  UTILISATEUR: 'UTILISATEUR',
  MODERATEUR: 'MODERATEUR',
  ADMIN: 'ADMIN'
} as const
export type Role = typeof Role[keyof typeof Role]

export const StatutDocument = {
  ACTIF: 'ACTIF',
  ARCHIVE: 'ARCHIVE',
  SUPPRIME: 'SUPPRIME'
} as const
export type StatutDocument = typeof StatutDocument[keyof typeof StatutDocument]

export const Visibilite = {
  PRIVE: 'PRIVE',
  PUBLIC: 'PUBLIC',
  PARTAGE: 'PARTAGE'
} as const
export type Visibilite = typeof Visibilite[keyof typeof Visibilite]

export const StatutModeration = {
  EN_ATTENTE: 'EN_ATTENTE',
  APPROUVE: 'APPROUVE',
  REJETE: 'REJETE'
} as const
export type StatutModeration = typeof StatutModeration[keyof typeof StatutModeration]

export const TypeCompte = {
  STANDARD: 'STANDARD',
  PREMIUM: 'PREMIUM',
  ADMIN: 'ADMIN'
} as const
export type TypeCompte = typeof TypeCompte[keyof typeof TypeCompte]

export const StatutUtilisateur = {
  ACTIF: 'ACTIF',
  INACTIF: 'INACTIF',
  SUSPENDU: 'SUSPENDU',
  SUPPRIME: 'SUPPRIME'
} as const
export type StatutUtilisateur = typeof StatutUtilisateur[keyof typeof StatutUtilisateur]

export const TypePremium = {
  MENSUEL: 'MENSUEL',
  ANNUEL: 'ANNUEL',
  VIE: 'VIE'
} as const
export type TypePremium = typeof TypePremium[keyof typeof TypePremium]

// Enums LITM
export const LitmGameType = {
  LITM: 'LITM',
  COTM: 'COTM'
} as const
export type LitmGameType = typeof LitmGameType[keyof typeof LitmGameType]

export const LitmThemeType = {
  ORIGIN: 'ORIGIN',
  FELLOWSHIP: 'FELLOWSHIP',
  EXPERTISE: 'EXPERTISE',
  MYTHOS: 'MYTHOS'
} as const
export type LitmThemeType = typeof LitmThemeType[keyof typeof LitmThemeType]

export const LitmTrackerType = {
  STATUS: 'STATUS',
  STORY_TAG: 'STORY_TAG',
  STORY_THEME: 'STORY_THEME'
} as const
export type LitmTrackerType = typeof LitmTrackerType[keyof typeof LitmTrackerType]

/**
 * Définition d'un champ de modèle
 */
export interface FieldDefinition {
  type: FieldType | 'enum'
  required?: boolean
  unique?: boolean
  default?: any
  enum?: readonly string[]
  min?: number
  max?: number
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  description?: string
  example?: any
}

/**
 * Définition d'une relation
 */
export interface RelationDefinition {
  model: string
  type: 'one' | 'many'
  foreignKey?: string
  onDelete?: 'CASCADE' | 'SET_NULL' | 'RESTRICT'
  description?: string
}

/**
 * Définition d'un modèle complet
 */
export interface ModelDefinition {
  name: string
  tableName?: string  // Nom de table DB si différent
  description?: string
  fields: Record<string, FieldDefinition>
  relations?: Record<string, RelationDefinition>
  indexes?: string[][]  // Champs à indexer
  unique?: string[][]   // Contraintes d'unicité composites
}
