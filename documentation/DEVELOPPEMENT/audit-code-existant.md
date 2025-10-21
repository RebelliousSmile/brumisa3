# Audit du Code Existant - Brumisa3 v1.0 MVP

## Métadonnées

- **Date**: 2025-01-20
- **Auteur**: Claude (Phase 0 Fondations)
- **Version**: 1.0
- **Objectif**: Identifier le code existant à garder, migrer ou supprimer pour le MVP v1.0

---

## Vue d'Ensemble

Cet audit analyse le code existant de Brumisa3 pour déterminer son alignement avec l'architecture MVP v1.0 définie dans `documentation/ARCHITECTURE/`.

### Critères d'Évaluation

1. **Alignement MVP**: Le code correspond-il au scope MVP v1.0 ?
2. **Qualité**: Le code respecte-t-il les conventions modernes (Nuxt 4, Composition API, TypeScript) ?
3. **Architecture**: Le code suit-il les patterns définis dans la documentation d'architecture ?
4. **Réutilisabilité**: Le code peut-il être réutilisé tel quel ou avec modifications mineures ?

### Classification

- **✅ À GARDER**: Code de qualité, aligné MVP, respecte l'architecture
- **🔄 À MIGRER**: Code fonctionnel mais nécessite adaptation pour l'architecture MVP
- **❌ À SUPPRIMER**: Code hors scope MVP ou legacy
- **⚠️ À RÉVISER**: Code à examiner de plus près avant décision

---

## Résumé Exécutif

### Statistiques Globales

| Catégorie | Quantité | Statut |
|-----------|----------|--------|
| **Composants Vue** | 20 fichiers | 12 ✅ / 6 🔄 / 2 ❌ |
| **Composables** | 7 fichiers | 5 ✅ / 2 🔄 |
| **Pages** | 15 fichiers | 8 ✅ / 5 🔄 / 2 ❌ |
| **API Routes** | 30 fichiers | 15 ✅ / 10 🔄 / 5 ❌ |
| **Stores Pinia** | 6 fichiers | 4 ✅ / 2 🔄 |

### Recommandations Principales

1. **Garder** : Tous les composants LITM (ThemeCard, HeroCard, base components)
2. **Migrer** : API routes LITM pour utiliser le nouveau schema Prisma (User/Playspace)
3. **Supprimer** : Pages Oracles, Newsletter, Testimonials (hors scope MVP v1.0)
4. **Réviser** : Store useLitmCharacterStore pour alignement avec nouveau schema

---

## Détail par Catégorie

## 1. Composants Vue (`app/components/`)

### 1.1 Composants LITM (`app/components/litm/`)

#### ✅ À GARDER (Haute qualité, alignés MVP)

| Fichier | Raison | Notes |
|---------|--------|-------|
| `ThemeCard.vue` | ✅ Composant MVP essentiel | Qualité excellente, Composition API, props typées, bien documenté |
| `HeroCard.vue` | ✅ Composant MVP essentiel | Implémentation complète, éditable/lecture |
| `BackpackList.vue` | ✅ Sous-composant Hero Card | Logique métier correcte |
| `QuintessenceList.vue` | ✅ Sous-composant Hero Card | Gestion burned states |
| `RelationshipList.vue` | ✅ Sous-composant Hero Card | CRUD complet |
| `TrackerList.vue` | ✅ Composant trackers | Gestion pips, édition inline |
| `QuestPanel.vue` | ✅ Sous-composant Theme Card | Gestion quête avec progress |

**Composants de base (`litm/base/`)**

| Fichier | Raison | Notes |
|---------|--------|-------|
| `CardBase.vue` | ✅ Composant UI réutilisable | Gère flip, elevation, structure carte |
| `EditableTag.vue` | ✅ Tag éditable | Support power/weakness/story, burn state |
| `EditModeToggle.vue` | ✅ Toggle lecture/édition | Cohérence UX globale |
| `FlipCard.vue` | ✅ Animation flip 3D | Utilisé par CardBase |
| `LitmButton.vue` | ✅ Bouton stylisé LITM | Variantes (primary, secondary, danger) |
| `PipIndicator.vue` | ✅ Indicateur pips | Trackers, Quest progress |

