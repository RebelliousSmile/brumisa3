/**
 * Seed des traductions multi-niveaux
 *
 * Importe les traductions existantes des fichiers i18n JSON
 * vers la table TranslationEntry au niveau HACK
 *
 * Hacks supportes:
 * - litm (Legends in the Mist)
 * - city-of-mist (City of Mist 1.0)
 * - otherscape (Tokyo: Otherscape)
 *
 * @module translations.seed
 */

import { PrismaClient, type TranslationCategory, type TranslationLevel } from '@prisma/client'
import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const prisma = new PrismaClient()

// ===========================================
// TYPES
// ===========================================

interface FileMapping {
  filename: string
  category: TranslationCategory
  prefix: string // Prefixe pour les cles (ex: "cards" pour "cards.themeCard.power")
}

interface HackConfig {
  hackId: string
  files: FileMapping[]
}

interface TranslationData {
  key: string
  value: string
  locale: string
  category: TranslationCategory
  level: TranslationLevel
  priority: number
  hackId: string
  description?: string
}

// ===========================================
// CONFIGURATION PAR HACK
// ===========================================

const HACK_CONFIGS: HackConfig[] = [
  // Legends in the Mist (Mist Engine 2.0)
  {
    hackId: 'litm',
    files: [
      { filename: 'litm-cards.json', category: 'THEMES', prefix: 'cards' },
      { filename: 'litm-themebooks.json', category: 'THEMES', prefix: 'themebooks' },
      { filename: 'litm-characters.json', category: 'CHARACTER', prefix: 'character' },
      { filename: 'litm-trackers.json', category: 'STATUSES', prefix: 'trackers' },
      { filename: 'litm-ui.json', category: 'UI', prefix: 'ui' },
      { filename: 'litm-errors.json', category: 'UI', prefix: 'errors' }
    ]
  },
  // City of Mist (version 1.0)
  {
    hackId: 'city-of-mist',
    files: [
      { filename: 'city-of-mist-cards.json', category: 'THEMES', prefix: 'cards' },
      { filename: 'city-of-mist-themebooks.json', category: 'THEMES', prefix: 'themebooks' }
    ]
  },
  // Tokyo: Otherscape (Mist Engine 2.0)
  {
    hackId: 'otherscape',
    files: [
      { filename: 'otherscape-cards.json', category: 'THEMES', prefix: 'cards' },
      { filename: 'otherscape-themebooks.json', category: 'THEMES', prefix: 'themebooks' }
    ]
  }
]

const LOCALES = ['fr', 'en']

// ===========================================
// FONCTIONS UTILITAIRES
// ===========================================

/**
 * Aplatit un objet JSON imbrique en cles a notation point
 *
 * @example
 * flattenObject({ a: { b: 'c' } }, 'prefix')
 * // => { 'prefix.a.b': 'c' }
 */
function flattenObject(
  obj: Record<string, unknown>,
  prefix: string = '',
  result: Record<string, string> = {}
): Record<string, string> {
  for (const [key, value] of Object.entries(obj)) {
    // Ignorer les metadonnees (_source, _license, _url)
    if (key.startsWith('_')) continue

    const newKey = prefix ? `${prefix}.${key}` : key

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      flattenObject(value as Record<string, unknown>, newKey, result)
    } else if (typeof value === 'string') {
      result[newKey] = value
    }
  }

  return result
}

/**
 * Lit et parse un fichier JSON
 */
function readJsonFile(filepath: string): Record<string, unknown> | null {
  if (!existsSync(filepath)) {
    console.log(`[Seed] File not found: ${filepath}`)
    return null
  }

  try {
    const content = readFileSync(filepath, 'utf-8')
    return JSON.parse(content)
  } catch (error) {
    console.error(`[Seed] Failed to parse ${filepath}:`, error)
    return null
  }
}

/**
 * Genere les donnees de traduction pour un fichier
 */
function generateTranslations(
  json: Record<string, unknown>,
  mapping: FileMapping,
  locale: string,
  hackId: string
): TranslationData[] {
  const flattened = flattenObject(json, mapping.prefix)
  const translations: TranslationData[] = []

  for (const [key, value] of Object.entries(flattened)) {
    translations.push({
      key,
      value,
      locale,
      category: mapping.category,
      level: 'HACK',
      priority: 2,
      hackId,
      description: `Imported from ${mapping.filename} (${hackId})`
    })
  }

  return translations
}

// ===========================================
// SEED PRINCIPAL
// ===========================================

async function seedTranslations(): Promise<void> {
  console.log('========================================')
  console.log('[Seed] Starting translations import...')
  console.log(`[Seed] Hacks: ${HACK_CONFIGS.map(h => h.hackId).join(', ')}`)
  console.log('========================================')

  // Determiner le chemin de base des fichiers i18n
  const __dirname = dirname(fileURLToPath(import.meta.url))
  const i18nBasePath = resolve(__dirname, '../../../../i18n/locales')

  console.log(`[Seed] Base path: ${i18nBasePath}`)

  let totalInserted = 0
  let totalSkipped = 0
  let totalUpdated = 0

  // Parcourir chaque hack
  for (const hackConfig of HACK_CONFIGS) {
    console.log(`\n========== HACK: ${hackConfig.hackId} ==========`)

    for (const locale of LOCALES) {
      console.log(`\n[Seed] Processing locale: ${locale}`)

      for (const mapping of hackConfig.files) {
        const filepath = resolve(i18nBasePath, locale, mapping.filename)
        console.log(`  -> Reading ${mapping.filename}...`)

        const json = readJsonFile(filepath)
        if (!json) {
          console.log(`     Skipped (file not found)`)
          continue
        }

        const translations = generateTranslations(json, mapping, locale, hackConfig.hackId)
        console.log(`     Found ${translations.length} translations`)

        // Inserer en batch
        for (const data of translations) {
          try {
            // Verifier si l'entree existe deja
            const existing = await prisma.translationEntry.findFirst({
              where: {
                key: data.key,
                locale: data.locale,
                category: data.category,
                level: data.level,
                hackId: data.hackId
              }
            })

            if (existing) {
              // Mettre a jour si la valeur a change
              if (existing.value !== data.value) {
                await prisma.translationEntry.update({
                  where: { id: existing.id },
                  data: { value: data.value, description: data.description }
                })
                totalUpdated++
              } else {
                totalSkipped++
              }
            } else {
              // Creer la nouvelle entree
              await prisma.translationEntry.create({
                data: {
                  key: data.key,
                  value: data.value,
                  locale: data.locale,
                  category: data.category,
                  level: data.level,
                  priority: data.priority,
                  hackId: data.hackId,
                  description: data.description
                }
              })
              totalInserted++
            }
          } catch (error) {
            console.error(`     Error inserting ${data.key}:`, error)
          }
        }
      }
    }
  }

  console.log('\n========================================')
  console.log(`[Seed] Completed!`)
  console.log(`  - Inserted: ${totalInserted}`)
  console.log(`  - Updated: ${totalUpdated}`)
  console.log(`  - Skipped (unchanged): ${totalSkipped}`)
  console.log('========================================')
}

// ===========================================
// EXECUTION
// ===========================================

seedTranslations()
  .then(() => {
    console.log('[Seed] Done.')
    process.exit(0)
  })
  .catch((error) => {
    console.error('[Seed] Fatal error:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
