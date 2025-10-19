# Trackers LITM

## Vue d'Ensemble
3 trackers pour gérer l'état du personnage pendant le jeu : Status (conditions et blessures), Story tag (tags temporaires narratifs), Story theme (thèmes narratifs actifs). Relation 1-1 avec Character, créés automatiquement à la création du personnage.

## User Stories

### US-150 : Gérer le Status Tracker
**En tant que** Léa
**Je veux** ajouter et gérer des status (conditions, blessures)
**Afin de** suivre l'état physique et mental d'Aria pendant la partie

**Contexte** : Aria vient de subir une blessure lors d'un combat, Léa veut l'enregistrer.

**Critères d'acceptation** :
- [ ] Ajout status avec nom et niveau (0-5)
- [ ] Maximum 5 status simultanés
- [ ] Toggle actif/inactif pour chaque status
- [ ] Suppression définitive ou archivage (marquer inactif)
- [ ] Affichage visuel niveau de gravité

**Exemples** :
```
Léa sur /characters/aria-uuid/edit
→ Section "Trackers"
→ Colonne "Status (3/5)"
→ Clique [+ Ajouter status]
→ Modal:
   Nom: "Blessé"
   Niveau: [2 v] (0-5)
   Actif: [X]
→ Clique "Ajouter"
→ Status affiché: "Blessé (2)" avec badge orange
→ Options: [Toggle actif] [Modifier] [Supprimer]
```

### US-151 : Gérer le Story Tag Tracker
**En tant que** Léa
**Je veux** ajouter des Story tags temporaires
**Afin de** suivre les éléments narratifs en cours (avantages, malus, conditions spéciales)

**Contexte** : Aria obtient temporairement "Bénie par la Lune" après un rituel.

**Critères d'acceptation** :
- [ ] Ajout Story tag avec nom et description
- [ ] Illimités (pas de limite stricte)
- [ ] Toggle actif/inactif
- [ ] Tri par date création (DESC)
- [ ] Recherche/filtre par nom

**Exemples** :
```
Léa ajoute Story tag
→ Nom: "Bénie par la Lune"
→ Description: "Bonus aux jets liés aux ombres pendant 24h"
→ Actif: [X]
→ Story tag affiché avec badge bleu
→ Peut être désactivé sans suppression
```

### US-152 : Gérer le Story Theme Tracker
**En tant que** Léa
**Je veux** suivre les thèmes narratifs actifs
**Afin de** gérer les arcs narratifs en cours pour Aria

**Contexte** : Aria enquête sur "Le Mystère du Temple Oublié", Léa veut le suivre comme Story theme.

**Critères d'acceptation** :
- [ ] Ajout Story theme avec nom et description
- [ ] Maximum 3 Story themes actifs simultanément
- [ ] Toggle actif/inactif
- [ ] Indication visuelle si 3 actifs (limite atteinte)
- [ ] Story themes inactifs archivés (historique)

**Exemples** :
```
Léa ajoute Story theme
→ Nom: "Le Mystère du Temple Oublié"
→ Description: "Aria cherche la vérité sur ce temple ancien"
→ Actif: [X]
→ Story themes actifs (1/3)

Plus tard, Aria résout le mystère:
→ Toggle actif → inactif
→ Story theme archivé, reste visible mais grisé
→ Historique narratif conservé
```

### US-153 : Modifier un item de tracker
**En tant que** Léa
**Je veux** modifier le nom, description et niveau d'un item
**Afin de** mettre à jour l'évolution de l'état du personnage

**Contexte** : Le status "Blessé (2)" d'Aria s'aggrave en "Blessé (4)".

**Critères d'acceptation** :
- [ ] Édition inline de chaque item
- [ ] Modification nom, description, niveau (si applicable)
- [ ] Sauvegarde automatique toutes les 30s
- [ ] Validation temps réel

**Exemples** :
```
Léa clique [Modifier] sur status "Blessé (2)"
→ Niveau: 2 → 4
→ Sauvegarde auto après 30s
→ Badge change de couleur (orange → rouge pour niveau 4+)
→ Message: "Status mis à jour"
```