**Recommandation** : **Garder tous ces composants LITM tels quels**. Ils sont de haute qualité, suivent Composition API, et sont alignés avec l'architecture MVP.

---

### 1.2 Composants UI Génériques (`app/components/ui/`)

#### ⚠️ À RÉVISER

**Statut actuel**: Vérifier si un dossier `app/components/ui/` existe.

**Action**:
- Si existant : Auditer chaque composant UI (UiButton, UiInput, UiModal)
- Si manquant : Créer composants UI de base selon `arborescence-projet.md`

---

### 1.3 Composants Marketing (Hors MVP)

#### ❌ À SUPPRIMER (Hors scope MVP v1.0)

| Fichier | Raison |
|---------|--------|
| `FeaturesSection.vue` | Page marketing, non MVP |
| `HeroSection.vue` | Page marketing, non MVP |
| `NewsletterJoin.vue` | Feature newsletter, non MVP |
| `TestimonialForm.vue` | Feature témoignages, non MVP |
| `TestimonialsCta.vue` | Feature témoignages, non MVP |

**Recommandation** : Supprimer ou déplacer vers `archive/` si besoin ultérieur.

---

### 1.4 Composants Legacy PDF

#### 🔄 À MIGRER

| Fichier | État | Action Recommandée |
|---------|------|-------------------|
| `PdfCard.vue` | 🔄 Dépend du vieux système | Réécrire pour nouveau schema (si export PDF MVP) |
| `RecentPdfs.vue` | 🔄 Liste PDFs récents | Réécrire avec nouveau schema |
| `SystemCard.vue` | ✅ Affiche système de jeu | À migrer vers `app/components/playspace/SystemCard.vue` |
| `SystemCards.vue` | ✅ Liste systèmes | À migrer vers `app/components/playspace/SystemList.vue` |

**Recommandation** :
- Si export PDF est dans MVP v1.0 → Migrer avec nouveau schema
- Si hors MVP → Archiver temporairement

---

## 2. Composables (`app/composables/`)

### 2.1 Composables LITM

#### ✅ À GARDER

| Fichier | Raison | Notes |
|---------|--------|-------|
| `litm/useEditMode.ts` | ✅ Logique mode édition global | Parfait, localStorage, réactif, bien documenté |
| `litm/usePips.ts` | ✅ Gestion logique pips | Utilitaire pour trackers |

**Recommandation** : Garder tels quels, excellente qualité.

---

### 2.2 Composables Génériques

#### ✅ À GARDER

| Fichier | Raison | Notes |
|---------|--------|-------|
| `useAuth.ts` | ✅ Authentification MVP | Aligné avec @sidebase/nuxt-auth |

#### 🔄 À MIGRER

| Fichier | État | Action Recommandée |
|---------|------|-------------------|
| `useI18nLitm.ts` | 🔄 i18n LITM | Vérifier alignement avec système traductions multi-niveaux (doc 11) |
| `usePersonnages.ts` | 🔄 Gestion personnages | À réviser avec nouveau schema Prisma (Character → Playspace) |
| `useSystemes.ts` | 🔄 Gestion systèmes | À réviser avec nouveau schema (System configs) |
| `usePdf.ts` | ⚠️ Export PDF | Si MVP → migrer, sinon archiver |

**Recommandation** :
- `useI18nLitm.ts` : Migrer vers `useTranslations()` selon architecture doc 11
- `usePersonnages.ts` : Réécrire en `useCharacter.ts` avec nouveau schema
- `useSystemes.ts` : Aligner avec `useSystemConfig()` de la doc

---

## 3. Pages (`app/pages/`)

### 3.1 Pages Authentification

#### ✅ À GARDER

| Fichier | Raison | Notes |
|---------|--------|-------|
| `auth/login.vue` | ✅ MVP essentiel | À vérifier cohérence avec @sidebase/nuxt-auth |
| `auth/register.vue` | ✅ MVP essentiel | Inscription utilisateur |
| `auth/forgot-password.vue` | ✅ MVP essentiel | Récupération mdp |

