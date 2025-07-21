# Flux de génération PDF

## Vue d'ensemble

Ce document décrit le flux complet de génération PDF depuis le formulaire web jusqu'au fichier PDF final, en utilisant la nouvelle architecture basée sur PDFKit.

## Architecture générale

```
Formulaire Web → API → Services → PDFKit → PDF Final
```

## Flux détaillé

### 1. Interface utilisateur (Frontend)

#### Formulaire de création
- **Fichier** : `src/views/systemes/monsterhearts/creer-document-generique.ejs`
- **Composant Alpine.js** : `public/js/components/DocumentGeneriqueMonsterhearts.js`
- **Données collectées** :
  - `titre` : Titre principal du document
  - `introduction` : Citation introductive (optionnel)
  - `typeDocument` : Type affiché dans la sidebar
  - `sections[]` : Sections avec niveau, titre et contenu Markdown
  - `numeroPage` : Page de démarrage
  - `piedDePage` : Pied de page personnalisé (Premium)

#### Transformation des données
```javascript
// Dans DocumentGeneriqueMonsterhearts.js
const donnees = {
    titre: this.formData.titre,
    introduction: this.formData.introduction,
    chapitre: this.formData.typeDocument.toUpperCase(),
    pageNumber: this.formData.numeroPage,
    sections: sections // Transformées depuis Markdown
};
```

### 2. Endpoint API

#### Route
```javascript
// src/routes/api.js
POST /api/pdfs/document-generique/:systeme
```

#### Contrôleur
- **Fichier** : `src/controllers/PdfController.js`
- **Méthode** : `genererDocumentGenerique()`
- **Validations** :
  - Authentification utilisateur
  - Vérification du système de jeu
  - Validation des données requises (`titre`, `sections`)
  - Gestion des droits Premium (pied de page personnalisé)

### 3. Service de gestion PDF

#### PdfService
- **Fichier** : `src/services/PdfService.js`
- **Méthode** : `genererDocumentGenerique()`
- **Responsabilités** :
  - Création de l'entrée en base de données
  - Génération du nom de fichier unique
  - Lancement de la génération asynchrone
  - Gestion des statuts (`EN_ATTENTE` → `EN_TRAITEMENT` → `TERMINE`)

#### Génération asynchrone
```javascript
// Statuts de progression
10% - Démarrage de la génération
30% - HTML généré (si nécessaire)  
50% - Début génération PDF
90% - PDF généré
100% - Finalisation complète
```

### 4. Service PDFKit

#### PdfKitService
- **Fichier** : `src/services/PdfKitService.js`
- **Méthode** : `generatePDF()`
- **Délégation** : Utilise `DocumentFactory` pour créer le bon type de document

### 5. Factory de documents

#### DocumentFactory
- **Fichier** : `src/services/DocumentFactory.js`
- **Mapping des templates** :
  ```javascript
  'document-generique-v2' → documentType: 'generic'
  'feuille-personnage' → documentType: 'character-sheet'  
  'plan-classe-instructions' → documentType: 'class-plan'
  ```
- **Création** : Instancie le document avec le thème système approprié

### 6. Documents spécialisés

#### GenericDocument
- **Fichier** : `src/services/documents/GenericDocument.js`
- **Usage** : Documents génériques (guides, aides de jeu, règles)
- **Sections supportées** :
  - Titres hiérarchiques (niveaux 1-3)
  - Paragraphes avec Markdown
  - Listes à puces et numérotées
  - Citations et encadrés
  - Table des matières automatique

#### CharacterSheetDocument  
- **Fichier** : `src/services/documents/CharacterSheetDocument.js`
- **Usage** : Feuilles de personnage
- **Éléments supportés** :
  - Grilles de statistiques
  - Cases à cocher (moves, conditions)
  - Tracks de progression (harm, XP)
  - Champs de formulaire
  - Sections spécialisées par système

#### ClassPlanDocument
- **Fichier** : `src/services/documents/ClassPlanDocument.js` 
- **Usage** : Plans de classe et diagrammes
- **Fonctionnalités** :
  - Layouts en colonnes
  - Diagrammes et schémas
  - Instructions visuelles

### 7. Thèmes système

#### MonsterheartsTheme
- **Fichier** : `src/services/themes/MonsterheartsTheme.js`
- **Couleurs** : `#8b5cf6` (violet) palette complète
- **Police** : Crimson Text (gothic/romantique)
- **Éléments** :
  - Sidebar noire avec texte vertical
  - Watermarks subtils
  - Numérotation de pages
  - Styles cohérents pour titres/paragraphes

#### SystemTheme (Base)
- **Fichier** : `src/services/themes/SystemTheme.js`
- **Interface commune** pour tous les thèmes
- **Méthodes standardisées** pour polices, couleurs, layouts

### 8. Service de base PDFKit

#### BasePdfKitService
- **Fichier** : `src/services/BasePdfKitService.js`
- **Éléments communs** :
  - Gestion des pages et marges
  - Sidebars et watermarks
  - Utilitaires de dessin (grilles, checkboxes, tracks)
  - Table des matières automatique
  - Pages de garde

## Méthodes utilitaires

### Dessin de formulaires (BasePdfKitService)

```javascript
// Grille de statistiques
drawStatGrid(doc, stats, x, y, boxSize, options)

// Cases à cocher avec labels  
drawCheckboxList(doc, items, x, y, options)

// Tracks de progression (harm, XP)
drawTrackBoxes(doc, current, max, x, y, boxSize, options)

// Champs de formulaire
drawFormField(doc, label, value, x, y, width, options)

// Layout en colonnes
drawColumnLayout(doc, columns, x, y, totalWidth, options)
```

### Intégration systemesJeu.js

```javascript
// Formatage pour templates Monsterhearts
SystemeUtils.formatForMonsterheartsTemplate(personnageData)

// Validation des attributs selon le système
SystemeUtils.validerAttributs(systemCode, attributs)

// Récupération des configurations système
SystemeUtils.getSysteme(systemCode)
```

## Gestion d'erreurs

### Niveaux de fallback
1. **Nouvelle architecture** : Utilise `DocumentFactory` + `GenericDocument`
2. **Méthode legacy** : Fallback vers anciens templates si échec
3. **Erreur capturée** : Mise à jour statut en base (`ERREUR`)

### Logs et debugging
- Progression en temps réel dans la base
- Messages détaillés dans les logs Winston
- Retours d'erreurs spécifiques selon le niveau

## Extension du système

### Ajouter un nouveau système de jeu

1. **Créer le thème** : `src/services/themes/NouveauSystemeTheme.js`
2. **Configurer systemesJeu.js** : Ajouter attributs, moves, mechanics
3. **Mapper dans DocumentFactory** : Ajouter les templates supportés
4. **Tester** : Scripts dans `scripts/test-nouveau-systeme-pdfkit.js`

### Ajouter un nouveau type de document

1. **Créer la classe** : `src/services/documents/NouveauDocument.js`
2. **Hériter de BasePdfKitService** : Utiliser les méthodes communes
3. **Intégrer dans DocumentFactory** : Mapper le type
4. **Configurer les routes** : Ajouter si nécessaire

## Tests et validation

### Scripts de test disponibles
- `scripts/test-base-pdfkit.js` : Test des composants de base
- `scripts/test-monsterhearts-generique-pdfkit.js` : Test document générique
- `scripts/test-long-document-pdfkit.js` : Test documents longs

### Points de validation
- Authentification et droits utilisateur
- Validation des données d'entrée  
- Génération PDF réussie
- Cohérence visuelle avec le thème
- Performance et gestion mémoire