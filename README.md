# 🎲 Brumisater - Générateur PDF JDR

**Créateur de fiches de personnages JDR immersives avec Nuxt 4 et architecture moderne**

Générez des PDFs stylisés pour **Monsterhearts**, **Engrenages & Sortilèges**, **Metro 2033**, **Mist Engine** et **Zombiology** avec une expérience utilisateur moderne et réactive.

## ✨ Fonctionnalités

- 🎭 **5 systèmes JDR supportés** avec templates spécialisés
- 📄 **Génération PDF automatique** avec PDFKit et styles thématiques
- 🏗️ **Architecture Nuxt 4** avec Vue 3 Composition API
- 🗄️ **PostgreSQL + Prisma ORM** pour la persistance
- 👥 **Authentification** avec @sidebase/nuxt-auth et sessions
- 🎨 **Design system** Tailwind CSS avec thèmes par univers
- ⚡ **Pinia stores** pour la gestion d'état moderne
- 📚 **Documentation automatique** avec TypeDoc

## 🎮 Systèmes supportés

| Système | Type | Mécaniques |
|---------|------|-----------|
| **Monsterhearts** | PbtA Teen Drama | Skins, Moves, Conditions, Strings |
| **Engrenages & Sortilèges** | Steampunk Fantasy | Magie/Science, Rouages, Sortilèges |
| **Metro 2033** | Post-apocalyptique | Factions, Radiation, Survie |
| **Mist Engine** | Horror Victorien | Assets, Debilities, Momentum |
| **Zombiology** | Survie Zombie | Infection, Ressources, Groupes |

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

## 🏗️ Architecture Nuxt 4

### Stack technique

```
🖥️ Frontend:      Vue 3 + Composition API + Pinia
🌐 Framework:     Nuxt 4 + Nitro Server
🗄️ Base de données: PostgreSQL + Prisma ORM
🔐 Auth:          @sidebase/nuxt-auth
🎨 Styling:       Tailwind CSS + Design System
📄 PDF:           PDFKit programmatique
🧪 Tests:         Vitest + @nuxt/test-utils
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
pnpm run test           # Tests avec Vitest
pnpm run test:ui        # Interface graphique tests
pnpm run test:coverage  # Couverture de code
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

## 🎯 Utilisation

### Créer un personnage
1. Choisir un système JDR et type de document
2. Remplir les informations selon le système
3. Sauvegarder la fiche (compte requis)
4. Générer le PDF stylisé

### Systèmes d'oracles
- Tables aléatoires par univers
- Génération procédurale
- Intégration dans les documents

### Authentification
- Sessions sécurisées
- Codes d'accès par défaut (voir .env.example)
- Gestion de profils utilisateur

## 🧪 Tests

Le projet inclut une suite de tests complète :

```bash
# Tests unitaires et d'intégration
pnpm run test

# Tests avec interface graphique
pnpm run test:ui

# Couverture de code
pnpm run test:coverage
```

Tests couverts :
- ✅ Services métier et PDF
- ✅ API routes et authentification
- ✅ Composables et stores
- ✅ Intégration base de données

## 🤝 Contribution

Les contributions sont bienvenues ! 

### Types de contributions
- 🐛 **Signalement de bugs** via les issues
- ✨ **Nouvelles fonctionnalités** avec Pull Requests
- 🎲 **Nouveaux systèmes JDR** (voir documentation/SYSTEMES-JDR/)
- 📖 **Amélioration documentation**

### Processus de contribution
1. Fork le repository
2. Créer une branche feature : `git checkout -b feature/ma-fonctionnalite`
3. Respecter l'architecture existante
4. Ajouter des tests pour le nouveau code
5. Mettre à jour la documentation si nécessaire
6. Soumettre une Pull Request

## 📝 Licence

Ce projet est sous licence MIT. Voir [LICENSE](LICENSE) pour plus de détails.

## 🙏 Remerciements

- **Nuxt 4** pour le framework moderne
- **Vue 3** et l'écosystème Composition API
- **Prisma** pour l'ORM TypeScript
- **Tailwind CSS** pour le design system
- **PDFKit** pour la génération programmatique
- Communauté JDR française pour l'inspiration

---

**Créé avec ❤️ pour la communauté JDR - Migration Express → Nuxt 4 réussie**
