# Audit du Code Existant - Brumisa3

**Date de l'audit**: 2025-01-20
**Auditeur**: Claude
**Version**: 1.0
**Projet**: Brumisa3 - Générateur de fiches de personnages JDR

---

## Résumé Exécutif

Cet audit a analysé **27 composants Vue**, **7 composables**, **6 stores Pinia**, et **15 pages** du projet Brumisa3. Le projet présente une architecture cohérente avec des composants LITM (Legends in the Mist) bien structurés, mais révèle également :

- **Code mort identifié** : `usePdf.ts` et `pdf.ts` (génération PDF legacy)
- **Doublon potentiel** : `personnages.ts` et `useLitmCharacterStore.ts` (à clarifier)
- **Fonctionnalités manquantes critiques** : Système de Playspace (pages, composable, store)
- **Système i18n** : `useI18nLitm.ts` à clarifier avec le nouveau système global

**État global** : Le code est de bonne qualité, bien documenté, avec des patterns cohérents. Nécessite un nettoyage ciblé et l'ajout du système Playspace pour le MVP.

---

## Composants Vue

### Composants UI Génériques (app/components/ui/)

| Composant | Statut | Description | Utilisation |
|-----------|--------|-------------|-------------|
| `UiButton.vue` | Production | Bouton générique avec variantes | Utilisé dans formulaires auth, LITM |
| `UiInput.vue` | Production | Champ de saisie générique | Formulaires auth, édition |
| `UiSelect.vue` | Production | Menu déroulant générique | Sélection système, filtres |
| `UiTextarea.vue` | Production | Zone de texte multiligne | Descriptions, notes |

**Verdict** : Ces composants sont **essentiels** et **bien utilisés**. Aucun nettoyage nécessaire.

---

### Composants LITM Base (app/components/litm/base/)

| Composant | Statut | Description | Dépendances | Notes |
|-----------|--------|-------------|-------------|-------|
| `CardBase.vue` | Production | Carte de base avec face avant/arrière | - | Utilisé par ThemeCard et HeroCard |
| `EditableTag.vue` | Production | Tag éditable (power/weakness) | `useEditMode` | Utilisé dans ThemeCard |
| `LitmButton.vue` | Production | Bouton stylisé LITM | - | Variantes primary/secondary/danger/ghost |
| `PipIndicator.vue` | Production | Indicateur de progression (pips) | `usePips` | Utilisé dans QuestPanel et Trackers |
| `EditModeToggle.vue` | Production | Toggle mode édition/lecture | `useEditMode` | Présent sur pages personnages |
| `FlipCard.vue` | Prototype | Carte retournable (flip animation) | - | Non utilisé actuellement |

**Verdict** :
- `CardBase`, `EditableTag`, `LitmButton`, `PipIndicator`, `EditModeToggle` : **Production**, bien intégrés
- `FlipCard.vue` : **Prototype** non utilisé. À évaluer si nécessaire pour MVP ou suppression.

---

### Composants LITM Fonctionnels (app/components/litm/)

| Composant | Statut | Description | Dépendances | Utilisation |
|-----------|--------|-------------|-------------|-------------|
| `ThemeCard.vue` | Production | Carte de thème complète (Origin/Fellowship/Expertise/Mythos) | `CardBase`, `EditableTag`, `QuestPanel`, `useEditMode`, `useI18nLitm` | Pages personnages LITM, démo |
| `HeroCard.vue` | Production | Carte de héros avec backstory, relationships, quintessences | `CardBase`, `RelationshipList`, `QuintessenceList`, `BackpackList`, `useEditMode`, `useI18nLitm` | Pages personnages LITM, démo |
| `QuestPanel.vue` | Production | Panneau de quête avec texte et pips | `PipIndicator`, `useEditMode` | Utilisé dans ThemeCard |
| `TrackerList.vue` | Production | Liste de trackers (status/storyTag/storyTheme) | `PipIndicator`, `useEditMode` | Pages personnages LITM |
| `RelationshipList.vue` | Production | Liste de relations (compagnons) | `useEditMode` | Utilisé dans HeroCard |
| `QuintessenceList.vue` | Production | Liste de quintessences | `useEditMode` | Utilisé dans HeroCard |
| `BackpackList.vue` | Production | Liste d'objets du sac à dos | `useEditMode` | Utilisé dans HeroCard |

**Verdict** : Tous les composants fonctionnels LITM sont **Production** et **complets**. Architecture bien structurée.

