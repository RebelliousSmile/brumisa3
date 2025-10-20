# Récapitulatif - Tâches Système de Traductions Multi-Niveaux

## Métadonnées

- **Date de création** : 2025-01-20
- **Créé par** : Claude (slash command /ana2task)
- **Nombre de tâches** : 6
- **Temps total estimé** : 16h
- **Statut** : En révision - Score 68.67/100

## Contexte

Suite à l'analyse de compatibilité entre @nuxtjs/i18n (i18n classique FR/EN) et le système de traductions multi-niveaux documenté dans `documentation/ARCHITECTURE/11-systeme-traductions-multi-niveaux.md`, 6 tâches ont été créées pour implémenter une **architecture hybride**.

## Liste des Tâches Créées

### Phase 1 : Fondations Backend (7h)

1. **TASK-2025-01-20-021** : Schema Prisma - Système de traductions multi-niveaux (3h)
   - Création modèles `TranslationEntry`, `System`, `Hack`
   - Extension modèle `Playspace` avec `systemId` et `hackId`
   - Support colonne `locale` pour FR/EN
   - Migration Prisma avec index optimisés

2. **TASK-2025-01-20-022** : Service backend de résolution en cascade (4h)
   - Service `resolveTranslations(context)` - Performance < 100ms
   - Service `getTranslationHierarchy(key, context)`
   - Service `createOverride()` et `removeOverride()`
   - Logging de performance

### Phase 2 : API & Frontend (5h)

3. **TASK-2025-01-20-023** : API Routes Nitro pour traductions (2h)
   - GET `/api/translations/resolve`
   - GET `/api/translations/hierarchy`
   - POST `/api/translations/override`
   - DELETE `/api/translations/override`
   - Validation Zod, gestion d'erreurs

4. **TASK-2025-01-20-024** : Composable `useGameLabels` (3h)
   - Composable distinct de `useI18n()`
   - Cache client avec auto-loading
   - Fonctions CRUD pour overrides
   - Gestion contexte playspace automatique

### Phase 3 : Données & Documentation (4h)

5. **TASK-2025-01-20-025** : Seeds de données de test (2h)
   - Systèmes : LITM, City of Mist, Otherscape
   - Hacks : Cyberpunk City, Night's Black Agents
   - Traductions FR + EN (10+ exemples)
   - Script idempotent

6. **TASK-2025-01-20-026** : Documentation architecture hybride (2h)
   - Mise à jour `11-systeme-traductions-multi-niveaux.md`
   - Exemples Vue avec les deux systèmes
   - Diagramme de décision "Quel système utiliser ?"
   - Guide de migration

## Validation par les Agents

### Scores Obtenus

| Agent | Score | Commentaire |
|-------|-------|-------------|
| **Technical Architect** | 82/100 | Architecture solide, mais corrections critiques nécessaires |
| **Senior Code Reviewer** | 72/100 | Bien structuré, bloqueurs sur Playspace et sécurité |
| **Product Owner** | 52/100 | Trop technique, manque vision utilisateur finale |

**Score Global** : **68.67/100**

### Verdict

❌ **Non prêt pour implémentation** - Corrections critiques requises

## Problèmes Critiques Identifiés

### 1. COLONNE `locale` MAL DOCUMENTÉE (Priorité: HAUTE)

**Problème** :
- La colonne `locale` est mentionnée dans le périmètre (ligne 38) et l'architecture (ligne 61)
- MAIS les étapes d'implémentation détaillées ne la spécifient pas explicitement
- Risque : Le développeur peut oublier de l'ajouter au schema Prisma

**Solution** :
```prisma
model TranslationEntry {
  id          String   @id @default(cuid())
  key         String
  value       String   @db.Text
  locale      String   @default("fr") // AJOUT CRITIQUE
  category    TranslationCategory
  description String?  @db.Text

  // ... reste du modèle

  @@unique([key, locale, category, systemId, hackId, universeId]) // locale dans la contrainte
  @@index([systemId, category, locale, key]) // locale dans les index
}
```

**Fichiers à modifier** :
- TASK-021 : Ajouter colonne `locale` dans Étape 2

---

### 2. MODÈLE PLAYSPACE INEXISTANT (Priorité: BLOQUEUR)

