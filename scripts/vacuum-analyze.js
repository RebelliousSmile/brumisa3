// Script d'optimisation de la base de données pour TASK-020B
// Exécute VACUUM ANALYZE sur les tables modifiées

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function vacuumAnalyze() {
  console.log('=== OPTIMISATION DE LA BASE DE DONNEES ===\n')

  const tables = [
    'systemes_jeu',
    'univers_jeu',
    'oracles',
    'oracle_items',
    'personnages',
    'pdfs',
    'documents'
  ]

  try {
    for (const table of tables) {
      console.log(`VACUUM ANALYZE ${table}...`)
      try {
        await prisma.$executeRawUnsafe(`VACUUM ANALYZE ${table}`)
        console.log(`  ✓ ${table} optimisé`)
      } catch (error) {
        console.log(`  ⚠️  ${table}: ${error.message}`)
      }
    }

    console.log('\n✅ Optimisation terminée')

  } catch (error) {
    console.error('\n❌ ERREUR:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

vacuumAnalyze()
