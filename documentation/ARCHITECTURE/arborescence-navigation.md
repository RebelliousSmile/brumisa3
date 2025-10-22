# Arborescence Navigation - Brumisa3

Date: 2025-01-19
Version: 2.0 (MVP - Navigation restructuree)
Auteur: Agent UI/UX Designer

---

## A. CARTE MENTALE DES FONCTIONNALITES

### Authentification (MVP v1.0)
- **Mode Guest** : Utilisation sans compte (max 3 playspaces, localStorage)
- **Compte utilisateur** : Email/password, sauvegarde BDD
- **Migration** : Guest vers Authentifie (conservation donnees)
- **Session** : Login/Logout

### Playspaces (MVP v1.0 - CORE)
- **CRUD Playspaces** : Creer, Lire, Modifier, Supprimer
- **Role MJ/PJ** : Chaque playspace doit etre designe comme MJ (Maitre du Jeu) ou PJ (Joueur)
- **Basculement rapide** : Switch entre playspaces (< 2s)
- **Isolation** : 1 playspace actif a la fois
- **Structure** : Systeme (Mist Engine/City of Mist) + Hack (LITM/Otherscape) + Univers + Role (MJ/PJ)

### Personnages (MVP v1.0 - CORE)
- **CRUD Personnages** : Gestion complete
- **Systeme herite du Playspace** : Le personnage herite du systeme/hack/univers defini dans son playspace parent
- **Theme Cards** : 2-4 cards (Mythos/Logos), Power tags (3-5), Weakness tags (1-2)
- **Hero Card** : Optionnelle, Relations (0-5), Quintessences (0-3)
- **Trackers** : Status (max 5), Story Tags (illimite), Story Themes (max 3)
- **Isolation** : Personnages lies au playspace actif uniquement

### Export/Partage (MVP v1.0)
- **Export JSON** : Personnage individuel
- **Export ZIP** : Tous personnages d'un playspace
- **Format** : Compatible characters-of-the-mist

### Support/Communaute (MVP v1.0)
- **Systeme dons** : OpenCollective
- **Informations** : A propos, Legal, Sponsors

### Hors MVP (Versions futures)
- Investigation Board (v2.0) - Sera dans section "Table VTT"
- Oracles (v1.2 consultation, v2.1+ custom) - Sera dans section "Jouer en solo"
- Mode multi-joueurs (v2.5) - Sera dans section "Table VTT"
- Import JSON (v1.3)
- PDF Export (v2.0)
- Jets de des (v1.3) - Sera dans section "Jouer en solo"
- Sessions (v1.4) - Sera dans section "Jouer en solo"

---

## B. ARBORESCENCE NAVIGATION DESKTOP

### Navigation Principale (4 sections MVP)

La navigation principale est organisee en 4 grandes sections contextuelles :

1. **Decouverte** : Comprendre l'application, onboarding, aide
2. **Preparation** : Gestion personnages/dangers selon role MJ/PJ du playspace actif
3. **Jouer en solo** : Sessions, oracles, lancers de des (v1.3+)
4. **Table VTT** : Multiplayer, investigation board (v2.0+)

