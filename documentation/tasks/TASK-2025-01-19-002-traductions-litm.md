# Task - Import des Traductions Multi-Niveaux dans PostgreSQL

## Métadonnées

- **ID**: TASK-2025-01-19-002
- **Date de création**: 2025-01-20
- **Priorité**: P0 (MVP)
- **Statut**: À faire
- **Temps estimé**: 4h
- **Version cible**: MVP v1.0

## Description

### Objectif

Importer les traductions depuis characters-of-the-mist dans la base de données PostgreSQL selon la hiérarchie **Système → Hack → Univers** définie dans l'architecture.

### Contexte

Suite à l'implémentation du système de traductions multi-niveaux (TASK-001), nous devons importer les traductions existantes dans la table `TranslationEntry` avec la bonne hiérarchie :

- **Niveau SYSTEM** : Traductions communes Mist Engine
- **Niveau HACK** : Traductions spécifiques LITM
- **Niveau UNIVERSE** : Traductions pour Zamanora et HOR

### Périmètre

**Inclus dans cette tâche**:
- Téléchargement des traductions depuis characters-of-the-mist
- Analyse et catégorisation (System vs Hack vs Universe)
- Script d'import dans PostgreSQL via Prisma
- Validation de l'héritage en cascade

**Exclu de cette tâche**:
- Configuration i18n (TASK-001)
- Traductions pour autres hacks (Otherscape, City of Mist)
- Interface d'édition (Post-MVP)

## Architecture

### Modèle de Données (depuis TASK-001)

```prisma
model TranslationEntry {
  id          String              @id @default(cuid())
  key         String
  value       String              @db.Text
  locale      String
  category    TranslationCategory
  description String?             @db.Text

  level       TranslationLevel    // SYSTEM, HACK, UNIVERSE
  priority    Int                 // 1=System, 2=Hack, 3=Universe

  systemId    String?
  hackId      String?
  universeId  String?

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### Structure des Données

```typescript
// Catégorisation des traductions
const SYSTEM_KEYS = [
  'common.*',          // Termes génériques
  'ui.buttons.*',      // Boutons standard
  'errors.generic.*',  // Erreurs système
  'auth.*'            // Authentification
];

const HACK_KEYS = [
  'character.*',       // Mécaniques de personnage
  'theme.*',          // Thèmes (LITM specific)
  'moves.*',          // Actions de jeu
  'status.*'          // États
];

const UNIVERSE_KEYS = [
  'lore.*',           // Histoire du monde
  'locations.*',      // Lieux spécifiques
  'npcs.*',           // Personnages non-joueurs
  'campaigns.*'       // Campagnes
];
```

## Plan d'Implémentation

### Étape 1: Récupération des Traductions Source

```typescript
// scripts/import-translations.ts
import { Octokit } from '@octokit/rest';

