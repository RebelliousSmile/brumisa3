# Theme Cards LITM

## Vue d'Ensemble
Système de Theme Cards pour Legends in the Mist avec types Mythos/Logos, Power tags (3-5) et Weakness tags (1-2). Chaque personnage doit avoir 2-4 Theme Cards pour être jouable selon les règles LITM.

## User Stories

### US-130 : Créer une Theme Card
**En tant que** Léa
**Je veux** créer une Theme Card avec titre, type et tags
**Afin de** définir les pouvoirs et faiblesses de mon personnage

**Contexte** : Léa édite Aria et veut ajouter la Theme Card "Shadow Dancer" (Mythos).

**Critères d'acceptation** :
- [ ] Formulaire de création avec : titre (requis), description (optionnel), type Mythos/Logos (requis)
- [ ] Ajout Power tags : minimum 3, maximum 5
- [ ] Ajout Weakness tags : minimum 1, maximum 2
- [ ] Validation temps réel du nombre de tags
- [ ] Theme Card liée automatiquement au personnage actuel
- [ ] Sauvegarde immédiate après création

**Exemples** :
```
Léa sur /characters/aria-uuid/edit
→ Section "Theme Cards (2/4)"
→ Clique [+ Ajouter Theme Card]
→ Modal ou expansion inline:
   Titre: "Shadow Dancer"
   Type: [Mythos v]
   Description: "Aria peut manipuler les ombres..."

   Power tags (3-5):
   1. "Walk through shadows"
   2. "Blend into darkness"
   3. "See in pitch black"
   [+ Ajouter tag] (max 5)

   Weakness tags (1-2):
   1. "Vulnerable in bright light"
   [+ Ajouter tag] (max 2)

→ Clique "Sauvegarder"
→ Theme Card créée en < 500ms
→ Affichée dans liste Theme Cards d'Aria
```

### US-131 : Modifier une Theme Card existante
**En tant que** Léa
**Je veux** modifier les tags et description d'une Theme Card
**Afin de** faire évoluer les pouvoirs de mon personnage

**Contexte** : Aria gagne en expérience, Léa veut ajouter un 4ème Power tag à "Shadow Dancer".

**Critères d'acceptation** :
- [ ] Édition inline ou modal avec données pré-remplies
- [ ] Modification titre, description, type
- [ ] Ajout/Suppression Power tags (respectant 3-5)
- [ ] Ajout/Suppression Weakness tags (respectant 1-2)
- [ ] Validation temps réel
- [ ] Sauvegarde automatique toutes les 30s pendant édition

**Exemples** :
```
Léa clique "Modifier" sur Theme Card "Shadow Dancer"
→ Mode édition activé
→ Power tags actuels : 3
→ Clique [+ Ajouter Power tag]
→ Tape: "Create shadow constructs"
→ Validation : 4 tags (OK, max 5)
→ Sauvegarde auto après 30s
→ Message: "Theme Card mise à jour"
```

### US-132 : Supprimer une Theme Card
**En tant que** Léa
**Je veux** supprimer une Theme Card
**Afin de** remplacer un thème qui ne correspond plus

**Contexte** : Léa veut remplacer une Theme Card initiale par une nouvelle après évolution du personnage.

**Critères d'acceptation** :
- [ ] Bouton "Supprimer" sur chaque Theme Card
- [ ] Validation : impossible si < 2 Theme Cards restantes
- [ ] Modal de confirmation si 2-3 Theme Cards (warning)
- [ ] Suppression immédiate si 4 Theme Cards (pas de risque)
- [ ] Message d'erreur si tentative de descendre sous 2 Theme Cards

**Exemples** :
```
Aria a 4 Theme Cards
→ Léa clique "Supprimer" sur "Old Mythos Card"
→ Pas de modal (4 cards, pas de risque)
→ Suppression immédiate
→ 3 Theme Cards restantes

Aria a 2 Theme Cards
→ Léa clique "Supprimer"
→ Erreur: "Impossible : minimum 2 Theme Cards requis"
→ Suppression bloquée
```

### US-133 : Gérer les Power tags
**En tant que** Léa
**Je veux** ajouter, modifier et supprimer des Power tags
**Afin de** ajuster précisément les capacités de mon personnage

**Contexte** : Léa édite la Theme Card "Shadow Dancer" et veut reformuler un Power tag.

