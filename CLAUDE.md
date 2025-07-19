# Générateur PDF JDR

## Vue d'ensemble

Générateur de PDFs pour fiches de personnages et aides de jeu de rôle, développé en **JavaScript pur** avec une architecture **MVC moderne** utilisant **Alpine.js** pour l'interactivité frontend.

### 🎯 Objectif
Créer et gérer des fiches de personnages pour différents systèmes de JDR (Monsterhearts, 7ème Mer, Engrenages & Sortilèges, Metro 2033, Mist Engine) avec génération automatique de PDFs stylisés.

### 🏗️ Architecture
- **Backend** : Node.js + Express + SQLite + EJS
- **Frontend** : Alpine.js + Tailwind CSS (architecture modulaire)
- **PDF** : Puppeteer avec templates HTML/CSS personnalisés
- **Auth** : Sessions Express avec codes d'accès par rôles

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
│   │   └── PdfController.js
│   ├── services/                  # Services métier
│   │   ├── BaseService.js        # CRUD générique
│   │   ├── UtilisateurService.js
│   │   ├── PersonnageService.js
│   │   └── PdfService.js         # Génération Puppeteer
│   ├── utils/                     # Utilitaires
│   │   ├── systemesJeu.js        # Configuration systèmes JDR
│   │   └── logManager.js         # Logs Winston
│   ├── database/                  # Gestion base de données
│   │   ├── db.js                 # Connexion SQLite
│   │   ├── init.js              # Initialisation tables
│   │   └── seed.js              # Données de test
│   ├── views/                     # Templates EJS (logique séparée)
│   │   ├── layouts/principal.ejs # Layout de base
│   │   ├── personnages/          # Vues personnages
│   │   └── auth/                 # Vues authentification
│   └── routes/                    # Routes Express
├── public/                        # Assets statiques
│   ├── js/                       # JavaScript Alpine.js modulaire
│   │   ├── app.js               # Configuration + stores globaux
│   │   ├── services/            # Services métier frontend
│   │   │   ├── PersonnageService.js
│   │   │   └── PdfService.js
│   │   └── components/          # Composants Alpine réutilisables
│   │       ├── PersonnageComponent.js
│   │       ├── AuthComponent.js
│   │       └── TableauBordComponent.js
│   ├── css/
│   └── images/
├── data/                         # Fichiers CSV d'import
├── output/                       # PDFs générés
├── tests/                        # Tests unitaires et intégration
└── documentation/               # Documentation et artefacts
```

## Systèmes de JDR supportés

### 🩸 Monsterhearts (PbtA)
- **Attributs** : Hot, Cold, Volatile, Dark (-1 à +3)
- **Mécaniques** : Skins, Moves, Conditions, Strings, Harm
- **Style PDF** : Gothique romantique avec thème cœurs

### ⚓ 7ème Mer (2e édition)
- **Attributs** : Might, Grace, Wits, Resolve, Panache (1-5)
- **Mécaniques** : Nations, Hero Points, Avantages, Reputation
- **Style PDF** : Maritime avec thème aventure

### ⚙️ Engrenages & Sortilèges (Ecryme)
- **Attributs** : Corps, Esprit, Âme (1-5)
- **Mécaniques** : Spécialisations Magie/Science, Santé/Équilibre Mental
- **Style PDF** : Steampunk avec engrenages

### ☢️ Metro 2033
- **Attributs** : Might, Agility, Wits, Empathy (3-18)
- **Mécaniques** : Factions, Radiation, Moralité, Équipement
- **Style PDF** : Post-apocalyptique sombre

### 🌫️ Mist Engine (Legend in the Mist / Tokyo:Otherscape)
- **Attributs** : Edge, Heart, Iron, Shadow, Wits (1-4)
- **Mécaniques** : Assets, Debilities, Momentum, Système narratif
- **Style PDF** : Mystique avec brouillard

## Architecture Alpine.js

### 🗂️ Stores globaux
```javascript
Alpine.store('app') // Configuration, API, messages, utilitaires
Alpine.store('navigation') // État navigation mobile
```

### 🔧 Services métier
- **PersonnageService** : CRUD personnages, validation, génération PDF
- **PdfService** : Gestion PDFs, téléchargement, statuts

### 🧩 Composants réutilisables
- **listePersonnages()** : Liste avec filtres et actions
- **creationPersonnage()** : Formulaire adaptatif par système
- **fichePersonnage()** : Affichage avec actions PDF
- **connexion()** : Auth + élévation de rôle
- **tableauBord()** : Dashboard avec stats

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
- Stockage sécurisé en JSON avec hachage

### 🛡️ Sécurité
- Sessions Express avec cookies sécurisés
- Validation Joi côté serveur
- Middleware authentification/autorisation
- Protection CSRF et rate limiting

## Génération PDF

### 🎨 Templates par système
Chaque système a son **template HTML/CSS unique** avec :
- Couleurs thématiques
- Typographies adaptées
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

## Développement

### 🚀 Installation rapide (Windows)
```cmd
git clone <repository>
cd generateur-pdf-jdr
npm install
npm run db:init    # Initialise SQLite
npm run db:seed    # Données de test
npm run dev        # Serveur + CSS watch
```

### 💡 Commandes Windows pour Claude
**IMPORTANT** : Ce projet fonctionne sur Windows. Utilisez UNIQUEMENT ces commandes :

**Gestion fichiers/dossiers :**
```cmd
dir                    # Lister fichiers (équivalent ls)
mkdir dossier          # Créer dossier simple
rmdir /s dossier       # Supprimer dossier et contenu
del fichier.txt        # Supprimer fichier
copy source dest       # Copier fichier
move source dest       # Déplacer/renommer
type fichier.txt       # Afficher contenu (équivalent cat)

