# Documentation brumisater

**Créateur de fiches de personnages JDR immersives et professionnelles**

## 🚀 Démarrage rapide

### Pour les nouveaux développeurs
1. **Commencez ici** → [`ARCHITECTURE/architecture-overview.md`](ARCHITECTURE/architecture-overview.md) - Comprenez les concepts fondamentaux
2. **Systèmes JDR** → [`SYSTEMES-JDR/systemes-configuration.md`](SYSTEMES-JDR/systemes-configuration.md) - Découvrez les jeux supportés  
3. **Environnement** → [`DEVELOPPEMENT/commandes-windows.md`](DEVELOPPEMENT/commandes-windows.md) - Configurez votre poste de développement
4. **User Stories** → [`FONCTIONNALITES/user-stories.md`](FONCTIONNALITES/user-stories.md) - Comprenez les besoins utilisateurs

### Pour les contributeurs expérimentés
- **Modèles de données** → [`ARCHITECTURE/architecture-models.md`](ARCHITECTURE/architecture-models.md)
- **Flux PDF** → [`DEVELOPPEMENT/flux-generation-pdf.md`](DEVELOPPEMENT/flux-generation-pdf.md)
- **Charte graphique** → [`DESIGN-SYSTEM/charte-graphique-web.md`](DESIGN-SYSTEM/charte-graphique-web.md)

---

## 📚 Organisation de la documentation

### 🏗️ **ARCHITECTURE/** - Structure technique
- **`architecture-overview.md`** - Vue d'ensemble et concepts clés (MVC, Document vs Personnage)
- **`architecture-models.md`** - Modèles de données et relations en base
- **`architecture-frontend.md`** - Composants Alpine.js et vues EJS

### 🎮 **SYSTEMES-JDR/** - Jeux de rôle supportés
- **`systemes-configuration.md`** - Configuration des 5 systèmes + types de données
- **`systemes-interfaces.md`** - Pages et layouts spécifiques par système

### 📋 **FONCTIONNALITES/** - Fonctionnalités métier
- **`user-stories.md`** - Stories utilisateur et personas (Casey, Sam, Alex, Jordan)
- **`oracles.md`** - Système d'oracles et génération aléatoire
- **`features-avancees.md`** - Fonctionnalités avancées, architecture Alpine.js 4 couches

### 🎨 **DESIGN-SYSTEM/** - Charte graphique
- **`charte-graphique-web.md`** - Design système pour l'interface web (CSS, Tailwind)
- **`charte-graphique-pdf.md`** - Règles générales PDF (PDFKit, impression)
- **`charte-graphique-monsterhearts-pdf.md`** - Spécificités gothique/romantique
- **`charte-graphique-engrenages-pdf.md`** - Spécificités steampunk
- **`charte-graphique-metro2033-pdf.md`** - Spécificités post-apocalyptique
- **`charte-graphique-zombiology-pdf.md`** - Spécificités survival horror

### 🛠️ **DEVELOPPEMENT/** - Guides techniques
- **`commandes-windows.md`** - Commandes PowerShell et environnement Windows
- **`flux-generation-pdf.md`** - Processus complet de génération PDF avec DocumentFactory
- **`pdfkit.md`** - Architecture PDFKit et templates programmatiques
- **`deployment-production.md`** - Déploiement et configuration production
- **`jsdoc-integration.md`** - Documentation automatique du code
- **`envoi-emails.md`** - Configuration email et notifications

### 📸 **Ressources**
- **`captures/`** - Screenshots et images de documentation
- **`templates/`** - Templates HTML pour les différents documents

---

## 🎯 Concepts fondamentaux

### Document vs Personnage
- **Document** : PDF généré (types: CHARACTER, TOWN, GROUP, ORGANIZATION, DANGER)
- **Personnage** : Données sauvegardées par un utilisateur connecté
- **Guest** : Utilisateur anonyme, peut créer des documents mais pas les retrouver

### Architecture MVC
- **Modèles** : BaseModel + spécialisations (Utilisateur, Document, Personnage, PDF)
- **Vues** : EJS + Alpine.js + Tailwind CSS
- **Contrôleurs** : Express.js avec services métier

### 5 Types de Documents
1. **CHARACTER** : Feuilles de personnage (tous systèmes)
2. **TOWN** : Cadres de ville (Monsterhearts)
3. **GROUP** : Plans de classe (Monsterhearts) 
4. **ORGANIZATION** : Listes de PNJs (tous systèmes)
5. **DANGER** : Fronts et dangers (Mist Engine)

### 5 Systèmes JDR Supportés
- **Monsterhearts** : Romance gothique, PbtA
- **Engrenages (Roue du Temps)** : Steampunk, pool d10
- **Metro 2033** : Post-apocalyptique, d20
- **Mist Engine** : Narratif mystique, d6
- **Zombiology** : Survie zombie, d100

---

## 🔍 Index des concepts

| Concept | Fichier principal | Détails supplémentaires |
|---------|------------------|------------------------|
| **Alpine.js** | `ARCHITECTURE/architecture-frontend.md` | Composants, état, réactivité |
| **Authentification** | `ARCHITECTURE/architecture-models.md` | Sessions, rôles, codes d'accès |
| **BaseModel** | `ARCHITECTURE/architecture-models.md` | CRUD, validation, hooks |
| **Charte graphique** | `DESIGN-SYSTEM/charte-graphique-web.md` | Couleurs, polices, thèmes |
| **Déploiement** | `DEVELOPPEMENT/deployment-production.md` | Production, environnement |
| **Documents** | `ARCHITECTURE/architecture-models.md` | Types, statuts, génération |
| **EJS** | `ARCHITECTURE/architecture-frontend.md` | Templates, layouts, vues |
| **Génération PDF** | `DEVELOPPEMENT/flux-generation-pdf.md` | Flux complet PDFKit |
| **Oracles** | `FONCTIONNALITES/oracles.md` | Tables aléatoires, générateurs |
| **PDFKit** | `DEVELOPPEMENT/pdfkit.md` | API, templates, thèmes |
| **Personnages** | `ARCHITECTURE/architecture-models.md` | Sauvegarde, gestion utilisateur |
| **PostgreSQL** | `ARCHITECTURE/architecture-models.md` | Schéma, relations, migrations |
| **Systèmes JDR** | `SYSTEMES-JDR/systemes-configuration.md` | Monsterhearts, Metro, etc. |
| **Tailwind CSS** | `DESIGN-SYSTEM/charte-graphique-web.md` | Utility-first, responsive |
| **User Stories** | `FONCTIONNALITES/user-stories.md` | Personas, critères acceptation |

---

## 🛟 Aide et support

### Problèmes fréquents
- **Erreur génération PDF** → [`DEVELOPPEMENT/flux-generation-pdf.md`](DEVELOPPEMENT/flux-generation-pdf.md) (section gestion d'erreurs)
- **Configuration système JDR** → [`SYSTEMES-JDR/systemes-configuration.md`](SYSTEMES-JDR/systemes-configuration.md) (section contribution)
- **Commandes développement** → [`DEVELOPPEMENT/commandes-windows.md`](DEVELOPPEMENT/commandes-windows.md)

### Scripts utiles
```bash
# Tests PDFKit
node scripts/test-base-pdfkit.js

# Génération documentation  
npm run docs

# Déploiement
npm run deploy:production
```

---

*Documentation mise à jour le : 2025-01-22 - Version post-réorganisation*