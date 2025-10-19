// Script d'exécution du nettoyage de la base de données pour TASK-020B (v2)
// Exécute les commandes SQL une par une (Prisma limitation)

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function executeCleanup() {
  console.log('=== NETTOYAGE DE LA BASE DE DONNEES ===')
  console.log('ATTENTION: Cette opération est IRREVERSIBLE !\n')

  try {
    console.log('⚠️  AVERTISSEMENT ⚠️')
    console.log('Ce script va supprimer:')
    console.log('  - 6 systèmes de jeu')
    console.log('  - 6 univers')
    console.log('  - 7 oracles (Monsterhearts: 4, Roue du Temps: 3)')
    console.log('  - 233 items d\'oracles')
    console.log('\nBackup disponible: documentation/MIGRATION/2025-01-19-backup-before-cleanup.json')
    console.log('\nExécution dans 3 secondes...\n')

    await new Promise(resolve => setTimeout(resolve, 3000))

    console.log('=== DEBUT DU NETTOYAGE ===\n')

    // ETAPE 1: Suppression des oracles liés aux univers non-Mist
    console.log('1. Suppression des oracles des univers non-Mist...')
    const deletedOracles = await prisma.oracle.deleteMany({
      where: {
        universJeu: {
          in: ['monsterhearts', 'urban_shadows', 'ecryme', 'roue_du_temps', 'metro2033', 'zombiology']
        }
      }
    })
    console.log(`   ✓ ${deletedOracles.count} oracles supprimés`)

    // ETAPE 2: Suppression des documents liés aux systèmes non-Mist
    console.log('2. Suppression des documents des systèmes non-Mist...')
    const deletedDocuments = await prisma.document.deleteMany({
      where: {
        systemeJeu: {
          in: ['pbta', 'monsterhearts', 'engrenages', 'myz', 'metro2033', 'zombiology']
        }
      }
    })
    console.log(`   ✓ ${deletedDocuments.count} documents supprimés`)

    // ETAPE 3: Suppression des PDFs liés aux systèmes non-Mist
    console.log('3. Suppression des PDFs des systèmes non-Mist...')
    const deletedPdfs = await prisma.pdfs.deleteMany({
      where: {
        systeme_jeu: {
          in: ['pbta', 'monsterhearts', 'engrenages', 'myz', 'metro2033', 'zombiology']
        }
      }
    })
    console.log(`   ✓ ${deletedPdfs.count} PDFs supprimés`)

    // ETAPE 4: Suppression des personnages liés aux systèmes non-Mist
    console.log('4. Suppression des personnages des systèmes non-Mist...')
    const deletedPersonnages = await prisma.personnages.deleteMany({
      where: {
        systeme_jeu: {
          in: ['pbta', 'monsterhearts', 'engrenages', 'myz', 'metro2033', 'zombiology']
        }
      }
    })
    console.log(`   ✓ ${deletedPersonnages.count} personnages supprimés`)

    // ETAPE 5: Suppression des univers non-Mist
    console.log('5. Suppression des univers non-Mist...')
    const deletedUnivers = await prisma.universJeu.deleteMany({
      where: {
        id: {
          in: ['monsterhearts', 'urban_shadows', 'ecryme', 'roue_du_temps', 'metro2033', 'zombiology']
        }
      }
    })
    console.log(`   ✓ ${deletedUnivers.count} univers supprimés`)

    // ETAPE 6: Suppression des systèmes non-Mist
    console.log('6. Suppression des systèmes non-Mist...')
    const deletedSystemes = await prisma.systemeJeu.deleteMany({
      where: {
        id: {
          in: ['pbta', 'monsterhearts', 'engrenages', 'myz', 'metro2033', 'zombiology']
        }
      }
    })
    console.log(`   ✓ ${deletedSystemes.count} systèmes supprimés`)

    // ETAPE 7: Ajout de City of Mist
    console.log('\n7. Ajout de City of Mist...')
    const cityOfMist = await prisma.universJeu.create({
      data: {
        id: 'city-of-mist',
        nomComplet: 'City of Mist',
        description: 'Enquêtes urbaines modernes avec pouvoirs surnaturels inspirés par des mythes et légendes. Les personnages sont des Rifts, des individus ordinaires dont la vie est bouleversée par l\'apparition de pouvoirs mystiques.',
        editeur: 'Son of Oak Game Studio',
        annee_sortie: 2017,
        siteOfficiel: 'https://cityofmist.co',
        systeme_jeu: 'mistengine',
        statut: 'ACTIF',
        ordreAffichage: 1,
        couleur_theme: '#2D3748',
        langue_principale: 'en'
      }
    })
    console.log(`   ✓ City of Mist ajouté (id: ${cityOfMist.id})`)

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

    if (systemes.length !== 1) {
      throw new Error(`ERREUR: Il devrait rester exactement 1 système actif, mais il y en a ${systemes.length}`)
    }

    // Vérifier les univers restants
    const univers = await prisma.universJeu.findMany({
      where: { statut: 'ACTIF' },
      orderBy: { id: 'asc' }
    })
    console.log(`\nUnivers restants: ${univers.length}`)
    univers.forEach(u => {
      console.log(`  - ${u.id}: ${u.nomComplet} [${u.systeme_jeu}]`)
    })

    if (univers.length !== 5) {
      throw new Error(`ERREUR: Il devrait rester exactement 5 univers actifs, mais il y en a ${univers.length}`)
    }

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
      throw new Error('Données orphelines détectées')
    }

    console.log('\n=== RESUME DES SUPPRESSIONS ===')
    console.log(`Oracles supprimés: ${deletedOracles.count}`)
    console.log(`Documents supprimés: ${deletedDocuments.count}`)
    console.log(`PDFs supprimés: ${deletedPdfs.count}`)
    console.log(`Personnages supprimés: ${deletedPersonnages.count}`)
    console.log(`Univers supprimés: ${deletedUnivers.count}`)
    console.log(`Systèmes supprimés: ${deletedSystemes.count}`)
    console.log(`\nCity of Mist ajouté: ✅`)

    console.log('\n✅ NETTOYAGE TERMINE AVEC SUCCES !')

  } catch (error) {
    console.error('\n❌ ERREUR lors de l\'exécution:', error)
    console.error('\nLe backup est disponible dans: documentation/MIGRATION/2025-01-19-backup-before-cleanup.json')
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

executeCleanup()