async function fetchTranslations() {
  const octokit = new Octokit();

  const frContent = await octokit.repos.getContent({
    owner: 'Altervayne',
    repo: 'characters-of-the-mist',
    path: 'messages/fr.json'
  });

  const enContent = await octokit.repos.getContent({
    owner: 'Altervayne',
    repo: 'characters-of-the-mist',
    path: 'messages/en.json'
  });

  return {
    fr: JSON.parse(Buffer.from(frContent.data.content, 'base64').toString()),
    en: JSON.parse(Buffer.from(enContent.data.content, 'base64').toString())
  };
}
```

### Étape 2: Catégorisation des Traductions

```typescript
function categorizeTranslations(translations: Record<string, any>) {
  const entries: TranslationEntry[] = [];

  // Récupérer les IDs depuis la DB
  const mistEngine = await prisma.system.findUnique({
    where: { slug: 'mist-engine' }
  });
  const litm = await prisma.hack.findUnique({
    where: { slug: 'litm' }
  });
  const zamanora = await prisma.universe.findUnique({
    where: { slug: 'zamanora' }
  });

  function processKeys(obj: any, prefix = '') {
    Object.entries(obj).forEach(([key, value]) => {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (typeof value === 'string') {
        // Déterminer le niveau
        let level: TranslationLevel;
        let systemId = null;
        let hackId = null;
        let universeId = null;
        let priority = 1;

        if (isSystemKey(fullKey)) {
          level = 'SYSTEM';
          systemId = mistEngine.id;
          priority = 1;
        } else if (isUniverseKey(fullKey)) {
          level = 'UNIVERSE';
          universeId = zamanora.id;
          priority = 3;
        } else {
          level = 'HACK';
          hackId = litm.id;
          priority = 2;
        }

        entries.push({
          key: fullKey,
          value,
          locale: 'fr',
          category: determineCategory(fullKey),
          level,
          priority,
          systemId,
          hackId,
          universeId
        });
      } else if (typeof value === 'object') {
        processKeys(value, fullKey);
      }
    });
  }

  processKeys(translations);
  return entries;
}
```

### Étape 3: Import dans PostgreSQL

```typescript
async function importToDatabase(entries: TranslationEntry[]) {
  // Utiliser upsert pour éviter les doublons
  const operations = entries.map(entry =>
    prisma.translationEntry.upsert({
      where: {
        key_locale_level_systemId_hackId_universeId: {
          key: entry.key,
          locale: entry.locale,
          level: entry.level,
          systemId: entry.systemId,
          hackId: entry.hackId,
          universeId: entry.universeId
        }
      },
      update: {
        value: entry.value,
        category: entry.category,
        priority: entry.priority,
        updatedAt: new Date()
      },
      create: entry
    })
  );

  // Batch operations pour performance
  await prisma.$transaction(operations);

  console.log(`Imported ${entries.length} translations`);
}
```

### Étape 4: Script Principal

```typescript
// scripts/import-translations.ts
async function main() {
  console.log('📥 Fetching translations from GitHub...');
  const { fr, en } = await fetchTranslations();

  console.log('🔍 Categorizing French translations...');
  const frEntries = await categorizeTranslations(fr, 'fr');

  console.log('🔍 Categorizing English translations...');
  const enEntries = await categorizeTranslations(en, 'en');

  console.log('💾 Importing to database...');
  await importToDatabase([...frEntries, ...enEntries]);

  // Nettoyer le cache Redis
  await redis.del('translations:*');

  console.log('✅ Import completed successfully!');

  // Stats
  const stats = await prisma.translationEntry.groupBy({
    by: ['level', 'locale'],
    _count: true
  });
  console.table(stats);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

### Étape 5: Validation de la Cascade

```typescript
// tests/translations-cascade.test.ts
test('Translation cascade resolution', async () => {
  const service = new TranslationService();

  // Créer un playspace Zamanora
  const playspace = await prisma.playspace.create({
    data: {
      name: 'Test Zamanora',
      hackId: 'litm-id',
      universeId: 'zamanora-id'
    }
  });

  // Résoudre les traductions
  const translations = await service.resolveTranslations(
    'fr',
    playspace.id
  );

  // Vérifier la cascade
  expect(translations.get('common.save')).toBe('Sauvegarder'); // System
  expect(translations.get('character.name')).toBe('Nom du Héros'); // Hack (LITM)
  expect(translations.get('lore.city')).toBe('Zamanora'); // Universe
});
```

### Étape 6: Migration depuis l'Ancien Système

Si des traductions existent déjà dans `app/locales/` :

```typescript
async function migrateExistingTranslations() {
  const files = glob.sync('app/locales/**/*.json');

  for (const file of files) {
    const content = JSON.parse(fs.readFileSync(file, 'utf-8'));
    const locale = path.basename(path.dirname(file));

    // Convertir et importer
    const entries = flattenToEntries(content, locale);
    await importToDatabase(entries);
  }

  console.log('🔄 Migration completed');
}
```

## Tests

### Tests d'Import

- [ ] Test import traductions FR
- [ ] Test import traductions EN
- [ ] Test détection niveau (System/Hack/Universe)
- [ ] Test upsert (pas de doublons)

### Tests de Cascade

- [ ] Test résolution System → Hack → Universe
- [ ] Test surcharge Hack sur System
- [ ] Test surcharge Universe sur Hack
- [ ] Test avec différents playspaces

### Tests de Performance

- [ ] Import de 1000+ traductions < 10s
- [ ] Résolution avec cache < 50ms
- [ ] Résolution sans cache < 150ms

## Exemple d'Utilisation

Après import, les traductions sont disponibles via le composable :

```vue
<template>
  <div>
    <!-- Résolu selon le playspace actif -->
    <h1>{{ t('character.title') }}</h1>

    <!-- System: "Save", LITM: "Sauvegarder l'Alter" -->
    <button>{{ t('common.save') }}</button>

    <!-- Zamanora: "Les rues de Zamanora" -->
    <p>{{ t('lore.city.description') }}</p>
  </div>
</template>

<script setup>
const { t } = useTranslations();
</script>
```

## Critères d'Acceptation

- [ ] Import réussi des traductions FR et EN
- [ ] Catégorisation correcte (System/Hack/Universe)
- [ ] Pas de doublons dans la DB
- [ ] Résolution en cascade fonctionne
- [ ] Cache invalidé après import
- [ ] Crédits Altervayne présents (CC BY-NC-SA 4.0)
- [ ] Performance respectée (<10s import, <150ms résolution)

## Dépendances

- **Bloqué par**: TASK-001 (Système de traductions multi-niveaux)
- **Bloque**: TASK-003 (Composable useTranslations)

## Notes

Cette approche permet :
- Import unique des traductions existantes
- Évolution future vers d'autres hacks/univers
- Surcharge granulaire par niveau
- Performance optimale avec cache

## Références

- [Architecture Traductions](../ARCHITECTURE/11-systeme-traductions-multi-niveaux.md)
- [characters-of-the-mist](https://github.com/Altervayne/characters-of-the-mist)
- [License CC BY-NC-SA 4.0](http://creativecommons.org/licenses/by-nc-sa/4.0/)