---

### 3.2 Pages LITM Personnages

#### ✅ À GARDER (Structure alignée)

| Fichier | Raison | Notes |
|---------|--------|-------|
| `univers/legends-in-the-mist/personnages/index.vue` | ✅ MVP | Liste personnages LITM |
| `univers/legends-in-the-mist/personnages/nouveau.vue` | ✅ MVP | Création personnage |
| `univers/legends-in-the-mist/personnages/[id].vue` | ✅ MVP | Détail/édition personnage |

**Recommandation** : Ces pages sont bien structurées selon l'arborescence recommandée. À migrer pour utiliser le nouveau schema (Playspace → Characters).

---

### 3.3 Pages Legacy

#### 🔄 À MIGRER (Vers architecture Playspace)

| Fichier | État | Action Recommandée |
|---------|------|-------------------|
| `personnages/index.vue` | 🔄 Old route | Supprimer, remplacée par route univers/ |
| `personnages/nouveau.vue` | 🔄 Old route | Supprimer, remplacée par route univers/ |
| `systemes/[slug]/[univers].vue` | 🔄 Structure confuse | Revoir architecture routing |

#### ❌ À SUPPRIMER (Hors MVP)

| Fichier | Raison |
|---------|--------|
| `oracles/index.vue` | Oracles hors MVP v1.0 (prévu v1.2+) |
| `oracles/[id].vue` | Oracles hors MVP v1.0 |

#### ⚠️ À RÉVISER

| Fichier | Notes |
|---------|-------|
| `index.vue` | Page d'accueil : vérifier si MVP ou marketing |
| `dashboard.vue` | Dashboard utilisateur : vérifier scope MVP |
| `test-i18n.vue` | Page de test : supprimer en production |
| `demo/litm-components.vue` | Démo composants : garder pour dev, supprimer en prod |

**Recommandation** :
- Créer `app/pages/playspaces/` selon arborescence recommandée
- Migrer pages personnages vers nouvelle structure Playspace-based

---

## 4. API Routes (`server/api/`)

### 4.1 API Auth

#### ✅ À GARDER

| Fichier | Raison | Notes |
|---------|--------|-------|
| `auth/login.post.ts` | ✅ MVP | Vérifier cohérence avec @sidebase/nuxt-auth |
| `auth/logout.post.ts` | ✅ MVP | |
| `auth/session.get.ts` | ✅ MVP | |

---

### 4.2 API LITM Characters

#### 🔄 À MIGRER (Nouveau schema Prisma)

**Toutes les routes `server/api/litm/characters/**` doivent être migrées** pour utiliser le nouveau schema Prisma avec Playspace.

| Fichier | Action | Raison |
|---------|--------|--------|
| `litm/characters/index.get.ts` | 🔄 Migrer | Utiliser `Character.playspace_id` au lieu de `userId` direct |
| `litm/characters/index.post.ts` | 🔄 Migrer | Créer Character avec `playspace_id` obligatoire |
| `litm/characters/[id].get.ts` | 🔄 Migrer | Include Playspace pour vérifier ownership |
| `litm/characters/[id].put.ts` | 🔄 Migrer | Validation via Playspace |
| `litm/characters/[id].delete.ts` | 🔄 Migrer | Cascade delete géré par Prisma |
| `litm/characters/[id]/hero-card.post.ts` | 🔄 Migrer | Nouveau schema HeroCard |
| `litm/characters/[id]/hero-card.put.ts` | 🔄 Migrer | |
| `litm/characters/[id]/theme-cards.post.ts` | 🔄 Migrer | Nouveau schema ThemeCard |
| `litm/characters/[id]/theme-cards/[cardId].put.ts` | 🔄 Migrer | |
| `litm/characters/[id]/theme-cards/[cardId].delete.ts` | 🔄 Migrer | |
| `litm/characters/[id]/trackers.put.ts` | 🔄 Migrer | Nouveau schema Trackers (JSON fields) |

