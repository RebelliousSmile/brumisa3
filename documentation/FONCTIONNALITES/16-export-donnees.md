# Export de Données

## Vue d'Ensemble
Export JSON des personnages LITM pour sauvegarde locale et interopérabilité. Format compatible characters-of-the-mist. Export PDF et import JSON reportés en versions ultérieures.

## User Stories

### US-160 : Exporter un personnage en JSON
**En tant que** Léa
**Je veux** exporter un personnage complet en JSON
**Afin de** sauvegarder localement ou partager avec mon groupe

**Contexte** : Léa veut sauvegarder Aria avant une session importante, au cas où.

**Critères d'acceptation** :
- [ ] Bouton "Exporter JSON" visible sur page personnage
- [ ] Export inclut : Character + ThemeCards + HeroCard + Trackers
- [ ] Métadonnées : version schema, date export, auteur
- [ ] Téléchargement immédiat fichier JSON
- [ ] Nom fichier : `[nom-personnage]-[date].json`
- [ ] Format valide (validation JSON Schema)

**Exemples** :
```
Léa sur /characters/aria-uuid/edit
→ Bouton [Exporter JSON]
→ Clique "Exporter JSON"
→ Génération JSON en < 500ms
→ Téléchargement automatique: `aria-the-mist-weaver-2025-01-19.json`
→ Message: "Aria exportée avec succès"
```

### US-161 : Exporter tous les personnages d'un playspace
**En tant que** Léa
**Je veux** exporter tous les personnages d'un playspace en un clic
**Afin de** sauvegarder tout mon univers de jeu

**Contexte** : Léa a 3 personnages dans "Workspace Aria", veut tout exporter avant migration ordinateur.

**Critères d'acceptation** :
- [ ] Bouton "Exporter tous (ZIP)" sur page playspace
- [ ] Génération ZIP avec 1 JSON par personnage
- [ ] Nom fichier ZIP : `[nom-playspace]-[date].zip`
- [ ] Fichier manifest.json dans ZIP (liste personnages, métadonnées)
- [ ] Temps export < 2s pour 10 personnages

**Exemples** :
```
Léa sur /playspaces/workspace-aria
→ Section "Personnages (3)"
→ Bouton [Exporter tous (ZIP)]
→ Clique "Exporter tous"
→ Génération ZIP en < 1s (3 personnages)
→ Téléchargement: `workspace-aria-2025-01-19.zip`
→ Contenu ZIP:
   - aria-the-mist-weaver.json
   - kael-shadowblade.json
   - nova-starlight.json
   - manifest.json
```

### US-162 : Télécharger l'export localement
**En tant que** Léa
**Je veux** que le téléchargement soit immédiat et local
**Afin de** contrôler où je sauvegarde mes données

**Contexte** : Léa exporte Aria et veut choisir le dossier de destination.

**Critères d'acceptation** :
- [ ] Déclenchement téléchargement browser natif
- [ ] Pas de stockage côté serveur (génération à la volée)
- [ ] Support tous browsers modernes (Chrome, Firefox, Edge)
- [ ] Pas de limite taille fichier (raisonnable : < 5 MB par personnage)
- [ ] Indicateur progression si export > 1s

**Exemples** :
```
Léa clique "Exporter JSON"
→ Loading indicator: "Génération en cours..."
→ Génération terminée (380ms)
→ Browser dialog "Enregistrer sous"
→ Léa choisit dossier: C:\Users\Léa\Documents\Brumisa3\Backups
→ Fichier téléchargé
→ Message: "Export terminé"
```

### US-163 : Valider le format JSON exporté
**En tant que** développeur (validation technique pour Léa)
**Je veux** que le JSON exporté soit valide et compatible
**Afin de** garantir interopérabilité avec characters-of-the-mist

**Contexte** : Léa exporte Aria, le fichier doit être compatible avec l'écosystème LITM.

**Critères d'acceptation** :
- [ ] Validation contre JSON Schema characters-of-the-mist
- [ ] Version schema incluse : `"schemaVersion": "1.0.0"`
- [ ] Dates au format ISO 8601
- [ ] Pas de données sensibles (email, passwords)
- [ ] Anonymisation automatique (userId remplacé par placeholder)

