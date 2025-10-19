import { z } from 'zod'

/**
 * Schémas de validation Zod pour les API LITM
 */

// Character schemas
export const createCharacterSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(100, 'Le nom ne peut pas dépasser 100 caractères'),
  gameType: z.enum(['litm', 'cotm']).default('litm'),
})

export const updateCharacterSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  gameType: z.enum(['litm', 'cotm']).optional(),
})

// Hero Card schemas
export const createHeroCardSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(100),
  backstory: z.string().max(2000).optional(),
  birthright: z.string().max(2000).optional(),
})

export const updateHeroCardSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  backstory: z.string().max(2000).optional(),
  birthright: z.string().max(2000).optional(),
})

// Theme Card schemas
export const createThemeCardSchema = z.object({
  type: z.enum(['origin', 'fellowship', 'expertise', 'mythos']),
  themebook: z.string().min(1, 'Le themebook est requis').max(100),
  title: z.string().min(1, 'Le titre est requis').max(100),
  mainTagText: z.string().max(100).optional(),
})

export const updateThemeCardSchema = z.object({
  type: z.enum(['origin', 'fellowship', 'expertise', 'mythos']).optional(),
  themebook: z.string().min(1).max(100).optional(),
  title: z.string().min(1).max(100).optional(),
  mainTagText: z.string().max(100).optional(),
})

// Tag schemas
export const createTagSchema = z.object({
  text: z.string().min(1, 'Le texte du tag est requis').max(200),
  isPower: z.boolean(),
})

export const updateTagSchema = z.object({
  text: z.string().min(1).max(200).optional(),
  isPower: z.boolean().optional(),
})

// Quest schemas
export const createQuestSchema = z.object({
  text: z.string().min(1, 'Le texte de la quête est requis').max(500),
  progressPips: z.number().int().min(0).max(4).default(0),
  totalPips: z.number().int().min(1).max(4).default(4),
})

export const updateQuestSchema = z.object({
  text: z.string().min(1).max(500).optional(),
  progressPips: z.number().int().min(0).max(4).optional(),
  totalPips: z.number().int().min(1).max(4).optional(),
})

// Tracker schemas
export const trackerSchema = z.object({
  id: z.string(),
  type: z.enum(['status', 'storyTag', 'storyTheme']),
  name: z.string().min(1).max(100),
  totalPips: z.number().int().min(0).max(10),
  activePips: z.number().int().min(0).max(10),
})

export const updateTrackersSchema = z.object({
  trackers: z.array(trackerSchema),
})

// Relationship schemas
export const relationshipSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
})

export const updateRelationshipsSchema = z.object({
  relationships: z.array(relationshipSchema),
})

// Quintessence schemas
export const quintessenceSchema = z.object({
  id: z.string(),
  text: z.string().min(1).max(200),
})

export const updateQuintessencesSchema = z.object({
  quintessences: z.array(quintessenceSchema),
})

// Backpack schemas
export const backpackItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
})

export const updateBackpackSchema = z.object({
  items: z.array(backpackItemSchema),
})

// Types inférés
export type CreateCharacterInput = z.infer<typeof createCharacterSchema>
export type UpdateCharacterInput = z.infer<typeof updateCharacterSchema>
export type CreateHeroCardInput = z.infer<typeof createHeroCardSchema>
export type UpdateHeroCardInput = z.infer<typeof updateHeroCardSchema>
export type CreateThemeCardInput = z.infer<typeof createThemeCardSchema>
export type UpdateThemeCardInput = z.infer<typeof updateThemeCardSchema>
export type CreateTagInput = z.infer<typeof createTagSchema>
export type UpdateTagInput = z.infer<typeof updateTagSchema>
export type CreateQuestInput = z.infer<typeof createQuestSchema>
export type UpdateQuestInput = z.infer<typeof updateQuestSchema>
export type TrackerInput = z.infer<typeof trackerSchema>
export type UpdateTrackersInput = z.infer<typeof updateTrackersSchema>
export type RelationshipInput = z.infer<typeof relationshipSchema>
export type UpdateRelationshipsInput = z.infer<typeof updateRelationshipsSchema>
export type QuintessenceInput = z.infer<typeof quintessenceSchema>
export type UpdateQuintessencesInput = z.infer<typeof updateQuintessencesSchema>
export type BackpackItemInput = z.infer<typeof backpackItemSchema>
export type UpdateBackpackInput = z.infer<typeof updateBackpackSchema>
