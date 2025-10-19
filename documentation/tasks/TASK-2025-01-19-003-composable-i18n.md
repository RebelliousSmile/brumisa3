# Task - Composable de traduction LITM

## Métadonnées

- **ID**: TASK-2025-01-19-003
- **Date de création**: 2025-01-19
- **Créé par**: Claude
- **Priorité**: Haute
- **Statut**: À faire
- **Temps estimé**: 2h
- **Temps réel**: -

## Description

### Objectif

Créer un composable Vue 3 `useI18nLitm()` pour faciliter l'accès aux traductions "Legends in the Mist" avec typage TypeScript et fallback automatique.

### Contexte

Les traductions LITM sont organisées en plusieurs fichiers (characters, cards, trackers, etc.). Un composable dédié simplifiera l'accès à ces traductions et offrira une meilleure DX (Developer Experience) avec auto-complétion.

### Périmètre

**Inclus dans cette tâche**:
- Création du composable `useI18nLitm()`
- Typage TypeScript des clés de traduction
- Gestion du fallback FR/EN
- Helpers pour les cas d'usage courants
- Tests unitaires avec Vitest

**Exclu de cette tâche** (à traiter séparément):
- Interface utilisateur de changement de langue
- Traductions pour d'autres systèmes

## Spécifications Techniques

### Stack & Technologies

- **Framework**: Nuxt 4
- **Langage**: TypeScript
- **Testing**: Vitest + @nuxt/test-utils
- **Module i18n**: @nuxtjs/i18n

### Architecture

```typescript
// app/composables/useI18nLitm.ts
export const useI18nLitm = () => {
  const { t, locale } = useI18n()

  // Helpers typés pour accéder aux traductions LITM
  const tCharacter = (key: CharacterTranslationKey, params?: object) => { }
  const tCard = (key: CardTranslationKey, params?: object) => { }
  const tTracker = (key: TrackerTranslationKey, params?: object) => { }
  // ...

  return {
    tCharacter,
    tCard,
    tTracker,
    locale
  }
}
```

### Fichiers Concernés

**Nouveaux fichiers**:
- [ ] `app/composables/useI18nLitm.ts` - Composable principal
- [ ] `app/types/i18n-litm.d.ts` - Types pour les clés de traduction
- [ ] `tests/composables/useI18nLitm.spec.ts` - Tests unitaires

**Fichiers à modifier**:
Aucun

## Plan d'Implémentation

### Étape 1: Génération des types TypeScript

**Objectif**: Créer les types pour les clés de traduction

**Actions**:
- [ ] Analyser la structure des fichiers JSON de traduction
- [ ] Générer les types pour chaque domaine (Character, Card, Tracker, etc.)
- [ ] Créer des unions de types pour toutes les clés

**Fichiers**: `app/types/i18n-litm.d.ts`

**Critères de validation**:
- Les types sont générés correctement
- L'auto-complétion fonctionne dans l'IDE

### Étape 2: Création du composable de base

**Objectif**: Créer la structure de base du composable

**Actions**:
- [ ] Créer `useI18nLitm.ts`
- [ ] Importer `useI18n` de #i18n
- [ ] Créer les helpers de base

**Fichiers**: `app/composables/useI18nLitm.ts`

**Critères de validation**:
- Le composable est importable
- Pas d'erreur TypeScript

### Étape 3: Implémentation des helpers typés

**Objectif**: Créer les fonctions helper pour chaque domaine

**Actions**:
- [ ] Implémenter `tCharacter()`
- [ ] Implémenter `tCard()`
- [ ] Implémenter `tTracker()`
- [ ] Implémenter `tUI()`
- [ ] Implémenter `tError()`
- [ ] Implémenter `tThemebook()`

**Fichiers**: `app/composables/useI18nLitm.ts`

**Critères de validation**:
- Chaque helper accède au bon namespace
- Les types sont corrects

### Étape 4: Gestion du fallback

**Objectif**: Implémenter le fallback FR/EN automatique

**Actions**:
- [ ] Détecter les clés manquantes
- [ ] Fallback vers EN si FR manque
- [ ] Logger les traductions manquantes en dev

**Fichiers**: `app/composables/useI18nLitm.ts`

**Critères de validation**:
- Le fallback fonctionne
- Les avertissements sont loggés en dev

### Étape 5: Tests unitaires

**Objectif**: Créer les tests avec Vitest

**Actions**:
- [ ] Tester `tCharacter()`
- [ ] Tester `tCard()`
- [ ] Tester le fallback
- [ ] Tester les placeholders
- [ ] Tester le changement de locale

**Fichiers**: `tests/composables/useI18nLitm.spec.ts`

**Critères de validation**:
- Tous les tests passent
- Couverture > 80%

## Tests

### Tests Unitaires

```typescript
describe('useI18nLitm', () => {
  it('should return translated character string', () => {
    const { tCharacter } = useI18nLitm()
    expect(tCharacter('newCharacterName')).toBe('Nouveau Personnage')
  })

  it('should handle placeholders', () => {
    const { tCard } = useI18nLitm()
    expect(tCard('themeCardPlaceholder', { title: 'Test' }))
      .toBe('Carte de Thème : Test')
  })

  it('should fallback to EN when FR missing', () => {
    // Test implementation
  })
})
```

## Dépendances

### Bloqueurs

- [ ] TASK-002 (Traductions LITM) doit être terminée

### Tâches Liées

- **TASK-001**: Indirectement liée (config i18n)
- **TASK-002**: Bloqueur direct

## Critères d'Acceptation

- [ ] Le composable est fonctionnel
- [ ] Les types TypeScript sont corrects
- [ ] L'auto-complétion fonctionne dans l'IDE
- [ ] Le fallback FR/EN fonctionne
- [ ] Les tests passent avec >80% de couverture
- [ ] Le code respecte SOLID et DRY
- [ ] La documentation inline est complète

## Références

- [Vue I18n Composition API](https://vue-i18n.intlify.dev/guide/advanced/composition.html)
- [Nuxt Composables](https://nuxt.com/docs/guide/directory-structure/composables)
- [TypeScript Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)