**Problème** :
- Le schema Prisma actuel (`prisma/schema.prisma`) n'a **AUCUN** modèle `Playspace`
- TASK-021 tente d'étendre un modèle qui n'existe pas
- Le projet a des tables `systemes_jeu` et `univers_jeu` mais pas de Playspace

**Solution** :
Créer une **TASK-020** préalable :

```markdown
# TASK-2025-01-20-020 : Création Modèle Playspace de Base

## Objectif
Créer le modèle Prisma `Playspace` qui servira de contexte unique pour les personnages et traductions.

## Schema
model Playspace {
  id        String   @id @default(cuid())
  name      String
  userId    String   // Propriétaire
  systemId  String   // Lien vers System (LITM, City of Mist)
  hackId    String?  // Optionnel (Cyberpunk City, etc.)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  system    System   @relation(fields: [systemId], references: [id])
  hack      Hack?    @relation(fields: [hackId], references: [id])

  characters    Character[]        // Relations futures
  translations  TranslationEntry[] // Overrides playspace

  @@index([userId])
  @@index([systemId])
}
```

**Ordre d'exécution corrigé** :
1. **TASK-020** (NOUVELLE) : Créer modèle Playspace
2. TASK-021 : Ajouter System, Hack, TranslationEntry
3. TASK-022 à 026 : Inchangé

---

### 3. SÉCURITÉ ABSENTE (Priorité: CRITIQUE)

**Problème** :
- Aucune authentification sur les endpoints POST/DELETE
- N'importe qui peut créer/supprimer des overrides
- Violation du principe "production-ready"

**Solution pour TASK-023** :

```typescript
// server/api/translations/override.post.ts

import { getServerSession } from '#auth' // Déjà configuré dans le projet

export default defineEventHandler(async (event) => {
  // AJOUT : Vérifier authentification
  const session = await getServerSession(event)
  if (!session?.user) {
    throw createError({
      statusCode: 401,
      message: 'Authentication required'
    })
  }

  const body = await readBody(event)
  const validated = createOverrideSchema.parse(body)

  // AJOUT : Vérifier ownership du playspace
  if (validated.playspaceId) {
    const playspace = await prisma.playspace.findUnique({
      where: { id: validated.playspaceId }
    })

    if (!playspace || playspace.userId !== session.user.id) {
      throw createError({
        statusCode: 403,
        message: 'You do not own this playspace'
      })
    }
  }

  return await createOverride(...)
})
```

**Fichiers à modifier** :
- TASK-023 : Ajouter Étape 6 "Sécurité et Authentification"

---

### 4. VALIDATION ZOD NON DÉFINIE (Priorité: HAUTE)

**Problème** :
- TASK-023 dit "Valider avec Zod" mais ne fournit pas les schemas
- Risque d'implémentation incohérente

**Solution** :

Créer fichier `server/validators/translations.validator.ts` :

```typescript
import { z } from 'zod'

export const translationCategoryEnum = z.enum([
  'CHARACTER',
  'PLAYSPACE',
  'GAME_MECHANICS',
  'UI',
  'THEMES',
  'MOVES',
  'STATUSES'
])

export const resolveQuerySchema = z.object({
  systemId: z.string().min(1),
  hackId: z.string().optional(),
  playspaceId: z.string().optional(),
  category: translationCategoryEnum,
  locale: z.string().regex(/^[a-z]{2}$/).default('fr') // AJOUT locale
})

export const createOverrideSchema = z.object({
  key: z.string().min(1).max(100),
  value: z.string().min(1),
  locale: z.string().regex(/^[a-z]{2}$/), // AJOUT locale
  category: translationCategoryEnum,
  level: z.enum(['HACK', 'UNIVERSE']),
  systemId: z.string().min(1),
  hackId: z.string().optional(),
  playspaceId: z.string().optional(),
  description: z.string().max(500).optional()
})

export const hierarchyQuerySchema = z.object({
  key: z.string().min(1),
  systemId: z.string().min(1),
  hackId: z.string().optional(),
  playspaceId: z.string().optional(),
  category: translationCategoryEnum,
  locale: z.string().regex(/^[a-z]{2}$/).default('fr') // AJOUT locale
})

export const deleteOverrideSchema = z.object({
  key: z.string().min(1),
  category: translationCategoryEnum,
  level: z.enum(['HACK', 'UNIVERSE']),
  locale: z.string().regex(/^[a-z]{2}$/), // AJOUT locale
  systemId: z.string().min(1),
  hackId: z.string().optional(),
  playspaceId: z.string().optional()
})
```

