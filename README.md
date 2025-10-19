# Brumisa3 - Companion Tool Officieux Mist Engine

**L'outil complémentaire 100% gratuit pour Legends in the Mist, Otherscape et City of Mist**

Brumisa3 est un companion tool dédié au Mist Engine, conçu pour compléter votre expérience de jeu. Créez et gérez vos personnages, organisez vos enquêtes avec l'Investigation Board, et explorez les oracles contextuels - le tout dans un outil moderne construit avec Nuxt 4.

**Note** : Brumisa3 n'est pas un VTT (Virtual Tabletop) et ne remplace pas Foundry ou Roll20. C'est un outil spécialisé pour ce que les VTT ne font pas bien : la gestion narrative des personnages et l'organisation d'enquêtes.

## Fonctionnalités MVP v1.0

### Playspaces (Système + Hack + Univers)
- Créez des contextes de jeu isolés (Mist Engine + LITM + Chicago Noir)
- Basculez instantanément entre vos différentes campagnes
- Mode guest (localStorage) ou compte utilisateur (PostgreSQL)

### Personnages LITM Complets
- **Theme Cards** : Power tags, Weakness tags, Attention, Fade, Crack
- **Hero Card** : Relations, Quintessences, Sac à dos
- **Trackers** : Status, Story Tags, Story Themes
- CRUD complet avec validation côté serveur

### Authentification Flexible
- Mode guest (pas de compte requis, localStorage)
- Création de compte (@sidebase/nuxt-auth)
- Migration automatique localStorage → BDD

### Export JSON
- Exportez vos personnages en JSON
- Format compatible avec characters-of-the-mist
- Partagez avec votre communauté

## Roadmap

### v1.0 (MVP) - Q1 2025 (10 semaines)
Playspaces + Characters LITM + Auth + Export JSON

### v1.1 - Amélioration UX (2-3 semaines)
Dark mode, Mobile responsive, Undo/Redo, Raccourcis clavier

### v1.3 - Système de Jets (2 semaines)
Jets de dés sécurisés, Historique, Sélection tags/statuts

### v2.0 - Investigation Board (4-5 semaines)
Canvas interactif, Notes, Connexions, Export PNG

### v2.5 - Mode Multi-joueurs (6-8 semaines)
WebSocket temps réel, Investigation Board collaboratif

## 🚀 Installation rapide

```bash
# Cloner le repository
git clone https://github.com/RebelliousSmile/generateur-pdf-jdr.git
cd generateur-pdf-jdr

# Installer les dépendances (pnpm recommandé)
pnpm install

# Configuration environnement
cp .env.example .env
# Modifier les variables PostgreSQL et autres

# Initialiser la base de données
pnpm run db:generate
pnpm run db:migrate
pnpm run db:seed

# Démarrer en mode développement
pnpm run dev
```

L'application sera accessible sur http://localhost:3000

## 📚 Documentation

- **[Documentation complète](documentation/)** - Architecture et guides
- **[API Reference](documentation/api/)** - Documentation TypeDoc automatique
- **[CLAUDE.md](CLAUDE.md)** - Instructions de développement

### Structure de documentation

- 📋 **[FONCTIONNALITES/](documentation/FONCTIONNALITES/)** - Spécifications métier
- 🏗️ **[ARCHITECTURE/](documentation/ARCHITECTURE/)** - Patterns techniques
- 🎮 **[SYSTEMES-JDR/](documentation/SYSTEMES-JDR/)** - Configuration des jeux
- 🎨 **[DESIGN-SYSTEM/](documentation/DESIGN-SYSTEM/)** - Charte graphique
- 🛠️ **[DEVELOPPEMENT/](documentation/DEVELOPPEMENT/)** - Guides développeur

## Architecture Nuxt 4

### Stack technique

```
Frontend:       Vue 3 + Composition API + Pinia
Framework:      Nuxt 4 + Nitro Server
Base de données: PostgreSQL + Prisma ORM
Auth:           @sidebase/nuxt-auth (sessions + mode guest)
Styling:        UnoCSS (Tailwind-style)
Tests:          Playwright (100% E2E)
PDF:            PDFKit (v2.0+)
```

### Structure projet

```
├── components/          # Composants Vue réutilisables
├── composables/         # Logique réutilisable Composition API
├── stores/              # Pinia stores (état global)
├── server/
│   ├── api/            # Routes API Nitro
│   ├── services/       # Services métier
│   └── utils/          # Utilitaires serveur
├── pages/              # Pages et routage automatique
├── middleware/         # Middleware de navigation
├── prisma/            # Schéma et migrations DB
└── documentation/     # Documentation complète
```

