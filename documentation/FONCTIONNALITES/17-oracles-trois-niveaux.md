# Oracles a 3 Niveaux - Systeme Hierarchique d'Inspiration

## Vue d'Ensemble

Les oracles dans Brumisa3 suivent une architecture hierarchique a 3 niveaux qui garantit une progression logique de l'inspiration generale vers le contexte narratif specifique. Cette hierarchie permet aux utilisateurs de beneficier d'oracles pertinents selon leur playspace actif.

**Principe** : Plus l'oracle est specifique, plus il est pertinent pour le contexte narratif du joueur.

**Hierarchie** : Univers > Hack > General

Lorsqu'un utilisateur consulte les oracles dans son playspace actif, il voit en priorite les oracles les plus specifiques a son contexte.

## Les 3 Niveaux d'Oracles

### Niveau 1 : Oracles Generaux (Fondation)

**Definition** : Oracles applicables a tous les systemes bases sur le Mist Engine, independamment du hack ou de l'univers.

**Caracteristiques** :
- **Portee** : Tous les playspaces Mist Engine
- **Contenu** : Mecaniques de base, inspirations narratives universelles
- **Maintenance** : Equipe Brumisa3 (Camille)
- **Acces** : Toujours visibles, priorite la plus basse

**Exemples d'oracles generaux** :
- **Complications de Scene** : Complications applicables a toute scene de jeu
- **Revelations Mystiques** : Decouvertes surnaturelles generiques
- **Twists Narratifs** : Retournements de situation universels
- **Relations Interpersonnelles** : Dynamiques entre personnages
- **Lieux Mysterieux** : Endroits etranges et inquietants

**Exemple concret** :
```
Oracle : Complications de Scene
- La tension monte : Un PNJ perd son calme (poids: 10)
- Interruption : Quelqu'un ou quelque chose arrive (poids: 15)
- Decouverte troublante : Un indice contradictoire apparait (poids: 12)
- Dilemme moral : Deux choix, aucun n'est bon (poids: 8)
```

### Niveau 2 : Oracles Hack-Specific (Specialisation)

**Definition** : Oracles adaptes aux mecaniques et themes specifiques d'un hack (LITM, Otherscape, etc.).

**Caracteristiques** :
- **Portee** : Tous les playspaces utilisant ce hack
- **Contenu** : Elements narratifs specifiques au hack, moves, themes
- **Maintenance** : Createurs de hack + communaute
- **Acces** : Visibles dans les playspaces du hack, priorite moyenne

**Exemples d'oracles LITM** :
- **Indices Mysterieux** : Decouvertes liees aux enquetes urbaines
- **Confrontations Urbaines** : Rencontres dans la ville moderne
- **Manifestations de Pouvoir** : Demonstrations surnaturelles en ville
- **Dangers du Rift** : Menaces liees au Rift (concept LITM)

**Exemple concret LITM** :
```
Oracle : Indices Mysterieux (LITM)
- Graffiti occulte : Symboles etranges sur un mur (poids: 12)
- Temoignage contradictoire : Quelqu'un a vu autre chose (poids: 15)
- Objet anachronique : Un objet qui ne devrait pas etre la (poids: 10)
- Trace surnaturelle : Empreinte, odeur, sensation etrange (poids: 18)
```

**Exemples d'oracles Otherscape** :
- **Anomalies Spatiales** : Phenomenes lies au voyage dimensionnel
- **Rencontres Extraterrestres** : Creatures d'autres dimensions
- **Technologie Alien** : Objets technologiques incomprehensibles

### Niveau 3 : Oracles Univers-Specific (Contextualisation)

**Definition** : Oracles personnalises pour un univers specifique cree par un MJ ou une communaute.

**Caracteristiques** :
- **Portee** : Un seul playspace (ou partage entre playspaces similaires)
- **Contenu** : Dangers, PNJs, lieux, factions, tropes de l'univers
- **Maintenance** : Createur de l'univers (Thomas)
- **Acces** : Visibles uniquement dans le playspace de l'univers, priorite maximale

