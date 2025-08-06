# 🎲 Générateur PDF JDR

**Générateur de PDFs pour fiches de personnages et aides de jeu de rôle**

Créez et gérez vos fiches de personnages pour **Monsterhearts**, **7ème Mer**, **Engrenages & Sortilèges**, **Metro 2033** et **Mist Engine** avec génération automatique de PDFs stylisés.

## ✨ Fonctionnalités

- 🎭 **5 systèmes JDR supportés** avec templates spécialisés
- 📄 **Génération PDF automatique** avec styles thématiques
- 👥 **Système de rôles** (Utilisateur, Premium, Admin)
- ⚡ **Interface Alpine.js** moderne et réactive
- 🎨 **Design responsive** avec Tailwind CSS
- 🔒 **Authentification sécurisée** avec codes d'accès
- 🏗️ **Architecture MVC propre** avec principes SOLID/DRY

## 🎮 Systèmes supportés

| Système | Type | Mécaniques |
|---------|------|-----------|
| **Monsterhearts** | PbtA | Skins, Moves, Conditions, Strings |
| **7ème Mer** | Swashbuckling | Nations, Hero Points, Avantages |
| **Engrenages & Sortilèges** | Steampunk | Spécialisations Magie/Science |
| **Metro 2033** | Post-apocalyptique | Factions, Radiation, Survie |
| **Mist Engine** | Narratif | Assets, Debilities, Momentum |

## 🚀 Installation rapide

```bash
# Cloner le repository
git clone https://github.com/RebelliousSmile/generateur-pdf-jdr.git
cd generateur-pdf-jdr

# Installer les dépendances
npm install

# Configuration
cp .env.example .env
# Modifier les variables d'environnement si nécessaire

# Initialiser la base de données
npm run db:init
npm run db:seed

# Démarrer en mode développement
npm run dev
```

L'application sera accessible sur http://localhost:3074

## 📚 Documentation

- **[CLAUDE.md](documentation/CLAUDE.md)** - Architecture détaillée du projet
- **[API.md](documentation/API.md)** - Documentation des endpoints
- **[SYSTEMS.md](documentation/SYSTEMS.md)** - Guide des systèmes JDR

## 🏗️ Architecture

```
src/
├── models/          # Modèles métier (SOLID)
├── controllers/     # Contrôleurs MVC
├── services/        # Services métier
├── views/           # Templates EJS (logique séparée)
└── routes/          # Routes Express
public/js/
├── services/        # Services métier frontend
├── components/      # Composants Alpine réutilisables
└── app.js          # Configuration Alpine + stores
```

### 🧩 Architecture Alpine.js

- **Stores globaux** pour état partagé
- **Services métier** séparés (PersonnageService, PdfService)
- **Composants réutilisables** sans logique dans les templates
- **Validation côté client ET serveur**

## 🎯 Utilisation

### Créer un personnage
1. Choisir un système de JDR
2. Remplir les informations de base
3. Configurer les attributs selon le système
4. Sauvegarder la fiche

### Générer un PDF
1. Ouvrir la fiche personnage
2. Cliquer "Générer PDF"
3. Télécharger le document stylisé

### Codes d'accès
- **Premium** : `123456` (plus de fonctionnalités)
- **Admin** : `789012` (administration complète)

## 🛠️ Scripts disponibles

### Scripts NPM

```bash
npm run dev         # Mode développement (nodemon + CSS watch)
npm run build:css   # Compile Tailwind CSS
npm start          # Production
npm test           # Tests Jest
npm run lint       # ESLint
npm run db:seed    # Remplir avec données d'exemple
```

### Scripts de maintenance (dossier `scripts/`)

#### 🗄️ **Base de données**

```bash
# Migration complète de la base de données (11 migrations)
node scripts/migrate-db.js

# Debug et vérification
node scripts/debug-db.js                    # Vérifier état général de la DB
node scripts/check-table-structure.js       # Vérifier structure des tables
node scripts/check-users.js                # Vérifier utilisateurs et authentification
node scripts/test-db-connection.js         # Tester connexion à la base

# Base de données de test
node scripts/init-test-db.js               # Initialiser base de test
```

#### 🎲 **Oracles et contenus**

```bash
# Injection d'oracles
node scripts/injecter-oracle.js [fichier.json] [--jeu=nom] [--admin-id=123]
node scripts/inject-monsterhearts.js       # Injecter oracles Monsterhearts
node scripts/inject-all-monsterhearts.js   # Injecter tous les oracles MH

# Debug oracles
node scripts/debug-oracles.js              # Vérifier oracles en base
node scripts/check-oracles-db.js           # État complet des oracles
node scripts/test-oracle-query.js          # Tester requêtes oracles
```