### US-154 : Archiver vs Supprimer items
**En tant que** Léa
**Je veux** archiver plutôt que supprimer définitivement
**Afin de** conserver l'historique narratif du personnage

**Contexte** : Story theme "Le Mystère du Temple" est résolu, Léa veut l'archiver.

**Critères d'acceptation** :
- [ ] Toggle actif/inactif pour archivage
- [ ] Items inactifs affichés en grisé (section "Archivés")
- [ ] Suppression définitive optionnelle (bouton séparé)
- [ ] Restauration possible (réactiver item archivé)
- [ ] Filtre "Actifs seulement" / "Tous"

**Exemples** :
```
Story theme "Le Mystère du Temple" (actif)
→ Toggle actif → inactif
→ Déplacé dans section "Story Themes Archivés"
→ Reste visible, grisé
→ Peut être réactivé si rebondissement narratif

Suppression définitive:
→ Bouton [Supprimer définitivement] (danger)
→ Modal confirmation
→ Item supprimé de la base de données
```

## Modèle de Données

### Structure Trackers
```typescript
interface Trackers {
  id: string;              // UUID v4
  characterId: string;     // FK vers Character (1-1)
  statuses: Status[];      // Max 5 actifs
  storyTags: StoryTag[];   // Illimités
  storyThemes: StoryTheme[]; // Max 3 actifs
  createdAt: Date;
  updatedAt: Date;
}

interface Status {
  id: string;              // UUID v4
  name: string;            // 2-50 caractères
  level: number;           // 0-5 (gravité)
  active: boolean;         // Actif ou archivé
  createdAt: Date;
}

interface StoryTag {
  id: string;              // UUID v4
  name: string;            // 2-100 caractères
  description?: string;    // Max 500 caractères
  active: boolean;
  createdAt: Date;
}

interface StoryTheme {
  id: string;              // UUID v4
  name: string;            // 2-100 caractères
  description?: string;    // Max 1000 caractères
  active: boolean;
  createdAt: Date;
}
```

### Relations
```
Character (1) ←→ (1) Trackers
Trackers.statuses = JSON Array
Trackers.storyTags = JSON Array
Trackers.storyThemes = JSON Array
```

## Règles Métier

### Status Tracker
1. **Maximum 5 status actifs** : Validation bloquante, bouton "Ajouter" désactivé si 5 actifs
2. **Niveaux 0-5** : 0 = minime, 5 = critique/mortel
3. **Status inactifs illimités** : Archivage ne compte pas dans la limite des 5
4. **Couleurs niveau** : 0-1 vert, 2-3 orange, 4-5 rouge (indicateur visuel gravité)

### Story Tag Tracker
1. **Illimités** : Pas de limite stricte sur le nombre de Story tags actifs
2. **Tri chronologique** : Par défaut, tri par date création DESC (plus récents en haut)
3. **Recherche** : Filtre temps réel par nom (debounce 300ms)
4. **Archivage recommandé** : Suggestion UX "Archivez les tags résolus" si > 10 actifs

### Story Theme Tracker
1. **Maximum 3 Story themes actifs** : Validation bloquante, bouton "Ajouter" désactivé si 3 actifs
2. **Story themes inactifs illimités** : Archivage = historique narratif
3. **Indication visuelle** : Badge "3/3 actifs" si limite atteinte
4. **Réactivation possible** : Story theme archivé peut être réactivé (si < 3 actifs)

### Archivage vs Suppression
1. **Archivage par défaut** : Toggle actif/inactif recommandé (conservation historique)
2. **Suppression définitive optionnelle** : Bouton séparé "Supprimer définitivement" avec confirmation
3. **Restauration** : Items archivés peuvent être réactivés (respectant limites actives)
4. **Affichage** : Section "Actifs" et section "Archivés" séparées

## Interface Utilisateur