```
BRUMISATER APP
│
├── [HEADER PERSISTANT]
│   ├── Logo Brumisa3 (lien vers /)
│   ├── Navigation principale (4 sections)
│   │   ├── Decouverte          → /decouverte
│   │   ├── Preparation         → /preparation (context-sensitive MJ/PJ)
│   │   ├── Jouer en solo       → /solo (v1.3+)
│   │   └── Table VTT           → /vtt (v2.0+)
│   │
│   └── Zone utilisateur (droite)
│       ├── [Mode Guest] Banner "Creer un compte"
│       ├── [Authentifie] Avatar + Dropdown
│       │   ├── Mon Profil      → /profile
│       │   ├── Parametres      → /settings
│       │   └── Deconnexion     → POST /api/auth/logout
│       └── [Non connecte] Se connecter / S'inscrire
│
├── [SIDEBAR GAUCHE - Collapsible]
│   ├── Section "Playspaces" (si authentifie ou guest avec data)
│   │   ├── Badge indicateur role : [MJ] ou [PJ]
│   │   ├── [Playspace 1] ★ ACTIF [MJ] (badge, background bleu)
│   │   │   └── 3 personnages
│   │   ├── [Playspace 2] [PJ]
│   │   │   └── 1 personnage
│   │   ├── [Voir tous] (si > 10)
│   │   └── [+ Nouveau Playspace] → /playspaces/new
│   │
│   └── Section "Raccourcis" (v1.1+)
│       ├── Export complet
│       └── Parametres rapides
│
├── [ZONE PRINCIPALE - Main Content]
│   │
│   ├── SECTION PUBLIQUE (Non authentifie)
│   │   ├── / (Landing Page)
│   │   │   ├── Hero "L'outil du Mist Engine"
│   │   │   ├── CTA Primaire : "Commencer sans compte"
│   │   │   ├── CTA Secondaire : "Creer un compte"
│   │   │   └── Features (Playspaces, Personnages, Export)
│   │   │
│   │   ├── /login (Connexion)
│   │   │   ├── Formulaire Email/Password
│   │   │   └── Lien "Commencer sans compte"
│   │   │
│   │   └── /signup (Inscription)
│   │       ├── Formulaire Email/Password
│   │       ├── Detection migration guest
│   │       └── Lien "Commencer sans compte"
│   │
│   ├── SECTION 1 : DECOUVERTE
│   │   ├── /decouverte (Hub Decouverte)
│   │   │   ├── Guide de demarrage
│   │   │   ├── Tutoriels interactifs
│   │   │   ├── FAQ
│   │   │   └── Exemples de personnages
│   │   │
│   │   ├── /decouverte/guide (Guide complet)
│   │   │   ├── Qu'est-ce qu'un Playspace ?
│   │   │   ├── Role MJ vs PJ
│   │   │   ├── Creer son premier personnage
│   │   │   ├── Theme Cards expliquees
│   │   │   └── Export et partage
│   │   │
│   │   ├── /decouverte/tutoriels (Tutoriels pas-a-pas)
│   │   │   ├── Tutoriel 1 : Mon premier playspace
│   │   │   ├── Tutoriel 2 : Mon premier personnage
│   │   │   └── Tutoriel 3 : Exporter en JSON
│   │   │
│   │   └── /decouverte/exemples (Galerie exemples)
│   │       ├── Personnages LITM
│   │       ├── Personnages Otherscape
│   │       └── Templates de Theme Cards
│   │
│   ├── SECTION 2 : PREPARATION (Context-sensitive MJ/PJ)
│   │   │
│   │   ├── /preparation (Hub Preparation - Adaptatif selon role playspace actif)
│   │   │   ├── Breadcrumb : [Playspace Actif] [Role MJ/PJ]
│   │   │   ├── [Mode PJ] → Dashboard Personnages
│   │   │   │   ├── Mes personnages (liste)
│   │   │   │   ├── [+ Nouveau Personnage]
│   │   │   │   └── Stats (X personnages, derniere modif)
│   │   │   │
│   │   │   └── [Mode MJ] → Dashboard MJ complet
│   │   │       ├── Onglet "Personnages" (PJ + PNJ)
│   │   │       ├── Onglet "Dangers" (v1.2+)
│   │   │       ├── Onglet "Lieux" (v1.2+)
│   │   │       └── Stats (X persos, Y dangers, derniere modif)
│   │   │
│   │   ├── SOUS-SECTION : Playspaces
│   │   │   ├── /playspaces (Liste Playspaces)
│   │   │   │   ├── Grille/Liste playspaces avec badge role [MJ] ou [PJ]
│   │   │   │   ├── [+ Nouveau Playspace] → /playspaces/new
│   │   │   │   └── Actions : Modifier, Dupliquer, Supprimer
│   │   │   │
│   │   │   ├── /playspaces/new (Creation Playspace)
│   │   │   │   └── Wizard 5 etapes
│   │   │   │       ├── 1. Role (MJ ou PJ) - NOUVELLE ETAPE
│   │   │   │       ├── 2. Systeme (Mist Engine / City of Mist)
│   │   │   │       ├── 3. Hack (LITM / Otherscape)
│   │   │   │       ├── 4. Univers (Chicago / Londres / Custom)
│   │   │   │       └── 5. Nom (suggestion auto avec role)
│   │   │   │
│   │   │   ├── /playspaces/[id] (Detail Playspace)
│   │   │   │   ├── Dashboard avec badge role [MJ] ou [PJ]
│   │   │   │   ├── Stats (X personnages, derniere modif)
│   │   │   │   ├── Actions rapides
│   │   │   │   │   ├── [Modifier Playspace]
│   │   │   │   │   ├── [Dupliquer Playspace]
│   │   │   │   │   ├── [Exporter tous (ZIP)]
│   │   │   │   │   └── [Supprimer Playspace]
│   │   │   │   └── Redirect auto selon role
│   │   │   │       ├── [PJ] → /preparation/characters
│   │   │   │       └── [MJ] → /preparation (dashboard MJ)
│   │   │   │
│   │   │   └── /playspaces/[id]/edit (Modification Playspace)
│   │   │       └── Formulaire edition (Role, Hack, Univers, Nom)
│   │   │
│   │   ├── SOUS-SECTION : Personnages (Mode PJ ou Mode MJ)
│   │   │   ├── /preparation/characters (Liste Personnages du playspace actif)
│   │   │   │   ├── Breadcrumb : [Playspace] [Role] > Personnages
│   │   │   │   ├── [Mode MJ] Badge filtre : Tous / PJ / PNJ
│   │   │   │   ├── Filtres : Recherche, Tri (nom, niveau, date)
│   │   │   │   ├── Grille personnages (cards avec avatar, nom, niveau)
│   │   │   │   ├── [+ Nouveau Personnage] → /characters/new
│   │   │   │   └── Actions par personnage
│   │   │   │       ├── [Modifier]   → /characters/[id]/edit
│   │   │   │       ├── [Dupliquer]  → POST /api/characters/[id]/duplicate
│   │   │   │       ├── [Exporter JSON]
│   │   │   │       └── [Supprimer]
│   │   │   │
│   │   │   ├── /characters/new (Creation Personnage)
│   │   │   │   ├── Breadcrumb : [Playspace] > Personnages > Nouveau
│   │   │   │   ├── [Mode MJ] Champ supplementaire : Type (PJ / PNJ)
│   │   │   │   └── Formulaire : Nom, Description, Avatar, Niveau
│   │   │   │
│   │   │   ├── /characters/[id] (Vue Personnage - Lecture seule)
│   │   │   │   ├── Breadcrumb : [Playspace] > Personnages > [Nom]
│   │   │   │   ├── Header personnage (Avatar, Nom, Niveau)
│   │   │   │   ├── [Mode MJ] Badge : PJ ou PNJ
│   │   │   │   ├── Actions : [Modifier] [Dupliquer] [Exporter] [Supprimer]
│   │   │   │   └── Apercu sections
│   │   │   │       ├── Theme Cards (preview)
│   │   │   │       └── Hero Card (preview)
│   │   │   │
│   │   │   └── /characters/[id]/edit (Edition Personnage)
│   │   │       ├── Breadcrumb : [Playspace] > Personnages > [Nom] > Edition
│   │   │       ├── Navigation tabs verticale (ancres internes)
│   │   │       │   ├── #informations (Nom, Description, Avatar, Niveau, Type PJ/PNJ)
│   │   │       │   ├── #theme-cards (Section Theme Cards)
│   │   │       │   └── #hero-card (Section Hero Card)
│   │   │       │
│   │   │       ├── Section Theme Cards (2-4 cards)
│   │   │       │   ├── [+ Ajouter Theme Card] (si < 4)
│   │   │       │   └── Par Theme Card
│   │   │       │       ├── Titre, Type (Mythos/Logos), Description
│   │   │       │       ├── Power Tags (3-5) [edition inline]
│   │   │       │       ├── Weakness Tags (1-2) [edition inline]
│   │   │       │       ├── Quete (texte libre)
│   │   │       │       └── [Modifier] [Supprimer]
│   │   │       │
│   │   │       └── Section Hero Card (optionnelle)
│   │   │           ├── [+ Creer Hero Card] (si absente)
│   │   │           ├── Relations de Compagnie (0-5)
│   │   │           │   ├── [+ Ajouter Relation]
│   │   │           │   └── Par Relation : Compagnon, Relation (neveu, Camarade, etc.)
│   │   │           ├── Quintessences (0-3)
│   │   │           │   ├── [+ Ajouter Quintessence]
│   │   │           │   └── Par Quintessence : Nom, Description
│   │   │           └── [Modifier] [Supprimer Hero Card]
│   │   │
│   │   └── SOUS-SECTION : Dangers (Mode MJ uniquement - v1.2+)
│   │       ├── /preparation/dangers (Liste Dangers)
│   │       │   ├── [Accessible uniquement si playspace actif = MJ]
│   │       │   ├── Breadcrumb : [Playspace MJ] > Dangers
│   │       │   ├── Grille dangers
│   │       │   └── [+ Nouveau Danger]
│   │       │
│   │       └── /dangers/[id]/edit (Edition Danger)
│   │           └── Formulaire similaire Theme Cards (v1.2+)
│   │
│   ├── SECTION 3 : JOUER EN SOLO (v1.3+)
│   │   ├── /solo (HUD Solo - Interface style Foundry VTT)
│   │   │   ├── Placeholder MVP v1.0 : Message "Disponible en v1.3+"
│   │   │   ├── [v1.3+] Interface HUD complete
│   │   │   │   ├── Personnage actif (selection dans playspace)
│   │   │   │   ├── Theme Cards (lecture seule, liens vers edition)
│   │   │   │   ├── Hero Card (lecture seule)
│   │   │   │   ├── Trackers (modification temps reel)
│   │   │   │   │   ├── Status (max 5 actifs) - Affichage + Toggle + Niveau
│   │   │   │   │   ├── Story Tags (illimites) - Affichage + Toggle + Ajout rapide
│   │   │   │   │   └── Story Themes (max 3 actifs) - Affichage + Toggle
│   │   │   │   └── Action Database (12 briques generiques Mist Engine)
│   │   │   │       ├── Catalogue actions predefinies (consultation)
│   │   │   │       ├── Construction actions dynamiques (12 briques)
│   │   │   │       └── Actions favorites par personnage
│   │   │   └── Teaser fonctionnalites futures (MVP v1.0)
│   │   │
│   │   ├── /solo/trackers (Gestion Trackers - v1.3+)
│   │   │   ├── Status (CRUD complet)
│   │   │   │   ├── [+ Ajouter Status]
│   │   │   │   └── Par Status : Nom, Niveau (0-5), Toggle actif, Description
│   │   │   ├── Story Tags (CRUD complet)
│   │   │   │   ├── [+ Ajouter Story Tag]
│   │   │   │   └── Par Tag : Nom, Description, Toggle actif
│   │   │   └── Story Themes (CRUD complet)
│   │   │       ├── [+ Ajouter Story Theme]
│   │   │       └── Par Theme : Nom, Description, Toggle actif
│   │   │
│   │   ├── /solo/actions (Action Database - v1.3+)
│   │   │   ├── 12 Briques generiques (Mist Engine)
│   │   │   │   ├── Affichage interactif des briques
│   │   │   │   ├── Construction actions dynamiques
│   │   │   │   └── Preview action construite
│   │   │   ├── Catalogue actions (consultation)
│   │   │   │   ├── Recherche par nom/type
│   │   │   │   ├── Filtres par Theme Card
│   │   │   │   └── Exemples courants
│   │   │   └── Actions favorites
│   │   │       ├── Sauvegarde par personnage
│   │   │       ├── Acces rapide HUD
│   │   │       └── Edition/Suppression
│   │   │
│   │   ├── /solo/sessions (Sessions de jeu - v1.4+)
│   │   │   ├── Historique sessions
│   │   │   ├── [+ Nouvelle Session]
│   │   │   └── Notes et progression
│   │   │
│   │   ├── /solo/oracles (Oracles - v1.2 consultation, v2.1+ custom)
│   │   │   ├── Consultation oracles predefinies
│   │   │   ├── Historique tirages
│   │   │   └── [v2.1+] Creation oracles personnalisees
│   │   │
│   │   └── /solo/dice (Lancers de des - v1.3+)
│   │       ├── Interface lancers
│   │       ├── Historique jets
│   │       └── Configurations sauvegardees
│   │
│   ├── SECTION 4 : TABLE VTT (v2.0+)
│   │   ├── /vtt (HUD VTT Partage - Interface style Foundry VTT)
│   │   │   ├── Placeholder MVP v1.0 : Message "Disponible en v2.0+"
│   │   │   ├── [v2.0+] Interface HUD partagee temps reel
│   │   │   │   ├── Personnages actifs (selection multi-joueurs)
│   │   │   │   ├── Theme Cards (lecture seule, sync temps reel)
│   │   │   │   ├── Hero Card (lecture seule, sync temps reel)
│   │   │   │   ├── Trackers partages (modification collaborative)
│   │   │   │   │   ├── Status (max 5 actifs) - Sync temps reel MJ/Joueurs
│   │   │   │   │   ├── Story Tags (illimites) - Ajout collaboratif
│   │   │   │   │   └── Story Themes (max 3 actifs) - Gestion MJ
│   │   │   │   └── Action Database partagee
│   │   │   │       ├── Catalogue actions (consultation multi-joueurs)
│   │   │   │       ├── Construction actions (12 briques)
│   │   │   │       └── Actions favorites par table
│   │   │   └── Teaser fonctionnalites futures (MVP v1.0)
│   │   │
│   │   ├── /vtt/trackers (Gestion Trackers Partagee - v2.0+)
│   │   │   ├── Memes fonctionnalites que /solo/trackers
│   │   │   ├── Sync temps reel (WebSocket)
│   │   │   ├── Permissions MJ/Joueurs
│   │   │   └── Historique modifications
│   │   │
│   │   ├── /vtt/actions (Action Database Partagee - v2.0+)
│   │   │   ├── Memes fonctionnalites que /solo/actions
│   │   │   ├── Actions favorites par table (partagees)
│   │   │   └── Sync temps reel
│   │   │
│   │   ├── /vtt/investigation-board (Investigation Board - v2.0+)
│   │   │   ├── Tableau kanban partage
│   │   │   ├── Indices / Suspects / Lieux
│   │   │   └── Collaboration temps reel
│   │   │
│   │   └── /vtt/multiplayer (Mode multi-joueurs - v2.5+)
│   │       ├── Gestion tables
│   │       ├── Invitations joueurs
│   │       └── Synchronisation personnages
│   │
│   ├── SECTION PROFIL & PARAMETRES
│   │   ├── /profile (Profil Utilisateur)
│   │   │   ├── Informations compte (Email, Date creation)
│   │   │   ├── Statistiques (X playspaces, Y personnages)
│   │   │   └── [Modifier Email] [Changer Password]
│   │   │
│   │   └── /settings (Parametres - v1.1+)
│   │       ├── Theme (Clair / Sombre)
│   │       └── Preferences UX
│   │
│   └── SECTION SUPPORT & INFOS
│       ├── /support (Support & Dons)
│       │   ├── Systeme dons OpenCollective
│       │   ├── Sponsors
│       │   └── FAQ
│       │
│       ├── /about (A Propos)
│       │   ├── Vision Brumisa3
│       │   ├── Credits (Son of Oak, City of Mist Garage)
│       │   └── Roadmap
│       │
│       └── /legal (Mentions Legales)
│           ├── RGPD
│           ├── Licences (Garage)
│           └── CGU
│
└── [FOOTER PERSISTANT]
    ├── Dons → /support
    ├── Sponsors → /support#sponsors
    ├── A Propos → /about
    └── Legal → /legal
```

