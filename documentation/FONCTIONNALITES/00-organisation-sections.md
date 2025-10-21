# Organisation des Sections - Brumisa3 MVP v1.0

Date: 2025-01-19
Version: 1.0
Auteur: Agent UI/UX Designer

---

## Vue d'ensemble

Brumisa3 organise son interface en **4 grandes sections** pour separer clairement les differentes phases d'utilisation de l'application :

1. **Decouverte** : Comprendre l'application et ses concepts
2. **Preparation** : Creer et gerer personnages/dangers avant la partie
3. **Jouer en solo** : Utiliser les outils pendant une session solo
4. **Table VTT** : Collaboration temps reel pour parties multi-joueurs

Cette separation repond a un besoin identifie : les utilisateurs ont des besoins differents **avant la partie** (preparation) et **pendant la partie** (jeu).

---

## Section 1 : Decouverte

### Objectif
Faciliter l'onboarding et reduire la friction d'apprentissage pour les nouveaux utilisateurs.

### Public cible
- Nouveaux utilisateurs jamais venus sur Brumisa3
- Utilisateurs cherchant de l'aide sur des concepts specifiques
- Utilisateurs voulant decouvrir les fonctionnalites futures

### Contenu

#### 1.1 Hub Decouverte (`/decouverte`)
Page d'accueil de la section avec acces rapide aux ressources :
- Guide de demarrage (pas-a-pas premier playspace)
- Tutoriels interactifs
- FAQ
- Galerie d'exemples de personnages

#### 1.2 Guide Complet (`/decouverte/guide`)
Documentation detaillee des concepts cles :
- **Qu'est-ce qu'un Playspace ?** : Definition, role MJ/PJ, structure
- **Role MJ vs PJ** : Differences, workflows specifiques
- **Creer son premier personnage** : Workflow complet
- **Theme Cards expliquees** : Power Tags, Weakness Tags, Quete
- **Hero Card** : Relations de Compagnie, Quintessences
- **Export et partage** : Format JSON, compatibilite

#### 1.3 Tutoriels Interactifs (`/decouverte/tutoriels`)
Pas-a-pas guides avec annotations visuelles :
- **Tutoriel 1** : Mon premier playspace (5 etapes wizard)
- **Tutoriel 2** : Mon premier personnage (creation Theme Cards)
- **Tutoriel 3** : Exporter en JSON

#### 1.4 Galerie d'Exemples (`/decouverte/exemples`)
Templates et inspirations :
- Personnages LITM prets a l'emploi
- Personnages Otherscape
- Templates de Theme Cards par archetype

### Metriques de succes
- **Temps apprentissage** : < 10 minutes pour comprendre concepts de base
- **Taux completion tutoriel** : > 70%
- **Taux conversion vers creation playspace** : > 60%

---

## Section 2 : Preparation

### Objectif
Creer et gerer tous les elements necessaires avant une partie (personnages, dangers, lieux).

### Public cible
- Tous les utilisateurs authentifies ou en mode guest
- MJ preparant leur campagne
- PJ creant/modifiant leurs personnages

### Contenu selon role Playspace

Cette section est **context-sensitive** : le contenu change selon que le playspace actif est designe **MJ** ou **PJ**.

#### 2.1 Mode PJ (Playspace role = PJ)

**Hub Preparation PJ** (`/preparation`)
- Dashboard simplifie : Mes personnages uniquement
- Stats personnages (nombre, derniere modification)
- [+ Nouveau Personnage]
- Export/Import

**Acces limite** :
- Pas d'acces aux Dangers
- Pas d'acces aux Lieux
- Pas de filtre PJ/PNJ (tous les personnages sont PJ)

**Workflow typique** :
1. Creer personnage
2. Remplir Theme Cards (2-4 cards minimum)
3. Optionnel : Ajouter Hero Card (Relations, Quintessences)
4. Exporter JSON pour partage

