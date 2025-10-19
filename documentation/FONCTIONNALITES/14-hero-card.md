# Hero Card LITM

## Vue d'Ensemble
Hero Card optionnelle pour personnages LITM avec relations (3-5 recommandées) et quintessences (1-3). Relation 1-1 avec Character, peut être ajoutée à tout moment pendant l'évolution du personnage.

## User Stories

### US-140 : Créer une Hero Card
**En tant que** Léa
**Je veux** créer une Hero Card pour mon personnage
**Afin de** définir ses relations et ses quintessences narratives

**Contexte** : Aria a maintenant 3 Theme Cards, Léa veut approfondir sa dimension humaine avec une Hero Card.

**Critères d'acceptation** :
- [ ] Bouton "Ajouter Hero Card" visible si personnage n'en a pas
- [ ] Formulaire avec relations (3-5 recommandées) et quintessences (1-3)
- [ ] Hero Card optionnelle, pas obligatoire pour jouer
- [ ] Création immédiate, pas de brouillon
- [ ] Relation 1-1 stricte avec Character

**Exemples** :
```
Léa sur /characters/aria-uuid/edit
→ Section "Hero Card" affiche "Aucune Hero Card"
→ Bouton [+ Créer Hero Card]
→ Clique "Créer Hero Card"
→ Modal ou page dédiée
→ Formulaire relations + quintessences
→ Clique "Créer"
→ Hero Card créée en < 500ms
→ Bouton "Créer Hero Card" remplacé par "Modifier Hero Card"
```

### US-141 : Définir les relations
**En tant que** Léa
**Je veux** créer 3 à 5 relations pour mon personnage
**Afin de** ancrer Aria dans un réseau social narratif

**Contexte** : Léa crée la Hero Card d'Aria et définit ses proches.

**Critères d'acceptation** :
- [ ] Minimum 3 relations recommandées (suggestion UX, pas bloquant)
- [ ] Maximum 5 relations (validation bloquante)
- [ ] Chaque relation : nom (requis), description (optionnel), type (optionnel)
- [ ] Types prédéfinis : Ami, Famille, Rival, Amour, Mentor, Protégé, Collègue, Ennemi
- [ ] Possibilité de créer 0 relation (Hero Card vide valide)
- [ ] Édition inline des relations

**Exemples** :
```
Hero Card - Relations (3/5)

1. Nom: "Kael Nightshade"
   Type: [Mentor v]
   Description: "Ancien Shadow Dancer qui a formé Aria"
   [Modifier] [Supprimer]

2. Nom: "Lyra Brightflame"
   Type: [Rival v]
   Description: "Maître du feu, opposée à la philosophie d'Aria"
   [Modifier] [Supprimer]

3. Nom: "Marcus le Forgeron"
   Type: [Ami v]
   Description: "Ami d'enfance sans pouvoirs"
   [Modifier] [Supprimer]

[+ Ajouter relation] (max 5)
```

### US-142 : Définir les quintessences
**En tant que** Léa
**Je veux** définir 1 à 3 quintessences pour Aria
**Afin de** capturer l'essence narrative du personnage

**Contexte** : Léa veut résumer les motivations profondes d'Aria en phrases courtes.

**Critères d'acceptation** :
- [ ] Minimum 1 quintessence recommandée (pas bloquant)
- [ ] Maximum 3 quintessences (validation bloquante)
- [ ] Format texte libre, longueur 10-100 caractères
- [ ] Exemples suggérés : "Protéger les faibles", "Maîtriser la brume", "Venger sa famille"
- [ ] Possibilité de créer 0 quintessence (Hero Card vide valide)
- [ ] Édition inline

**Exemples** :
```
Hero Card - Quintessences (2/3)

1. "Protéger ceux qui ne peuvent se défendre"
   [Modifier] [Supprimer]

2. "Maîtriser la brume mieux que quiconque"
   [Modifier] [Supprimer]

[+ Ajouter quintessence] (max 3)
```

### US-143 : Modifier la Hero Card
**En tant que** Léa
**Je veux** modifier les relations et quintessences
**Afin de** faire évoluer la dimension humaine d'Aria

