// Script de backup de la base de données pour TASK-020A
// Exporte les données critiques en JSON pour backup

import { PrismaClient } from '@prisma/client'
import { writeFileSync } from 'fs'

const prisma = new PrismaClient()

async function backupDatabase() {
  console.log('=== BACKUP DE LA BASE DE DONNEES ===\n')

  try {
    const backup = {
      date: new Date().toISOString(),
      database: 'jdrspace_pdf',
      version: '1.0',
      data: {}
    }

    // Backup systèmes
    console.log('Backup des systèmes de jeu...')
    backup.data.systemes_jeu = await prisma.systemeJeu.findMany()
    console.log(`✓ ${backup.data.systemes_jeu.length} systèmes sauvegardés`)

    // Backup univers
    console.log('Backup des univers de jeu...')
    backup.data.univers_jeu = await prisma.universJeu.findMany()
    console.log(`✓ ${backup.data.univers_jeu.length} univers sauvegardés`)

    // Backup oracles
    console.log('Backup des oracles...')
    backup.data.oracles = await prisma.oracle.findMany()
    console.log(`✓ ${backup.data.oracles.length} oracles sauvegardés`)

    // Backup oracle_items
    console.log('Backup des items d\'oracles...')
    backup.data.oracle_items = await prisma.oracle_items.findMany()
    console.log(`✓ ${backup.data.oracle_items.length} items d'oracles sauvegardés`)

    // Backup personnages (au cas où)
    console.log('Backup des personnages...')
    backup.data.personnages = await prisma.personnages.findMany()
    console.log(`✓ ${backup.data.personnages.length} personnages sauvegardés`)

    // Backup PDFs (au cas où)
    console.log('Backup des PDFs...')
    backup.data.pdfs = await prisma.pdfs.findMany()
    console.log(`✓ ${backup.data.pdfs.length} PDFs sauvegardés`)

    // Backup documents (au cas où)
    console.log('Backup des documents...')
    backup.data.documents = await prisma.document.findMany()
    console.log(`✓ ${backup.data.documents.length} documents sauvegardés`)

    // Sauvegarder dans un fichier JSON
    const filename = 'documentation/MIGRATION/2025-01-19-backup-before-cleanup.json'
    writeFileSync(filename, JSON.stringify(backup, null, 2))

    console.log(`\n✅ Backup complet sauvegardé dans: ${filename}`)
    console.log(`Taille du fichier: ${(JSON.stringify(backup).length / 1024).toFixed(2)} KB`)

  } catch (error) {
    console.error('❌ Erreur lors du backup:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

backupDatabase()