### Section Trackers (3 colonnes)
```
+--------------------------------------------------+
|  TRACKERS                                        |
+--------------------------------------------------+
|  Status (3/5)  |  Story Tags (5)  | Story Themes (2/3) |
|  [+ Ajouter]   |  [+ Ajouter]     | [+ Ajouter]        |
+--------------------------------------------------+
|                |                  |                    |
|  Blessé (4)    |  Bénie Lune      |  Temple Oublié     |
|  [Rouge]       |  [Bleu] (actif)  |  [Vert] (actif)    |
|  [Toggle]      |  [Toggle]        |  [Toggle]          |
|  [Modifier]    |  [Modifier]      |  [Modifier]        |
|  [X]           |  [X]             |  [X]               |
|                |                  |                    |
|  Fatigué (2)   |  Marqué par      |  Vengeance         |
|  [Orange]      |  l'Ombre         |  [Vert] (actif)    |
|  [Toggle]      |  [Bleu] (actif)  |  [Toggle]          |
|  [Modifier]    |  [Toggle]        |  [Modifier]        |
|  [X]           |  [Modifier]      |  [X]               |
|                |  [X]             |                    |
|  Empoisonné (1)|                  |                    |
|  [Vert]        |  Avantage        |  --- ARCHIVÉS ---  |
|  [Toggle]      |  Tactique        |                    |
|  [Modifier]    |  [Bleu] (actif)  |  Mystère Famille   |
|  [X]           |  [Toggle]        |  [Gris] (inactif)  |
|                |  [Modifier]      |  [Réactiver]       |
|                |  [X]             |  [Supprimer def.]  |
+--------------------------------------------------+
```

### Modal Ajout Status
```
+------------------------------------------+
|  Ajouter un Status                  [X]  |
+------------------------------------------+
|                                          |
|  Nom du status *                         |
|  [_______________________________]       |
|  2-50 caractères                         |
|                                          |
|  Niveau de gravité *                     |
|  [0 v] 0-5 (0=minime, 5=critique)        |
|                                          |
|  Actif                                   |
|  [X] (coché par défaut)                  |
|                                          |
|  [Annuler]  [Ajouter]                    |
+------------------------------------------+
```

### Modal Ajout Story Tag
```
+------------------------------------------+
|  Ajouter un Story Tag               [X]  |
+------------------------------------------+
|                                          |
|  Nom du tag *                            |
|  [_______________________________]       |
|  2-100 caractères                        |
|                                          |
|  Description (optionnel)                 |
|  [_______________________________]       |
|  [_______________________________]       |
|  Max 500 caractères                      |
|                                          |
|  Actif                                   |
|  [X] (coché par défaut)                  |
|                                          |
|  [Annuler]  [Ajouter]                    |
+------------------------------------------+
```

### Modal Ajout Story Theme
```
+------------------------------------------+
|  Ajouter un Story Theme             [X]  |
+------------------------------------------+
|                                          |
|  Nom du thème *                          |
|  [_______________________________]       |
|  2-100 caractères                        |
|                                          |
|  Description (optionnel)                 |
|  [_______________________________]       |
|  [_______________________________]       |
|  [_______________________________]       |
|  Max 1000 caractères                     |
|                                          |
|  Actif                                   |
|  [X] (coché par défaut)                  |
|                                          |
|  Note : Maximum 3 Story Themes actifs    |
|  simultanément                           |
|                                          |
|  [Annuler]  [Ajouter]                    |
+------------------------------------------+
```

## Critères d'Acceptation Globaux

### Fonctionnel
- [ ] Ajout Status (0-5, max 5 actifs), Story Tag (illimités), Story Theme (max 3 actifs)
- [ ] Modification inline avec validation temps réel
- [ ] Toggle actif/inactif pour archivage
- [ ] Suppression définitive avec confirmation
- [ ] Restauration items archivés (si limites respectées)
- [ ] Recherche Story tags par nom (debounce 300ms)