---

## C. ARBORESCENCE NAVIGATION MOBILE

```
BRUMISATER MOBILE (v1.1+)
│
├── [HEADER MOBILE]
│   ├── [☰] Menu Burger (toggle sidebar)
│   ├── Logo Brumisa3 (centre)
│   └── [Avatar/Login] (droite)
│
├── [SIDEBAR DRAWER - Swipe/Hamburger]
│   ├── Section Playspaces
│   │   ├── [Playspace 1] ★ ACTIF [MJ] (badge role)
│   │   ├── [Playspace 2] [PJ]
│   │   └── [+ Nouveau]
│   ├── Navigation principale (4 sections)
│   │   ├── Decouverte
│   │   ├── Preparation
│   │   ├── Jouer en solo (v1.3+)
│   │   └── Table VTT (v2.0+)
│   └── Profil/Deconnexion
│
├── [BOTTOM NAVIGATION - 4 items max]
│   ├── [Icon Decouverte] → /decouverte
│   ├── [Icon Preparation] → /preparation (context MJ/PJ)
│   ├── [Icon Solo] → /solo (v1.3+, grise en MVP)
│   └── [Icon VTT] → /vtt (v2.0+, grise en MVP)
│
├── [ZONE PRINCIPALE]
│   ├── Landing Page
│   │   ├── Hero simplifie
│   │   └── CTA empiles verticalement
│   │
│   ├── Decouverte
│   │   ├── Guide de demarrage
│   │   ├── Tutoriels (carousel swipable)
│   │   └── Exemples (liste verticale)
│   │
│   ├── Preparation
│   │   ├── [Mode PJ] Liste personnages verticale
│   │   │   ├── Cards verticales
│   │   │   ├── Swipe pour actions
│   │   │   └── FAB "+" (Floating Action Button)
│   │   │
│   │   └── [Mode MJ] Tabs swipables
│   │       ├── Personnages (PJ + PNJ)
│   │       ├── Dangers (v1.2+)
│   │       └── Lieux (v1.2+)
│   │
│   ├── Edition Personnage
│   │   ├── Header sticky (Nom, Sauvegarder)
│   │   ├── Tabs horizontales swipables
│   │   │   ├── Infos (+ Type PJ/PNJ si MJ)
│   │   │   ├── Themes
│   │   │   └── Hero
│   │   └── Sections empilees verticalement
│   │
│   ├── Jouer en solo (v1.3+)
│   │   ├── HUD Solo (interface Foundry-like)
│   │   │   ├── Theme Cards (lecture seule)
│   │   │   ├── Hero Card (lecture seule)
│   │   │   ├── Trackers (modification temps reel)
│   │   │   └── Actions (catalogue + briques)
│   │   ├── Trackers (gestion complete)
│   │   ├── Actions (Action Database)
│   │   ├── Sessions (liste verticale)
│   │   ├── Oracles (cartes swipables)
│   │   └── Des (interface tactile)
│   │
│   └── Table VTT (v2.0+)
│       ├── HUD VTT Partage (interface Foundry-like)
│       │   ├── Theme Cards (sync temps reel)
│       │   ├── Hero Card (sync temps reel)
│       │   ├── Trackers partages (collaborative)
│       │   └── Actions partagees
│       ├── Trackers partages (gestion sync)
│       ├── Actions partagees (Action Database)
│       ├── Investigation Board (cards mobiles)
│       └── Multiplayer (liste tables)
│
└── [BREADCRUMBS ADAPTATIFS]
    └── [<] Retour + Titre page actuelle + Badge role playspace actif
```

