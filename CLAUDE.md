ah j'a# brumisa3.fr - Documentation Technique

## Vue d'ensemble

Créateur de fiches de personnages JDR immersives en **JavaScript pur** avec architecture **MVC moderne** et **Alpine.js**.

### 🏗️ Stack technique
- **Backend** : Node.js + Express + PostgreSQL + EJS
- **Frontend** : Alpine.js + Tailwind CSS 
- **PDF** : PDFKit avec templates programmatiques
- **Auth** : Sessions Express avec codes d'accès

### 💻 Environnement de développement
- **OS** : Windows 10/11 (commandes Windows uniquement)
- **Shell** : cmd.exe / PowerShell
- **Séparateurs** : Antislash `\` pour les chemins
- **Commandes** : Windows natives (dir, mkdir, del, copy, etc.)

## Règles de développement

### 📝 Conventions de développement
- N'utilise pas de pictogramme en tant que caractère.

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
  - `architecture-*.md` pour les patterns et structures
  - `testing.md` pour les pratiques de test
  - `api.md` pour les endpoints
- **Compléter** la documentation existante plutôt que de créer de nouveaux fichiers

### 🧪 Tests du code métier
- **Si possible, écrire des tests** pour le code métier (services, modèles, utilitaires)
- Prioriser les tests pour :
  - Les fonctions de validation
  - Les calculs et transformations de données
  - Les services critiques (PDF, authentification)
- Utiliser les patterns décrits dans `documentation/testing.md`

## Structure du projet
- le répertoire scripts ne doit pas avoir de sous-répertoire
- le répertoire documentation doit comporter le moins de code possible. 
- les fichiers markdown du répertoire documentation ne devraient pas comporter plus de 200 lignes. 
- le fichier CLAUDE.md ne devrait pas comporter plus de 500 lignes. 

## Notes techniques
- lorsque nous terminons la fin d'une feature et que l'utilisateur valide que le résultat est correct, pousse les modifications dans une branche git pour sauvegarde. 
-  n'utilise pas d'emoji comme caractère. jamais. 
- un problème de configuration ne doit pas empêcher l'application de fonctionner.

### Base de données
- PostgreSQL n'accepte pas les placeholders ?. Il faut utiliser $1, $2, $3 à la place.