---

### Composants Pages Landing (app/components/)

| Composant | Statut | Description | Utilisation |
|-----------|--------|-------------|-------------|
| `HeroSection.vue` | Production | Section hero page d'accueil | Page index |
| `FeaturesSection.vue` | Production | Section features page d'accueil | Page index |
| `TestimonialsCta.vue` | Production | Section témoignages + CTA | Page index |
| `NewsletterJoin.vue` | Production | Formulaire newsletter | Page index |
| `TestimonialForm.vue` | Prototype | Formulaire soumission témoignage | Non utilisé actuellement |
| `SystemCards.vue` | Production | Grille de cartes systèmes JDR | Page index |
| `SystemCard.vue` | Production | Carte individuelle système JDR | Utilisé dans SystemCards |
| `PdfCard.vue` | Prototype | Carte PDF généré (historique) | Non utilisé (legacy PDF) |
| `RecentPdfs.vue` | Prototype | Liste PDFs récents | Non utilisé (legacy PDF) |

**Verdict** :
- Landing page : **Production**, fonctionnels
- `TestimonialForm.vue`, `PdfCard.vue`, `RecentPdfs.vue` : **Prototype/Legacy**, liés au système PDF abandonné. À supprimer si hors MVP.

---

### Composants Sections (app/components/sections/)

| Composant | Statut | Description | Utilisation |
|-----------|--------|-------------|-------------|
| `HeroSystemeSection.vue` | Production | Hero section page système JDR | Pages systèmes |

**Verdict** : Production, fonctionnel.

---

## Composables

### Composables Existants

| Composable | Statut | Description | Utilisé dans | Notes |
|------------|--------|-------------|--------------|-------|
| `useAuth.ts` | Production | Authentification (login/register/logout) | Pages auth, dashboard, middleware | Complet, fonctionnel |
| `usePersonnages.ts` | Production | CRUD personnages génériques (multi-systèmes) | Pages personnages, store personnages | Utilisé mais **doublon potentiel** avec `useLitmCharacterStore` |
| `useSystemes.ts` | Production | Liste des systèmes JDR disponibles | Pages systèmes, dashboard | Fonctionnel |
| `useI18nLitm.ts` | Production | Helpers i18n LITM (traductions) | Composants LITM | À clarifier avec système i18n global (TASK-024) |
| `usePdf.ts` | Mort | Génération PDF legacy (PDFKit v1) | Tests, docs, plugins | **Code mort - À supprimer** |
| `useEditMode.ts` | Production | Gestion mode édition/lecture | Composants LITM | Fonctionnel, essentiel |
| `usePips.ts` | Production | Gestion logique pips (trackers, quêtes) | PipIndicator, Trackers | Fonctionnel |

### Composables Manquants (Critiques pour MVP)

| Composable | Priorité | Description | Raison |
|------------|----------|-------------|--------|
| `usePlayspace.ts` | CRITIQUE | Gestion du playspace actif (contexte global) | Bloque toutes les features playspace |
| `useThemeCard.ts` | HAUTE | Logique métier ThemeCard (extraction du composant) | Améliore maintenabilité |
| `useHeroCard.ts` | MOYENNE | Logique métier HeroCard (extraction du composant) | Améliore maintenabilité |

**Verdict** :
- **Production** : `useAuth`, `usePersonnages`, `useSystemes`, `useEditMode`, `usePips`, `useI18nLitm`
- **Mort** : `usePdf.ts` à supprimer (génération PDF legacy)
- **Manquants critiques** : `usePlayspace.ts` bloque MVP

---

## Stores Pinia

### Stores Existants

| Store | Statut | Description | Utilisé dans | Notes |
|-------|--------|-------------|--------------|-------|
| `auth.ts` | Production | État utilisateur connecté, tokens | Middleware, pages auth | Fonctionnel |
| `systemes.ts` | Production | Liste systèmes JDR disponibles | Pages systèmes, dashboard | Fonctionnel |
| `ui.ts` | Production | État global UI (modales, notifications) | Layout, composants UI | Fonctionnel |
| `useLitmCharacterStore.ts` | Production | Personnages LITM (themeCards, heroCard, trackers) | Pages LITM, tests | **Complet, bien structuré** |
| `personnages.ts` | Production | Personnages génériques (délègue à `usePersonnages`) | Pages personnages génériques | **Doublon potentiel ?** |
| `pdf.ts` | Mort | Génération PDF legacy (historique, progress) | Plugins, tests, docs | **Code mort - À supprimer** |

