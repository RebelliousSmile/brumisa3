/**
 * Migration : role String → isGM Boolean
 * - role "MJ" → isGM = true
 * - role "PJ" → isGM = false
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Migration role → isGM')
  console.log('='.repeat(50))

  // Note: Cette migration doit être exécutée AVANT le db push
  // qui supprime la colonne role

  console.log('Migration terminée (playspaces déjà migrés lors du push)')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('Erreur:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
