# Gestion des Personnages LITM

## Vue d'Ensemble
CRUD complet des personnages Legends in the Mist avec informations de base, isolation par playspace, et relations aux Theme Cards, Hero Card et Trackers. Chaque personnage appartient à un seul playspace.

## User Stories

### US-120 : Créer un nouveau personnage LITM
**En tant que** Léa
**Je veux** créer un personnage LITM avec nom, description et avatar
**Afin de** commencer à jouer avec un nouveau héros

**Contexte** : Léa vient de créer son playspace "Workspace Aria" et veut créer son premier personnage.

**Critères d'acceptation** :
- [ ] Formulaire de création avec champs : nom (requis), description (optionnel), avatar URL (optionnel), level (défaut 1)
- [ ] Validation nom minimum 2 caractères, maximum 100 caractères
- [ ] Avatar par défaut si non fourni (placeholder image)
- [ ] Personnage créé dans le playspace actif uniquement
- [ ] Redirection automatique vers page d'édition du personnage après création
- [ ] Création de 2 Theme Cards vides par défaut (minimum LITM)

**Exemples** :
```
Léa dans /playspaces/workspace-aria
- Clique "Nouveau personnage"
- Modal ou page /characters/new
- Remplit nom: "Aria the Mist Weaver"
- Remplit description: "Une tisseuse de brume qui..."
- Avatar: laisse vide (placeholder utilisé)
- Clique "Créer"
→ Personnage créé en < 1s
→ Redirection vers /characters/aria-uuid/edit
→ 2 Theme Cards vides affichées
```

### US-121 : Lister les personnages du playspace actif
**En tant que** Léa
**Je veux** voir tous mes personnages du playspace actuel
**Afin de** choisir celui que je veux jouer ou modifier

**Contexte** : Léa a créé 3 personnages dans "Workspace Aria" sur 2 semaines.

**Critères d'acceptation** :
- [ ] Liste affichée uniquement pour le playspace actif
- [ ] Affichage : avatar, nom, niveau, nombre de Theme Cards
- [ ] Tri par défaut : date de dernière modification (DESC)
- [ ] Options de tri : nom (A-Z), niveau, date création
- [ ] Recherche par nom (filtre temps réel)
- [ ] Indicateur visuel si personnage incomplet (< 2 Theme Cards)

**Exemples** :
```
Léa visite /playspaces/workspace-aria/characters

+--------------------------------------------------+
|  Personnages (3)               [+ Nouveau]       |
|  [Recherche: _____]  Tri: [Dernière modif v]     |
+--------------------------------------------------+
|  [Avatar] Aria the Mist Weaver       Niveau 3    |
|           4 Theme Cards - Modifié il y a 2h      |
|           [Modifier] [Dupliquer] [Supprimer]     |
+--------------------------------------------------+
|  [Avatar] Kael Shadowblade           Niveau 1    |
|           2 Theme Cards - Créé il y a 5j         |
|           [Modifier] [Dupliquer] [Supprimer]     |
+--------------------------------------------------+
|  [Avatar] Nova Starlight             Niveau 2    |
|           ! 1 Theme Card (incomplet)             |
|           [Modifier] [Dupliquer] [Supprimer]     |
+--------------------------------------------------+
```

### US-122 : Modifier un personnage existant
**En tant que** Léa
**Je veux** modifier les informations de mon personnage
**Afin de** faire évoluer son histoire et ses caractéristiques

**Contexte** : Aria a gagné un niveau et Léa veut mettre à jour sa description.

**Critères d'acceptation** :
- [ ] Formulaire pré-rempli avec données actuelles
- [ ] Modification nom, description, avatar, level
- [ ] Validation identique à création
- [ ] Sauvegarde automatique toutes les 30s (draft)
- [ ] Bouton "Sauvegarder" manuel avec feedback visuel
- [ ] Timestamp "Dernière modification" mis à jour

**Exemples** :
```
Léa visite /characters/aria-uuid/edit
- Champ level: 3 → 4
- Description: ajoute "...après avoir vaincu le Dragon des Brumes"
- Clique "Sauvegarder"
→ Sauvegarde en < 500ms
→ Message: "Personnage mis à jour"
→ updatedAt timestamp rafraîchi
```

### US-123 : Supprimer un personnage
**En tant que** Léa
**Je veux** supprimer un personnage que je n'utilise plus
**Afin de** garder ma liste organisée

**Contexte** : Léa a créé "Nova Starlight" pour tester mais ne l'utilise jamais.

**Critères d'acceptation** :
- [ ] Bouton "Supprimer" avec icône danger (rouge)
- [ ] Modal de confirmation obligatoire
- [ ] Affichage dans modal : nom personnage, nombre Theme Cards, Hero Card (si existe)
- [ ] Suppression cascade : Character + ThemeCards + HeroCard + Trackers
- [ ] Message de confirmation après suppression
- [ ] Pas de récupération possible (suppression définitive)