**Exemples** :
```json
{
  "schemaVersion": "1.0.0",
  "exportDate": "2025-01-19T15:30:00Z",
  "exportedBy": "anonymous",
  "character": {
    "id": "uuid-aria",
    "name": "Aria the Mist Weaver",
    "description": "Une tisseuse de brume...",
    "level": 3,
    "avatarUrl": "https://...",
    "createdAt": "2025-01-15T10:00:00Z",
    "updatedAt": "2025-01-19T14:00:00Z"
  },
  "themeCards": [ /* ... */ ],
  "heroCard": { /* ... */ },
  "trackers": { /* ... */ }
}
```

## Format JSON

### Structure Export Personnage
```typescript
interface CharacterExport {
  schemaVersion: string;        // "1.0.0"
  exportDate: string;           // ISO 8601
  exportedBy: string;           // "anonymous" ou nom utilisateur
  character: {
    id: string;
    name: string;
    description?: string;
    avatarUrl?: string;
    level: number;
    createdAt: string;          // ISO 8601
    updatedAt: string;          // ISO 8601
  };
  themeCards: ThemeCardExport[];
  heroCard?: HeroCardExport;
  trackers: TrackersExport;
}

interface ThemeCardExport {
  id: string;
  title: string;
  description?: string;
  type: "Mythos" | "Logos";
  powerTags: string[];
  weaknessTags: string[];
  createdAt: string;
  updatedAt: string;
}

interface HeroCardExport {
  id: string;
  relations: {
    id: string;
    name: string;
    type?: string;
    description?: string;
  }[];
  quintessences: string[];
  createdAt: string;
  updatedAt: string;
}

interface TrackersExport {
  statuses: {
    id: string;
    name: string;
    level: number;
    active: boolean;
    createdAt: string;
  }[];
  storyTags: {
    id: string;
    name: string;
    description?: string;
    active: boolean;
    createdAt: string;
  }[];
  storyThemes: {
    id: string;
    name: string;
    description?: string;
    active: boolean;
    createdAt: string;
  }[];
}
```

### Manifest.json (Export Multiple)
```typescript
interface ManifestExport {
  schemaVersion: string;
  exportDate: string;
  playspaceName: string;
  characterCount: number;
  characters: {
    filename: string;
    characterName: string;
    characterId: string;
    level: number;
  }[];
}
```

### Exemple Complet
```json
{
  "schemaVersion": "1.0.0",
  "exportDate": "2025-01-19T15:30:45Z",
  "exportedBy": "anonymous",
  "character": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Aria the Mist Weaver",
    "description": "Une jeune tisseuse de brume...",
    "avatarUrl": "https://example.com/avatar.jpg",
    "level": 3,
    "createdAt": "2025-01-15T10:00:00Z",
    "updatedAt": "2025-01-19T14:00:00Z"
  },
  "themeCards": [
    {
      "id": "theme-card-uuid-1",
      "title": "Shadow Dancer",
      "description": "Aria manipule les ombres...",
      "type": "Mythos",
      "powerTags": [
        "Teleport through shadows",
        "Blend into darkness",
        "See in pitch black",
        "Create shadow constructs"
      ],
      "weaknessTags": [
        "Vulnerable in bright light",
        "Powers weaken at sunrise"
      ],
      "createdAt": "2025-01-15T15:00:00Z",
      "updatedAt": "2025-01-18T20:00:00Z"
    },
    {
      "id": "theme-card-uuid-2",
      "title": "Mist Weaver",
      "type": "Mythos",
      "powerTags": [
        "Generate thick fog",
        "Shape mist into forms",
        "Breathe underwater (mist)",
        "Summon mist creatures"
      ],
      "weaknessTags": [
        "Wind disperses mist instantly"
      ],
      "createdAt": "2025-01-15T15:30:00Z",
      "updatedAt": "2025-01-17T18:00:00Z"
    }
  ],
  "heroCard": {
    "id": "hero-card-uuid",
    "relations": [
      {
        "id": "relation-uuid-1",
        "name": "Kael Nightshade",
        "type": "Mentor",
        "description": "Ancien Shadow Dancer, a formé Aria pendant 5 ans"
      },
      {
        "id": "relation-uuid-2",
        "name": "Lyra Brightflame",
        "type": "Rival",
        "description": "Maître du feu, philosophie opposée"
      },
      {
        "id": "relation-uuid-3",
        "name": "Marcus le Forgeron",
        "type": "Amour",
        "description": "Ami d'enfance devenu plus important"
      }
    ],
    "quintessences": [
      "Protéger ceux qui ne peuvent se défendre",
      "Maîtriser la brume mieux que quiconque"
    ],
    "createdAt": "2025-01-16T10:00:00Z",
    "updatedAt": "2025-01-18T14:00:00Z"
  },
  "trackers": {
    "statuses": [
      {
        "id": "status-uuid-1",
        "name": "Blessé",
        "level": 2,
        "active": false,
        "createdAt": "2025-01-17T20:30:00Z"
      }
    ],
    "storyTags": [
      {
        "id": "story-tag-uuid-1",
        "name": "Bénie par la Lune",
        "description": "Bonus aux jets liés aux ombres pendant 24h",
        "active": false,
        "createdAt": "2025-01-17T21:00:00Z"
      }
    ],
    "storyThemes": [
      {
        "id": "story-theme-uuid-1",
        "name": "Le Mystère du Temple Oublié",
        "description": "Aria enquête sur ce temple ancien lié à sa famille",
        "active": false,
        "createdAt": "2025-01-16T20:00:00Z"
      },
      {
        "id": "story-theme-uuid-2",
        "name": "Vengeance contre Baron Vordak",
        "description": "Le Baron cherche à capturer Aria",
        "active": true,
        "createdAt": "2025-01-18T19:00:00Z"
      }
    ]
  }
}
```

