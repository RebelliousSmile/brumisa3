// Script d'audit de la base de données pour TASK-020A
// Interroge PostgreSQL via Prisma pour lister tous les systèmes et univers

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function auditDatabase() {
  console.log('=== AUDIT DE LA BASE DE DONNEES ===\n')

  try {
    // Récupérer tous les systèmes
    console.log('1. SYSTEMES DE JEU:')
    console.log('-'.repeat(80))
    const systemes = await prisma.systemeJeu.findMany({
      orderBy: { id: 'asc' }
    })

    console.log(`Nombre total de systèmes: ${systemes.length}\n`)
    systemes.forEach(sys => {
      console.log(`- ${sys.id.padEnd(15)} | ${sys.nomComplet.padEnd(40)} | Actif: ${sys.actif}`)
    })

    // Récupérer tous les univers
    console.log('\n\n2. UNIVERS DE JEU:')
    console.log('-'.repeat(80))
    const univers = await prisma.universJeu.findMany({
      orderBy: [
        { systeme_jeu: 'asc' },
        { id: 'asc' }
      ]
    })

    console.log(`Nombre total d'univers: ${univers.length}\n`)
    univers.forEach(univ => {
      console.log(`- ${univ.id.padEnd(20)} | ${univ.systeme_jeu.padEnd(15)} | ${univ.nomComplet.padEnd(35)} | Statut: ${univ.statut}`)
    })

    // Compter les personnages par système
    console.log('\n\n3. PERSONNAGES PAR SYSTEME:')
    console.log('-'.repeat(80))
    const personnages = await prisma.personnages.groupBy({
      by: ['systeme_jeu'],
      _count: true,
      orderBy: {
        systeme_jeu: 'asc'
      }
    })

    personnages.forEach(p => {
      console.log(`- ${p.systeme_jeu.padEnd(20)} | ${p._count} personnages`)
    })

    // Compter les PDFs par système
    console.log('\n\n4. PDFS PAR SYSTEME:')
    console.log('-'.repeat(80))
    const pdfs = await prisma.pdfs.groupBy({
      by: ['systeme_jeu'],
      _count: true,
      orderBy: {
        systeme_jeu: 'asc'
      },
      where: {
        systeme_jeu: { not: null }
      }
    })

    pdfs.forEach(p => {
      console.log(`- ${(p.systeme_jeu || 'NULL').padEnd(20)} | ${p._count} PDFs`)
    })

    // Compter les documents par système
    console.log('\n\n5. DOCUMENTS PAR SYSTEME:')
    console.log('-'.repeat(80))
    const documents = await prisma.document.groupBy({
      by: ['systemeJeu'],
      _count: true,
      orderBy: {
        systemeJeu: 'asc'
      }
    })

    documents.forEach(d => {
      console.log(`- ${d.systemeJeu.padEnd(20)} | ${d._count} documents`)
    })

    // Compter les oracles par univers
    console.log('\n\n6. ORACLES PAR UNIVERS:')
    console.log('-'.repeat(80))
    const oracles = await prisma.oracle.groupBy({
      by: ['universJeu'],
      _count: true,
      orderBy: {
        universJeu: 'asc'
      },
      where: {
        universJeu: { not: null }
      }
    })

    oracles.forEach(o => {
      console.log(`- ${(o.universJeu || 'NULL').padEnd(20)} | ${o._count} oracles`)
    })

    console.log('\n\n=== FIN DE L\'AUDIT ===')

  } catch (error) {
    console.error('Erreur lors de l\'audit:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

auditDatabase()
