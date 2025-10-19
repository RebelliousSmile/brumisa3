# Task - Composants UI de Base LITM

## Métadonnées

- **ID**: TASK-2025-01-19-004-bis
- **Date de création**: 2025-01-19
- **Créé par**: Claude
- **Priorité**: Haute
- **Statut**: À faire
- **Temps estimé**: 3h
- **Temps réel**: -

## Description

### Objectif

Créer les composants UI de base réutilisables pour tout le système LITM, afin d'éviter la duplication de code dans les cartes, trackers et autres composants.

### Contexte

Les composants ThemeCard, HeroCard, et Trackers partagent beaucoup de patterns communs : édition de tags, système de pips, mode édition/lecture, etc. Créer ces composants de base en premier réduit la duplication et assure la cohérence UI.

### Périmètre

**Inclus dans cette tâche**:
- Composant CardBase.vue (wrapper réutilisable pour toutes les cartes)
- Composant EditableTag.vue (tag éditable utilisé partout)
- Composant PipIndicator.vue (système de pips/points)
- Composant EditModeToggle.vue (bascule édition/lecture)
- Composant FlipCard.vue (animation flip recto/verso)
- Helpers et composables partagés

**Exclu de cette tâche** (à traiter séparément):
- Logique métier spécifique aux cartes de thème
- Logique métier spécifique aux trackers
- Intégration avec Prisma (sera dans les tasks suivantes)

## Spécifications Techniques

### Stack & Technologies

- **Framework**: Nuxt 4 + Vue 3 Composition API
- **Langage**: TypeScript
- **Styling**: Tailwind CSS
- **Tests**: Vitest + @nuxt/test-utils

### Architecture

```
app/components/litm/base/
├── CardBase.vue           # Wrapper pour cartes
├── EditableTag.vue        # Tag éditable
├── PipIndicator.vue       # Système de pips
├── EditModeToggle.vue     # Toggle édition/lecture
├── FlipCard.vue           # Animation flip
└── LitmButton.vue         # Bouton stylisé LITM

app/composables/litm/
├── useEditMode.ts         # Gestion mode édition
└── usePips.ts             # Gestion des pips
```

### Fichiers Concernés

**Nouveaux fichiers**:
- [ ] `app/components/litm/base/CardBase.vue`
- [ ] `app/components/litm/base/EditableTag.vue`
- [ ] `app/components/litm/base/PipIndicator.vue`
- [ ] `app/components/litm/base/EditModeToggle.vue`
- [ ] `app/components/litm/base/FlipCard.vue`
- [ ] `app/components/litm/base/LitmButton.vue`
- [ ] `app/composables/litm/useEditMode.ts`
- [ ] `app/composables/litm/usePips.ts`
- [ ] `tests/components/litm/base/BaseComponents.spec.ts`

## Plan d'Implémentation

### Étape 1: CardBase.vue

**Objectif**: Créer le wrapper de base pour toutes les cartes

**Fonctionnalités**:
- Props: title, subtitle, flippable
- Slots: front, back, actions
- Gestion du flip si activé
- Classes Tailwind communes

**Critères de validation**:
- Le composant s'affiche correctement
- Les slots fonctionnent
- Le flip est optionnel

### Étape 2: EditableTag.vue

**Objectif**: Tag éditable réutilisable

**Fonctionnalités**:
- Props: modelValue, editable, type (power/weakness)
- Events: update:modelValue, delete
- Mode lecture: affichage simple
- Mode édition: input inline
- Bouton de suppression (si editable)

**Critères de validation**:
- v-model fonctionne
- L'édition inline fonctionne
- Les styles power/weakness sont appliqués

### Étape 3: PipIndicator.vue

**Objectif**: Indicateur de progression avec pips

**Fonctionnalités**:
- Props: current, max, labels (Abandon, Améliorer, etc.)
- Events: update
- Cliquable pour modifier
- Affichage visuel des états

**Critères de validation**:
- Les pips s'affichent correctement
- Le clic fonctionne
- Les labels sont affichés aux bons endroits

### Étape 4: EditModeToggle.vue & Composable

**Objectif**: Gestion globale du mode édition

**Fonctionnalités**:
- Composable `useEditMode()` avec état global
- Toggle button
- Raccourci clavier (optionnel)
- Persistance de la préférence

**Critères de validation**:
- Le mode édition se propage à tous les composants
- La préférence est sauvegardée
- Le toggle fonctionne

### Étape 5: FlipCard.vue

**Objectif**: Animation de flip pour les cartes

**Fonctionnalités**:
- Slots: front, back
- Animation CSS smooth
- Support touch mobile
- Props: flipped (v-model)

**Critères de validation**:
- L'animation est fluide
- Fonctionne sur mobile
- Pas de glitch visuel

### Étape 6: Composable usePips.ts

**Objectif**: Logique réutilisable pour les pips

