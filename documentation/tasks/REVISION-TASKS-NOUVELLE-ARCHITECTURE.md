# Révision des Tasks selon la Nouvelle Architecture

**Date** : 2025-01-20
**Contexte** : Alignement avec l'architecture **Système → Hack → Univers** et Playspace comme contexte unique

## Résumé des Changements

### Principes Appliqués

1. **Plus de références directes à LITM** → Architecture multi-hacks
2. **Playspace comme contexte** → Toutes les entités liées au playspace
3. **Traductions multi-niveaux** → Résolution en cascade depuis PostgreSQL
4. **Composants génériques** → Adaptables selon le hack actif
5. **Chemins sans préfixe** → `app/components/character/` au lieu de `app/components/litm/`

## Tasks Révisées

### Phase 1 : Configuration (8h)

#### ✅ TASK-001 : Système de Traductions Multi-Niveaux
**Changements** :
- Configuration @nuxtjs/i18n avec PostgreSQL
- Modèle `TranslationEntry` avec niveaux System/Hack/Universe
- Composable `useTranslations()` avec contexte playspace automatique
- Cache multi-niveaux (Client → Redis → PostgreSQL)

#### ✅ TASK-002 : Import des Traductions dans PostgreSQL
**Changements** :
- Import depuis characters-of-the-mist avec catégorisation
- Script d'import avec classification automatique
- Support multi-hacks/univers

#### ✅ TASK-003 : Tests E2E Traductions
**Changements** :
- Tests Playwright pour cascade de résolution
- Tests de performance et changement de playspace
- Validation du fallback

### Phase 2 : Composants (41h)

#### ✅ TASK-004 : Modèle Prisma Multi-Hacks
**Changements** :
- Hiérarchie complète : System → Hack → Universe → Playspace → Character
- Modèles sans préfixe "Litm" (génériques)
- Support extensible pour autres hacks

#### 🔄 TASK-004-bis : Composants UI de Base
**À réviser** :
- Utiliser le système de traductions au lieu de i18n statique
- Composants dans `app/components/ui/` (pas de préfixe hack)

#### ✅ TASK-005 : Composant ThemeCard
**Changements** :
- Chemin : `app/components/character/ThemeCard.vue`
- Adaptation selon le hack du playspace
- Traductions contextuelles (Gift Tags pour LITM, Power Tags pour City of Mist)

#### 🔄 TASK-006 : Composant HeroCard
**À réviser** :
- Chemin : `app/components/character/HeroCard.vue`
- Générique pour supporter différents hacks
- Relations et quintessences adaptables

#### 🔄 TASK-007 : Composants Trackers
**À réviser** :
- Chemin : `app/components/character/Tracker.vue`
- Support différents types selon le hack
- Traductions contextuelles pour les noms

#### 🔄 TASK-008 : Store Pinia Character
**À réviser** :
- Store générique : `stores/character.ts` (pas useCharacterLitm)
- Gestion du contexte playspace
- Actions polymorphiques selon le hack

#### 🔄 TASK-009A : API Routes Characters
**À réviser** :
- Routes génériques : `/api/characters/` (pas /api/litm/)
- Vérification du hack via playspace
- Logique adaptative selon le contexte

#### 🔄 TASK-009B : API Routes Cards/Trackers
**À réviser** :
- Routes génériques pour tous les hacks
- Validation selon le schéma du hack actif

#### 🔄 TASK-010 : Page Création Personnage
**À réviser** :
- Page unique adaptative : `pages/character/create.vue`
- Composants affichés selon le hack du playspace
- Formulaire dynamique avec traductions contextuelles

#### 🔄 TASK-010-bis : Tests E2E
**À réviser** :
- Tests avec différents playspaces (LITM, Otherscape)
- Validation des traductions contextuelles
- Performance avec changement de playspace

### Phase 3 : Export/Import (5h)

#### 🔄 TASK-019 : Export/Import JSON
**À réviser** :
- Format incluant métadonnées du playspace
- Export compatible multi-hacks
- Import avec détection automatique du format

