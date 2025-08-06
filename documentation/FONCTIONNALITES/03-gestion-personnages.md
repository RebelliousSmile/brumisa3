# Gestion des Personnages - Sauvegarde et Réutilisation

## Vision : Transition "Sur le Pouce" vers "Gestion à Moyen Terme"

**Objectif :** Permettre à Sam (joueur passionné) de sauvegarder ses créations, les réutiliser, et gérer son écosystème de personnages depuis un tableau de bord personnel.

### Principe Fondamental
- **Document vs Personnage** : Distinction claire entre PDF généré (temporaire) et données sauvegardées (permanentes)
- **Réutilisation intelligente** : Un personnage peut générer plusieurs documents selon les besoins
- **Gestion centralisée** : Tableau de bord pour organiser, modifier, supprimer ses personnages
- **Conversion naturelle** : Passage fluide du mode anonyme au mode connecté

## Concepts Clés

### Document vs Personnage (Rappel)
```
DOCUMENT                          PERSONNAGE
├─ PDF généré                     ├─ Données JSON sauvegardées
├─ Statique (non modifiable)      ├─ Modifiable par l'utilisateur
├─ Téléchargeable                 ├─ Base pour générer des documents
├─ Temporaire (anonyme)           ├─ Persistant (compte requis)
└─ Usage immédiat                 └─ Réutilisation long terme
```

### Workflow de Transition
```
MODE ANONYME → MODE CONNECTÉ
Casey crée un document → Sam sauvegarde comme personnage
│                        │
└─ PDF téléchargé        └─ Données en base + PDF
   Usage unique             Réutilisable
```

## Architecture Fonctionnelle

### 1. Sauvegarde depuis Formulaire

#### Interface Utilisateur
```html
<!-- Option visible uniquement pour utilisateurs connectés -->
<div x-show="user !== null" class="save-options">
    <label class="checkbox-label">
        <input type="checkbox" x-model="saveAsPersonnage" name="saveAsPersonnage">
        <span>💾 Sauvegarder comme personnage réutilisable</span>
        <small>Vous pourrez modifier et réutiliser ces données plus tard</small>
    </label>
    
    <div x-show="saveAsPersonnage" class="personnage-name-field">
        <label>Nom du personnage (pour votre tableau de bord) :</label>
        <input type="text" x-model="personnageName" name="personnageName" 
               placeholder="Ex: Luna la Reine, Sergei le Stalker...">
    </div>
</div>
```

#### Fonctionnement de la Sauvegarde
1. **Utilisateur connecté** remplit formulaire de création CHARACTER
2. **Case à cocher** "Sauvegarder comme personnage réutilisable" 
3. **Nom du personnage** pour identification dans tableau de bord
4. **Double action** : PDF généré + données sauvegardées comme personnage
5. **Confirmation** à l'utilisateur des deux actions effectuées

### 2. Structure Données Personnage

#### Modèle Conceptuel Personnage
- **Identité** : Nom affiché, système JDR, date création/modification
- **Données complètes** : Toutes les informations saisies dans le formulaire
- **Propriétaire** : Lié à un utilisateur connecté spécifique
- **Historique** : Suivi des documents générés depuis ce personnage
- **Contraintes** : Un utilisateur ne peut pas avoir 2 personnages avec le même nom

### 3. Tableau de Bord Utilisateur

#### Vue d'Ensemble du Dashboard
- **Statistiques personnelles** : Nombre de personnages, documents générés, systèmes utilisés
- **Actions rapides** : Accès direct à la création de nouveau personnage ou document
- **Liste personnages** : Tous les personnages sauvegardés avec preview des caractéristiques
- **Activité récente** : Derniers documents générés par l'utilisateur
- **Filtrage et tri** : Organisation par système JDR, date, ordre alphabétique

#### Interface Dashboard - Fonctionnalités Principales

**Organisation Principale :**
- **Cartes statistiques** : Vue d'ensemble rapide de l'activité utilisateur
- **Actions rapides** : Boutons directs vers création personnage/document
- **Vue grille/liste** : Deux modes d'affichage selon préférence utilisateur
- **Filtres intelligents** : Tri par système JDR, date, nom alphabétique

**Gestion Personnages :**
- **Cartes personnage** : Aperçu visuel avec caractéristiques principales selon système
- **Actions directes** : Générer PDF, Modifier, Supprimer sur chaque personnage
- **État vide géré** : Message d'encouragement si aucun personnage sauvegardé
- **Activité récente** : Historique des derniers documents générés

### 4. Édition et Évolution des Personnages

#### Workflow d'Édition (MVP - Sans Versioning)

