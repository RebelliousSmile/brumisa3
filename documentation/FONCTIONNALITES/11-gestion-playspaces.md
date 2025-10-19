# Gestion des Playspaces - CRUD et Navigation

## Vue d'Ensemble

La gestion des playspaces permet aux utilisateurs de creer, consulter, modifier et supprimer leurs configurations de jeu. Chaque playspace represente un contexte de jeu unique (Systeme + Hack + Univers) et l'utilisateur peut naviguer librement entre ses playspaces avec un seul actif a la fois.

**Principe fondamental** : Un playspace est un environnement isole. Basculer entre playspaces change completement le contexte de l'application (personnages, oracles, parametres).

**Operations CRUD** :
- **Create** : Creer un nouveau playspace
- **Read** : Consulter la liste et les details d'un playspace
- **Update** : Modifier un playspace existant
- **Delete** : Supprimer un playspace

## User Stories

### US-GP-001 : Creer un playspace (Lea - Joueuse Solo)
**En tant que** nouvelle utilisatrice
**Je veux** creer mon premier playspace facilement
**Afin de** commencer a jouer rapidement

**Contexte** : Lea arrive sur Brumisa3 pour la premiere fois et veut creer son premier personnage LITM.

**Criteres d'acceptation** :
- [ ] Bouton "Creer un playspace" visible sur la page d'accueil
- [ ] Formulaire guide avec 4 etapes : Systeme, Hack, Univers, Nom
- [ ] Validation en temps reel des champs obligatoires
- [ ] Preview du playspace avant creation
- [ ] Message confirmation : "Playspace [nom] cree avec succes"
- [ ] Redirection automatique vers creation de personnage
- [ ] Temps total < 60 secondes

**Exemples** :
```
Etape 1 : Choisir Systeme
- [ ] Mist Engine
- [x] City of Mist

Etape 2 : Choisir Hack
- [x] LITM
- [ ] Otherscape
- [ ] Creer hack personnalise

Etape 3 : Choisir Univers
- [x] Chicago Noir (officieux)
- [ ] Londres Victorien (officieux)
- [ ] Creer univers personnalise

Etape 4 : Nommer playspace
Nom : "LITM - Chicago Noir" (suggestion automatique)

=> Playspace cree, actif, pret a l'emploi
```

### US-GP-002 : Consulter liste playspaces (Marc - MJ VTT)
**En tant que** MJ gerant plusieurs campagnes
**Je veux** voir la liste de mes playspaces avec details
**Afin de** identifier rapidement celui dont j'ai besoin

**Contexte** : Marc a 5 playspaces actifs pour differentes tables de jeu.

**Criteres d'acceptation** :
- [ ] Sidebar affiche liste playspaces (max 10 recents)
- [ ] Chaque playspace affiche : Nom, Hack, Nombre personnages
- [ ] Indicateur visuel sur playspace actif (badge "Actif")
- [ ] Ordre : Playspace actif en premier, puis par date modification
- [ ] Bouton "Voir tous" si > 10 playspaces
- [ ] Recherche : Filtrer par nom ou hack

**Exemples** :
```
Sidebar Playspaces (Marc)
----------------------
[x] LITM - Chicago (actif)
    12 personnages | Derniere modif: Il y a 2h

[ ] LITM - Londres
    8 personnages | Derniere modif: Il y a 1 jour

[ ] Otherscape - Station Nexus
    5 personnages | Derniere modif: Il y a 3 jours

[ ] LITM - Neo Tokyo
    3 personnages | Derniere modif: Il y a 1 semaine

[ ] City of Mist - Berlin
    15 personnages | Derniere modif: Il y a 2 semaines

[Voir tous les playspaces (5)]
```

### US-GP-003 : Basculer entre playspaces (Marc - MJ VTT)
**En tant que** MJ gerant plusieurs campagnes
**Je veux** basculer rapidement entre mes playspaces
**Afin de** preparer differentes sessions de jeu

**Contexte** : Marc prepare sa session de ce soir (Londres) mais veut verifier un personnage de Chicago.

**Criteres d'acceptation** :
- [ ] Clic sur un playspace dans la sidebar : basculement instantane
- [ ] Sauvegarde automatique de l'etat du playspace actuel avant basculement
- [ ] Chargement des donnees du nouveau playspace (personnages, oracles)
- [ ] URL mise a jour : /playspace/[id] ou /playspace/[slug]
- [ ] Toast confirmation : "Playspace [nom] active"
- [ ] Temps de basculement < 2 secondes
- [ ] Rollback automatique si erreur de chargement

