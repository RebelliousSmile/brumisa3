# Task - Migration et Import de Personnages

## Métadonnées
- **ID**: TASK-2025-01-19-019
- **Priorité**: Critique
- **Statut**: À faire
- **Temps estimé**: 3h

## Description

Créer un système d'import/migration pour permettre aux utilisateurs d'importer des personnages depuis le format characters-of-the-mist ou d'autres sources.

## Contexte

Les utilisateurs peuvent avoir des personnages créés avec characters-of-the-mist ou des fichiers JSON personnalisés. Il faut un outil de migration pour ne pas perdre ces données.

## Fichiers

- `server/utils/litm/migration.ts` (Parser & Converter)
- `server/api/litm/import.post.ts` (Endpoint d'import)
- `app/pages/univers/legends-in-the-mist/personnages/importer.vue`
- `app/composables/litm/useImport.ts`
- `tests/utils/litm-migration.spec.ts`

## Fonctionnalités

### 1. Parser de Fichiers
```typescript
// Supporte plusieurs formats
interface ImportParser {
  parseCharactersOfTheMist(json: any): LitmCharacter
  parseGenericJSON(json: any): LitmCharacter
  validate(json: any): { valid: boolean; errors: string[] }
}
```

### 2. Conversion
- Mapper les champs du format source vers Prisma
- Créer les relations (cards, trackers, tags)
- Valider les données
- Gérer les champs manquants (defaults)

### 3. Interface Utilisateur
- Upload de fichier JSON
- Prévisualisation du personnage avant import
- Validation en temps réel
- Messages d'erreur explicites
- Confirmation avant import définitif

### 4. Gestion d'Erreurs
- Fichier invalide (JSON malformé)
- Structure incompatible
- Données manquantes critiques
- Doublons (nom de personnage existant)

## Format characters-of-the-mist

```json
{
  "type": "LEGENDS_FULL_CHARACTER_SHEET",
  "name": "Nom du Héros",
  "cards": [
    {
      "type": "LEGENDS_CHARACTER_THEME",
      "themeType": "Origin",
      "themebook": "circumstance",
      "mainTag": "Tag principal",
      "powerTags": ["tag1", "tag2"],
      "weaknessTags": ["tag3"],
      "quest": {
        "content": "Texte de la quête",
        "pips": 2
      }
    }
  ],
  "trackers": [
    {
      "type": "LEGENDS_STATUS_TRACKER",
      "name": "Blessé",
      "pips": 1
    }
  ]
}
```

## Mapping vers Prisma

```typescript
const convertToPrisma = (source: any) => {
  return {
    name: source.name,
    game: 'LEGENDS',
    themeCards: source.cards.map(card => ({
      type: card.type === 'LEGENDS_CHARACTER_THEME' ? 'CHARACTER' : 'FELLOWSHIP',
      themeType: card.themeType,
      themebook: card.themebook,
      mainTag: card.mainTag,
      powerTags: {
        create: card.powerTags.map((tag, i) => ({
          content: tag,
          type: 'POWER',
          order: i
        }))
      },
      weaknessTags: {
        create: card.weaknessTags.map((tag, i) => ({
          content: tag,
          type: 'WEAKNESS',
          order: i
        }))
      },
      quest: card.quest ? {
        create: {
          content: card.quest.content,
          pips: card.quest.pips
        }
      } : undefined
    })),
    trackers: source.trackers.map((tracker, i) => ({
      type: tracker.type.replace('LEGENDS_', '').replace('_TRACKER', ''),
      name: tracker.name,
      pips: tracker.pips,
      order: i
    }))
  }
}
```

## Plan d'Implémentation

### Étape 1: Parser & Validator (1h)
- Créer les fonctions de parsing
- Validation des structures
- Tests unitaires

### Étape 2: API Endpoint (1h)
- POST /api/litm/import
- Validation
- Conversion
- Création en DB

### Étape 3: Interface Utilisateur (1h)
- Page d'import
- Upload fichier
- Prévisualisation
- Feedback utilisateur

## Critères d'Acceptation

- [ ] Import depuis characters-of-the-mist fonctionne
- [ ] Validation robuste des données
- [ ] Prévisualisation avant import
- [ ] Messages d'erreur clairs
- [ ] Tests couvrent les cas d'erreur
- [ ] Gestion des doublons
- [ ] Documentation utilisateur

## Bloqueurs

- TASK-004 (Modèle Prisma)
- TASK-009A (API Characters)

## Références

- [characters-of-the-mist Format](https://github.com/Altervayne/characters-of-the-mist)
