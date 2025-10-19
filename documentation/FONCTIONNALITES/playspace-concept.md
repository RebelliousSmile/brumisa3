# Concept : Playspace

## Definition

Un **Playspace** est une configuration de navigation qui definit le contexte de jeu de l'utilisateur.

## Composition d'un Playspace

Un playspace est compose de :

1. **Systeme** : City of Mist OU Mist Engine
2. **Hack** : [A definir - variante du systeme ?]
3. **Univers** : [A definir - setting/monde de jeu ?]
4. **Parametres additionnels** : [A definir]

## Comportement

### Stack de Playspaces
- L'utilisateur peut avoir **plusieurs playspaces** configures
- Les playspaces sont stockes dans un **stack**
- L'utilisateur peut **naviguer** entre ses playspaces

### Contrainte d'exclusivite
- **Un seul playspace actif a la fois**
- L'utilisateur ne peut pas utiliser deux playspaces simultanement

## Parcours Utilisateur

### Premiere visite
1. L'utilisateur arrive sur le site
2. Il doit **definir un playspace** (configuration obligatoire)
3. Il choisit :
   - Son systeme (City of Mist / Mist Engine)
   - Son hack
   - Son univers
   - Ses parametres additionnels

### Utilisateur avec playspaces existants
1. L'utilisateur a deja des playspaces configures
2. Il peut **changer de playspace actif**
3. Il peut **creer un nouveau playspace**

## Questions Ouvertes

### Q1 : Qu'est-ce qu'un "Hack" ?

**Reponse** : Un hack est un systeme qui repose sur les memes mecaniques que le systeme parent, mais avec des elements differents.

**Exemples** :
- Pour **City of Mist** : changement sur les moves (actions) utilisables
- Pour **Mist Engine** : [A definir]

**Relations** :
- Un hack herite des mecaniques du systeme parent
- Un hack personnalise certains elements (moves, capacites, etc.)
- Un hack peut etre officiel ou communautaire [A confirmer]

### Q2 : Qu'est-ce qu'un "Univers" ?

**Reponse** : Un univers est le monde virtuel pour lequel on va utiliser le systeme.

**Composition d'un univers** :
- **Dangers** : menaces et adversaires du monde
- **Tropes** : themes et cliches narratifs
- **PNJs** : personnages non-joueurs
- **Listes** : listes de noms, lieux, objets, etc.
- [Autres elements a definir]

**Fonction** : L'univers definit les elements narratifs et mecaniques qui seront appliques au playspace.

### Q3 : Parametres additionnels
- Quels types de parametres ?
- Sont-ils optionnels ou obligatoires ?
- Exemples concrets ?

### Q4 : Anciens systemes JDR

**Reponse** : Les anciens systemes (Monsterhearts, Engrenages, Metro 2033, Zombiology) sont **retires completement**.

**Impact** :
- L'application se recentre exclusivement sur le Mist Engine et ses derives
- Simplification du perimetre fonctionnel
- Focus sur une experience utilisateur coherente autour du Mist Engine

### Q5 : Persistence

**Reponse** : Strategie de persistence hybride

**Par defaut** : localStorage
- Pour les utilisateurs non connectes
- Stockage local au navigateur
- Pas de synchronisation entre appareils

**Avec compte utilisateur** : Base de donnees
- Pour les utilisateurs authentifies
- Stockage centralise en BDD
- Synchronisation entre appareils
- Sauvegarde perenne

---

## User Stories

### US-PS-001 : Creation premier playspace (Lea - Joueuse Solo)
**En tant que** nouvelle utilisatrice
**Je veux** creer mon premier playspace rapidement
**Afin de** commencer a jouer immediatement

**Contexte** : Lea decouvre Brumisa3 et veut creer son premier personnage pour jouer en solo a LITM.

**Criteres d'acceptation** :
- [ ] Interface guidee affichee au premier acces
- [ ] Choix Systeme : Mist Engine ou City of Mist
- [ ] Choix Hack : Liste des hacks disponibles pour le systeme
- [ ] Choix Univers : Univers officieux ou creation custom
- [ ] Validation : Playspace cree et actif en < 60 secondes
- [ ] Message confirmation : "Votre playspace [nom] est pret"

**Exemples** :
- Lea choisit : Mist Engine > LITM > Univers "Chicago Noir"
- Playspace nomme automatiquement "LITM - Chicago Noir"
- Elle accede directement a la creation de personnage

### US-PS-002 : Basculement entre playspaces (Marc - MJ VTT)
**En tant que** MJ gerant plusieurs campagnes
**Je veux** basculer rapidement entre mes playspaces
**Afin de** gerer mes differentes tables de jeu

**Contexte** : Marc gere 3 campagnes : LITM Chicago, LITM Londres, Otherscape.

