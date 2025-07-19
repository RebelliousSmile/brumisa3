# Architecture Globale

## Vue d'ensemble du projet

Générateur de PDFs pour fiches de personnages et aides de jeu de rôle, développé en **JavaScript pur** avec une architecture **MVC moderne** utilisant **Alpine.js** pour l'interactivité frontend.

### 🎯 Objectif principal
Créer et gérer des fiches de personnages pour différents systèmes de JDR avec génération automatique de PDFs stylisés, tout en maintenant une approche mobile-first.

## Stack technique

### Backend
- **Runtime** : Node.js 18+
- **Framework web** : Express.js
- **Base de données** : SQLite (développement) / PostgreSQL (production)
- **Templates** : EJS
- **Génération PDF** : Puppeteer
- **Authentification** : Sessions Express
- **Logs** : Winston

### Frontend
- **Framework réactif** : Alpine.js 3.x
- **CSS** : Tailwind CSS
- **Architecture** : Composants modulaires
- **Approche** : Progressive Enhancement
- **Mobile** : Mobile-first responsive

### Outils de développement
- **Tests** : Jest
- **Linting** : ESLint
- **CSS** : PostCSS + Autoprefixer
- **Build** : Scripts npm personnalisés

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

## Sécurité

### Authentification
- **Sessions Express** avec cookies sécurisés
- **Codes d'accès** pour élévation de rôles (inspiré EuroCeramic)
- **Validation Joi** côté serveur
- **Protection CSRF** et rate limiting

### Rôles utilisateur
- **UTILISATEUR** : Accès de base (CRUD personnages)
- **PREMIUM** : Fonctionnalités avancées
- **ADMIN** : Administration complète

### Stockage sécurisé
- **Codes d'accès** : Hachage + salage
- **Sessions** : Configuration sécurisée
- **Fichiers PDF** : Nettoyage automatique

## Performance

### Génération PDF
- **Asynchrone** : Puppeteer en arrière-plan
- **Statuts** : Suivi EN_ATTENTE → EN_TRAITEMENT → TERMINÉ/ÉCHEC
- **Cache** : Templates compilés
- **Nettoyage** : Expiration automatique des PDFs

### Frontend
- **Lazy loading** : Composants à la demande
- **LocalStorage** : Cache et mode hors ligne
- **Optimisations** : CSS critique inline, scripts différés

## Évolutivité

### Nouveaux systèmes JDR
1. Configuration dans `systemesJeu.js`
2. Template PDF thématique
3. Validation métier spécifique
4. Tests avec personnages d'exemple

### Extensions futures
- **Collaboration** : Partage de fiches entre joueurs
- **Campagnes** : Groupement de personnages  
- **Templates personnalisés** : Éditeur visuel
- **Export formats** : JSON, XML, Roll20
- **API publique** : Intégration applications tierces

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

## Maintenance

### Monitoring
- **Logs structurés** avec niveaux appropriés
- **Messages d'erreur explicites** côté client et serveur
- **Traces de stack** en développement
- **Métriques** des performances PDF

### Mises à jour
1. **Tests** obligatoires avant modification
2. **Migrations base de données** versionnées
3. **Documentation** maintenue à jour
4. **Changelog** pour chaque version

### Debugging
- **Winston** pour logs serveur structurés
- **Alpine DevTools** pour debug frontend
- **Erreurs unifiées** avec codes et contexte
- **Mode développement** verbeux