**Exemples d'oracles univers "Paris 1920 Occulte"** :
- **Factions Occultes de Paris** : Societe des Cendres, Cercle de Montmartre, Goules des Catacombes
- **Lieux Hantes de Paris** : Opera Garnier, Catacombes, Pere Lachaise, Sacre-Coeur
- **PNJs Recurrents** : Madame Laveau (medium), Inspecteur Moreau, Le Fantome du Metro
- **Dangers Parisiens** : Brumes toxiques, Apparitions, Complots aristocratiques

**Exemple concret Paris 1920** :
```
Oracle : Factions Occultes de Paris
- Societe des Cendres : Alchimistes cherchant la Pierre Philosophale (poids: 15)
- Cercle de Montmartre : Artistes maudits peignant l'avenir (poids: 12)
- Goules des Catacombes : Creatures se nourrissant des morts (poids: 18)
- Ordre de la Rose Noire : Nobles conspirant pour le retour de la monarchie (poids: 10)
```

## User Stories

### US-OR-001 : Consultation oracles par niveau (Lea - Joueuse Solo)
**En tant que** joueuse solo
**Je veux** voir les oracles pertinents pour mon playspace
**Afin de** avoir une inspiration contextuelle pour ma partie

**Contexte** : Lea joue LITM dans l'univers "Chicago Noir". Elle veut tirer un oracle pour savoir ce qui se passe dans la scene actuelle.

**Criteres d'acceptation** :
- [ ] Page oracles affiche 3 sections : Univers, Hack, Generaux
- [ ] Oracles univers "Chicago Noir" en premier (priorite max)
- [ ] Oracles LITM en second (priorite moyenne)
- [ ] Oracles generaux Mist Engine en dernier (priorite basse)
- [ ] Badge visuel indique le niveau de chaque oracle
- [ ] Nombre d'oracles par niveau affiche (ex: "5 oracles univers")

**Exemples** :
- Lea voit "Factions de Chicago" (univers) avant "Indices Mysterieux" (LITM)
- Elle voit "Indices Mysterieux" (LITM) avant "Complications de Scene" (general)
- Total : 8 oracles univers + 12 oracles LITM + 20 oracles generaux

### US-OR-002 : Creation oracle univers (Thomas - MJ Createur)
**En tant que** MJ createur d'univers
**Je veux** creer des oracles specifiques a mon univers
**Afin de** enrichir le contexte narratif de ma campagne

**Contexte** : Thomas cree l'univers "Paris 1920 Occulte" et veut ajouter des oracles personnalises.

**Criteres d'acceptation** :
- [ ] Interface "Creer oracle univers" accessible depuis le playspace
- [ ] Champs : Nom oracle, description, categorie (faction, lieu, PNJ, danger)
- [ ] Ajout d'elements avec poids personnalises
- [ ] Preview du tirage avant sauvegarde
- [ ] Oracle sauvegarde et visible uniquement dans ce playspace
- [ ] Option "Partager oracle" pour le rendre public (v2.0)

**Exemples** :
- Thomas cree "Factions Occultes de Paris" avec 8 factions
- Il attribue des poids selon l'importance narrative
- Il teste le tirage : 10 tirages pour valider la distribution
- Oracle sauvegarde, visible dans son playspace "LITM - Paris 1920"

### US-OR-003 : Utilisation oracle hack-specific (Marc - MJ VTT)
**En tant que** MJ utilisant LITM
**Je veux** acceder aux oracles LITM depuis n'importe quel univers LITM
**Afin de** beneficier d'inspiration coherente avec les mecaniques du hack

**Contexte** : Marc a 2 playspaces LITM (Chicago, Londres). Il veut utiliser les oracles LITM dans les deux.