**Exemples** :
```
Scenario : Marc bascule Chicago -> Londres

1. Marc est dans "LITM - Chicago" (12 personnages charges)
2. Il clic "LITM - Londres" dans la sidebar
3. L'application :
   - Sauvegarde l'etat de Chicago (personnages ouverts, filtres)
   - Desactive Chicago
   - Active Londres
   - Charge les 8 personnages de Londres
   - Charge les oracles Londres-specific
   - Met a jour l'URL : /playspace/litm-londres
4. Toast : "Playspace LITM - Londres active"
5. Temps ecoule : 1.6s
```

### US-GP-004 : Modifier un playspace (Sophie - Creatrice Hack)
**En tant que** creatrice de hack
**Je veux** modifier mon playspace pour ajuster mes parametres
**Afin de** tester differentes variantes de mon hack

**Contexte** : Sophie teste "Cyberpunk Mist" et veut ajouter des moves personnalises.

**Criteres d'acceptation** :
- [ ] Bouton "Modifier playspace" dans les parametres
- [ ] Formulaire pre-rempli avec donnees actuelles
- [ ] Champs modifiables : Nom, Hack, Univers, Parametres
- [ ] Champ Systeme non modifiable (grise)
- [ ] Validation : Si personnages existent, confirmation avant changement hack
- [ ] Message avertissement : "Changer de hack peut affecter X personnages"
- [ ] Sauvegarde et toast confirmation

**Exemples** :
```
Scenario : Sophie modifie Cyberpunk Mist

1. Sophie ouvre "Cyberpunk Mist - Neo Tokyo"
2. Elle clic "Modifier playspace"
3. Formulaire affiche :
   - Systeme : Mist Engine (non modifiable)
   - Hack : Cyberpunk Mist (custom)
   - Univers : Neo Tokyo 2077 (custom)
   - Nom : "Cyberpunk Mist - Neo Tokyo"
4. Elle modifie le hack :
   - Ajout 2 nouveaux moves
   - Modification ponderation moves existants
5. Confirmation : "3 personnages utilisent ce hack. Continuer ?"
6. Elle valide
7. Toast : "Playspace mis a jour. Verifiez vos personnages."
```

### US-GP-005 : Supprimer un playspace (Thomas - MJ Createur)
**En tant que** MJ terminant une campagne
**Je veux** supprimer un playspace devenu inutile
**Afin de** garder ma liste organisee

**Contexte** : Thomas a termine sa campagne "Paris 1920" et veut la supprimer.

**Criteres d'acceptation** :
- [ ] Bouton "Supprimer playspace" dans les parametres (rouge)
- [ ] Si personnages existent : Confirmation obligatoire
- [ ] Modal confirmation affiche :
   - Nom du playspace
   - Nombre de personnages
   - Warning : "Cette action est irreversible"
- [ ] Checkbox "Je confirme la suppression de X personnages"
- [ ] Si playspace actif : Basculement automatique vers un autre
- [ ] Toast confirmation : "Playspace [nom] supprime"

**Exemples** :
```
Scenario : Thomas supprime Paris 1920

1. Thomas ouvre "LITM - Paris 1920 Occulte"
2. Il clic "Supprimer playspace" (bouton rouge)
3. Modal confirmation :
   "Supprimer le playspace LITM - Paris 1920 Occulte ?

   Ce playspace contient 15 personnages.
   Cette action est irreversible.

   [x] Je confirme la suppression de 15 personnages

   [Annuler] [Supprimer definitivement]"

4. Thomas coche la checkbox et clic "Supprimer"
5. L'application :
   - Supprime les 15 personnages
   - Supprime le playspace
   - Bascule vers "LITM - Londres" (playspace precedent)
6. Toast : "Playspace LITM - Paris 1920 Occulte supprime"
```

### US-GP-006 : Dupliquer un playspace (Camille - Administratrice)
**En tant qu'** administratrice
**Je veux** dupliquer un playspace pour creer une variante
**Afin de** tester differentes configurations sans perdre l'original

**Contexte** : Camille veut creer "LITM - Chicago v2" base sur "LITM - Chicago".

**Criteres d'acceptation** :
- [ ] Bouton "Dupliquer" dans les options du playspace
- [ ] Modal : Nouveau nom obligatoire
- [ ] Option : "Dupliquer aussi les personnages" (checkbox)
- [ ] Creation playspace avec memes parametres
- [ ] Si duplication personnages : Copie avec suffixe " (copie)"
- [ ] Toast confirmation : "Playspace duplique : [nouveau nom]"