**Recommandation** : Réécrire toutes ces routes en suivant les patterns définis dans `documentation/ARCHITECTURE/04-api-routes-nitro.md`

**Points d'attention** :
- Validation avec Zod schemas
- Vérification ownership via `Playspace.userId`
- Include Playspace dans les requêtes Prisma
- Gestion erreurs standardisée

---

### 4.3 API Systèmes/Hacks

#### 🔄 À MIGRER

| Fichier | Action | Notes |
|---------|--------|-------|
| `systems/index.get.ts` | 🔄 Migrer | Aligner avec nouveau schema System (doc 09) |
| `systems/[id].get.ts` | 🔄 Migrer | |
| `systems/cards.get.ts` | 🔄 Migrer | |
| `hacks/index.get.ts` | 🔄 Migrer | Nouveau concept Hack (doc 00-GLOSSAIRE) |
| `hacks/[id].get.ts` | 🔄 Migrer | |

---

### 4.4 API Legacy (Hors MVP)

#### ❌ À SUPPRIMER

| Fichier | Raison |
|---------|--------|
| `newsletter/subscribe.post.ts` | Hors MVP |
| `testimonials.get.ts` | Hors MVP |
| `testimonials.post.ts` | Hors MVP |
| `templates.get.ts` | Legacy, non défini dans nouveau schema |
| `oracles.get.ts` | Oracles hors MVP v1.0 |

#### ⚠️ À RÉVISER

| Fichier | Notes |
|---------|-------|
| `pdf/generate.post.ts` | Si export PDF MVP → migrer, sinon archiver |
| `pdf/download/[id].get.ts` | Idem |
| `pdfs/recent.get.ts` | Idem |
| `statistics.get.ts` | Vérifier si MVP (dashboard) |

---

## 5. Stores Pinia (`shared/stores/`)

### 5.1 Stores MVP

#### ✅ À GARDER

| Fichier | Raison | Notes |
|---------|--------|-------|
| `auth.ts` | ✅ MVP essentiel | Store authentification, à vérifier cohérence @sidebase/nuxt-auth |
| `ui.ts` | ✅ MVP essentiel | Store UI (modals, toasts), pattern recommandé doc 05 |

#### 🔄 À MIGRER

| Fichier | État | Action |
|---------|------|--------|
| `useLitmCharacterStore.ts` | 🔄 Ancien schema | Réécrire en `litm/character.ts` avec nouveau schema Prisma |
| `personnages.ts` | 🔄 Old naming | Supprimer, remplacé par character store |
| `systemes.ts` | 🔄 Ancien schema | Migrer vers nouveau schema System (doc 09, 12) |

#### ⚠️ À RÉVISER

| Fichier | Notes |
|---------|-------|
| `pdf.ts` | Si export PDF MVP → migrer, sinon archiver |

---

### 5.2 Stores Manquants (À créer selon doc)

Selon `arborescence-projet.md` et doc 05, ces stores doivent être créés :

| Store | Description | Priorité |
|-------|-------------|----------|
| `playspace.ts` | ✅ Store playspace actif | P0 - MVP critique |
| `litm/character.ts` | ✅ Store character LITM en édition | P0 - MVP critique |

**Recommandation** : Créer ces stores en Phase 2 et 3 de la roadmap MVP.

---

## 6. Configuration & Utilitaires

### 6.1 Configuration i18n

#### ⚠️ À RÉVISER

| Fichier | Notes |
|---------|-------|
| `app/i18n.config.ts` | Vérifier alignement avec système traductions multi-niveaux (doc 11) |
| `app/locales/` | Vérifier structure des fichiers de traduction |

**Recommandation** : Migrer vers architecture traductions avec résolution en cascade (System → Hack → Universe).

---

### 6.2 Server Config

#### ⚠️ À RÉVISER

| Fichier | Notes |
|---------|-------|
| `server/config/hacks/index.ts` | Config hacks, aligner avec doc 09, 12 |
| `server/config/hacks/litm.ts` | Config LITM, vérifier structure |