**Critères d'acceptation** :
- [ ] Minimum 3 Power tags obligatoires
- [ ] Maximum 5 Power tags (validation bloquante)
- [ ] Édition inline de chaque tag (clic pour éditer)
- [ ] Validation longueur tag : 5-100 caractères
- [ ] Réorganisation drag & drop (ordre peut avoir sens narratif)
- [ ] Suppression impossible si 3 tags (minimum atteint)

**Exemples** :
```
Theme Card "Shadow Dancer" - Power tags actuels:
1. "Walk through shadows" [Modifier] [X]
2. "Blend into darkness" [Modifier] [X]
3. "See in pitch black" [Modifier] [X]

Léa clique "Modifier" sur tag 1
→ Input inline : "Walk through shadows"
→ Modifie en : "Teleport through shadows"
→ Validation : 5-100 chars (OK)
→ Sauvegarde auto après 2s d'inactivité

Léa clique [X] sur tag 3
→ Validation : 3 tags actuels, suppression bloquerait minimum
→ Erreur: "Minimum 3 Power tags requis"

Léa a 4 tags, clique [X] sur tag 4
→ Suppression OK (restera 3 tags)
→ Tag supprimé
```

### US-134 : Gérer les Weakness tags
**En tant que** Léa
**Je veux** définir les faiblesses de mes Theme Cards
**Afin de** respecter les règles LITM et créer de la tension narrative

**Contexte** : Léa crée Theme Card "Shadow Dancer" et doit définir ses faiblesses.

**Critères d'acceptation** :
- [ ] Minimum 1 Weakness tag obligatoire
- [ ] Maximum 2 Weakness tags (validation bloquante)
- [ ] Édition inline comme Power tags
- [ ] Validation longueur : 5-150 caractères (plus de contexte que Power tags)
- [ ] Impossible de créer Theme Card sans au moins 1 Weakness

**Exemples** :
```
Theme Card "Shadow Dancer" - Weakness tags:
1. "Vulnerable in bright light" [Modifier] [X]

Léa clique [+ Ajouter Weakness tag]
→ Input: "Powers weaken at sunrise"
→ Validation : 2 tags max (OK)
→ Tag ajouté

Léa clique [+ Ajouter Weakness tag] (déjà 2 tags)
→ Bouton désactivé
→ Tooltip: "Maximum 2 Weakness tags"

Léa tente de supprimer seul Weakness tag
→ Erreur: "Minimum 1 Weakness tag requis"
```

## Modèle de Données

### Structure Theme Card
```typescript
interface ThemeCard {
  id: string;              // UUID v4
  characterId: string;     // FK vers Character
  title: string;           // 3-100 caractères
  description?: string;    // Texte libre, max 500 caractères
  type: "Mythos" | "Logos"; // Type LITM
  powerTags: string[];     // Array 3-5 strings
  weaknessTags: string[];  // Array 1-2 strings
  createdAt: Date;
  updatedAt: Date;
}
```

### Validation Tags
```typescript
interface TagValidation {
  powerTags: {
    min: 3,
    max: 5,
    lengthMin: 5,
    lengthMax: 100
  },
  weaknessTags: {
    min: 1,
    max: 2,
    lengthMin: 5,
    lengthMax: 150
  }
}
```

### Relations
```
Character (1) ←→ (2..4) ThemeCard
ThemeCard.type = ENUM('Mythos', 'Logos')
ThemeCard.powerTags = JSON Array[3..5]
ThemeCard.weaknessTags = JSON Array[1..2]
```

## Règles Métier

### Contraintes LITM
1. **Minimum 2 Theme Cards par personnage** : Validation lors de la suppression, impossible de descendre sous 2
2. **Maximum 4 Theme Cards par personnage** : Bouton "Ajouter Theme Card" désactivé si 4 atteintes
3. **Types Mythos/Logos** : Choix obligatoire, pas de type "neutre" ou "custom" en MVP
4. **Équilibre recommandé** : Suggestion UX d'avoir au moins 1 Mythos et 1 Logos (pas bloquant)

### Power Tags
1. **Minimum 3, Maximum 5** : Validation stricte côté serveur et client
2. **Longueur 5-100 caractères** : Assez court pour être mémorisable, assez long pour être descriptif
3. **Pas de doublons** : Validation unicité dans la même Theme Card
4. **Ordre significatif** : Drag & drop pour réorganiser (peut refléter importance narrative)

