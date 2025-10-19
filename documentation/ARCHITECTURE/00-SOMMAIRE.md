# Documentation Architecture - Brumisa3 MVP v1.0

## Vue d'ensemble

Cette documentation compile l'analyse de 5 repositories open-source City of Mist / Legends in the Mist et propose une architecture adaptée au **MVP v1.0 de Brumisa3** avec notre stack Nuxt 4.

**Scope MVP v1.0** : Playspaces + Gestion personnages LITM (Theme Cards, Hero Card, Trackers) + Auth + Export JSON

**Hors MVP v1.0** : Investigation Board (v2.0), Oracles customs (v1.2+), Jets de dés (v1.3), Multi-joueurs (v2.5)

## Fichiers de Documentation

### [01-analyse-repos-city-of-mist.md](./01-analyse-repos-city-of-mist.md)
**Analyse comparative des 5 repositories**

Contenu:
- Comparaison des stacks technologiques
- Identification des patterns architecturaux réutilisables
- Tableaux de comparaison
- Recommandations par priorité

Repositories analysés:
1. `taragnor/city-of-mist` - Système FoundryVTT officieux (TypeScript)
2. `Altervayne/characters-of-the-mist` - App standalone Next.js
3. `mikerees/litm-player` - Serveur multi-joueurs Node.js
4. `mordachai/investigation-board` - Module FoundryVTT
5. `mordachai/mist-hud` - HUD amélioré FoundryVTT

### [02-modele-donnees-prisma.md](./02-modele-donnees-prisma.md)
**Schéma Prisma complet pour PostgreSQL**

Contenu:
- Modèle de données inspiré de l'architecture Actor-Item de FoundryVTT
- Schéma Prisma avec tous les enums et relations
- Optimisations de performance (index, requêtes)
- Exemples de migrations et seed data
- Stratégies pour éviter les N+1 queries

Tables principales:
- User, Session (authentification)
- Character, Theme, Tag, Improvement
- Status, Move, RollHistory
- HeroCard, ThemeCard, Tracker (LitM specific)
- Themebook (catalogue)

### [03-architecture-composants-vue.md](./03-architecture-composants-vue.md)
**Architecture des composants Vue 3**

Contenu:
- Structure modulaire des composants
- Exemples détaillés de composants clés:
  - `CharacterSheet.vue` - Fiche complète
  - `ThemeCard.vue` - Carte de thème
  - `TagItem.vue` - Tag réutilisable
  - `RollDialog.vue` - Dialog de jet de dés
- Composables réutilisables:
  - `useCharacter()` - Chargement personnage
  - `useRollModifiers()` - Gestion sélection tags/statuts
  - `useDiceRoll()` - Exécution des jets
  - `useThemeProgression()` - Progression des thèmes
- Stratégies de performance (lazy loading, virtual scrolling)

### [04-api-routes-nitro.md](./04-api-routes-nitro.md)
**Design des API routes Nitro**

Contenu:
- Structure RESTful complète
- Middleware d'authentification
- Utilitaires (Prisma singleton, validation Zod, gestion erreurs)
- Exemples détaillés:
  - CRUD personnages avec pagination
  - Route de jet de dés avec enregistrement
  - Routes thèmes (attention, améliorations)
  - Caching stratégique pour themebooks
- Logging modulaire pour debugging
- Tests avec Vitest

### [05-state-management-pinia.md](./05-state-management-pinia.md)
**State management avec Pinia**

Contenu:
- Architecture des stores modulaires
- Exemples de stores:
  - `auth.ts` - Authentification
  - `characters.ts` - Gestion personnages avec optimistic updates
  - `rolls.ts` - Jets et historique (v1.3+)
  - `ui.ts` - État UI éphémère (modals, sidebars)
  - `preferences.ts` - Préférences persistées (localStorage)
- Patterns d'utilisation dans les composants
- Optimistic updates avec rollback
- Tests E2E avec Playwright
- Bonnes pratiques de performance

### [06-strategie-tests-e2e-playwright.md](./06-strategie-tests-e2e-playwright.md)
**Stratégie de tests 100% End-to-End avec Playwright**

Contenu:
- Philosophie : 100% tests E2E (pas de tests unitaires)
- Pourquoi Playwright pour Nuxt 4 ?
- Installation et configuration complète
- Structure des tests par fonctionnalité
- Patterns de tests E2E (création personnage, basculement playspace, parcours utilisateur)
- Helpers et fixtures (auth, database reset)
- Bonnes pratiques (sélecteurs stables, attentes explicites)
- Commandes npm et CI/CD
- Liste des 24 tests E2E pour MVP v1.0

Tests couverts:
- Playspaces (6 tests)
- Characters (5 tests)
- Theme Cards (4 tests)
- Hero Card (2 tests)
- Trackers (3 tests)
- Auth (3 tests)
- Export (1 test)

