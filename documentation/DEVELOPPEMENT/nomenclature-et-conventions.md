# Nomenclature et Conventions de Code

## Base de donnees et Prisma

### Convention de nommage

Le schema Prisma utilise **snake_case** pour tous les noms de modeles et de colonnes, conformement a la convention PostgreSQL.

#### Modeles (Tables)

Les noms de modeles sont au **pluriel** et en **snake_case** :

```typescript
// Correct
await prisma.utilisateurs.findMany()
await prisma.systemes_jeu.findMany()
await prisma.newsletter_abonnes.count()

// Incorrect
await prisma.utilisateur.findMany()
await prisma.systemeJeu.findMany()
await prisma.newsletterAbonne.count()
```

#### Colonnes (Champs)

Les noms de colonnes sont en **snake_case** :

```typescript
// Correct
{
  where: {
    nom_complet: 'John Doe',
    date_creation: { gte: new Date() }
  },
  orderBy: {
    ordre_affichage: 'asc'
  }
}

// Incorrect
{
  where: {
    nomComplet: 'John Doe',
    dateCreation: { gte: new Date() }
  },
  orderBy: {
    ordreAffichage: 'asc'
  }
}
```

#### Relations

Les relations utilisent egalement **snake_case** :

```typescript
// Correct
await prisma.systemes_jeu.findMany({
  include: {
    univers_jeu: true
  }
})

// Correct (relation avec alias long genere par Prisma)
await prisma.documents.findMany({
  include: {
    utilisateurs_documents_utilisateur_idToutilisateurs: {
      select: { email: true }
    }
  }
})

// Incorrect
await prisma.systemes_jeu.findMany({
  include: {
    universJeu: true
  }
})
```

### Tableau de reference rapide

| Element | Convention | Exemple correct | Exemple incorrect |
|---------|-----------|----------------|-------------------|
| Modele | snake_case (pluriel) | `utilisateurs` | `utilisateur`, `Utilisateurs` |
| Colonne | snake_case | `nom_complet` | `nomComplet`, `NomComplet` |
| Relation | snake_case | `univers_jeu` | `universJeu`, `UniversJeu` |

## TypeScript et JavaScript

### Fichiers

- **Composants Vue** : PascalCase - `HeroCard.vue`
- **Pages** : kebab-case - `[id].vue`
- **API Routes** : kebab-case - `index.get.ts`
- **Utils/Services** : camelCase - `prisma.ts`
- **Types** : PascalCase - `Character.ts`

### Code

- **Variables** : camelCase - `const userName = 'John'`
- **Fonctions** : camelCase - `function getUserById() {}`
- **Classes** : PascalCase - `class UserService {}`
- **Types/Interfaces** : PascalCase - `interface UserData {}`
- **Constantes** : SCREAMING_SNAKE_CASE - `const API_BASE_URL = '...'`

## Imports

### Imports relatifs vs alias

Utiliser des **imports relatifs** pour les fichiers server-side (API routes, config) :

```typescript
// Correct (server-side)
import { getHackConfig } from '../../config/hacks'
import { prisma } from '../utils/prisma'

// Incorrect (server-side)
import { getHackConfig } from '~/server/config/hacks'
```

Utiliser **#imports** ou **~/app/** pour le code client-side :

```typescript
// Correct (client-side)
import { useLitmCharacterStore } from '#imports'
import MyComponent from '~/app/components/MyComponent.vue'
```

## Commits Git

Format des messages de commit :

```
type(scope): description courte

- Detail 1
- Detail 2
```

Types :
- `feat` : Nouvelle fonctionnalite
- `fix` : Correction de bug
- `refactor` : Refactoring sans changement fonctionnel
- `docs` : Documentation
- `style` : Formatage, style
- `test` : Tests
- `chore` : Taches de maintenance

Exemples :
```
feat(litm): Add character creation workflow

- Implement HeroCard component
- Add theme card creation
- Setup character store

fix(api): Correct Prisma model names

- Fix utilisateur -> utilisateurs
- Fix nomComplet -> nom_complet
- Update all API routes
```

## Remarques importantes

1. **Ne jamais melanger les conventions** : Si le schema Prisma utilise snake_case, le code doit suivre
2. **Regenerer le client Prisma** apres modification du schema : `pnpm prisma generate`
3. **Verifier les types TypeScript** : Utiliser l'autocompletion pour eviter les erreurs de nommage