### Weakness Tags
1. **Minimum 1, Maximum 2** : Règles LITM strictes
2. **Longueur 5-150 caractères** : Plus de contexte autorisé que Power tags
3. **Pas de doublons** : Validation unicité
4. **Au moins 1 obligatoire** : Impossible de sauvegarder Theme Card sans Weakness

### Validation et Sauvegarde
1. **Validation temps réel** : Compteurs visuels (3/5 Power tags, 1/2 Weakness tags)
2. **Sauvegarde automatique** : Toutes les 30s pendant édition
3. **Validation serveur** : Double validation Zod côté API (sécurité)
4. **Indicateurs visuels** : Badges "Incomplet" si tags < minimum

## Interface Utilisateur

### Section Theme Cards (Page Personnage)
```
+--------------------------------------------------+
|  THEME CARDS (3/4)                [+ Ajouter]    |
+--------------------------------------------------+
|                                                  |
|  +--------------------------------------------+  |
|  | Shadow Dancer                    [Mythos]  |  |
|  | Aria peut manipuler les ombres...          |  |
|  |                                            |  |
|  | Power Tags (4/5):                          |  |
|  | - Walk through shadows           [Modifier]|  |
|  | - Blend into darkness            [Modifier]|  |
|  | - See in pitch black             [Modifier]|  |
|  | - Create shadow constructs       [Modifier]|  |
|  | [+ Ajouter Power tag]                      |  |
|  |                                            |  |
|  | Weakness Tags (2/2):                       |  |
|  | - Vulnerable in bright light     [Modifier]|  |
|  | - Powers weaken at sunrise       [Modifier]|  |
|  |                                            |  |
|  | [Modifier] [Supprimer]                     |  |
|  +--------------------------------------------+  |
|                                                  |
|  +--------------------------------------------+  |
|  | Mist Weaver                      [Mythos]  |  |
|  | Aria tisse la brume pour créer des...      |  |
|  |                                            |  |
|  | Power Tags (3/5):                          |  |
|  | - Generate thick fog             [Modifier]|  |
|  | - Shape mist into forms          [Modifier]|  |
|  | - Breathe underwater (mist)      [Modifier]|  |
|  | [+ Ajouter Power tag]                      |  |
|  |                                            |  |
|  | Weakness Tags (1/2):                       |  |
|  | - Wind disperses mist instantly  [Modifier]|  |
|  | [+ Ajouter Weakness tag]                   |  |
|  |                                            |  |
|  | [Modifier] [Supprimer]                     |  |
|  +--------------------------------------------+  |
|                                                  |
+--------------------------------------------------+
```

### Modal Création Theme Card
```
+--------------------------------------------------+
|  Nouvelle Theme Card                        [X]  |
+--------------------------------------------------+
|                                                  |
|  Titre *                                         |
|  [_______________________________]               |
|  3-100 caractères                                |
|                                                  |
|  Type *                                          |
|  ( ) Mythos  ( ) Logos                           |
|                                                  |
|  Description (optionnel)                         |
|  [_______________________________]               |
|  [_______________________________]               |
|  Max 500 caractères                              |
|                                                  |
|  Power Tags (3-5 requis) *                       |
|  1. [_______________________________] [X]        |
|  2. [_______________________________] [X]        |
|  3. [_______________________________] [X]        |
|  [+ Ajouter Power tag] (max 5)                   |
|                                                  |
|  Weakness Tags (1-2 requis) *                    |
|  1. [_______________________________] [X]        |
|  [+ Ajouter Weakness tag] (max 2)                |
|                                                  |
|  [Annuler]  [Créer Theme Card]                   |
+--------------------------------------------------+
```

### Édition Inline Tag
```
Power Tags (4/5):
┌─────────────────────────────────────────┐
│ Walk through shadows              [✓][X]│  ← Mode édition
└─────────────────────────────────────────┘
  Blend into darkness                [Edit]   ← Mode lecture
  See in pitch black                 [Edit]
  Create shadow constructs           [Edit]
  [+ Ajouter Power tag]
```

## Critères d'Acceptation Globaux

### Fonctionnel
- [ ] Création Theme Card avec titre, type, 3-5 Power tags, 1-2 Weakness tags
- [ ] Modification inline des tags avec validation temps réel
- [ ] Suppression bloquée si < 2 Theme Cards restantes sur personnage
- [ ] Drag & drop pour réorganiser Power tags et Weakness tags
- [ ] Validation unicité tags dans même Theme Card
- [ ] Bouton "Ajouter Theme Card" désactivé si 4 Theme Cards