---

## D. PATTERNS DE NAVIGATION

### 1. Navigation Persistante (Toujours visible)

**DESKTOP**
- **Header** : Logo + Navigation principale (Decouverte, Preparation, Solo, VTT) + Avatar/Profil
- **Sidebar** : Liste playspaces avec badge role [MJ] ou [PJ] et indicateur actif
- **Footer** : Liens utilitaires (Dons, Legal, etc.)

**MOBILE (v1.1+)**
- **Header simplifie** : Burger menu + Logo + Avatar
- **Bottom Nav** : 4 icones principales (Decouverte, Preparation, Solo grisee, VTT grisee)
- **Breadcrumb adaptatif** : Bouton Retour + Titre page + Badge role playspace

### 2. Navigation Context-Sensitive (Selon role MJ/PJ)

**Section Preparation - Mode PJ**
```
Dashboard Personnages :
├── Mes personnages (liste complete)
├── [+ Nouveau Personnage]
├── Stats personnages
└── Export/Import
```

**Section Preparation - Mode MJ**
```
Dashboard MJ complet :
├── Onglet Personnages (filtres : Tous / PJ / PNJ)
├── Onglet Dangers (v1.2+)
├── Onglet Lieux (v1.2+)
├── Stats globales
└── Export/Import groupes
```