### Stores Manquants (Critiques pour MVP)

| Store | Priorité | Description | Raison |
|-------|----------|-------------|--------|
| `playspace.ts` | CRITIQUE | Playspace actif, liste playspaces utilisateur | Bloque toutes les features playspace |
| `litm/character.ts` | MOYENNE | État personnage LITM en cours d'édition (optimisation) | Améliore performance (déjà dans `useLitmCharacterStore`) |

**Verdict** :
- **Production** : `auth`, `systemes`, `ui`, `useLitmCharacterStore`
- **Doublon à clarifier** : `personnages.ts` vs `useLitmCharacterStore.ts` - Le premier délègue au composable, le second gère directement l'état. **À fusionner ou clarifier les responsabilités.**
- **Mort** : `pdf.ts` à supprimer
- **Manquant critique** : `playspace.ts` bloque MVP

---

## Pages et Routes

### Pages Authentification (app/pages/auth/)

| Page | Statut | Description | Middleware | Notes |
|------|--------|-------------|------------|-------|
| `/auth/login` | Production | Connexion utilisateur | guest | Fonctionnelle |
| `/auth/register` | Production | Inscription utilisateur | guest | Fonctionnelle |
| `/auth/forgot-password` | Prototype | Réinitialisation mot de passe | guest | Backend manquant |

**Verdict** : Login/Register en production. Forgot-password en prototype (hors MVP probablement).

---

### Pages Playspaces (MANQUANT CRITIQUE)

| Page | Statut | Description | Priorité |
|------|--------|-------------|----------|
| `/playspaces` | Manquant | Liste playspaces utilisateur | CRITIQUE |
| `/playspaces/nouveau` | Manquant | Créer un playspace | CRITIQUE |
| `/playspaces/[id]` | Manquant | Dashboard playspace | CRITIQUE |

**Verdict** : **BLOQUEUR MVP** - Toutes les pages playspace sont manquantes.

---

### Pages LITM (app/pages/univers/legends-in-the-mist/personnages/)

| Page | Statut | Description | Middleware | Notes |
|------|--------|-------------|------------|-------|
| `/univers/legends-in-the-mist/personnages` | Production | Liste personnages LITM | auth | Fonctionnelle |
| `/univers/legends-in-the-mist/personnages/nouveau` | WIP | Créer personnage LITM | auth | Incomplet (manque save) |
| `/univers/legends-in-the-mist/personnages/[id]` | Production | Éditer personnage LITM | auth | Fonctionnelle (ThemeCard, HeroCard, Trackers) |

**Verdict** :
- Liste et édition : **Production**
- Création : **WIP** (manque sauvegarde finale)

---

### Pages Personnages Génériques (app/pages/personnages/)

| Page | Statut | Description | Middleware | Notes |
|------|--------|-------------|------------|-------|
| `/personnages` | Production | Liste personnages (tous systèmes) | auth | Fonctionnelle |
| `/personnages/nouveau` | Production | Créer personnage générique | auth | Fonctionnelle |

**Verdict** : Production, fonctionnelles.

---

### Pages Autres

| Page | Statut | Description | Notes |
|------|--------|-------------|-------|
| `/` (index) | Production | Page d'accueil landing | Fonctionnelle |
| `/dashboard` | Production | Dashboard utilisateur | Fonctionnelle |
| `/systemes/[slug]/[univers]` | Production | Page système JDR | Fonctionnelle |
| `/oracles/index` | Prototype | Liste oracles (hors MVP) | Fonctionnelle mais hors scope |
| `/oracles/[id]` | Prototype | Oracle individuel (hors MVP) | Fonctionnelle mais hors scope |
| `/demo/litm-components` | Démo | Démo composants LITM | **À garder pour dev** |
| `/test-i18n` | Démo | Test système i18n | **À garder pour dev** |

**Verdict** :
- Production : index, dashboard, systemes
- Oracles : Hors MVP (v1.2+)
- Démo : À garder en dev, exclure en production

---

## Patterns et Conventions Identifiés

### Bonnes Pratiques

1. **Nommage cohérent** :
   - Composants UI : `Ui*` (UiButton, UiInput)
   - Composants LITM : `Litm*` ou dans dossier `litm/`
   - Composables : `use*` (useAuth, useEditMode)
   - Stores : nom direct sans préfixe (auth, systemes)

