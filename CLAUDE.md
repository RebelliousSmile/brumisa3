# Générateur PDF JDR - Documentation Technique

## Vue d'ensemble

Générateur de PDFs pour fiches de personnages JDR en **JavaScript pur** avec architecture **MVC moderne** et **Alpine.js**.

### 🏗️ Stack technique
- **Backend** : Node.js + Express + PostgreSQL + EJS
- **Frontend** : Alpine.js + Tailwind CSS 
- **PDF** : Puppeteer avec templates HTML/CSS
- **Auth** : Sessions Express avec codes d'accès

### 💻 Environnement de développement
- **OS** : Windows 10/11 (commandes Windows uniquement)
- **Shell** : cmd.exe / PowerShell
- **Séparateurs** : Antislash `\` pour les chemins
- **Commandes** : Windows natives (dir, mkdir, del, copy, etc.)

## Structure du projet

```
generateur-pdf-jdr/
├── src/
│   ├── app.js                     # Point d'entrée Express
│   ├── config.js                  # Configuration centralisée
│   ├── models/                    # Modèles métier (SOLID)
│   │   ├── BaseModel.js          # Classe de base
│   │   ├── Utilisateur.js        # Gestion utilisateurs + rôles
│   │   ├── Personnage.js         # Logique personnages JDR
│   │   └── Pdf.js               # Gestion des PDFs générés
│   ├── controllers/               # Contrôleurs MVC
│   │   ├── BaseController.js     # Gestion erreurs + auth
│   │   ├── AuthentificationController.js
│   │   ├── PersonnageController.js
│   │   ├── PdfController.js
│   │   └── HomeController.js     # Page d'accueil + newsletter
│   ├── services/                  # Services métier
│   │   ├── BaseService.js        # CRUD générique
│   │   ├── UtilisateurService.js
│   │   ├── PersonnageService.js
│   │   ├── PdfService.js         # Génération Puppeteer
│   │   ├── NewsletterService.js  # Newsletter + flux RSS
│   │   └── TemoignageService.js  # Témoignages utilisateurs
│   ├── utils/                     # Utilitaires
│   │   ├── systemesJeu.js        # Configuration systèmes JDR
│   │   └── logManager.js         # Logs Winston
│   ├── database/                  # Gestion base de données
│   │   ├── db.js                 # Connexion PostgreSQL
│   │   ├── init.js              # Initialisation tables
│   │   └── seed.js              # Données de test
│   ├── views/                     # Templates EJS
│   │   ├── layouts/principal.ejs # Layout principal mobile-first
│   │   ├── index.ejs            # Page d'accueil enrichie
│   │   ├── personnages/          # Vues personnages
│   │   └── auth/                 # Vues authentification
│   └── routes/                    # Routes Express
│       ├── api.js               # Routes API REST
│       └── web.js               # Routes pages web
├── public/                        # Assets statiques
│   ├── js/                       # JavaScript Alpine.js modulaire
│   │   ├── app.js               # Configuration + stores globaux
│   │   ├── services/            # Services métier frontend
│   │   │   ├── PersonnageService.js
│   │   │   └── PdfService.js
│   │   └── components/          # Composants Alpine réutilisables
│   │       ├── PersonnageComponent.js
│   │       ├── AuthComponent.js
│   │       ├── TableauBordComponent.js
│   │       └── PageAccueilComponent.js
│   ├── css/                     # Styles Tailwind compilés
│   └── images/                  # Assets statiques
├── data/                         # Fichiers CSV d'import
├── output/                       # PDFs générés (temporaires)
├── tests/                        # Tests unitaires et intégration
└── documentation/               # Documentation thématique
    ├── systemes-jdr.md          # Détails systèmes supportés
    ├── architecture-globale.md  # Architecture et principes
    ├── ux-mobile-first.md       # Spécifications UX
    └── deployment-production.md # Guide déploiement