**Wizard Creation Playspace**
```
Etapes :
├── 1. Role (MJ ou PJ) - CRITIQUE pour UI suivante
├── 2. Systeme (Mist Engine / City of Mist)
├── 3. Hack (LITM / Otherscape)
├── 4. Univers (Chicago / Londres / Custom)
└── 5. Nom (auto-suggere avec role : "LITM Chicago [MJ]")
```

### 3. Navigation Modale (Overlays/Drawers)

**Modals Confirmation** (Actions destructives)
- Suppression Playspace : Affiche nombre personnages impactes + dangers (si MJ)
- Suppression Personnage : Affiche Theme Cards, Hero Card a supprimer
- Suppression Hero Card : Affiche relations/quintessences

**Modals Creation/Edition Rapide**
- Ajout Theme Card (Power/Weakness Tags, Quete)
- Ajout Relation de Compagnie (Hero Card)
- Ajout Quintessence (Hero Card)
- [Mode MJ] Ajout Danger (v1.2+)

**Dropdown Menu** (Avatar Header)
- Mon Profil
- Parametres
- Deconnexion

### 4. Navigation de Donnees (Listes, Grilles, Filtres)

**Liste Playspaces**
```
Vue : Grille (desktop) / Stack (mobile)
├── Badge role visible [MJ] ou [PJ]
├── Tri par date modification DESC
├── Recherche par nom
└── Actions par item : Modifier, Dupliquer, Supprimer
```

**Liste Personnages (Context MJ)**
```
Vue : Grille cards avec avatar
├── Filtre supplementaire : Type (Tous / PJ / PNJ)
├── Filtres classiques : Recherche nom, Tri (nom/niveau/date)
├── Pagination : 20 par page (load more scroll infini mobile)
└── Actions : Modifier, Dupliquer, Exporter, Supprimer
```

**Theme Cards (Edition Personnage)**
```
Vue : Stack vertical (2-4 cards)
├── Par card : Titre, Type (Mythos/Logos), Description
├── Power Tags : 3-5 tags inline editables
├── Weakness Tags : 1-2 tags inline editables
├── Quete : Texte libre
└── Actions : Ajouter (si < 4), Modifier, Supprimer
```

**Hero Card (Edition Personnage)**
```
Vue : Sections empilees
├── Relations de Compagnie : 0-5 relations (Compagnon + Relation)
├── Quintessences : 0-3 quintessences (Nom + Description)
└── Actions : Creer (si absente), Modifier, Supprimer
```

**Trackers (HUD Jouer en solo / Table VTT v1.3+)**
```
Vue : 3 colonnes (desktop) / Accordeon (mobile)
├── Status : Max 5 actifs (badge compteur, niveau 0-5)
├── Story Tags : Illimites (suggestion archivage si > 10)
├── Story Themes : Max 3 actifs (badge compteur)
└── Modification temps reel pendant partie
```

**Action Database (HUD Jouer en solo / Table VTT v1.3+)**
```
Vue : Interface interactive (style Foundry VTT)
├── 12 Briques generiques Mist Engine (affichage)
├── Construction actions dynamiques (preview)
├── Catalogue actions predefinies (recherche + filtres)
└── Actions favorites par personnage/table
```

---

## E. USER FLOWS CRITIQUES

### Flow 1 : CREATION PREMIER PLAYSPACE + PERSONNAGE (Guest)

