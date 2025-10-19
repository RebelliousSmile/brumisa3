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
Utilise l'Investigation Board pour organiser son enquete
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
  - Hack (au minimum : "Legends in the Mist" + "City of Mist vanilla")
  - Univers (au minimum : univers par defaut pour chaque hack)
- [x] Sauvegarder playspace en localStorage
- [x] Basculer entre playspaces (max 3 playspaces pour MVP)
- [x] Supprimer un playspace
- [ ] Authentification utilisateur (compte optionnel)
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
- [x] Page Investigation Board :
  - Canvas interactif
  - Toolbar (ajouter note, connexion, etc.)
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

#### v1.5 - Modele Freemium (1-2 semaines)
- [ ] Limitation 1 playspace pour free
- [ ] Gestion abonnements (Stripe)
- [ ] Page pricing
- [ ] Dashboard utilisateur (abonnement)

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

#### v2.1 - Editeur d'Univers Personnalise (PREMIUM) (3-4 semaines)
- [ ] Creer un univers personnalise
- [ ] Definir dangers, tropes, PNJs
- [ ] Listes personnalisees (noms, lieux)
- [ ] Associer univers a un playspace
- [ ] Publication sur marketplace (premium)

#### v2.2 - Editeur de Hacks (PREMIUM) (4-5 semaines)
- [ ] Creer un hack personnalise
- [ ] Definir moves custom
- [ ] Personnaliser mecaniques
- [ ] Publication sur marketplace (premium)

#### v2.3 - Marketplace Communautaire
- [ ] Publier hacks/univers
- [ ] Parcourir contenus communautaires
- [ ] Notation et commentaires
- [ ] Fork de hacks

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

Sprint 7 (2 sem) : Export & Freemium
├── Export JSON personnages
├── Export PDF basique
├── Gestion limitation freemium (1 playspace)
└── Tests end-to-end

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

**Gain vs version avec Investigation Board** : -4 semaines

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
| Gestion Freemium (limite playspaces) | Faible | 0.5 sem | P0 |
| Tests & Debug | - | 2 sem | P0 |
| **TOTAL MVP** | - | **14-16 sem** | - |

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

v0.4 (Sprint 7) : Export & Freemium
├── Export JSON/PDF
├── Limitation 1 playspace (free)
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

## Hypotheses et Risques

### Hypotheses Critiques

1. **Les utilisateurs veulent un outil solo avant multi-joueurs**
   - Validation : Sondage communaute City of Mist
   - Risque : Si faux, le MVP ne repond pas au besoin

2. **Legends in the Mist est le hack prioritaire**
   - Validation : Analyse des discussions communautaires
   - Risque : Peut-etre que City of Mist vanilla est plus demande

3. **Investigation Board est une feature differentiatrice**
   - Validation : Pas d'equivalent dans l'ecosysteme CoM/ME
   - Risque : Trop complexe pour un MVP

4. **Les utilisateurs acceptent de jouer sans compte (localStorage)**
   - Validation : Exemple de Roll20 (compte optionnel)
   - Risque : Perte de donnees si localStorage vide

### Risques Techniques

| Risque | Impact | Probabilite | Mitigation |
|--------|--------|-------------|------------|
| Complexite Investigation Board | Elevé | Moyenne | POC Fabric.js avant Sprint 6 |
| Performance Canvas avec beaucoup de notes | Moyen | Elevée | Virtualisation, limit 100 notes |
| Sauvegarde localStorage limitee (5-10MB) | Moyen | Faible | Compression JSON, alertes utilisateur |
| Compatibilite navigateurs (Canvas API) | Faible | Faible | Tests cross-browser automatises |

### Risques Projet

| Risque | Impact | Probabilite | Mitigation |
|--------|--------|-------------|------------|
| Derive du perimetre (scope creep) | Elevé | Elevée | Definition stricte MVP, revues sprint |
| Manque de feedback utilisateurs | Moyen | Moyenne | Recrutement beta testeurs tôt (Sprint 5) |
| Complexite sous-estimee LITM | Moyen | Moyenne | Buffer de 2 semaines dans planning |

---

## Metriques de Succes Post-Lancement

### Metriques d'Adoption

- **Objectif 3 mois** : 500 utilisateurs inscrits
- **Objectif 6 mois** : 2000 utilisateurs inscrits
- **Taux de retention (1 mois)** : >40%

### Metriques d'Engagement

- **Playspaces crees** : Moyenne 2 par utilisateur
- **Personnages crees** : Moyenne 3 par utilisateur
- **Investigation Boards actifs** : >50% des utilisateurs
- **Temps moyen de session** : >15 minutes