**Exemples** :
```
Scenario : Camille duplique Chicago

1. Camille ouvre "LITM - Chicago" (12 personnages)
2. Elle clic "Dupliquer playspace"
3. Modal :
   "Nouveau nom : LITM - Chicago v2
   [x] Dupliquer aussi les 12 personnages"
4. Elle valide
5. L'application :
   - Cree "LITM - Chicago v2" avec memes parametres
   - Copie les 12 personnages (noms + " (copie)")
   - Active le nouveau playspace
6. Toast : "Playspace duplique : LITM - Chicago v2"
```

## Regles Metier

### Regles de Creation
1. **Nom unique** : Pas deux playspaces avec meme nom pour un utilisateur
2. **Champs obligatoires** : Systeme, Hack, Univers, Nom
3. **Validation nom** : 3-50 caracteres, alphanumerique + espaces et tirets
4. **Auto-suggestion** : Nom suggere automatiquement = "[Hack] - [Univers]"
5. **Premier playspace** : Automatiquement actif a la creation
6. **Limite guest** : Max 3 playspaces en localStorage
7. **Limite authentifie** : Illimite en BDD

### Regles de Consultation
1. **Ordre affichage** : Actif en premier, puis par date modification DESC
2. **Pagination** : Max 10 playspaces dans sidebar, "Voir tous" pour le reste
3. **Recherche** : Filtrer par nom, hack, univers
4. **Details affiches** : Nom, Hack, Nombre personnages, Derniere modification
5. **Indicateur actif** : Badge vert "Actif" sur le playspace en cours

### Regles de Modification
1. **Systeme non modifiable** : Impossible de changer apres creation
2. **Hack modifiable** : Avec confirmation si personnages existants
3. **Univers modifiable** : Sans confirmation (impact uniquement oracles)
4. **Nom modifiable** : Validation unicite
5. **Sauvegarde automatique** : Debounce 5 secondes sur modifications

### Regles de Basculement
1. **Un seul actif** : Activer un playspace desactive l'actuel automatiquement
2. **Sauvegarde auto** : Etat du playspace actuel sauvegarde avant basculement
3. **Chargement complet** : Nouveau playspace charge avec personnages et oracles
4. **Rollback** : Si erreur chargement, retour au playspace precedent
5. **Performance** : Basculement optimiste (UI instantanee, validation async)

### Regles de Suppression
1. **Confirmation obligatoire** : Toujours demander confirmation
2. **Warning personnages** : Afficher nombre de personnages impactes
3. **Checkbox validation** : Si personnages, checkbox "Je confirme" obligatoire
4. **Suppression cascade** : Supprimer tous les personnages du playspace
5. **Basculement auto** : Si playspace actif supprime, basculer vers le precedent
6. **Irreversible** : Pas de corbeille MVP (suppression definitive)

### Regles de Duplication
1. **Nom unique** : Nouveau nom obligatoire et unique
2. **Option personnages** : Checkbox pour dupliquer ou non les personnages
3. **Suffixe copie** : Personnages dupliques avec " (copie)" dans le nom
4. **Activation auto** : Nouveau playspace devient actif apres duplication
5. **Preservation liens** : Oracles et parametres copies a l'identique

## Interface Utilisateur

### Sidebar Playspaces

**Emplacement** : Gauche de l'ecran, collapsible

**Contenu** :
```
+---------------------------+
| Mes Playspaces            |
+---------------------------+
| [+] Nouveau playspace     |
+---------------------------+
| [x] LITM - Chicago        | <- Actif (badge vert)
|     12 persos | 2h        |
+---------------------------+
| [ ] LITM - Londres        |
|     8 persos | 1j         |
+---------------------------+
| [ ] Otherscape - Nexus    |
|     5 persos | 3j         |
+---------------------------+
| [Voir tous (5)]           |
+---------------------------+
```

**Actions** :
- Clic sur un playspace : Basculement
- Hover : Afficher boutons "Modifier", "Dupliquer", "Supprimer"
- Drag & drop : Reordonner (v2.0)

### Formulaire Creation Playspace

**Etapes** :
```
Etape 1/4 : Choisir un systeme
------------------------------
( ) Mist Engine
(x) City of Mist

[Suivant]

Etape 2/4 : Choisir un hack
----------------------------
(x) LITM
( ) Otherscape
( ) Creer hack personnalise

[Precedent] [Suivant]

Etape 3/4 : Choisir un univers
-------------------------------
(x) Chicago Noir (officieux)
( ) Londres Victorien (officieux)
( ) Creer univers personnalise

[Precedent] [Suivant]

Etape 4/4 : Nommer votre playspace
-----------------------------------
Nom : [LITM - Chicago Noir        ]
      (suggestion automatique)

[Precedent] [Creer playspace]
```