**Criteres d'acceptation** :
- [ ] Oracles LITM visibles dans playspace "LITM - Chicago"
- [ ] Oracles LITM visibles dans playspace "LITM - Londres"
- [ ] Oracles LITM non visibles dans playspace "Otherscape"
- [ ] Badge "LITM" sur les oracles hack-specific
- [ ] Filtre "Afficher uniquement oracles LITM" disponible

**Exemples** :
- Marc bascule vers "LITM - Londres", voit les memes oracles LITM
- Il bascule vers "Otherscape", ne voit plus les oracles LITM
- Il voit les oracles Otherscape a la place

### US-OR-004 : Hierarchie automatique (Sophie - Creatrice Hack)
**En tant que** creatrice de hack
**Je veux** que mes oracles hack-specific soient prioritaires sur les generaux
**Afin de** offrir une experience coherente aux joueurs de mon hack

**Contexte** : Sophie cree le hack "Cyberpunk Mist" avec des oracles specifiques.

**Criteres d'acceptation** :
- [ ] Oracles Cyberpunk Mist affiches avant oracles generaux
- [ ] Indication visuelle de la hierarchie (couleurs, badges)
- [ ] Possibilite de masquer les oracles generaux
- [ ] Stats d'utilisation : Oracles hack > Oracles generaux
- [ ] Documentation : Expliquer la hierarchie aux joueurs

**Exemples** :
- Sophie cree "Corporations Cyberpunk" (hack-specific)
- Les joueurs de Cyberpunk Mist voient cet oracle en priorite
- Les oracles generaux restent accessibles mais en second plan

## Regles Metier

### Regles de Hierarchie
1. **Priorite affichage** : Univers > Hack > General
2. **Heritage** : Un oracle hack herite des regles generales
3. **Surcharge** : Un oracle univers peut surcharger un oracle hack ou general
4. **Isolation** : Un oracle univers n'est jamais visible hors de son playspace

### Regles de Visibilite
1. **Oracles generaux** : Visibles dans tous les playspaces Mist Engine
2. **Oracles hack** : Visibles uniquement dans les playspaces utilisant ce hack
3. **Oracles univers** : Visibles uniquement dans le playspace de l'univers
4. **Filtre automatique** : L'application filtre les oracles selon le playspace actif

### Regles de Creation
1. **Oracles generaux** : Reserves aux administrateurs (Camille)
2. **Oracles hack** : Createurs de hack + communaute (v2.0)
3. **Oracles univers** : Tous les utilisateurs authentifies
4. **Validation** :
   - Nom : 3-100 caracteres
   - Elements : Minimum 4, maximum 100
   - Poids : Entre 1 et 100 par element
   - Total poids : Somme > 0

### Regles de Modification
1. **Oracles officiels** : Non modifiables par les utilisateurs
2. **Oracles personnalises** : Modifiables uniquement par le createur
3. **Oracles partages** : Modifiables avec versioning (v2.0)
4. **Suppression** : Confirmation obligatoire, impact sur playspaces affiche

### Regles de Partage (v2.0)
1. **Par defaut** : Oracle univers prive
2. **Partage volontaire** : Createur peut rendre public
3. **Fork communautaire** : Utilisateurs peuvent forker et modifier
4. **Attribution** : Createur original toujours mentionne

## Criteres d'Acceptation Globaux

### Fonctionnels
- [ ] Affichage hierarchique : Univers > Hack > General
- [ ] Filtrage automatique selon playspace actif
- [ ] Creation oracle univers pour utilisateurs authentifies
- [ ] Badges visuels : "Univers", "LITM", "General"
- [ ] Compteurs : Nombre d'oracles par niveau
- [ ] Recherche : Filtrer par nom, niveau, categorie

### Performance
- [ ] Chargement oracles : < 500ms (max 200 oracles)
- [ ] Filtrage par playspace : < 100ms
- [ ] Creation oracle : < 1s (validation + BDD)
- [ ] Tirage oracle : < 200ms (algorithme pondere)