### Performance
- [ ] Création Theme Card : < 500ms
- [ ] Modification tag inline : < 200ms (sauvegarde auto après 2s inactivité)
- [ ] Suppression Theme Card : < 300ms
- [ ] Chargement section Theme Cards : < 500ms (avec 4 cards complètes)

### UX
- [ ] Compteurs visuels temps réel (3/5 Power tags, 1/2 Weakness tags)
- [ ] Messages d'erreur clairs si validation échoue
- [ ] Indicateurs visuels minimum/maximum atteints
- [ ] Sauvegarde automatique avec feedback "Sauvegardé il y a Xs"
- [ ] Badges "Mythos" et "Logos" avec couleurs distinctes

### Technique
- [ ] Prisma ThemeCard model avec JSON columns pour tags
- [ ] Validation Zod côté serveur (title, type, powerTags array[3..5], weaknessTags array[1..2])
- [ ] Index DB sur characterId pour performances queries
- [ ] Contrainte CHECK nombre Theme Cards par Character (2-4)
- [ ] API routes : POST /api/characters/:id/theme-cards, PATCH /api/theme-cards/:id, DELETE /api/theme-cards/:id

## Exemples Concrets

### Parcours Léa : Création Theme Cards pour Aria (Timeline)

**Jour 1 - 15h30** : Première Theme Card
```
Léa vient de créer Aria
→ Page /characters/aria-uuid/edit
→ Section "Theme Cards (2/4)" avec 2 cards vides (créées par défaut)
→ Clique "Modifier" sur première card vide
→ Modal édition:
   Titre: "Shadow Dancer"
   Type: Mythos
   Description: "Aria manipule les ombres depuis l'enfance"

   Power Tags:
   1. "Walk through shadows"
   2. "Blend into darkness"
   3. "See in pitch black"

   Weakness Tags:
   1. "Vulnerable in bright light"

→ Clique "Sauvegarder"
→ Theme Card créée en 380ms
→ Affichée dans liste avec badge [Mythos]
```

**Jour 1 - 15h45** : Seconde Theme Card
```
Léa clique "Modifier" sur seconde card vide
→ Titre: "Mist Weaver"
→ Type: Mythos
→ Description: "Aria tisse la brume..."
→ Power Tags (3):
   - "Generate thick fog"
   - "Shape mist into forms"
   - "Breathe underwater (mist)"
→ Weakness Tags (1):
   - "Wind disperses mist instantly"
→ Sauvegarde en 420ms
→ Aria a maintenant 2 Theme Cards complètes (minimum LITM)
```

**Jour 3 - 10h00** : Ajout 3ème Theme Card (Logos)
```
Léa veut ajouter dimension Logos à Aria
→ Clique [+ Ajouter Theme Card]
→ Titre: "Tactical Mind"
→ Type: Logos
→ Power Tags (4):
   - "Analyze combat situations"
   - "Predict enemy movements"
   - "Strategic planning"
   - "Quick decision-making"
→ Weakness Tags (2):
   - "Overthinks in chaos"
   - "Paralyzed by too many options"
→ Sauvegarde
→ Aria: 3 Theme Cards (2 Mythos, 1 Logos)
```

**Jour 5 - 18h00** : Modification Power tag
```
Léa réalise qu'un Power tag est trop vague
→ Theme Card "Shadow Dancer"
→ Clique [Edit] sur "Walk through shadows"
→ Input inline activé
→ Modifie en: "Teleport between shadows (30 feet)"
→ Sauvegarde auto après 2s d'inactivité
→ Message: "Tag mis à jour"
```

**Jour 7 - 20h00** : Ajout 4ème Power tag
```
Aria gagne en expérience
→ Theme Card "Mist Weaver" (actuellement 3 Power tags)
→ Clique [+ Ajouter Power tag]
→ Input: "Summon mist creatures"
→ Validation: 4/5 Power tags (OK)
→ Tag ajouté
→ Bouton [+ Ajouter Power tag] toujours visible (max 5 non atteint)
```

**Jour 10 - 14h00** : Tentative suppression bloquée
```
Léa veut supprimer Theme Card "Tactical Mind"
→ Aria: 3 Theme Cards actuellement
→ Clique "Supprimer"
→ Modal: "Supprimer Tactical Mind ? (3 Theme Cards restantes)"
→ Clique "Confirmer"
→ Suppression OK (restera 2 Theme Cards = minimum)
→ Aria: 2 Theme Cards (2 Mythos, 0 Logos)

Léa tente de supprimer "Mist Weaver"
→ Aria: 2 Theme Cards
→ Clique "Supprimer"
→ Erreur: "Impossible : minimum 2 Theme Cards requis"
→ Suppression bloquée
```