#### 2.2 Mode MJ (Playspace role = MJ)

**Hub Preparation MJ** (`/preparation`)
- Dashboard complet avec onglets :
  - **Onglet Personnages** : PJ + PNJ (filtre : Tous / PJ / PNJ)
  - **Onglet Dangers** (v1.2+)
  - **Onglet Lieux** (v1.2+)
- Stats globales (X personnages, Y dangers, derniere modif)
- Export/Import groupes

**Acces etendu** :
- Creation PNJ (Type PJ/PNJ dans formulaire)
- Gestion Dangers (v1.2+)
- Gestion Lieux (v1.2+)
- Filtre PJ/PNJ sur liste personnages

**Workflow typique** :
1. Creer PNJ pour la campagne
2. Remplir Theme Cards (comme PJ)
3. Creer Dangers (v1.2+)
4. Exporter ZIP complet (tous personnages + dangers)

#### 2.3 Gestion Playspaces (Tous roles)

**Liste Playspaces** (`/playspaces`)
- Grille/Liste avec badge role [MJ] ou [PJ]
- Actions : Modifier, Dupliquer, Supprimer, Exporter ZIP
- [+ Nouveau Playspace]

**Creation Playspace** (`/playspaces/new`)
Wizard 5 etapes :
1. **Role** : MJ ou PJ (CRITIQUE - determine UI suivante)
2. **Systeme** : Mist Engine / City of Mist
3. **Hack** : LITM / Otherscape
4. **Univers** : Chicago / Londres / Custom
5. **Nom** : Auto-suggere avec role (ex: "LITM Chicago [MJ]")

**Edition Playspace** (`/playspaces/[id]/edit`)
- Modification Role, Hack, Univers, Nom
- Attention : Changer role MJ ↔ PJ change l'UI du dashboard

#### 2.4 Gestion Personnages

**Sidebar Playspaces** (Toutes pages Preparation)
- Liste playspaces avec badge role
- Actions par playspace (kebab menu ⋮) :
  - Modifier
  - Dupliquer
  - Exporter ZIP
  - Supprimer
- [+ Nouveau Playspace] en haut

**Liste Personnages** (`/preparation/characters`)
- Grille cards avec avatar, nom, niveau
- [Mode MJ] Filtre supplementaire : Tous / PJ / PNJ
- Recherche, Tri (nom, niveau, date)
- Actions : Modifier, Dupliquer, Exporter JSON, Supprimer

**Edition Personnage** (`/characters/[id]/edit`)
Navigation tabs verticale (desktop) / horizontale swipable (mobile) :

**Tab 1 : Informations**
- Nom, Description, Avatar, Niveau
- [Mode MJ] Type : PJ ou PNJ

**Tab 2 : Theme Cards** (2-4 cards)
Structure par Theme Card :
- Titre
- Type : Mythos ou Logos
- Description
- **Power Tags** (3-5) : Tags inline editables
- **Weakness Tags** (1-2) : Tags inline editables
- **Quete** : Texte libre
- Actions : Modifier, Supprimer

Exemple Theme Card :
```
┌─────────────────────────────────────────┐
│ Shadow Dancer                   [Mythos]│
├─────────────────────────────────────────┤
│ Description: Maitre des ombres...       │
│                                          │
│ Power Tags (4/5):                       │
│ [Teleport shadows (30ft)]               │
│ [Night vision]                          │
│ [Shadow manipulation]                   │
│ [Stealth master]                        │
│                                          │
│ Weakness Tags (1/2):                    │
│ [Vulnerable to light]                   │
│                                          │
│ Quete: Retrouver le Baron Vordak...     │
│                                          │
│ [Modifier] [Supprimer]                  │
└─────────────────────────────────────────┘
```

**Tab 3 : Hero Card** (Optionnelle)
- **Relations de Compagnie** (0-5)
  - Structure : Compagnon + Relation (ex: "Riri - neveu")
  - [+ Ajouter Relation]
