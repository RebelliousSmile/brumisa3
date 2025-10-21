# Intégration des Sites de Référence - Plan de Développement

## Vue d'Ensemble

Plan d'intégration des fonctionnalités provenant des repositories open-source de référence pour enrichir Brumisa3, en particulier pour supporter le **hack LITM du Mist Engine**.

**Hiérarchie** : Mist Engine (système) → LITM (hack) → Zamanora/HOR (univers)

**Scope MVP v1.0** : Voir [../ARCHITECTURE/00-GLOSSAIRE.md](../ARCHITECTURE/00-GLOSSAIRE.md) pour la terminologie officielle et [01-mvp-v1.0-scope.md](./01-mvp-v1.0-scope.md) pour le périmètre.

### Repositories de Référence

Les fonctionnalités documentées ici sont inspirées ou adaptées de :

- **Altervayne/characters-of-the-mist** (Next.js + TypeScript)
  - Gestionnaire de fiches de personnages
  - Traductions FR/EN complètes (35 000+ caractères)
  - Système de cartes de thème, suivis, drawer
  - License: CC BY-NC-SA 4.0

- **mikerees/litm-player** (Node.js + Socket.io)
  - Serveur de jeu multi-joueurs
  - Chat temps réel, lanceur de dés
  - License: MIT

**Note** : Ces repositories analysés dans [../ARCHITECTURE/01-analyse-repos-city-of-mist.md](../ARCHITECTURE/01-analyse-repos-city-of-mist.md) servent de référence pour les patterns et fonctionnalités, mais sont adaptés à notre stack Nuxt 4.

## Architecture Globale

```
Brumisa3 (Nuxt 4 + Prisma + PostgreSQL)
├── Phase 1: Configuration Playspace & Hack LITM (MVP v1.0)
├── Phase 2: Composants Fiche de Personnage LITM (MVP v1.0)
├── Phase 3: Export JSON (MVP v1.0)
├── Phase 4: Fonctionnalités Avancées (v1.1-v1.4)
└── Phase 5: Multi-Joueurs (v2.5 - Hors MVP)
```

**Note importante** : Conformément au scope MVP défini dans [01-mvp-v1.0-scope.md](./01-mvp-v1.0-scope.md) :
- **Investigation Board** : Reporté v2.0 (PAS dans MVP)
- **Système de jets** : Reporté v1.3 (PAS dans MVP)
- **Drawer System** : Reporté v1.4 (PAS dans MVP)
- **Undo/Redo** : Reporté v1.1 (PAS dans MVP)
- **Multi-joueurs** : Reporté v2.5 (PAS dans MVP)

## Crédits & Licences

Conformément aux licences des projets sources :
- **characters-of-the-mist** : Créé par Altervayne, CC BY-NC-SA 4.0
- **litm-player** : Créé par mikerees, MIT License
- **Son of Oak Game Studio** : Créateurs de "Legends in the Mist"

---

# Phase 1 : Configuration Playspace & Hack LITM (MVP v1.0)

**Priorité** : HAUTE
**Temps estimé** : 8-12h
**Statut** : À faire

## Objectif

Configurer le système de playspace pour supporter le hack LITM avec ses univers (Zamanora, HOR) et intégrer les traductions FR/EN.

## Tasks de la Phase 1

### TASK-2025-01-19-001 : Configuration i18n pour Nuxt 4

Voir : [documentation/tasks/TASK-2025-01-19-001-config-i18n.md](../tasks/TASK-2025-01-19-001-config-i18n.md)

**Résumé** :
- Installer et configurer @nuxtjs/i18n pour Nuxt 4
- Créer la structure de dossiers pour les traductions
- Configurer le middleware de détection de langue
- Adapter la configuration Nuxt

**Fichiers** :
- `nuxt.config.ts`
- `app/i18n.config.ts` (nouveau)
- `app/middleware/i18n.ts` (nouveau)

**Dépendances** :
- Package : `@nuxtjs/i18n`

---

### TASK-2025-01-19-002 : Extraction et adaptation des traductions LITM

Voir : [documentation/tasks/TASK-2025-01-19-002-traductions-litm.md](../tasks/TASK-2025-01-19-002-traductions-litm.md)

**Résumé** :
- Télécharger les fichiers `messages/fr.json` et `messages/en.json`
- Extraire les sections pertinentes pour Brumisa3
- Adapter la structure JSON pour l'architecture Nuxt
- Organiser par domaines (character, cards, trackers, etc.)

