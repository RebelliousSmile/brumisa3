# Definition du MVP - Brumisa3 v1.0

## Philosophie du MVP

**Objectif** : Livrer la version minimale qui permet aux utilisateurs de **jouer en mode solo** avec le systeme Mist Engine / City of Mist.

**Principe MoSCoW** :
- **Must Have** : Fonctionnalites critiques pour le MVP v1.0
- **Should Have** : Important mais reportable en v1.x
- **Could Have** : Souhaitable pour v2.0+
- **Won't Have** : Hors perimetre initial

---

## MVP v1.0 - Mode Solo Fonctionnel

### Vision du MVP

```
Utilisateur arrive sur Brumisa3
    ↓
Cree un playspace (Systeme + Hack + Univers)
    ↓
Cree son personnage Legends in the Mist
    ↓
Joue en solo, sauvegarde son avancement
    ↓
Peut exporter ses donnees (JSON/PDF)
```

### Perimetre MUST HAVE

#### 1. Systeme Playspace (CRITIQUE)

**Fonctionnalites minimales** :
- [x] Creer un playspace avec :
  - Systeme (choix : Mist Engine OU City of Mist)
  - Hack (au minimum : "Legends in the Mist" + "Otherscape")
  - Univers (au minimum : univers par defaut pour chaque hack)
- [x] Sauvegarder playspace en localStorage
- [x] Basculer entre playspaces (illimites)
- [x] Supprimer un playspace
- [ ] Authentification utilisateur (compte optionnel - mode guest)
- [ ] Si compte : sauvegarder playspaces en BDD

**Hors perimetre MVP** :
- ❌ Partage de playspaces entre utilisateurs
- ❌ Import/export de playspaces
- ❌ Parametres avances du playspace

**Estimation** : 1-2 semaines

---

#### 2. Gestion de Personnages LITM (CRITIQUE)

**Fonctionnalites minimales** :
- [x] Modele de donnees Prisma pour personnages LITM
- [x] Creer un personnage :
  - Informations de base (nom, description)
  - Theme Cards (minimum 2-4 themes)
  - Power tags et Weakness tags
  - Hero Card (relations, quintessences)
- [x] Modifier un personnage
- [x] Supprimer un personnage
- [x] Lister les personnages du playspace actif
- [x] Trackers basiques :
  - Status tracker
  - Story tag tracker
  - Story theme tracker

**Hors perimetre MVP** :
- ❌ Systeme de quetes (Story Arcs)
- ❌ Sac a dos (Backpack) detaille
- ❌ Historique des modifications (undo/redo)
- ❌ Drawer system (organisation multi-personnages)
- ❌ Import de personnages depuis characters-of-the-mist

**Estimation** : 4-5 semaines

---

#### 3. UI/UX de Base (CRITIQUE)

**Fonctionnalites minimales** :
- [x] Layout principal :
  - Header avec navigation
  - Sidebar pour changer de playspace
  - Zone de contenu principale
- [x] Page d'accueil :
  - Presentation de Brumisa3
  - Creation du premier playspace (wizard)
- [x] Page personnages :
  - Liste des personnages
  - Formulaire creation/edition
- [x] Responsive : desktop uniquement pour MVP
- [x] Theme : clair uniquement (dark mode en v1.1)

**Hors perimetre MVP** :
- ❌ Mobile responsive
- ❌ Dark mode
- ❌ Command palette (Ctrl+K)
- ❌ Raccourcis clavier avances
- ❌ Animations elaborees
- ❌ PWA (Progressive Web App)

**Estimation** : 2-3 semaines

---

#### 4. Authentification (CRITIQUE pour MVP)

**Fonctionnalites minimales** :
- [x] Connexion avec email/password (via @sidebase/nuxt-auth)
- [x] Inscription
- [x] Deconnexion
- [x] Page profil basique
- [x] Mode guest (utilisation sans compte)
- [ ] Recuperation mot de passe

**Hors perimetre MVP** :
- ❌ OAuth (Google, Discord, etc.)
- ❌ 2FA (authentification deux facteurs)
- ❌ Gestion des roles (admin, moderateur)

**Note** : L'authentification est obligatoire côté technique mais l'utilisateur peut utiliser en mode "guest" sans créer de compte (localStorage).

**Estimation** : 1-2 semaines

---

#### 5. Export de Donnees (IMPORTANT)

**Fonctionnalites minimales** :
- [x] Exporter personnage en JSON
- [x] Exporter personnage en PDF (fiche basique)

**Hors perimetre MVP** :
- ❌ Import JSON de personnages
- ❌ Export multi-personnages (ZIP)
- ❌ Templates PDF personnalises
- ❌ Export vers VTT (Foundry, Roll20)

**Estimation** : 1 semaine

---