**Criteres d'acceptation** :
- [ ] Sidebar affiche la liste des playspaces (3 playspaces visibles)
- [ ] Indicateur visuel sur le playspace actif
- [ ] Clic sur un playspace : basculement instantane
- [ ] Sauvegarde automatique de l'etat avant basculement
- [ ] Toast confirmation : "Playspace [nom] active"
- [ ] Personnages du nouveau playspace charges automatiquement

**Exemples** :
- Marc clic sur "LITM - Londres" depuis "LITM - Chicago"
- L'application sauvegarde l'etat de Chicago
- Elle charge les personnages de Londres
- Temps de basculement : < 2 secondes

### US-PS-003 : Creation playspace hack personnalise (Sophie - Creatrice Hack)
**En tant que** creatrice de hack
**Je veux** creer un playspace pour mon hack custom
**Afin de** tester mes mecaniques personnalisees

**Contexte** : Sophie developpe "Cyberpunk Mist" avec moves specifiques.

**Criteres d'acceptation** :
- [ ] Option "Hack personnalise" dans la liste des hacks
- [ ] Champs personnalisables : Nom hack, description, moves
- [ ] Association au systeme parent (Mist Engine)
- [ ] Sauvegarde du hack pour reutilisation future
- [ ] Playspace cree avec le hack custom actif

**Exemples** :
- Sophie cree "Cyberpunk Mist" base sur Mist Engine
- Elle definit 5 moves personnalises
- Le playspace "Cyberpunk Mist - Neo Tokyo" est cree
- Elle peut creer des personnages avec ses moves

### US-PS-004 : Creation univers personnalise (Thomas - MJ Createur)
**En tant que** MJ creant mon propre univers
**Je veux** definir un univers avec dangers et PNJs personnalises
**Afin de** avoir un cadre narratif unique

**Contexte** : Thomas cree "Paris 1920 Occulte" pour sa campagne LITM.

**Criteres d'acceptation** :
- [ ] Option "Univers personnalise" dans la liste des univers
- [ ] Champs : Nom, description, dangers, tropes, PNJs
- [ ] Association a un systeme et un hack
- [ ] Sauvegarde univers pour reutilisation
- [ ] Oracles univers-specific accessibles dans le playspace

**Exemples** :
- Thomas cree "Paris 1920 Occulte"
- Il definit 10 dangers (Societe des Cendres, Goules des catacombes)
- Il cree 5 PNJs recurrents
- Le playspace active affiche ses oracles personnalises

## Regles Metier

### Regles de Composition
1. **Systeme obligatoire** : Mist Engine ou City of Mist (choix exclusif)
2. **Hack obligatoire** : Au moins un hack selectionne (LITM, Otherscape, custom)
3. **Univers obligatoire** : Univers officieux ou personnalise
4. **Nom unique** : Chaque playspace doit avoir un nom unique pour l'utilisateur
5. **Hierarchie** : Systeme > Hack > Univers (heritage des mecaniques)

### Regles d'Exclusivite
1. **Un seul playspace actif** : Impossible d'avoir 2 playspaces actifs simultanement
2. **Isolation complete** : Les donnees d'un playspace ne sont pas visibles depuis un autre
3. **Basculement exclusif** : Activer un playspace desactive automatiquement l'actuel

### Regles de Persistence
1. **Guest (localStorage)** :
   - Maximum 3 playspaces stockes localement
   - Pas de synchronisation inter-appareils
   - Perte de donnees si cache navigateur efface

2. **Authentifie (BDD)** :
   - Nombre illimite de playspaces
   - Synchronisation automatique multi-appareils
   - Sauvegarde perenne garantie

3. **Migration guest vers authentifie** :
   - Lors de la premiere connexion, proposer import des playspaces localStorage
   - Fusion automatique sans doublon

### Regles de Validation
1. **Creation** :
   - Nom : 3-50 caracteres, alphanumerique + espaces
   - Systeme, Hack, Univers : Selection obligatoire
   - Parametres additionnels : Optionnels

2. **Modification** :
   - Impossible de changer le systeme apres creation
   - Changement de hack : Confirmation si personnages existants
   - Changement d'univers : Oracles mis a jour automatiquement

3. **Suppression** :
   - Confirmation obligatoire si personnages existants
   - Message : "Ce playspace contient X personnages. Supprimer ?"
   - Suppression definitive (pas de corbeille MVP)

## Criteres d'Acceptation Globaux

### Fonctionnels
- [ ] Utilisateur peut creer un playspace en < 60 secondes
- [ ] Basculement entre playspaces en < 2 secondes
- [ ] Liste playspaces affiche max 10 playspaces recents
- [ ] Indicateur visuel clair sur playspace actif
- [ ] Isolation complete des donnees entre playspaces
- [ ] Migration localStorage vers BDD sans perte de donnees