**Fichiers** :
- `locales/fr/legends-in-the-mist.json` (nouveau)
- `locales/en/legends-in-the-mist.json` (nouveau)
- `locales/fr/common.json` (modification)
- `locales/en/common.json` (modification)

**Bloqueurs** :
- TASK-2025-01-19-001 doit être terminée

---

### TASK-2025-01-19-003 : Composable de traduction

Voir : [documentation/tasks/TASK-2025-01-19-003-composable-i18n.md](../tasks/TASK-2025-01-19-003-composable-i18n.md)

**Résumé** :
- Créer un composable `useI18nLitm()` pour faciliter l'accès aux traductions LITM
- Gérer le fallback FR/EN
- Typage TypeScript des clés de traduction
- Tests unitaires avec Vitest

**Fichiers** :
- `app/composables/useI18nLitm.ts` (nouveau)
- `tests/composables/useI18nLitm.spec.ts` (nouveau)

**Bloqueurs** :
- TASK-2025-01-19-002 doit être terminée

---

## Critères d'Acceptation Phase 1

- [ ] Le module i18n est configuré et fonctionnel
- [ ] Les traductions FR/EN sont accessibles dans toute l'application
- [ ] Le changement de langue fonctionne dynamiquement
- [ ] Les traductions sont typées en TypeScript
- [ ] Les tests passent avec succès
- [ ] La documentation est à jour

---

# Phase 2 : Composants Fiche de Personnage LITM (MVP v1.0)

**Priorité** : HAUTE
**Temps estimé** : 34h (ajusté)
**Statut** : À faire

## Objectif

Adapter les composants React/Next.js de characters-of-the-mist en composants Vue 3 pour Brumisa3, en créant un système de fiche de personnage pour le hack LITM du Mist Engine.

## Tasks de la Phase 2

### TASK-2025-01-19-004 : Modèle de données Prisma pour LITM

Voir : [documentation/tasks/TASK-2025-01-19-004-prisma-litm.md](../tasks/TASK-2025-01-19-004-prisma-litm.md)

**Résumé** :
- Créer le schéma Prisma pour les personnages LITM
- Modèles : Character, ThemeCard, Tracker, Tag, Quest
- Relations entre les modèles
- Migration de la base de données

**Fichiers** :
- `prisma/schema.prisma` (modification)
- `prisma/migrations/xxx_litm_models.sql` (nouveau)

**Tables créées** :
- `LitmCharacter`
- `LitmThemeCard`
- `LitmTracker`
- `LitmTag`
- `LitmQuest`

---

### TASK-2025-01-19-004-bis : Composants UI de Base LITM

Voir : [documentation/tasks/TASK-2025-01-19-004-bis-composants-ui-base.md](../tasks/TASK-2025-01-19-004-bis-composants-ui-base.md)

**Résumé** :
- Créer les composants UI réutilisables (CardBase, EditableTag, PipIndicator, etc.)
- Éviter la duplication de code
- Assurer la cohérence UI
- Créer les composables partagés (useEditMode, usePips)

**Fichiers** :
- `app/components/litm/base/*.vue` (nouveaux)
- `app/composables/litm/*.ts` (nouveaux)

**Bloqueurs** :
- TASK-001 (i18n config)

**Gain** : Évite 4h de duplication dans TASK-005, 006, 007

---

### TASK-2025-01-19-005 : Composant ThemeCard.vue

Voir : [documentation/tasks/TASK-2025-01-19-005-theme-card.md](../tasks/TASK-2025-01-19-005-theme-card.md)

**Résumé** :
- Créer le composant Vue 3 pour les cartes de thème
- Power tags et Weakness tags
- Système de quête
- Amélioration flip card (recto/verso)
- Tests avec @nuxt/test-utils

**Fichiers** :
- `app/components/litm/ThemeCard.vue` (nouveau)
- `app/components/litm/PowerTag.vue` (nouveau)
- `app/components/litm/WeaknessTag.vue` (nouveau)
- `app/components/litm/QuestPanel.vue` (nouveau)
- `tests/components/litm/ThemeCard.spec.ts` (nouveau)

**Bloqueurs** :
- TASK-2025-01-19-004 doit être terminée
- TASK-2025-01-19-001 doit être terminée (pour i18n)

---