```
[Lea arrive sur Brumisa3]
    ↓
/ (Landing Page)
    ↓ CTA "Commencer sans compte"
    ↓
/playspaces/new (Wizard Creation Playspace)
    ↓ Etape 1 : Role → PJ (choix)
    ↓ Etape 2 : Systeme → Mist Engine
    ↓ Etape 3 : Hack → LITM
    ↓ Etape 4 : Univers → Chicago Noir
    ↓ Etape 5 : Nom → "LITM - Chicago Noir [PJ]" (auto)
    ↓ [Creer Playspace] (< 1s)
    ↓
/playspaces/[id] (Dashboard Playspace)
    ↓ Redirect auto vers /preparation/characters (car role PJ)
    ↓
/preparation/characters (Liste vide)
    ↓ [+ Nouveau Personnage]
    ↓
/characters/new
    ↓ Formulaire : Nom, Description, Avatar, Niveau (pas de Type car PJ)
    ↓ [Creer] (< 1s, creation 2 Theme Cards vides)
    ↓
/characters/[id]/edit
    ↓ Section Theme Cards
    ↓ [Modifier] Theme Card 1
    ↓ Modal : Titre, Type, Power Tags (3), Weakness Tags (1)
    ↓ [Sauvegarder]
    ↓
[Theme Card 1 complete]
    ↓ [Modifier] Theme Card 2 (meme process)
    ↓
[Personnage jouable : 2 Theme Cards minimum]
    ↓
SUCCESS : Lea a un personnage fonctionnel (dans playspace LITM PJ) en < 5 minutes

Nombre de clics : 13-16 (1 clic supplementaire pour role)
Temps estime : 3-5 minutes (selon saisie utilisateur)
```

### Flow 2 : CREATION PLAYSPACE MJ + PERSONNAGE PNJ

```
[Marc (MJ) veut creer un playspace pour sa campagne]
    ↓
/playspaces (Liste playspaces existants)
    ↓ [+ Nouveau Playspace]
    ↓
/playspaces/new (Wizard)
    ↓ Etape 1 : Role → MJ (choix)
    ↓ Etape 2 : Systeme → Mist Engine
    ↓ Etape 3 : Hack → LITM
    ↓ Etape 4 : Univers → Chicago Noir
    ↓ Etape 5 : Nom → "Campagne Chicago [MJ]" (auto)
    ↓ [Creer Playspace]
    ↓
/playspaces/[id] (Dashboard Playspace)
    ↓ Redirect auto vers /preparation (Dashboard MJ complet)
    ↓
/preparation (Dashboard MJ - Onglets Personnages / Dangers / Lieux)
    ↓ Onglet "Personnages" (vide)
    ↓ [+ Nouveau Personnage]
    ↓
/characters/new
    ↓ Formulaire MJ : Nom, Description, Avatar, Niveau, Type (PJ/PNJ)
    ↓ Selecte Type : PNJ
    ↓ Nom : "Baron Vordak"
    ↓ [Creer]
    ↓
/characters/[id]/edit
    ↓ Badge visible : [PNJ]
    ↓ Remplissage 2 Theme Cards (process identique)
    ↓
SUCCESS : MJ a cree un PNJ pour sa campagne

Nombre de clics : 14-17
Temps estime : 3-5 minutes
```

### Flow 3 : BASCULEMENT PJ → MJ CONTEXT

```
[Lea a 2 playspaces : "Workspace Aria" [PJ], "Campagne MJ Test" [MJ]]
    ↓
Sidebar : "Workspace Aria" [PJ] (actif, background bleu)
    ↓ Header navigation : "Preparation" actif
    ↓ URL : /preparation/characters (vue PJ)
    ↓
Lea travaille sur personnage Aria
    ↓ Veut basculer vers playspace MJ
    ↓
Clic sidebar "Campagne MJ Test" [MJ]
    ↓
[Loading optimiste : UI change immediatement]
    ↓ Sauvegarde etat Workspace Aria (< 500ms)
    ↓ Chargement donnees Campagne MJ (< 1s)
    ↓
/preparation (Dashboard MJ complet)
    ↓ Sidebar : "Campagne MJ Test" [MJ] devient actif
    ↓ Header navigation : "Preparation" toujours actif
    ↓ UI change : Onglets visibles (Personnages / Dangers / Lieux)
    ↓ Breadcrumb : "Campagne MJ Test [MJ] > Preparation"
    ↓
SUCCESS : Context MJ/PJ switch automatique en < 2s

Nombre de clics : 1
Temps estime : 1.5-2 secondes
```

### Flow 4 : EXPORT/PARTAGE PERSONNAGE (MJ vers Joueurs)

```
[Marc (MJ) veut partager PNJ avec joueurs]
    ↓
/preparation (Dashboard MJ - Playspace "Campagne Chicago [MJ]")
    ↓ Onglet "Personnages" actif
    ↓ Filtre : Tous (PJ + PNJ visibles)
    ↓ Personnage "Baron Vordak" [PNJ]
    ↓ Clic [Exporter JSON]
    ↓
[Loading "Generation en cours..."] (< 500ms)
    ↓
[Telechargement browser natif]
    ↓ Fichier : baron-vordak-2025-01-19.json (12 KB)
    ↓
[Toast : "Baron Vordak exporte !"]
    ↓ Marc envoie JSON via Discord
    ↓ Joueur Lea recoit fichier
    ↓
(Import sera disponible v1.3)

SUCCESS : Export en 1 clic, < 1 seconde

Nombre de clics : 1
Temps estime : < 5 secondes
```

### Flow 5 : DECOUVERTE ONBOARDING NOUVEAU UTILISATEUR

```
[Thomas arrive sur Brumisa3, jamais utilise]
    ↓
/ (Landing Page)
    ↓ CTA "Decouvrir l'application"
    ↓
/decouverte (Hub Decouverte)
    ↓ Section "Guide de demarrage"
    ↓ Lien "Qu'est-ce qu'un Playspace ?"
    ↓
/decouverte/guide#playspaces
    ↓ Lecture explication Playspace
    ↓ Lecture explication Role MJ vs PJ
    ↓ [Lancer tutoriel interactif]
    ↓
/decouverte/tutoriels/premier-playspace
    ↓ Wizard guide interactif (overlay annotations)
    ↓ Etape 1 : Choix role (explications contextuelles)
    ↓ Etape 2-5 : Memes etapes que wizard reel
    ↓ [Terminer tutoriel]
    ↓
[Modal : "Pret a creer votre premier vrai playspace ?"]
    ↓ [Oui, commencer] → /playspaces/new
    ↓ [Plus tard] → /decouverte
    ↓
SUCCESS : Thomas comprend concept avant de commencer

Nombre de clics : 5-8 (tutoriel)
Temps estime : 5-10 minutes (lecture + tutoriel)
```