## 🛠️ Scripts disponibles

### Développement

```bash
pnpm run dev              # Serveur développement (port 3000)
pnpm run build           # Build production
pnpm run preview         # Preview build production
pnpm run typecheck       # Vérification TypeScript
```

### Base de données

```bash
pnpm run db:generate     # Générer client Prisma
pnpm run db:migrate      # Appliquer migrations
pnpm run db:studio      # Interface graphique Prisma
pnpm run db:seed        # Données d'exemple
```

### Tests

```bash
pnpm run test:e2e         # Tests E2E avec Playwright
pnpm run test:e2e:ui      # Interface graphique Playwright
pnpm run test:e2e:headed  # Tests en mode headed (visible)
pnpm run test:e2e:debug   # Mode debug Playwright
pnpm run test:e2e:report  # Afficher rapport HTML
```

### Documentation

```bash
pnpm run docs:generate  # Générer documentation API
pnpm run docs:serve    # Servir documentation (port 3001)
pnpm run docs:build    # Build et confirmation
pnpm run docs:clean    # Nettoyer documentation
```

### Production

```bash
pnpm run deploy:build   # Build complet pour déploiement
pnpm run deploy:start   # Démarrage production
pnpm run pm2:start     # Démarrage PM2
```

## Utilisation

### Créer votre premier playspace
1. Arrivez sur Brumisa3
2. Choisissez votre système (Mist Engine)
3. Choisissez votre hack (LITM, Otherscape)
4. Choisissez votre univers (Chicago Noir, Londres, custom)
5. Créez votre playspace

### Créer un personnage LITM
1. Dans votre playspace, cliquez "Nouveau personnage"
2. Remplissez nom, description, avatar
3. Ajoutez des Theme Cards (minimum 2, maximum 4)
4. Ajoutez Power tags et Weakness tags
5. Complétez votre Hero Card (relations, quintessences)
6. Gérez vos Trackers (status, story tags, story themes)

### Basculer entre playspaces
- Cliquez sur un playspace dans la sidebar
- Basculement instantané (< 2 secondes)
- Tous vos personnages du nouveau playspace sont chargés

### Exporter vos personnages
- Cliquez "Exporter" sur un personnage
- Format JSON compatible characters-of-the-mist
- Partagez avec votre communauté ou importez ailleurs

## Tests E2E

Le projet utilise Playwright pour des tests 100% E2E :

```bash
# Tests E2E complets (24 tests)
pnpm run test:e2e

# Interface graphique Playwright
pnpm run test:e2e:ui

# Mode debug
pnpm run test:e2e:debug
```

Tests couverts (MVP v1.0) :
- Playspaces (6 tests : create, list, switch, update, delete, duplicate)
- Characters (5 tests : create, list, update, delete, duplicate)
- Theme Cards (4 tests : create, add tags, improve, delete)
- Hero Card (2 tests : create, relationships)
- Trackers (3 tests : status, story tag, story theme)
- Auth (3 tests : register, login, logout)
- Export (1 test : export JSON)

**Total** : 24 tests E2E multi-navigateurs (Chrome, Firefox, Safari, Mobile)

## Contribution

Les contributions sont bienvenues !

### Types de contributions
- Signalement de bugs via les issues
- Nouvelles fonctionnalités avec Pull Requests
- Amélioration documentation
- Tests E2E additionnels

### Processus de contribution
1. Fork le repository
2. Créer une branche feature : `git checkout -b feature/ma-fonctionnalite`
3. Respecter l'architecture documentée (`documentation/ARCHITECTURE/`)
4. Ajouter des tests E2E Playwright pour le nouveau code
5. Mettre à jour la documentation si nécessaire
6. Soumettre une Pull Request

## Licence

Ce projet respecte la licence **City of Mist Garage** de Son of Oak Game Studio.

**100% gratuit, pour toujours** - Pas de fonctionnalités premium, jamais.

## Remerciements

- **Son of Oak Game Studio** pour le Mist Engine et la licence Garage
- **Nuxt 4** et l'équipe Vue.js pour le framework moderne
- **Prisma** pour l'ORM TypeScript
- **Playwright** pour les tests E2E
- **Repositories open-source** : taragnor/city-of-mist, Altervayne/characters-of-the-mist, mikerees/litm-player, mordachai/investigation-board, mordachai/mist-hud
- Communauté Mist Engine francophone pour l'inspiration

---

**Créé pour la communauté Mist Engine - Companion tool officieux 100% gratuit**