### UX
- [ ] Organisation visuelle claire : 3 sections distinctes
- [ ] Indicateur priorite : Oracles univers en haut
- [ ] Collapse/expand : Masquer/afficher sections
- [ ] Responsive : Interface mobile-friendly
- [ ] Accessibilite : Navigation clavier, lecteurs d'ecran

### Technique
- [ ] Schema BDD : Table `oracles` avec champ `level` (general, hack, univers)
- [ ] Relations : Oracle -> Hack (nullable), Oracle -> Univers (nullable)
- [ ] Indexation : Index sur `level`, `hackId`, `universeId`
- [ ] Validation : Contrainte unicite (nom, level, hackId/universeId)
- [ ] Tests : Couverture > 80% regles hierarchie

## Exemples Concrets

### Scenario 1 : Lea consulte oracles (LITM - Chicago Noir)
1. Lea ouvre la page oracles depuis son playspace "LITM - Chicago Noir"
2. L'application affiche :
   - **Section Univers** (6 oracles) :
     - Factions de Chicago
     - Lieux Emblematiques de Chicago
     - PNJs Recurrents Chicago
     - Dangers Urbains Chicago
     - Rumeurs de Rue
     - Indices Locaux
   - **Section LITM** (12 oracles) :
     - Indices Mysterieux
     - Confrontations Urbaines
     - Manifestations de Pouvoir
     - Dangers du Rift
     - [8 autres oracles LITM]
   - **Section General** (20 oracles) :
     - Complications de Scene
     - Revelations Mystiques
     - Twists Narratifs
     - [17 autres oracles generaux]
3. Total : 38 oracles accessibles, tries par pertinence

### Scenario 2 : Thomas cree oracle univers (Paris 1920)
1. Thomas ouvre son playspace "LITM - Paris 1920 Occulte"
2. Il clic "Creer oracle univers"
3. Formulaire :
   - Nom : "Factions Occultes de Paris"
   - Description : "Organisations secretes operant a Paris en 1920"
   - Categorie : "Faction"
4. Ajout elements :
   - Societe des Cendres (poids: 15)
   - Cercle de Montmartre (poids: 12)
   - Goules des Catacombes (poids: 18)
   - Ordre de la Rose Noire (poids: 10)
   - Les Nephilim (poids: 8)
5. Preview : 20 tirages de test
6. Sauvegarde : Oracle cree, visible dans section "Univers"
7. Temps total : 5 minutes

### Scenario 3 : Marc bascule entre playspaces
1. Marc est dans "LITM - Chicago", voit 38 oracles
2. Il bascule vers "LITM - Londres"
3. Oracles affiches :
   - **Section Univers** (4 oracles Londres specifiques)
   - **Section LITM** (12 oracles - identiques a Chicago)
   - **Section General** (20 oracles - identiques a Chicago)
