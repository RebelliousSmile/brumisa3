/**
 * Script d'audit des systèmes legacy
 * TASK-2025-01-19-021 - Phase A
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AuditResult {
  systemesJeu: any[];
  universJeu: any[];
  personnagesParSysteme: Record<string, number>;
  pdfsParSysteme: Record<string, number>;
  documentsParSysteme: Record<string, number>;
}

async function auditLegacySystems(): Promise<AuditResult> {
  console.log('=== AUDIT DES SYSTEMES LEGACY ===\n');

  // 1. Lister tous les systèmes
  const systemesJeu = await prisma.systemes_jeu.findMany({
    orderBy: { id: 'asc' }
  });

  console.log('Systèmes de jeu trouvés:');
  systemesJeu.forEach(sys => {
    console.log(`  - ${sys.id}: ${sys.nom_complet} (actif: ${sys.actif})`);
  });
  console.log('');

  // 2. Lister tous les univers
  const universJeu = await prisma.univers_jeu.findMany({
    orderBy: [
      { systeme_jeu: 'asc' },
      { id: 'asc' }
    ]
  });

  console.log('Univers de jeu trouvés:');
  universJeu.forEach(univ => {
    console.log(`  - ${univ.id} (${univ.systeme_jeu}): ${univ.nom_complet}`);
  });
  console.log('');

  // 3. Compter les personnages par système
  const personnagesParSysteme: Record<string, number> = {};
  const personnagesCounts = await prisma.personnages.groupBy({
    by: ['systeme_jeu'],
    _count: {
      id: true
    }
  });
  personnagesCounts.forEach(item => {
    personnagesParSysteme[item.systeme_jeu] = item._count.id;
  });

  console.log('Personnages par système:');
  Object.entries(personnagesParSysteme).forEach(([systeme, count]) => {
    console.log(`  - ${systeme}: ${count} personnages`);
  });
  console.log('');

  // 4. Compter les PDFs par système
  const pdfsParSysteme: Record<string, number> = {};
  const pdfsCounts = await prisma.pdfs.groupBy({
    by: ['systeme_jeu'],
    where: {
      systeme_jeu: { not: null }
    },
    _count: {
      id: true
    }
  });
  pdfsCounts.forEach(item => {
    if (item.systeme_jeu) {
      pdfsParSysteme[item.systeme_jeu] = item._count.id;
    }
  });

  console.log('PDFs par système:');
  Object.entries(pdfsParSysteme).forEach(([systeme, count]) => {
    console.log(`  - ${systeme}: ${count} PDFs`);
  });
  console.log('');

  // 5. Compter les documents par système
  const documentsParSysteme: Record<string, number> = {};
  const documentsCounts = await prisma.documents.groupBy({
    by: ['systeme_jeu'],
    _count: {
      id: true
    }
  });
  documentsCounts.forEach(item => {
    documentsParSysteme[item.systeme_jeu] = item._count.id;
  });

  console.log('Documents par système:');
  Object.entries(documentsParSysteme).forEach(([systeme, count]) => {
    console.log(`  - ${systeme}: ${count} documents`);
  });
  console.log('');

  return {
    systemesJeu,
    universJeu,
    personnagesParSysteme,
    pdfsParSysteme,
    documentsParSysteme
  };
}

// Classification des systèmes
const LEGACY_SYSTEMS = ['pbta', 'engrenages', 'myz', 'zombiology'];
const MIST_SYSTEMS = ['litm', 'city-of-mist', 'otherscape', 'post-mortem'];

async function classifySystems(audit: AuditResult) {
  console.log('\n=== CLASSIFICATION DES SYSTEMES ===\n');

  const toDelete: string[] = [];
  const toMigrate: string[] = [];
  const unknown: string[] = [];

  audit.systemesJeu.forEach(sys => {
    if (LEGACY_SYSTEMS.includes(sys.id)) {
      toDelete.push(sys.id);
    } else if (MIST_SYSTEMS.includes(sys.id)) {
      toMigrate.push(sys.id);
    } else {
      unknown.push(sys.id);
    }
  });

  console.log('À SUPPRIMER (Legacy):');
  toDelete.forEach(id => {
    const perso = audit.personnagesParSysteme[id] || 0;
    const pdfs = audit.pdfsParSysteme[id] || 0;
    const docs = audit.documentsParSysteme[id] || 0;
    console.log(`  - ${id}: ${perso} persos, ${pdfs} PDFs, ${docs} docs`);
  });
  console.log('');

  console.log('À MIGRER (Mist Engine):');
  toMigrate.forEach(id => {
    const perso = audit.personnagesParSysteme[id] || 0;
    const pdfs = audit.pdfsParSysteme[id] || 0;
    const docs = audit.documentsParSysteme[id] || 0;
    console.log(`  - ${id}: ${perso} persos, ${pdfs} PDFs, ${docs} docs`);
  });
  console.log('');

  if (unknown.length > 0) {
    console.log('SYSTÈMES NON CLASSIFIÉS:');
    unknown.forEach(id => {
      const perso = audit.personnagesParSysteme[id] || 0;
      const pdfs = audit.pdfsParSysteme[id] || 0;
      const docs = audit.documentsParSysteme[id] || 0;
      console.log(`  - ${id}: ${perso} persos, ${pdfs} PDFs, ${docs} docs`);
    });
    console.log('');
  }
}

// Sauvegarder le résultat dans un fichier
async function saveAuditToFile(audit: AuditResult) {
  const fs = await import('fs/promises');
  const path = await import('path');

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `audit-legacy-systems-${timestamp}.json`;
  const filepath = path.join(process.cwd(), 'documentation', 'MIGRATION', filename);

  await fs.mkdir(path.dirname(filepath), { recursive: true });
  await fs.writeFile(filepath, JSON.stringify(audit, null, 2));

  console.log(`\nAudit sauvegardé: ${filepath}`);
}

// Main
async function main() {
  try {
    const audit = await auditLegacySystems();
    await classifySystems(audit);
    await saveAuditToFile(audit);
  } catch (error) {
    console.error('Erreur lors de l\'audit:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