```

## Architecture Alpine.js

### 🗂️ Stores globaux
```javascript
Alpine.store('app') // Configuration, API, messages, utilitaires
Alpine.store('navigation') // État navigation mobile
Alpine.store('creation') // État formulaires de création
Alpine.store('partage') // Gestion partage et export
```

### 🔧 Services métier frontend
- **PersonnageService** : CRUD personnages, validation, génération PDF
- **PdfService** : Gestion PDFs, téléchargement, statuts

### 🧩 Composants réutilisables
- **listePersonnages()** : Liste avec filtres et actions
- **creationPersonnage()** : Formulaire adaptatif par système
- **fichePersonnage()** : Affichage avec actions PDF
- **connexion()** : Auth + élévation de rôle
- **tableauBord()** : Dashboard avec stats
- **pageAccueil()** : Page d'accueil avec PDFs récents, newsletter, témoignages

### 📡 Séparation des responsabilités
- **Templates EJS** : Structure HTML pure, pas de logique JS
- **Composants Alpine** : Toute la logique métier frontend
- **Services** : Communication API et validation
- **Stores** : État global partagé

## Système d'authentification

### 👥 Rôles utilisateur
- **UTILISATEUR** : Accès de base (CRUD personnages)
- **PREMIUM** : Fonctionnalités avancées (plus de templates)
- **ADMIN** : Administration complète

### 🔐 Codes d'accès (inspiré EuroCeramic)
- **Premium** : `123456` (configurable)
- **Admin** : `789012` (configurable)
- Stockage sécurisé avec hachage

### 🛡️ Sécurité
- Sessions Express avec cookies sécurisés
- Validation Joi côté serveur
- Middleware authentification/autorisation
- Protection CSRF et rate limiting

## Génération PDF

### 🎨 Templates par système
Chaque système a son **template HTML/CSS unique** avec :
- Couleurs thématiques configurables
- Typographies adaptées au setting
- Mise en page spécialisée
- Éléments visuels immersifs

### ⚡ Processus de génération
1. **Création entrée PDF** en base (statut EN_ATTENTE)
2. **Génération asynchrone** avec Puppeteer
3. **Mise à jour statut** (EN_TRAITEMENT → TERMINÉ/ÉCHEC)
4. **Stockage fichier** avec URL temporaire
5. **Nettoyage automatique** des PDFs expirés

### 📄 Types de PDF
- Fiches de personnages
- Fiches PNJ
- Cartes de référence
- Guides de moves (PbtA)
- Suivi de conditions
- Notes de session

### 👁️ Visibilité PDFs
- **Privé** : Visible par le propriétaire uniquement
- **Public** : Affiché sur la page d'accueil
- **Admin/Modérateur** : Voient tous les PDFs

## Fonctionnalités page d'accueil

### 📄 PDFs récents publics
- Affichage des dernières créations partagées
- Filtrage par rôle (admin voit tout, utilisateurs voient public)
- Métadonnées : auteur, système, téléchargements

### 📧 Newsletter
- Inscription/désinscription par email
- Gestion des abonnés en mémoire (évolutif vers DB)
- Token de désinscription sécurisé

### 📰 Actualités avec flux RSS
- Actualités du projet (nouvelles fonctionnalités, systèmes)
- Flux RSS disponible à `/api/actualites/rss`
- Gestion admin pour ajouter des actualités

### 💬 Témoignages utilisateurs
- Système de notation (1-5 étoiles)
- Modération admin (approbation/refus)
- Affichage conditionnel sur page d'accueil

### 💝 Système de dons
- Informations sur le financement du projet
- Objectifs et avantages donateurs
- Intégration Liberapay/Tipeee/Ko-fi

## Développement

### 🚀 Installation rapide
```bash
git clone <repository>
cd generateur-pdf-jdr
npm install
npm run db:init    # Initialise PostgreSQL
npm run db:seed    # Données de test
npm run dev        # Serveur + CSS watch
```

### 🛠️ Scripts disponibles
```bash
npm run dev         # Mode développement (nodemon + CSS watch)
npm run build:css   # Compile Tailwind CSS
npm start          # Production
npm test           # Tests Jest
npm run lint       # ESLint
```

### 🗄️ Base de données
- **PostgreSQL** pour la production
- **Migrations** automatiques au démarrage
- **Seed** avec données d'exemple pour chaque système
- **Modèles** avec validation et formatage

### 🧪 Tests
```bash
npm test                    # Tous les tests
npm run test:unit          # Tests unitaires
npm run test:integration   # Tests d'intégration
npm run test:coverage     # Couverture de code
```

## Validation et erreurs

### Validation côté serveur (Joi)
```javascript
const schema = Joi.object({
    nom: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    systeme_jeu: Joi.string().valid(...Object.keys(systemesJeu)).required()
});
```

### Gestion d'erreurs unifiée
```javascript
// BaseController.js
gererErreur(res, erreur, codeStatut = 500) {
    // Logging + formatage réponse standardisée
    if (erreur.name === 'ValidationError') {
        return this.repondreErreur(res, 400, erreur.message, 'validation');
    }
    // ... autres types d'erreurs
}
```

### Messages d'erreur frontend
```javascript
// Alpine.js store
Alpine.store('app', {
    ajouterMessage(type, texte) {
        const message = { id: Date.now(), type, texte };
        this.messages.push(message);
        // Auto-suppression après délai
    }
});
```

## Configuration et environnement

### Variables d'environnement
```bash
# Base de données
DATABASE_URL=postgresql://user:pass@localhost:5432/generateur_pdf_jdr