### Perimetre SHOULD HAVE (v1.1 - v1.5)

Ces fonctionnalites seront ajoutees dans les versions iteratives apres le MVP.

#### v1.1 - Ameliorations UX (2-3 semaines)
- [ ] Dark mode
- [ ] Mobile responsive
- [ ] Undo/Redo pour personnages
- [ ] Raccourcis clavier basiques
- [ ] Tutoriel interactif (onboarding)

#### v1.2 - Support Otherscape (2-3 semaines)
- [ ] Traductions Otherscape (FR/EN)
- [ ] Modeles specifiques Otherscape
- [ ] Templates PDF Otherscape

#### v1.3 - Import/Export Avance (2 semaines)
- [ ] Import de personnages JSON (characters-of-the-mist)
- [ ] Export vers Foundry VTT
- [ ] Templates PDF personnalises

#### v1.4 - Drawer System (2-3 semaines)
- [ ] Organisation multi-personnages
- [ ] Dossiers et fichiers
- [ ] Drag & drop entre personnages

#### v1.5 - Systeme de Dons (1 semaine)
- [ ] Integration OpenCollective
- [ ] Page "Soutenir le projet"
- [ ] Banniere discrète avec appel aux dons
- [ ] Liens vers sponsors

---

### Perimetre COULD HAVE (v2.0+)

Fonctionnalites avancees pour versions majeures futures.

#### v2.0 - Investigation Board (4-5 semaines)
- [ ] Canvas interactif (Fabric.js ou Konva.js)
- [ ] Notes texte et photo
- [ ] Drag & drop
- [ ] Connexions entre notes
- [ ] Sauvegarde/Chargement (localStorage + BDD)
- [ ] Export PNG
- [ ] Generation notes depuis personnages
- [ ] Mode solo fonctionnel

#### v2.1 - Editeur d'Univers Personnalise (3-4 semaines)
- [ ] Creer un univers personnalise
- [ ] Definir dangers, tropes, PNJs
- [ ] Listes personnalisees (noms, lieux)
- [ ] Associer univers a un playspace
- [ ] Publication sur marketplace (gratuit)

#### v2.2 - Editeur de Hacks (4-5 semaines)
- [ ] Creer un hack personnalise
- [ ] Definir moves custom
- [ ] Personnaliser mecaniques
- [ ] Publication sur marketplace (gratuit)

#### v2.3 - Marketplace Communautaire (gratuit)
- [ ] Publier hacks/univers (gratuit pour tous)
- [ ] Parcourir contenus communautaires
- [ ] Notation et commentaires
- [ ] Fork de hacks
- [ ] Partage sans restriction

#### v2.5 - Mode Multi-Joueurs (Mode Centralise)
- [ ] Infrastructure WebSocket
- [ ] Sessions de jeu
- [ ] Investigation Board collaboratif
- [ ] Chat temps reel
- [ ] Lanceur de des

#### v3.0 - Integration VTT
- [ ] API Foundry VTT
- [ ] API Roll20
- [ ] Synchronisation bidirectionnelle

---

### Perimetre WON'T HAVE

Fonctionnalites hors perimetre initial de Brumisa3 :

- ❌ Support d'autres systemes JDR (D&D, Pathfinder, etc.)
- ❌ VTT complet integre (cartes, tokens, combat)
- ❌ Generateur procedural de contenus
- ❌ IA pour suggestions narratives
- ❌ Marketplace payante avec commissions
- ❌ Application mobile native (iOS/Android)

---

## Roadmap MVP v1.0

### Sprint Planning (sprints de 2 semaines)

```
Sprint 1-2 (4 sem) : Fondations + Authentification
├── Setup projet Nuxt 4
├── Configuration Prisma + PostgreSQL
├── Systeme Playspace (localStorage + BDD)
├── Authentification (email/password + mode guest)
└── UI/UX basique (layout, navigation)

Sprint 3-6 (8 sem) : Personnages LITM Complets
├── Modeles Prisma personnages
├── CRUD personnages (Create, Read, Update, Delete)
├── Theme Cards (UI + logique)
├── Hero Card (relations, quintessences)
├── Trackers basiques (status, story tag, story theme)
├── Tests unitaires + integration
└── Polish UI

Sprint 7 (2 sem) : Export & Polish
├── Export JSON personnages
├── Export PDF basique
├── Tests end-to-end
└── Corrections bugs

Sprint 8 (2 sem) : Polish & Documentation
├── Corrections bugs
├── Optimisations performance
├── Documentation utilisateur (FAQ, tutoriels)
└── Guide onboarding

Sprint 9 (optionnel) : Beta Testing
├── Recrutement beta testeurs (20-50 utilisateurs)
├── Collecte feedback
├── Corrections critiques
└── Livraison continue
```

**Total : 14-16 semaines (3.5-4 mois)**