4. Total : 36 oracles (moins d'oracles univers que Chicago)
5. Il bascule vers "Otherscape - Station Nexus"
6. Oracles affiches :
   - **Section Univers** (8 oracles Station Nexus)
   - **Section Otherscape** (15 oracles Otherscape)
   - **Section General** (20 oracles - identiques)
7. Les oracles LITM ont disparu, remplaces par Otherscape

### Scenario 4 : Sophie cree oracles hack Cyberpunk Mist
1. Sophie cree le hack "Cyberpunk Mist"
2. Elle accede a l'interface admin hack (permissions speciales)
3. Elle cree 10 oracles hack-specific :
   - Corporations
   - Quartiers Cyberpunk
   - Technologie Cybernetique
   - Gangs de Rue
   - Programmes IA
   - [5 autres]
4. Ces oracles sont lies au hack "Cyberpunk Mist"
5. Tous les playspaces utilisant Cyberpunk Mist voient ces oracles
6. Les playspaces LITM ou Otherscape ne les voient pas

### Scenario 5 : Hierarchie en action (Camille - Admin)
1. Camille cree un oracle general "Complications de Scene"
2. Sophie cree un oracle LITM "Complications Urbaines" (surcharge)
3. Thomas cree un oracle univers "Complications Paris 1920" (surcharge)
4. Dans le playspace "LITM - Paris 1920" :
   - "Complications Paris 1920" apparait en premier (univers)
   - "Complications Urbaines" apparait en second (hack)
   - "Complications de Scene" apparait en dernier (general)
5. L'utilisateur peut choisir le niveau de specificite desire

## MVP vs v2.0+

### MVP v1.0 - Oracles Fixes Hierarchiques

**Fonctionnalites incluses** :
- [x] Oracles generaux : 20 oracles Mist Engine
- [x] Oracles LITM : 12 oracles LITM-specific
- [x] Affichage hierarchique : 3 sections
- [x] Filtrage automatique par playspace
- [x] Badges visuels niveau oracle
- [x] Tirage pondere par niveau

**Fonctionnalites exclues** :
- [ ] Creation oracles univers par utilisateurs (MVP limite)
- [ ] Modification oracles existants
- [ ] Partage communautaire oracles
- [ ] Fork oracles officiels
- [ ] Oracles en cascade

**Criteres succes MVP** :
- [ ] 80% des utilisateurs comprennent la hierarchie
- [ ] 60% utilisent majoritairement oracles univers/hack vs generaux
- [ ] < 2s pour afficher les oracles filtres
- [ ] 0% d'erreur affichage oracles selon playspace

### v1.2 - Creation Oracles Univers

**Fonctionnalites ajoutees** :
- [ ] Interface creation oracle univers
- [ ] CRUD oracles personnalises
- [ ] Partage oracles entre playspaces (meme utilisateur)
- [ ] Export/import oracles JSON
- [ ] Stats utilisation oracles

### v2.0 - Ecosysteme Collaboratif

**Fonctionnalites ajoutees** :
- [ ] Partage public oracles univers
- [ ] Fork oracles communautaires
- [ ] Votes et classement oracles
- [ ] Oracles hack-specific communautaires
- [ ] Marketplace oracles premium
- [ ] API publique oracles

## Contraintes Techniques

### Schema BDD
```sql
Table oracles {
  id: UUID PRIMARY KEY
  name: VARCHAR(100) NOT NULL
  description: TEXT
  level: ENUM('general', 'hack', 'univers') NOT NULL
  hackId: UUID NULLABLE (FK -> hacks.id)
  universeId: UUID NULLABLE (FK -> universes.id)
  categoryId: UUID (FK -> oracle_categories.id)
  isPublic: BOOLEAN DEFAULT false
  createdBy: UUID (FK -> users.id)
  createdAt: TIMESTAMP
  updatedAt: TIMESTAMP
}

Table oracle_elements {
  id: UUID PRIMARY KEY
  oracleId: UUID (FK -> oracles.id)
  value: TEXT NOT NULL
  weight: INTEGER DEFAULT 10
  metadata: JSONB
  order: INTEGER
}

Constraints:
- UNIQUE(name, level, hackId, universeId)
- CHECK(level = 'general' -> hackId IS NULL AND universeId IS NULL)
- CHECK(level = 'hack' -> hackId IS NOT NULL AND universeId IS NULL)
- CHECK(level = 'univers' -> universeId IS NOT NULL)
```

### Performance
- **Index** : (level, hackId, universeId) pour filtrage rapide
- **Cache** : Oracles generaux et hack en cache Redis (TTL 1h)
- **Lazy loading** : Oracles univers charges a la demande
- **Pagination** : Max 50 oracles affiches par page

### Securite
- **Autorisation** : User ne peut modifier que ses oracles univers
- **Validation** : Sanitisation inputs (XSS prevention)
- **Rate limiting** : Max 10 creations oracles/heure
- **Moderation** : Oracles publics moderes a posteriori (v2.0)

---

**Date** : 2025-01-19
**Version** : 1.0
**Statut** : Valide