**Fonctionnalités**:
```typescript
export const usePips = (initialValue = 0, max = 4) => {
  const pips = ref(initialValue)

  const increment = () => { /* ... */ }
  const decrement = () => { /* ... */ }
  const setPips = (value: number) => { /* ... */ }
  const getLabel = () => { /* Abandon/Améliorer/etc */ }

  return { pips, increment, decrement, setPips, getLabel }
}
```

**Critères de validation**:
- Les fonctions fonctionnent
- Les limites sont respectées (0-max)
- Les labels sont corrects

### Étape 7: Tests unitaires

**Objectif**: Tester tous les composants de base

**Actions**:
- [ ] Tester CardBase
- [ ] Tester EditableTag (v-model, delete)
- [ ] Tester PipIndicator (clicks, états)
- [ ] Tester EditModeToggle
- [ ] Tester FlipCard (animation)
- [ ] Tester usePips composable

**Critères de validation**:
- Tous les tests passent
- Couverture > 85%

## Tests

### Tests Unitaires

```typescript
describe('EditableTag', () => {
  it('should display value in read mode', () => {
    const wrapper = mount(EditableTag, {
      props: { modelValue: 'Test Tag', editable: false }
    })
    expect(wrapper.text()).toContain('Test Tag')
  })

  it('should emit update on change in edit mode', async () => {
    const wrapper = mount(EditableTag, {
      props: { modelValue: 'Test', editable: true }
    })
    await wrapper.find('input').setValue('New Value')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
  })
})

describe('usePips', () => {
  it('should increment pips correctly', () => {
    const { pips, increment } = usePips(0, 4)
    increment()
    expect(pips.value).toBe(1)
  })

  it('should not exceed max', () => {
    const { pips, increment } = usePips(3, 4)
    increment()
    increment() // Should not go beyond 4
    expect(pips.value).toBe(4)
  })
})
```

## Dépendances

### Bloqueurs

- [ ] TASK-001 (i18n config) pour les traductions des labels

### Dépendances Externes

Aucune librairie externe requise (utilise Vue 3 + Tailwind)

### Tâches Liées

- **TASK-001**: Bloqueur (pour i18n)
- **TASK-005, 006, 007**: Utiliseront ces composants de base
- **TASK-004**: Peut être fait en parallèle (DB indépendant)

## Critères d'Acceptation

- [ ] Le code respecte les principes SOLID et DRY
- [ ] Les tests passent avec >85% de couverture
- [ ] La documentation inline est complète
- [ ] Le code suit les conventions du projet (CLAUDE.md)
- [ ] Tous les composants sont réutilisables
- [ ] Le TypeScript est strict (pas de `any`)
- [ ] Les composants sont accessibles (a11y basique)
- [ ] Les composants fonctionnent sur mobile

## Risques & Contraintes

### Risques Identifiés

| Risque | Impact | Probabilité | Mitigation |
|--------|--------|-------------|------------|
| Composants trop génériques | Moyen | Moyen | Tester avec cas réels, ajuster si nécessaire |
| Performance animation flip | Faible | Faible | Utiliser CSS transforms, pas de JS |
| Complexité des props | Moyen | Faible | Garder l'API simple, documenter |

### Contraintes

- **Technique**: Doit être compatible SSR (Nuxt)
- **Temporelle**: Maximum 3h
- **Réutilisabilité**: Doit être utilisable par TOUS les autres composants LITM

## Documentation

### Documentation à Créer

- [ ] README dans `app/components/litm/base/README.md`
- [ ] Exemples d'utilisation pour chaque composant
- [ ] Storybook ou documentation visuelle (optionnel)

### Documentation à Mettre à Jour

- [ ] Ajouter dans CLAUDE.md la convention d'utiliser ces composants de base

## Notes de Développement

### Décisions Techniques

**2025-01-19**: Création de composants de base AVANT les composants métier
- **Raison**: Éviter la duplication, assurer cohérence UI
- **Gain estimé**: -4h sur Phase 2, meilleure maintenabilité

**2025-01-19**: Utilisation de Composition API pour les composables
- **Raison**: Meilleure réutilisabilité, typage TypeScript
- **Alternative**: Options API (trop verbeux)

### Design Patterns Utilisés

- **Composant Wrapper** (CardBase): Inversion of Control via slots
- **Composable Pattern** (useEditMode, usePips): Logique réutilisable
- **V-Model Pattern** (EditableTag): Two-way binding

## Résultat Final

(À remplir une fois la tâche terminée)

### Ce qui a été accompli

- [À remplir]

### Déviations par rapport au plan initial

[À remplir]

### Prochaines Étapes Suggérées

- Utiliser ces composants dans TASK-005 (ThemeCard)
- Créer des variants si nécessaire
- Documenter les patterns d'utilisation

## Références

- [Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)
- [Vue Component v-model](https://vuejs.org/guide/components/v-model.html)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Accessible Components](https://www.w3.org/WAI/ARIA/apg/)