- **Quintessences** (0-3)
  - Structure : Nom + Description
  - [+ Ajouter Quintessence]
- Actions : Creer Hero Card (si absente), Modifier, Supprimer

Exemple Hero Card :
```
┌─────────────────────────────────────────┐
│ Hero Card - Aria the Mist Weaver        │
├─────────────────────────────────────────┤
│ Relations de Compagnie (2/5):           │
│ • Riri - neveu                          │
│ • Camarade - Relation                   │
│ [+ Ajouter Relation]                    │
│                                          │
│ Quintessences (1/3):                    │
│ • quinte de toux                        │
│   Description: ...                      │
│ [+ Ajouter Quintessence]                │
│                                          │
│ [Modifier] [Supprimer Hero Card]        │
└─────────────────────────────────────────┘
```

**Note importante** : Les **Trackers** (Status, Story Tags, Story Themes) ne sont PAS dans la section Preparation. Ils sont geres dans les sections "Jouer en solo" et "Table VTT" pendant la partie.

#### 2.5 Gestion Dangers (Mode MJ uniquement - v1.2+)

**Liste Dangers** (`/preparation/dangers`)
- Accessible uniquement si playspace actif = MJ
- Grille dangers avec structure similaire Theme Cards
- [+ Nouveau Danger]

**Edition Danger** (`/dangers/[id]/edit`)
- Formulaire similaire Theme Cards
- Titre, Type, Description
- Power Tags, Weakness Tags
- Actions : Modifier, Supprimer

### Metriques de succes
- **Temps creation playspace + personnage** : < 5 minutes
- **Taux completion personnage** : > 90% (2 Theme Cards minimum)
- **Basculement playspaces** : < 2 secondes

---

## Section 3 : Jouer en solo

### Objectif
Fournir une interface HUD pour jouer des sessions solo avec gestion temps reel des Trackers et acces aux Actions.

### Public cible
- Joueurs solo (mode PJ ou MJ)
- Utilisateurs voulant tester leurs personnages
- Joueurs utilisant les oracles et des pour parties solo

### Disponibilite
- **MVP v1.0** : Placeholder avec message "Disponible en v1.3+"
- **v1.3+** : Interface HUD complete fonctionnelle

### Architecture HUD (v1.3+)

L'interface est inspiree de **Foundry VTT** pour familiarite et efficacite.

#### 3.1 HUD Solo Principal (`/solo`)

