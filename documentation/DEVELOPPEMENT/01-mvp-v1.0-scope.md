# Scope MVP v1.0 - Brumisa3
## Source de Verite Unique - Roadmap et Perimetre

**Date**: 2025-01-20
**Version**: 1.0
**Statut**: Valide

---

## Philosophie du MVP

**Objectif**: Livrer la version minimale qui permet aux utilisateurs de **creer et gerer leurs personnages Legends in the Mist en mode solo**.

**Principe MoSCoW**:
- **Must Have**: Fonctionnalites critiques pour le MVP v1.0
- **Should Have**: Important mais reportable en v1.x
- **Could Have**: Souhaitable pour v2.0+
- **Won't Have**: Hors perimetre initial

---

## Perimetre MVP v1.0

### Vision Utilisateur

```
Utilisateur arrive sur Brumisa3
    ↓
Cree un playspace (Systeme Mist Engine + Hack LITM + Univers)
    ↓
Cree son personnage Legends in the Mist
    ├── Theme Cards (Power/Weakness tags)
    ├── Hero Card (Relations, Quintessences)
    └── Trackers (Status, Story Tags, Story Themes)
    ↓
Sauvegarde son avancement (localStorage ou BDD avec compte)
    ↓
Exporte ses donnees (JSON)
```

**Note importante**: L'Investigation Board n'est PAS dans le MVP v1.0 (voir section "Hors Perimetre MVP").

---

## DANS le MVP v1.0

### 1. Systeme Playspace (P0 - 2 semaines)

**Fonctionnalites**:
- Creer un playspace avec selection:
  - Systeme: Mist Engine
  - Hack: Legends in the Mist (priorite) + Otherscape
  - Univers: Univers par defaut pour chaque hack
- Sauvegarder en localStorage (mode guest)
- Basculer entre playspaces (illimites)
- Supprimer un playspace
- Si compte utilisateur: synchroniser avec BDD PostgreSQL

**Justification**: Le playspace est le contexte unique de travail, source de verite pour le systeme/hack.

---

### 2. Gestion Personnages LITM (P0 - 4 semaines)

**Fonctionnalites**:
- CRUD complet personnages Legends in the Mist
- Informations de base (nom, description, avatar)
- **Theme Cards**:
  - Types: Origin, Adventure, Greatness, Fellowship, Backpack
  - Power tags et Weakness tags
  - Attention (progression)
  - Milestones LITM
- **Hero Card**:
  - Relations (avec autres personnages ou PNJs)
  - Quintessences (revelations du personnage)