### TASK-2025-01-19-006 : Composant HeroCard.vue

Voir : [documentation/tasks/TASK-2025-01-19-006-hero-card.md](../tasks/TASK-2025-01-19-006-hero-card.md)

**Résumé** :
- Créer la carte de héros (character card)
- Relations de compagnie
- Quintessences
- Sac à dos (backpack)
- Tests unitaires

**Fichiers** :
- `app/components/litm/HeroCard.vue` (nouveau)
- `app/components/litm/Relationships.vue` (nouveau)
- `app/components/litm/Quintessences.vue` (nouveau)
- `app/components/litm/Backpack.vue` (nouveau)
- `tests/components/litm/HeroCard.spec.ts` (nouveau)

**Bloqueurs** :
- TASK-2025-01-19-005 doit être terminée

---

### TASK-2025-01-19-007 : Composants Trackers

Voir : [documentation/tasks/TASK-2025-01-19-007-trackers.md](../tasks/TASK-2025-01-19-007-trackers.md)

**Résumé** :
- Créer les composants de suivi (Status, Story Tag, Story Theme)
- Système de "pips" (points à cocher)
- Gestion des états (Abandon, Améliorer, Jalon, Promesse)
- Tests unitaires

**Fichiers** :
- `app/components/litm/StatusTracker.vue` (nouveau)
- `app/components/litm/StoryTagTracker.vue` (nouveau)
- `app/components/litm/StoryThemeTracker.vue` (nouveau)
- `app/components/litm/PipTracker.vue` (nouveau)
- `tests/components/litm/Trackers.spec.ts` (nouveau)

**Bloqueurs** :
- TASK-2025-01-19-004 doit être terminée

---

### TASK-2025-01-19-008 : Store Pinia pour personnages LITM

Voir : [documentation/tasks/TASK-2025-01-19-008-store-litm.md](../tasks/TASK-2025-01-19-008-store-litm.md)

**Résumé** :
- Créer le store Pinia pour gérer l'état des personnages
- Actions CRUD (Create, Read, Update, Delete)
- Persistance avec Prisma
- Tests du store

**Fichiers** :
- `shared/stores/useLitmCharacterStore.ts` (nouveau)
- `tests/stores/useLitmCharacterStore.spec.ts` (nouveau)

**Bloqueurs** :
- TASK-2025-01-19-004 doit être terminée

---

### TASK-2025-01-19-009A : API Routes Characters

Voir : [documentation/tasks/TASK-2025-01-19-009A-api-characters.md](../tasks/TASK-2025-01-19-009A-api-characters.md)

**Résumé** :
- Créer les API routes CRUD pour les personnages
- Validation avec Zod
- Authentification (userId)
- Tests unitaires

**Fichiers** :
- `server/api/litm/characters/*.ts` (nouveaux)
- `server/utils/litm/validators.ts` (nouveau)
- `tests/api/litm-characters.spec.ts` (nouveau)

**Bloqueurs** :
- TASK-008 (Store Pinia)

---

### TASK-2025-01-19-009B : API Routes Cards & Trackers

Voir : [documentation/tasks/TASK-2025-01-19-009B-api-cards-trackers.md](../tasks/TASK-2025-01-19-009B-api-cards-trackers.md)

**Résumé** :
- Créer les API routes Nitro pour gérer les personnages LITM
- Endpoints CRUD pour characters, cards, trackers
- Validation des données
- Tests d'intégration

**Fichiers** :
- `server/api/litm/characters/index.get.ts` (nouveau)
- `server/api/litm/characters/index.post.ts` (nouveau)
- `server/api/litm/characters/[id].get.ts` (nouveau)
- `server/api/litm/characters/[id].put.ts` (nouveau)
- `server/api/litm/characters/[id].delete.ts` (nouveau)
- `tests/api/litm-characters.spec.ts` (nouveau)

**Bloqueurs** :
- TASK-2025-01-19-008 doit être terminée

---

### TASK-2025-01-19-010 : Page de création de personnage LITM

Voir : [documentation/tasks/TASK-2025-01-19-010-page-character-create.md](../tasks/TASK-2025-01-19-010-page-character-create.md)

**Résumé** :
- Créer la page de création de personnage pour LITM
- Formulaire multi-étapes (wizard)
- Intégration avec tous les composants créés
- Tests end-to-end

