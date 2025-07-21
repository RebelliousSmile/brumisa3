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

L'application sera accessible sur http://localhost:3000

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

```bash
npm run dev         # Mode développement (nodemon + CSS watch)
npm run build:css   # Compile Tailwind CSS
npm start          # Production
npm test           # Tests Jest
npm run lint       # ESLint
npm run db:seed    # Remplir avec données d'exemple
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