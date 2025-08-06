# Flux de génération PDF

## Vue d'ensemble

Ce document décrit le flux complet de génération de **documents** PDF depuis les données (formulaires ou personnages sauvegardés) jusqu'au fichier PDF final, en utilisant l'architecture basée sur PDFKit.

### Concepts clés
- **Document** : PDF généré à partir de données (types : CHARACTER, TOWN, GROUP, ORGANIZATION, DANGER)
- **Personnage** : Données sauvegardées par un utilisateur connecté, servant de base pour générer des documents CHARACTER
- **Utilisateur anonyme** : Peut générer des documents directement depuis un formulaire
- **Utilisateur connecté** : Peut générer depuis un personnage sauvegardé ou depuis un formulaire

## Architecture générale

```
Personnage sauvegardé ──┐
                        │
Formulaire (anonyme) ───┼──→ API → Services → PDFKit → Document PDF
                        │
Formulaire (connecté) ──┘
```

## Flux détaillé

### 1. Interface utilisateur (Frontend)

#### Sources de données

##### 1. Formulaire direct (utilisateurs anonymes et connectés)
- **Fichiers** : `src/views/systemes/[systeme]/creer-[type].ejs`
- **Composants Alpine.js** : `public/js/components/[Type][Systeme].js`
- **Données collectées selon le type** :
  - **CHARACTER** : Attributs, compétences, équipement selon le système
  - **TOWN** : Lieux, PNJs, ambiance (spécifique Monsterhearts)
  - **GROUP** : Plans, membres, relations (spécifique Monsterhearts)
  - **ORGANIZATION** : Liste de PNJs, hiérarchie
  - **DANGER** : Fronts, menaces (spécifique Mist Engine)
  - **GENERIQUE** : Titre, introduction, sections Markdown

##### 2. Personnage sauvegardé (utilisateurs connectés uniquement)
- **Source** : Base de données, table `personnages`
- **Processus** : Pré-remplissage du formulaire CHARACTER avec les données sauvegardées
- **Avantage** : Génération rapide sans re-saisie

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

#### Routes par type de document
```javascript
// src/routes/api.js
POST /api/pdfs/character/:systeme       // Documents CHARACTER
POST /api/pdfs/town/:systeme           // Documents TOWN
POST /api/pdfs/group/:systeme          // Documents GROUP
POST /api/pdfs/organization/:systeme   // Documents ORGANIZATION
POST /api/pdfs/danger/:systeme         // Documents DANGER
POST /api/pdfs/generique/:systeme      // Documents GENERIQUE

// Route pour génération depuis personnage sauvegardé
POST /api/pdfs/from-personnage/:personnageId
```

#### Contrôleur
- **Fichier** : `src/controllers/PdfController.js`
- **Méthodes par type** :
  - `genererDocumentCharacter()` : Feuilles de personnage
  - `genererDocumentTown()` : Cadres de ville
  - `genererDocumentGroup()` : Plans de classe/groupe
  - `genererDocumentOrganization()` : Listes de PNJs
  - `genererDocumentDanger()` : Fronts et dangers
  - `genererDepuisPersonnage()` : Depuis données sauvegardées
- **Validations communes** :
  - Vérification du système de jeu
  - Validation selon le type de document
  - Gestion des utilisateurs anonymes (document.visible_admin_only = true)
  - Gestion des droits Premium pour les fonctionnalités avancées

### 3. Service de gestion PDF

#### PdfService
- **Fichier** : `src/services/PdfService.js`
- **Méthodes** :
  - `genererDocument(type, donnees, utilisateur)` : Méthode générique
  - `genererDepuisPersonnage(personnageId, utilisateurId)` : Depuis personnage sauvegardé
- **Responsabilités** :
  - Création de l'entrée `documents` en base
  - Création de l'entrée `pdfs` liée
  - Génération du nom de fichier unique
  - Lancement de la génération asynchrone
  - Gestion des statuts (`EN_COURS` → `TERMINE` → `ERREUR`)
  - Marquage `visible_admin_only` pour les utilisateurs anonymes

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
- **Mapping des types de documents** :
  ```javascript
  'CHARACTER' → CharacterDocument
  'TOWN' → TownDocument (Monsterhearts)
  'GROUP' → GroupDocument (Monsterhearts)  
  'ORGANIZATION' → OrganizationDocument
  'DANGER' → DangerDocument (Mist Engine)
  'GENERIQUE' → GenericDocument
  ```
- **Vérification disponibilité** : Utilise la table `document_systeme_jeu` pour vérifier si le type est actif pour le système
- **Création** : Instancie le document avec le thème système approprié

### 6. Documents spécialisés par type

#### CharacterDocument (type CHARACTER)
- **Fichier** : `src/services/documents/CharacterDocument.js`
- **Usage** : Feuilles de personnage pour tous systèmes
- **Sources** : Formulaire direct ou personnage sauvegardé
- **Éléments supportés** :
  - Grilles de statistiques selon le système
  - Cases à cocher (moves, conditions)
  - Tracks de progression (harm, XP, stress)
  - Champs de formulaire dynamiques
  - Sections spécialisées par système

#### TownDocument (type TOWN)
- **Fichier** : `src/services/documents/TownDocument.js`
- **Usage** : Cadres de ville (spécifique Monsterhearts)
- **Éléments** :
  - Plan de la ville
  - Lieux importants
  - PNJs et leurs relations
  - Ambiance et secrets

#### GroupDocument (type GROUP)
- **Fichier** : `src/services/documents/GroupDocument.js`
- **Usage** : Plans de classe/groupe (spécifique Monsterhearts)
- **Éléments** :
  - Disposition des sièges
  - Relations entre personnages
  - Dynamiques de groupe

#### OrganizationDocument (type ORGANIZATION)
- **Fichier** : `src/services/documents/OrganizationDocument.js`
- **Usage** : Listes de PNJs organisés (tous systèmes)
- **Éléments** :
  - Hiérarchie organisationnelle
  - Fiches résumées de PNJs
  - Relations et conflits

#### DangerDocument (type DANGER)
- **Fichier** : `src/services/documents/DangerDocument.js`
- **Usage** : Fronts et dangers (spécifique Mist Engine)
- **Éléments** :
  - Description des menaces
  - Progression des dangers
  - Réactions et conséquences

#### GenericDocument (type GENERIQUE)
- **Fichier** : `src/services/documents/GenericDocument.js`
- **Usage** : Documents libres (guides, aides de jeu, règles)
- **Sections supportées** :
  - Titres hiérarchiques (niveaux 1-3)
  - Paragraphes avec Markdown
  - Listes à puces et numérotées
  - Citations et encadrés
  - Table des matières automatique

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