#### 🔄 TASK-020 : Documentation Utilisateur
**À réviser** :
- Documentation du système de playspace
- Explication de la hiérarchie System/Hack/Universe

## Recommandations pour la Suite

### Ordre d'Implémentation

1. **Terminer TASK-001** (Config traductions) - Base critique
2. **Implémenter TASK-004** (Modèles Prisma) - Fondation données
3. **Exécuter TASK-002** (Import traductions) - Données nécessaires
4. **Développer TASK-005 à 007** (Composants) - En parallèle
5. **Créer TASK-008** (Store) - Après composants
6. **Implémenter TASK-009A/B** (API) - Backend complet
7. **Finaliser TASK-010** (Page création) - Interface complète
8. **Tester avec TASK-003 et 010-bis** - Validation

### Points d'Attention

1. **Toujours vérifier le contexte playspace** dans les composants
2. **Utiliser `useTranslations()`** au lieu de `$t()` direct
3. **Pas de logique spécifique à un hack** dans les composants de base
4. **Tests avec différents playspaces** pour valider l'adaptabilité

### Exemple de Code Adapté

```vue
<!-- Avant (spécifique LITM) -->
<template>
  <div class="litm-character">
    <h1>{{ $t('litm.character.title') }}</h1>
    <LitmThemeCard :card="card" />
  </div>
</template>

<!-- Après (générique multi-hacks) -->
<template>
  <div class="character">
    <h1>{{ t('character.title') }}</h1>
    <!-- Traduction résolue selon playspace -->

    <ThemeCard
      v-if="isThemeBasedHack"
      :card="card"
    />
    <!-- Composant affiché si LITM ou City of Mist -->

    <ProtocolCard
      v-else-if="hack === 'otherscape'"
      :protocol="protocol"
    />
    <!-- Composant différent pour Otherscape -->
  </div>
</template>

<script setup>
import { useTranslations } from '@/composables/useTranslations';
import { usePlayspaceStore } from '@/stores/playspace';
import { computed } from 'vue';

const { t } = useTranslations(); // Auto-contextualisé
const playspaceStore = usePlayspaceStore();

const hack = computed(() => playspaceStore.currentPlayspace?.hack?.slug);
const isThemeBasedHack = computed(() =>
  ['litm', 'city-of-mist'].includes(hack.value)
);
</script>
```

## Fichiers à Mettre à Jour

### Priorité Haute
- [ ] `prisma/schema.prisma` - Modèles multi-hacks
- [ ] `nuxt.config.ts` - Configuration i18n
- [ ] `app/composables/useTranslations.ts` - Nouveau composable

### Priorité Moyenne
- [ ] `app/components/character/*.vue` - Tous les composants
- [ ] `app/stores/character.ts` - Store générique
- [ ] `server/api/characters/*.ts` - API routes

### Priorité Basse
- [ ] `tests/e2e/*.spec.ts` - Tests adaptés
- [ ] `documentation/` - Mise à jour docs

## Notes de Migration

Pour migrer le code existant :

1. **Renommer les imports** :
   ```ts
   // Avant
   import LitmCharacter from '@/components/litm/Character.vue'

   // Après
   import Character from '@/components/character/Character.vue'
   ```

2. **Adapter les traductions** :
   ```ts
   // Avant
   $t('litm.character.name')

   // Après
   t('character.name') // Résolu selon contexte
   ```

3. **Vérifier le contexte** :
   ```ts
   // Ajouter dans les composants
   const { currentPlayspace } = usePlayspaceStore();
   const hackSlug = computed(() => currentPlayspace.value?.hack?.slug);
   ```

## Conclusion

Cette révision aligne toutes les tâches MVP avec la nouvelle architecture. Le système est maintenant :
- **Extensible** : Facile d'ajouter de nouveaux hacks
- **Maintenable** : Code générique et réutilisable
- **Performant** : Cache multi-niveaux et résolution optimisée
- **Cohérent** : Une seule source de vérité (Playspace)