**Fichiers** :
- `app/pages/playspace/[id]/personnages/nouveau.vue` (nouveau)
- `tests/e2e/litm-character-creation.spec.ts` (nouveau)

**Bloqueurs** :
- TASK-2025-01-19-005 à 009 doivent être terminées

---

## Critères d'Acceptation Phase 2

- [ ] Le modèle de données Prisma est créé et migré
- [ ] Tous les composants Vue 3 sont fonctionnels
- [ ] Le store Pinia gère correctement l'état
- [ ] Les API routes sont sécurisées et testées
- [ ] La page de création de personnage fonctionne end-to-end
- [ ] Les tests passent avec succès (unitaires + intégration)
- [ ] Le code respecte SOLID et DRY
- [ ] La documentation technique est à jour

---

# Phase 3 : Export JSON (MVP v1.0)

**Priorité** : HAUTE
**Temps estimé** : 3h
**Statut** : À faire

## Objectif

Permettre l'export des personnages LITM en format JSON pour sauvegarde et partage. L'import depuis characters-of-the-mist est également supporté pour migration.

## Tasks de Migration

### TASK-2025-01-19-019 : Migration et Import de Personnages

Voir : [documentation/tasks/TASK-2025-01-19-019-migration-donnees.md](../tasks/TASK-2025-01-19-019-migration-donnees.md)

**Résumé** :
- Parser les fichiers JSON de characters-of-the-mist
- Convertir vers le format Prisma
- Interface d'import utilisateur
- Validation et prévisualisation avant import

**Fichiers** :
- `server/utils/litm/migration.ts` (nouveau)
- `server/api/litm/import.post.ts` (nouveau)
- `app/pages/playspace/[id]/personnages/importer.vue` (nouveau)

**Bloqueurs** :
- TASK-004 (Modèle Prisma)
- TASK-009A (API Characters)

**Pourquoi critique** : Sans cela, les utilisateurs perdent leurs personnages existants

---

## Critères d'Acceptation Phase Migration

- [ ] Import depuis characters-of-the-mist fonctionne
- [ ] Validation robuste des données
- [ ] Prévisualisation avant import
- [ ] Messages d'erreur clairs
- [ ] Gestion des doublons

---

# Phase Documentation : Guide Utilisateur

**Priorité** : IMPORTANTE
**Temps estimé** : 2h
**Statut** : À faire

## Objectif

Créer une documentation utilisateur complète pour faciliter l'utilisation de "Legends in the Mist" dans Brumisa3.

## Tasks de Documentation

### TASK-2025-01-19-020 : Documentation Utilisateur LITM

Voir : [documentation/tasks/TASK-2025-01-19-020-documentation-utilisateur.md](../tasks/TASK-2025-01-19-020-documentation-utilisateur.md)

**Résumé** :
- Guide de création de personnage
- Explication des thèmes et tags
- FAQ
- Tutoriel interactif (optionnel)
- Documentation FR et EN

**Fichiers** :
- `documentation/UTILISATEUR/hack-litm/*.md` (nouveaux)
- `app/pages/playspace/[id]/aide/*.vue` (nouveaux)

**Bloqueurs** :
- TASK-010 (Page création) pour screenshots

---

## Critères d'Acceptation Phase Documentation

- [ ] Guide complet et clair
- [ ] Screenshots de qualité
- [ ] FAQ couvre les questions courantes
- [ ] Accessible depuis l'app
- [ ] Versions FR et EN

---

# Phase 4 : Fonctionnalités Avancées (Post-MVP v1.1-v1.4)

**Priorité** : BASSE (Hors MVP)
**Temps estimé** : 18h
**Statut** : Reporté post-MVP

## Objectif

Intégrer les fonctionnalités avancées de characters-of-the-mist après validation du MVP :
- **v1.1** : Undo/Redo, Dark mode, Mobile responsive
- **v1.3** : Système de jets de dés
- **v1.4** : Drawer system, Drag & drop

## Tasks de la Phase 3

### TASK-2025-01-19-011 : Système de Drawer

Voir : [documentation/tasks/TASK-2025-01-19-011-drawer-system.md](../tasks/TASK-2025-01-19-011-drawer-system.md)

**Résumé** :
- Créer le système de "Tiroir" pour organiser plusieurs personnages
- Gestion de dossiers et fichiers
- Import/Export de personnages
- Vue riche et vue liste

