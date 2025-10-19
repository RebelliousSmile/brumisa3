# Liste des Fonctionnalites Mist Engine

## Fonctionnalites Issues de Legends in the Mist

### 1. Gestion de Fiches de Personnages

#### 1.1 Theme Cards (Cartes de Theme)
- Creation et edition de cartes de theme
- Power tags (tags de pouvoir)
- Weakness tags (tags de faiblesse)
- Systeme de quete lie aux themes
- Flip card (recto/verso) pour afficher plus d'informations

#### 1.2 Hero Card (Carte de Heros)
- Informations principales du personnage
- Relations de compagnie
- Quintessences
- Sac a dos (backpack) pour gerer l'inventaire

#### 1.3 Trackers (Suivis)
- **Status Tracker** : suivi de l'etat du personnage
- **Story Tag Tracker** : suivi des tags narratifs
- **Story Theme Tracker** : suivi des themes narratifs
- **Pip Tracker** : systeme de points a cocher (pips)
- Gestion des etats : Abandon, Ameliorer, Jalon, Promesse

### 2. Organisation et Gestion

#### 2.1 Drawer System (Systeme de Tiroir)
- Organisation de plusieurs personnages
- Gestion de dossiers et fichiers
- Import/Export de personnages
- Vue riche et vue liste
- Drag & Drop pour reorganiser

#### 2.2 Gestion de l'Historique
- Systeme Undo/Redo (Annuler/Refaire)
- Historique des actions (limite a 50 actions)
- Raccourcis clavier (Ctrl+Z / Ctrl+Y)

#### 2.3 Command Palette
- Palette de commandes (Ctrl+K)
- Recherche fuzzy des commandes
- Actions rapides clavier
- Multi-langues (FR/EN)

### 3. Fonctionnalites Multi-Joueurs (Phase 4 - Optionnelle)

#### 3.1 Infrastructure Temps Reel
- WebSocket avec Socket.io
- Systeme de rooms (sessions de jeu)
- Gestion connexions/deconnexions

#### 3.2 Chat Temps Reel
- Historique des messages
- Notifications de nouveaux messages
- Persistance en base de donnees

#### 3.3 Lanceur de Des
- Support des tags (power/weakness)
- Animation des resultats
- Historique des jets de des

#### 3.4 Gestion de Sessions
- Creer/rejoindre/quitter une session
- Liste des joueurs connectes
- Roles (MJ/Joueur)

### 4. Import et Migration

#### 4.1 Import de Donnees
- Parser les fichiers JSON de characters-of-the-mist
- Convertir vers le format interne
- Interface d'import utilisateur
- Validation et previsualisation avant import
- Gestion des doublons

### 5. Internationalisation

#### 5.1 Support Multi-langues
- Traductions FR/EN completes
- Changement de langue dynamique
- Composable dedie pour LITM (useI18nLitm)

---

## Nouvelles Fonctionnalites a Ajouter

### 6. Investigation Board (Tableau d'Enquete)

**Source** : https://github.com/mordachai/investigation-board (module Foundry VTT)

**Description** : Systeme de notes collaboratives pour suivre les enquetes et indices

**Fonctionnalites inspirees** :
- Creation de notes sticky sur une scene/carte
- Notes photo pour les preuves visuelles
- Edition collaborative des notes
- Positionnement libre par drag & drop
- Generation rapide de notes depuis personnages/lieux
- Menu contextuel (clic droit) pour creation rapide
- Etiquettes et nommage flexible

**Adaptation pour Brumisa3** :
- Version standalone (sans Foundry VTT)
- Canvas interactif pour placer les notes
- Systeme de connexions/liens entre notes
- Visualisation de type graphe (mindmap)
- Export/Import de tableaux d'enquete
- Modes : Personnel (solo) ou Partage (multi-joueurs)

**Cas d'usage** :
- Organiser les indices d'une enquete
- Visualiser les connexions entre personnages
- Suivre les pistes narratives
- Collaborer en temps reel avec les joueurs

### 7. Creation de Hacks et Univers Personnalises

**Objectif** : Brumisa3 comme outil d'adaptation pour univers non officiels

#### 7.1 Editeur de Hack
- Creer un nouveau hack base sur Mist Engine ou City of Mist
- Definir les moves personnalises
- Personnaliser les mecaniques de jeu
- Exporter/Importer des hacks

#### 7.2 Editeur d'Univers
- Creer un univers personnalise
- Definir les dangers specifiques
- Creer des listes de tropes
- Gerer les PNJs de l'univers
- Definir les lieux importants
- Creer des listes personnalisees (noms, objets, etc.)

#### 7.3 Partage Communautaire
- Publier un hack/univers sur Brumisa3
- Parcourir les hacks communautaires
- Notation et commentaires
- Fork d'un hack existant pour personnalisation
- Versioning des hacks

#### 7.4 Templates de Hacks
- Templates officiels (si autorisation)
- Templates communautaires populaires
- Wizard de creation guide

### 8. Modes de Jeu

#### 8.1 Mode Solo
- Jouer seul sur le site
- Toutes les fonctionnalites accessibles localement
- Pas de synchronisation necessaire
- Investigation Board personnel

#### 8.2 Mode VTT (Virtual Tabletop)
- Utilisation avec un VTT externe (Foundry, Roll20, etc.)
- Brumisa3 comme outil complementaire
- Export de donnees vers VTT
- Synchronisation manuelle ou automatique (API si disponible)

#### 8.3 Mode Centralise
- Brumisa3 comme hub central de la partie
- Toutes les donnees de la partie centralisees
- Synchronisation temps reel entre joueurs
- Investigation Board collaboratif
- Integration avec VTT externe (optionnel)
- Chat et lanceur de des integres

---

## Architecture Cible

### Schema Conceptuel

```
Playspace (Systeme + Hack + Univers)
├── Personnages
│   ├── Theme Cards
│   ├── Hero Card
│   └── Trackers
├── Investigation Board [NOUVEAU]
│   ├── Noeuds (personnages, lieux, indices)
│   ├── Connexions/Relations
│   └── Notes narratives
├── Session de Jeu
│   ├── Mode Solo
│   ├── Mode VTT
│   └── Mode Centralise
└── Outils de Jeu
    ├── Chat (si multi-joueurs)
    ├── Lanceur de des
    └── Oracles
```

---

## Questions Ouvertes

### Q1 : Investigation Board
- Quelles sont les fonctionnalites exactes du repo investigation-board ?
- Comment l'integrer au Playspace ?
- Est-ce specifique a Mist Engine ou generique pour tous les univers ?

### Q2 : Mode VTT
- Quels VTT sont cibles ? (Foundry, Roll20, Owlbear Rodeo, etc.)
- Comment se fait la synchronisation avec le VTT ?
- API ou export/import manuel ?

### Q3 : Mode Centralise
- Brumisa3 devient-il un VTT complet ?
- Ou reste-t-il un outil complementaire avec des fonctionnalites specifiques ?
- Quelle est la valeur ajoutee vs un VTT classique ?

### Q4 : Perimetre Fonctionnel
- Toutes ces fonctionnalites sont-elles pour Mist Engine uniquement ?
- Ou certaines sont generiques et applicables a tous les systemes ?

---

**Date** : 2025-01-19
**Statut** : En construction