### Metriques Techniques

- **Uptime** : >99%
- **Temps de chargement** : <3s (P95)
- **Taux d'erreur** : <1%

---

## Budget et Ressources

### Ressources Humaines

**Equipe minimale** :
- 1 Developpeur Full-Stack (vous)
- 1 Beta tester / Product Owner (vous ou collaborateur)
- [Optionnel] 1 Designer UI/UX (freelance, 5-10 jours)

### Couts d'Hebergement

**Estimations mensuelles** :
- Vercel Pro : 20 € (frontend + serverless)
- PostgreSQL (Supabase Free ou Heroku) : 0-10 €
- File storage (Cloudinary Free) : 0 €
- **Total** : ~20-30 €/mois

### Investissement Temps

**Si developpement solo a temps partiel (20h/semaine)** :
- 18 sprints × 2 semaines = 36 semaines (~9 mois)

**Si developpement solo a temps plein (40h/semaine)** :
- 18 sprints × 2 semaines / 2 = 18 semaines (~4.5 mois)

---

## Prochaines Etapes Immediates

### Etape 1 : Validation de ce MVP
- [ ] Relire et valider le perimetre
- [ ] Identifier les ajustements necessaires
- [ ] Valider les estimations

### Etape 2 : POC Investigation Board
- [ ] Creer un POC Fabric.js (1 jour)
- [ ] Valider la faisabilite technique
- [ ] Ajuster estimation si necessaire

### Etape 3 : User Stories
- [ ] Creer les user stories pour Sprint 1-2
- [ ] Utiliser le template user-story.md
- [ ] Prioriser avec MoSCoW

### Etape 4 : Setup Projet
- [ ] Initialiser repository Git
- [ ] Setup Nuxt 4 + Prisma
- [ ] Configuration CI/CD basique
- [ ] Creer le projet sur Vercel

### Etape 5 : Recrutement Beta Testeurs
- [ ] Creer formulaire Google Form
- [ ] Poster sur r/cityofmist
- [ ] Poster sur Discord City of Mist officiel
- [ ] Objectif : 50 inscriptions

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
- Traductions Otherscape a ajouter (v1.1)

### Q2 : Investigation Board ✓

**Reponse** : Reporte en v2.0 (pas dans MVP v1.0)

**Impact MVP** :
- Libere 3-4 semaines de developpement
- MVP se concentre sur gestion personnages
- Roadmap ajustee : 14-16 semaines au lieu de 18-20

**Justification** :
- Investigation Board est complexe
- Personnages LITM sont la feature core
- Permet de livrer MVP plus rapidement

### Q3 : Authentification ✓

**Reponse** : Obligatoire cote technique, optionnelle pour utilisateur

**Implementation** :
- Systeme d'auth complet dans MVP (email/password)
- Utilisateur peut naviguer sans compte (mode "guest")
- Donnees guest en localStorage
- Proposition de creation compte apres X actions
- Migration localStorage → BDD si creation compte

**Avantages** :
- Pas de friction a l'entree
- Donnees sauvegardees meme sans compte
- Incitation naturelle a creer compte (sauvegarde perenne)

### Q4 : Monetisation ✓

**Reponse** : Modele freemium avec abonnement premium

**Fonctionnalites gratuites** :
- Utilisation basique de l'outil
- 1 playspace
- Personnages illimites
- Export JSON/PDF basique
- Consultation marketplace

**Fonctionnalites premium** :
- Playspaces illimites
- **Editeur d'univers personnalise**
- **Editeur de hack personnalise**
- **Publication sur marketplace**
- Templates PDF avances
- Priorite support

**Tarification** (a definir) :
- Freemium : 0 €
- Premium : ~5-10 €/mois ou ~50-80 €/an

Voir details : `documentation/ARCHITECTURE/modele-freemium.md`

### Q5 : Juridique ✓

**Reponse** : Pas d'autorisation Son of Oak, respect des regles City of Mist Garage

**Contraintes applicables** :
- Contenu ~70% original
- Citations des sources obligatoires
- Logos et mentions legales (City of Mist Garage)
- Pas de reproduction integrale de pages officielles
- Respect des licences des repos sources (CC BY-NC-SA, MIT)
- Content warnings pour themes sensibles

**Repos sources** :
- characters-of-the-mist (CC BY-NC-SA 4.0)
- litm-player (MIT)
- investigation-board (concept, pas de code reutilise)

Voir details : `documentation/JURIDIQUE/licences-et-attributions.md`

---

**Date** : 2025-01-19
**Version** : 1.0
**Statut** : A valider
**Prochaine action** : Reponse aux questions ouvertes + validation perimetre
