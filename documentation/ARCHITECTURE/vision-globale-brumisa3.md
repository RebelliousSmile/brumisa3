# Vision Globale Brumisa3 - Outil Universel Mist Engine

## Vue d'Ensemble

Brumisa3 se recentre pour devenir **l'outil universel** pour le Mist Engine et ses derives (City of Mist), avec trois axes principaux :

1. **Gestion de personnages et parties** (LITM integration)
2. **Investigation Board** (tableau d'enquete collaboratif)
3. **Creation et partage de hacks/univers personnalises**

## Architecture en Couches

```
┌─────────────────────────────────────────────────────────────┐
│                    BRUMISA3 - PLATEFORME                    │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│   PLAYSPACE   │   │ INVESTIGATION │   │  HACK/UNIVERS │
│               │   │     BOARD     │   │    CREATOR    │
└───────────────┘   └───────────────┘   └───────────────┘
        │                     │                     │
        │                     │                     │
        ▼                     ▼                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   MODES DE JEU                               │
├──────────────┬──────────────────┬──────────────────────────┤
│  Mode Solo   │    Mode VTT      │    Mode Centralise       │
└──────────────┴──────────────────┴──────────────────────────┘
```

## 1. Playspace (Espace de Jeu)

### Definition
Configuration qui definit le contexte de jeu :
- **Systeme** : Mist Engine ou City of Mist
- **Hack** : Variante du systeme (officiel ou communautaire)
- **Univers** : Monde de jeu avec ses dangers, tropes, PNJs
- **Parametres** : Configuration personnalisee

### Composition d'un Playspace

```
Playspace "Legends in the Mist - Monde Ferique"
├── Systeme : Mist Engine
├── Hack : Legends in the Mist
├── Univers : Royaume de Fae (personnalise)
│   ├── Dangers : Creatures feeriques, magie sauvage
│   ├── Tropes : Contrats feeriques, metamorphose
│   ├── PNJs : Reine Titania, Puck, etc.
│   └── Listes : Noms elfiques, lieux magiques
└── Personnages
    ├── Heros principal
    ├── Allies
    └── Antagonistes
```

### Gestion des Playspaces
- **Stack de playspaces** : plusieurs configurations sauvegardees
- **Playspace actif unique** : un seul contexte a la fois
- **Navigation fluide** : basculer entre playspaces
- **Persistence hybride** :
  - localStorage pour utilisateurs non connectes
  - Base de donnees pour utilisateurs authentifies

## 2. Investigation Board (Tableau d'Enquete)

### Concept
Espace visuel collaboratif pour organiser et connecter les elements d'une enquete.

### Fonctionnalites

#### 2.1 Canvas Interactif
```
┌─────────────────────────────────────────────────┐
│  [Note: Indice #1]──────┐                       │
│                         │                       │
│  [Photo: Scene crime]   │                       │
│            │            ▼                       │
│            └─────> [PNJ: Suspect]──>[Lieu: Bar]│
│                         │                       │
│                         ▼                       │
│                    [Note: Mobile]               │
└─────────────────────────────────────────────────┘
```

#### 2.2 Types d'Elements
- **Notes texte** : indices, hypotheses, questions
- **Notes photo** : preuves visuelles, portraits
- **Noeuds personnages** : PNJs avec leurs liens
- **Noeuds lieux** : endroits importants
- **Connexions** : relations entre elements

#### 2.3 Modes d'Utilisation
- **Solo** : board personnel pour organiser ses pensees
- **Multi-joueurs** : board collaboratif en temps reel
- **Export/Import** : partager des boards entre sessions

### Integration avec Playspace
- Board lie a un playspace
- Generation rapide de notes depuis personnages du playspace
- Synchronisation des modifications de personnages

## 3. Creation de Hacks et Univers

### 3.1 Editeur de Hack

#### Principe
Un hack herite des mecaniques du systeme parent et personnalise certains elements.

#### Fonctionnalites
```
Editeur de Hack
├── Informations Generales
│   ├── Nom du hack
│   ├── Systeme parent (Mist Engine / City of Mist)
│   ├── Description
│   └── Auteur
├── Mecaniques
│   ├── Moves personnalises
│   ├── Competences specifiques
│   ├── Systeme de progression
│   └── Regles alternatives
├── Elements Visuels
│   ├── Logo
│   ├── Theme visuel
│   └── Templates de fiches
└── Metadonnees
    ├── Version
    ├── Licence
    └── Tags (genre, tone, difficulte)
```

#### Exemple Concret
```
Hack : "Cyberpunk Mist"
├── Parent : Mist Engine
├── Moves specifiques :
│   ├── "Jack In" (piratage matrice)
│   ├── "Neural Link" (communication mentale)
│   └── "Chrome Enhancement" (augmentations)
└── Competences :
    ├── Hacking
    ├── Streetwise
    └── Tech
```

### 3.2 Editeur d'Univers

#### Principe
Un univers definit le monde de jeu avec tous ses elements narratifs.

#### Fonctionnalites
```
Editeur d'Univers
├── Informations Generales
│   ├── Nom de l'univers
│   ├── Pitch (description courte)
│   ├── Description detaillee
│   └── Hack compatible
├── Elements Narratifs
│   ├── Dangers
│   │   ├── Nom
│   │   ├── Description
│   │   ├── Niveau de menace
│   │   └── Tags associes
│   ├── Tropes
│   │   ├── Themes narratifs
│   │   ├── Cliches du genre
│   │   └── Arcs possibles
│   └── PNJs
│       ├── Nom
│       ├── Portrait
│       ├── Role narratif
│       └── Liens avec d'autres PNJs
├── Listes Generatives
│   ├── Noms (personnages, lieux)
│   ├── Objets et equipement
│   ├── Evenements aleatoires
│   └── Complications
└── Parametres
    ├── Tone (sombre, leger, etc.)
    ├── Echelle (rue, ville, monde)
    └── Themes principaux
```

#### Exemple Concret
```
Univers : "Neo-Tokyo 2099"
├── Hack : Cyberpunk Mist
├── Dangers :
│   ├── Mega-corporations
│   ├── IA renegates
│   └── Gangs de rue
├── Tropes :
│   ├── Dystopie technologique
│   ├── Cyberspace
│   └── Egalitarisme vs elite
├── PNJs Predéfinis :
│   ├── Hanzo (fixer de rue)
│   ├── Dr. Sakura (neurologue)
│   └── L33T (hacker legendaire)
└── Listes :
    ├── Noms japonais futuristes
    ├── Corporations (12 entrees)
    └── Quartiers de Neo-Tokyo (8 entrees)
```

### 3.3 Partage Communautaire

#### Hub Communautaire
```
Marketplace Brumisa3
├── Hacks Officiels
│   └── [Necessitent autorisation Son of Oak]
├── Hacks Communautaires
│   ├── Filtres (systeme, genre, popularite)
│   ├── Recherche
│   ├── Notation et commentaires
│   └── Download/Fork
├── Univers
│   └── [Meme structure que Hacks]
└── Bundles
    └── Hack + Univers + Ressources
```

#### Versioning et Fork
- **Git-like workflow** : fork un hack existant
- **Versioning** : v1.0, v1.1, etc.
- **Pull requests** (optionnel) : proposer modifications a l'auteur
- **Historique** : voir l'evolution d'un hack

## 4. Modes de Jeu

### 4.1 Mode Solo

#### Caracteristiques
- Utilisateur joue seul
- Toutes les fonctionnalites disponibles localement
- Pas de synchronisation temps reel
- Investigation Board personnel

#### Cas d'usage
```
Joueur : Alice
├── Playspace : "Legends in the Mist - Campagne Personnelle"
├── Personnages :
│   ├── Elara (heros principal)
│   ├── Marcus (compagnon)
│   └── Lord Volrath (antagoniste)
└── Investigation Board :
    ├── Mystere principal : Disparitions dans la foret
    ├── Indices collectes : 12 notes
    └── Connexions : 8 liens entre elements

Workflow :
1. Alice cree son playspace
2. Cree son personnage
3. Utilise l'investigation board pour organiser l'intrigue
4. Joue seule, prend des notes, evolue son personnage
5. Toutes les donnees en localStorage (ou BDD si compte)
```

### 4.2 Mode VTT (Virtual Tabletop)

#### Caracteristiques
- Brumisa3 comme **outil complementaire** a un VTT
- Gestion des personnages et investigation sur Brumisa3
- Jeu proprement dit sur VTT (Foundry, Roll20, etc.)
- Synchronisation des donnees

#### Cas d'usage
```
Groupe : 4 joueurs + 1 MJ
VTT : Foundry VTT (pour cartes, combat, ambiance)
Brumisa3 : Gestion personnages + Investigation Board

Workflow :
1. MJ cree le playspace sur Brumisa3
2. Joueurs creent leurs personnages sur Brumisa3
3. Pendant la partie :
   ├── Combat et cartes : Foundry VTT
   ├── Investigation et notes : Brumisa3
   └── Evolutions personnages : Brumisa3
4. Synchronisation :
   ├── Manuelle : export JSON depuis Brumisa3 vers Foundry
   └── Automatique : API (si disponible pour le VTT)
```

#### Integration VTT Cibles
- **Foundry VTT** (priorite haute - API disponible)
- **Roll20** (priorite moyenne)
- **Owlbear Rodeo** (priorite basse)
- **Autres** : export JSON generique

### 4.3 Mode Centralise

#### Caracteristiques
- Brumisa3 comme **hub central** de la partie
- Toutes les fonctionnalites sur une seule plateforme
- Synchronisation temps reel entre tous les joueurs
- Peut etre utilise avec VTT externe (optionnel)

#### Fonctionnalites Exclusives Mode Centralise
```
Brumisa3 Mode Centralise
├── Gestion de Session
│   ├── Salle de jeu virtuelle
│   ├── Liste des joueurs connectes
│   ├── Roles (MJ / Joueur)
│   └── Permissions (qui peut modifier quoi)
├── Investigation Board Collaboratif
│   ├── Tous les joueurs voient le meme board
│   ├── Edition temps reel
│   ├── Curseurs des autres utilisateurs visibles
│   └── Historique des modifications
├── Chat Integre
│   ├── Chat public (tous)
│   ├── Chat prive (MJ <-> Joueur)
│   ├── Historique persistant
│   └── Notifications
├── Lanceur de Des
│   ├── Jets visibles par tous
│   ├── Support tags (power/weakness)
│   ├── Historique des jets
│   └── Animation des resultats
└── Synchronisation Personnages
    ├── Mise a jour temps reel
    ├── Lock edition (qui modifie quoi)
    └── Notifications de changements
```

#### Cas d'usage
```
Groupe : 4 joueurs + 1 MJ
Tout sur Brumisa3 (aucun autre outil necessaire)

Workflow :
1. MJ cree une session sur Brumisa3
2. MJ partage le code de session
3. Joueurs rejoignent la session
4. Tous creent leurs personnages collaborativement
5. Pendant la partie :
   ├── Investigation Board : tous participent
   ├── Chat : communication en temps reel
   ├── Lanceur de des : jets visibles par tous
   ├── Evolution personnages : synchronisation auto
   └── (Optionnel) VTT externe pour cartes/musique
6. Fin de session : toutes les donnees sauvegardees
```

#### Option : Integration VTT Externe
```
Mode Centralise + VTT
├── Brumisa3 :
│   ├── Personnages
│   ├── Investigation Board
│   ├── Chat (optionnel si VTT a le sien)
│   └── Lanceur de des (optionnel)
└── VTT (Foundry, Roll20) :
    ├── Cartes et battlemaps
    ├── Ambiance sonore
    ├── Tokens et combat
    └── [Synchronise avec Brumisa3 via API]
```

## 5. Architecture Technique

### Stack
```
Frontend
├── Nuxt 4 + Vue 3
├── Tailwind CSS
├── Pinia (state management)
└── Canvas API / Fabric.js (pour Investigation Board)

Backend
├── Nitro Server (Nuxt)
├── PostgreSQL + Prisma ORM
├── Socket.io (temps reel pour Mode Centralise)
└── @sidebase/nuxt-auth (authentification)

Services
├── File Storage (AWS S3 ou similaire)
├── WebSocket Server (Socket.io)
└── API REST + API temps reel
```

### Modele de Donnees (Prisma)

```prisma
// Playspace
model Playspace {
  id          String    @id @default(cuid())
  userId      String
  name        String
  system      String    // "mist-engine" | "city-of-mist"
  hackId      String?
  universeId  String?
  settings    Json
  active      Boolean   @default(false)

  characters  Character[]
  boards      InvestigationBoard[]

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

// Hack
model Hack {
  id          String    @id @default(cuid())
  authorId    String
  name        String
  slug        String    @unique
  description String
  system      String    // "mist-engine" | "city-of-mist"
  version     String
  moves       Json      // Moves personnalises
  mechanics   Json      // Regles specifiques
  published   Boolean   @default(false)
  downloads   Int       @default(0)
  rating      Float?

  forks       Hack[]    @relation("HackForks")
  parentHack  Hack?     @relation("HackForks")

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

// Universe
model Universe {
  id          String    @id @default(cuid())
  authorId    String
  hackId      String?
  name        String
  slug        String    @unique
  description String
  dangers     Json
  tropes      Json
  npcs        Json
  lists       Json
  published   Boolean   @default(false)
  downloads   Int       @default(0)
  rating      Float?

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

// Investigation Board
model InvestigationBoard {
  id          String    @id @default(cuid())
  playspaceId String
  name        String
  canvas      Json      // Contient tous les elements du board
  mode        String    // "solo" | "collaborative"

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

// Session (Mode Centralise)
model Session {
  id          String    @id @default(cuid())
  gmId        String
  playspaceId String
  code        String    @unique
  active      Boolean   @default(true)
  players     Json      // Liste des joueurs connectes

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

## 6. Roadmap d'Implementation

### Phase 0 : Refonte Conceptuelle (2-3 semaines)
- [x] Definition du concept Playspace
- [ ] Documentation fonctionnelle complete
- [ ] Validation de l'architecture globale
- [ ] Maquettes UI/UX

### Phase 1 : Playspace & LITM (6-8 semaines)
- [ ] Implementation du systeme Playspace
- [ ] Integration Legends in the Mist (voir plan LITM)
- [ ] Gestion multi-playspaces
- [ ] Persistence hybride (localStorage + BDD)

### Phase 2 : Investigation Board (4-6 semaines)
- [ ] Canvas interactif (Fabric.js ou similaire)
- [ ] Systeme de notes (texte, photo)
- [ ] Connexions entre elements
- [ ] Mode solo fonctionnel
- [ ] Export/Import de boards

### Phase 3 : Editeurs Hack/Univers (6-8 semaines)
- [ ] Editeur de hack (UI + backend)
- [ ] Editeur d'univers (UI + backend)
- [ ] Systeme de templates
- [ ] Validation et tests

### Phase 4 : Partage Communautaire (4-6 semaines)
- [ ] Marketplace de hacks/univers
- [ ] Systeme de versioning
- [ ] Fork et contributions
- [ ] Notation et commentaires
- [ ] Moderation

### Phase 5 : Mode Centralise (8-10 semaines)
- [ ] Infrastructure WebSocket
- [ ] Systeme de sessions
- [ ] Investigation Board collaboratif
- [ ] Chat temps reel
- [ ] Lanceur de des
- [ ] Synchronisation personnages

### Phase 6 : Integration VTT (4-6 semaines)
- [ ] API d'export generique (JSON)
- [ ] Integration Foundry VTT (priorite)
- [ ] Integration Roll20
- [ ] Documentation pour autres VTT

## 7. Espace d'Administration

### Objectif
Interface d'administration intelligente pour gerer les contenus proposes sur la plateforme.

### Fonctionnalites Admin

#### 7.1 Dashboard Administrateur
```
Admin Dashboard
├── Vue d'ensemble
│   ├── Statistiques globales
│   │   ├── Nombre d'utilisateurs actifs
│   │   ├── Hacks publies (total, en attente)
│   │   ├── Univers publies (total, en attente)
│   │   └── Sessions actives
│   ├── Graphiques d'activite
│   └── Alertes et notifications
├── Gestion des Contenus
│   ├── Hacks en attente de validation
│   ├── Univers en attente de validation
│   ├── Signalements communautaires
│   └── Contenus a probleme
├── Gestion des Utilisateurs
│   ├── Liste des utilisateurs
│   ├── Roles et permissions
│   ├── Comptes suspendus
│   └── Logs d'activite
└── Configuration
    ├── Parametres globaux
    ├── Moderation automatique (filtres)
    └── Templates officiels
```

#### 7.2 Moderation des Hacks/Univers

**Workflow de validation** :
```
Contenu Soumis
    ↓
[File d'attente Admin]
    ↓
Admin examine :
├── Contenu approprie ?
├── Qualite suffisante ?
├── Respect des licences ?
└── Pas de plagiat ?
    ↓
Decision :
├── Approuver → Publie
├── Rejeter → Notification auteur + raisons
└── Demander modifications → Boucle feedback
```

**Outils de moderation** :
- Preview complet du hack/univers
- Historique des versions
- Commentaires admin (internes)
- Tags de categorisation automatiques
- Detection de contenu duplique
- Verification des liens/images

#### 7.3 Systeme de Signalement

**Types de signalements** :
- Contenu inapproprie
- Violation de licence
- Plagiat
- Bug technique
- Autre

**Traitement** :
```
Signalement recu
    ↓
[Dashboard Admin : nouveau signalement]
    ↓
Admin examine :
├── Signalement justifie ?
│   ├── OUI → Action (suspension, suppression, avertissement)
│   └── NON → Fermer le signalement
└── Notifier l'auteur du contenu
```

#### 7.4 Analytics et Reporting

**Metriques suivies** :
- Hacks les plus telecharges
- Univers les mieux notes
- Auteurs les plus actifs
- Tendances (genres populaires, systemes)
- Taux de rejet/validation

**Rapports generés** :
- Rapport hebdomadaire d'activite
- Top 10 contenus du mois
- Alertes sur contenus problematiques
- Performance de la plateforme

#### 7.5 Gestion des Contenus Officiels

**Cas particulier : contenus Son of Oak** :
- Tag special "Officiel"
- Validation par Son of Oak (si partenariat)
- Impossibilite de fork sans autorisation
- Affichage prioritaire

**Templates officiels** :
- Creation de templates de reference
- Mise a jour centralisee
- Documentation associee

#### 7.6 Outils de Curation

**Featured Content** :
- Mettre en avant certains hacks/univers
- Selection editoriale
- Rotation hebdomadaire/mensuelle

**Collections thematiques** :
- "Meilleurs hacks cyberpunk"
- "Univers pour debutants"
- "Creations de la communaute"

#### 7.7 Permissions et Roles

**Roles disponibles** :
```
Super Admin
├── Tous les droits
└── Gestion des autres admins

Moderateur
├── Validation contenus
├── Traitement signalements
└── Suspension utilisateurs (temporaire)

Curator
├── Creation collections
├── Featured content
└── Pas de moderation

Support
├── Gestion tickets utilisateurs
└── Pas d'acces aux contenus
```

### Implementation Technique

#### API Routes Admin
```
/api/admin/
├── dashboard
│   ├── stats.get.ts
│   └── activity.get.ts
├── hacks
│   ├── pending.get.ts
│   ├── [id]/approve.post.ts
│   ├── [id]/reject.post.ts
│   └── [id]/request-changes.post.ts
├── universes
│   └── [Meme structure que hacks]
├── users
│   ├── list.get.ts
│   ├── [id]/suspend.post.ts
│   └── [id]/roles.put.ts
└── reports
    ├── list.get.ts
    └── [id]/process.post.ts
```

#### Middleware de Protection
```typescript
// server/middleware/admin.ts
export default defineEventHandler(async (event) => {
  const session = await getSession(event)

  if (!session?.user) {
    throw createError({ statusCode: 401 })
  }

  if (!hasRole(session.user, ['admin', 'moderator'])) {
    throw createError({ statusCode: 403 })
  }

  // Log admin action
  await logAdminAction(session.user.id, event)
})
```

#### UI Admin
```
app/pages/admin/
├── index.vue (Dashboard)
├── hacks/
│   ├── index.vue (Liste)
│   ├── pending.vue (En attente)
│   └── [id].vue (Detail)
├── universes/
│   └── [Meme structure]
├── users/
│   └── index.vue
└── reports/
    └── index.vue
```

### Securite Admin

**Mesures de securite** :
- Authentification renforcee (2FA recommande)
- Logs de toutes les actions admin
- Rate limiting sur actions sensibles
- IP whitelisting (optionnel)
- Alertes sur actions critiques (suppression massive, etc.)

---

## 8. Questions Strategiques Ouvertes

### Q1 : Modele Economique
- Gratuit avec fonctionnalites premium ?
- Abonnement pour Mode Centralise ?
- Commission sur marketplace ?

### Q2 : Droits et Licences
- Autorisation Son of Oak pour contenus officiels ?
- Licence pour hacks communautaires ?
- Moderation du contenu partage ?

### Q3 : Performance et Scalabilite
- Infrastructure pour Mode Centralise (nombre de sessions simultanees) ?
- Couts d'hebergement WebSocket ?
- CDN pour assets communautaires ?

### Q4 : Priorites de Developpement
- Quel mode implementer en premier ? (Solo recommande)
- Investigation Board avant ou apres LITM ?
- Editeurs hack/univers : quelle priorite ?

---

**Date** : 2025-01-19
**Statut** : Vision en construction
**Prochaines etapes** : Validation utilisateur et priorisation features
