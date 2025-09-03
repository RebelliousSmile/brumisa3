Brumisater - Documentation Technique

## Vue d'ensemble

Créateur de fiches de personnages JDR immersives avec **Nuxt 4** et architecture moderne.

### 🏗️ Stack technique
- **Framework** : Nuxt 4 + Vue 3 Composition API
- **Backend** : Nitro Server + PostgreSQL + Prisma ORM
- **Frontend** : Vue 3 + Tailwind CSS + Pinia
- **PDF** : PDFKit avec génération programmatique
- **Auth** : @sidebase/nuxt-auth avec sessions

### 💻 Environnement de développement
- **OS** : Windows 10/11 (commandes Windows uniquement)
- **Shell** : cmd.exe / PowerShell
- **Séparateurs** : Antislash `\` pour les chemins
- **Commandes** : Windows natives (dir, mkdir, del, copy, etc.)
- **Tests** : Vitest pour les tests unitaires, @nuxt/test-utils pour les tests d'intégration
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

### 🧪 Tests du code métier
- **Si possible, écrire des tests** pour le code métier (composables, services, API routes)
- Prioriser les tests pour :
  - Les composables Vue 3
  - Les services PDFKit et authentification
  - Les API routes Nitro
  - Les stores Pinia
- Utiliser Vitest et @nuxt/test-utils pour les tests Nuxt
- Ne crée des mocks que si tu ne peux pas tester dans des conditions réelles (altération des données en production)

## Structure du projet
- le répertoire scripts ne doit pas avoir de sous-répertoire
- le répertoire documentation doit comporter le moins de code possible. 
- le fichier CLAUDE.md ne devrait pas comporter plus de 500 lignes. 

## Notes techniques
- lorsque nous terminons la fin d'une feature et que l'utilisateur valide que le résultat est correct, pousse les modifications dans une branche git pour sauvegarde. 
-  n'utilise pas d'emoji comme caractère. jamais. 
- un problème de configuration ne doit pas empêcher l'application de fonctionner.

### Base de données
- PostgreSQL avec Prisma ORM pour la génération automatique des requêtes
- Utiliser les méthodes Prisma au lieu de SQL brut quand c'est possible
- Pour le SQL custom, utiliser les placeholders $1, $2, $3 (PostgreSQL)