### Flow 6 : SESSION SOLO - UTILISATION TRACKERS + ACTIONS (v1.3+)

```
[Lea veut jouer une session solo avec son personnage Aria]
    ↓
Header navigation : [Jouer en solo] (actif)
    ↓
/solo (HUD Solo - Interface Foundry-like)
    ↓ Selection personnage : Aria the Mist Weaver
    ↓ Theme Cards affichees (lecture seule + liens vers edition)
    ↓ Hero Card affichee (lecture seule)
    ↓
[Section Trackers - Modification temps reel]
    ↓ Status actifs : "Blesse" (niveau 2/5)
    ↓ Story Tags : "Traque le Baron", "Alliance avec Riri"
    ↓ Story Themes : "Redemption" (actif)
    ↓
[Action : Lea veut ajouter un nouveau Status]
    ↓ [+ Ajouter Status] dans HUD
    ↓ Modal rapide : Nom "Fatigue", Niveau 1, Actif Oui
    ↓ [Ajouter] (< 200ms)
    ↓
[Toast : "Status 'Fatigue' ajoute"]
    ↓ Affichage immediat dans HUD (badge orange niveau 1)
    ↓
[Section Action Database]
    ↓ Lea veut utiliser une action de son Theme "Shadow Dancer"
    ↓ Catalogue actions → Filtre "Shadow Dancer"
    ↓ Action "Teleport through shadows" visible
    ↓ [Construction dynamique] avec 12 briques generiques
    ↓ Preview action complete avec regles
    ↓ [Ajouter aux favorites]
    ↓
[Toast : "Action ajoutee aux favorites"]
    ↓ Acces rapide dans HUD pour prochaine utilisation
    ↓
[Fin de scene : Lea modifie Trackers]
    ↓ Status "Blesse" : Niveau 2 → 3 (drag slider)
    ↓ Story Tag "Traque le Baron" : Toggle OFF (archive)
    ↓ Story Tag nouveau : "Indice mysterieux" (ajout rapide)
    ↓
SUCCESS : Trackers + Actions utilisables en temps reel pendant session

Nombre de clics : 5-7 (ajout Status + Action favorite + modifs)
Temps estime : 1-2 minutes (modifications rapides en session)
```

---

## F. RECOMMANDATIONS UX

### 1. Justifications des Choix Navigation 4 Sections

**Section "Decouverte"**
- **Pourquoi** : Onboarding et aide essentiels pour nouveau concept (Playspaces, roles MJ/PJ)
- **Avantage** : Reduction friction apprentissage, autonomie utilisateurs
- **Contenu** : Guide, tutoriels, FAQ, exemples
- **Trade-off** : Ajoute 1 item navigation, mais critique pour UX

**Section "Preparation" (Context-Sensitive)**
- **Pourquoi** : Workflows MJ et PJ sont fondamentalement differents
- **Avantage** : UI adaptative = reduction complexite pour chaque role
- **Mode PJ** : Focus personnages joueurs uniquement
- **Mode MJ** : Acces personnages + dangers + PNJ + lieux
- **Trade-off** : UI conditionnelle complexe, mais meilleure experience

**Section "Jouer en solo" (v1.3+)**
- **Pourquoi** : Separation claire preparation (avant partie) vs jeu (pendant partie)
- **Avantage** : Organisation mentale claire pour utilisateurs
- **Contenu** : Sessions, oracles, des
- **Trade-off** : Placeholder en MVP v1.0 (grise), mais architecture future

**Section "Table VTT" (v2.0+)**
- **Pourquoi** : Mode multiplayer radicalement different du solo
- **Avantage** : Separation claire = pas de confusion entre modes
- **Contenu** : Investigation Board, multiplayer, sync temps reel
- **Trade-off** : Placeholder en MVP v1.0 (grise), mais architecture future

### 2. Role MJ/PJ : Impacts UX

