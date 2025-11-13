/**
 * Script de test pour vérifier que les modèles LITM sont bien accessibles
 *
 * Usage: node --loader tsx scripts/test-litm-models.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testLitmModels() {
  try {
    console.log('🧪 Test des modèles LITM Prisma...\n')

    // Test 1: Vérifier que les modèles existent
    console.log('✓ LitmCharacter model:', typeof prisma.litmCharacter)
    console.log('✓ LitmHeroCard model:', typeof prisma.litmHeroCard)
    console.log('✓ LitmThemeCard model:', typeof prisma.litmThemeCard)
    console.log('✓ LitmTag model:', typeof prisma.litmTag)
    console.log('✓ LitmQuest model:', typeof prisma.litmQuest)
    console.log('✓ LitmTracker model:', typeof prisma.litmTracker)
    console.log('✓ LitmRelationship model:', typeof prisma.litmRelationship)
    console.log('✓ LitmQuintessence model:', typeof prisma.litmQuintessence)

    // Test 2: Compter les enregistrements
    const charCount = await prisma.litmCharacter.count()
    console.log(`\n📊 Nombre de personnages LITM: ${charCount}`)

    console.log('\n✅ Tous les modèles LITM sont accessibles !')
  } catch (error) {
    console.error('❌ Erreur lors du test:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

testLitmModels()