**Fichiers** :
- `app/components/litm/Drawer.vue` (nouveau)
- `app/components/litm/DrawerItem.vue` (nouveau)
- `app/components/litm/DrawerFolder.vue` (nouveau)
- `shared/stores/useDrawerStore.ts` (nouveau)

**Bloqueurs** :
- Phase 2 doit être terminée

---

### TASK-2025-01-19-012 : Système Undo/Redo

Voir : [documentation/tasks/TASK-2025-01-19-012-undo-redo.md](../tasks/TASK-2025-01-19-012-undo-redo.md)

**Résumé** :
- Implémenter un système d'annulation/restauration
- Gestion de l'historique des actions
- Raccourcis clavier (Ctrl+Z / Ctrl+Y)
- Limitation de l'historique (ex: 50 actions)

**Fichiers** :
- `app/composables/useHistory.ts` (nouveau)
- `tests/composables/useHistory.spec.ts` (nouveau)

**Bloqueurs** :
- TASK-2025-01-19-008 (Store) doit être terminée

---

### TASK-2025-01-19-013 : Command Palette

Voir : [documentation/tasks/TASK-2025-01-19-013-command-palette.md](../tasks/TASK-2025-01-19-013-command-palette.md)

**Résumé** :
- Créer une palette de commandes (Ctrl+K)
- Recherche fuzzy des commandes
- Actions rapides clavier
- Intégration avec i18n

**Fichiers** :
- `app/components/litm/CommandPalette.vue` (nouveau)
- `app/composables/useCommandPalette.ts` (nouveau)
- Package : Installer une lib type `@headlessui/vue` ou `cmdk-vue`

---

### TASK-2025-01-19-014 : Drag & Drop avec VueDraggable

Voir : [documentation/tasks/TASK-2025-01-19-014-drag-drop.md](../tasks/TASK-2025-01-19-014-drag-drop.md)

**Résumé** :
- Implémenter le drag & drop pour réorganiser les cartes
- Déplacer des éléments vers le drawer
- Charger un personnage par drag depuis le drawer
- Utiliser VueDraggable ou @vueuse/core

**Fichiers** :
- Modification des composants existants (ThemeCard, HeroCard, Trackers)
- `app/composables/useDragDrop.ts` (nouveau)
- Package : `vue-draggable-plus` ou `@vueuse/core`

**Bloqueurs** :
- TASK-2025-01-19-011 (Drawer) doit être terminée

---

## Critères d'Acceptation Phase 3

- [ ] Le système de drawer permet d'organiser plusieurs personnages
- [ ] L'undo/redo fonctionne sur toutes les actions importantes
- [ ] La command palette est accessible et fonctionnelle
- [ ] Le drag & drop fonctionne de manière fluide
- [ ] Les tests passent avec succès
- [ ] L'UX est intuitive et performante
- [ ] La documentation utilisateur est créée

---

# Phase 5 : Multi-Joueurs (v2.5 - Hors MVP)

**Priorité** : TRÈS BASSE (Reporté v2.5)
**Temps estimé** : 30-40h
**Statut** : Hors scope MVP

## Objectif

Intégrer les fonctionnalités multi-joueurs de litm-player pour la version 2.5 (après Investigation Board v2.0) :
- Sessions de jeu collaboratives
- Chat temps réel
- Lanceur de dés synchronisé
- Investigation Board collaboratif

## Tasks de la Phase 4

### TASK-2025-01-19-015 : Infrastructure WebSocket

Voir : [documentation/tasks/TASK-2025-01-19-015-websocket.md](../tasks/TASK-2025-01-19-015-websocket.md)

**Résumé** :
- Configurer Socket.io avec Nitro
- Créer le système de rooms (sessions de jeu)
- Gestion des connexions/déconnexions
- Tests des WebSocket

**Fichiers** :
- `server/plugins/socket.io.ts` (nouveau)
- `server/socket/rooms.ts` (nouveau)
- `server/socket/handlers.ts` (nouveau)
- Package : `socket.io`, `socket.io-client`

---

### TASK-2025-01-19-016 : Système de Chat

Voir : [documentation/tasks/TASK-2025-01-19-016-chat-system.md](../tasks/TASK-2025-01-19-016-chat-system.md)

**Résumé** :
- Créer le composant de chat temps réel
- Historique des messages
- Notifications de nouveaux messages
- Persistance en DB