**Layout interface** :
```
┌──────────────────────────────────────────────────────────┐
│ Header: Jouer en solo                  [Personnage: Aria]│
├──────────────────────────────────────────────────────────┤
│ Sidebar Playspaces (gauche 280px)                        │
│                                                           │
│ ┌─────────────────────────────────────────────────────┐  │
│ │ THEME CARDS (Lecture seule + liens edition)        │  │
│ │ • Shadow Dancer [Mythos]                            │  │
│ │ • Street Detective [Logos]                          │  │
│ │   [Modifier] (redirige vers /characters/edit)      │  │
│ └─────────────────────────────────────────────────────┘  │
│                                                           │
│ ┌─────────────────────────────────────────────────────┐  │
│ │ HERO CARD (Lecture seule)                           │  │
│ │ Relations: Riri (neveu), Camarade                   │  │
│ │ Quintessences: quinte de toux                       │  │
│ └─────────────────────────────────────────────────────┘  │
│                                                           │
│ ┌─────────────────────────────────────────────────────┐  │
│ │ TRACKERS (Modification temps reel)                  │  │
│ │ Status (2/5):    [Blesse ●●○○○] [Fatigue ●○○○○]    │  │
│ │ Story Tags:      [Traque Baron] [Alliance Riri]    │  │
│ │ Story Themes:    [Redemption ●]                     │  │
│ │ [+ Ajouter Status] [+ Ajouter Tag] [+ Ajouter Theme]│  │
│ └─────────────────────────────────────────────────────┘  │
│                                                           │
│ ┌─────────────────────────────────────────────────────┐  │
│ │ ACTION DATABASE (12 briques Mist Engine)            │  │
│ │ [Catalogue Actions] [Construire Action] [Favorites] │  │
│ │                                                      │  │
│ │ Favorites (acces rapide):                           │  │
│ │ • Teleport through shadows                          │  │
│ │ • Investigation expert                              │  │
│ └─────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

**Fonctionnalites cles** :
- Selection personnage actif (dans playspace)
- Theme Cards et Hero Card en lecture seule (liens vers edition)
- Trackers modifiables temps reel
- Action Database interactive

#### 3.2 Gestion Trackers (`/solo/trackers`)

**Status** (max 5 actifs)
- Nom du status (ex: "Blesse", "Fatigue", "Empoisonne")
- Niveau : 0 a 5 (slider drag ou boutons +/-)
- Toggle actif/inactif
- Description optionnelle
- Badge orange avec niveau visible (ex: "Blesse ●●○○○")

**Story Tags** (illimites)
- Nom du tag (ex: "Traque le Baron", "Alliance avec Riri")
- Description
- Toggle actif/inactif (archive automatique si inactive)
- Suggestion archivage si > 10 tags actifs
- Badge bleu

**Story Themes** (max 3 actifs)
- Nom du theme (ex: "Redemption", "Vengeance")
- Description
- Toggle actif/inactif
- Badge violet

**Interactions temps reel** :
- Ajout rapide depuis HUD (modal legere)
- Modification niveau Status par drag (slider)
- Toggle ON/OFF instantane (clic badge)
- Suppression avec confirmation

#### 3.3 Action Database (`/solo/actions`)

**12 Briques Generiques Mist Engine**
Affichage interactif des briques de base pour construire des actions :
- Interface visuelle des 12 briques
- Construction dynamique par glisser-deposer
- Preview action resultante avec regles

**Catalogue Actions Predefinies**
Base de donnees d'exemples d'actions courantes :
- Recherche par nom/type
- Filtres par Theme Card (Shadow Dancer, Street Detective, etc.)
- Exemples par systeme (LITM, Otherscape)
- Visualisation regles completes

**Actions Favorites**
Sauvegarde personnalisee par personnage :
- [Ajouter aux favorites] depuis catalogue ou construction
- Acces rapide dans HUD principal
- Edition/Suppression favorites
- Export/Import favorites (JSON)

Exemple Action Database :
```
┌──────────────────────────────────────────────────────────┐
│ ACTION DATABASE                                           │
├──────────────────────────────────────────────────────────┤
│ [12 Briques] [Catalogue] [Favorites]                     │
│                                                           │
│ Catalogue (filtre: Shadow Dancer):                       │
│ ┌────────────────────────────────────────────────────┐   │
│ │ Teleport through shadows                           │   │
│ │ Briques: Move + Shadow + Distance                  │   │
│ │ Regle: Se teleporter dans l'ombre a 30ft max      │   │
│ │ [Voir Details] [Ajouter aux Favorites]            │   │
│ └────────────────────────────────────────────────────┘   │
│                                                           │
│ Mes Favorites (acces rapide):                            │
│ • Teleport through shadows                               │
│ • Investigation expert                                   │
│ • Shadow manipulation                                    │
└──────────────────────────────────────────────────────────┘
```

#### 3.4 Sessions de Jeu (`/solo/sessions` - v1.4+)
- Historique sessions avec dates
- [+ Nouvelle Session]
- Notes et progression par session
- Timeline evenements

#### 3.5 Oracles (`/solo/oracles` - v1.2 consultation, v2.1+ custom)
- Consultation oracles predefinies (tables Mist Engine)
- Historique tirages avec contexte
- [v2.1+] Creation oracles personnalisees

#### 3.6 Lancers de Des (`/solo/dice` - v1.3+)
- Interface lancers avec notation standard (2d6, d20, etc.)
- Historique jets avec resultats
- Configurations sauvegardees par action

### Metriques de succes
- **Temps ajout Status** : < 5 secondes
- **Temps recherche action** : < 10 secondes
- **Taux utilisation favorites** : > 60%

---

## Section 4 : Table VTT

### Objectif
Fournir une interface HUD partagee pour parties multi-joueurs avec collaboration temps reel.

### Public cible
- Tables de jeu multi-joueurs (1 MJ + 2-6 joueurs)
- Utilisateurs voulant Investigation Board partagee
- Groupes necessitant sync temps reel des personnages

### Disponibilite
- **MVP v1.0** : Placeholder avec message "Disponible en v2.0+"
- **v2.0+** : Interface HUD partagee fonctionnelle

### Architecture HUD Partagee (v2.0+)

Similaire au HUD Solo mais avec **synchronisation temps reel** (WebSocket).

#### 4.1 HUD VTT Principal (`/vtt`)

**Differences vs HUD Solo** :
- **Personnages actifs** : Selection multi-joueurs (MJ voit tous, joueurs voient leur perso)
- **Theme Cards** : Sync temps reel si modification par MJ
- **Hero Card** : Sync temps reel
- **Trackers partages** : Modification collaborative (permissions MJ/Joueurs)
- **Action Database partagee** : Actions favorites par table (partage)

**Permissions** :
- **MJ** : Modification tous personnages, tous trackers, creation dangers
- **Joueurs** : Modification leur personnage uniquement, trackers leur perso

#### 4.2 Gestion Trackers Partagee (`/vtt/trackers`)

**Fonctionnalites identiques a `/solo/trackers`** avec :
- **Sync temps reel** : WebSocket pour modifications instantanees
- **Permissions** : MJ modifie tous, joueurs leur perso
- **Historique modifications** : Qui a modifie quoi et quand
- **Notifications** : Toast si autre utilisateur modifie tracker

#### 4.3 Action Database Partagee (`/vtt/actions`)

**Fonctionnalites identiques a `/solo/actions`** avec :
- **Actions favorites par table** : Partagees entre tous les joueurs
- **Sync temps reel** : Ajout favorite visible instantanement par tous
- **Permissions** : MJ cree/modifie, joueurs consultent

#### 4.4 Investigation Board (`/vtt/investigation-board` - v2.0+)

**Tableau Kanban partage** :
- Colonnes : Indices / Suspects / Lieux / Theories
- Cards draggables en temps reel
- Collaboration simultanee (curseurs multi-utilisateurs)
- Historique modifications

#### 4.5 Mode Multi-joueurs (`/vtt/multiplayer` - v2.5+)

**Gestion Tables** :
- Creation table de jeu
- Invitations joueurs (email ou lien)
- Permissions MJ/Joueurs
- Synchronisation personnages

### Metriques de succes
- **Latence sync** : < 200ms
- **Simultaneous users** : 1 MJ + 6 joueurs min
- **Uptime** : > 99%

---

## Differences MJ vs PJ - Recapitulatif

| Aspect | Mode PJ | Mode MJ |
|--------|---------|---------|
| **Dashboard Preparation** | Mes personnages uniquement | Onglets Personnages/Dangers/Lieux |
| **Filtre personnages** | Aucun (tous PJ) | Tous / PJ / PNJ |
| **Creation personnage** | Type PJ implicite | Choix Type PJ/PNJ |
| **Acces Dangers** | Non | Oui (v1.2+) |
| **Acces Lieux** | Non | Oui (v1.2+) |
| **HUD Solo** | Personnage joueur | Tous personnages |
| **HUD VTT** | Son personnage | Tous personnages |
| **Trackers HUD** | Modification son perso | Modification tous persos |
| **Actions favorites** | Par personnage | Par table (partage) |

---

## Workflow Utilisateur Type

### Workflow PJ

```
1. [Decouverte] Tutoriel premier playspace
2. [Preparation] Creation playspace [PJ] "LITM Chicago [PJ]"
3. [Preparation] Creation personnage "Aria"
4. [Preparation] Remplissage 2 Theme Cards minimum
5. [Preparation] Optionnel : Hero Card avec Relations
6. [Jouer en solo v1.3+] Session solo avec Trackers + Actions
7. [Table VTT v2.0+] Rejoindre table MJ
```

### Workflow MJ

```
1. [Decouverte] Guide Role MJ vs PJ
2. [Preparation] Creation playspace [MJ] "Campagne Chicago [MJ]"
3. [Preparation] Creation PNJ "Baron Vordak"
4. [Preparation] Remplissage Theme Cards PNJ
5. [Preparation] Creation Dangers (v1.2+)
6. [Preparation] Export ZIP complet
7. [Table VTT v2.0+] Creation table + invitations joueurs
8. [Table VTT v2.0+] Session multi avec HUD partage
```

---

## Integration avec Architecture Technique

### Modele de donnees (Prisma)

**Playspace** :
- `role: String` - "MJ" ou "PJ" (champ obligatoire)
- Impact sur UI : Dashboard Preparation adaptatif

**Character** :
- `type: String` - "PJ" ou "PNJ" (null si playspace.role = PJ)
- Visibilite selon playspace.role

**Trackers** (v1.3+) :
- `Status` - Table separee liee a Character
- `StoryTag` - Table separee liee a Character
- `StoryTheme` - Table separee liee a Character
- Modification temps reel via WebSocket (v2.0+)

**Actions** (v1.3+) :
- `ActionFavorite` - Table liee a Character ou Playspace
- Sync temps reel via WebSocket (v2.0+)

### Routes API

**Preparation** (MVP v1.0) :
- `POST /api/playspaces` - Creation avec role
- `GET /api/playspaces/:id` - Detail avec role
- `POST /api/characters` - Creation avec type (si MJ)
- `GET /api/characters/:id` - Detail
- `PUT /api/characters/:id` - Mise a jour Theme/Hero Cards

**Jouer en solo** (v1.3+) :
- `GET /api/trackers/:characterId` - Liste trackers
- `POST /api/trackers/status` - Ajout Status
- `PUT /api/trackers/status/:id` - Modification niveau
- `GET /api/actions/catalog` - Catalogue actions
- `POST /api/actions/favorites` - Ajout favorite

**Table VTT** (v2.0+) :
- `WebSocket /ws/vtt/:playspaceId` - Sync temps reel
- `GET /api/vtt/trackers/:playspaceId` - Trackers partages
- `POST /api/vtt/investigation-board` - Board partage

---

## Prochaines Etapes

### Phase 1 : MVP v1.0 - Preparation (Actuel)
- [x] Architecture 4 sections documentee
- [x] Section Preparation complete (PJ/PJ)
- [ ] Wireframes desktop avec nouvelle navigation
- [ ] Wireframes mobile avec nouvelle navigation
- [ ] Implementation backend playspaces avec role

### Phase 2 : v1.3 - Jouer en solo
- [ ] HUD Solo interface Foundry-like
- [ ] Trackers (Status, Story Tags, Story Themes)
- [ ] Action Database (12 briques + catalogue)
- [ ] Sessions et Oracles consultation

### Phase 3 : v2.0 - Table VTT
- [ ] HUD VTT partage avec WebSocket
- [ ] Trackers sync temps reel
- [ ] Investigation Board partage
- [ ] Permissions MJ/Joueurs

### Phase 4 : v2.1+ - Extensions
- [ ] Oracles personnalisees
- [ ] Actions Database etendue
- [ ] Dangers et Lieux complets

---

**Document maintenu par : Agent UI/UX Designer**
**Derniere mise a jour : 2025-01-19**