### Performance
- [ ] Chargement liste playspaces : < 500ms
- [ ] Basculement playspace : < 2s (avec sauvegarde)
- [ ] Creation playspace : < 1s (validation + BDD)
- [ ] Suppression playspace : < 1s

### UX
- [ ] Onboarding : Guide creation premier playspace
- [ ] Sidebar : Acces permanent a la liste playspaces
- [ ] Toast notifications : Confirmation actions (creation, basculement, suppression)
- [ ] Responsive : Interface mobile-friendly
- [ ] Accessibilite : Navigation clavier possible

### Technique
- [ ] localStorage : Max 3 playspaces (guest)
- [ ] BDD : Relation utilisateur 1-N playspaces
- [ ] Validation Prisma : Schema strict pour integrite
- [ ] Migration : Script de migration localStorage vers BDD
- [ ] Tests : Couverture > 80% des regles metier

## Exemples Concrets

### Scenario 1 : Lea decouvre Brumisa3 (Guest)
1. Lea arrive sur brumisa3.com
2. Onboarding affiche : "Creez votre premier playspace"
3. Elle choisit : Mist Engine > LITM > Chicago Noir
4. Playspace "LITM - Chicago Noir" cree en localStorage
5. Elle accede a la creation de personnage
6. Temps total : 45 secondes

### Scenario 2 : Marc gere 3 campagnes (Authentifie)
1. Marc se connecte, il a 3 playspaces :
   - LITM - Chicago (actif)
   - LITM - Londres
   - Otherscape - Station Nexus
2. Il clic sur "LITM - Londres" dans la sidebar
3. L'application :
   - Sauvegarde l'etat de Chicago en BDD
   - Charge les donnees de Londres depuis BDD
   - Active le playspace Londres
4. Toast : "Playspace LITM - Londres active"
5. Temps de basculement : 1.8s

### Scenario 3 : Sophie cree un hack custom
1. Sophie clic "Nouveau playspace"
2. Systeme : Mist Engine
3. Hack : "Creer un hack personnalise"
4. Formulaire :
   - Nom : "Cyberpunk Mist"
   - Moves : 5 moves customs
5. Univers : "Neo Tokyo 2077" (custom)
6. Playspace cree avec hack et univers personnalises
7. Temps creation : 3 minutes (saisie des moves)

### Scenario 4 : Thomas cree univers custom
1. Thomas cree playspace "LITM - Paris 1920"
2. Univers : "Creer univers personnalise"
3. Formulaire :
   - Nom : "Paris 1920 Occulte"
   - Dangers : 10 dangers (Societe Cendres, Goules, etc.)
   - PNJs : 5 PNJs recurrents
   - Oracles custom : 3 tables d'oracles
4. Playspace cree avec oracles univers-specific
5. Dans la page oracles, il voit ses 3 tables personnalisees
6. Temps creation : 15 minutes (saisie complete)

### Scenario 5 : Migration guest vers authentifie
1. Camille a 3 playspaces en localStorage (guest)
2. Elle cree un compte Brumisa3
3. Popup : "Voulez-vous importer vos playspaces existants ?"
4. Elle accepte
5. Migration :
   - 3 playspaces localStorage vers BDD
   - Validation : Pas de doublon
   - Suppression localStorage apres migration
6. Confirmation : "3 playspaces importes avec succes"
7. Temps migration : < 5s

## Contraintes Techniques

### Architecture
- **Frontend** : Pinia store pour gestion etat playspace actif
- **Backend** : API Nitro pour CRUD playspaces
- **Database** : Schema Prisma avec relations (User 1-N Playspace 1-N Character)
- **Validation** : Zod pour validation cote client + serveur

### Performance
- **Cache** : Playspace actif en memoire (Pinia)
- **Lazy loading** : Chargement a la demande des playspaces inactifs
- **Optimistic UI** : Basculement instantane avec rollback si erreur
- **Debounce** : Sauvegarde automatique toutes les 5 secondes

### Securite
- **Authentification** : Validation token JWT pour API playspaces
- **Autorisation** : User ne peut modifier que ses propres playspaces
- **Validation** : Sanitisation des inputs (XSS prevention)
- **Rate limiting** : Max 10 creations playspaces/heure (anti-spam)

### Migrations
- **Schema BDD** :
  - Table `playspaces` : id, userId, systemId, hackId, universeId, name, isActive, createdAt
  - Table `systems` : id, name, description
  - Table `hacks` : id, systemId, name, moves[]
  - Table `universes` : id, hackId, name, dangers[], npcs[], oracles[]

- **Script migration localStorage** :
  - Detection playspaces localStorage au premier login
  - Mapping localStorage vers schema Prisma
  - Validation integrite avant migration
  - Cleanup localStorage apres succes

---

**Date** : 2025-01-19
**Version** : 1.0
**Statut** : Valide