## Contraintes Techniques

### Prisma ThemeCard Model (suggestion)
```prisma
model ThemeCard {
  id            String   @id @default(uuid())
  characterId   String
  title         String   @db.VarChar(100)
  description   String?  @db.VarChar(500)
  type          ThemeCardType
  powerTags     String[] // Array de strings (JSON)
  weaknessTags  String[] // Array de strings (JSON)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  character     Character @relation(fields: [characterId], references: [id], onDelete: Cascade)

  @@index([characterId])
}

enum ThemeCardType {
  Mythos
  Logos
}
```

### Validation Zod (exemple)
```typescript
const themeCardSchema = z.object({
  title: z.string().min(3, "Minimum 3 caractères").max(100, "Maximum 100 caractères"),
  description: z.string().max(500, "Maximum 500 caractères").optional(),
  type: z.enum(["Mythos", "Logos"], { required_error: "Type requis" }),
  powerTags: z.array(
    z.string().min(5, "Minimum 5 caractères").max(100, "Maximum 100 caractères")
  ).min(3, "Minimum 3 Power tags").max(5, "Maximum 5 Power tags"),
  weaknessTags: z.array(
    z.string().min(5, "Minimum 5 caractères").max(150, "Maximum 150 caractères")
  ).min(1, "Minimum 1 Weakness tag").max(2, "Maximum 2 Weakness tags"),
  characterId: z.string().uuid(),
});
```

### Validation Business (exemple)
```typescript
// Vérifier que Character n'a pas déjà 4 Theme Cards
const validateThemeCardCount = async (characterId: string) => {
  const count = await prisma.themeCard.count({
    where: { characterId }
  });
  if (count >= 4) {
    throw new Error("Maximum 4 Theme Cards par personnage");
  }
};

// Vérifier que Character aura au moins 2 Theme Cards après suppression
const validateMinimumThemeCards = async (characterId: string, themeCardIdToDelete: string) => {
  const count = await prisma.themeCard.count({
    where: {
      characterId,
      id: { not: themeCardIdToDelete }
    }
  });
  if (count < 2) {
    throw new Error("Minimum 2 Theme Cards requis");
  }
};
```

### Composables Vue (suggestion)
```typescript
// composables/useThemeCards.ts
export const useThemeCards = () => {
  const themeCards = ref<ThemeCard[]>([]);

  const addPowerTag = (themeCard: ThemeCard, tag: string) => {
    if (themeCard.powerTags.length >= 5) {
      throw new Error("Maximum 5 Power tags");
    }
    if (themeCard.powerTags.includes(tag)) {
      throw new Error("Tag déjà existant");
    }
    themeCard.powerTags.push(tag);
  };

  const removePowerTag = (themeCard: ThemeCard, index: number) => {
    if (themeCard.powerTags.length <= 3) {
      throw new Error("Minimum 3 Power tags requis");
    }
    themeCard.powerTags.splice(index, 1);
  };

  // ... autres méthodes

  return { themeCards, addPowerTag, removePowerTag };
};
```

## Scope MVP vs Versions Futures

### MVP v1.0
- CRUD Theme Cards avec validation stricte
- Power tags (3-5) et Weakness tags (1-2)
- Types Mythos/Logos uniquement
- Édition inline tags
- Drag & drop réorganisation tags
- Validation temps réel
- Sauvegarde automatique

### v1.2
- Marquer Theme Card comme Crack/Fade (règles LITM avancées)
- Historique évolution Theme Cards
- Suggestions de tags basées sur bibliothèque commune
- Import/Export Theme Cards entre personnages

### v2.0+
- Types custom (Mist, Nature, Tech, etc.) pour hacks du Mist Engine
- Tags prédéfinis avec auto-complétion
- Partage bibliothèque Theme Cards entre joueurs
- Générateur IA de Theme Cards basé sur description

---
**Date** : 2025-01-19
**Version** : 1.0
**Statut** : Validé
**Priorité** : P0 (MVP)
**Références** : LITM rulebook (Son of Oak), litm-player (structure Theme Cards), characters-of-the-mist (format JSON)