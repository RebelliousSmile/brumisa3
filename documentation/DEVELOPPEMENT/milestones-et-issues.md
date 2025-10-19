# Milestones et Issues GitHub - Brumisa3 MVP v1.0

## Table des Matieres

1. [Structure des Milestones](#structure-des-milestones)
2. [Liste Complete des Issues](#liste-complete-des-issues)
3. [Template d'Issue](#template-dissue)
4. [Priorisation et Labels](#priorisation-et-labels)

---

## Structure des Milestones

### MVP v1.0 (10 semaines) - Playspaces + LITM Characters

**Objectif** : Livrer la version minimale permettant aux utilisateurs de jouer en mode solo avec le systeme Mist Engine / LITM.

**Duree totale** : 10 semaines (2.5 mois)
**Criteres de completion** :
- Authentification fonctionnelle (email/password + mode guest)
- CRUD Playspaces complet
- CRUD Characters LITM complet (Theme Cards, Hero Card, Trackers)
- Export JSON personnages
- Tests E2E Playwright couvrant parcours critiques
- Application deployee en production

---

### Phase 1 : Fondations (Semaines 1-2) - Sprint 1

**Milestone GitHub** : `v0.1 - Fondations`

**Objectif** : Mettre en place l'infrastructure technique et l'authentification.

**Duree** : 2 semaines
**Criteres de completion** :
- Setup Nuxt 4 + Prisma + PostgreSQL
- Schema Prisma MVP complet
- Migrations initiales executees
- Authentification @sidebase/nuxt-auth fonctionnelle
- Layout de base avec UnoCSS
- Tests unitaires infrastructure (> 70% coverage)

**Issues associees** : #1 a #8

---

### Phase 2 : Playspaces (Semaines 3-4) - Sprint 2

**Milestone GitHub** : `v0.2 - Playspaces`

**Objectif** : Systeme de Playspaces fonctionnel avec CRUD complet.

**Duree** : 2 semaines
**Criteres de completion** :
- CRUD Playspaces (API routes + frontend)
- Store Pinia playspace operationnel
- Composants Playspace (formulaire, liste, switcher)
- Basculement entre playspaces < 2s
- Tests E2E Playwright (creation, basculement, suppression)
- Migration guest → authentifie fonctionnelle

**Issues associees** : #9 a #16

---

### Phase 3 : Characters LITM (Semaines 5-8) - Sprints 3-4

**Milestone GitHub** : `v0.3 - Characters LITM`

**Objectif** : Gestion complete des personnages LITM avec Theme Cards, Hero Card, Trackers.

**Duree** : 4 semaines
**Criteres de completion** :
- CRUD Characters (API routes + frontend)
- Store Pinia character operationnel
- Composants Character (formulaire, liste, detail)
- Theme Cards CRUD avec validation (3-5 Power tags, 1-2 Weakness tags)
- Hero Card CRUD avec relations et quintessences
- Trackers CRUD (Status, Story tag, Story theme)
- Tests E2E Playwright couvrant parcours complets
- Validation Zod complete cote client et serveur

**Issues associees** : #17 a #42

---

### Phase 4 : Polish & Export (Semaines 9-10) - Sprint 5

**Milestone GitHub** : `v1.0 - MVP Complete`

**Objectif** : Finalisation, export, tests complets et deployment.

**Duree** : 2 semaines
**Criteres de completion** :
- Export JSON personnages fonctionnel
- Validation Zod complete sur toutes les routes
- Messages d'erreur UX clairs
- Loading states sur toutes les actions asynchrones
- Tests E2E complets (24+ tests minimum)
- Documentation utilisateur (FAQ, guide demarrage)
- Application deployee en production (Vercel)
- Performance : < 500ms chargement listes, < 2s basculement playspaces

**Issues associees** : #43 a #50

---

### Milestones Futures (Hors MVP v1.0)

#### v1.1 - Ameliorations UX (2-3 semaines)
- Dark mode
- Mobile responsive
- Undo/Redo pour personnages
- Raccourcis clavier basiques
- Tutoriel interactif (onboarding)

#### v1.3 - Import/Export Avance (2 semaines)
- Import personnages JSON (characters-of-the-mist)
- Export vers Foundry VTT
- Export Markdown
- Validation import avec Schema

#### v2.0 - Ameliorations Majeures (6-8 semaines)
- Investigation Board : Canvas interactif (Konva.js)
- Investigation Board : Notes texte et photo, drag & drop, connexions
- Mode hors ligne complet (Service Worker, PWA)
- Export PDF avec PDFKit et templates personnalisables

#### v2.5 - Mode Multi-Joueurs (8-10 semaines)
- Infrastructure WebSocket
- Sessions de jeu
- Investigation Board collaboratif
- Chat temps reel

---

## Liste Complete des Issues

### Phase 1 : Fondations (Issues #1-#8)

---

#### Issue #1 : Setup Nuxt 4 + Configuration Initiale

**Titre** : [SETUP] Initialiser projet Nuxt 4 avec configuration de base

**Description** :
Initialiser le projet Brumisa3 avec Nuxt 4, configuration TypeScript stricte, et dependencies essentielles.

**Acceptance Criteria** :
- [ ] Projet Nuxt 4 initialise avec `npx nuxi@latest init`
- [ ] TypeScript strict mode active dans nuxt.config.ts
- [ ] ESLint + Prettier configures
- [ ] .gitignore complet (node_modules, .nuxt, .env)
- [ ] package.json avec scripts : dev, build, preview, lint, test
- [ ] README.md avec instructions de setup
- [ ] CI/CD basique (GitHub Actions : lint + build)

**Labels** : `setup`, `P0`, `S`
**Milestone** : `v0.1 - Fondations`
**Estimation** : 2-4h (S)
**Dependencies** : Aucune

---

#### Issue #2 : Configuration Prisma + PostgreSQL

**Titre** : [SETUP] Configurer Prisma ORM avec PostgreSQL

**Description** :
Setup Prisma ORM pour gestion de base de donnees avec PostgreSQL local et production.

**Acceptance Criteria** :
- [ ] Prisma installe (`prisma`, `@prisma/client`)
- [ ] schema.prisma avec configuration PostgreSQL
- [ ] .env.example avec DATABASE_URL template
- [ ] Script de migration : `pnpm prisma:migrate`
- [ ] Prisma Client genere et importe dans Nuxt (plugin)
- [ ] Connection pool configuree (max 10 connections)
- [ ] Tests connexion DB reussis

**Labels** : `setup`, `database`, `P0`, `S`
**Milestone** : `v0.1 - Fondations`
**Estimation** : 2-4h (S)
**Dependencies** : #1

---

#### Issue #3 : Schema Prisma MVP - User, Playspace, Character

**Titre** : [DATABASE] Creer schema Prisma pour User, Playspace, Character

**Description** :
Definir le schema Prisma complet pour le MVP avec modeles User, Playspace, Character et relations.

**Acceptance Criteria** :
- [ ] Model User (id, email unique, passwordHash, timestamps)
- [ ] Model Playspace (id, userId, name, systemId, hackId, universeId, isActive, timestamps)
- [ ] Model Character (id, name, description, avatarUrl, level, playspaceId, userId, timestamps)
- [ ] Relations 1-N : User → Playspaces, Playspace → Characters
- [ ] Index DB sur playspaceId, userId pour performances
- [ ] Contrainte unique sur Playspace(userId, name)
- [ ] Migration initiale executee avec succes

**Labels** : `database`, `schema`, `P0`, `M`
**Milestone** : `v0.1 - Fondations`
**Estimation** : 4-8h (M)
**Dependencies** : #2

---

#### Issue #4 : Schema Prisma MVP - ThemeCard, HeroCard, Trackers

**Titre** : [DATABASE] Creer schema Prisma pour ThemeCard, HeroCard, Trackers

**Description** :
Completer schema Prisma avec modeles pour Theme Cards, Hero Card et Trackers LITM.

**Acceptance Criteria** :
- [ ] Model ThemeCard (id, characterId, title, description, type Mythos/Logos, powerTags JSON, weaknessTags JSON, timestamps)
- [ ] Model HeroCard (id, characterId unique, relations JSON, quintessences JSON, timestamps)
- [ ] Model Trackers (id, characterId unique, statuses JSON, storyTags JSON, storyThemes JSON, timestamps)
- [ ] Relations 1-N : Character → ThemeCards
- [ ] Relations 1-1 : Character → HeroCard, Character → Trackers
- [ ] Suppression cascade activee (ON DELETE CASCADE)
- [ ] Migration executee avec succes

**Labels** : `database`, `schema`, `P0`, `M`
**Milestone** : `v0.1 - Fondations`
**Estimation** : 4-8h (M)
**Dependencies** : #3

---

#### Issue #5 : Authentification @sidebase/nuxt-auth - Setup

**Titre** : [AUTH] Configurer @sidebase/nuxt-auth avec email/password

**Description** :
Setup du systeme d'authentification avec @sidebase/nuxt-auth pour email/password.

**Acceptance Criteria** :
- [ ] @sidebase/nuxt-auth installe et configure
- [ ] nuxt.config.ts avec auth module active
- [ ] AUTH_SECRET genere et stocke dans .env
- [ ] Provider credentials configure (email/password)
- [ ] Sessions JWT avec expiration 7 jours (defaut) ou 30 jours (remember me)
- [ ] Middleware auth protegant routes /playspaces/*
- [ ] Tests unitaires auth utilities (hashPassword, verifyPassword)

**Labels** : `auth`, `security`, `P0`, `M`
**Milestone** : `v0.1 - Fondations`
**Estimation** : 4-8h (M)
**Dependencies** : #3

---

#### Issue #6 : API Routes Auth - Signup, Login, Logout

**Titre** : [AUTH] Creer API routes signup, login, logout

**Description** :
Implementation des API routes Nitro pour authentification (signup, login, logout).

**Acceptance Criteria** :
- [ ] POST /api/auth/signup : Creation compte + migration guest optionnelle
- [ ] POST /api/auth/login : Validation credentials + session JWT
- [ ] POST /api/auth/logout : Destruction session
- [ ] GET /api/auth/session : Recuperation session active
- [ ] Validation Zod : email format valide, password min 8 chars
- [ ] Password hashe avec bcrypt (cost factor 12)
- [ ] Rate limiting : max 5 tentatives login/15min
- [ ] Tests unitaires routes auth (signup, login, logout)

**Labels** : `auth`, `api`, `P0`, `L`
**Milestone** : `v0.1 - Fondations`
**Estimation** : 1-2 jours (L)
**Dependencies** : #5

---

#### Issue #7 : Layout de Base + UnoCSS

**Titre** : [UI] Creer layout de base avec UnoCSS

**Description** :
Setup UnoCSS et creation du layout principal de l'application.

**Acceptance Criteria** :
- [ ] UnoCSS installe et configure
- [ ] Layout principal avec Header, Sidebar, Main content
- [ ] Header avec logo, navigation, menu utilisateur
- [ ] Sidebar collapsible pour liste playspaces
- [ ] Responsive : desktop uniquement pour MVP (min-width 1024px)
- [ ] Theme clair uniquement (dark mode v1.1)
- [ ] Composants communs : Button, Input, Modal, Toast
- [ ] Tests visuels : Storybook ou Nuxt DevTools

**Labels** : `ui`, `design`, `P0`, `M`
**Milestone** : `v0.1 - Fondations`
**Estimation** : 4-8h (M)
**Dependencies** : #1

---

#### Issue #8 : Tests Infrastructure + CI/CD

**Titre** : [TESTS] Setup tests unitaires et CI/CD

**Description** :
Configuration Vitest pour tests unitaires et GitHub Actions pour CI/CD.

**Acceptance Criteria** :
- [ ] Vitest installe et configure
- [ ] Tests unitaires pour utils (auth, validation)
- [ ] Coverage > 70% sur utils et services
- [ ] GitHub Actions : lint + build + tests sur chaque PR
- [ ] Badge CI/CD dans README.md
- [ ] Scripts package.json : test, test:watch, test:coverage

**Labels** : `tests`, `ci/cd`, `P0`, `S`
**Milestone** : `v0.1 - Fondations`
**Estimation** : 2-4h (S)
**Dependencies** : #1

---

### Phase 2 : Playspaces (Issues #9-#16)

---

#### Issue #9 : API Routes Playspaces CRUD

**Titre** : [API] Creer API routes CRUD pour Playspaces

**Description** :
Implementation des API routes Nitro pour CRUD Playspaces.

**Acceptance Criteria** :
- [ ] GET /api/playspaces : Liste playspaces user (tri par isActive DESC, updatedAt DESC)
- [ ] POST /api/playspaces : Creer playspace (validation Zod)
- [ ] GET /api/playspaces/:id : Details playspace
- [ ] PUT /api/playspaces/:id : Modifier playspace
- [ ] DELETE /api/playspaces/:id : Supprimer playspace (cascade characters)
- [ ] POST /api/playspaces/:id/switch : Basculer vers playspace (desactiver actuel, activer nouveau)
- [ ] POST /api/playspaces/:id/duplicate : Dupliquer playspace avec option personnages
- [ ] Tests unitaires routes playspaces (> 80% coverage)

**Labels** : `api`, `playspaces`, `P0`, `L`
**Milestone** : `v0.2 - Playspaces`
**Estimation** : 1-2 jours (L)
**Dependencies** : #3, #6

---

#### Issue #10 : Store Pinia Playspace

**Titre** : [STATE] Creer store Pinia pour Playspaces

**Description** :
Implementation du store Pinia pour gestion etat playspaces.

**Acceptance Criteria** :
- [ ] Store playspace.ts avec state : current, list, loading, error
- [ ] Actions : fetchPlayspaces, createPlayspace, updatePlayspace, deletePlayspace, switchPlayspace, duplicatePlayspace
- [ ] Getters : activePlayspace, playspacesCount
- [ ] Integration localStorage pour mode guest (max 3 playspaces)
- [ ] Sauvegarde automatique state avant basculement
- [ ] Tests unitaires store (actions, getters)

**Labels** : `state`, `playspaces`, `P0`, `M`
**Milestone** : `v0.2 - Playspaces`
**Estimation** : 4-8h (M)
**Dependencies** : #9

---

#### Issue #11 : Composant PlayspaceForm (Creation/Edition)

**Titre** : [UI] Creer composant PlayspaceForm pour creation/edition

**Description** :
Composant Vue formulaire de creation et edition de playspaces (wizard 4 etapes).

**Acceptance Criteria** :
- [ ] Formulaire wizard 4 etapes : Systeme, Hack, Univers, Nom
- [ ] Validation temps reel avec Zod
- [ ] Auto-suggestion nom : "[Hack] - [Univers]"
- [ ] Preview playspace avant creation
- [ ] Loading state pendant creation (< 1s)
- [ ] Messages erreur clairs (email deja utilise, nom deja pris)
- [ ] Composant reutilisable pour creation et edition

**Labels** : `ui`, `playspaces`, `P0`, `M`
**Milestone** : `v0.2 - Playspaces`
**Estimation** : 4-8h (M)
**Dependencies** : #10

---

#### Issue #12 : Composant PlayspaceCard + Liste

**Titre** : [UI] Creer composants PlayspaceCard et PlayspaceList

**Description** :
Composants Vue pour affichage liste playspaces et carte individuelle.

**Acceptance Criteria** :
- [ ] PlayspaceCard affiche : nom, hack, nombre personnages, derniere modification
- [ ] Badge "Actif" sur playspace actuel
- [ ] Actions : Modifier, Dupliquer, Supprimer
- [ ] PlayspaceList affiche max 10 playspaces avec pagination
- [ ] Tri par defaut : Actif en premier, puis updatedAt DESC
- [ ] Recherche par nom/hack/univers (debounce 300ms)
- [ ] Responsive desktop

**Labels** : `ui`, `playspaces`, `P0`, `M`
**Milestone** : `v0.2 - Playspaces`
**Estimation** : 4-8h (M)
**Dependencies** : #10

---

#### Issue #13 : Composant PlayspaceSwitcher (Sidebar)

**Titre** : [UI] Creer composant PlayspaceSwitcher pour sidebar

**Description** :
Composant Vue switcher de playspaces dans sidebar collapsible.

**Acceptance Criteria** :
- [ ] Sidebar collapsible affichant liste playspaces
- [ ] Clic sur playspace : basculement instantane (< 2s)
- [ ] Indicateur visuel playspace actif
- [ ] Bouton "Nouveau playspace" en haut
- [ ] Max 10 playspaces affiches, bouton "Voir tous" si plus
- [ ] Sauvegarde automatique avant basculement
- [ ] Rollback si erreur chargement

**Labels** : `ui`, `playspaces`, `P0`, `M`
**Milestone** : `v0.2 - Playspaces`
**Estimation** : 4-8h (M)
**Dependencies** : #12

---

#### Issue #14 : Migration Guest vers Authentifie

**Titre** : [AUTH] Implementer migration localStorage → BDD

**Description** :
Systeme de migration automatique des playspaces guest vers compte authentifie.

**Acceptance Criteria** :
- [ ] Detection automatique localStorage au signup
- [ ] Modal confirmation migration avec details (nombre playspaces, personnages)
- [ ] Migration complete : playspaces + characters + theme cards + hero cards + trackers
- [ ] Timestamps preserves (createdAt, updatedAt)
- [ ] Nettoyage localStorage apres migration reussie
- [ ] Rollback localStorage si migration echoue
- [ ] Tests unitaires migration (3 playspaces avec donnees completes)

**Labels** : `auth`, `migration`, `P0`, `L`
**Milestone** : `v0.2 - Playspaces`
**Estimation** : 1-2 jours (L)
**Dependencies** : #6, #9

---

#### Issue #15 : Tests E2E Playspaces - Playwright

**Titre** : [TESTS] Tests E2E Playwright pour Playspaces

**Description** :
Suite de tests E2E couvrant parcours critiques playspaces.

**Acceptance Criteria** :
- [ ] Test : Creation playspace en < 60s (4 etapes wizard)
- [ ] Test : Basculement entre 3 playspaces en < 2s chacun
- [ ] Test : Modification playspace (nom, hack, univers)
- [ ] Test : Suppression playspace avec confirmation
- [ ] Test : Duplication playspace avec option personnages
- [ ] Test : Migration guest → authentifie (1 playspace + 2 personnages)
- [ ] Tests executables en local et CI/CD
- [ ] Coverage E2E : parcours critiques utilisateur

**Labels** : `tests`, `e2e`, `playspaces`, `P0`, `L`
**Milestone** : `v0.2 - Playspaces`
**Estimation** : 1-2 jours (L)
**Dependencies** : #11, #12, #13, #14

---

#### Issue #16 : Documentation Playspaces

**Titre** : [DOCS] Documentation utilisateur Playspaces

**Description** :
Guide utilisateur pour creation et gestion playspaces.

**Acceptance Criteria** :
- [ ] Guide demarrage : "Creer votre premier playspace"
- [ ] FAQ : Limites guest (3 playspaces), migration, suppression
- [ ] Screenshots : Wizard creation, liste playspaces, switcher
- [ ] Video courte (1-2min) : Creation playspace de A a Z
- [ ] Documentation markdown dans /documentation/GUIDES/

**Labels** : `docs`, `playspaces`, `P1`, `XS`
**Milestone** : `v0.2 - Playspaces`
**Estimation** : < 2h (XS)
**Dependencies** : #15

---

### Phase 3 : Characters LITM (Issues #17-#42)

---

#### Issue #17 : API Routes Characters CRUD

**Titre** : [API] Creer API routes CRUD pour Characters

**Description** :
Implementation des API routes Nitro pour CRUD Characters.

**Acceptance Criteria** :
- [ ] GET /api/playspaces/:playspaceId/characters : Liste personnages du playspace
- [ ] POST /api/playspaces/:playspaceId/characters : Creer personnage (+ 2 Theme Cards vides)
- [ ] GET /api/characters/:id : Details personnage complet (avec relations)
- [ ] PATCH /api/characters/:id : Modifier personnage
- [ ] DELETE /api/characters/:id : Supprimer personnage (cascade theme cards, hero card, trackers)
- [ ] POST /api/characters/:id/duplicate : Dupliquer personnage complet
- [ ] Validation Zod : name 2-100 chars, level 1-10, description max 2000 chars
- [ ] Tests unitaires routes characters (> 80% coverage)

**Labels** : `api`, `characters`, `P0`, `L`
**Milestone** : `v0.3 - Characters LITM`
**Estimation** : 1-2 jours (L)
**Dependencies** : #9

---

#### Issue #18 : Store Pinia Character

**Titre** : [STATE] Creer store Pinia pour Characters

**Description** :
Implementation du store Pinia pour gestion etat characters.

**Acceptance Criteria** :
- [ ] Store character.ts avec state : current, list, loading, error
- [ ] Actions : fetchCharacters, createCharacter, updateCharacter, deleteCharacter, duplicateCharacter
- [ ] Getters : charactersCount, incompleteCharacters (< 2 Theme Cards)
- [ ] Sauvegarde automatique toutes les 30s pendant edition
- [ ] Debounce sauvegarde 2s apres derniere modification
- [ ] Tests unitaires store (actions, getters)

**Labels** : `state`, `characters`, `P0`, `M`
**Milestone** : `v0.3 - Characters LITM`
**Estimation** : 4-8h (M)
**Dependencies** : #17

---

#### Issue #19 : Composant CharacterForm (Creation/Edition)

**Titre** : [UI] Creer composant CharacterForm pour creation/edition

**Description** :
Composant Vue formulaire de creation et edition de personnages.

**Acceptance Criteria** :
- [ ] Formulaire avec champs : nom, description, avatarUrl, level
- [ ] Validation temps reel avec Zod
- [ ] Avatar placeholder si non fourni
- [ ] Level 1-10 avec select
- [ ] Sauvegarde auto toutes les 30s (indicateur "Sauvegarde il y a Xs")
- [ ] Bouton "Sauvegarder" manuel avec feedback visuel
- [ ] Loading state pendant creation (< 1s)
- [ ] Messages erreur clairs

**Labels** : `ui`, `characters`, `P0`, `M`
**Milestone** : `v0.3 - Characters LITM`
**Estimation** : 4-8h (M)
**Dependencies** : #18

---

#### Issue #20 : Composant CharacterCard + Liste

**Titre** : [UI] Creer composants CharacterCard et CharacterList

**Description** :
Composants Vue pour affichage liste personnages et carte individuelle.

**Acceptance Criteria** :
- [ ] CharacterCard affiche : avatar, nom, niveau, nombre Theme Cards
- [ ] Badge "Incomplet" si < 2 Theme Cards
- [ ] Actions : Modifier, Dupliquer, Supprimer
- [ ] CharacterList avec tri : nom, niveau, date modification
- [ ] Recherche par nom (debounce 300ms)
- [ ] Responsive desktop

**Labels** : `ui`, `characters`, `P0`, `M`
**Milestone** : `v0.3 - Characters LITM`
**Estimation** : 4-8h (M)
**Dependencies** : #18

---

#### Issue #21 : API Routes Theme Cards CRUD

**Titre** : [API] Creer API routes CRUD pour Theme Cards

**Description** :
Implementation des API routes Nitro pour CRUD Theme Cards.

**Acceptance Criteria** :
- [ ] POST /api/characters/:characterId/theme-cards : Creer Theme Card
- [ ] PATCH /api/theme-cards/:id : Modifier Theme Card
- [ ] DELETE /api/theme-cards/:id : Supprimer Theme Card (validation min 2 cards)
- [ ] Validation Zod : title 3-100 chars, type Mythos/Logos, powerTags 3-5, weaknessTags 1-2
- [ ] Validation business : max 4 Theme Cards par character
- [ ] Validation business : min 2 Theme Cards avant suppression
- [ ] Tests unitaires routes theme cards (> 80% coverage)

**Labels** : `api`, `theme-cards`, `P0`, `M`
**Milestone** : `v0.3 - Characters LITM`
**Estimation** : 4-8h (M)
**Dependencies** : #17

---

#### Issue #22 : Composant ThemeCardForm (Creation/Edition)

**Titre** : [UI] Creer composant ThemeCardForm pour creation/edition

**Description** :
Composant Vue formulaire de creation et edition de Theme Cards.

**Acceptance Criteria** :
- [ ] Formulaire avec : titre, type Mythos/Logos, description
- [ ] Section Power Tags : min 3, max 5 (compteur visuel 3/5)
- [ ] Section Weakness Tags : min 1, max 2 (compteur visuel 1/2)
- [ ] Validation temps reel
- [ ] Ajout/Suppression tags inline
- [ ] Validation unicite tags dans meme Theme Card
- [ ] Badges couleurs differents pour Mythos et Logos

**Labels** : `ui`, `theme-cards`, `P0`, `M`
**Milestone** : `v0.3 - Characters LITM`
**Estimation** : 4-8h (M)
**Dependencies** : #21

---

#### Issue #23 : Composant ThemeCardDisplay

**Titre** : [UI] Creer composant ThemeCardDisplay pour affichage

**Description** :
Composant Vue affichage Theme Card avec tags et actions.

**Acceptance Criteria** :
- [ ] Affichage titre, type (badge Mythos/Logos), description
- [ ] Liste Power Tags avec icone puissance
- [ ] Liste Weakness Tags avec icone faiblesse
- [ ] Actions : Modifier, Supprimer
- [ ] Indicateur visuel si Theme Card incomplete (< 3 Power tags ou < 1 Weakness tag)
- [ ] Responsive desktop

**Labels** : `ui`, `theme-cards`, `P0`, `S`
**Milestone** : `v0.3 - Characters LITM`
**Estimation** : 2-4h (S)
**Dependencies** : #22

---

#### Issue #24 : Composant TagList (Editable Inline)

**Titre** : [UI] Creer composant TagList pour edition inline tags

**Description** :
Composant Vue liste de tags editable inline (Power tags et Weakness tags).

**Acceptance Criteria** :
- [ ] Affichage liste tags (mode lecture)
- [ ] Clic sur tag : passe en mode edition (input inline)
- [ ] Validation longueur : Power tags 5-100 chars, Weakness tags 5-150 chars
- [ ] Sauvegarde auto apres 2s d'inactivite
- [ ] Bouton [X] pour supprimer tag (respectant min/max)
- [ ] Bouton [+ Ajouter tag] (desactive si max atteint)
- [ ] Drag & drop pour reordonner tags

**Labels** : `ui`, `theme-cards`, `P0`, `M`
**Milestone** : `v0.3 - Characters LITM`
**Estimation** : 4-8h (M)
**Dependencies** : #23

---

#### Issue #25 : Validation Business Theme Cards

**Titre** : [VALIDATION] Validation business rules Theme Cards

**Description** :
Logique de validation des regles metier Theme Cards (min/max, unicite, etc.).

**Acceptance Criteria** :
- [ ] Validation max 4 Theme Cards par character (cote serveur)
- [ ] Validation min 2 Theme Cards avant suppression
- [ ] Validation Power Tags : min 3, max 5, longueur 5-100 chars, unicite
- [ ] Validation Weakness Tags : min 1, max 2, longueur 5-150 chars, unicite
- [ ] Messages erreur clairs cote client et serveur
- [ ] Tests unitaires validation business (> 90% coverage)

**Labels** : `validation`, `theme-cards`, `P0`, `S`
**Milestone** : `v0.3 - Characters LITM`
**Estimation** : 2-4h (S)
**Dependencies** : #21

---

#### Issue #26 : API Routes Hero Card CRUD

**Titre** : [API] Creer API routes CRUD pour Hero Card

**Description** :
Implementation des API routes Nitro pour CRUD Hero Card.

**Acceptance Criteria** :
- [ ] POST /api/characters/:characterId/hero-card : Creer Hero Card (1-1 relation)
- [ ] PATCH /api/hero-cards/:id : Modifier Hero Card
- [ ] DELETE /api/hero-cards/:id : Supprimer Hero Card
- [ ] Validation Zod : relations max 5, quintessences max 3
- [ ] Validation business : 1 seule Hero Card par character
- [ ] Validation unicite noms relations dans Hero Card
- [ ] Tests unitaires routes hero card (> 80% coverage)

**Labels** : `api`, `hero-card`, `P0`, `M`
**Milestone** : `v0.3 - Characters LITM`
**Estimation** : 4-8h (M)
**Dependencies** : #17

---

#### Issue #27 : Composant HeroCardForm (Creation/Edition)

**Titre** : [UI] Creer composant HeroCardForm pour creation/edition

**Description** :
Composant Vue formulaire de creation et edition de Hero Card.

**Acceptance Criteria** :
- [ ] Section Relations (0-5) : nom, type (select 8 types), description
- [ ] Section Quintessences (0-3) : texte libre 10-100 chars
- [ ] Validation temps reel
- [ ] Ajout/Suppression relations inline
- [ ] Ajout/Suppression quintessences inline
- [ ] Compteurs visuels (3/5 relations, 2/3 quintessences)
- [ ] Suggestions UX : "Ajoutez au moins 3 relations" (pas bloquant)

**Labels** : `ui`, `hero-card`, `P0`, `M`
**Milestone** : `v0.3 - Characters LITM`
**Estimation** : 4-8h (M)
**Dependencies** : #26

---

#### Issue #28 : Composant RelationList (Editable)

**Titre** : [UI] Creer composant RelationList pour gestion relations

**Description** :
Composant Vue liste de relations editable inline.

**Acceptance Criteria** :
- [ ] Affichage liste relations avec nom, type, description
- [ ] Edition inline de chaque relation
- [ ] Badges colorees pour types relation (Ami, Famille, Rival, Amour, etc.)
- [ ] Validation unicite noms
- [ ] Bouton [+ Ajouter relation] (desactive si 5 relations)
- [ ] Bouton [X] pour supprimer relation

**Labels** : `ui`, `hero-card`, `P0`, `S`
**Milestone** : `v0.3 - Characters LITM`
**Estimation** : 2-4h (S)
**Dependencies** : #27

---

#### Issue #29 : Composant QuintessenceList (Editable)

**Titre** : [UI] Creer composant QuintessenceList pour gestion quintessences

**Description** :
Composant Vue liste de quintessences editable inline.

**Acceptance Criteria** :
- [ ] Affichage liste quintessences (texte libre)
- [ ] Edition inline de chaque quintessence
- [ ] Validation longueur 10-100 chars
- [ ] Bouton [+ Ajouter quintessence] (desactive si 3 quintessences)
- [ ] Bouton [X] pour supprimer quintessence
- [ ] Exemples suggeres : "Proteger les innocents", "Maitriser la brume", etc.

**Labels** : `ui`, `hero-card`, `P0`, `S`
**Milestone** : `v0.3 - Characters LITM`
**Estimation** : 2-4h (S)
**Dependencies** : #27

---

#### Issue #30 : Validation Business Hero Card

**Titre** : [VALIDATION] Validation business rules Hero Card

**Description** :
Logique de validation des regles metier Hero Card (min/max, unicite, etc.).

**Acceptance Criteria** :
- [ ] Validation 1 seule Hero Card par character (contrainte DB unique)
- [ ] Validation relations : max 5, unicite noms, types predefinies
- [ ] Validation quintessences : max 3, longueur 10-100 chars
- [ ] Hero Card optionnelle (character valide sans Hero Card)
- [ ] Messages erreur clairs cote client et serveur
- [ ] Tests unitaires validation business (> 90% coverage)

**Labels** : `validation`, `hero-card`, `P0`, `S`
**Milestone** : `v0.3 - Characters LITM`
**Estimation** : 2-4h (S)
**Dependencies** : #26

---

#### Issue #31 : API Routes Trackers CRUD

**Titre** : [API] Creer API routes CRUD pour Trackers

**Description** :
Implementation des API routes Nitro pour CRUD Trackers (Status, Story tag, Story theme).

**Acceptance Criteria** :
- [ ] GET /api/characters/:characterId/trackers : Recuperer trackers (1-1 relation)
- [ ] PATCH /api/trackers/:id : Modifier trackers (statuses, storyTags, storyThemes)
- [ ] Validation Zod : statuses max 5 actifs, storyThemes max 3 actifs, storyTags illimites
- [ ] Validation business : niveau Status 0-5
- [ ] Trackers crees automatiquement a creation character
- [ ] Tests unitaires routes trackers (> 80% coverage)

**Labels** : `api`, `trackers`, `P0`, `M`
**Milestone** : `v0.3 - Characters LITM`
**Estimation** : 4-8h (M)
**Dependencies** : #17

---

#### Issue #32 : Composant StatusTracker

**Titre** : [UI] Creer composant StatusTracker pour gestion statuses

**Description** :
Composant Vue pour gestion Status tracker (conditions et blessures).

**Acceptance Criteria** :
- [ ] Liste statuses avec nom, niveau (0-5), actif/inactif
- [ ] Ajout status : nom, niveau, actif (checkbox)
- [ ] Modification inline status
- [ ] Toggle actif/inactif pour archivage
- [ ] Suppression definitive avec confirmation
- [ ] Badges couleurs niveau : 0-1 vert, 2-3 orange, 4-5 rouge
- [ ] Max 5 statuses actifs (bouton [+ Ajouter] desactive si 5)

**Labels** : `ui`, `trackers`, `P0`, `M`
**Milestone** : `v0.3 - Characters LITM`
**Estimation** : 4-8h (M)
**Dependencies** : #31

---

#### Issue #33 : Composant StoryTagTracker

**Titre** : [UI] Creer composant StoryTagTracker pour gestion Story tags

**Description** :
Composant Vue pour gestion Story tag tracker (tags narratifs temporaires).

**Acceptance Criteria** :
- [ ] Liste Story tags avec nom, description, actif/inactif
- [ ] Ajout Story tag : nom, description optionnelle, actif (checkbox)
- [ ] Modification inline Story tag
- [ ] Toggle actif/inactif pour archivage
- [ ] Suppression definitive avec confirmation
- [ ] Tri chronologique (date creation DESC)
- [ ] Recherche par nom (debounce 300ms)
- [ ] Illimites (pas de limite stricte)

**Labels** : `ui`, `trackers`, `P0`, `M`
**Milestone** : `v0.3 - Characters LITM`
**Estimation** : 4-8h (M)
**Dependencies** : #31

---

#### Issue #34 : Composant StoryThemeTracker

**Titre** : [UI] Creer composant StoryThemeTracker pour gestion Story themes

**Description** :
Composant Vue pour gestion Story theme tracker (themes narratifs actifs).

**Acceptance Criteria** :
- [ ] Liste Story themes avec nom, description, actif/inactif
- [ ] Ajout Story theme : nom, description optionnelle, actif (checkbox)
- [ ] Modification inline Story theme
- [ ] Toggle actif/inactif pour archivage
- [ ] Suppression definitive avec confirmation
- [ ] Max 3 Story themes actifs (bouton [+ Ajouter] desactive si 3)
- [ ] Section "Archives" pour Story themes inactifs
- [ ] Reactivation possible si < 3 actifs

**Labels** : `ui`, `trackers`, `P0`, `M`
**Milestone** : `v0.3 - Characters LITM`
**Estimation** : 4-8h (M)
**Dependencies** : #31

---

#### Issue #35 : Validation Business Trackers

**Titre** : [VALIDATION] Validation business rules Trackers

**Description** :
Logique de validation des regles metier Trackers (min/max, archivage, etc.).

**Acceptance Criteria** :
- [ ] Validation Status : max 5 actifs, niveau 0-5
- [ ] Validation Story themes : max 3 actifs
- [ ] Story tags illimites (pas de limite)
- [ ] Suggestion UX : "Archivez les tags resolus" si > 10 Story tags actifs
- [ ] Trackers crees automatiquement a creation character (vides)
- [ ] Tests unitaires validation business (> 90% coverage)

**Labels** : `validation`, `trackers`, `P0`, `S`
**Milestone** : `v0.3 - Characters LITM`
**Estimation** : 2-4h (S)
**Dependencies** : #31

---

#### Issue #36 : Page Character Detail Complete

**Titre** : [UI] Creer page /characters/:id avec sections Theme Cards, Hero Card, Trackers

**Description** :
Page complete d'affichage et edition d'un personnage avec toutes ses sections.

**Acceptance Criteria** :
- [ ] Section Informations de base (nom, description, avatar, level)
- [ ] Section Theme Cards (2-4) avec affichage ThemeCardDisplay
- [ ] Section Hero Card (optionnelle) avec affichage relations et quintessences
- [ ] Section Trackers (3 colonnes : Status, Story tag, Story theme)
- [ ] Navigation entre sections (onglets ou accordeon)
- [ ] Sauvegarde auto toutes les 30s
- [ ] Indicateur "Sauvegarde il y a Xs"
- [ ] Responsive desktop

**Labels** : `ui`, `characters`, `P0`, `L`
**Milestone** : `v0.3 - Characters LITM`
**Estimation** : 1-2 jours (L)
**Dependencies** : #23, #27, #32, #33, #34

---

#### Issue #37 : Modal Suppression Character

**Titre** : [UI] Creer modal confirmation suppression Character

**Description** :
Modal de confirmation pour suppression d'un personnage avec details.

**Acceptance Criteria** :
- [ ] Modal affiche nom personnage
- [ ] Details : nombre Theme Cards, Hero Card (oui/non), Trackers
- [ ] Warning : "Cette action est irreversible"
- [ ] Checkbox "Je confirme la suppression de X Theme Cards" (si > 2)
- [ ] Bouton "Confirmer la suppression" (rouge)
- [ ] Bouton "Annuler"
- [ ] Suppression cascade : character + theme cards + hero card + trackers

**Labels** : `ui`, `characters`, `P0`, `S`
**Milestone** : `v0.3 - Characters LITM`
**Estimation** : 2-4h (S)
**Dependencies** : #20

---

#### Issue #38 : Tests E2E Characters - Creation et Edition

**Titre** : [TESTS] Tests E2E Playwright pour creation et edition Characters

**Description** :
Suite de tests E2E couvrant parcours creation et edition personnages.

**Acceptance Criteria** :
- [ ] Test : Creation character avec nom, description, avatar
- [ ] Test : Creation automatique 2 Theme Cards vides
- [ ] Test : Modification character (nom, level, description)
- [ ] Test : Sauvegarde automatique apres 30s
- [ ] Test : Suppression character avec confirmation
- [ ] Test : Duplication character complet
- [ ] Tests executables en local et CI/CD

**Labels** : `tests`, `e2e`, `characters`, `P0`, `M`
**Milestone** : `v0.3 - Characters LITM`
**Estimation** : 4-8h (M)
**Dependencies** : #36, #37

---

#### Issue #39 : Tests E2E Theme Cards - CRUD

**Titre** : [TESTS] Tests E2E Playwright pour CRUD Theme Cards

**Description** :
Suite de tests E2E couvrant parcours complets Theme Cards.

**Acceptance Criteria** :
- [ ] Test : Creation Theme Card avec titre, type, 3 Power tags, 1 Weakness tag
- [ ] Test : Ajout 4eme et 5eme Power tag (max 5)
- [ ] Test : Ajout 2eme Weakness tag (max 2)
- [ ] Test : Modification tags inline
- [ ] Test : Suppression Theme Card (validation min 2 cards restantes)
- [ ] Test : Validation bloquante si tentative suppression avec < 2 cards
- [ ] Tests executables en local et CI/CD

**Labels** : `tests`, `e2e`, `theme-cards`, `P0`, `M`
**Milestone** : `v0.3 - Characters LITM`
**Estimation** : 4-8h (M)
**Dependencies** : #36

---

#### Issue #40 : Tests E2E Hero Card - CRUD

**Titre** : [TESTS] Tests E2E Playwright pour CRUD Hero Card

**Description** :
Suite de tests E2E couvrant parcours complets Hero Card.

**Acceptance Criteria** :
- [ ] Test : Creation Hero Card avec 3 relations et 2 quintessences
- [ ] Test : Ajout 4eme et 5eme relation (max 5)
- [ ] Test : Ajout 3eme quintessence (max 3)
- [ ] Test : Modification relation (nom, type, description)
- [ ] Test : Suppression Hero Card complete avec confirmation
- [ ] Test : Character reste valide sans Hero Card
- [ ] Tests executables en local et CI/CD

**Labels** : `tests`, `e2e`, `hero-card`, `P0`, `M`
**Milestone** : `v0.3 - Characters LITM`
**Estimation** : 4-8h (M)
**Dependencies** : #36

---

#### Issue #41 : Tests E2E Trackers - CRUD

**Titre** : [TESTS] Tests E2E Playwright pour CRUD Trackers

**Description** :
Suite de tests E2E couvrant parcours complets Trackers.

**Acceptance Criteria** :
- [ ] Test : Ajout Status avec niveau 2 (badge orange)
- [ ] Test : Modification Status niveau 2 → 4 (badge rouge)
- [ ] Test : Toggle Status actif → inactif (archivage)
- [ ] Test : Ajout Story tag avec description
- [ ] Test : Recherche Story tag par nom
- [ ] Test : Ajout Story theme actif (max 3)
- [ ] Test : Validation bloquante si tentative ajout 4eme Story theme actif
- [ ] Tests executables en local et CI/CD

**Labels** : `tests`, `e2e`, `trackers`, `P0`, `M`
**Milestone** : `v0.3 - Characters LITM`
**Estimation** : 4-8h (M)
**Dependencies** : #36

---

#### Issue #42 : Documentation Characters LITM

**Titre** : [DOCS] Documentation utilisateur Characters LITM

**Description** :
Guide utilisateur complet pour creation et gestion personnages LITM.

**Acceptance Criteria** :
- [ ] Guide demarrage : "Creer votre premier personnage LITM"
- [ ] Section Theme Cards : Power tags, Weakness tags, types Mythos/Logos
- [ ] Section Hero Card : Relations, Quintessences
- [ ] Section Trackers : Status, Story tags, Story themes
- [ ] FAQ : Limites (2-4 Theme Cards, max 5 relations, etc.)
- [ ] Screenshots : Formulaire creation, page detail complete
- [ ] Video courte (2-3min) : Creation personnage complet
- [ ] Documentation markdown dans /documentation/GUIDES/

**Labels** : `docs`, `characters`, `P1`, `S`
**Milestone** : `v0.3 - Characters LITM`
**Estimation** : 2-4h (S)
**Dependencies** : #38, #39, #40, #41

---

### Phase 4 : Polish & Export (Issues #43-#50)

---

#### Issue #43 : API Route Export JSON Character

**Titre** : [API] Creer API route export JSON personnage

**Description** :
Implementation de l'API route Nitro pour export JSON complet d'un personnage.

**Acceptance Criteria** :
- [ ] GET /api/characters/:id/export/json : Export JSON complet
- [ ] Format JSON compatible characters-of-the-mist
- [ ] Inclusion : character + theme cards + hero card + trackers
- [ ] Timestamps ISO 8601
- [ ] Metadata : version schema, date export, app name
- [ ] Compression optionnelle (gzip)
- [ ] Tests unitaires export (validation JSON schema)

**Labels** : `api`, `export`, `P0`, `S`
**Milestone** : `v1.0 - MVP Complete`
**Estimation** : 2-4h (S)
**Dependencies** : #17, #21, #26, #31

---

#### Issue #44 : Bouton Export JSON Character

**Titre** : [UI] Ajouter bouton export JSON sur page character

**Description** :
Bouton d'export JSON sur page detail personnage avec feedback UX.

**Acceptance Criteria** :
- [ ] Bouton "Exporter (JSON)" visible sur page /characters/:id
- [ ] Clic : telechargement fichier JSON (nom: character-name.json)
- [ ] Loading state pendant generation (< 500ms)
- [ ] Message succes : "Personnage exporte avec succes"
- [ ] Gestion erreurs : message clair si echec export
- [ ] Tooltip : "Exporter ce personnage au format JSON"

**Labels** : `ui`, `export`, `P0`, `XS`
**Milestone** : `v1.0 - MVP Complete`
**Estimation** : < 2h (XS)
**Dependencies** : #43

---

#### Issue #45 : Validation Zod Complete - Toutes Routes

**Titre** : [VALIDATION] Validation Zod complete sur toutes les API routes

**Description** :
Audit et completion de la validation Zod sur toutes les API routes.

**Acceptance Criteria** :
- [ ] Validation Zod sur toutes routes POST, PUT, PATCH
- [ ] Schemas Zod partages entre client et serveur
- [ ] Messages erreur clairs et localises (FR)
- [ ] HTTP status codes corrects : 400 Bad Request, 401 Unauthorized, 404 Not Found
- [ ] Tests unitaires validation (cas valides et invalides)
- [ ] Documentation schemas Zod dans /server/utils/validation/

**Labels** : `validation`, `security`, `P0`, `M`
**Milestone** : `v1.0 - MVP Complete`
**Estimation** : 4-8h (M)
**Dependencies** : #9, #17, #21, #26, #31

---

#### Issue #46 : Messages Erreur UX - Standardisation

**Titre** : [UX] Standardiser messages d'erreur et toasts

**Description** :
Standardisation des messages d'erreur et toasts pour coherence UX.

**Acceptance Criteria** :
- [ ] Composant Toast reutilisable (succes, erreur, warning, info)
- [ ] Messages erreur localises (FR) pour toutes les validations
- [ ] Format consistent : "[Action] - [Raison] - [Action corrective]"
- [ ] Exemples : "Impossible de supprimer - Minimum 2 Theme Cards requis - Ajoutez une Theme Card d'abord"
- [ ] Duree affichage : 3s (succes), 5s (erreur), 7s (warning)
- [ ] Position : top-right
- [ ] Tests visuels : Storybook avec tous types de messages

**Labels** : `ux`, `error-handling`, `P0`, `S`
**Milestone** : `v1.0 - MVP Complete`
**Estimation** : 2-4h (S)
**Dependencies** : #7

---

#### Issue #47 : Loading States - Standardisation

**Titre** : [UX] Ajouter loading states sur toutes actions asynchrones

**Description** :
Ajout de loading states coherents sur toutes les actions asynchrones.

**Acceptance Criteria** :
- [ ] Composant Loader reutilisable (spinner, skeleton, progress bar)
- [ ] Loading state sur : login, signup, creation playspace, creation character, basculement playspace
- [ ] Skeleton loaders pour listes (playspaces, characters)
- [ ] Progress bar pour operations longues (migration, duplication)
- [ ] Desactivation boutons pendant loading (prevention double-clic)
- [ ] Timeout 10s avec message erreur si operation bloquee
- [ ] Tests visuels : Storybook avec differents loaders

**Labels** : `ux`, `loading`, `P0`, `M`
**Milestone** : `v1.0 - MVP Complete`
**Estimation** : 4-8h (M)
**Dependencies** : #7

---

#### Issue #48 : Tests E2E Complets - Parcours Utilisateur

**Titre** : [TESTS] Tests E2E complets parcours utilisateur bout en bout

**Description** :
Suite de tests E2E couvrant parcours utilisateur complets de A a Z.

**Acceptance Criteria** :
- [ ] Parcours guest : Creation playspace → Creation character → 3 Theme Cards → Export JSON
- [ ] Parcours authentifie : Signup → Creation playspace → Creation character complet → Logout → Login → Retrouver character
- [ ] Parcours migration : Guest (3 playspaces) → Signup avec migration → Verification donnees
- [ ] Parcours basculement : 3 playspaces → Basculement entre tous → Creation character dans chacun
- [ ] Parcours suppression : Creation → Modification → Suppression avec confirmation
- [ ] Minimum 24 tests E2E executables
- [ ] Coverage E2E : tous parcours critiques utilisateur

**Labels** : `tests`, `e2e`, `P0`, `XL`
**Milestone** : `v1.0 - MVP Complete`
**Estimation** : 2-5 jours (XL)
**Dependencies** : #38, #39, #40, #41

---

#### Issue #49 : Optimisations Performance

**Titre** : [PERF] Optimisations performance globales

**Description** :
Audit et optimisation performances de l'application.

**Acceptance Criteria** :
- [ ] Lazy loading routes Nuxt
- [ ] Code splitting composants lourds
- [ ] Optimisation images (compression, lazy loading)
- [ ] Debounce recherches (300ms)
- [ ] Cache API queries (5 minutes)
- [ ] Index DB sur colonnes frequemment queryees
- [ ] Benchmark : Chargement liste playspaces < 500ms
- [ ] Benchmark : Basculement playspace < 2s
- [ ] Benchmark : Creation character < 1s
- [ ] Lighthouse score > 90 (Performance, Accessibility, Best Practices)

**Labels** : `performance`, `optimization`, `P1`, `M`
**Milestone** : `v1.0 - MVP Complete`
**Estimation** : 4-8h (M)
**Dependencies** : #48

---

#### Issue #50 : Documentation Utilisateur Finale + Deployment

**Titre** : [DOCS] Documentation finale et deployment production

**Description** :
Documentation utilisateur complete et deployment production.

**Acceptance Criteria** :
- [ ] Guide demarrage rapide (Quick Start)
- [ ] FAQ complete (30+ questions)
- [ ] Tutoriels videos (3-5 videos courtes)
- [ ] Changelog MVP v1.0
- [ ] Guide contribution (CONTRIBUTING.md)
- [ ] Deployment Vercel production avec variables env
- [ ] Domain custom configure (brumisa3.com ou similaire)
- [ ] HTTPS obligatoire
- [ ] Monitoring erreurs (Sentry ou similaire)
- [ ] Analytics basiques (Plausible ou similaire)

**Labels** : `docs`, `deployment`, `P0`, `L`
**Milestone** : `v1.0 - MVP Complete`
**Estimation** : 1-2 jours (L)
**Dependencies** : #48, #49

---

## Template d'Issue

Utiliser ce template pour toutes les nouvelles issues GitHub.

```markdown
## Description
[Description claire de la fonctionnalite ou du bug]

## Acceptance Criteria
- [ ] Critere 1
- [ ] Critere 2
- [ ] Critere 3

## Technical Details
[Details techniques : API routes, composants Vue, schemas Prisma, etc.]

## Dependencies
- Bloque par : #X, #Y
- Bloque : #Z

## Estimation
[XS/S/M/L/XL] - [Heures estimees]

## Labels
[Liste des labels]

## Milestone
[Nom de la milestone]

## Assignees
[Developpeur assigne]

## Additional Notes
[Notes supplementaires, liens vers documentation, screenshots, etc.]
```

---

## Priorisation et Labels

### Labels de Priorite

- **P0** : Critique pour MVP - Bloquant
- **P1** : Important - Requis pour MVP
- **P2** : Nice to have - Reportable en v1.x
- **P3** : Future - Hors scope MVP

### Labels de Type

- **feature** : Nouvelle fonctionnalite
- **bug** : Correction de bug
- **enhancement** : Amelioration existant
- **documentation** : Documentation utilisateur ou technique
- **tests** : Tests unitaires, integration, E2E
- **refactor** : Refactoring code (pas de changement fonctionnel)
- **performance** : Optimisation performances
- **security** : Securite et validation

### Labels de Domaine

- **auth** : Authentification et sessions
- **playspaces** : Gestion playspaces
- **characters** : Gestion personnages
- **theme-cards** : Theme Cards LITM
- **hero-card** : Hero Card LITM
- **trackers** : Trackers (Status, Story tag, Story theme)
- **export** : Export JSON/PDF
- **ui** : Interface utilisateur
- **api** : API routes Nitro
- **database** : Schema Prisma et migrations
- **state** : Stores Pinia
- **validation** : Validation Zod et business rules

### Labels d'Estimation

- **XS** : < 2h
- **S** : 2-4h
- **M** : 4-8h (1 jour)
- **L** : 1-2 jours
- **XL** : 2-5 jours

### Labels de Statut

- **in-progress** : En cours de developpement
- **blocked** : Bloque par autre issue
- **ready** : Pret a developper
- **review** : En review de code
- **done** : Termine et merge

---

## Workflow GitHub

### Cycle de Vie d'une Issue

1. **Creation** : Issue creee avec template, labels, milestone, estimation
2. **Ready** : Issue prete a developper (dependencies resolues)
3. **In Progress** : Developpeur assigne, branche creee
4. **Review** : PR creee, code review demandee
5. **Done** : PR mergee, issue fermee

### Branches Git

Format : `[type]/[issue-number]-[short-description]`

Exemples :
- `feature/9-api-routes-playspaces`
- `fix/23-theme-card-validation-bug`
- `docs/50-user-documentation`

### Pull Requests

Format titre : `[Type] #[Issue] - [Description courte]`

Exemples :
- `[Feature] #9 - API routes CRUD Playspaces`
- `[Fix] #23 - Correction validation Theme Cards`
- `[Docs] #50 - Documentation utilisateur complete`

---

---

## v1.1 - Ameliorations UX (Issues #51-#65)

---

#### Issue #51 : Dark Mode - Theme Sombre

**Titre** : [UI] Implementer dark mode avec toggle

**Description** :
Ajout du theme sombre avec toggle dans header pour meilleure experience utilisateur.

**Acceptance Criteria** :
- [ ] Toggle dark mode dans header (icone soleil/lune)
- [ ] Palette dark mode coherente (bg dark, texte clair)
- [ ] Preference sauvegardee localStorage (persistance)
- [ ] Respect preference systeme (prefers-color-scheme)
- [ ] Transition smooth entre themes (< 300ms)
- [ ] Contraste WCAG AA maintenu en dark mode
- [ ] Tous composants compatibles dark mode
- [ ] Tests visuels : Screenshots dark mode tous composants

**Labels** : `ui`, `dark-mode`, `P1`, `M`
**Milestone** : `v1.1 - Ameliorations UX`
**Estimation** : 4-8h (M)
**Dependencies** : #7

---

#### Issue #52 : Mobile Responsive - Breakpoints

**Titre** : [UI] Implementer responsive mobile (768px, 1024px)

**Description** :
Adaptation interface pour tablettes et mobiles avec breakpoints 768px et 1024px.

**Acceptance Criteria** :
- [ ] Breakpoint 768px : Sidebar collapse en menu hamburger
- [ ] Breakpoint 1024px : Layout optimise tablette
- [ ] Navigation mobile : Menu hamburger fonctionnel
- [ ] Theme Cards : Affichage empile sur mobile
- [ ] Formulaires : Touch-friendly (boutons > 44px)
- [ ] Tests responsive : Chrome DevTools (iPhone, iPad, Android)
- [ ] Performance mobile : Lighthouse score > 85
- [ ] Gestures : Swipe navigation entre sections

**Labels** : `ui`, `responsive`, `mobile`, `P1`, `L`
**Milestone** : `v1.1 - Ameliorations UX`
**Estimation** : 1-2 jours (L)
**Dependencies** : #7

---

#### Issue #53 : Undo/Redo Personnages

**Titre** : [FEATURE] Implementer Undo/Redo avec VueUse useRefHistory

**Description** :
Systeme undo/redo pour editions personnages avec VueUse useRefHistory.

**Acceptance Criteria** :
- [ ] VueUse useRefHistory integre pour state personnage
- [ ] Raccourcis clavier : Ctrl+Z (undo), Ctrl+Y (redo)
- [ ] Indicateurs UI : Boutons undo/redo (actifs/desactives)
- [ ] Historique : Garde 50 dernieres modifications
- [ ] Toast confirmation : "Modification annulee" / "Modification retablie"
- [ ] Performance : Undo/redo < 100ms
- [ ] Tests unitaires : 10 modifications, undo 5, redo 3

**Labels** : `feature`, `ux`, `characters`, `P1`, `M`
**Milestone** : `v1.1 - Ameliorations UX`
**Estimation** : 4-8h (M)
**Dependencies** : #18

---

#### Issue #54 : Raccourcis Clavier Basiques

**Titre** : [UX] Implementer raccourcis clavier essentiels

**Description** :
Raccourcis clavier pour actions frequentes (sauvegarde, navigation).

**Acceptance Criteria** :
- [ ] Ctrl+S : Sauvegarde personnage
- [ ] Ctrl+N : Nouveau personnage
- [ ] Ctrl+K : Command palette (recherche globale)
- [ ] Esc : Fermer modals
- [ ] Tab : Navigation clavier formulaires
- [ ] Indicateur raccourcis : Tooltips affichent shortcuts
- [ ] Documentation : Page help avec tous shortcuts
- [ ] Accessibilite : Navigation complete au clavier

**Labels** : `ux`, `accessibility`, `P1`, `S`
**Milestone** : `v1.1 - Ameliorations UX`
**Estimation** : 2-4h (S)
**Dependencies** : #7

---

#### Issue #55 : Tutoriel Interactif Onboarding

**Titre** : [UX] Creer tutoriel interactif avec Shepherd.js

**Description** :
Tutoriel step-by-step pour nouveaux utilisateurs avec overlay highlights.

**Acceptance Criteria** :
- [ ] Shepherd.js integre
- [ ] Tour onboarding : 5 etapes (playspace, personnage, theme cards, hero card, trackers)
- [ ] Highlights elements cles (boutons, champs)
- [ ] Boutons navigation : Precedent, Suivant, Skip
- [ ] Preference sauvegardee : "Ne plus afficher"
- [ ] Declencheur : Premiere visite (localStorage)
- [ ] Tests E2E : Tour complet fonctionnel

**Labels** : `ux`, `onboarding`, `P1`, `M`
**Milestone** : `v1.1 - Ameliorations UX`
**Estimation** : 4-8h (M)
**Dependencies** : #11, #19

---

#### Issue #56 : Animations et Transitions

**Titre** : [UI] Ajouter animations Vue Transition Group

**Description** :
Animations fluides pour navigation, modals, listes avec Vue Transition Group.

**Acceptance Criteria** :
- [ ] Transitions navigation : Fade 300ms
- [ ] Modal enter/leave : Scale + fade 200ms
- [ ] Liste personnages : Stagger animation (items apparaissent progressivement)
- [ ] Theme Cards drag : Smooth reordering
- [ ] Loading states : Skeleton loaders
- [ ] Performance : 60 FPS maintenu
- [ ] Preference : Option desactiver animations (accessibilite)

**Labels** : `ui`, `animations`, `P1`, `M`
**Milestone** : `v1.1 - Ameliorations UX`
**Estimation** : 4-8h (M)
**Dependencies** : #7

---

#### Issue #57 : Accessibilite WCAG 2.1 AA

**Titre** : [A11Y] Audit et mise en conformite WCAG 2.1 AA

**Description** :
Audit accessibilite complet et corrections pour conformite WCAG 2.1 niveau AA.

**Acceptance Criteria** :
- [ ] Contraste : 4.5:1 texte, 3:1 UI (verification Axe DevTools)
- [ ] Labels ARIA : Tous inputs, buttons, links
- [ ] Focus visible : Outline/ring sur tous elements interactifs
- [ ] Navigation clavier : Tab order logique
- [ ] Alt text : Toutes images decoratives ou informatives
- [ ] Lecteurs ecran : Test NVDA/JAWS
- [ ] Skip links : "Skip to content"
- [ ] Lighthouse Accessibility score > 95

**Labels** : `accessibility`, `a11y`, `P1`, `L`
**Milestone** : `v1.1 - Ameliorations UX`
**Estimation** : 1-2 jours (L)
**Dependencies** : #7, #52

---

#### Issue #58 : Performance Mobile Optimisation

**Titre** : [PERF] Optimisations performance mobile

**Description** :
Optimisations specifiques mobile pour experience fluide (lazy loading, code splitting).

**Acceptance Criteria** :
- [ ] Lazy loading images (loading="lazy")
- [ ] Code splitting routes (Nuxt dynamic imports)
- [ ] Prefetch critical resources
- [ ] Service Worker : Cache assets statiques
- [ ] Compression Brotli/Gzip
- [ ] Lighthouse Mobile score > 85
- [ ] First Contentful Paint < 1.5s (3G)
- [ ] Time to Interactive < 3s (3G)

**Labels** : `performance`, `mobile`, `P1`, `M`
**Milestone** : `v1.1 - Ameliorations UX`
**Estimation** : 4-8h (M)
**Dependencies** : #52

---

#### Issue #59 : Command Palette (Cmd+K)

**Titre** : [FEATURE] Implementer command palette recherche globale

**Description** :
Command palette style VS Code pour recherche rapide actions et navigation.

**Acceptance Criteria** :
- [ ] Raccourci : Ctrl+K (Windows), Cmd+K (Mac)
- [ ] Recherche fuzzy : Personnages, playspaces, actions
- [ ] Navigation clavier : Fleches, Enter
- [ ] Actions rapides : Creer personnage, exporter, basculer theme
- [ ] Historique : Derniere recherches
- [ ] Performance : Recherche < 50ms
- [ ] UI : Modal centree, backdrop blur

**Labels** : `feature`, `ux`, `search`, `P2`, `M`
**Milestone** : `v1.1 - Ameliorations UX`
**Estimation** : 4-8h (M)
**Dependencies** : #54

---

#### Issue #60 : Sidebar Collapsible

**Titre** : [UI] Sidebar playspaces collapsible

**Description** :
Sidebar collapsible pour gagner espace ecran (mode collapsed : icones only).

**Acceptance Criteria** :
- [ ] Bouton toggle collapse (icone chevron)
- [ ] Mode collapsed : Icones playspaces + tooltip nom
- [ ] Mode expanded : Noms complets + meta (nombre personnages)
- [ ] Transition smooth : 200ms
- [ ] Preference sauvegardee : localStorage
- [ ] Responsive : Auto-collapse < 1024px
- [ ] Largeur collapsed : 64px, expanded : 280px

**Labels** : `ui`, `sidebar`, `P2`, `S`
**Milestone** : `v1.1 - Ameliorations UX`
**Estimation** : 2-4h (S)
**Dependencies** : #13

---

#### Issue #61 : Tests E2E Mobile - Playwright

**Titre** : [TESTS] Tests E2E mobile avec Playwright

**Description** :
Suite tests E2E pour parcours mobile (iPhone, Android).

**Acceptance Criteria** :
- [ ] Test : Navigation mobile avec hamburger menu
- [ ] Test : Creation personnage mobile (touch)
- [ ] Test : Swipe entre sections
- [ ] Test : Rotation portrait/landscape
- [ ] Devices : iPhone 12, Pixel 5, iPad
- [ ] Coverage : Parcours critiques mobile
- [ ] CI/CD : Tests mobile executables

**Labels** : `tests`, `e2e`, `mobile`, `P1`, `M`
**Milestone** : `v1.1 - Ameliorations UX`
**Estimation** : 4-8h (M)
**Dependencies** : #52

---

#### Issue #62 : PWA Manifest et Install Prompt

**Titre** : [PWA] Ajouter manifest.json et install prompt

**Description** :
Configuration PWA basique avec manifest pour "Add to Home Screen".

**Acceptance Criteria** :
- [ ] manifest.json : name, icons, theme_color, background_color
- [ ] Icons : 192x192, 512x512 (PNG)
- [ ] Install prompt : Affiche au 3eme visite
- [ ] Bouton manuel : "Installer l'application"
- [ ] Splash screen : Logo + couleur theme
- [ ] Tests : Chrome, Edge, Safari iOS
- [ ] Lighthouse PWA score > 80

**Labels** : `pwa`, `mobile`, `P2`, `S`
**Milestone** : `v1.1 - Ameliorations UX`
**Estimation** : 2-4h (S)
**Dependencies** : #58

---

#### Issue #63 : Skeleton Loaders

**Titre** : [UI] Implementer skeleton loaders

**Description** :
Skeleton loaders pour listes et details (meilleure perception performance).

**Acceptance Criteria** :
- [ ] Skeleton liste personnages : 3 placeholders
- [ ] Skeleton detail personnage : Structure complete
- [ ] Animation shimmer : Effet "chargement"
- [ ] Affichage : Si chargement > 300ms
- [ ] Transition : Fade vers contenu reel
- [ ] Composant reutilisable : SkeletonLoader.vue
- [ ] Tests visuels : Storybook

**Labels** : `ui`, `loading`, `P2`, `S`
**Milestone** : `v1.1 - Ameliorations UX`
**Estimation** : 2-4h (S)
**Dependencies** : #47

---

#### Issue #64 : Gamification Badges

**Titre** : [FEATURE] Systeme badges premiers milestones

**Description** :
Gamification soft avec badges premiers accomplissements (onboarding).

**Acceptance Criteria** :
- [ ] Badge "Premier Pas" : Playspace cree
- [ ] Badge "Createur" : Premier personnage cree
- [ ] Badge "Equipe Complete" : 3 personnages crees
- [ ] Badge "Narrateur" : Premier oracle lance
- [ ] UI : Modal celebration deblocage badge
- [ ] Page profil : Liste badges obtenus
- [ ] Progression : Indicateur badges a debloquer

**Labels** : `feature`, `gamification`, `P2`, `M`
**Milestone** : `v1.1 - Ameliorations UX`
**Estimation** : 4-8h (M)
**Dependencies** : #50

---

#### Issue #65 : Documentation UX v1.1

**Titre** : [DOCS] Documentation utilisateur ameliorations v1.1

**Description** :
Guide utilisateur pour nouvelles fonctionnalites v1.1.

**Acceptance Criteria** :
- [ ] Guide dark mode : Activer/desactiver
- [ ] Guide mobile : Navigation, gestures
- [ ] Guide raccourcis clavier : Liste complete
- [ ] Guide undo/redo : Annuler modifications
- [ ] Video courte : Tour nouvelles features (2min)
- [ ] Changelog v1.1 : Liste complete ameliorations

**Labels** : `docs`, `P1`, `S`
**Milestone** : `v1.1 - Ameliorations UX`
**Estimation** : 2-4h (S)
**Dependencies** : #51, #52, #53, #54, #55

---

## v1.3 - Import/Export Avance (Issues #66-#75)

---

#### Issue #66 : Import JSON Personnages

**Titre** : [API] Creer API route import JSON personnages

**Description** :
Implementation import JSON compatible characters-of-the-mist avec validation.

**Acceptance Criteria** :
- [ ] POST /api/characters/import : Upload fichier JSON
- [ ] Validation schema : JSON Schema characters-of-the-mist
- [ ] Validation version : Compatibilite v1.0+
- [ ] Mapping IDs : Resolution conflits IDs existants
- [ ] Preview import : Affichage donnees avant confirmation
- [ ] Confirmation utilisateur : Modal avec details
- [ ] Tests unitaires : Import valide, invalide, conflits

**Labels** : `api`, `import`, `P1`, `M`
**Milestone** : `v1.3 - Import/Export Avance`
**Estimation** : 4-8h (M)
**Dependencies** : #43

---

#### Issue #67 : UI Import Personnages

**Titre** : [UI] Interface upload et preview import JSON

**Description** :
Interface utilisateur pour upload fichier JSON et preview avant import.

**Acceptance Criteria** :
- [ ] Bouton "Importer JSON" sur liste personnages
- [ ] Drag & drop zone : Upload fichier .json
- [ ] Validation client : Format JSON, taille < 5MB
- [ ] Preview import : Affichage nom, niveau, theme cards count
- [ ] Gestion conflits : "Personnage existe deja, remplacer ?"
- [ ] Progress indicator : Upload et parsing
- [ ] Message succes : "Personnage importe avec succes"

**Labels** : `ui`, `import`, `P1`, `M`
**Milestone** : `v1.3 - Import/Export Avance`
**Estimation** : 4-8h (M)
**Dependencies** : #66

---

#### Issue #68 : Import Multiple Personnages (Batch)

**Titre** : [FEATURE] Import batch personnages depuis ZIP

**Description** :
Import multiple personnages depuis fichier ZIP (export playspace).

**Acceptance Criteria** :
- [ ] Upload fichier ZIP : Max 50MB
- [ ] Extraction ZIP : JSZip library
- [ ] Lecture manifest.json : Liste personnages
- [ ] Import batch : Tous personnages en une operation
- [ ] Progress bar : X/N personnages importes
- [ ] Gestion erreurs : Continue import si echec individuel
- [ ] Rapport final : "10/12 personnages importes, 2 echecs"

**Labels** : `feature`, `import`, `batch`, `P1`, `L`
**Milestone** : `v1.3 - Import/Export Avance`
**Estimation** : 1-2 jours (L)
**Dependencies** : #67

---

#### Issue #69 : Export vers Foundry VTT

**Titre** : [EXPORT] Export personnages format Foundry VTT

**Description** :
Export personnages LITM au format JSON Foundry VTT compatible.

**Acceptance Criteria** :
- [ ] API route : GET /api/characters/:id/export/foundry
- [ ] Format Foundry : Actor JSON compatible Foundry v11+
- [ ] Mapping champs : Theme Cards → Items, Hero Card → Biography
- [ ] Export complet : Character + Theme Cards + Hero Card + Trackers
- [ ] Metadata : Source "Brumisa3", date export
- [ ] Tests : Import dans Foundry VTT (manuel)
- [ ] Documentation : Guide import Foundry

**Labels** : `export`, `foundry`, `integration`, `P2`, `M`
**Milestone** : `v1.3 - Import/Export Avance`
**Estimation** : 4-8h (M)
**Dependencies** : #43

---

#### Issue #70 : Validation Import avec Schema

**Titre** : [VALIDATION] Validation import JSON Schema

**Description** :
Validation stricte import avec JSON Schema pour securite.

**Acceptance Criteria** :
- [ ] JSON Schema : Definition schema characters-of-the-mist
- [ ] Validation AJV : Validation avant import
- [ ] Messages erreur clairs : "Champ X invalide : raison"
- [ ] Validation business : Min 2 Theme Cards, max 4
- [ ] Sanitisation : XSS prevention, SQL injection
- [ ] Tests validation : 10 fichiers invalides
- [ ] Performance : Validation < 100ms pour fichier 5MB

**Labels** : `validation`, `security`, `import`, `P1`, `S`
**Milestone** : `v1.3 - Import/Export Avance`
**Estimation** : 2-4h (S)
**Dependencies** : #66

---

#### Issue #71 : Export Markdown Documentation

**Titre** : [EXPORT] Export personnage en Markdown

**Description** :
Export personnage format Markdown pour documentation/wiki.

**Acceptance Criteria** :
- [ ] API route : GET /api/characters/:id/export/markdown
- [ ] Format Markdown : Titres, listes, tableaux
- [ ] Sections : Informations, Theme Cards, Hero Card, Trackers
- [ ] Syntax highlighting : Code blocks pour tags
- [ ] Metadata frontmatter : YAML header
- [ ] Telechargement : Fichier .md
- [ ] Documentation : Exemple utilisation World Anvil

**Labels** : `export`, `markdown`, `documentation`, `P2`, `S`
**Milestone** : `v1.3 - Import/Export Avance`
**Estimation** : 2-4h (S)
**Dependencies** : #43

---

#### Issue #72 : Tests E2E Import/Export

**Titre** : [TESTS] Tests E2E import/export personnages

**Description** :
Suite tests E2E couvrant parcours import/export complets.

**Acceptance Criteria** :
- [ ] Test : Export JSON → Import JSON (round-trip)
- [ ] Test : Export ZIP playspace → Import batch
- [ ] Test : Import fichier invalide (rejection)
- [ ] Test : Import avec conflits IDs (resolution)
- [ ] Coverage : Tous formats export (JSON, Markdown)
- [ ] CI/CD : Tests executables automatiquement

**Labels** : `tests`, `e2e`, `import`, `export`, `P1`, `M`
**Milestone** : `v1.3 - Import/Export Avance`
**Estimation** : 4-8h (M)
**Dependencies** : #67, #71

---

#### Issue #73 : Documentation Import/Export v1.3

**Titre** : [DOCS] Guide import/export avance

**Description** :
Documentation complete fonctionnalites import/export v1.3.

**Acceptance Criteria** :
- [ ] Guide import JSON : Step-by-step avec screenshots
- [ ] Guide Foundry VTT : Import dans Foundry
- [ ] Guide batch import : ZIP multiple personnages
- [ ] Guide export Markdown : World Anvil integration
- [ ] FAQ : "Format JSON non reconnu", "Conflits IDs"
- [ ] Video : Demo import/export (3min)

**Labels** : `docs`, `P1`, `S`
**Milestone** : `v1.3 - Import/Export Avance`
**Estimation** : 2-4h (S)
**Dependencies** : #67, #71

---

#### Issue #74-#75 : Issues Futures v1.3

**Note** : Issues #74-#75 reservees pour ameliorations futures Import/Export (optimisations, nouveaux formats) identifiees pendant developpement.

---

## v2.0 - Ameliorations Majeures (Issues #76-#105)

---

#### Issue #76 : Infrastructure Canvas Konva.js

**Titre** : [SETUP] Integrer Konva.js pour canvas Investigation Board

**Description** :
Setup Konva.js pour canvas interactif Investigation Board.

**Acceptance Criteria** :
- [ ] Konva.js + vue-konva installes
- [ ] Composant BoardCanvas.vue avec stage Konva
- [ ] Dimensions canvas : Viewport responsive (min 800x600)
- [ ] Background grid : Points 20px spacing
- [ ] Performance : 60 FPS avec 100 elements
- [ ] Tests unitaires : Render canvas, add shapes
- [ ] Documentation : Architecture Konva integration

**Labels** : `setup`, `investigation-board`, `canvas`, `P0`, `M`
**Milestone** : `v2.0 - Ameliorations Majeures`
**Estimation** : 4-8h (M)
**Dependencies** : Aucune

---

#### Issue #77 : Notes Texte Draggables

**Titre** : [FEATURE] Creer notes texte draggables sur canvas

**Description** :
Systeme notes texte draggables pour Investigation Board.

**Acceptance Criteria** :
- [ ] Creation note : Double-clic sur canvas
- [ ] Edition note : Double-clic sur note existante
- [ ] Drag & drop : Deplacement notes
- [ ] Styles : Couleurs personnalisables (yellow, blue, red, green)
- [ ] Taille : Auto-resize selon contenu (min 100x100px)
- [ ] Persistence : Sauvegarde position + contenu BDD
- [ ] Tests E2E : Creer, deplacer, editer, supprimer note

**Labels** : `feature`, `investigation-board`, `notes`, `P0`, `L`
**Milestone** : `v2.0 - Ameliorations Majeures`
**Estimation** : 1-2 jours (L)
**Dependencies** : #76

---

#### Issue #78 : Notes Photo Upload

**Titre** : [FEATURE] Upload et affichage photos sur canvas

**Description** :
Upload images/photos pour notes visuelles Investigation Board.

**Acceptance Criteria** :
- [ ] Upload image : Drag & drop ou bouton
- [ ] Formats : PNG, JPG, WebP (max 5MB)
- [ ] Resize automatique : Max 400x400px
- [ ] Stockage : Cloud storage (Cloudinary ou S3)
- [ ] Affichage canvas : Image node Konva
- [ ] Drag & drop images : Deplacement sur canvas
- [ ] Suppression : Clic droit → Delete

**Labels** : `feature`, `investigation-board`, `images`, `P0`, `M`
**Milestone** : `v2.0 - Ameliorations Majeures`
**Estimation** : 4-8h (M)
**Dependencies** : #76

---

#### Issue #79 : Connexions entre Notes

**Titre** : [FEATURE] Creer connexions lignes entre notes

**Description** :
Systeme connexions visuelles (lignes) entre notes pour liens logiques.

**Acceptance Criteria** :
- [ ] Creation connexion : Drag depuis note source vers note cible
- [ ] Styles ligne : Solide, pointillee, epaisseur, couleur
- [ ] Fleches directionnelles : Optionnelles (unidirectionnelle, bidirectionnelle)
- [ ] Labels connexion : Texte optionnel sur ligne
- [ ] Suppression : Clic droit sur ligne → Delete
- [ ] Auto-routing : Lignes evitent notes (pathfinding basique)
- [ ] Persistence : Sauvegarde connexions BDD

**Labels** : `feature`, `investigation-board`, `connections`, `P0`, `L`
**Milestone** : `v2.0 - Ameliorations Majeures`
**Estimation** : 1-2 jours (L)
**Dependencies** : #77

---

#### Issue #80 : Drag & Drop Canvas

**Titre** : [FEATURE] Ameliorer drag & drop experience

**Description** :
Experience drag & drop fluide avec feedback visuel.

**Acceptance Criteria** :
- [ ] Drag notes : Cursor grab pendant drag
- [ ] Snap to grid : Optionnel (toggle)
- [ ] Multi-selection : Ctrl+clic pour selectionner plusieurs notes
- [ ] Drag multiple : Deplacer selection en bloc
- [ ] Boundaries : Notes restent dans canvas (pas hors limite)
- [ ] Undo drag : Ctrl+Z annule deplacement
- [ ] Performance : 60 FPS meme avec 50 notes

**Labels** : `feature`, `investigation-board`, `ux`, `P0`, `M`
**Milestone** : `v2.0 - Ameliorations Majeures`
**Estimation** : 4-8h (M)
**Dependencies** : #77

---

#### Issue #81 : Zoom et Pan Canvas

**Titre** : [FEATURE] Zoom et pan Investigation Board

**Description** :
Navigation canvas avec zoom (molette) et pan (drag background).

**Acceptance Criteria** :
- [ ] Zoom : Molette souris (0.5x a 3x)
- [ ] Pan : Drag background ou espace+drag
- [ ] Minimap : Overview canvas avec viewport indicator
- [ ] Reset view : Bouton "Recentrer" (Ctrl+0)
- [ ] Zoom sur selection : Fit selected notes
- [ ] Performance : Smooth 60 FPS
- [ ] Persistence : Sauvegarde zoom/pan level

**Labels** : `feature`, `investigation-board`, `navigation`, `P0`, `M`
**Milestone** : `v2.0 - Ameliorations Majeures`
**Estimation** : 4-8h (M)
**Dependencies** : #76

---

#### Issue #82 : Export PNG/SVG Board

**Titre** : [EXPORT] Export Investigation Board PNG/SVG

**Description** :
Export canvas Investigation Board en image PNG ou SVG.

**Acceptance Criteria** :
- [ ] Bouton "Exporter PNG" : Telechargement image
- [ ] Bouton "Exporter SVG" : Telechargement vectoriel
- [ ] Resolution PNG : 2x (retina quality)
- [ ] Background : Transparent ou blanc (option)
- [ ] Nom fichier : board-{playspace}-{date}.png
- [ ] Preview : Avant telechargement
- [ ] Tests : Export board avec 20 notes

**Labels** : `export`, `investigation-board`, `P1`, `S`
**Milestone** : `v2.0 - Ameliorations Majeures`
**Estimation** : 2-4h (S)
**Dependencies** : #76

---

#### Issue #83 : Sauvegarde Automatique Board

**Titre** : [FEATURE] Sauvegarde automatique Investigation Board

**Description** :
Auto-save positions, contenu, connexions toutes les 30s.

**Acceptance Criteria** :
- [ ] Auto-save : Debounced 30s apres derniere modification
- [ ] Indicateur : "Sauvegarde il y a Xs"
- [ ] Conflict resolution : Derniere modification gagne
- [ ] Offline support : Queue modifications si offline
- [ ] Performance : Sauvegarde < 500ms
- [ ] Tests : 50 modifications, verifier toutes sauvegardees
- [ ] Rollback : Possibilite annuler si erreur

**Labels** : `feature`, `investigation-board`, `persistence`, `P0`, `M`
**Milestone** : `v2.0 - Ameliorations Majeures`
**Estimation** : 4-8h (M)
**Dependencies** : #77, #79

---

#### Issue #84 : Isolation Board par Playspace

**Titre** : [ARCHITECTURE] Isoler boards par playspace

**Description** :
Chaque playspace a son Investigation Board independant.

**Acceptance Criteria** :
- [ ] Schema BDD : Table investigation_boards (playspaceId FK)
- [ ] CRUD API : /api/playspaces/:id/board
- [ ] Isolation : Board accessible uniquement par owner playspace
- [ ] Basculement playspace : Charge board correspondant
- [ ] Performance : Chargement board < 1s
- [ ] Tests : 3 playspaces, 3 boards differents
- [ ] Migrations : Ajout tables boards, notes, connections

**Labels** : `architecture`, `investigation-board`, `database`, `P0`, `M`
**Milestone** : `v2.0 - Ameliorations Majeures`
**Estimation** : 4-8h (M)
**Dependencies** : #76

---

#### Issue #85 : Templates Board (Detective, Complot, Relation)

**Titre** : [FEATURE] Templates Investigation Board predéfinis

**Description** :
Templates Investigation Board pour demarrage rapide.

**Acceptance Criteria** :
- [ ] Template "Detective" : Sections Suspects, Indices, Lieux
- [ ] Template "Complot" : Sections Factions, Objectifs, Obstacles
- [ ] Template "Relation" : Sections Personnages, Relations, Conflits
- [ ] Selection template : Modal creation board
- [ ] Preview templates : Miniatures avant selection
- [ ] Personnalisation : Modifier apres application template
- [ ] Tests : Appliquer 3 templates, verifier structure

**Labels** : `feature`, `investigation-board`, `templates`, `P1`, `M`
**Milestone** : `v2.0 - Ameliorations Majeures`
**Estimation** : 4-8h (M)
**Dependencies** : #77, #79

---

#### Issue #86 : Mode Offline Investigation Board

**Titre** : [FEATURE] Investigation Board fonctionnel offline

**Description** :
Investigation Board utilisable sans connexion avec sync.

**Acceptance Criteria** :
- [ ] Cache IndexedDB : Board complet (notes, connexions, images)
- [ ] Modifications offline : Queue avec sync automatique
- [ ] Indicateur offline : Badge "Mode hors ligne"
- [ ] Sync retour online : Auto-sync modifications
- [ ] Conflict resolution : Derniere modif gagne
- [ ] Tests offline : Modifier board, reconnexion, verifier sync
- [ ] Performance : Chargement offline < 300ms

**Labels** : `feature`, `investigation-board`, `offline`, `P1`, `L`
**Milestone** : `v2.0 - Ameliorations Majeures`
**Estimation** : 1-2 jours (L)
**Dependencies** : #83, #84

---

#### Issue #87 : Recherche Notes Board

**Titre** : [FEATURE] Recherche et filtre notes Investigation Board

**Description** :
Recherche texte dans notes avec highlight resultats.

**Acceptance Criteria** :
- [ ] Barre recherche : Input avec debounce 300ms
- [ ] Recherche fuzzy : Nom et contenu notes
- [ ] Highlight resultats : Notes matchantes surlignees
- [ ] Filtre couleur : Afficher notes couleur X uniquement
- [ ] Filtre type : Notes texte vs photos
- [ ] Navigation resultats : Fleches precedent/suivant
- [ ] Performance : Recherche < 50ms sur 100 notes

**Labels** : `feature`, `investigation-board`, `search`, `P2`, `S`
**Milestone** : `v2.0 - Ameliorations Majeures`
**Estimation** : 2-4h (S)
**Dependencies** : #77

---

#### Issue #88 : Groupes et Layers Notes

**Titre** : [FEATURE] Organiser notes en groupes/layers

**Description** :
Groupement notes et gestion layers pour organisation.

**Acceptance Criteria** :
- [ ] Groupes : Selectionner notes → Creer groupe
- [ ] Layers : 3 layers (Background, Main, Foreground)
- [ ] Z-index : Ordre affichage notes
- [ ] Collapse groupe : Masquer/afficher notes groupe
- [ ] Drag groupe : Deplacer toutes notes groupe
- [ ] UI layers : Panel gauche avec liste layers
- [ ] Persistence : Sauvegarde groupes/layers BDD

**Labels** : `feature`, `investigation-board`, `organization`, `P2`, `M`
**Milestone** : `v2.0 - Ameliorations Majeures`
**Estimation** : 4-8h (M)
**Dependencies** : #77

---

#### Issue #89 : Commentaires Notes

**Titre** : [FEATURE] Systeme commentaires sur notes

**Description** :
Commentaires collaboratifs sur notes Investigation Board.

**Acceptance Criteria** :
- [ ] Icone commentaire : Badge nombre commentaires
- [ ] Modal commentaires : Clic sur icone
- [ ] Ajout commentaire : Textarea + bouton
- [ ] Affichage : Liste chronologique (plus recent en haut)
- [ ] Suppression : Createur peut supprimer son commentaire
- [ ] Notifications : Badge si nouveau commentaire (v2.5)
- [ ] Tests : 5 commentaires sur note, verifier affichage

**Labels** : `feature`, `investigation-board`, `comments`, `P2`, `M`
**Milestone** : `v2.0 - Ameliorations Majeures`
**Estimation** : 4-8h (M)
**Dependencies** : #77

---

#### Issue #90 : Historique Modifications Board

**Titre** : [FEATURE] Historique modifications Investigation Board

**Description** :
Historique complet modifications avec possibilite rollback.

**Acceptance Criteria** :
- [ ] Log modifications : Toutes actions (creation, deplacement, suppression)
- [ ] UI historique : Timeline modifications
- [ ] Details : Utilisateur, timestamp, type action
- [ ] Rollback : Annuler action specifique (preview)
- [ ] Retention : Garde 30 derniers jours
- [ ] Performance : Chargement historique < 1s
- [ ] Tests : 20 modifications, verifier log complet

**Labels** : `feature`, `investigation-board`, `history`, `P2`, `M`
**Milestone** : `v2.0 - Ameliorations Majeures`
**Estimation** : 4-8h (M)
**Dependencies** : #83

---

#### Issue #91 : Toolbar Investigation Board

**Titre** : [UI] Toolbar actions Investigation Board

**Description** :
Toolbar avec actions rapides Investigation Board.

**Acceptance Criteria** :
- [ ] Boutons : Ajouter note, Ajouter image, Connexion, Zoom
- [ ] Toggles : Snap to grid, Show grid, Dark mode
- [ ] Undo/Redo : Historique modifications
- [ ] Export : PNG, SVG, JSON
- [ ] Selection mode : Cursor select vs pan mode
- [ ] Raccourcis : Tooltips affichent keyboard shortcuts
- [ ] Responsive : Toolbar adapt breakpoints mobiles

**Labels** : `ui`, `investigation-board`, `toolbar`, `P0`, `S`
**Milestone** : `v2.0 - Ameliorations Majeures`
**Estimation** : 2-4h (S)
**Dependencies** : #76

---

#### Issue #92 : Context Menu Canvas

**Titre** : [UI] Context menu clic droit canvas/notes

**Description** :
Menu contextuel clic droit pour actions rapides.

**Acceptance Criteria** :
- [ ] Clic droit canvas : Ajouter note, Ajouter image, Coller
- [ ] Clic droit note : Editer, Dupliquer, Changer couleur, Supprimer
- [ ] Clic droit connexion : Editer label, Supprimer
- [ ] Raccourcis : Copier (Ctrl+C), Coller (Ctrl+V), Supprimer (Del)
- [ ] UI : Menu custom style (pas menu browser natif)
- [ ] Performance : Affichage menu < 50ms
- [ ] Tests : Toutes actions context menu fonctionnelles

**Labels** : `ui`, `investigation-board`, `context-menu`, `P1`, `S`
**Milestone** : `v2.0 - Ameliorations Majeures`
**Estimation** : 2-4h (S)
**Dependencies** : #77

---

#### Issue #93 : Shortcuts Clavier Board

**Titre** : [UX] Raccourcis clavier Investigation Board

**Description** :
Raccourcis clavier pour actions frequentes board.

**Acceptance Criteria** :
- [ ] Ctrl+N : Nouvelle note
- [ ] Ctrl+I : Ajouter image
- [ ] Ctrl+L : Creer connexion (link)
- [ ] Suppr : Supprimer selection
- [ ] Ctrl+Z : Undo, Ctrl+Y : Redo
- [ ] Ctrl+A : Selectionner tout
- [ ] Espace+Drag : Pan canvas
- [ ] Documentation : Overlay help (Ctrl+?)

**Labels** : `ux`, `investigation-board`, `shortcuts`, `P1`, `XS`
**Milestone** : `v2.0 - Ameliorations Majeures`
**Estimation** : < 2h (XS)
**Dependencies** : #77

---

#### Issue #94 : Tests E2E Investigation Board

**Titre** : [TESTS] Tests E2E Investigation Board complets

**Description** :
Suite tests E2E couvrant parcours Investigation Board.

**Acceptance Criteria** :
- [ ] Test : Creer board vide
- [ ] Test : Ajouter 5 notes texte
- [ ] Test : Ajouter 2 images
- [ ] Test : Creer 3 connexions entre notes
- [ ] Test : Drag & drop notes
- [ ] Test : Zoom et pan canvas
- [ ] Test : Export PNG
- [ ] Test : Sauvegarde automatique
- [ ] Coverage : Parcours critiques utilisateur

**Labels** : `tests`, `e2e`, `investigation-board`, `P0`, `L`
**Milestone** : `v2.0 - Ameliorations Majeures`
**Estimation** : 1-2 jours (L)
**Dependencies** : #77, #79, #81, #82

---

#### Issue #95 : Documentation Investigation Board v2.0

**Titre** : [DOCS] Guide utilisateur Investigation Board

**Description** :
Documentation complete Investigation Board v2.0.

**Acceptance Criteria** :
- [ ] Guide demarrage : Creer premier board
- [ ] Guide notes : Texte, images, couleurs
- [ ] Guide connexions : Liens logiques entre notes
- [ ] Guide templates : Detective, Complot, Relation
- [ ] Guide export : PNG, SVG
- [ ] Video demo : Tour Investigation Board (4min)
- [ ] FAQ : 20+ questions frequentes

**Labels** : `docs`, `investigation-board`, `P1`, `M`
**Milestone** : `v2.0 - Ameliorations Majeures`
**Estimation** : 4-8h (M)
**Dependencies** : #94

---

#### Issue #96 : Mode Hors Ligne Complete

**Titre** : [FEATURE] Support complet mode hors ligne application

**Description** :
Application entierement fonctionnelle hors ligne avec Service Worker.

**Acceptance Criteria** :
- [ ] Service Worker : Installation et activation
- [ ] Cache strategie : Network first, fallback cache
- [ ] Offline assets : HTML, CSS, JS caches
- [ ] Background sync : Queue modifications offline
- [ ] Indicateur online/offline : Badge status connexion
- [ ] Tests offline : Navigation complete sans connexion
- [ ] Performance : Chargement offline < 500ms

**Labels** : `feature`, `offline`, `pwa`, `P1`, `L`
**Milestone** : `v2.0 - Ameliorations Majeures`
**Estimation** : 1-2 jours (L)
**Dependencies** : #86

---

#### Issue #97 : Templates PDF Personnalises

**Titre** : [PDF] Creer templates PDF personnalisables

**Description** :
Systeme templates PDF personnalises pour export fiches personnages.

**Acceptance Criteria** :
- [ ] Template par defaut : LITM style officiel
- [ ] Template minimaliste : Version texte simple
- [ ] Template colore : Theme Mythos/Logos colors
- [ ] Editeur template : Champs personnalisables (admin)
- [ ] Preview template : Avant export
- [ ] Sauvegarde preference : localStorage
- [ ] Tests PDF : Generation avec 3 templates

**Labels** : `pdf`, `export`, `templates`, `P1`, `L`
**Milestone** : `v2.0 - Ameliorations Majeures`
**Estimation** : 1-2 jours (L)
**Dependencies** : #43

---

#### Issue #98 : Export PDF Complet PDFKit

**Titre** : [PDF] Generation PDF complete avec PDFKit

**Description** :
Export PDF professionnel avec mise en page avancee PDFKit.

**Acceptance Criteria** :
- [ ] Header personnalise : Logo, nom personnage, niveau
- [ ] Section Theme Cards : Layout 2 colonnes
- [ ] Section Hero Card : Encadres relations, quintessences
- [ ] Section Trackers : Tables status, story tags, themes
- [ ] Footer : Page X/Y, date generation
- [ ] Watermark optionnel : "Cree avec Brumisa3"
- [ ] Taille fichier : < 500KB par personnage

**Labels** : `pdf`, `export`, `P1`, `L`
**Milestone** : `v2.0 - Ameliorations Majeures`
**Estimation** : 1-2 jours (L)
**Dependencies** : #97

---

#### Issue #99-#105 : Issues Techniques Board

**Note** : Issues #99-#105 reservees pour optimisations techniques Investigation Board (performance, securite, refactoring) identifiees pendant developpement.

---

## v2.5 - Mode Multi-Joueurs (Issues #106-#130)

---

#### Issue #106 : Infrastructure WebSocket Nitro h3

**Titre** : [SETUP] Configurer WebSocket avec Nitro h3

**Description** :
Setup infrastructure WebSocket pour communication temps reel.

**Acceptance Criteria** :
- [ ] WebSocket server : Nitro h3 WebSocket handler
- [ ] Connection pooling : Gestion connexions actives
- [ ] Heartbeat : Ping/pong toutes les 30s
- [ ] Reconnexion automatique : Exponential backoff
- [ ] Logs : Connexions, deconnexions, erreurs
- [ ] Tests : 10 connexions simultanees
- [ ] Documentation : Architecture WebSocket

**Labels** : `setup`, `websocket`, `real-time`, `P0`, `L`
**Milestone** : `v2.5 - Mode Multi-Joueurs`
**Estimation** : 1-2 jours (L)
**Dependencies** : Aucune

---

#### Issue #107 : Sessions Jeu Temps Reel

**Titre** : [FEATURE] Creer sessions jeu avec MJ et joueurs

**Description** :
Systeme sessions jeu temps reel avec roles MJ/Joueur.

**Acceptance Criteria** :
- [ ] Creation session : MJ cree session liee playspace
- [ ] Code invitation : Genere code unique 6 chars
- [ ] Rejoint session : Joueur entre code
- [ ] Liste participants : Affichage temps reel
- [ ] Status session : Active, En pause, Terminee
- [ ] Persistence : Sessions sauvegardees BDD
- [ ] Tests : MJ cree session, 3 joueurs rejoignent

**Labels** : `feature`, `sessions`, `multi-player`, `P0`, `L`
**Milestone** : `v2.5 - Mode Multi-Joueurs`
**Estimation** : 1-2 jours (L)
**Dependencies** : #106

---

#### Issue #108 : Invitations Joueurs Email

**Titre** : [FEATURE] Inviter joueurs par email

**Description** :
Systeme invitations joueurs par email avec lien direct.

**Acceptance Criteria** :
- [ ] UI invitation : Input email + bouton envoyer
- [ ] Email template : Message invitation avec lien session
- [ ] Lien invitation : /sessions/join/:token (expire 7 jours)
- [ ] Validation email : Format email valide
- [ ] Rate limiting : Max 10 invitations/heure
- [ ] Tracking : Email envoye, ouvert, accepte
- [ ] Tests : Envoyer invitation, cliquer lien, rejoindre session

**Labels** : `feature`, `invitations`, `email`, `P0`, `M`
**Milestone** : `v2.5 - Mode Multi-Joueurs`
**Estimation** : 4-8h (M)
**Dependencies** : #107

---

#### Issue #109 : Invitations Joueurs Lien Partage

**Titre** : [FEATURE] Inviter joueurs par lien partage

**Description** :
Generation lien invitation partageable (Discord, WhatsApp).

**Acceptance Criteria** :
- [ ] Bouton "Copier lien invitation"
- [ ] Lien format : /sessions/join/:sessionId/:token
- [ ] Token expire : 24h par defaut (configurable)
- [ ] Bouton partage rapide : Discord, WhatsApp, Email
- [ ] Preview lien : OG tags (titre session, MJ, jeu)
- [ ] Tests : Generer lien, copier, coller navigateur, rejoindre

**Labels** : `feature`, `invitations`, `share`, `P0`, `S`
**Milestone** : `v2.5 - Mode Multi-Joueurs`
**Estimation** : 2-4h (S)
**Dependencies** : #107

---

#### Issue #110 : Permissions MJ/Joueur/Observateur

**Titre** : [FEATURE] Systeme permissions roles session

**Description** :
Gestion permissions selon roles (MJ, Joueur, Observateur).

**Acceptance Criteria** :
- [ ] Role MJ : Toutes permissions (edit board, kick joueurs)
- [ ] Role Joueur : Edit ses personnages, voir board, chat
- [ ] Role Observateur : Lecture seule (voir board, chat)
- [ ] UI : Badges roles visibles liste participants
- [ ] Changement role : MJ peut promouvoir/retrograder
- [ ] Tests : Verifier permissions selon role
- [ ] Documentation : Tableau permissions par role

**Labels** : `feature`, `permissions`, `roles`, `P0`, `M`
**Milestone** : `v2.5 - Mode Multi-Joueurs`
**Estimation** : 4-8h (M)
**Dependencies** : #107

---

#### Issue #111 : Chat Temps Reel

**Titre** : [FEATURE] Chat temps reel session

**Description** :
Systeme chat temps reel pour communication joueurs.

**Acceptance Criteria** :
- [ ] UI chat : Panel droite avec messages
- [ ] Envoi message : Input + bouton (ou Enter)
- [ ] Affichage temps reel : Messages apparaissent instantanement
- [ ] Metadata message : Nom joueur, timestamp, avatar
- [ ] Notifications : Badge nombre messages non lus
- [ ] Historique : Scroll infinite loading (100 derniers messages)
- [ ] Emojis : Support emojis basique
- [ ] Tests : 3 joueurs, 10 messages, verifier temps reel

**Labels** : `feature`, `chat`, `real-time`, `P0`, `M`
**Milestone** : `v2.5 - Mode Multi-Joueurs`
**Estimation** : 4-8h (M)
**Dependencies** : #106

---

#### Issue #112 : Investigation Board Collaboratif

**Titre** : [FEATURE] Investigation Board temps reel collaboratif

**Description** :
Investigation Board synchronise en temps reel entre joueurs.

**Acceptance Criteria** :
- [ ] Sync temps reel : Modifications apparaissent instantanement
- [ ] Curseurs temps reel : Voir curseurs autres joueurs
- [ ] Locks notes : Lock note en edition (prevent conflicts)
- [ ] Permissions : MJ peut tout editer, joueurs limites
- [ ] Presence : Indicateur joueurs connectes
- [ ] Performance : < 200ms latence modification
- [ ] Tests : 3 joueurs, modifier board simultanement

**Labels** : `feature`, `investigation-board`, `collaborative`, `P0`, `XL`
**Milestone** : `v2.5 - Mode Multi-Joueurs`
**Estimation** : 2-5 jours (XL)
**Dependencies** : #106, #86

---

#### Issue #113 : Synchronisation Curseurs Temps Reel

**Titre** : [FEATURE] Afficher curseurs joueurs temps reel

**Description** :
Affichage curseurs autres joueurs sur Investigation Board.

**Acceptance Criteria** :
- [ ] Curseur personnalise : Nom joueur + couleur unique
- [ ] Position temps reel : Sync position curseur < 50ms
- [ ] Throttling : Updates max 20/s (prevention flood)
- [ ] Disparition : Curseur disparait apres 5s inactivite
- [ ] UI : Curseurs semi-transparents (pas intrusifs)
- [ ] Performance : 60 FPS avec 10 curseurs
- [ ] Tests : 5 joueurs, bouger curseurs, verifier affichage

**Labels** : `feature`, `cursors`, `real-time`, `P1`, `M`
**Milestone** : `v2.5 - Mode Multi-Joueurs`
**Estimation** : 4-8h (M)
**Dependencies** : #112

---

#### Issue #114 : Gestion Conflits CRDT

**Titre** : [ARCHITECTURE] Implementer CRDT pour merge automatique

**Description** :
CRDT (Conflict-free Replicated Data Types) pour resolution conflits.

**Acceptance Criteria** :
- [ ] Library CRDT : Yjs ou Automerge
- [ ] Sync board : Board state en CRDT
- [ ] Merge automatique : Modifications simultanees mergees
- [ ] Zero conflit : Toutes modifications preservees
- [ ] Performance : Merge < 100ms
- [ ] Tests : 2 joueurs modifient meme note, verifier merge
- [ ] Documentation : Architecture CRDT

**Labels** : `architecture`, `crdt`, `conflict-resolution`, `P1`, `XL`
**Milestone** : `v2.5 - Mode Multi-Joueurs`
**Estimation** : 2-5 jours (XL)
**Dependencies** : #112

---

#### Issue #115 : Notifications Temps Reel

**Titre** : [FEATURE] Notifications temps reel evenements session

**Description** :
Systeme notifications temps reel pour evenements importants.

**Acceptance Criteria** :
- [ ] Notification joueur rejoint : Toast "X a rejoint la session"
- [ ] Notification joueur quitte : Toast "X a quitte la session"
- [ ] Notification modification board : Badge "Board mis a jour par X"
- [ ] Notification mention chat : "@nom" declenche notification
- [ ] UI : Toasts non-intrusifs (bas droite, auto-dismiss 3s)
- [ ] Preferences : Option desactiver notifications
- [ ] Tests : Declencher 5 types notifications, verifier affichage

**Labels** : `feature`, `notifications`, `real-time`, `P1`, `M`
**Milestone** : `v2.5 - Mode Multi-Joueurs`
**Estimation** : 4-8h (M)
**Dependencies** : #106

---

#### Issue #116 : Presence Joueurs Temps Reel

**Titre** : [FEATURE] Indicateur presence joueurs temps reel

**Description** :
Affichage presence joueurs (online, offline, AFK) temps reel.

**Acceptance Criteria** :
- [ ] Status presence : Online (vert), AFK (jaune), Offline (gris)
- [ ] Detection AFK : Auto apres 5 min inactivite
- [ ] Liste participants : Status visible
- [ ] Avatars : Indicateur presence (dot couleur)
- [ ] Compteur : "3/5 joueurs en ligne"
- [ ] Sync temps reel : Status update < 2s
- [ ] Tests : Joueur AFK, verifier status change

**Labels** : `feature`, `presence`, `real-time`, `P1`, `S`
**Milestone** : `v2.5 - Mode Multi-Joueurs`
**Estimation** : 2-4h (S)
**Dependencies** : #106

---

#### Issue #117 : Kick/Ban Joueurs

**Titre** : [FEATURE] MJ peut kick/ban joueurs

**Description** :
Systeme moderation session par MJ (kick/ban joueurs).

**Acceptance Criteria** :
- [ ] Action kick : Joueur deconnecte session (peut rejoindre)
- [ ] Action ban : Joueur bloque (ne peut plus rejoindre)
- [ ] UI : Bouton kick/ban dans liste participants (MJ only)
- [ ] Confirmation : Modal "Confirmer kick/ban de X ?"
- [ ] Notification : Joueur kicke/ban recoit message clair
- [ ] Logs : Toutes actions kick/ban loggees
- [ ] Tests : MJ kick joueur, verifier deconnexion

**Labels** : `feature`, `moderation`, `permissions`, `P2`, `S`
**Milestone** : `v2.5 - Mode Multi-Joueurs`
**Estimation** : 2-4h (S)
**Dependencies** : #110

---

#### Issue #118 : Partage Personnages Session

**Titre** : [FEATURE] Joueurs partagent personnages dans session

**Description** :
Joueurs peuvent partager leurs personnages avec groupe.

**Acceptance Criteria** :
- [ ] Selection personnage : Joueur choisit personnage a jouer
- [ ] Visibilite groupe : Tous voient personnages partages
- [ ] Consultation : Clic personnage → Affiche fiche readonly
- [ ] Modifications : Joueur peut editer son personnage (sync temps reel)
- [ ] Permissions : MJ peut voir/editer tous personnages
- [ ] Tests : Joueur partage personnage, autres voient fiche

**Labels** : `feature`, `characters`, `sharing`, `P1`, `M`
**Milestone** : `v2.5 - Mode Multi-Joueurs`
**Estimation** : 4-8h (M)
**Dependencies** : #107

---

#### Issue #119 : Dice Roller Collaboratif

**Titre** : [FEATURE] Lanceur des temps reel collaboratif

**Description** :
Lanceur des synchronise temps reel (tous voient resultats).

**Acceptance Criteria** :
- [ ] UI dice roller : Bouton lancer des
- [ ] Formules : d4, d6, d8, d10, d12, d20, d100
- [ ] Modificateurs : +X, -X
- [ ] Affichage resultat : Toast avec nom joueur + resultat
- [ ] Historique : Liste 20 derniers lancers
- [ ] Animation : Des 3D (optionnel, peut etre 2D)
- [ ] Tests : 3 joueurs lancent des, verifier tous voient

**Labels** : `feature`, `dice`, `real-time`, `P2`, `M`
**Milestone** : `v2.5 - Mode Multi-Joueurs`
**Estimation** : 4-8h (M)
**Dependencies** : #106

---

#### Issue #120 : Session Recording/Replay

**Titre** : [FEATURE] Enregistrer et rejouer sessions

**Description** :
Enregistrement automatique session avec replay.

**Acceptance Criteria** :
- [ ] Auto-record : Session enregistree automatiquement
- [ ] Stockage : Evenements WebSocket en BDD
- [ ] UI replay : Bouton "Rejouer session"
- [ ] Playback : Lecture chronologique evenements
- [ ] Controles : Play, pause, vitesse (1x, 2x, 4x)
- [ ] Recherche : Timeline avec timestamps
- [ ] Tests : Enregistrer session 10 min, rejouer

**Labels** : `feature`, `recording`, `replay`, `P2`, `L`
**Milestone** : `v2.5 - Mode Multi-Joueurs`
**Estimation** : 1-2 jours (L)
**Dependencies** : #106

---

#### Issue #121 : Voice/Video Integration Preparation

**Titre** : [RESEARCH] Recherche integration voice/video (v3.0)

**Description** :
Recherche faisabilite integration voice/video (Discord, Jitsi).

**Acceptance Criteria** :
- [ ] Analyse options : Discord API, Jitsi Meet, Twilio
- [ ] Couts : Estimation couts serveurs voice/video
- [ ] Latence : Tests latence voice < 100ms
- [ ] Compatibilite : Browsers supportes
- [ ] Recommendation : Rapport avec solution recommandee
- [ ] POC : Prototype basique integration Discord
- [ ] Documentation : Architecture proposee

**Labels** : `research`, `voice`, `video`, `P3`, `M`
**Milestone** : `v2.5 - Mode Multi-Joueurs`
**Estimation** : 4-8h (M)
**Dependencies** : Aucune

---

#### Issue #122 : Rate Limiting WebSocket

**Titre** : [SECURITY] Rate limiting connexions WebSocket

**Description** :
Protection contre spam et flood WebSocket.

**Acceptance Criteria** :
- [ ] Limit connexions : Max 100 connexions/IP/heure
- [ ] Limit messages : Max 60 messages/min/utilisateur
- [ ] Throttling : Delai force entre messages (100ms)
- [ ] Ban temporaire : Si depassement limites (30 min)
- [ ] Logs : Toutes tentatives flood loggees
- [ ] Tests : Simuler flood, verifier ban
- [ ] Documentation : Limites documentees

**Labels** : `security`, `rate-limiting`, `websocket`, `P0`, `S`
**Milestone** : `v2.5 - Mode Multi-Joueurs`
**Estimation** : 2-4h (S)
**Dependencies** : #106

---

#### Issue #123 : Encryption Messages Chat

**Titre** : [SECURITY] Chiffrement messages chat end-to-end

**Description** :
Chiffrement E2E messages chat (optionnel, v3.0 full implementation).

**Acceptance Criteria** :
- [ ] Library crypto : libsodium ou tweetnacl
- [ ] Key exchange : ECDH pour session keys
- [ ] Encryption : Messages chiffres client-side
- [ ] Decryption : Dechiffres client-side uniquement
- [ ] UI : Badge "Chiffrement actif"
- [ ] Tests : Envoyer message chiffre, verifier BDD contient cipher
- [ ] Documentation : Architecture E2E

**Labels** : `security`, `encryption`, `chat`, `P2`, `L`
**Milestone** : `v2.5 - Mode Multi-Joueurs`
**Estimation** : 1-2 jours (L)
**Dependencies** : #111

---

#### Issue #124 : Analytics Sessions Multi-Joueurs

**Titre** : [ANALYTICS] Metriques sessions multi-joueurs

**Description** :
Analytics sessions multi-joueurs pour monitoring.

**Acceptance Criteria** :
- [ ] Metriques : Nombre sessions actives, duree moyenne
- [ ] Participants : Nombre moyen joueurs/session
- [ ] Activite : Messages chat/heure, modifications board/heure
- [ ] Retention : Taux retour sessions (semaine apres)
- [ ] Dashboard admin : Visualisation metriques
- [ ] Logs : Evenements cles (creation, fin session)
- [ ] Alertes : Si > 100 sessions actives (scaling needed)

**Labels** : `analytics`, `monitoring`, `sessions`, `P1`, `S`
**Milestone** : `v2.5 - Mode Multi-Joueurs`
**Estimation** : 2-4h (S)
**Dependencies** : #107

---

#### Issue #125 : Tests E2E Multi-Joueurs

**Titre** : [TESTS] Tests E2E sessions multi-joueurs

**Description** :
Suite tests E2E couvrant parcours multi-joueurs.

**Acceptance Criteria** :
- [ ] Test : MJ cree session, 2 joueurs rejoignent
- [ ] Test : Chat temps reel entre 3 joueurs
- [ ] Test : Modifications board synchronisees
- [ ] Test : Curseurs temps reel affiches
- [ ] Test : Kick joueur par MJ
- [ ] Test : Session enregistree et replayable
- [ ] Coverage : Parcours critiques multi-joueurs
- [ ] CI/CD : Tests executables automatiquement

**Labels** : `tests`, `e2e`, `multi-player`, `P0`, `XL`
**Milestone** : `v2.5 - Mode Multi-Joueurs`
**Estimation** : 2-5 jours (XL)
**Dependencies** : #107, #111, #112

---

#### Issue #126 : Documentation Multi-Joueurs v2.5

**Titre** : [DOCS] Guide utilisateur mode multi-joueurs

**Description** :
Documentation complete mode multi-joueurs v2.5.

**Acceptance Criteria** :
- [ ] Guide MJ : Creer session, inviter joueurs, gerer permissions
- [ ] Guide joueur : Rejoindre session, chat, partage personnages
- [ ] Guide Investigation Board collaboratif : Sync temps reel
- [ ] Guide dice roller : Lancer des en groupe
- [ ] FAQ : 30+ questions frequentes mode groupe
- [ ] Video demo : Session complete (6min)
- [ ] Troubleshooting : Problemes connexion WebSocket

**Labels** : `docs`, `multi-player`, `P1`, `M`
**Milestone** : `v2.5 - Mode Multi-Joueurs`
**Estimation** : 4-8h (M)
**Dependencies** : #125

---

#### Issue #127-#130 : Issues Techniques Multi-Joueurs

**Note** : Issues #127-#130 reservees pour optimisations techniques mode multi-joueurs (scalabilite, performance WebSocket, gestion memoire) identifiees pendant developpement.

---

**Date** : 2025-01-19
**Version** : 2.0
**Auteur** : Senior Code Reviewer
**Statut** : Complet - Issues v1.1, v1.3, v2.0, v2.5 detaillees
**Total Issues** : 130 (50 MVP + 15 v1.1 + 10 v1.3 + 30 v2.0 + 25 v2.5)