**Exemples** :
```
Léa clique "Supprimer" sur Nova Starlight
→ Modal:
   "Supprimer Nova Starlight ?
    Cette action est irréversible.
    1 Theme Card sera supprimée."
→ Léa clique "Confirmer la suppression"
→ Suppression en < 500ms
→ Message: "Nova Starlight supprimé"
→ Liste rafraîchie (2 personnages restants)
```

### US-124 : Dupliquer un personnage
**En tant que** Léa
**Je veux** dupliquer un personnage existant
**Afin de** créer rapidement une variante ou un template

**Contexte** : Léa veut créer "Aria (Version Sombre)" basée sur Aria existante.

**Critères d'acceptation** :
- [ ] Bouton "Dupliquer" dans liste et page détail
- [ ] Duplication complète : Character + ThemeCards + HeroCard + Trackers
- [ ] Nom automatique : "[Nom Original] (Copie)"
- [ ] Possibilité de renommer immédiatement après duplication
- [ ] Nouveau UUID généré pour le duplicata
- [ ] Timestamps création = maintenant (pas copie de l'original)

**Exemples** :
```
Léa clique "Dupliquer" sur Aria the Mist Weaver
→ Modal: "Dupliquer Aria the Mist Weaver ?"
→ Clique "Dupliquer"
→ Duplication en < 1s
→ Nouveau personnage: "Aria the Mist Weaver (Copie)"
→ Redirection vers /characters/new-uuid/edit
→ Léa renomme en "Aria (Version Sombre)"
```

## Modèle de Données

### Informations de Base
```typescript
interface Character {
  id: string;              // UUID v4
  name: string;            // 2-100 caractères
  description?: string;    // Texte libre, max 2000 caractères
  avatarUrl?: string;      // URL image ou null (placeholder)
  level: number;           // 1-10 (règles LITM)
  playspaceId: string;     // FK vers Playspace (isolation)
  userId: string;          // FK vers User (propriétaire)
  createdAt: Date;
  updatedAt: Date;
}
```

### Relations
```
Character (1) ←→ (1) Playspace
Character (1) ←→ (N) ThemeCard (minimum 2)
Character (1) ←→ (0..1) HeroCard (optionnelle)
Character (1) ←→ (1) Trackers (Status, Story tag, Story theme)
```

### Contraintes Base de Données
- `playspaceId` + `userId` : index composite (performances queries)
- Suppression cascade activée : DELETE Character → DELETE ThemeCards, HeroCard, Trackers
- Contrainte CHECK : `level BETWEEN 1 AND 10`

## Règles Métier

### Isolation par Playspace
1. **Personnages liés au playspace** : Un personnage appartient à un seul playspace, jamais partagé entre playspaces
2. **Affichage filtré** : La liste de personnages affiche uniquement ceux du playspace actif (WHERE playspaceId = ?)
3. **Propriétaire unique** : Un personnage appartient à un seul utilisateur (userId), hérité du playspace

### Contraintes LITM
1. **Minimum 2 Theme Cards** : Un personnage doit avoir au minimum 2 Theme Cards pour être jouable (validation lors de la création, warning si < 2)
2. **Maximum 4 Theme Cards** : Règle LITM stricte, validation côté serveur
3. **Level 1-10** : Niveau de personnage limité à la plage LITM standard
4. **Hero Card optionnelle** : Peut être ajoutée à tout moment, pas obligatoire pour jouer

### Suppression et Duplication
1. **Suppression cascade confirmée** : Modal de confirmation obligatoire avec détails (nombre Theme Cards, Hero Card)
2. **Pas de soft delete en MVP** : Suppression définitive (archivage reporté en v1.2)
3. **Duplication complète** : Tous les sous-éléments (ThemeCards, HeroCard, Trackers) dupliqués avec nouveaux UUIDs
4. **Nom duplication** : Automatiquement "[Nom] (Copie)" pour éviter confusion

### Performance et UX
1. **Sauvegarde automatique** : Draft toutes les 30s pendant édition (UX moderne)
2. **Validation temps réel** : Nom minimum 2 caractères validé à la saisie
3. **Loading states** : Indicateurs visuels pendant création/modification/suppression (< 2s max)
4. **Personnages incomplets** : Warning visuel si < 2 Theme Cards (badge orange)

## Interface Utilisateur

### Liste Personnages (Desktop)
```
+--------------------------------------------------+
|  WORKSPACE ARIA > Personnages                    |
+--------------------------------------------------+
|  [+ Nouveau personnage]              Tri: [v]    |
|  [Recherche: _________]                          |
+--------------------------------------------------+
|                                                  |
|  +--------------------------------------------+  |
|  | [Avatar]  Aria the Mist Weaver             |  |
|  |           Niveau 3                         |  |
|  |           4 Theme Cards, 1 Hero Card       |  |
|  |           Modifié il y a 2 heures          |  |
|  |                                            |  |
|  |  [Modifier] [Dupliquer] [Supprimer]        |  |
|  +--------------------------------------------+  |
|                                                  |
|  +--------------------------------------------+  |
|  | [Avatar]  Kael Shadowblade                 |  |
|  |           Niveau 1                         |  |
|  |           2 Theme Cards                    |  |
|  |           Créé il y a 5 jours              |  |
|  |                                            |  |
|  |  [Modifier] [Dupliquer] [Supprimer]        |  |
|  +--------------------------------------------+  |
|                                                  |
+--------------------------------------------------+
```

### Formulaire Création/Édition
```
Créer un personnage

Nom du personnage *
[_______________________________]
2-100 caractères

Description
[_______________________________]
[_______________________________]
[_______________________________]
Max 2000 caractères (optionnel)

Avatar (URL)
[_______________________________]
Image par défaut si vide

Niveau
[3] (1-10)

[Annuler]  [Sauvegarder]

Dernière sauvegarde : il y a 12s (auto)
```

### Modal Suppression
```
+------------------------------------------+
|  Supprimer "Aria the Mist Weaver" ?     |
+------------------------------------------+
|                                          |
|  Cette action est irréversible.          |
|                                          |
|  Seront également supprimés :            |
|  - 4 Theme Cards                         |
|  - 1 Hero Card                           |
|  - Tous les Trackers                     |
|                                          |
|  [Annuler]  [Confirmer la suppression]   |
+------------------------------------------+
```

## Critères d'Acceptation Globaux

### Fonctionnel
- [ ] Création personnage avec validation Zod (nom requis, level 1-10)
- [ ] Liste filtrée par playspace actif uniquement
- [ ] Modification avec sauvegarde auto toutes les 30s
- [ ] Suppression cascade avec confirmation
- [ ] Duplication complète (Character + relations)
- [ ] Recherche temps réel par nom (debounce 300ms)

### Performance
- [ ] Création : < 1s (insert DB + 2 Theme Cards vides)
- [ ] Liste : < 500ms (query avec relations limitées)
- [ ] Modification : < 500ms (update simple)
- [ ] Suppression : < 500ms (cascade jusqu'à 4 Theme Cards + Hero Card)
- [ ] Duplication : < 2s (copie profonde de toutes relations)

### UX
- [ ] Indicateur visuel personnage incomplet (< 2 Theme Cards)
- [ ] Loading states pendant toutes opérations asynchrones
- [ ] Messages de succès/erreur clairs et actionnables
- [ ] Sauvegarde auto avec indicateur "Dernière sauvegarde : il y a Xs"
- [ ] Validation temps réel avec messages d'erreur inline

### Technique
- [ ] Prisma Character model avec relations ThemeCard, HeroCard, Trackers
- [ ] Validation Zod côté serveur (name, level, description length)
- [ ] Suppression cascade configurée au niveau DB (ON DELETE CASCADE)
- [ ] Indexes DB sur playspaceId et userId pour performances
- [ ] API routes RESTful : GET /api/characters, POST /api/characters, PATCH /api/characters/:id, DELETE /api/characters/:id

## Exemples Concrets

### Parcours Léa : Création Premier Personnage (Timeline)

**Jour 1 - 15h00** : Création playspace
```
Léa crée playspace "Workspace Aria"
→ Redirection vers /playspaces/workspace-aria
→ Dashboard vide : "Aucun personnage. Créez-en un !"
→ Bouton [+ Nouveau personnage]
```

**Jour 1 - 15h05** : Création Aria
```
Léa clique "Nouveau personnage"
→ Modal/Page /characters/new
→ Remplit nom: "Aria the Mist Weaver"
→ Description: "Une jeune femme capable de tisser la brume..."
→ Avatar: laisse vide
→ Level: 1 (défaut)
→ Clique "Créer"
→ Création en 780ms
   - Character créé (UUID généré)
   - 2 ThemeCard vides créées
   - Trackers initialisés
→ Redirection /characters/aria-uuid/edit
→ Message: "Aria the Mist Weaver créé !"
```

**Jour 1 - 15h15** : Première modification
```
Léa sur /characters/aria-uuid/edit
→ Ajoute détails à description
→ Tape pendant 2 minutes
→ Sauvegarde auto après 30s : "Sauvegardé il y a 30s"
→ Continue de taper
→ Sauvegarde auto après 30s : "Sauvegardé il y a 15s"
→ Clique "Sauvegarder" manuellement
→ Message: "Personnage mis à jour"
```

**Jour 3 - 10h00** : Création second personnage
```
Léa retourne sur /playspaces/workspace-aria/characters
→ Voit Aria dans la liste
→ Clique "Nouveau personnage"
→ Crée "Kael Shadowblade"
→ Liste mise à jour : 2 personnages
→ Tri par défaut : Kael en haut (dernière modif)
```

**Jour 7 - 18h00** : Duplication pour variante
```
Léa veut créer variante d'Aria
→ Liste personnages
→ Clique "Dupliquer" sur Aria
→ Modal: "Dupliquer Aria the Mist Weaver ?"
→ Clique "Dupliquer"
→ Duplication en 1.2s
   - Character copié
   - 4 ThemeCards copiées (nouvelles UUIDs)
   - 1 HeroCard copiée
   - Trackers copiés (réinitialisés)
→ Nouveau personnage: "Aria the Mist Weaver (Copie)"
→ Redirection /characters/new-uuid/edit
→ Léa renomme: "Aria (Corrupted)"
```

**Jour 10 - 20h00** : Suppression personnage test
```
Léa a créé "Test Character" pour expérimenter
→ Liste personnages (3 total)
→ Clique "Supprimer" sur Test Character
→ Modal:
   "Supprimer Test Character ?
    Seront supprimés : 2 Theme Cards"
→ Clique "Confirmer"
→ Suppression en 320ms
→ Message: "Test Character supprimé"
→ Liste rafraîchie : 2 personnages restants
```

## Contraintes Techniques

### Prisma Character Model (suggestion)
```prisma
model Character {
  id           String      @id @default(uuid())
  name         String      @db.VarChar(100)
  description  String?     @db.Text
  avatarUrl    String?
  level        Int         @default(1)
  playspaceId  String
  userId       String
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt

  playspace    Playspace   @relation(fields: [playspaceId], references: [id], onDelete: Cascade)
  user         User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  themeCards   ThemeCard[]
  heroCard     HeroCard?
  trackers     Trackers?

  @@index([playspaceId, userId])
  @@index([updatedAt])
}
```

### API Routes
- `GET /api/playspaces/:playspaceId/characters` : Liste personnages du playspace
- `POST /api/playspaces/:playspaceId/characters` : Créer personnage
- `GET /api/characters/:id` : Détails personnage
- `PATCH /api/characters/:id` : Modifier personnage
- `DELETE /api/characters/:id` : Supprimer personnage (cascade)
- `POST /api/characters/:id/duplicate` : Dupliquer personnage

### Validation Zod (exemple)
```typescript
const characterSchema = z.object({
  name: z.string().min(2, "Minimum 2 caractères").max(100, "Maximum 100 caractères"),
  description: z.string().max(2000, "Maximum 2000 caractères").optional(),
  avatarUrl: z.string().url("URL invalide").optional().or(z.literal("")),
  level: z.number().int().min(1).max(10),
  playspaceId: z.string().uuid(),
});
```

### Composables Vue (suggestion)
```typescript
// composables/useCharacters.ts
export const useCharacters = () => {
  const characters = ref<Character[]>([]);
  const loading = ref(false);

  const fetchCharacters = async (playspaceId: string) => {
    loading.value = true;
    const data = await $fetch(`/api/playspaces/${playspaceId}/characters`);
    characters.value = data;
    loading.value = false;
  };

  const createCharacter = async (playspaceId: string, data: CharacterInput) => {
    return await $fetch(`/api/playspaces/${playspaceId}/characters`, {
      method: 'POST',
      body: data,
    });
  };

  // ... autres méthodes

  return { characters, loading, fetchCharacters, createCharacter };
};
```

## Scope MVP vs Versions Futures

### MVP v1.0
- CRUD complet (Create, Read, Update, Delete)
- Duplication de personnages
- Isolation par playspace
- Sauvegarde automatique toutes les 30s
- Validation Zod côté serveur
- Recherche par nom temps réel
- Tri par nom, niveau, date

### v1.2
- Archivage (soft delete) au lieu de suppression définitive
- Restauration personnages archivés
- Historique modifications (versioning)
- Tags personnalisés pour organisation

### v2.0+
- Import/Export personnages entre playspaces
- Templates de personnages (archétypes)
- Partage personnages entre utilisateurs (read-only)
- Statistiques avancées (temps joué, évolution level)

---
**Date** : 2025-01-19
**Version** : 1.0
**Statut** : Validé
**Priorité** : P0 (MVP)
**Références** : characters-of-the-mist (structure JSON), litm-player (modèle données)