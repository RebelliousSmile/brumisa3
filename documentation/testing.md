# Guide de Tests - brumisater

## Vue d'ensemble

Ce document détaille la stratégie de tests de l'application brumisater et les commandes pour les exécuter.

## Tests Actuellement Implémentés

### 1. Tests Unitaires

#### Frontend
- ✅ `tests/unit/PageAccueilComponent.test.js` - Composant page d'accueil
- ✅ `tests/unit/PersonnageService.test.js` - Service de gestion des personnages  
- ✅ `tests/unit/functions.test.js` - Fonctions utilitaires

#### Backend  
- ✅ `tests/unit/UtilisateurService.backend.test.js` - Service utilisateur avec mocks
- ✅ `tests/unit/PersonnageService.backend.test.js` - Service personnage avec mocks
- ✅ `tests/unit/EmailService.test.js` - Service d'envoi d'emails
- ✅ `tests/unit/SystemService.test.js` - Service de gestion des systèmes JDR
- ✅ `tests/unit/fillable-regression.test.js` - Tests de régression pour les champs fillable

#### Services PDF et Documents
- ✅ `tests/unit/PdfService.backend.test.js` - Génération PDF
- ✅ `tests/unit/BasePdfKitService.test.js` - Service PDF de base
- ✅ `tests/unit/DocumentGeneriqueService.test.js` - Documents génériques
- ✅ `tests/unit/GenericDocument.test.js` - Templates de documents
- ✅ `tests/unit/ClassPlanDocument.test.js` - Documents de plan de classe

### 2. Tests d'Intégration

#### API
- ✅ `tests/integration/api.test.js` - Endpoints principaux
- ✅ `tests/integration/simple-api.test.js` - Tests API simplifiés  
- ✅ `tests/integration/oracles.test.js` - API des oracles
- ⚠️ `tests/integration/auth.test.js` - Authentification (problème de configuration DB)

#### Services avec Base de Données
- ⚠️ `tests/unit/UtilisateurService.integration.test.js` - Service utilisateur avec vraie DB (problème singleton)

### 3. Tests de Régression

- ✅ `tests/regression/token-fillable-bug.test.js` - Prévention de la régression du bug des champs fillable

## Commandes pour Lancer les Tests

### Tests Unitaires (Fonctionnent)

```bash
# Tous les tests unitaires
npx jest tests/unit/ --verbose --no-coverage

# Tests de régression spécifiques
npx jest tests/unit/fillable-regression.test.js --verbose

# Tests frontend
npx jest tests/unit/PageAccueilComponent.test.js --verbose
npx jest tests/unit/PersonnageService.test.js --verbose

# Tests backend
npx jest tests/unit/UtilisateurService.backend.test.js --verbose
npx jest tests/unit/EmailService.test.js --verbose

# Tests services PDF
npx jest tests/unit/PdfService.backend.test.js --verbose
npx jest tests/unit/DocumentGeneriqueService.test.js --verbose
```

### Tests d'Intégration (Certains fonctionnent)

```bash
# Tests d'intégration API (fonctionnent)
npx jest tests/integration/api.test.js --verbose --no-coverage
npx jest tests/integration/simple-api.test.js --verbose --no-coverage

# Tests auth (ne fonctionnent pas - problème singleton DB)
npx jest tests/integration/auth.test.js --runInBand --forceExit --testTimeout=60000
```

### Tests de Régression (Fonctionnent parfaitement)

```bash
# Test pour prévenir le bug des champs fillable
npx jest tests/regression/token-fillable-bug.test.js --verbose
```

### Commandes Générales

```bash
# Tous les tests (via npm)
npm test

# Tests avec couverture
npm run test:coverage

# Tests en mode watch
npm run test:watch

# Tests spécifiques par pattern
npx jest --testPathPattern="auth" --verbose
npx jest --testNamePattern="fillable" --verbose
```

## Problèmes Connus

### 1. Tests d'Intégration avec Base de Données

**Problème** : Les tests `auth.test.js` et `UtilisateurService.integration.test.js` ne peuvent pas se connecter à la base de données définie dans `.env.test`.

**Cause** : Le `DatabaseManager` utilise un pattern singleton qui met en cache la configuration au premier import, empêchant le rechargement avec la configuration de test.

**Solution temporaire** : Utiliser les tests de régression qui fonctionnent parfaitement et détectent les mêmes problèmes.

**Solution long terme** : Refactoriser `src/database/db.js` pour permettre l'injection de configuration.

### 2. Configuration d'Environnement

**Pour que les tests d'intégration fonctionnent** :
1. Créer un fichier `.env.test` avec les paramètres de base de données de test
2. Utiliser les variables `POSTGRES_*` (pas `DATABASE_*`)
3. S'assurer que `NODE_ENV=test` est défini avant l'import des modules

