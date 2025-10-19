// Script d'exécution du nettoyage de la base de données pour TASK-020B
// Exécute le script SQL de nettoyage des systèmes non-Mist

import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'

const prisma = new PrismaClient()

async function executeCleanup() {
  console.log('=== NETTOYAGE DE LA BASE DE DONNEES ===')
  console.log('ATTENTION: Cette opération est IRREVERSIBLE !\n')

  try {
    // Lire le script SQL
    const sqlScript = readFileSync('prisma/migrations/draft_cleanup_non_mist_systems.sql', 'utf-8')

    console.log('Script SQL chargé avec succès')
    console.log(`Taille du script: ${(sqlScript.length / 1024).toFixed(2)} KB\n`)

    // Afficher un avertissement
    console.log('⚠️  AVERTISSEMENT ⚠️')
    console.log('Ce script va supprimer:')
    console.log('  - 6 systèmes de jeu')
    console.log('  - 6 univers')
    console.log('  - 7 oracles (Monsterhearts: 4, Roue du Temps: 3)')
    console.log('  - 233 items d\'oracles')
    console.log('\nBackup disponible: documentation/MIGRATION/2025-01-19-backup-before-cleanup.json')
    console.log('\nExécution dans 3 secondes...\n')

    await new Promise(resolve => setTimeout(resolve, 3000))

    console.log('Début de l\'exécution du script SQL...\n')

    // Exécuter le script SQL via Prisma
    // Note: Prisma $executeRawUnsafe ne supporte pas les transactions complexes
    // On va exécuter le script complet d'un coup
    await prisma.$executeRawUnsafe(sqlScript)

    console.log('\n✅ Script SQL exécuté avec succès !')
    console.log('\n=== VERIFICATION POST-SUPPRESSION ===\n')

    // Vérifier les systèmes restants
    const systemes = await prisma.systemeJeu.findMany({
      where: { actif: true },
      orderBy: { id: 'asc' }
    })
    console.log(`Systèmes restants: ${systemes.length}`)
    systemes.forEach(s => {
      console.log(`  - ${s.id}: ${s.nomComplet}`)
    })

    // Vérifier les univers restants
    const univers = await prisma.universJeu.findMany({
      where: { statut: 'ACTIF' },
      orderBy: { id: 'asc' }
    })
    console.log(`\nUnivers restants: ${univers.length}`)
    univers.forEach(u => {
      console.log(`  - ${u.id}: ${u.nomComplet} [${u.systeme_jeu}]`)
    })

    // Vérifier l'absence d'orphelins
    const orphelinsPersonnages = await prisma.personnages.count({
      where: {
        systeme_jeu: {
          notIn: systemes.map(s => s.id)
        }
      }
    })

    const orphelinsPdfs = await prisma.pdfs.count({
      where: {
        AND: [
          { systeme_jeu: { not: null } },
          { systeme_jeu: { notIn: systemes.map(s => s.id) } }
        ]
      }
    })

    const orphelinsOracles = await prisma.oracle.count({
      where: {
        AND: [
          { universJeu: { not: null } },
          { universJeu: { notIn: univers.map(u => u.id) } }
        ]
      }
    })

    console.log('\n=== VERIFICATION INTEGRITE ===')
    console.log(`Personnages orphelins: ${orphelinsPersonnages}`)
    console.log(`PDFs orphelins: ${orphelinsPdfs}`)
    console.log(`Oracles orphelins: ${orphelinsOracles}`)

    if (orphelinsPersonnages === 0 && orphelinsPdfs === 0 && orphelinsOracles === 0) {
      console.log('\n✅ Aucune donnée orpheline détectée')
    } else {
      console.log('\n❌ ATTENTION: Données orphelines détectées !')
      process.exit(1)
    }

    console.log('\n=== NETTOYAGE TERMINE AVEC SUCCES ===')

  } catch (error) {
    console.error('\n❌ ERREUR lors de l\'exécution:', error)
    console.error('\nLe backup est disponible dans: documentation/MIGRATION/2025-01-19-backup-before-cleanup.json')
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

executeCleanup()