**Principe :** Édition simple avec traçabilité basique pour l'évolution des personnages.

**Fonctionnalités d'édition :**
1. **Accès modification** : Bouton "Modifier" dans le tableau de bord utilisateur
2. **Formulaire pré-rempli** : Toutes les données actuelles du personnage chargées
3. **Édition directe** : Modification des champs souhaités
4. **Sauvegarde** : Écrasement des données existantes (pas d'historique des versions)
5. **Suivi basique** : Compteur de modifications + date de dernière modification

**Données de traçabilité :**
- **Nombre de modifications** : Compteur incrémental pour chaque sauvegarde
- **Date dernière modification** : Horodatage de la dernière édition
- **Date création originale** : Conservée pour historique de base

**Critères d'acceptation :**
- Interface d'édition identique au formulaire de création
- Pré-remplissage automatique de tous les champs
- Sauvegarde avec mise à jour des métadonnées de suivi
- Génération PDF possible immédiatement après modification
- Compteur visible dans tableau de bord (ex: "Modifié 3 fois")

#### Important : Édition Destructive
- **Une seule version** : Les modifications écrasent définitivement les données précédentes
- **Pas de récupération** : Impossible de revenir aux versions antérieures
- **Simplicité MVP** : Focus sur l'usage principal (évolution après sessions)
- **Alternative manuelle** : Duplication du personnage avant modification majeure

### 5. Génération et Gestion depuis Personnage

#### Fonctionnalités Disponibles
- **Génération PDF instantanée** : Bouton "Générer PDF" sur chaque personnage sauvegardé
- **Modification personnage** : Accès à un formulaire pré-rempli pour mise à jour
- **Suppression sécurisée** : Confirmation utilisateur avant suppression définitive
- **Historique génération** : Suivi des documents créés depuis chaque personnage

#### Workflow de Réutilisation
1. **Sélection personnage** dans le tableau de bord
2. **Clic "Générer PDF"** → Création nouveau document basé sur données personnage
3. **PDF immédiat** → Téléchargement automatique avec nom personnage + timestamp
4. **Données préservées** → Personnage original reste inchangé, nouveau document généré

## Workflow Utilisateur Complet

### Cas d'Usage Principal - Sam (Joueur Passionné)

#### 1. Première Utilisation
```
1. Sam arrive sur brumisater
2. Crée un personnage Monsterhearts en mode anonyme
3. Satisfait du résultat, décide de créer un compte
4. Retourne sur le formulaire, se connecte
5. Crée un nouveau personnage, coche "Sauvegarder comme personnage"
6. → Personnage sauvegardé + PDF généré
7. Accède à son tableau de bord
```

#### 2. Utilisation Récurrente
```
1. Sam se connecte à brumisater
2. Va sur son tableau de bord
3. Voit ses 5 personnages sauvegardés avec compteur modifications
4. Clique "Générer PDF" sur "Luna la Reine (Modifiée 2 fois)"
5. → Nouveau document généré depuis Luna + PDF téléchargé
6. Utilise le PDF pour sa partie du soir
```

#### 3. Gestion et Evolution
```
1. Sam veut faire évoluer Luna après une session
2. Clique "Modifier" sur Luna dans son tableau de bord
3. Met à jour les stats et l'histoire dans le formulaire pré-rempli
4. Sauvegarde les modifications (compteur passe à 3, date mise à jour)
5. Génère un nouveau PDF avec les données évoluées
6. Tableau de bord affiche "Luna la Reine (Modifiée 3 fois)"
```

### Métriques de Succès - Gestion Personnages

#### Métriques d'Adoption
- **Taux de conversion anonyme → connecté** : > 15% (utilisateurs qui créent un compte)
- **Taux de sauvegarde en personnage** : > 60% (utilisateurs connectés qui sauvegardent)
- **Utilisation tableau de bord** : > 80% (utilisateurs qui revisitent leur dashboard)

#### Métriques d'Engagement
- **Nombre moyen de personnages par utilisateur** : > 3
- **Fréquence de génération PDF** : > 2 PDF/personnage/mois
- **Taux de modification personnages** : > 40% (personnages qui évoluent)

#### Métriques de Rétention
- **Retour utilisateur à 7 jours** : > 40% (réutilisation du service)
- **Retour utilisateur à 30 jours** : > 25% (fidélisation)
- **Sessions avec utilisation dashboard** : > 70% (valeur perçue du tableau de bord)

Cette architecture de gestion des personnages transforme brumisater d'un simple générateur de PDF en un véritable outil de gestion de personnages JDR, créant de la valeur long terme pour les utilisateurs et encourageant l'engagement récurrent.