### [07-adaptation-brumisa3-mvp.md](./07-adaptation-brumisa3-mvp.md)
**Adaptation au MVP réel de Brumisa3 v1.0**

Contenu:
- Clarification hiérarchique : Système (Mist Engine) → Hack (LITM) → Univers (Chicago)
- Scope MVP vs Analyse repositories (tableaux comparatifs)
- Adaptation des 6 patterns identifiés au MVP réel
- Modèle de données Prisma simplifié (sans Investigation Board)
- API routes simplifiées (21 routes pour MVP)
- Composants Vue simplifiés (20 composants pour MVP)
- Stores Pinia simplifiés (3 stores pour MVP)
- Roadmap d'implémentation MVP (10 semaines)

Fonctionnalités reportées:
- Investigation Board → v2.0
- Oracles customs → v1.2+
- Système de jets → v1.3
- Drawer System → v1.4
- Undo/Redo → v1.1
- Multi-joueurs WebSocket → v2.5

### [08-caching-indexeddb-donnees-statiques.md](./08-caching-indexeddb-donnees-statiques.md)
**Stratégie de caching IndexedDB pour données statiques**

Contenu:
- Justification technique (pourquoi IndexedDB vs localStorage)
- Architecture complète avec schéma IndexedDB
- Composable useStaticData() avec code complet
- Stratégie Stale-While-Revalidate (SWR)
- API routes avec versioning
- Mode offline (v1.2+) avec queue de sync
- PWA complet (v2.0+) avec Service Worker
- Tests E2E Playwright pour cache
- Benchmarks performance (89-98% gains)

Données cachées (MVP v1.0):
- Systems (Mist Engine)
- Hacks (LITM, Otherscape)
- Universes par défaut (Chicago, Londres)
- Themebooks LITM
- Oracles fixes (généraux + hack)

Gains attendus:
- Basculement playspace : 1800ms → 200ms (89% plus rapide)
- Chargement oracles : 400ms → 10ms (97% plus rapide)
- Support offline complet (consultation + édition)

### [09-architecture-multi-systemes-mist-engine.md](./09-architecture-multi-systemes-mist-engine.md)
**Architecture Multi-Systèmes Mist Engine**

Contenu:
- Analyse détaillée du système Taragnor (city-of-mist)
- Architecture modulaire orientée objet (Factory + Registry pattern)
- Interface système (SystemModuleI) et types de thèmes
- Configuration par défaut pour LITM, City of Mist, Otherscape
- Implémentation technique complète:
  - Schéma Prisma étendu (table System)
  - Types TypeScript (`SystemConfig`, `ThemeTypeConfig`, etc.)
  - Composable `useSystemConfig()` pour accès config
  - Store Pinia `systemStore` pour gestion système actif
  - API routes pour récupération config
  - Seed DB avec 3 systèmes
- Utilisation dans composants Vue (exemple `ThemeCard.vue`)
- Intégration PDF multi-systèmes (layouts spécifiques)
- Roadmap d'implémentation (8 semaines)
- Comparaison Taragnor vs Brumisater

Configuration incluse:
- **LITM**: Origin/Adventure/Greatness/Fellowship/Backpack, milestones
- **City of Mist**: Mythos/Mist/Logos/Crew/Loadout/Extra, attention
- **Otherscape**: Mythos-OS/Noise/Self/Crew-OS/Loadout, upgrade/decay

Avantages:
- Extensibilité (nouveau système = 1 fichier config)
- Type Safety (TypeScript strict end-to-end)
- Performance (cache IndexedDB, SWR)
- Maintenabilité (config déclarative vs code)
- Cohérence (terminologie, PDF, UX adaptés)

### [10-analyse-mist-hud-interface-donnees.md](./10-analyse-mist-hud-interface-donnees.md)
**Analyse Mist HUD - Interface et Données**

Contenu:
- Analyse complète du module Mist HUD de Mordachai pour Foundry VTT
- Architecture de stockage Actor-Item (Character/Danger avec Items: Theme, Tag, Status, Improvement)
- Extraction de données avec fonctions getter:
  - `getThemesAndTags()` - Récupération thèmes et tags groupés
  - `getPowerTags()` / `getWeaknessTags()` - Filtrage par type avec subtags
  - `applyBurnState()` - Gestion des états de burn (unburned/toBurn/burned)
  - `getMysteryFromTheme()` - Mystery/Quest/Ritual par système
  - `getActorStatuses()` - Statuses avec tier 1-6
  - `getImprovements()` - Groupés par themebook
  - `getJuiceAndClues()` - Help/Hurt/Clues (City of Mist)
  - `getEssence()` - Calcul essence (Otherscape)