**Fichiers** :
- `app/components/multiplayer/ChatPanel.vue` (nouveau)
- `server/api/chat/messages.get.ts` (nouveau)
- `prisma/schema.prisma` (modification - table ChatMessage)

**Bloqueurs** :
- TASK-2025-01-19-015 doit être terminée

---

### TASK-2025-01-19-017 : Lanceur de Dés

Voir : [documentation/tasks/TASK-2025-01-19-017-dice-roller.md](../tasks/TASK-2025-01-19-017-dice-roller.md)

**Résumé** :
- Créer le système de lanceur de dés
- Support des tags (power/weakness)
- Animation des résultats
- Historique des jets

**Fichiers** :
- `app/components/multiplayer/DiceRoller.vue` (nouveau)
- `app/composables/useDiceRoller.ts` (nouveau)
- `server/socket/dice.ts` (nouveau)

**Bloqueurs** :
- TASK-2025-01-19-015 doit être terminée

---

### TASK-2025-01-19-018 : Gestion de Sessions

Voir : [documentation/tasks/TASK-2025-01-19-018-sessions.md](../tasks/TASK-2025-01-19-018-sessions.md)

**Résumé** :
- Créer la page de gestion de sessions
- Créer/rejoindre/quitter une session
- Liste des joueurs connectés
- Rôles (MJ/Joueur)

**Fichiers** :
- `app/pages/playspace/[id]/sessions/index.vue` (nouveau)
- `app/pages/playspace/[id]/sessions/[sessionId].vue` (nouveau)
- `server/api/sessions/[id].get.ts` (nouveau)
- `prisma/schema.prisma` (modification - table Session)

**Bloqueurs** :
- TASK-2025-01-19-016 et 017 doivent être terminées

---

## Critères d'Acceptation Phase 4

- [ ] Les WebSocket fonctionnent de manière stable
- [ ] Le chat temps réel fonctionne sans latence notable
- [ ] Le lanceur de dés calcule correctement les résultats
- [ ] Les sessions multi-joueurs sont fonctionnelles
- [ ] La sécurité est assurée (validation, authentification)
- [ ] Les tests passent avec succès
- [ ] La scalabilité est prise en compte
- [ ] La documentation est complète

---

# Tableau Récapitulatif des Tasks MVP v1.0

## Tasks MVP v1.0 (Phases 1-3)

| ID | Nom | Phase | Priorité | Temps | Statut | Version |
|----|-----|-------|----------|-------|--------|---------|
| 001 | Config Playspace/Hack | 1 | P0 | 2h | À faire | MVP |
| 002 | Traductions LITM | 1 | P0 | 4h | À faire | MVP |
| 003 | Composable i18n | 1 | P0 | 2h | À faire | MVP |
| 004 | Modèle Prisma | 2 | P0 | 4h | À faire | MVP |
| 004-bis | Composants UI Base | 2 | P0 | 3h | À faire | MVP |
| 005 | ThemeCard.vue | 2 | P0 | 6h | À faire | MVP |
| 006 | HeroCard.vue | 2 | P0 | 5h | À faire | MVP |
| 007 | Trackers | 2 | P0 | 4h | À faire | MVP |
| 008 | Store Pinia | 2 | P0 | 3h | À faire | MVP |
| 009A | API Characters | 2 | P0 | 3h | À faire | MVP |
| 009B | API Cards & Trackers | 2 | P0 | 3h | À faire | MVP |
| 010 | Page création | 2 | P0 | 6h | À faire | MVP |
| 010-bis | Tests E2E | 2 | P0 | 4h | À faire | MVP |
| 019 | Export/Import JSON | 3 | P0 | 3h | À faire | MVP |
| 020 | Doc Utilisateur | 3 | P0 | 2h | À faire | MVP |

**Total MVP** : 54h

## Tasks Post-MVP (Phases 4-5)

| ID | Nom | Phase | Priorité | Temps | Version |
|----|-----|-------|----------|-------|---------|
| 011 | Drawer System | 4 | P1 | 6h | v1.4 |
| 012 | Undo/Redo | 4 | P1 | 4h | v1.1 |
| 013 | Command Palette | 4 | P2 | 3h | v1.1 |
| 014 | Drag & Drop | 4 | P1 | 5h | v1.4 |
| 015 | WebSocket | 5 | P2 | 8h | v2.5 |
| 016 | Chat | 5 | P2 | 6h | v2.5 |
| 017 | Lanceur Dés | 5 | P1 | 5h | v1.3 |
| 018 | Sessions | 5 | P2 | 8h | v2.5 |