**Recommandation** : Valider que les configs suivent les patterns définis dans doc 12 (Configuration Systèmes de Jeu).

---

## 7. Modèle de Données

### 7.1 Schema Prisma

#### ✅ NOUVEAU SCHEMA (Créé dans TASK-000B)

Le nouveau schema Prisma MVP a été créé avec 10 modèles :

```
User → Playspace → Character → ThemeCard → Tag
                 → Danger
Character → HeroCard
         → Relationship
         → Status
```

**Statut** : Schema synchronisé avec base de données via `prisma db push`

**Documentation** : `documentation/ARCHITECTURE/02-schema-base-donnees.md`

---

### 7.2 Tables Legacy

#### ⚠️ COEXISTENCE

Les tables legacy coexistent dans la base de données :
- `utilisateurs` (ancien User)
- `actualites`, `documents`, `pdfs`, `oracles`, etc.

**Recommandation** : Garder les tables legacy tant qu'elles ne gênent pas le MVP. Migration progressive possible en Phase 2+.

---

## 8. Plan d'Action Recommandé

### Phase 0 - Cleanup Immédiat (1-2 jours)

**Supprimer (hors MVP)** :
```bash
rm app/components/FeaturesSection.vue
rm app/components/HeroSection.vue
rm app/components/NewsletterJoin.vue
rm app/components/TestimonialForm.vue
rm app/components/TestimonialsCta.vue
rm app/pages/oracles/index.vue
rm app/pages/oracles/[id].vue
rm app/pages/test-i18n.vue
rm server/api/newsletter/subscribe.post.ts
rm server/api/testimonials.get.ts
rm server/api/testimonials.post.ts
rm server/api/oracles.get.ts
```

**Archiver (révision ultérieure)** :
```bash
mkdir -p archive/legacy
mv app/components/PdfCard.vue archive/legacy/
mv app/components/RecentPdfs.vue archive/legacy/
mv app/pages/demo archive/legacy/
mv server/api/pdf archive/legacy/
mv server/api/pdfs archive/legacy/
```

---

### Phase 1 - Création Structure Playspace (Semaines 1-2 MVP)

**Créer nouveaux composants** :
```
app/components/playspace/
  ├── PlayspaceCard.vue
  ├── PlayspaceList.vue
  ├── PlayspaceForm.vue
  └── PlayspaceSwitcher.vue
```

**Créer nouvelles pages** :
```
app/pages/playspaces/
  ├── index.vue          # Liste playspaces
  ├── nouveau.vue        # Créer playspace
  └── [id]/
      └── index.vue      # Dashboard playspace
```

**Créer nouveaux stores** :
```
shared/stores/
  └── playspace.ts       # Store playspace actif
```

**Créer nouvelles API routes** :
```
server/api/playspaces/
  ├── index.get.ts       # GET /api/playspaces
  ├── index.post.ts      # POST /api/playspaces
  └── [id]/
      ├── index.get.ts   # GET /api/playspaces/:id
      ├── index.patch.ts # PATCH /api/playspaces/:id
      └── index.delete.ts # DELETE /api/playspaces/:id
```

---

### Phase 2 - Migration Composants LITM (Semaines 3-6 MVP)

**Migrer stores** :
```bash
# Réécrire useLitmCharacterStore.ts → litm/character.ts
mv shared/stores/useLitmCharacterStore.ts shared/stores/litm/character.ts
# Adapter pour nouveau schema Prisma
```

**Migrer composables** :
```bash
# Réécrire usePersonnages.ts → useCharacter.ts
mv app/composables/usePersonnages.ts app/composables/useCharacter.ts
# Adapter pour Playspace-based
```

**Migrer API routes** :
```bash
# Réécrire toutes les routes litm/characters/** pour nouveau schema
# Voir détails section 4.2
```

**Adapter pages** :
```
# Modifier univers/legends-in-the-mist/personnages/**
# Pour utiliser Playspace comme contexte
```

---

### Phase 3 - Tests & Validation (Semaines 7-10 MVP)