### Modal Modification Playspace

```
+---------------------------------------+
| Modifier le playspace                 |
+---------------------------------------+
| Systeme : Mist Engine (non modifiable)|
| Hack    : [LITM              v]       |
| Univers : [Chicago Noir      v]       |
| Nom     : [LITM - Chicago           ] |
+---------------------------------------+
| [Annuler] [Enregistrer modifications] |
+---------------------------------------+
```

### Modal Suppression Playspace

```
+---------------------------------------+
| Supprimer le playspace                |
+---------------------------------------+
| LITM - Paris 1920 Occulte             |
|                                       |
| Ce playspace contient 15 personnages. |
| Cette action est irreversible.        |
|                                       |
| [x] Je confirme la suppression de     |
|     15 personnages                    |
+---------------------------------------+
| [Annuler] [Supprimer definitivement]  |
+---------------------------------------+
```

## Criteres d'Acceptation Globaux

### Fonctionnels
- [ ] Creation playspace en < 60 secondes (4 etapes)
- [ ] Basculement playspace en < 2 secondes
- [ ] Modification playspace sans perte de donnees
- [ ] Suppression playspace avec confirmation obligatoire
- [ ] Duplication playspace avec option personnages
- [ ] Liste playspaces triee par pertinence (actif en premier)
- [ ] Recherche playspaces par nom/hack/univers

### Performance
- [ ] Chargement liste playspaces : < 500ms
- [ ] Basculement playspace : < 2s (sauvegarde + chargement)
- [ ] Creation playspace : < 1s (validation + BDD)
- [ ] Modification playspace : < 1s
- [ ] Suppression playspace : < 1s
- [ ] Duplication playspace : < 3s (avec personnages)

### UX
- [ ] Onboarding : Guide creation premier playspace
- [ ] Sidebar : Toujours accessible, collapsible
- [ ] Toast notifications : Confirmation toutes actions
- [ ] Indicateurs visuels : Badge "Actif", nombre personnages
- [ ] Formulaires : Validation temps reel
- [ ] Responsive : Mobile-friendly
- [ ] Accessibilite : Navigation clavier, ARIA labels

### Securite
- [ ] Authentification : Validation token pour API playspaces
- [ ] Autorisation : User ne peut modifier que ses playspaces
- [ ] Validation : Sanitisation inputs (XSS prevention)
- [ ] Rate limiting : Max 10 creations/heure
- [ ] Logs : Tracer toutes operations CRUD

### Technique
- [ ] Schema BDD : Table playspaces avec relations (User 1-N Playspace)
- [ ] API Nitro : Routes CRUD (/api/playspaces)
- [ ] Pinia store : Gestion etat playspace actif
- [ ] Validation : Zod schemas client + serveur
- [ ] Tests : Couverture > 80% regles metier

## Exemples Concrets

### Scenario 1 : Lea cree son premier playspace (Guest)
```
Timeline : Creation playspace LITM

00:00 - Lea arrive sur brumisa3.com
00:05 - Onboarding : "Creez votre premier playspace"
00:10 - Etape 1 : Selection Mist Engine
00:15 - Etape 2 : Selection LITM
00:25 - Etape 3 : Selection Chicago Noir
00:35 - Etape 4 : Validation nom "LITM - Chicago Noir"
00:45 - Playspace cree en localStorage
00:50 - Redirection vers creation personnage
00:55 - Toast : "Playspace LITM - Chicago Noir cree"

Total : 55 secondes
```

### Scenario 2 : Marc bascule entre 5 playspaces (Authentifie)
```
Timeline : Basculement playspaces

[Etat initial]
- Playspace actif : LITM - Chicago (12 persos charges)
- Sidebar : 5 playspaces visibles

[00:00] Marc clic "LITM - Londres"
[00:00-00:50] Sauvegarde etat Chicago en BDD
[00:50-01:20] Chargement donnees Londres depuis BDD
[01:20-01:60] Activation Londres + mise a jour UI
[01:80] Toast : "Playspace LITM - Londres active"

Total : 1.8s
```