- **Trackers**:
  - Status tracker (conditions temporaires)
  - Story tag tracker (tags narratifs)
  - Story theme tracker (themes d'histoire)

**Justification**: Core feature de Brumisa3, permet de jouer en mode solo avec personnages complets.

---

### 3. Authentification (P0 - 2 semaines)

**Fonctionnalites**:
- Connexion email/password (@sidebase/nuxt-auth)
- Inscription
- Deconnexion
- Profil utilisateur basique
- **Mode guest**: Utilisation sans compte (localStorage)
- Migration donnees guest → BDD si creation compte

**Justification**: Auth obligatoire cote technique mais optionnelle pour l'utilisateur (friction minimale).

---

### 4. UI/UX Base (P0 - 2 semaines)

**Fonctionnalites**:
- Layout principal:
  - Header avec navigation
  - Sidebar pour switcher playspace
  - Zone de contenu principale
- Page d'accueil avec wizard creation premier playspace
- Page personnages (liste + formulaires creation/edition)
- Responsive: Desktop uniquement
- Theme: Clair uniquement (dark mode v1.1)

**Justification**: Interface minimale pour rendre l'application utilisable.

---

### 5. Export Donnees (P0 - 3 jours)

**Fonctionnalites**:
- Export personnage en JSON (format standard reutilisable)

**Justification**: Permet sauvegarde externe et partage entre utilisateurs.

---

## HORS du MVP v1.0

### Investigation Board → v2.0 (4-5 semaines)

**Decision finale**: L'Investigation Board est **reporte a la version 2.0**.

**Raisons**:
1. **Complexite elevee**: Canvas interactif (Fabric.js/Konva.js), nodes, connexions, drag & drop
2. **Pas critique**: Les personnages LITM sont la feature core, Investigation Board est un "nice to have"
3. **Gain de temps**: Libere 4 semaines de developpement pour livrer MVP plus rapidement
4. **Validation utilisateurs**: Le MVP permet de valider l'interet avant d'investir dans l'Investigation Board

**Fonctionnalites reportees**:
- Canvas interactif
- Notes texte et photo
- Connexions entre elements
- Generation automatique depuis personnages
- Export PNG
- Mode collaboratif (v2.5 avec multi-joueurs)

**Sera implemente en v2.0** (apres validation MVP et feedback utilisateurs).

---

### Autres Fonctionnalites Reportees

#### Export PDF → v2.0
- **Raison**: PDFKit complexe, JSON suffit pour MVP
- **Fonctionnalites**: Generation PDF fiche personnage, templates personnalises

#### Oracles Customs → v1.2+
- **Raison**: MVP a oracles fixes integres
- **Fonctionnalites**: Edition oracles personnalises, oracles par univers

#### Systeme de Jets → v1.3
- **Raison**: Mecanique de jeu avancee, pas bloquante pour gestion personnages
- **Fonctionnalites**: Jets de des 2d6, selection tags/statuts, historique, Quick Roll

#### Drawer System → v1.4
- **Raison**: Organisation avancee, pas critique pour debut
- **Fonctionnalites**: Dossiers/fichiers, drag & drop multi-personnages

#### Undo/Redo → v1.1
- **Raison**: Amelioration UX nice-to-have
- **Fonctionnalites**: Historique modifications avec VueUse

#### Mode Multi-Joueurs → v2.5
- **Raison**: Mode solo prioritaire, infrastructure WebSocket complexe
- **Fonctionnalites**: Sessions temps reel, Investigation Board collaboratif, chat

---

## Roadmap d'Implementation

### Phase 1: Fondations (2 semaines)
```
Sprint 1-2
├── Setup Nuxt 4 + Prisma + PostgreSQL
├── Schema Prisma MVP (9 tables)
├── Migration initiale
├── Authentification @sidebase/nuxt-auth
│   ├── Mode guest (localStorage)
│   └── Mode compte (BDD)
└── Layout base UnoCSS
```

### Phase 2: Playspaces (2 semaines)
```
Sprint 3-4
├── CRUD Playspaces (API routes Nitro)
├── Store Pinia playspace
├── Composants Vue
│   ├── PlayspaceCard.vue
│   ├── PlayspaceForm.vue
│   └── PlayspaceSwitcher.vue
└── Tests E2E Playwright (6 tests)
```

### Phase 3: Characters LITM (4 semaines)
```
Sprint 5-8
├── CRUD Characters (API routes)
├── Store Pinia character
├── Composants Character
│   ├── CharacterCard.vue
│   ├── CharacterForm.vue
│   ├── CharacterList.vue
│   └── CharacterDetail.vue
├── Theme Cards CRUD
│   ├── ThemeCardForm.vue
│   ├── ThemeCardDisplay.vue
│   └── TagList.vue
├── Hero Card CRUD
│   ├── HeroCardForm.vue
│   ├── RelationshipList.vue
│   └── QuintessenceList.vue
├── Trackers CRUD
│   ├── StatusTracker.vue
│   ├── StoryTagTracker.vue
│   └── StoryThemeTracker.vue
└── Tests E2E Playwright (18 tests)
```

### Phase 4: Polish & Export (2 semaines)
```
Sprint 9-10
├── Export JSON personnages
├── Validation Zod complete
├── Messages erreur UX
├── Loading states
├── Tests E2E complets (24 tests)
└── Documentation utilisateur
```

**Total MVP v1.0**: 10 semaines (2.5 mois)

---

## Estimations Detaillees

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
| Export JSON | Faible | 3 jours | P0 |
| Tests & Debug | - | 2 sem | P0 |
| **TOTAL MVP** | - | **10 sem** | - |

**Gain vs version avec Investigation Board**: -4 semaines

---

## Versions Futures (Post-MVP)

### v1.1 - Ameliorations UX (2-3 semaines)
- Dark mode
- Mobile responsive
- Undo/Redo pour personnages
- Raccourcis clavier basiques
- Tutoriel interactif (onboarding)

### v1.2 - Support Otherscape Complet (2-3 semaines)
- Traductions Otherscape (FR/EN)
- Modeles specifiques Otherscape (Essence, Noise)
- Oracles customs par univers

### v1.3 - Systeme de Jets (2 semaines)
- Jets de des 2d6 avec API route securisee
- Selection tags/statuts avec modificateurs
- Historique des jets
- Quick Roll

### v1.4 - Drawer System (2-3 semaines)
- Organisation multi-personnages avec dossiers
- Drag & drop entre personnages
- Fichiers et organisation

### v1.5 - Systeme de Dons (1 semaine)
- Integration OpenCollective
- Page "Soutenir le projet"
- Banniere discrete avec appel aux dons
- Reconnaissance sponsors

### v2.0 - Investigation Board (4-5 semaines)
- Canvas interactif (Konva.js recommande)
- Notes texte et photo
- Drag & drop
- Connexions entre notes
- Sauvegarde/Chargement (localStorage + BDD)
- Export PNG
- Generation notes depuis personnages
- Mode solo fonctionnel

### v2.1 - Editeur d'Univers Personnalise (3-4 semaines)
- Creer univers personnalise
- Definir dangers, tropes, PNJs
- Listes personnalisees (noms, lieux)
- Publication marketplace (gratuit)

### v2.2 - Editeur de Hacks (4-5 semaines)
- Creer hack personnalise
- Definir moves custom
- Personnaliser mecaniques
- Publication marketplace (gratuit)

### v2.3 - Marketplace Communautaire
- Publier hacks/univers (gratuit pour tous)
- Parcourir contenus communautaires
- Notation et commentaires
- Fork de hacks

### v2.5 - Mode Multi-Joueurs (6-8 semaines)
- Infrastructure WebSocket Nitro
- Sessions de jeu temps reel
- Investigation Board collaboratif
- Chat temps reel
- Lanceur de des synchronise

### v3.0 - Integration VTT
- API Foundry VTT
- API Roll20
- Synchronisation bidirectionnelle

---

## Hypotheses et Risques

### Hypotheses Critiques

1. **Les utilisateurs veulent un outil solo avant multi-joueurs**
   - Validation: Sondage communaute City of Mist
   - Risque: Si faux, le MVP ne repond pas au besoin

2. **Legends in the Mist est le hack prioritaire**
   - Validation: Analyse discussions communautaires
   - Risque: Peut-etre City of Mist vanilla plus demande

3. **Investigation Board peut attendre v2.0**
   - Validation: Characters-of-the-mist existe sans Investigation Board
   - Risque: Feature differentiatrice manquante au lancement

4. **Mode guest (localStorage) est acceptable**
   - Validation: Roll20 fonctionne sans compte
   - Risque: Perte de donnees si localStorage vide

### Risques Techniques

| Risque | Impact | Probabilite | Mitigation |
|--------|--------|-------------|------------|
| Complexite Theme Cards LITM | Moyen | Moyenne | POC avec 1 theme avant sprint complet |
| Limite localStorage (5-10MB) | Moyen | Faible | Compression JSON, alertes utilisateur |
| Performance basculement playspace | Faible | Moyenne | Cache IndexedDB, lazy loading |
| Migration localStorage → BDD | Moyen | Moyenne | Tests E2E complets, validation donnees |

### Risques Projet

| Risque | Impact | Probabilite | Mitigation |
|--------|--------|-------------|------------|
| Derive du perimetre (scope creep) | Eleve | Elevee | Definition stricte MVP, revues sprint |
| Manque feedback utilisateurs | Moyen | Moyenne | Recrutement beta testeurs tot (Sprint 5) |
| Complexite sous-estimee LITM | Moyen | Moyenne | Buffer de 2 semaines dans planning |

---

## Metriques de Succes Post-Lancement

### Metriques d'Adoption
- **Objectif 3 mois**: 500 utilisateurs inscrits
- **Objectif 6 mois**: 2000 utilisateurs inscrits
- **Taux de retention (1 mois)**: >40%

### Metriques d'Engagement
- **Playspaces crees**: Moyenne 2 par utilisateur
- **Personnages crees**: Moyenne 3 par utilisateur
- **Temps moyen de session**: >15 minutes
- **Taux de conversion guest → compte**: >30%

### Metriques Techniques
- **Uptime**: >99%
- **Temps de chargement**: <3s (P95)
- **Taux d'erreur**: <1%
- **Performance basculement playspace**: <2s

---

## Budget et Ressources

### Ressources Humaines
- 1 Developpeur Full-Stack (solo)
- 1 Beta tester / Product Owner (vous ou collaborateur)
- [Optionnel] 1 Designer UI/UX (freelance, 5-10 jours)

### Couts d'Hebergement (estimations mensuelles)
- Vercel Pro: 20 € (frontend + serverless)
- PostgreSQL (Supabase Free ou Heroku): 0-10 €
- File storage (Cloudinary Free): 0 €
- **Total**: ~20-30 €/mois

### Investissement Temps
- **Temps partiel (20h/semaine)**: 20 semaines (~5 mois)
- **Temps plein (40h/semaine)**: 10 semaines (~2.5 mois)

---

## Decision Strategiques Clarifiees

### Q1: Hacks Supportes
**Reponse**: LITM (priorite P0) + Otherscape (P1)

**Actions**:
- Modeles Prisma supportent multi-hacks via playspace
- LITM focus MVP v1.0
- Otherscape complet en v1.2

### Q2: Investigation Board
**Reponse**: Reporte en v2.0 (PAS dans MVP v1.0)

**Justification**:
- Complexite elevee (4-5 semaines)
- Pas critique pour gestion personnages
- Permet livraison MVP plus rapide
- Validation utilisateurs avant investissement

### Q3: Authentification
**Reponse**: Obligatoire cote technique, optionnelle pour utilisateur

**Implementation**:
- Mode guest par defaut (localStorage)
- Incitation creation compte apres 3 personnages
- Migration donnees automatique

### Q4: Monetisation
**Reponse**: 100% gratuit avec systeme de dons

**Raison**: Alignement esprit communautaire City of Mist Garage

### Q5: Juridique
**Reponse**: Respect regles City of Mist Garage, pas d'autorisation Son of Oak necessaire

**Contraintes**:
- Contenu ~70% original
- Citations sources obligatoires
- Logos et mentions legales

---

## Prochaines Etapes Immediates

### Etape 1: Validation de ce Scope
- [ ] Relire et valider le perimetre
- [ ] Confirmer Investigation Board hors MVP
- [ ] Valider estimations

### Etape 2: Setup Projet
- [ ] Initialiser repository Git
- [ ] Setup Nuxt 4 + Prisma
- [ ] Configuration CI/CD basique
- [ ] Creer projet sur Vercel

### Etape 3: User Stories Sprint 1-2
- [ ] Creer user stories Fondations
- [ ] Prioriser avec MoSCoW
- [ ] Estimer en story points

### Etape 4: Recrutement Beta Testeurs
- [ ] Creer formulaire Google Form
- [ ] Poster sur r/cityofmist
- [ ] Poster sur Discord City of Mist officiel
- [ ] Objectif: 50 inscriptions

---

**Maintenu par**: Technical Owner
**Frequence mise a jour**: Fin de chaque sprint
**Prochaine revision**: Fin Sprint 2 (Fondations)