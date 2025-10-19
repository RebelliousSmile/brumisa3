# Code Review - [Nom de la Feature/PR]

## Informations Generales

- **Date**: YYYY-MM-DD
- **Reviewer**: [Nom]
- **Code Reviewed**: [Fichiers ou composants]
- **Branch/Commit**: [nom-branche ou hash-commit]

## Objectif du Code

[Description breve de ce que le code est cense faire]

## Checklist de Review

### Architecture & Design

- [ ] Le code respecte les principes SOLID
- [ ] Le code suit le principe DRY (Don't Repeat Yourself)
- [ ] La separation des responsabilites est claire
- [ ] Les abstractions sont appropriees
- [ ] Le code est modulaire et reutilisable

### Qualite du Code

- [ ] Le code est lisible et comprehensible
- [ ] Les noms de variables/fonctions sont explicites
- [ ] Les fonctions ont une seule responsabilite
- [ ] Pas de code duplique
- [ ] Pas de code mort (code commente ou non utilise)
- [ ] Les commentaires expliquent le "pourquoi", pas le "quoi"

### Performance

- [ ] Pas de requetes N+1
- [ ] Les queries sont optimisees (indexes, select specifiques)
- [ ] Pas de calculs lourds inutiles dans les boucles
- [ ] Le caching est utilise quand approprie
- [ ] Les ressources sont liberees correctement

### Securite

- [ ] Pas de donnees sensibles en dur dans le code
- [ ] Les inputs utilisateur sont valides et sanitizes
- [ ] Les queries SQL utilisent des placeholders ($1, $2, etc.)
- [ ] Les variables d'environnement sont utilisees pour les configs
- [ ] Pas de failles XSS ou injection SQL potentielles

### Tests

- [ ] Des tests unitaires existent pour le code metier
- [ ] Les tests couvrent les cas limites
- [ ] Les tests sont maintenables et comprehensibles
- [ ] Les mocks sont utilises uniquement si necessaire

### Nuxt 4 / Vue 3 Specifique

- [ ] Composition API utilisee correctement
- [ ] Les composables sont bien structures
- [ ] Les stores Pinia suivent les bonnes pratiques
- [ ] Les API routes Nitro sont optimisees
- [ ] SSR/CSR est gere correctement

### Base de Donnees (Prisma)

- [ ] Le schema Prisma est correct
- [ ] Les relations sont bien definies
- [ ] Les migrations sont versionnees
- [ ] Les methodes Prisma sont utilisees (pas de SQL brut sauf si necessaire)

## Points Positifs

- [Point fort 1]
- [Point fort 2]
- [Point fort 3]

## Points a Ameliorer

### Critiques (Bloquants)

- [ ] **[Fichier:ligne]**: [Description du probleme critique]
  - **Raison**: [Pourquoi c'est critique]
  - **Solution proposee**: [Comment corriger]

### Suggestions (Non-bloquants)

- [ ] **[Fichier:ligne]**: [Description de la suggestion]
  - **Raison**: [Pourquoi c'est mieux]
  - **Solution proposee**: [Comment ameliorer]

## Recommandations Generales

[Conseils generaux pour ameliorer le code ou l'approche]

## Questions pour le Developpeur

1. [Question 1]
2. [Question 2]

## Decision Finale

- [ ] **APPROVED** - Code pret pour merge
- [ ] **APPROVED WITH COMMENTS** - Code OK mais suggestions a considerer
- [ ] **CHANGES REQUESTED** - Corrections necessaires avant merge
- [ ] **NEEDS DISCUSSION** - Discussion requise sur l'approche

## Notes Additionnelles

[Toute information supplementaire ou contexte important]