- Présentation visuelle détaillée:
  - HUD Personnages (mh-hud.hbs) avec Move Buttons, Themes, Loadout, Story Tags, Statuses, Crew, Right Panel
  - HUD Dangers (npc-hud.hbs) avec Spectrums/Limits, Tags/Statuses, Collective Size, Threats/Consequences
  - États interactifs: Burn (3 états), Inversion (weakness), Selection, Status Polarity
- Fonctionnalités clés:
  - Drag & Drop (tags/statuses sur tokens, moves vers hotbar)
  - Quick Roll avec sélection tags/statuses
  - Burning Tags (workflow complet)
  - Help & Hurt avec activation checkbox (CoM)
  - NPC Influence Viewer
  - Milestones système (LITM)
- Interactions API Foundry VTT (lecture, modification, flags, hooks)
- Recommandations complètes pour Brumisater:
  - Schéma Prisma étendu (Character, Theme, Tag, Status, Improvement avec enums et relations)
  - API route `/api/characters/[id]/select-tags.post.ts` pour persistance sélection
  - Composable `useTagSelection()` avec gestion complète (toggle, burn, inversion, calcul modificateurs)
  - Composants Vue: `ThemeCardInteractive.vue`, `StatusList.vue`, `DangerCard.vue`
  - Tests E2E Playwright pour sélection tags, burn state, inversion, polarité statuses

Données analysées:
- Templates Handlebars (30 KB total)
- Scripts JavaScript (175+ KB total)
- 800+ lignes de getter functions
- Actor-Item model complet avec flags et relations

Patterns identifiés:
- État de sélection éphémère (Map<id, tag>)
- Calcul modificateurs (+1 power, -1/+1 weakness, ±tier statuses)
- Burn workflow (unburned → toBurn → burned)
- Polarité cyclique pour statuses (neutral → positive → negative)
- Groupement par themebook pour improvements
- Essence dynamique calculée (Otherscape)

## Synthèse des Patterns Identifiés

### Pattern 1: Modèle Actor-Item (FoundryVTT)
**Source**: `taragnor/city-of-mist`

Architecture hiérarchique:
```
Actor (Character/Danger/Crew)
  └─ Items (Theme, Tag, Status, Move, etc.)
```

**Adaptation Nuxt 4**: Schéma Prisma avec relations 1-N via foreign keys

### Pattern 2: State avec Undo/Redo
**Source**: `Altervayne/characters-of-the-mist`

Zustand + temporal middleware pour historique complet.

**Adaptation Nuxt 4**: Pinia + VueUse `useRefHistory()` (50 étapes)

### Pattern 3: Sélection de Tags/Statuts
**Source**: `taragnor/city-of-mist` + `mordachai/mist-hud`

Système de sélection avec polarité (+1/-1/0) pour modificateurs de jets.

**Adaptation Nuxt 4**: Composable `useRollModifiers()` avec state réactif

### Pattern 4: Système de Fichiers/Drawer
**Source**: `Altervayne/characters-of-the-mist`

Organisation des personnages en dossiers avec drag & drop.

**Adaptation Nuxt 4**: Composable + API routes + table Folder en DB

### Pattern 5: Jets de Dés avec Historique
**Source**: Tous les repositories

Génération 2d6, calcul outcome, enregistrement historique.

**Adaptation Nuxt 4**:
- API route `/api/rolls/execute` (serveur pour aléatoire sécurisé)
- Table `RollHistory` avec relations
- Store Pinia pour cache local (50 derniers jets)

### Pattern 6: WebSocket Temps Réel
**Source**: `mikerees/litm-player`

Socket.io pour synchronisation multi-joueurs.

**Adaptation Nuxt 4**: WebSockets Nitro (h3) - Priorité basse, pour v2

## Roadmap d'Implémentation MVP v1.0

### Phase 1 - Fondations (2 semaines)
- [ ] Setup Nuxt 4 + Prisma + PostgreSQL
- [ ] Schema Prisma MVP (User, Playspace, Character, ThemeCard, HeroCard, Trackers)
- [ ] Migration initiale
- [ ] Authentification @sidebase/nuxt-auth (mode guest + compte)
- [ ] Layout de base (UnoCSS)

### Phase 2 - Playspaces (2 semaines)
- [ ] CRUD Playspaces (API routes Nitro)
- [ ] Store Pinia playspace
- [ ] Composants Playspace (formulaire, liste, switcher)
- [ ] Tests E2E Playwright (création, basculement)