## Règles Métier

### Anonymisation et Sécurité
1. **Pas de données sensibles** : Email, password, tokens exclus de l'export
2. **Anonymisation automatique** : `userId` remplacé par `"anonymous"` ou nom utilisateur public
3. **Pas de metadata serveur** : Pas d'IPs, logs, chemins fichiers serveur
4. **Données publiques uniquement** : Uniquement données créées par l'utilisateur

### Compatibilité et Interopérabilité
1. **Format characters-of-the-mist** : Validation JSON Schema avant export
2. **Version schema** : `schemaVersion: "1.0.0"` pour rétrocompatibilité future
3. **Dates ISO 8601** : Format standard international
4. **UUIDs conservés** : IDs préservés pour import futur (v1.3+)

### Performance
1. **Génération à la volée** : Pas de stockage côté serveur, génération lors du clic
2. **Temps export** : < 1s pour 1 personnage, < 2s pour 10 personnages
3. **Pas de limite taille** : Raisonnable < 5 MB par personnage (très généreux)
4. **Streaming si nécessaire** : Si export lourd (> 20 personnages), streaming réponse

### Nommage Fichiers
1. **Format nom personnage** : `[nom-personnage]-[date].json` (kebab-case)
2. **Format ZIP playspace** : `[nom-playspace]-[date].zip`
3. **Date format** : `YYYY-MM-DD` (ISO 8601 court)
4. **Caractères spéciaux** : Remplacés par tirets (é → e, espaces → tirets)

## Interface Utilisateur

### Bouton Export (Page Personnage)
```
+--------------------------------------------------+
|  ARIA THE MIST WEAVER              Niveau 3      |
+--------------------------------------------------+
|  [Modifier] [Dupliquer] [Exporter JSON]          |
+--------------------------------------------------+
```

### Bouton Export Multiple (Page Playspace)
```
+--------------------------------------------------+
|  WORKSPACE ARIA                                  |
+--------------------------------------------------+
|  Personnages (3)                                 |
|  [+ Nouveau] [Exporter tous (ZIP)]               |
+--------------------------------------------------+
```

### Modal Export en Cours
```
+------------------------------------------+
|  Export en cours                         |
+------------------------------------------+
|                                          |
|  [====================] 80%              |
|                                          |
|  Génération de aria-the-mist-weaver.json |
|                                          |
+------------------------------------------+
```

### Notification Succès
```
+------------------------------------------+
| ✓ Aria the Mist Weaver exportée !       |
|   aria-the-mist-weaver-2025-01-19.json   |
|   Téléchargement terminé                 |
+------------------------------------------+
```