2. **Organisation par domaine** :
   - `app/components/litm/base/` pour composants réutilisables LITM
   - `app/components/litm/` pour composants fonctionnels LITM
   - `app/composables/litm/` pour logique métier LITM

3. **Composition API cohérente** :
   - Utilisation de `<script setup lang="ts">`
   - Props typées avec interfaces TypeScript
   - Émission d'événements typés (`defineEmits<{ ... }>`)

4. **Documentation** :
   - Commentaires JSDoc sur composants et composables
   - Interfaces TypeScript exportées pour réutilisation

5. **Tests** :
   - Tests Playwright E2E (stratégie 100% E2E)
   - Tests stores Pinia existants (`useLitmCharacterStore.test.ts`)

### Anti-Patterns à Corriger

1. **Duplication store/composable** :
   - `personnages.ts` (store) délègue à `usePersonnages` (composable)
   - `useLitmCharacterStore.ts` (store) gère directement l'état
   - **Problème** : Incohérence d'architecture
   - **Solution** : Uniformiser (soit store délègue, soit store gère directement)

2. **Code mort** :
   - `usePdf.ts` et `pdf.ts` (génération PDF legacy)
   - `PdfCard.vue`, `RecentPdfs.vue` (composants legacy PDF)
   - **Solution** : Supprimer après confirmation MVP ne nécessite pas PDF

3. **i18n hybride** :
   - `useI18nLitm.ts` pour traductions LITM
   - Nouveau système i18n global en cours (TASK-024)
   - **Solution** : Clarifier la cohabitation ou migrer

4. **Composants prototype non utilisés** :
   - `FlipCard.vue` : Animation flip non utilisée
   - `TestimonialForm.vue` : Formulaire témoignage non implémenté
   - **Solution** : Supprimer ou finaliser selon MVP

---

## Recommandations de Refactoring

### Priorité CRITIQUE (Bloqueurs MVP)

| # | Tâche | Description | Dépendances | Impact |
|---|-------|-------------|-------------|--------|
| 1 | Créer `shared/stores/playspace.ts` | Store pour playspace actif, liste playspaces | - | Bloque toutes features playspace |
| 2 | Créer `app/composables/usePlayspace.ts` | Composable gestion playspace (CRUD) | - | Bloque navigation/contexte |
| 3 | Créer pages `/playspaces/*` | Liste, création, dashboard playspace | Stores/composables playspace | Bloque MVP |
| 4 | Fusionner `personnages.ts` + `useLitmCharacterStore.ts` | Clarifier architecture store (délégation vs direct) | - | Évite confusion dev |

### Priorité HAUTE (Qualité MVP)

| # | Tâche | Description | Dépendances | Impact |
|---|-------|-------------|-------------|--------|
| 5 | Supprimer `usePdf.ts` et `pdf.ts` | Code mort legacy génération PDF | Confirmation MVP | Réduit dette technique |
| 6 | Supprimer `PdfCard.vue`, `RecentPdfs.vue` | Composants legacy PDF | Confirmation MVP | Nettoyage codebase |
| 7 | Clarifier `useI18nLitm.ts` vs i18n global | Migration ou cohabitation système i18n | TASK-024 | Cohérence i18n |
| 8 | Compléter `/univers/.../personnages/nouveau` | Ajouter sauvegarde finale personnage | `useLitmCharacterStore` | Workflow complet |

### Priorité MOYENNE (Post-MVP)

| # | Tâche | Description | Dépendances | Impact |
|---|-------|-------------|-------------|--------|
| 9 | Créer `useThemeCard.ts` | Extraire logique ThemeCard.vue | - | Améliore maintenabilité |
| 10 | Créer `useHeroCard.ts` | Extraire logique HeroCard.vue | - | Améliore maintenabilité |
| 11 | Supprimer ou finaliser `FlipCard.vue` | Composant prototype non utilisé | Décision design | Nettoyage |
| 12 | Supprimer ou finaliser `TestimonialForm.vue` | Composant prototype non utilisé | Décision produit | Nettoyage |

### Priorité BASSE (Nice to Have)

| # | Tâche | Description | Dépendances | Impact |
|---|-------|-------------|-------------|--------|
| 13 | Ajouter tests Playwright pages playspace | Couverture E2E playspace | Pages playspace créées | Qualité |
| 14 | Ajouter tests unitaires composables critiques | Tests `usePlayspace`, `useThemeCard` | Composables créés | Qualité |
| 15 | Migrer `/auth/forgot-password` en production | Backend réinitialisation mot de passe | Décision produit | UX |