**Designation au niveau Playspace (pas personnage)**
- **Pourquoi** : Un playspace = un contexte de jeu homogene
- **Avantage** : UI cohérente pour tous personnages du playspace
- **Consequences** :
  - MJ peut creer PJ et PNJ dans meme playspace
  - PJ ne voit que personnages joueurs (pas d'option PNJ)
  - Filtre supplementaire en mode MJ (Tous / PJ / PNJ)

**Wizard Creation Playspace - Etape 1 = Role**
- **Pourquoi** : Decision critique qui impacte tout le workflow
- **Avantage** : Explicite le choix des le debut
- **UI** : Carte visuelle avec explication role
  - [MJ] : "Preparez votre campagne, creez PJ et PNJ"
  - [PJ] : "Gerez vos personnages joueurs"

**Sidebar Badge Role**
- **Pourquoi** : Indicateur visuel permanent du contexte actif
- **Avantage** : Evite confusion lors basculement playspaces
- **UI** : Badge colore [MJ] (orange) ou [PJ] (bleu) a cote nom playspace

### 3. Trade-offs Desktop vs Mobile

| Aspect | Desktop (MVP v1.0) | Mobile (v1.1) |
|--------|-------------------|---------------|
| **Navigation principale** | Header horizontal (4 items) | Bottom nav (4 icones) |
| **Playspaces** | Sidebar permanente avec badge role | Drawer swipe/hamburger + badge |
| **Preparation MJ** | Onglets horizontaux (Persos/Dangers/Lieux) | Tabs swipables |
| **Liste personnages** | Grille 3 colonnes + filtre PJ/PNJ | Stack vertical + filtre modal |
| **Edition personnage** | Sections empilees verticales | Tabs horizontales swipables |
| **Trackers** | 3 colonnes cote a cote | Accordeon/Tabs |
| **Modals** | Centrees, max-width 600px | Fullscreen drawer bottom-up |
| **Breadcrumbs** | Hierarchie complete + badge role | [<] Retour + Titre + badge |

### 4. Metriques de Succes UX

**Temps sur Tache**
- Creer premier playspace + personnage : < 5 minutes (**Actuel estime : 3-5 min**)
- Comprendre difference MJ/PJ : < 2 minutes (**Grace section Decouverte**)
- Modifier personnage existant : < 1 minute (**Actuel estime : 30-60s**)
- Export personnage : < 5 secondes (**Actuel estime : < 5s**)
- Basculer entre playspaces MJ/PJ : < 2 secondes (**Actuel cible : < 2s**)

**Nombre de Clics (Parcours Critiques)**
- Creer playspace + personnage : 13-16 clics (**+1 clic pour role, acceptable**)
- Basculer context MJ ↔ PJ : 1 clic (**Optimal**)
- Filtrer personnages PJ/PNJ (mode MJ) : 1 clic (**Optimal**)
- Acceder Decouverte : 1 clic (**Optimal**)

**Taux de Completion**
- Onboarding guest (creer 1er playspace + personnage) : > 80%
- Comprehension role MJ/PJ : > 90% (grace Decouverte)
- Migration guest → authentifie : > 60%
- Creation personnage jouable (2 Theme Cards minimum) : > 90%

**Charge Cognitive**
- Apprentissage navigation 4 sections : < 3 minutes (grace Decouverte)
- Comprehension difference MJ/PJ : < 5 minutes (tutoriels)
- Maitrise edition personnage : < 10 minutes
- Workflow complet (playspaces + roles + personnages + export) : < 30 minutes

### 5. Points d'Attention Ergonomiques

**CRITIQUE : Expliciter Role MJ/PJ des Onboarding**
- **Probleme** : Concept role peut etre obscur pour nouveaux utilisateurs
- **Solution** :
  - Section Decouverte dedicace : "Role MJ vs PJ"
  - Wizard creation playspace : Etape 1 avec explications detaillees
  - Tooltips contextuels sur badges [MJ] / [PJ]
  - Tutoriel interactif comparant workflows MJ et PJ

**IMPORTANT : UI Adaptative Mode MJ/PJ**
- **Probleme** : UI conditionnelle peut creer confusion lors basculements
- **Solution** :
  - Indicateurs visuels TRES visibles (badge couleur, breadcrumb)
  - Transition animee lors basculement playspaces (flash badge role)
  - Message toast : "Basculement vers playspace [MJ]" ou "[PJ]"
  - Persistance filtres par role (localStorage)

**ACCESSIBILITE : Grise Items Navigation Futurs**
- **Probleme** : Sections "Jouer en solo" et "Table VTT" pas disponibles en MVP
- **Solution** :
  - Items grises avec badge "v1.3+" ou "v2.0+"
  - Tooltip au survol : "Disponible prochainement"
  - Clic redirige vers /decouverte avec roadmap
  - Evite frustration (anticipation features futures)

**PERFORMANCE : Persistence Context Playspace Actif**
- **Probleme** : Basculement playspaces doit charger donnees + adapter UI selon role
- **Solution** :
  - Cache localStorage : dernier playspace actif + role
  - Preload donnees playspaces au login (optimiste)
  - UI optimiste : affichage immediat badge + skeleton loading contenu
  - Rollback si erreur serveur (< 2s timeout)

**COHERENCE : Breadcrumbs avec Badge Role**
- **Probleme** : Navigation profonde + besoin indicateur role permanent
- **Solution** :
  - Format breadcrumb : [Playspace Name] [Badge MJ/PJ] > Section > Page
  - Exemple : "Campagne Chicago [MJ] > Preparation > Personnages"
  - Mobile : Simplifies a [<] + "Campagne Chicago [MJ]"
  - Badge toujours visible dans breadcrumb

**MOBILE-FIRST (v1.1) : Bottom Nav 4 Sections**
- **Probleme** : 4 items bottom nav = limite WCAG (max recommande)
- **Solution v1.1** :
  - Bottom nav : Decouverte / Preparation / Solo (grise) / VTT (grise)
  - Profil/Settings accessibles via Drawer hamburger
  - Icones claires + labels (48px touch targets)
  - Badge role visible sur icone Preparation

---

## CONCLUSION

L'arborescence restructuree optimise :

1. **Clarte mentale** : 4 sections separent decouverte, preparation, jeu solo, jeu multiplayer
2. **Context-awareness** : UI adaptative selon role MJ/PJ du playspace actif
3. **Onboarding facilite** : Section Decouverte dedicace reduit friction apprentissage
4. **Scalabilite** : Architecture prete pour v1.3+ (Solo) et v2.0+ (VTT)
5. **Rapidite d'acces** : Sidebar playspaces avec badges role, basculement 1 clic

**Points forts principaux** :
- Role MJ/PJ au niveau playspace = UI coherente et adaptee
- Section Decouverte = reduction 50% temps apprentissage
- Navigation 4 sections = separation claire preparation vs jeu

**Points vigilance** :
- UI conditionnelle MJ/PJ necessite indicateurs visuels TRES clairs
- Sections "Solo" et "VTT" grises en MVP = gestion attentes utilisateurs
- Complexite accrue navigation (4 items vs 3) = justifiee par clarte