**Fichiers à modifier** :
- TASK-023 : Ajouter Étape 1 "Créer schemas Zod de validation"

---

### 5. COMPOSABLE UTILISE FETCH AU LIEU DU STORE (Priorité: MOYENNE)

**Problème** :
- TASK-024 prévoit `const { data: playspace } = useFetch(...)` dans le composable
- Performance : requête inutile si le store est déjà chargé
- Le playspace store existe déjà (mentionné dans CLAUDE.md)

**Solution pour TASK-024** :

```typescript
// composables/useGameLabels.ts

export function useGameLabels(playspaceId?: string) {
  const playspaceStore = usePlayspaceStore()
  const { locale } = useI18n() // Récupérer locale depuis i18n classique

  // CORRECTION : Utiliser le store directement, pas de fetch
  const context = computed(() => {
    const current = playspaceId
      ? playspaceStore.getById(playspaceId)
      : playspaceStore.current

    if (!current) {
      throw new Error('[useGameLabels] No active playspace. Select one first.')
    }

    return {
      systemId: current.systemId,
      hackId: current.hackId,
      playspaceId: current.id,
      locale: locale.value // AJOUT : utiliser locale depuis i18n
    }
  })

  // ... reste du composable
}
```

**Fichiers à modifier** :
- TASK-024 : Modifier Étape 1 pour utiliser le store, pas useFetch

---

### 6. SEEDS INSUFFISANTS POUR TESTS DE PERFORMANCE (Priorité: MOYENNE)

**Problème** :
- TASK-025 prévoit "au moins 10 traductions"
- Objectif de performance : < 100ms avec 100+ clés
- 10 traductions ne permettent pas de valider la performance réelle

**Solution pour TASK-025** :

```typescript
// server/database/seeds/translations.seed.ts

// AJOUT : Seed production-like pour tests de performance
async function seedProductionLikeData() {
  const categories: TranslationCategory[] = ['CHARACTER', 'THEMES', 'MOVES', 'STATUSES']

  // Créer 100 traductions par catégorie (400 total)
  for (const category of categories) {
    for (let i = 0; i < 100; i++) {
      await prisma.translationEntry.upsert({
        where: {
          key_locale_category_systemId_hackId_universeId: {
            key: `${category.toLowerCase()}.item_${i}`,
            locale: 'fr',
            category,
            systemId: litmSystem.id,
            hackId: null,
            universeId: null
          }
        },
        create: {
          key: `${category.toLowerCase()}.item_${i}`,
          value: `Valeur Test ${i}`,
          locale: 'fr',
          category,
          level: 'SYSTEM',
          priority: 1,
          systemId: litmSystem.id,
          description: `Test item ${i} pour performance`
        },
        update: {}
      })
    }
  }

  console.info('✅ 400 traductions créées pour tests de performance')
}
```

**Fichiers à modifier** :
- TASK-025 : Augmenter quantité de seeds à 100+ traductions par catégorie

---

### 7. MANQUE DE VISION UTILISATEUR (Priorité: BASSE)

**Problème** (soulevé par Product Owner) :
- Les tâches sont trop techniques
- Manquent de "User Stories" pour contextualiser

**Solution** :

Ajouter une section **User Story** en début de chaque tâche :

```markdown
## User Story

**En tant que** joueur créant un playspace Cyberpunk
**Je veux** personnaliser "Mythos" en "Implants Cybernétiques"
**Afin de** adapter la terminologie de jeu à mon univers narratif

**Critères d'acceptation métier** :
- [ ] Le joueur peut modifier un label de jeu depuis l'interface
- [ ] Le changement s'applique uniquement à son playspace (pas aux autres)
- [ ] Le temps de chargement reste < 2s (perceptible par l'utilisateur)
```

**Fichiers à modifier** :
- Toutes les tâches : Ajouter User Story en section Description

---

## Corrections Recommandées

### Actions Immédiates (Avant Implémentation)

#### Haute Priorité (Bloqueurs)