**Contexte** : Après 3 sessions de jeu, une relation a changé de nature (Ami → Amour).

**Critères d'acceptation** :
- [ ] Édition inline de chaque relation et quintessence
- [ ] Ajout/Suppression relations (respectant 0-5)
- [ ] Ajout/Suppression quintessences (respectant 0-3)
- [ ] Sauvegarde automatique toutes les 30s
- [ ] Validation temps réel

**Exemples** :
```
Léa clique [Modifier] sur relation "Marcus le Forgeron"
→ Type: Ami → Amour
→ Description mise à jour
→ Sauvegarde auto après 30s
→ Message: "Relation mise à jour"

Léa ajoute 4ème relation
→ Nom: "Elena Swiftblade"
→ Type: Collègue
→ Description: "Aventurière rencontrée en mission"
→ 4/5 relations
→ Bouton [+ Ajouter relation] toujours visible
```

### US-144 : Supprimer la Hero Card
**En tant que** Léa
**Je veux** supprimer complètement la Hero Card
**Afin de** recommencer à zéro ou simplifier le personnage

**Contexte** : Léa veut repartir sur une nouvelle Hero Card avec relations différentes.

**Critères d'acceptation** :
- [ ] Bouton "Supprimer Hero Card" visible
- [ ] Modal de confirmation avec détails (nombre relations, quintessences)
- [ ] Suppression définitive (pas de soft delete en MVP)
- [ ] Bouton "Créer Hero Card" réapparaît après suppression
- [ ] Personnage reste valide sans Hero Card

**Exemples** :
```
Léa clique "Supprimer Hero Card"
→ Modal:
   "Supprimer la Hero Card ?
    3 relations et 2 quintessences seront supprimées.
    Cette action est irréversible."
→ Clique "Confirmer"
→ Suppression en < 300ms
→ Message: "Hero Card supprimée"
→ Section affiche "Aucune Hero Card - [+ Créer]"
```

## Modèle de Données

### Structure Hero Card
```typescript
interface HeroCard {
  id: string;              // UUID v4
  characterId: string;     // FK vers Character (1-1)
  relations: Relation[];   // Array 0-5 relations
  quintessences: string[]; // Array 0-3 strings
  createdAt: Date;
  updatedAt: Date;
}

interface Relation {
  id: string;              // UUID v4 (pour édition inline)
  name: string;            // 2-100 caractères
  type?: RelationType;     // Optionnel
  description?: string;    // Max 500 caractères
}

enum RelationType {
  Ami = "Ami",
  Famille = "Famille",
  Rival = "Rival",
  Amour = "Amour",
  Mentor = "Mentor",
  Protege = "Protégé",
  Collegue = "Collègue",
  Ennemi = "Ennemi"
}
```

### Relations
```
Character (1) ←→ (0..1) HeroCard
HeroCard.relations = JSON Array[0..5]
HeroCard.quintessences = JSON Array[0..3]
```

## Règles Métier

### Optionnalité
1. **Hero Card optionnelle** : Un personnage peut jouer sans Hero Card (uniquement Theme Cards)
2. **Peut être ajoutée plus tard** : Hero Card peut être créée après création du personnage
3. **Suppression non bloquante** : Supprimer la Hero Card ne rend pas le personnage invalide