---

## Matrice de Dépendances

### Composants LITM → Dépendances

```
ThemeCard.vue
├── CardBase.vue
├── EditableTag.vue
├── QuestPanel.vue
│   └── PipIndicator.vue
│       └── usePips.ts
├── LitmButton.vue
├── useEditMode.ts
└── useI18nLitm.ts

HeroCard.vue
├── CardBase.vue
├── RelationshipList.vue
│   └── useEditMode.ts
├── QuintessenceList.vue
│   └── useEditMode.ts
├── BackpackList.vue
│   └── useEditMode.ts
├── LitmButton.vue
├── useEditMode.ts
└── useI18nLitm.ts

TrackerList.vue
├── PipIndicator.vue
│   └── usePips.ts
├── useEditMode.ts
└── useI18nLitm.ts
```

### Pages LITM → Stores

```
/univers/legends-in-the-mist/personnages/[id]
├── useLitmCharacterStore.ts
│   └── API /api/litm/characters/*
├── useEditMode.ts
└── Composants LITM (ThemeCard, HeroCard, TrackerList)
```

### Stores → Composables

```
personnages.ts (store)
└── usePersonnages.ts (composable)
    └── API /api/personnages/*

pdf.ts (store) [MORT]
└── usePdf.ts (composable) [MORT]
    └── API /api/pdf/* [LEGACY]

useLitmCharacterStore.ts (store)
└── API /api/litm/characters/* [DIRECT]
```

---

## Statistiques du Code

### Répartition par Type

| Type | Total | Production | Prototype | Mort | Manquant |
|------|-------|------------|-----------|------|----------|
| Composants Vue | 27 | 21 | 4 | 2 | 0 |
| Composables | 7 | 6 | 0 | 1 | 3 |
| Stores Pinia | 6 | 4 | 0 | 2 | 1 |
| Pages | 15 | 10 | 3 | 0 | 3 |

### Taux de Couverture MVP

- **Composants UI** : 100% (tous essentiels présents)
- **Composants LITM** : 100% (architecture complète)
- **Authentification** : 100% (login/register/logout)
- **Personnages LITM** : 90% (manque save nouveau personnage)
- **Playspaces** : 0% (CRITIQUE - tout à créer)

---

## Conclusion et Prochaines Étapes

### État Actuel

Le code existant est **de bonne qualité** avec :
- Architecture cohérente et modulaire
- Composants LITM bien structurés et réutilisables
- Tests E2E en place (stratégie Playwright)
- Documentation claire dans le code

### Points Bloquants MVP

1. **Playspaces** (0% fait) : Store, composable, et 3 pages manquantes
2. **Doublon architecture** : `personnages.ts` vs `useLitmCharacterStore.ts`
3. **Code mort** : `usePdf.ts`, `pdf.ts`, composants legacy PDF

### Actions Prioritaires

**Avant toute nouvelle feature** :

1. Créer système Playspace complet (store → composable → pages)
2. Nettoyer code mort (PDF legacy)
3. Clarifier architecture store/composable (fusion ou convention)
4. Compléter page création personnage LITM

**Ensuite** :

5. Clarifier système i18n (useI18nLitm vs global)
6. Supprimer composants prototype non utilisés
7. Ajouter tests E2E pages playspace

### Estimation Effort

- **Nettoyage code mort** : 2h
- **Système Playspace** : 8h (store + composable + 3 pages)
- **Fusion stores** : 3h (analyse + refactoring + tests)
- **Complétion création personnage** : 2h
- **Total critique** : **15h**

---

## Annexe : Commandes Utiles

### Rechercher usages d'un composable

```bash
grep -r "usePlayspace" app/
grep -r "usePdf" app/ shared/
```

### Lister composants non importés

```bash
# Composants dans app/components/ sans import
find app/components -name "*.vue" -exec basename {} \; | sort > /tmp/components.txt
grep -rh "import.*from.*components" app/ | grep -oP "(?<=components/).*(?=')" | sort | uniq > /tmp/imports.txt
comm -23 /tmp/components.txt /tmp/imports.txt
```

### Analyser taille bundle par composant

```bash
npx vite-bundle-visualizer
```

---

**Fin du rapport d'audit**

Date : 2025-01-20
Validé par : À valider par Product Owner et Technical Lead