### Phase 3 - Characters LITM (4 semaines)
- [ ] CRUD Characters (API routes)
- [ ] Store Pinia character
- [ ] Composants Character (formulaire, liste, détail)
- [ ] Theme Cards CRUD (Power/Weakness tags, Attention)
- [ ] Hero Card CRUD (Relations, Quintessences)
- [ ] Trackers CRUD (Status, Story Tag, Story Theme)
- [ ] Tests E2E Playwright (création, édition, suppression)

### Phase 4 - Polish & Export (2 semaines)
- [ ] Export JSON personnages
- [ ] Validation Zod complète côté serveur
- [ ] Messages d'erreur UX
- [ ] Loading states et optimistic UI
- [ ] Tests E2E complets (24 tests)
- [ ] Documentation utilisateur

**Total MVP v1.0** : 10 semaines (2.5 mois)

### Versions Futures (Hors MVP)

**v1.1** (Amélioration UX - 2-3 semaines)
- Dark mode
- Mobile responsive
- Undo/Redo (VueUse)
- Raccourcis clavier

**v1.3** (Système de Jets - 2 semaines)
- Jets de dés avec API route sécurisée
- Historique des jets
- Sélection tags/statuts avec modificateurs

**v1.4** (Drawer System - 2-3 semaines)
- Organisation multi-personnages avec dossiers
- Drag & drop

**v2.0** (Investigation Board - 4-5 semaines)
- Canvas interactif (Konva.js)
- Notes et connexions
- Mode solo fonctionnel

**v2.5** (Multi-joueurs - 6-8 semaines)
- WebSocket Nitro (h3)
- Sessions de jeu temps réel
- Investigation Board collaboratif

## Stack Technique Finale

| Layer | Technologie | Justification |
|-------|-------------|---------------|
| **Frontend** | Vue 3 Composition API | Moderne, performant, typed |
| **Framework** | Nuxt 4 | SSR, routing, optimisations |
| **State** | Pinia | Official Vue state manager |
| **Backend** | Nitro Server | Intégré Nuxt, performant |
| **Database** | PostgreSQL + Prisma | Type-safe, relations complexes |
| **Styling** | UnoCSS | Atomic CSS, performant |
| **Types** | TypeScript | Type safety end-to-end |
| **PDF** | PDFKit | Généré programmatiquement |
| **Auth** | @sidebase/nuxt-auth | Sessions sécurisées |

## Différences Clés avec FoundryVTT

### FoundryVTT (taragnor)
- NeDB (embedded NoSQL)
- Handlebars templates
- jQuery pour DOM
- Actor/Item documents
- Hooks système

### Notre Stack (Nuxt 4)
- PostgreSQL (relationnel)
- Vue SFC (Single File Components)
- Composition API réactive
- Prisma models relationnels
- Composables Vue

## Points d'Attention

### Performance
- **Index DB**: Toutes les colonnes fréquemment requêtées indexées
- **Pagination**: Systématique pour listes > 20 items
- **Caching**: `defineCachedEventHandler` pour données statiques
- **Lazy Loading**: Composants lourds chargés à la demande
- **Virtual Scrolling**: Pour historique de jets (>100 items)

### Sécurité
- **Validation**: Zod schemas pour tous les inputs API
- **Auth**: Middleware sur toutes les routes (sauf publiques)
- **Ownership**: Vérification userId sur toutes les opérations
- **SQL Injection**: Prisma protège automatiquement
- **XSS**: Vue échappe automatiquement le HTML

### Maintenabilité
- **TypeScript strict**: Types end-to-end
- **Composables**: Logique réutilisable
- **Tests**: Playwright E2E (100% coverage fonctionnelle)
- **Logging**: Structuré, contextuel, performance tracking
- **Documentation**: Inline + fichiers markdown

## Ressources et Références

### Repositories Analysés
- [taragnor/city-of-mist](https://github.com/taragnor/city-of-mist)
- [Altervayne/characters-of-the-mist](https://github.com/Altervayne/characters-of-the-mist)
- [mikerees/litm-player](https://github.com/mikerees/litm-player)
- [mordachai/investigation-board](https://github.com/mordachai/investigation-board)
- [mordachai/mist-hud](https://github.com/mordachai/mist-hud)

### Documentation Technique
- [Nuxt 4 Documentation](https://nuxt.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Pinia Documentation](https://pinia.vuejs.org/)
- [VueUse Documentation](https://vueuse.org/)

### Règles du Jeu
- [Legends in the Mist Official](https://www.sonofoak.com/legends-in-the-mist)
- [City of Mist Official](https://www.cityofmist.co/)

## Maintenance de cette Documentation

Cette documentation doit être mise à jour lors de:
- Découverte de nouveaux patterns pertinents
- Modifications majeures de l'architecture
- Ajout de nouvelles fonctionnalités complexes
- Retours d'expérience d'implémentation

Dernière mise à jour: 2025-01-19 (Adaptation MVP v1.0 Brumisa3)