**Total révisé** : 102h (au lieu de 86-102h)

### Répartition par Version

| Version | Phases | Temps | Description |
|---------|--------|-------|-------------|
| **MVP v1.0** | 1-3 | 54h | Playspace, Personnages LITM, Export JSON |
| **v1.1** | - | 7h | Undo/Redo, Dark mode, Command Palette |
| **v1.3** | - | 5h | Système de jets de dés |
| **v1.4** | - | 11h | Drawer System, Drag & Drop |
| **v2.0** | - | Non estimé | Investigation Board |
| **v2.5** | 5 | 28h | Multi-joueurs, WebSocket, Chat |
| **TOTAL** | - | **105h** | Toutes fonctionnalités |

---

# Notes de Développement

## Décisions Architecturales

### Architecture Playspace et Univers LITM

Le hack LITM du Mist Engine propose deux univers officiels :
- **Zamanora** : Royaume fantastique classique, forêts enchantées, contes de fées
- **HOR (Hearts of Ravensdale)** : Académie de magie, intrigues adolescentes, urban fantasy

Les personnages LITM héritent automatiquement leur contexte système/hack/univers du playspace actif. Voir [../ARCHITECTURE/15-playspace-contexte-unique.md](../ARCHITECTURE/15-playspace-contexte-unique.md) pour l'architecture détaillée.

### Pourquoi Vue 3 au lieu de React ?

Brumisa3 utilise déjà Nuxt 4 + Vue 3. Plutôt que d'intégrer React, nous adaptons les composants React de characters-of-the-mist en composants Vue 3, ce qui assure :
- Cohérence avec le reste de l'application
- Pas de dépendances React inutiles
- Meilleure performance (pas de double framework)

### Gestion de l'État : Pinia vs Zustand

characters-of-the-mist utilise Zustand. Nous utiliserons Pinia car :
- C'est le standard pour Vue 3 / Nuxt
- Intégration native avec Nuxt
- Meilleure ergonomie avec Composition API

### Structure des Traductions

Les traductions sont organisées par domaine :
- `locales/[lang]/legends-in-the-mist.json` : Traductions spécifiques LITM
- `locales/[lang]/common.json` : Traductions communes à tous les univers

## Risques Identifiés

| Risque | Impact | Mitigation |
|--------|--------|------------|
| Complexité de l'adaptation React → Vue | Élevé | Commencer par les composants simples, itération progressive |
| Performance du drag & drop | Moyen | Utiliser des librairies optimisées, virtualisation si nécessaire |
| Scalabilité WebSocket (Phase 4) | Élevé | Architecture modulaire, possibilité d'utiliser un service externe |
| Volume de traductions à gérer | Faible | Système i18n robuste, validation automatique |

## Prochaines Étapes Immédiates (MVP v1.0)

1. **Phase 1** : Configurer le playspace avec hack LITM et univers disponibles (Zamanora, HOR)
2. **Phase 2** : Implémenter les composants de personnages LITM (Theme Cards, Hero Card, Trackers)
3. **Phase 3** : Ajouter l'export/import JSON pour sauvegarde et migration
4. **Tests E2E** : Valider l'ensemble du workflow de création de personnage

**Note** : Les fonctionnalités avancées (Drawer, Undo/Redo, Jets de dés, Multi-joueurs) sont **reportées post-MVP** conformément au scope défini dans [01-mvp-v1.0-scope.md](./01-mvp-v1.0-scope.md).

## Références

- [characters-of-the-mist](https://github.com/Altervayne/characters-of-the-mist)
- [litm-player](https://github.com/mikerees/litm-player)
- [Legends in the Mist - Son of Oak](https://cityofmist.co)
- [Documentation Nuxt i18n](https://i18n.nuxtjs.org/)
- [Documentation Prisma](https://www.prisma.io/docs)

---

**Dernière mise à jour** : 2025-01-20
**Alignement** : Architecture Système/Hack/Univers (voir [../ARCHITECTURE/00-GLOSSAIRE.md](../ARCHITECTURE/00-GLOSSAIRE.md))
**Scope MVP** : Phases 1-3 uniquement (voir [01-mvp-v1.0-scope.md](./01-mvp-v1.0-scope.md))