# CRÉATION ARBORESCENCE (PowerShell obligatoire) :
powershell -Command "New-Item -ItemType Directory -Path 'dossier\sous-dossier' -Force"
powershell -Command "New-Item -ItemType Directory -Path 'dossier1', 'dossier2\sub' -Force"
```

**Recherche :**
```cmd
findstr "pattern" *.js     # Chercher dans fichiers (équivalent grep)
where node                 # Localiser exécutable (équivalent which)
```

**Développement :**
```cmd
npm install               # Installer dépendances
npm run dev              # Mode développement
node src\app.js          # Lancer application
```

**ATTENTION** : 
- Utilisez `\` pour les chemins (pas `/`)
- **mkdir ne fonctionne que pour dossiers simples** - utilisez PowerShell pour l'arborescence
- Pour créer des sous-dossiers : **OBLIGATOIRE** PowerShell avec New-Item
- `cmd /c "commande"` si nécessaire pour autres cas

### 🛠️ Scripts disponibles
```bash
npm run dev         # Mode développement (nodemon + CSS watch)
npm run build:css   # Compile Tailwind CSS
npm start          # Production
npm test           # Tests Jest
npm run lint       # ESLint
```

### 🗄️ Base de données
- **SQLite** pour simplicité développement
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

## Principes de conception

### 🎯 SOLID
- **S** : Modèles/Services avec responsabilité unique
- **O** : Extensions via nouveaux systèmes JDR
- **L** : Substitution BaseModel/BaseService
- **I** : Interfaces séparées (auth, CRUD, PDF)
- **D** : Inversion dépendances (services injectés)

### 🔄 DRY (Don't Repeat Yourself)
- **BaseModel/BaseController/BaseService** : Logique commune
- **Composants Alpine réutilisables** : Une fonction = un usage
- **Configuration centralisée** : Systèmes JDR, couleurs, API
- **Utilitaires partagés** : Validation, formatage, logs

### 📱 Progressive Enhancement
- **Fonctionne sans JavaScript** (liens/formulaires de base)
- **Enhanced avec Alpine.js** (interactivité, validation temps réel)
- **Responsive design** (mobile-first Tailwind)

## Extensions futures

### 🎨 Nouveaux systèmes JDR
1. Ajouter configuration dans `systemesJeu.js`
2. Créer template PDF dans `PdfService`
3. Tester avec personnage d'exemple

### 🚀 Fonctionnalités avancées
- **Collaboration** : Partage de fiches entre joueurs
- **Campagnes** : Groupement de personnages
- **Templates personnalisés** : Éditeur visuel
- **Export formats** : JSON, XML, Roll20
- **API publique** : Intégration applications tierces

### 🔧 Améliorations techniques
- **PostgreSQL** : Migration pour production
- **Redis** : Cache et sessions distribuées
- **TypeScript** : Typage optionnel pour grands projets
- **Docker** : Containerisation
- **CI/CD** : Tests et déploiement automatiques

## Comparaison avec EuroCeramic

### ✅ Conservé d'EuroCeramic
- **Système de rôles** avec codes d'accès
- **Architecture MVC** bien structurée
- **Logging détaillé** avec Winston
- **Configuration flexible** par environnement
- **Templates EJS** avec layouts

### 🆕 Améliorations apportées
- **Architecture Alpine.js modulaire** (vs logique dans EJS)
- **Services frontend séparés** (vs utils mélangés)
- **Validation côté client ET serveur** (vs serveur uniquement)
- **Composants réutilisables** (vs code dupliqué)
- **Principes SOLID/DRY appliqués** systématiquement
- **Gestion d'erreurs unifiée** (vs dispersée)
- **Base de données relationnelle propre** (vs fichiers JSON)

## Support et maintenance

### 📚 Documentation
- **README.md** : Installation et utilisation
- **CLAUDE.md** : Architecture détaillée (ce fichier)
- **API.md** : Documentation des endpoints
- **CONTRIBUTING.md** : Guide de contribution

### 🐛 Debugging
- **Logs structurés** avec niveaux (error, warn, info, debug)
- **Messages d'erreur explicites** côté client et serveur
- **Traces de stack** en développement
- **Monitoring** des performances PDF

### 🔄 Mise à jour
1. **Tests** avant toute modification
2. **Migrations base de données** versionnées
3. **Documentation** mise à jour
4. **Changelog** pour chaque version

---

## Contribution

Ce projet suit les principes du **clean code** et privilégie la **maintenabilité** à long terme. Chaque ajout doit respecter l'architecture existante et inclure tests + documentation.

**Contact** : Voir README.md pour les informations de contribution.

**Licence** : Voir LICENSE.md pour les détails de licence.