# Session et sécurité
SESSION_SECRET=your-secret-key
CSRF_SECRET=another-secret

# Codes d'accès
PREMIUM_CODE=123456
ADMIN_CODE=789012

# Configuration
NODE_ENV=development
PORT=3076
LOG_LEVEL=debug
```

### Fichiers de configuration
```javascript
// src/config.js
module.exports = {
    port: process.env.PORT || 3076,
    database: {
        url: process.env.DATABASE_URL || 'postgresql://localhost:5432/pdf_jdr',
        ssl: process.env.NODE_ENV === 'production'
    },
    auth: {
        session: {
            secret: process.env.SESSION_SECRET,
            maxAge: 24 * 60 * 60 * 1000 // 24h
        },
        codes: {
            premium: process.env.PREMIUM_CODE || '123456',
            admin: process.env.ADMIN_CODE || '789012'
        }
    }
};
```

## API REST

### Endpoints principaux
```javascript
// Authentification
POST /api/auth/connexion
POST /api/auth/inscription  
POST /api/auth/deconnexion
POST /api/auth/elevation-role

// Personnages
GET    /api/personnages
POST   /api/personnages
GET    /api/personnages/:id
PUT    /api/personnages/:id
DELETE /api/personnages/:id
POST   /api/personnages/:id/pdf

// PDFs
GET    /api/pdfs
POST   /api/pdfs/generer
GET    /api/pdfs/:id/statut
GET    /api/pdfs/:id/telecharger
POST   /api/pdfs/:id/basculer-visibilite

// Page d'accueil
GET    /api/home/donnees
POST   /api/newsletter/inscription
GET    /api/actualites/rss
POST   /api/temoignages
```

### Format de réponse standardisé
```javascript
// Succès
{
    "succes": true,
    "message": "Opération réussie",
    "donnees": { ... },
    "timestamp": "2024-01-15T10:30:00.000Z"
}

// Erreur
{
    "succes": false,
    "message": "Description de l'erreur",
    "type": "validation|erreur_interne|non_trouve",
    "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Bonnes pratiques de code

### Controllers
- Hériter de `BaseController` pour la gestion d'erreurs
- Utiliser `wrapAsync()` pour les méthodes async
- Valider les paramètres avec `validerParametres()`
- Sanitiser les entrées avec `sanitizeInput()`

### Services  
- Hériter de `BaseService` pour les logs
- Séparer logique métier des contrôleurs
- Utiliser try/catch avec logs explicites
- Retourner objets standardisés

### Frontend Alpine.js
- Composants purs sans effets de bord
- État local encapsulé
- Communication via stores globaux
- Gestion d'erreurs avec feedback utilisateur

### Base de données
- Requêtes préparées uniquement (sécurité)
- Transactions pour opérations multiples
- Index sur colonnes de recherche
- Soft delete pour traçabilité

---

## Contribution

Ce projet suit les principes du **clean code** et privilégie la **maintenabilité** à long terme. Chaque ajout doit respecter l'architecture existante et inclure tests + documentation.

**Systèmes supportés** : Voir `documentation/systemes-jdr.md`
**Architecture** : Voir `documentation/architecture-globale.md`
**UX Mobile** : Voir `documentation/ux-mobile-first.md`
**Déploiement** : Voir `documentation/deployment-production.md`