## Critères d'Acceptation Globaux

### Fonctionnel
- [ ] Export JSON personnage individuel avec toutes relations
- [ ] Export ZIP multiple personnages + manifest.json
- [ ] Téléchargement browser natif immédiat
- [ ] Format valide JSON Schema characters-of-the-mist
- [ ] Anonymisation automatique données sensibles

### Performance
- [ ] Export 1 personnage : < 1s
- [ ] Export 10 personnages (ZIP) : < 2s
- [ ] Génération à la volée, pas de stockage serveur
- [ ] Indicateur progression si export > 1s

### UX
- [ ] Bouton "Exporter JSON" visible et accessible
- [ ] Nom fichier descriptif (personnage + date)
- [ ] Notification succès après téléchargement
- [ ] Message d'erreur si export échoue (avec raison)
- [ ] Pas d'interruption workflow (modal non bloquante)

### Technique
- [ ] API route : GET /api/characters/:id/export (retourne JSON)
- [ ] API route : GET /api/playspaces/:id/export (retourne ZIP)
- [ ] Validation JSON Schema avant envoi
- [ ] Headers HTTP corrects (Content-Type, Content-Disposition)
- [ ] Support CORS si nécessaire (accès depuis autres outils)

## Exemples Concrets

### Parcours Léa : Export Simple (Timeline)

**Jour 8 - 16h00** : Décision d'exporter
```
Léa veut sauvegarder Aria avant session importante
→ Page /characters/aria-uuid/edit
→ Clique [Exporter JSON]
→ Loading: "Génération en cours..."
```

**Jour 8 - 16h00:01** : Génération
```
Serveur génère JSON en 380ms
→ Character + 4 ThemeCards + 1 HeroCard + Trackers
→ Validation JSON Schema OK
→ Métadonnées ajoutées
→ Anonymisation userId → "anonymous"
```

**Jour 8 - 16h00:01** : Téléchargement
```
Browser déclenche téléchargement natif
→ Fichier: `aria-the-mist-weaver-2025-01-19.json`
→ Taille: 12 KB
→ Léa choisit dossier: C:\Users\Léa\Documents\Brumisa3\Backups
→ Téléchargement terminé
→ Notification: "Aria the Mist Weaver exportée !"
```

### Parcours Léa : Export Multiple (Timeline)

**Jour 12 - 14h00** : Export complet playspace
```
Léa migre vers nouvel ordinateur
→ Veut exporter tous personnages Workspace Aria
→ Page /playspaces/workspace-aria
→ Clique [Exporter tous (ZIP)]
```

**Jour 12 - 14h00:01** : Génération ZIP
```
Serveur génère ZIP en 1.2s
→ 3 personnages :
   - aria-the-mist-weaver.json (12 KB)
   - kael-shadowblade.json (8 KB)
   - nova-starlight.json (6 KB)
→ manifest.json (2 KB)
→ Total ZIP : 28 KB compressé
```

**Jour 12 - 14h00:02** : Téléchargement ZIP
```
Browser télécharge:
→ Fichier: `workspace-aria-2025-01-19.zip`
→ Léa extrait ZIP sur nouvel ordinateur
→ Vérifie manifest.json:
   {
     "schemaVersion": "1.0.0",
     "exportDate": "2025-01-19T14:00:00Z",
     "playspaceName": "Workspace Aria",
     "characterCount": 3,
     "characters": [
       {
         "filename": "aria-the-mist-weaver.json",
         "characterName": "Aria the Mist Weaver",
         "level": 3
       },
       { /* ... */ }
     ]
   }
→ Tous fichiers intacts
```

### Parcours Marc : Partage avec Groupe

**Jour 5 - 18h00** : Partage personnage
```
Marc (MJ) exporte PNJ pour partager avec joueurs
→ Exporte "Baron Vordak" en JSON
→ Envoie fichier via Discord
→ Joueur Léa récupère JSON
→ (Import sera disponible en v1.3)
```

## Contraintes Techniques