### Performance
- [ ] Ajout item : < 200ms
- [ ] Modification inline : < 200ms (sauvegarde auto après 2s inactivité)
- [ ] Toggle actif/inactif : < 150ms
- [ ] Suppression : < 200ms
- [ ] Chargement section Trackers : < 300ms (jusqu'à 20 items total)

### UX
- [ ] Badges couleurs pour niveaux Status (vert/orange/rouge)
- [ ] Indicateurs visuels limites (3/5, 2/3)
- [ ] Items archivés affichés en grisé dans section séparée
- [ ] Messages d'erreur si tentative dépassement limites
- [ ] Suggestion archivage si > 10 Story tags actifs

### Technique
- [ ] Prisma Trackers model avec JSON columns pour statuses, storyTags, storyThemes
- [ ] Validation Zod côté serveur (limites, longueurs, niveaux)
- [ ] Contrainte unique sur Trackers.characterId (1-1)
- [ ] Suppression cascade : DELETE Character → DELETE Trackers
- [ ] API routes : GET /api/characters/:id/trackers, PATCH /api/trackers/:id

## Exemples Concrets

### Parcours Léa : Gestion Trackers pendant Session (Timeline)

**Session 1 - 20h00** : Combat initial
```
Aria entre en combat contre des bandits
→ Léa ajoute Status "En combat"
→ Nom: "En combat"
→ Niveau: 0 (pas blessé)
→ Badge vert
→ Status actifs (1/5)
```

**Session 1 - 20h30** : Blessure
```
Aria reçoit un coup d'épée
→ Léa ajoute Status "Blessé"
→ Niveau: 2
→ Badge orange
→ Status actifs (2/5)
```

**Session 1 - 21h00** : Story tag obtenu
```
Aria obtient avantage tactique
→ Léa ajoute Story tag "Position surélevée"
→ Description: "Bonus aux attaques depuis le toit"
→ Actif: Oui
→ Story tags (1)
```

**Session 1 - 21h30** : Fin combat
```
Combat terminé
→ Léa toggle "En combat" : actif → inactif
→ Status archivé (grisé)
→ Status actifs (1/5) - "Blessé (2)" reste actif
→ Toggle "Position surélevée" : inactif
→ Story tag archivé
```

**Session 2 - 20h00** : Aggravation blessure
```
1 jour in-game plus tard, blessure s'aggrave
→ Léa modifie Status "Blessé"
→ Niveau: 2 → 4
→ Badge passe orange → rouge
→ Message: "Status critique"
```

**Session 2 - 20h45** : Story theme lancé
```
Aria découvre indice sur Temple Oublié
→ Léa ajoute Story theme "Le Mystère du Temple Oublié"
→ Description: "Aria enquête sur ce temple ancien lié à sa famille"
→ Actif: Oui
→ Story themes actifs (1/3)
```

**Session 3 - 21h00** : Guérison
```
Aria soignée par clerc
→ Léa modifie Status "Blessé"
→ Niveau: 4 → 1
→ Badge passe rouge → vert
→ Puis toggle inactif (guérison complète)
→ Status archivé
→ Status actifs (0/5)
```

**Session 5 - 22h00** : Story theme résolu
```
Aria résout mystère du Temple
→ Léa toggle Story theme "Temple Oublié" : actif → inactif
→ Déplacé dans section "Story Themes Archivés"
→ Historique narratif conservé
→ Story themes actifs (0/3)
```

**Session 7 - 20h00** : Multiple Story themes
```
Campagne évolue, plusieurs arcs narratifs
→ Léa ajoute:
   1. "Vengeance contre Baron Vordak"
   2. "Alliance avec les Mist Weavers"
   3. "Découvrir origine de ses pouvoirs"
→ Story themes actifs (3/3)
→ Bouton [+ Ajouter] désactivé
→ Tooltip: "Maximum 3 Story themes actifs"

Pour ajouter nouveau theme:
→ Doit d'abord archiver un existant
→ Toggle "Alliance Mist Weavers" : inactif
→ Bouton [+ Ajouter] réactivé
→ Ajoute "Protéger Marcus du danger"
```

## Contraintes Techniques

### Prisma Trackers Model (suggestion)
```prisma
model Trackers {
  id           String    @id @default(uuid())
  characterId  String    @unique // 1-1 relation
  statuses     Json      // Array de Status objects
  storyTags    Json      // Array de StoryTag objects
  storyThemes  Json      // Array de StoryTheme objects
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  character    Character @relation(fields: [characterId], references: [id], onDelete: Cascade)

  @@index([characterId])
}
```

### Validation Zod (exemple)
```typescript
const statusSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2, "Minimum 2 caractères").max(50, "Maximum 50 caractères"),
  level: z.number().int().min(0).max(5),
  active: z.boolean(),
  createdAt: z.date(),
});

const storyTagSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  active: z.boolean(),
  createdAt: z.date(),
});

const storyThemeSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2).max(100),
  description: z.string().max(1000).optional(),
  active: z.boolean(),
  createdAt: z.date(),
});

const trackersSchema = z.object({
  characterId: z.string().uuid(),
  statuses: z.array(statusSchema)
    .refine(arr => arr.filter(s => s.active).length <= 5, {
      message: "Maximum 5 status actifs"
    }),
  storyTags: z.array(storyTagSchema),
  storyThemes: z.array(storyThemeSchema)
    .refine(arr => arr.filter(t => t.active).length <= 3, {
      message: "Maximum 3 Story themes actifs"
    }),
});
```

### Composables Vue (suggestion)
```typescript
// composables/useTrackers.ts
export const useTrackers = () => {
  const trackers = ref<Trackers | null>(null);

  const addStatus = (status: Status) => {
    if (!trackers.value) return;
    const activeCount = trackers.value.statuses.filter(s => s.active).length;
    if (activeCount >= 5) {
      throw new Error("Maximum 5 status actifs");
    }
    trackers.value.statuses.push(status);
  };

  const addStoryTheme = (theme: StoryTheme) => {
    if (!trackers.value) return;
    const activeCount = trackers.value.storyThemes.filter(t => t.active).length;
    if (activeCount >= 3) {
      throw new Error("Maximum 3 Story themes actifs");
    }
    trackers.value.storyThemes.push(theme);
  };

  const toggleActive = (type: 'status' | 'storyTag' | 'storyTheme', id: string) => {
    if (!trackers.value) return;
    const array = trackers.value[`${type}s`];
    const item = array.find((i: any) => i.id === id);
    if (item) {
      item.active = !item.active;
    }
  };

  // ... autres méthodes

  return { trackers, addStatus, addStoryTheme, toggleActive };
};
```

### Logique Couleurs Status (exemple)
```typescript
const getStatusBadgeColor = (level: number): string => {
  if (level <= 1) return 'green';  // 0-1 : vert
  if (level <= 3) return 'orange'; // 2-3 : orange
  return 'red';                     // 4-5 : rouge
};
```

## Scope MVP vs Versions Futures

### MVP v1.0
- 3 Trackers : Status (max 5 actifs), Story Tag (illimités), Story Theme (max 3 actifs)
- CRUD items avec archivage (toggle actif/inactif)
- Suppression définitive optionnelle
- Niveaux Status (0-5) avec couleurs
- Recherche Story tags
- Sauvegarde automatique

### v1.2
- Timers/countdowns pour Story tags (expiration automatique)
- Historique modifications (timeline d'événements)
- Templates Status prédéfinis (Blessé, Fatigué, Empoisonné, etc.)
- Export trackers vers journal de session

### v2.0+
- Trackers custom (définis par MJ/joueur)
- Notifications/rappels pour Story themes en cours
- Statistiques (temps moyen Story theme actif, Status les plus fréquents)
- Intégration VTT (synchronisation Roll20, Foundry)

---
**Date** : 2025-01-19
**Version** : 1.0
**Statut** : Validé
**Priorité** : P0 (MVP)
**Références** : LITM rulebook (trackers concept), characters-of-the-mist (structure JSON), litm-player (implémentation trackers)