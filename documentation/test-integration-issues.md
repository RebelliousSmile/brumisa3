# Problèmes de Tests d'Intégration - Documentation

## Résumé des problèmes identifiés

### 1. Configuration de l'environnement de test
- Les tests tentent de se connecter à une base de données PostgreSQL
- La configuration `.env.test` pointe vers une base de données de production
- L'extension `pgcrypto` n'est pas disponible dans l'environnement de test

### 2. Solutions implémentées

#### Configuration globale Jest
- Ajout de `jest.setup.js` pour forcer les variables d'environnement de test
- Modification de `jest.config.js` pour charger le setup avant les tests

#### Corrections dans app.js
- Export des méthodes `initialize()` et `shutdown()` pour les tests
- Support de l'ancien format de module tout en exposant les nouvelles méthodes

#### Tests avec mocks
- Création de `auth-mock.test.js` comme exemple de test isolé
- Utilisation de mocks pour éviter les dépendances externes

### 3. Recommandations

#### Court terme
1. Utiliser les tests mockés (`*-mock.test.js`) pour valider la logique métier
2. Désactiver temporairement les tests d'intégration qui nécessitent la DB
3. Exécuter : `npx jest tests/integration/*-mock.test.js`

#### Moyen terme
1. Configurer une base de données PostgreSQL dédiée aux tests
2. Installer l'extension `pgcrypto` sur cette base
3. Créer un script de setup/teardown pour les tests

#### Long terme
1. Utiliser Docker pour avoir un environnement de test isolé
2. Intégrer dans la CI/CD avec une base PostgreSQL conteneurisée
3. Séparer clairement tests unitaires et tests d'intégration

### 4. Commandes utiles

```bash
# Exécuter uniquement les tests mockés
npx jest tests/integration/*-mock.test.js

# Exécuter les tests unitaires
npx jest tests/unit

# Ignorer les tests d'intégration problématiques
npx jest --testPathIgnorePatterns="auth.test.js|api.test.js|oracles.test.js"
```

### 5. Fichiers modifiés
- `/src/app.js` - Export des méthodes pour les tests
- `/jest.config.js` - Ajout du setup global
- `/jest.setup.js` - Configuration de l'environnement de test
- `/tests/integration/auth-mock.test.js` - Exemple de test avec mocks