### Scenario 3 : Sophie modifie son hack Cyberpunk Mist
```
Timeline : Modification playspace

[00:00] Sophie ouvre "Cyberpunk Mist - Neo Tokyo"
[00:05] Clic "Modifier playspace"
[00:10] Formulaire affiche donnees actuelles
[00:30] Sophie ajoute 2 nouveaux moves au hack
[01:45] Elle modifie le nom en "Cyberpunk Mist v2"
[02:00] Clic "Enregistrer modifications"
[02:05] Validation : "3 personnages utilisent ce hack. Continuer ?"
[02:10] Sophie valide
[02:15] Sauvegarde en BDD
[02:20] Toast : "Playspace mis a jour"

Total : 2.2s (dont 1m45 saisie utilisateur)
```

### Scenario 4 : Thomas supprime Paris 1920 termine
```
Timeline : Suppression playspace

[00:00] Thomas ouvre "LITM - Paris 1920 Occulte"
[00:05] Clic "Supprimer playspace"
[00:10] Modal confirmation affiche
[00:15] Thomas lit le warning : "15 personnages"
[00:20] Il coche "Je confirme la suppression"
[00:25] Clic "Supprimer definitivement"
[00:30] Suppression BDD (playspace + 15 persos)
[00:80] Basculement vers "LITM - Londres"
[00:95] Toast : "Playspace supprime"

Total : 0.95s
```

### Scenario 5 : Camille duplique Chicago pour test
```
Timeline : Duplication playspace

[00:00] Camille ouvre "LITM - Chicago" (12 persos)
[00:05] Clic "Dupliquer playspace"
[00:10] Modal : Saisie "LITM - Chicago v2"
[00:15] Checkbox : "Dupliquer aussi les 12 personnages"
[00:20] Clic "Dupliquer"
[00:25-02:50] Creation playspace + copie 12 persos
[02:50-02:80] Activation nouveau playspace
[02:95] Toast : "Playspace duplique : LITM - Chicago v2"

Total : 2.95s
```

## Contraintes Techniques

### Architecture Frontend

**Pinia Store** :
```typescript
// stores/playspace.ts
interface PlayspaceState {
  current: Playspace | null
  list: Playspace[]
  loading: boolean
  error: string | null
}

interface Playspace {
  id: string
  userId: string
  systemId: string
  hackId: string
  universeId: string
  name: string
  isActive: boolean
  charactersCount: number
  createdAt: Date
  updatedAt: Date
}

actions: {
  fetchPlayspaces()
  createPlayspace(data)
  updatePlayspace(id, data)
  deletePlayspace(id)
  switchPlayspace(id)
  duplicatePlayspace(id, options)
}
```

**Validation Zod** :
```typescript
const playspaceSchema = z.object({
  name: z.string().min(3).max(50),
  systemId: z.string().uuid(),
  hackId: z.string().uuid(),
  universeId: z.string().uuid(),
})
```

### Architecture Backend

**API Routes Nitro** :
```
GET    /api/playspaces           -> Liste playspaces user
POST   /api/playspaces           -> Creer playspace
GET    /api/playspaces/:id       -> Details playspace
PUT    /api/playspaces/:id       -> Modifier playspace
DELETE /api/playspaces/:id       -> Supprimer playspace
POST   /api/playspaces/:id/switch -> Basculer vers playspace
POST   /api/playspaces/:id/duplicate -> Dupliquer playspace
```

**Schema Prisma** :
```prisma
model Playspace {
  id          String   @id @default(uuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  systemId    String
  system      System   @relation(fields: [systemId], references: [id])
  hackId      String
  hack        Hack     @relation(fields: [hackId], references: [id])
  universeId  String
  universe    Universe @relation(fields: [universeId], references: [id])
  name        String
  isActive    Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  characters  Character[]

  @@unique([userId, name])
  @@index([userId, isActive])
}
```

### Performance

**Cache** :
- Playspace actif : Pinia store (memoire)
- Liste playspaces : Cache 5 minutes
- Invalidation : A chaque CRUD operation

**Optimizations** :
- Lazy loading : Personnages charges a la demande
- Optimistic UI : Basculement instantane, rollback si erreur
- Debounce : Sauvegarde auto toutes les 5s
- Pagination : Max 10 playspaces sidebar, load more pour le reste

### Migrations

**localStorage vers BDD** :
```typescript
// Migration au premier login
async function migrateGuestPlayspaces(userId: string) {
  const guestPlayspaces = localStorage.getItem('playspaces')
  if (!guestPlayspaces) return

  const playspaces = JSON.parse(guestPlayspaces)

  for (const ps of playspaces) {
    await createPlayspace({
      ...ps,
      userId,
    })
  }

  localStorage.removeItem('playspaces')
}
```

---

**Date** : 2025-01-19
**Version** : 1.0
**Statut** : Valide