#### 🔐 **Authentification et utilisateurs**

```bash
# Tests d'authentification
node scripts/test-auth-manual.js           # Test auth manuel
node scripts/debug-user-exists.js          # Vérifier existence utilisateur
node scripts/test-reset-password.js        # Tester reset mot de passe
node scripts/test-reset-admin.js           # Reset admin

# Gestion mots de passe
node scripts/debug-password-reset.js       # Debug reset password
node scripts/debug-token-expiration.js     # Debug expiration tokens
```

#### 📧 **Emails et notifications**

```bash
# Tests d'envoi d'emails
node scripts/test-email.js                 # Test email basique
node scripts/test-email-simple.js          # Test email simplifié  
node scripts/debug-email-sending.js        # Debug envoi emails
node scripts/test-password-reset-email.js  # Test email reset password
node scripts/test-with-real-user-email.js  # Test avec vrai utilisateur

# Services emails
node scripts/debug-resend.js               # Debug service Resend
node scripts/test-email-service-improved.js # Test service email amélioré
```

#### 📄 **PDFs et génération**

```bash
# Tests génération PDF
node scripts/test-base-pdfkit.js           # Test PDFKit de base
node scripts/test-pdf-model.js             # Test modèle PDF
node scripts/test-monsterhearts-generique-pdfkit.js # Test PDF Monsterhearts
node scripts/test-long-document-pdfkit.js  # Test document long
```

#### 🧪 **Tests et debug**

```bash
# Tests endpoints
node scripts/test-endpoints-real.js        # Test endpoints réels
node scripts/test-route-oracles.js         # Test routes oracles
node scripts/test-session-expiration.js    # Test expiration sessions

# Debug divers
node scripts/debug-env-test.js             # Debug variables environnement
node scripts/test-templates-helpers.js     # Test helpers templates
node scripts/load-env.js                   # Charger variables env
```

#### 🔧 **Migration et développement**

```bash
# Migration de projet
node scripts/migrate-chai-to-jest.js       # Migration Chai vers Jest
node scripts/migrate-existing-oracles.js   # Migration oracles existants
node scripts/add-game-system-column.js     # Ajouter colonne système jeu

# Utilitaires développement  
node scripts/migrate-db-functions.js       # Fonctions de migration
node scripts/test-db-helper.js             # Helper de test DB
```

## 🧪 Tests

```bash
npm test                    # Tous les tests
npm run test:unit          # Tests unitaires
npm run test:integration   # Tests d'intégration
npm run test:coverage     # Couverture de code
```

## 🤝 Contribution

Les contributions sont les bienvenues ! Nous accueillons tous types de contributions :

### 🐛 Signaler un bug ou proposer une fonctionnalité

- **[Créer une issue](https://github.com/RebelliousSmile/generateur-pdf-jdr/issues/new)** pour signaler un problème
- **[Parcourir les issues existantes](https://github.com/RebelliousSmile/generateur-pdf-jdr/issues)** pour voir ce qui est en cours

### 🔧 Contribuer au code

1. **Fork** le repository
2. **Créer une branche** pour votre fonctionnalité : `git checkout -b feature/ma-fonctionnalite`
3. **Respecter l'architecture** existante (SOLID/DRY)
4. **Ajouter des tests** pour le nouveau code
5. **Mettre à jour la documentation**
6. **Soumettre une [Pull Request](https://github.com/RebelliousSmile/generateur-pdf-jdr/pulls)**

### 🎲 Ajouter un nouveau système JDR

1. Ajouter la configuration dans `src/utils/systemesJeu.js`
2. Créer le template PDF dans `src/services/PdfService.js`  
3. Ajouter les tests correspondants
4. Mettre à jour la documentation

### 📖 Améliorer la documentation

- Corriger les fautes de frappe
- Ajouter des exemples
- Traduire en d'autres langues
- Améliorer les guides d'utilisation

**[Voir toutes les façons de contribuer →](https://github.com/RebelliousSmile/generateur-pdf-jdr/blob/main/CONTRIBUTING.md)**

## 📝 Licence

Ce projet est sous licence MIT. Voir [LICENSE](LICENSE) pour plus de détails.

## 🙏 Remerciements

- Inspiré de **EuroCeramic** pour l'architecture de base
- Communauté **Alpine.js** pour la réactivité moderne
- **Tailwind CSS** pour le design system
- Créateurs des systèmes JDR supportés

---

**Créé avec ❤️ pour la communauté JDR française**