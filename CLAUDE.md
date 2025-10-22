Brumisa3 - Documentation Technique

## Vue d'ensemble

Créateur de fiches de personnages JDR immersives avec **Nuxt 4** et architecture moderne.

### 🏗️ Stack technique
- **Framework** : Nuxt 4 + Vue 3 Composition API
- **Backend** : Nitro Server + PostgreSQL + Prisma ORM
- **Frontend** : Vue 3 + UnoCSS + Pinia
- **PDF** : PDFKit avec génération programmatique (v2.0+)
- **Auth** : @sidebase/nuxt-auth avec sessions (mode guest + compte)
- **Tests** : Playwright (100% E2E, pas de tests unitaires)

### 💻 Environnement de développement
- **OS** : Windows 10/11 (commandes Windows uniquement)
- **Shell** : cmd.exe / PowerShell
- **Séparateurs** : Antislash `\` pour les chemins
- **Commandes** : Windows natives (dir, mkdir, del, copy, etc.)
- **Tests** : Playwright pour tests E2E (100% couverture fonctionnelle, multi-navigateurs)
- **Package Manager** : pnpm (recommandé pour Nuxt 4)

## Règles de développement

### 📝 Conventions de développement
- N'utilise pas de pictogramme en tant que caractère.
- **Variables d'environnement** : Toujours utiliser les variables d'environnement pour les URLs, ports, et hostnames plutôt que des valeurs codées en dur (localhost, 3076, etc.)

### 🏗️ Principes de développement
- **Principes SOLID** : Respecter les 5 principes SOLID pour un code maintenable
  - **S**ingle Responsibility : Une classe/fonction = une responsabilité
  - **O**pen/Closed : Ouvert à l'extension, fermé à la modification
  - **L**iskov Substitution : Les sous-types doivent être substituables
  - **I**nterface Segregation : Interfaces spécifiques plutôt que générales
  - **D**ependency Inversion : Dépendre d'abstractions, pas de concrétions

- **Principe DRY** (Don't Repeat Yourself) : Éviter la duplication de code
  - Factoriser le code commun en fonctions/modules
  - Utiliser des constantes pour les valeurs répétées
  - Créer des utilitaires réutilisables

### 📚 Documentation d'abord
- **Toujours vérifier** si le fonctionnement a été détaillé dans `documentation/` avant de créer de nouvelles instructions
- Consulter les fichiers existants :
  - `ARCHITECTURE/*.md` pour les patterns et structures
  - `FONCTIONNALITES/*.md` pour les descriptions fonctionnelles
  - `DEVELOPPEMENT/*.md` pour les choix de développement
- **Compléter** la documentation existante plutôt que de créer de nouveaux fichiers

### 🏛️ Architecture MVP v1.0
- **Documentation complète** : `documentation/ARCHITECTURE/` (7 fichiers)
- **Point d'entrée** : `00-SOMMAIRE.md` pour vue d'ensemble
- **Récapitulatif** : `RECAPITULATIF-ANALYSE.md` pour résumé exécutif
- **Scope MVP** : Playspaces + Characters LITM (Theme Cards, Hero Card, Trackers) + Auth + Export JSON
- **Hors MVP** : Investigation Board (v2.0), Oracles customs (v1.2+), Jets de dés (v1.3), Multi-joueurs (v2.5)
- **Modèle de données** : 9 tables Prisma (User, Playspace, Character, ThemeCard, Tag, HeroCard, Relationship, Trackers, Status/StoryTag/StoryTheme)
- **API Routes** : 21 routes RESTful Nitro pour MVP
- **Composants Vue** : 20 composants essentiels (Playspace, Character, ThemeCard, HeroCard, Trackers, Common)
- **Stores Pinia** : 3 stores (playspace, character, ui)
- **Roadmap MVP** : 10 semaines (Fondations 2s, Playspaces 2s, Characters 4s, Polish 2s)

### 🧪 Tests End-to-End avec Playwright
- **Stratégie** : 100% tests E2E, pas de tests unitaires
- **Framework** : Playwright (multi-navigateurs : Chrome, Firefox, Safari, Mobile Chrome)
- **Scope MVP** : 24 tests E2E couvrant toutes les fonctionnalités critiques
- **Prioriser les tests pour** :
  - Parcours utilisateur complets (création playspace + personnage)
  - Workflows critiques (authentification, CRUD, export)
  - Performance (basculement playspace < 2s, création < 60s)
- **Configuration** : `playwright.config.ts` avec server Nuxt automatique
- **Helpers** : Reset DB, fixtures utilisateurs, helpers auth/navigation
- **Documentation** : `documentation/ARCHITECTURE/06-strategie-tests-e2e-playwright.md`

## Structure du projet
- le répertoire scripts ne doit pas avoir de sous-répertoire
- le répertoire documentation doit comporter le moins de code possible. 
- le fichier CLAUDE.md ne devrait pas comporter plus de 500 lignes. 

## Notes techniques
- **Git et commits** : Commiter UNIQUEMENT dans ces deux cas:
  1. L'utilisateur demande explicitement de commiter
  2. Une feature COMPLETE est terminée ET validée par l'utilisateur
  - NE PAS commiter après chaque petite modification
  - Regrouper tous les changements logiques en UN seul commit
-  n'utilise pas d'emoji comme caractère. jamais.
- un problème de configuration ne doit pas empêcher l'application de fonctionner.
- ne crée pas de nouvelles versions, met à jour les fichiers concernés
- ne crée pas de rapport d'exécution, sauf si cela t'es demandé

### Base de données
- PostgreSQL avec Prisma ORM pour la génération automatique des requêtes
- Utiliser les méthodes Prisma au lieu de SQL brut quand c'est possible
- Pour le SQL custom, utiliser les placeholders $1, $2, $3 (PostgreSQL)