---

## Estimations Detaillees

### Par Fonctionnalite

| Fonctionnalite | Complexite | Estimation | Priorite |
|----------------|------------|------------|----------|
| Systeme Playspace | Moyenne | 2 sem | P0 |
| Authentification (+ mode guest) | Moyenne | 2 sem | P0 |
| Modeles Prisma LITM | Faible | 1 sem | P0 |
| CRUD Personnages | Moyenne | 2 sem | P0 |
| Theme Cards UI | Elevee | 2-3 sem | P0 |
| Hero Card UI | Moyenne | 1-2 sem | P0 |
| Trackers UI | Moyenne | 1 sem | P0 |
| UI/UX Layout | Moyenne | 2 sem | P0 |
| Export JSON/PDF | Moyenne | 1 sem | P0 |
| Tests & Debug | - | 2 sem | P0 |
| **TOTAL MVP** | - | **13.5-15.5 sem** | - |

---

## Approche Agile - Livraison Continue

### Philosophie
Pas de "lancement" formel. **Livraison continue** des fonctionnalites au fur et a mesure qu'elles sont pretes.

### Definition of Done (DoD) par Feature

Chaque fonctionnalite est consideree "terminee" quand :
- [ ] Le code fonctionne sans bug critique
- [ ] Tests unitaires ecrits (si applicable)
- [ ] Code review fait (auto-review si solo)
- [ ] Deploye en production
- [ ] Disponible pour les utilisateurs

### Releases Incrementales

```
v0.1 (Sprint 2) : Playspace + Authentification
├── Utilisateurs peuvent creer et changer de playspace
├── Mode guest ou compte utilisateur
└── Sauvegarde localStorage + BDD

v0.2 (Sprint 4) : Personnages LITM basiques
├── Creation de personnages
├── Theme Cards
└── Hero Card

v0.3 (Sprint 6) : Personnages LITM complets
├── Trackers
├── Tests complets
└── Polish UI

v0.4 (Sprint 7) : Export & Tests
├── Export JSON/PDF
└── Tests end-to-end

v1.0 (Sprint 8) : Feature-complete MVP
├── Toutes les fonctionnalites MVP presentes
├── Stable et utilisable quotidiennement
├── Documentation complete
└── Livraison continue
```

### Criteres de Qualite (Continuous)

**A chaque commit/PR** :
- [ ] Pas de regression des tests existants
- [ ] Pas de bug critique introduit
- [ ] Code respecte les standards (linting)

**A chaque sprint** :
- [ ] Demo fonctionnelle des nouvelles features
- [ ] Feedback utilisateurs collecte (si beta testeurs)
- [ ] Backlog mis a jour avec learnings

---

## Reponses aux Questions Strategiques

### Q1 : Hacks Supportes ✓

**Reponse** : LITM et Otherscape (tous deux hacks du Mist Engine)

**Impact MVP** :
- Legends in the Mist (LITM) : priorite P0
- Otherscape : priorite P1 (apres LITM)
- City of Mist vanilla : priorite P2 (optionnel v1.x)

**Actions** :
- Modeles Prisma doivent supporter multi-hacks
- UI doit permettre selection du hack dans playspace
- Traductions LITM deja disponibles
- Traductions Otherscape a ajouter (v1.2)

### Q2 : Investigation Board ✓

**Reponse** : Reporte en v2.0 (pas dans MVP v1.0)

**Impact MVP** :
- Libere 3-4 semaines de developpement
- MVP se concentre sur gestion personnages
- Roadmap ajustee : 14-16 semaines au lieu de 18-20

### Q3 : Authentification ✓

**Reponse** : Obligatoire cote technique, optionnelle pour utilisateur

**Implementation** :
- Systeme d'auth complet dans MVP (email/password)
- Utilisateur peut naviguer sans compte (mode "guest")
- Donnees guest en localStorage
- Proposition de creation compte apres X actions
- Migration localStorage → BDD si creation compte

### Q4 : Monetisation ✓

**Reponse** : 100% gratuit avec systeme de dons

**Modele choisi** :
- Tout gratuit pour tous les utilisateurs
- Appel aux dons via OpenCollective ou plateforme similaire
- Transparence complete sur les couts et l'utilisation des dons
- Reconnaissance des sponsors/contributeurs

**Raison** : Alignement avec l'esprit communautaire du City of Mist Garage et regles de Son of Oak

Voir details : `documentation/FONCTIONNALITES/08-systeme-dons.md`

### Q5 : Juridique ✓

**Reponse** : Pas d'autorisation Son of Oak, respect des regles City of Mist Garage

Voir details : `documentation/JURIDIQUE/licences-et-attributions.md`

---

**Date** : 2025-01-19
**Version** : 1.0
**Statut** : Valide
