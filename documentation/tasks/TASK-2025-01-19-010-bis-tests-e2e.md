# Task - Suite de Tests E2E LITM

## Métadonnées
- **ID**: TASK-2025-01-19-010-bis
- **Priorité**: Haute | **Temps estimé**: 4h | **Statut**: À faire

## Description
Créer une suite complète de tests End-to-End pour valider tous les flows utilisateur LITM.

## Fichiers
- `tests/e2e/litm-character-creation.spec.ts`
- `tests/e2e/litm-character-edition.spec.ts`
- `tests/e2e/litm-import-export.spec.ts`
- `tests/e2e/litm-cards-management.spec.ts`
- `tests/e2e/litm-trackers-management.spec.ts`

## Scénarios de Test

### 1. Création Complète de Personnage
```typescript
test('should create a complete LITM character', async () => {
  // 1. Naviguer vers /univers/legends-in-the-mist/personnages/nouveau
  // 2. Entrer le nom du personnage
  // 3. Créer une Hero Card avec relations
  // 4. Ajouter 2 Theme Cards (Origin + Adventure)
  // 5. Ajouter des power/weakness tags
  // 6. Créer 2 Status Trackers
  // 7. Sauvegarder
  // 8. Vérifier la redirection
  // 9. Vérifier la persistance en DB
})
```

### 2. Édition de Personnage
```typescript
test('should edit existing character', async () => {
  // 1. Créer un personnage de test
  // 2. Ouvrir en mode édition
  // 3. Modifier le nom
  // 4. Ajouter un tag
  // 5. Supprimer un tracker
  // 6. Sauvegarder
  // 7. Vérifier les changements
})
```

### 3. Import/Export
```typescript
test('should export and import character', async () => {
  // 1. Créer un personnage
  // 2. Exporter en JSON
  // 3. Supprimer le personnage
  // 4. Importer le JSON
  // 5. Vérifier que tout est identique
})
```

### 4. Gestion des Cartes
```typescript
test('should manage theme cards', async () => {
  // 1. Créer personnage
  // 2. Ajouter Theme Card
  // 3. Éditer main tag
  // 4. Ajouter power tags
  // 5. Flip la carte (recto/verso)
  // 6. Supprimer la carte
})
```

### 5. Gestion des Trackers
```typescript
test('should manage trackers', async () => {
  // 1. Créer personnage
  // 2. Ajouter Status Tracker
  // 3. Incrémenter les pips
  // 4. Vérifier le label (Abandon/Améliorer/etc)
  // 5. Supprimer le tracker
})
```

### 6. Tests de Performance
```typescript
test('should load character page in < 2s', async () => {
  // Mesurer le temps de chargement
  // Vérifier < 2000ms
})

test('should handle 10 theme cards without lag', async () => {
  // Créer personnage avec 10 cartes
  // Vérifier la fluidité
})
```

## Outils
- Playwright ou Cypress
- @nuxt/test-utils
- Fixtures pour données de test

## Bloqueurs
- TASK-010 (Page création) doit être terminée
- Toute la Phase 2 doit être fonctionnelle

## Critères d'Acceptation
- [ ] Tous les scénarios passent
- [ ] Tests exécutables en CI/CD
- [ ] Temps d'exécution < 5 min
- [ ] Screenshots en cas d'échec
- [ ] Couverture des flows critiques