## Configuration des Tests

### Scripts package.json Actuels

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

### Configuration Jest Actuelle

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    'public/js/**/*.js',
    '!src/app.js',
    '!**/node_modules/**'
  ],
  coverageThreshold: {
    global: {
      branches: 10,
      functions: 10,
      lines: 10,
      statements: 10
    }
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  testPathIgnorePatterns: [
    '/node_modules/',
    '/tests/e2e/'
  ]
};
```

### Configuration des Tests d'Environnement

```bash
# tests/setup.js - Configuration globale
# Force NODE_ENV=test AVANT de charger la config
process.env.NODE_ENV = 'test';
require('dotenv').config({ path: '.env.test', override: true });
```

## Tests Implémentés - Détails

### Tests de Régression pour l'Authentification

Le fichier `tests/unit/fillable-regression.test.js` a été créé suite à un bug critique où les champs `token_recuperation` et `token_expiration` n'étaient pas dans le tableau `fillable` du modèle `Utilisateur`. Ce bug empêchait la sauvegarde des tokens de récupération de mot de passe.

**Ce que ce test vérifie** :
- Les champs `token_recuperation` et `token_expiration` sont présents dans `fillable`
- La configuration du modèle est cohérente (pas de conflit fillable/guarded)
- Protection contre la régression si quelqu'un retire ces champs par erreur

**Exemple de résultat** :
```bash
# Si les champs sont manquants (bug)
❌ expect(received).toContain(expected)
    Expected value: "token_recuperation"
    Received array: ["nom", "email", "mot_de_passe", ...]

# Si les champs sont présents (correct)
✅ should include token_recuperation in fillable array
✅ should include token_expiration in fillable array
```

### Tests d'Intégration API

  OUI, les tests d'intégration servent à tester les appels API complets :
  - ✅ Endpoint à endpoint : Requête HTTP → Réponse JSON
  - ✅ Flux complet : Routing → Controller → Service → Base de données → Réponse
  - ✅ Données réelles : Base de test, vraies connexions
  - ✅ Format de réponse : Structure JSON, codes HTTP, headers

Les tests dans `tests/integration/api.test.js` vérifient le bon fonctionnement des endpoints principaux :
- `GET /api/home/donnees` - Données de la page d'accueil
- `POST /api/auth/elevation-role` - Élévation de rôles utilisateur
- Endpoints de donations

### Tests de Services Métier

Les tests unitaires couvrent les services critiques :
- **UtilisateurService** : Authentification, gestion des rôles, tokens de récupération
- **PersonnageService** : CRUD des personnages, validation par système de jeu
- **EmailService** : Envoi d'emails, templates, configuration
- **PdfService** : Génération de PDFs, gestion des templates

## Scripts Utilitaires

### Organisation des Scripts

Tous les scripts créés durant le développement et les tests sont placés dans le répertoire `scripts/` à la racine du projet :

```
scripts/
├── debug-email-sending.js      # Diagnostic envoi emails
├── debug-token-expiration.js   # Diagnostic tokens de récupération
├── debug-env-test.js          # Diagnostic configuration de test
├── test-*.js                  # Scripts de test manuels
└── README.md                  # Documentation des scripts
```

**Conventions pour les scripts** :
- Noms explicites en kebab-case
- Documentation en en-tête avec usage et paramètres
- Gestion d'erreurs robuste
- Logs informatifs

## Bonnes Pratiques

### 1. Structure des Tests
- Organisez les tests par fonctionnalité
- Utilisez des noms descriptifs
- Isolez chaque test (pas d'état partagé)

### 2. Mock et Stubs
- Mockez les services externes (APIs, base de données)
- Utilisez des données déterministes
- Évitez les appels réseau en test unitaire

### 3. Tests de Régression
- Créez des tests spécifiques pour chaque bug critique détecté
- Documentez le contexte du bug dans les commentaires
- Vérifiez que le test échoue sans la correction

### 4. Debugging Tests
```javascript
// Ajoutez des timeouts pour les tests async
test('génération PDF', async () => {
  const result = await generatePdf(personnageId);
  expect(result).toBeDefined();
}, 30000); // 30 secondes

// Logs détaillés en cas d'échec
afterEach(() => {
  if (global.currentTest?.errors?.length > 0) {
    console.log('Test failed. Current state:', JSON.stringify(state, null, 2));
  }
});
```

## Ressources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest pour les API](https://github.com/visionmedia/supertest)
- [Testing Library](https://testing-library.com/docs/)
- [Documentation interne sur les tests de régression](../tests/regression/token-fillable-bug.test.js)