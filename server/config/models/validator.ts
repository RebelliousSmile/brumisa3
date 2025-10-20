/**
 * Helper de validation basé sur les définitions de modèles
 * Utilise Zod pour la validation runtime
 */

import { z } from 'zod'
import type { ModelDefinition, FieldDefinition } from './types'

/**
 * Convertit une définition de champ en schéma Zod
 */
function fieldToZodSchema(field: FieldDefinition): z.ZodTypeAny {
  let schema: z.ZodTypeAny

  // Type de base
  switch (field.type) {
    case 'string':
      schema = z.string()
      if (field.minLength) schema = (schema as z.ZodString).min(field.minLength)
      if (field.maxLength) schema = (schema as z.ZodString).max(field.maxLength)
      if (field.pattern) schema = (schema as z.ZodString).regex(field.pattern)
      break

    case 'email':
      schema = z.string().email()
      if (field.maxLength) schema = (schema as z.ZodString).max(field.maxLength)
      break

    case 'url':
      schema = z.string().url()
      if (field.maxLength) schema = (schema as z.ZodString).max(field.maxLength)
      break

    case 'text':
      schema = z.string()
      break

    case 'number':
      schema = z.number()
      if (field.min !== undefined) schema = (schema as z.ZodNumber).min(field.min)
      if (field.max !== undefined) schema = (schema as z.ZodNumber).max(field.max)
      break

    case 'boolean':
      schema = z.boolean()
      break

    case 'date':
      schema = z.date()
      break

    case 'datetime':
      schema = z.date()
      break

    case 'json':
      schema = z.any()
      break

    case 'uuid':
      schema = z.string().uuid()
      break

    case 'enum':
      if (!field.enum || field.enum.length === 0) {
        throw new Error('Enum field must have enum values')
      }
      schema = z.enum(field.enum as [string, ...string[]])
      break

    default:
      schema = z.any()
  }

  // Optionnel ou requis
  if (!field.required) {
    schema = schema.optional()
  }

  // Valeur par défaut
  if (field.default !== undefined) {
    schema = schema.default(
      typeof field.default === 'function' ? field.default() : field.default
    )
  }

  return schema
}

/**
 * Génère un schéma Zod complet depuis une définition de modèle
 */
export function modelToZodSchema(model: ModelDefinition): z.ZodObject<any> {
  const shape: Record<string, z.ZodTypeAny> = {}

  for (const [fieldName, fieldDef] of Object.entries(model.fields)) {
    shape[fieldName] = fieldToZodSchema(fieldDef)
  }

  return z.object(shape)
}

/**
 * Génère un schéma Zod pour la création (sans id, dates auto)
 */
export function modelToCreateSchema(model: ModelDefinition): z.ZodObject<any> {
  const shape: Record<string, z.ZodTypeAny> = {}

  for (const [fieldName, fieldDef] of Object.entries(model.fields)) {
    // Exclure les champs auto-générés
    if (fieldName === 'id' ||
        fieldName === 'dateCreation' ||
        fieldName === 'dateModification') {
      continue
    }

    shape[fieldName] = fieldToZodSchema(fieldDef)
  }

  return z.object(shape)
}

/**
 * Génère un schéma Zod pour la mise à jour (tous les champs optionnels sauf id)
 */
export function modelToUpdateSchema(model: ModelDefinition): z.ZodObject<any> {
  const shape: Record<string, z.ZodTypeAny> = {}

  for (const [fieldName, fieldDef] of Object.entries(model.fields)) {
    // Exclure id et dateCreation
    if (fieldName === 'id' || fieldName === 'dateCreation') {
      continue
    }

    // Tous les champs sont optionnels pour un update
    const fieldSchema = fieldToZodSchema({ ...fieldDef, required: false })
    shape[fieldName] = fieldSchema
  }

  return z.object(shape)
}

/**
 * Valide des données contre un modèle
 */
export function validateData(
  model: ModelDefinition,
  data: unknown,
  mode: 'create' | 'update' | 'full' = 'full'
): { success: true; data: any } | { success: false; errors: z.ZodIssue[] } {
  let schema: z.ZodObject<any>

  switch (mode) {
    case 'create':
      schema = modelToCreateSchema(model)
      break
    case 'update':
      schema = modelToUpdateSchema(model)
      break
    case 'full':
    default:
      schema = modelToZodSchema(model)
      break
  }

  const result = schema.safeParse(data)

  if (result.success) {
    return { success: true, data: result.data }
  } else {
    return { success: false, errors: result.error.errors }
  }
}

/**
 * Wrapper pour validation dans les API routes
 */
export function createValidator(model: ModelDefinition) {
  return {
    validateCreate: (data: unknown) => validateData(model, data, 'create'),
    validateUpdate: (data: unknown) => validateData(model, data, 'update'),
    validateFull: (data: unknown) => validateData(model, data, 'full'),

    // Schémas Zod réutilisables
    createSchema: modelToCreateSchema(model),
    updateSchema: modelToUpdateSchema(model),
    fullSchema: modelToZodSchema(model)
  }
}