- [ ] **Créer TASK-020** : Modèle Playspace de base (NOUVEAU)
- [ ] **Modifier TASK-021** : Spécifier explicitement colonne `locale` dans Étape 2
- [ ] **Modifier TASK-023** : Ajouter authentification/autorisation (Étape 6)
- [ ] **Modifier TASK-023** : Définir schemas Zod explicites (Étape 1)

#### Moyenne Priorité (Qualité MVP)

- [ ] **Modifier TASK-024** : Utiliser store au lieu de useFetch
- [ ] **Modifier TASK-025** : Augmenter seeds à 100+ traductions
- [ ] **Modifier TASK-022** : Ajouter `locale` dans TranslationContext

#### Basse Priorité (Post-MVP)

- [ ] Ajouter User Stories à toutes les tâches
- [ ] Créer document centralié "Stratégie de Fallback"
- [ ] Ajouter tests E2E multi-locale dans TASK-023

### Ordre d'Exécution Corrigé

```
Phase 0 : Fondations (Nouvelle)
├── TASK-020 : Modèle Playspace de base (NOUVEAU, 2h)

Phase 1 : Backend (Modifié)
├── TASK-021 : Schema Prisma traductions (3h)
├── TASK-025 : Seeds de test (2h) ← Déplacé avant service
└── TASK-022 : Service résolution (4h)

Phase 2 : API & Frontend
├── TASK-023 : API Routes + Auth (3h) ← +1h pour auth
└── TASK-024 : Composable useGameLabels (3h)

Phase 3 : Documentation
└── TASK-026 : Doc architecture hybride (2h)
```

**Temps total** : 16h → **19h** (avec TASK-020 et corrections)

---

## Dépendances et Graphe

```
TASK-020 (Playspace)
    ↓
TASK-021 (Schema) ──→ TASK-025 (Seeds)
    ↓                      ↓
    └──────────────→ TASK-022 (Service)
                          ↓
                    TASK-023 (API) ──→ TASK-024 (Composable)
                                            ↓
                                      TASK-026 (Doc)
```

**Tâches parallélisables** :
- TASK-021 et TASK-020 (si Playspace minimal sans relations)
- TASK-025 peut commencer après TASK-021 (indépendant du service)

---

## Prochaines Étapes Suggérées

### Option A : Corriger et Re-valider (Recommandé)

1. Appliquer les 7 corrections ci-dessus
2. Relancer validation par les 3 agents
3. Viser score 100/100
4. Commencer implémentation

**Temps estimé** : 1h de corrections + 30min validation = **1.5h**

### Option B : Accepter en l'état avec Risques (Non recommandé)

1. Commencer implémentation avec score 68.67/100
2. Risques :
   - Modèle Playspace manquant → Blocage à TASK-021
   - Sécurité manquante → Vulnérabilité en production
   - Validation Zod floue → Incohérences entre routes

**Temps perdu estimé** : 3-5h de debugging et refactoring

---

## Validation Finale

### Critères pour Score 100/100

- [ ] Modèle Playspace créé (TASK-020)
- [ ] Colonne `locale` explicitement documentée (TASK-021)
- [ ] Authentification ajoutée (TASK-023)
- [ ] Schemas Zod définis (TASK-023)
- [ ] Composable utilise store (TASK-024)
- [ ] Seeds production-like (TASK-025)
- [ ] User Stories ajoutées (toutes les tâches)

### Temps Total Révisé

| Phase | Tâches | Temps Original | Temps Corrigé |
|-------|--------|----------------|---------------|
| 0 - Fondations | TASK-020 | - | 2h |
| 1 - Backend | TASK-021, 022, 025 | 9h | 9h |
| 2 - API/Frontend | TASK-023, 024 | 5h | 6h (+1h auth) |
| 3 - Documentation | TASK-026 | 2h | 2h |
| **TOTAL** | **7 tâches** | **16h** | **19h** |

---

## Références

- Documentation architecture : `documentation/ARCHITECTURE/11-systeme-traductions-multi-niveaux.md`
- Template de tâche : `documentation/templates/task.md`
- Rapports agents :
  - Technical Architect : Score 82/100
  - Senior Code Reviewer : Score 72/100
  - Product Owner : Score 52/100

---

**Créé par** : Claude (slash command /ana2task)
**Date** : 2025-01-20
**Statut** : ⚠️ Corrections requises - Score 68.67/100