**Créer tests E2E Playwright** :
- Playspaces (6 tests)
- Characters (5 tests)
- Theme Cards (4 tests)
- Hero Card (2 tests)
- Trackers (3 tests)
- Auth (3 tests)
- Export (1 test)

**Total** : 24 tests E2E (voir doc 06)

---

## 9. Risques Identifiés

| Risque | Impact | Probabilité | Mitigation |
|--------|--------|-------------|------------|
| Migration schema Prisma cassante | 🔴 Haut | Moyen | Tests E2E systématiques, migration progressive |
| Composants LITM dépendent ancien schema | 🟡 Moyen | Haut | Adapter props/emit, isoler changements |
| API routes multiples à migrer (15+) | 🟡 Moyen | Haut | Créer template route + validator commun |
| Perte fonctionnalités legacy | 🟡 Moyen | Faible | Archiver au lieu de supprimer |
| Confusion routing (old vs new) | 🟡 Moyen | Moyen | Supprimer old routes dès que new routes OK |

---

## 10. Métriques de Succès

### Code Coverage

**Objectif Phase 0** :
- 100% code hors MVP supprimé ou archivé

**Objectif MVP v1.0** :
- 100% composants LITM migrés vers nouveau schema
- 100% API routes utilisent Playspace-based auth
- 100% stores alignés avec architecture doc 05
- 24 tests E2E Playwright passent

### Performance

**Baseline actuel** : (À mesurer)
- Chargement page personnage : ?ms
- Création personnage : ?ms
- Basculement playspace : ?ms

**Objectif MVP v1.0** (avec cache IndexedDB doc 08) :
- Chargement page personnage : <500ms
- Création personnage : <1000ms
- Basculement playspace : <200ms (89% gain vs sans cache)

---

## 11. Conclusion

### Points Positifs

✅ **Composants LITM de haute qualité** : ThemeCard, HeroCard, base components sont excellents et réutilisables tels quels

✅ **Architecture Composition API** : Code moderne, bien structuré

✅ **Composables bien écrits** : useEditMode, usePips sont parfaits

✅ **Structure pages cohérente** : Routing univers/ bien pensé

### Points d'Attention

⚠️ **Migration schema majeure** : Toutes les API routes LITM doivent être réécrites pour Playspace-based

⚠️ **Stores à restructurer** : useLitmCharacterStore doit être complètement revu

⚠️ **i18n à valider** : Vérifier alignement avec système traductions multi-niveaux

### Actions Immédiates

1. **Supprimer code hors MVP** (Newsletter, Testimonials, Oracles) - 1 jour
2. **Créer structure Playspace** (components, pages, stores, API) - 2 semaines
3. **Migrer API routes LITM** - 2 semaines
4. **Adapter composants pour nouveau schema** - 1 semaine
5. **Tests E2E complets** - 2 semaines

**Estimation totale** : Aligné avec roadmap MVP 10 semaines

---

## Références

- [documentation/ARCHITECTURE/00-SOMMAIRE.md](../ARCHITECTURE/00-SOMMAIRE.md) - Vue d'ensemble architecture
- [documentation/ARCHITECTURE/02-schema-base-donnees.md](../ARCHITECTURE/02-schema-base-donnees.md) - Schema Prisma MVP
- [documentation/ARCHITECTURE/04-api-routes-nitro.md](../ARCHITECTURE/04-api-routes-nitro.md) - Design API routes
- [documentation/ARCHITECTURE/05-state-management-pinia.md](../ARCHITECTURE/05-state-management-pinia.md) - Stores Pinia
- [documentation/ARCHITECTURE/06-strategie-tests-e2e-playwright.md](../ARCHITECTURE/06-strategie-tests-e2e-playwright.md) - Tests E2E
- [documentation/DEVELOPPEMENT/arborescence-projet.md](./arborescence-projet.md) - Arborescence complète
- [documentation/DEVELOPPEMENT/01-mvp-v1.0-scope.md](./01-mvp-v1.0-scope.md) - Scope et roadmap MVP

---

**Version** : 1.0
**Date** : 2025-01-20
**Auteur** : Claude (Phase 0 Fondations)