### API Routes
```typescript
// GET /api/characters/:id/export
// Retourne JSON direct avec headers appropriés
export default defineEventHandler(async (event) => {
  const characterId = getRouterParam(event, 'id');

  // Fetch character avec relations
  const character = await prisma.character.findUnique({
    where: { id: characterId },
    include: {
      themeCards: true,
      heroCard: true,
      trackers: true,
    }
  });

  // Transformation en format export
  const exportData: CharacterExport = {
    schemaVersion: "1.0.0",
    exportDate: new Date().toISOString(),
    exportedBy: "anonymous", // ou session.user.name
    character: {
      id: character.id,
      name: character.name,
      // ... autres champs
    },
    themeCards: character.themeCards.map(tc => ({
      // ... transformation
    })),
    heroCard: character.heroCard ? { /* ... */ } : undefined,
    trackers: { /* ... */ }
  };

  // Validation JSON Schema
  validateExportSchema(exportData);

  // Headers
  setHeader(event, 'Content-Type', 'application/json');
  setHeader(event, 'Content-Disposition',
    `attachment; filename="${slugify(character.name)}-${formatDate(new Date())}.json"`
  );

  return exportData;
});
```

### Génération ZIP
```typescript
// GET /api/playspaces/:id/export
import JSZip from 'jszip';

export default defineEventHandler(async (event) => {
  const playspaceId = getRouterParam(event, 'id');

  // Fetch playspace avec tous personnages
  const playspace = await prisma.playspace.findUnique({
    where: { id: playspaceId },
    include: {
      characters: {
        include: {
          themeCards: true,
          heroCard: true,
          trackers: true,
        }
      }
    }
  });

  const zip = new JSZip();

  // Ajouter chaque personnage
  for (const character of playspace.characters) {
    const exportData = transformCharacterToExport(character);
    const filename = `${slugify(character.name)}.json`;
    zip.file(filename, JSON.stringify(exportData, null, 2));
  }

  // Ajouter manifest
  const manifest: ManifestExport = {
    schemaVersion: "1.0.0",
    exportDate: new Date().toISOString(),
    playspaceName: playspace.name,
    characterCount: playspace.characters.length,
    characters: playspace.characters.map(c => ({
      filename: `${slugify(c.name)}.json`,
      characterName: c.name,
      characterId: c.id,
      level: c.level,
    }))
  };
  zip.file('manifest.json', JSON.stringify(manifest, null, 2));

  // Générer ZIP
  const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

  // Headers
  setHeader(event, 'Content-Type', 'application/zip');
  setHeader(event, 'Content-Disposition',
    `attachment; filename="${slugify(playspace.name)}-${formatDate(new Date())}.zip"`
  );

  return zipBuffer;
});
```

### Utilitaires
```typescript
// utils/export.ts
import { z } from 'zod';

// Validation JSON Schema
const exportSchema = z.object({
  schemaVersion: z.string(),
  exportDate: z.string().datetime(),
  exportedBy: z.string(),
  character: z.object({ /* ... */ }),
  themeCards: z.array(z.object({ /* ... */ })),
  // ... autres champs
});

export const validateExportSchema = (data: unknown) => {
  exportSchema.parse(data);
};

// Slugify nom fichier
export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprimer accents
    .replace(/[^a-z0-9]+/g, '-')     // Remplacer espaces/spéciaux par tirets
    .replace(/^-+|-+$/g, '');        // Supprimer tirets début/fin
};

// Format date YYYY-MM-DD
export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};
```

## Scope MVP vs Versions Futures

### MVP v1.0
- Export JSON personnage individuel
- Export ZIP multiple personnages (playspace)
- Format compatible characters-of-the-mist
- Téléchargement browser natif
- Métadonnées et anonymisation

### v1.3
- Import JSON (restauration personnage)
- Import avec mapping (résolution conflits IDs)
- Import multiple depuis ZIP
- Validation strict import (schemaVersion, intégrité)

### v2.0+
- Export PDF complet avec mise en page professionnelle
- Export markdown pour documentation
- Export vers outils tiers (Roll20, Foundry VTT)
- API publique pour intégrations tierces

---
**Date** : 2025-01-19
**Version** : 1.0
**Statut** : Validé
**Priorité** : P0 (MVP)
**Références** : characters-of-the-mist (JSON Schema), litm-player (structure export)