### Relations
1. **Minimum 3 recommandées** : Suggestion UX "Ajoutez au moins 3 relations pour enrichir le personnage" (pas bloquant)
2. **Maximum 5 relations** : Validation stricte, bouton "Ajouter relation" désactivé si 5 atteintes
3. **Relations vides autorisées** : Hero Card peut être créée avec 0 relation (évolution progressive)
4. **Types prédéfinis** : 8 types proposés, champ optionnel (relation peut n'avoir pas de type)
5. **Descriptions optionnelles** : Nom obligatoire, description et type optionnels

### Quintessences
1. **Minimum 1 recommandée** : Suggestion UX "Définissez au moins 1 quintessence" (pas bloquant)
2. **Maximum 3 quintessences** : Validation stricte
3. **Longueur 10-100 caractères** : Phrases courtes et percutantes
4. **Quintessences vides autorisées** : Hero Card peut avoir 0 quintessence

### Validation et Sauvegarde
1. **Sauvegarde automatique** : Toutes les 30s pendant édition
2. **Validation serveur** : Zod validation côté API (longueurs, limites)
3. **Relation 1-1 stricte** : Un Character ne peut avoir qu'une seule Hero Card
4. **Unicité relation** : Validation nom unique dans Hero Card (pas 2 relations "Marcus")

## Interface Utilisateur

### Section Hero Card (Aucune)
```
+--------------------------------------------------+
|  HERO CARD                                       |
+--------------------------------------------------+
|                                                  |
|  Aucune Hero Card définie                        |
|                                                  |
|  Ajoutez une Hero Card pour définir les          |
|  relations et quintessences de votre personnage. |
|                                                  |
|  [+ Créer Hero Card]                             |
|                                                  |
+--------------------------------------------------+
```

### Section Hero Card (Existante)
```
+--------------------------------------------------+
|  HERO CARD                      [Modifier] [X]   |
+--------------------------------------------------+
|                                                  |
|  Relations (3/5)                 [+ Ajouter]     |
|  +--------------------------------------------+  |
|  | Kael Nightshade              [Mentor]      |  |
|  | Ancien Shadow Dancer qui a formé Aria      |  |
|  | [Modifier] [Supprimer]                     |  |
|  +--------------------------------------------+  |
|  | Lyra Brightflame             [Rival]       |  |
|  | Maître du feu, opposée à Aria              |  |
|  | [Modifier] [Supprimer]                     |  |
|  +--------------------------------------------+  |
|  | Marcus le Forgeron           [Ami]         |  |
|  | Ami d'enfance sans pouvoirs                |  |
|  | [Modifier] [Supprimer]                     |  |
|  +--------------------------------------------+  |
|                                                  |
|  Quintessences (2/3)             [+ Ajouter]     |
|  +--------------------------------------------+  |
|  | "Protéger ceux qui ne peuvent se défendre" |  |
|  | [Modifier] [Supprimer]                     |  |
|  +--------------------------------------------+  |
|  | "Maîtriser la brume mieux que quiconque"   |  |
|  | [Modifier] [Supprimer]                     |  |
|  +--------------------------------------------+  |
|                                                  |
+--------------------------------------------------+
```

### Modal Ajout Relation
```
+--------------------------------------------------+
|  Ajouter une relation                       [X]  |
+--------------------------------------------------+
|                                                  |
|  Nom de la relation *                            |
|  [_______________________________]               |
|  2-100 caractères                                |
|                                                  |
|  Type (optionnel)                                |
|  [Sélectionnez un type v]                        |
|  Ami, Famille, Rival, Amour, Mentor, Protégé...  |
|                                                  |
|  Description (optionnel)                         |
|  [_______________________________]               |
|  [_______________________________]               |
|  Max 500 caractères                              |
|                                                  |
|  [Annuler]  [Ajouter]                            |
+--------------------------------------------------+
```

### Modal Ajout Quintessence
```
+--------------------------------------------------+
|  Ajouter une quintessence                   [X]  |
+--------------------------------------------------+
|                                                  |
|  Quintessence *                                  |
|  [_______________________________]               |
|  10-100 caractères                               |
|                                                  |
|  Exemples :                                      |
|  - "Protéger les innocents"                      |
|  - "Découvrir la vérité sur mon passé"           |
|  - "Devenir le meilleur Shadow Dancer"           |
|                                                  |
|  [Annuler]  [Ajouter]                            |
+--------------------------------------------------+
```

## Critères d'Acceptation Globaux

### Fonctionnel
- [ ] Création Hero Card optionnelle, pas obligatoire
- [ ] Ajout 0-5 relations avec nom, type, description
- [ ] Ajout 0-3 quintessences (10-100 caractères)
- [ ] Modification inline relations et quintessences
- [ ] Suppression Hero Card avec confirmation
- [ ] Relation 1-1 stricte avec Character

### Performance
- [ ] Création Hero Card : < 500ms
- [ ] Ajout relation : < 200ms
- [ ] Ajout quintessence : < 200ms
- [ ] Modification inline : < 200ms (sauvegarde auto après 2s inactivité)
- [ ] Suppression Hero Card : < 300ms

### UX
- [ ] Suggestions UX "Ajoutez au moins 3 relations" (pas bloquant)
- [ ] Compteurs visuels (3/5 relations, 2/3 quintessences)
- [ ] Badges colorés pour types de relations
- [ ] Messages d'erreur clairs si validation échoue
- [ ] Sauvegarde automatique avec feedback "Sauvegardé il y a Xs"

### Technique
- [ ] Prisma HeroCard model avec JSON columns pour relations et quintessences
- [ ] Validation Zod côté serveur (relations array[0..5], quintessences array[0..3])
- [ ] Contrainte unique sur HeroCard.characterId (1-1)
- [ ] Suppression cascade : DELETE Character → DELETE HeroCard
- [ ] API routes : POST /api/characters/:id/hero-card, PATCH /api/hero-cards/:id, DELETE /api/hero-cards/:id

## Exemples Concrets

### Parcours Léa : Création Hero Card pour Aria (Timeline)

**Jour 4 - 16h00** : Décision d'ajouter Hero Card
```
Léa a créé Aria avec 3 Theme Cards
→ Veut approfondir dimension humaine
→ Page /characters/aria-uuid/edit
→ Section "Hero Card" : "Aucune Hero Card"
→ Clique [+ Créer Hero Card]
→ Modal ou page dédiée
```

**Jour 4 - 16h05** : Ajout première relation
```
Léa dans formulaire Hero Card
→ Relations (0/5)
→ Clique [+ Ajouter relation]
→ Modal:
   Nom: "Kael Nightshade"
   Type: Mentor
   Description: "Ancien Shadow Dancer, a formé Aria pendant 5 ans"
→ Clique "Ajouter"
→ Relation ajoutée en 180ms
→ Relations (1/5)
→ Suggestion UX: "Ajoutez au moins 3 relations"
```

**Jour 4 - 16h10** : Ajout relations 2 et 3
```
Léa ajoute:
2. Lyra Brightflame (Rival) - "Maître du feu, philosophie opposée"
3. Marcus le Forgeron (Ami) - "Ami d'enfance sans pouvoirs"

→ Relations (3/5)
→ Suggestion UX disparaît (minimum recommandé atteint)
```

**Jour 4 - 16h15** : Ajout quintessences
```
Léa clique [+ Ajouter quintessence]
→ "Protéger ceux qui ne peuvent se défendre"
→ Quintessence ajoutée (1/3)

Ajoute 2ème quintessence:
→ "Maîtriser la brume mieux que quiconque"
→ Quintessences (2/3)
```

**Jour 4 - 16h20** : Sauvegarde Hero Card
```
Léa clique "Créer Hero Card"
→ Création en 420ms
→ Message: "Hero Card créée !"
→ Redirection vers /characters/aria-uuid/edit
→ Section "Hero Card" affiche relations et quintessences
→ Bouton "Créer Hero Card" remplacé par "Modifier" et "Supprimer"
```

**Jour 8 - 14h00** : Modification relation (évolution narrative)
```
Après 3 sessions de jeu
→ Relation "Marcus" évolue : Ami → Amour
→ Léa clique [Modifier] sur relation Marcus
→ Change type: Ami → Amour
→ Description mise à jour: "Ami d'enfance devenu plus important"
→ Sauvegarde auto après 30s
→ Message: "Relation mise à jour"
```

**Jour 10 - 20h00** : Ajout 4ème et 5ème relations
```
Léa veut ajouter nouvelles relations après campagne
→ Ajoute:
   4. Elena Swiftblade (Collègue) - "Aventurière alliée"
   5. Baron Vordak (Ennemi) - "Cherche à capturer Aria"
→ Relations (5/5)
→ Bouton [+ Ajouter relation] désactivé
→ Tooltip: "Maximum 5 relations"
```

**Jour 15 - 10h00** : Suppression Hero Card (reset)
```
Léa veut recommencer avec nouveau contexte narratif
→ Clique "Supprimer Hero Card"
→ Modal:
   "Supprimer la Hero Card ?
    5 relations et 2 quintessences seront supprimées."
→ Clique "Confirmer"
→ Suppression en 280ms
→ Message: "Hero Card supprimée"
→ Section affiche "Aucune Hero Card - [+ Créer]"
→ Aria reste valide (Theme Cards suffisent)
```

## Contraintes Techniques

### Prisma HeroCard Model (suggestion)
```prisma
model HeroCard {
  id            String   @id @default(uuid())
  characterId   String   @unique // 1-1 relation
  relations     Json     // Array de Relation objects
  quintessences String[] // Array de strings
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  character     Character @relation(fields: [characterId], references: [id], onDelete: Cascade)

  @@index([characterId])
}
```

### Validation Zod (exemple)
```typescript
const relationSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2, "Minimum 2 caractères").max(100, "Maximum 100 caractères"),
  type: z.enum([
    "Ami", "Famille", "Rival", "Amour", "Mentor", "Protégé", "Collègue", "Ennemi"
  ]).optional(),
  description: z.string().max(500, "Maximum 500 caractères").optional(),
});

const heroCardSchema = z.object({
  characterId: z.string().uuid(),
  relations: z.array(relationSchema).max(5, "Maximum 5 relations"),
  quintessences: z.array(
    z.string().min(10, "Minimum 10 caractères").max(100, "Maximum 100 caractères")
  ).max(3, "Maximum 3 quintessences"),
});
```

### Validation Business (exemple)
```typescript
// Vérifier qu'un Character n'a pas déjà une Hero Card
const validateUniqueHeroCard = async (characterId: string) => {
  const existing = await prisma.heroCard.findUnique({
    where: { characterId }
  });
  if (existing) {
    throw new Error("Ce personnage a déjà une Hero Card");
  }
};

// Vérifier unicité des noms de relations
const validateUniqueRelationNames = (relations: Relation[]) => {
  const names = relations.map(r => r.name.toLowerCase());
  const uniqueNames = new Set(names);
  if (names.length !== uniqueNames.size) {
    throw new Error("Les noms de relations doivent être uniques");
  }
};
```

### Composables Vue (suggestion)
```typescript
// composables/useHeroCard.ts
export const useHeroCard = () => {
  const heroCard = ref<HeroCard | null>(null);

  const addRelation = (relation: Relation) => {
    if (!heroCard.value) return;
    if (heroCard.value.relations.length >= 5) {
      throw new Error("Maximum 5 relations");
    }
    heroCard.value.relations.push(relation);
  };

  const removeRelation = (relationId: string) => {
    if (!heroCard.value) return;
    const index = heroCard.value.relations.findIndex(r => r.id === relationId);
    if (index !== -1) {
      heroCard.value.relations.splice(index, 1);
    }
  };

  const addQuintessence = (quintessence: string) => {
    if (!heroCard.value) return;
    if (heroCard.value.quintessences.length >= 3) {
      throw new Error("Maximum 3 quintessences");
    }
    heroCard.value.quintessences.push(quintessence);
  };

  // ... autres méthodes

  return { heroCard, addRelation, removeRelation, addQuintessence };
};
```

## Scope MVP vs Versions Futures

### MVP v1.0
- CRUD Hero Card optionnelle
- Relations (0-5) avec nom, type, description
- Quintessences (0-3) texte libre
- Types prédéfinis (8 types)
- Édition inline
- Sauvegarde automatique
- Validation temps réel

### v1.2
- Suggestions relations basées sur univers de jeu
- Historique évolution relations (timeline narrative)
- Relations réciproques (si 2 personnages dans même playspace)
- Quintessences avec catégories (Motivation, Peur, Désir)

### v2.0+
- Relations partagées entre personnages (réseau social)
- Générateur IA de relations basé sur Theme Cards
- Visualisation graphe de relations (network graph)
- Export Hero Card vers outils tiers (World Anvil, Notion)

---
**Date** : 2025-01-19
**Version** : 1.0
**Statut** : Validé
**Priorité** : P0 (MVP)
**Références** : LITM rulebook (Hero Card concept), litm-player (structure), characters-of-the-mist (format JSON)