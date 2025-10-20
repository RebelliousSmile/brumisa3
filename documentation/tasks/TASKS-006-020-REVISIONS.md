# Révisions des Tâches 006 à 020

## TASK-006 : Composant HeroCard

### Changements Principaux
- **Chemin** : `app/components/character/HeroCard.vue` (pas `litm/`)
- **Générique** : Support polymorphique selon le hack
- **Traductions** : Utilise `useTranslations()` avec contexte

```vue
<!-- app/components/character/HeroCard.vue -->
<template>
  <CardBase :title="t('hero.title')">
    <template #content>
      <!-- Contenu adaptatif selon le hack -->
      <div v-if="hackSlug === 'litm'">
        <!-- Relations et Quintessences pour LITM -->
      </div>
      <div v-else-if="hackSlug === 'otherscape'">
        <!-- Connexions pour Otherscape -->
      </div>
    </template>
  </CardBase>
</template>

<script setup>
import { useTranslations } from '@/composables/useTranslations';
import { useTheme } from '@/composables/useTheme';

const { t } = useTranslations();
const { hackSlug } = useTheme();
</script>
```

---

## TASK-007 : Composants Trackers

### Changements Principaux
- **Chemin** : `app/components/character/Tracker.vue`
- **Types adaptatifs** : STATUS, STORY_TAG, STORY_THEME selon hack
- **Labels dynamiques** : Traduits selon le contexte

```vue
<!-- app/components/character/Tracker.vue -->
<template>
  <div class="tracker" :class="`tracker--${tracker.type}`">
    <h4>{{ t(`tracker.${tracker.type}`) }}</h4>
    <PipIndicator
      :current="tracker.pips"
      :max="tracker.maxPips"
      :editable="isEditMode"
      @update="updatePips"
    />
  </div>
</template>
```

---

## TASK-008 : Store Pinia Character

### Changements Principaux
- **Nom** : `useCharacterStore` (pas `useCharacterLitmStore`)
- **Contexte playspace** : Toujours vérifier le hack actif
- **Actions polymorphiques** : Logique selon le hack

```typescript
// stores/character.ts
export const useCharacterStore = defineStore('character', () => {
  const playspaceStore = usePlayspaceStore();

  const createCharacter = async (data: CharacterCreateInput) => {
    // Vérifier le contexte playspace
    const playspace = playspaceStore.currentPlayspace;
    if (!playspace) throw new Error('No active playspace');

    // Adapter la création selon le hack
    switch (playspace.hack.slug) {
      case 'litm':
        return createLitmCharacter(data);
      case 'otherscape':
        return createOtherscapeCharacter(data);
      default:
        throw new Error(`Unsupported hack: ${playspace.hack.slug}`);
    }
  };

  // Actions génériques
  const updateTag = async (characterId: string, tagId: string, content: string) => {
    await $fetch(`/api/characters/${characterId}/tags/${tagId}`, {
      method: 'PATCH',
      body: { content }
    });
  };

  return {
    createCharacter,
    updateTag,
    // ...
  };
});
```

---

## TASK-009A : API Routes Characters

### Changements Principaux
- **Routes** : `/api/characters/` (pas `/api/litm/`)
- **Validation contextuelle** : Selon le hack du playspace
- **Réponse adaptative** : Format selon le hack

```typescript
// server/api/characters/index.post.ts
export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { playspaceId } = body;

  // Récupérer le playspace avec son hack
  const playspace = await prisma.playspace.findUnique({
    where: { id: playspaceId },
    include: { hack: true }
  });

  if (!playspace) {
    throw createError({ statusCode: 404, statusMessage: 'Playspace not found' });
  }

  // Créer le personnage selon le hack
  switch (playspace.hack.slug) {
    case 'litm':
      return createLitmCharacterData(body);
    case 'otherscape':
      return createOtherscapeCharacterData(body);
    case 'city-of-mist':
      return createCityOfMistCharacterData(body);
    default:
      throw createError({
        statusCode: 400,
        statusMessage: `Unsupported hack: ${playspace.hack.slug}`
      });
  }
});
```

---

## TASK-009B : API Routes Cards/Trackers

### Changements Principaux
- **Routes génériques** : `/api/characters/[id]/cards`
- **Validation polymorphique** : Schéma selon le hack
- **CRUD adaptatif** : Operations selon le type

```typescript
// server/api/characters/[id]/cards.post.ts
export default defineEventHandler(async (event) => {
  const characterId = getRouterParam(event, 'id');
  const body = await readBody(event);

  // Récupérer le character avec son playspace
  const character = await prisma.character.findUnique({
    where: { id: characterId },
    include: {
      playspace: { include: { hack: true } }
    }
  });

  // Valider selon le hack
  const schema = getCardSchemaForHack(character.playspace.hack.slug);
  const validated = await schema.validate(body);

  // Créer la carte
  return prisma.themeCard.create({
    data: {
      ...validated,
      characterId
    }
  });
});
```

---

## TASK-010 : Page Création Personnage

### Changements Principaux
- **Page unique** : `pages/character/create.vue`
- **Composants conditionnels** : Affichés selon le hack
- **Formulaire dynamique** : Champs selon le contexte

```vue
<!-- pages/character/create.vue -->
<template>
  <div class="character-create">
    <h1>{{ t('character.create.title') }}</h1>

    <form @submit.prevent="createCharacter">
      <!-- Champs communs -->
      <input v-model="form.name" :placeholder="t('character.name')" />

      <!-- Champs spécifiques au hack -->
      <template v-if="hackSlug === 'litm'">
        <ThemeCardBuilder
          v-for="(card, i) in form.themeCards"
          :key="i"
          v-model="form.themeCards[i]"
        />
      </template>

      <template v-else-if="hackSlug === 'otherscape'">
        <ProtocolBuilder
          v-for="(protocol, i) in form.protocols"
          :key="i"
          v-model="form.protocols[i]"
        />
      </template>

      <button type="submit">
        {{ t('character.create.submit') }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { useTranslations } from '@/composables/useTranslations';
import { useTheme } from '@/composables/useTheme';
import { useCharacterStore } from '@/stores/character';

const { t } = useTranslations();
const { hackSlug } = useTheme();
const characterStore = useCharacterStore();

// Formulaire adaptatif
const form = reactive(getInitialFormForHack(hackSlug.value));

const createCharacter = async () => {
  await characterStore.createCharacter(form);
  await navigateTo('/characters');
};
</script>
```

---

## TASK-010-bis : Tests E2E

### Changements Principaux
- **Tests multi-playspaces** : LITM, Otherscape, City of Mist
- **Validation traductions** : Contextuelles selon hack
- **Performance** : Changement de playspace <2s

```typescript
// tests/e2e/character-creation.spec.ts
test.describe('Character Creation Multi-Hack', () => {
  test('should create LITM character with theme cards', async ({ page }) => {
    await setupPlayspace(page, 'litm', 'zamanora');
    await page.goto('/character/create');

    // Vérifier les éléments LITM
    await expect(page.locator('[data-test="theme-card-builder"]'))
      .toBeVisible();
    await expect(page.locator('label'))
      .toContainText('Gift Tags'); // Traduction LITM

    // Créer personnage
    await fillLitmCharacterForm(page);
    await page.click('[data-test="submit"]');

    // Vérifier création
    await expect(page).toHaveURL('/characters');
  });

  test('should create Otherscape character with protocols', async ({ page }) => {
    await setupPlayspace(page, 'otherscape', 'tokyo');
    await page.goto('/character/create');

    // Vérifier les éléments Otherscape
    await expect(page.locator('[data-test="protocol-builder"]'))
      .toBeVisible();
    await expect(page.locator('label'))
      .toContainText('Protocol Tags'); // Traduction Otherscape

    // Créer personnage
    await fillOtherscapeCharacterForm(page);
    await page.click('[data-test="submit"]');
  });

  test('should handle playspace switch during creation', async ({ page }) => {
    await setupPlayspace(page, 'litm', 'zamanora');
    await page.goto('/character/create');

    // Commencer à remplir
    await page.fill('[data-test="character-name"]', 'Test Hero');

    // Changer de playspace
    const start = Date.now();
    await switchPlayspace(page, 'otherscape', 'tokyo');
    const duration = Date.now() - start;

    // Vérifier performance
    expect(duration).toBeLessThan(2000);

    // Vérifier que le formulaire s'est adapté
    await expect(page.locator('[data-test="protocol-builder"]'))
      .toBeVisible();
  });
});
```

---

## TASK-019 : Export/Import JSON

### Changements Principaux
- **Format enrichi** : Inclut métadonnées playspace
- **Détection automatique** : Du hack lors de l'import
- **Validation** : Schéma adaptatif selon le hack

```typescript
// server/api/characters/export.ts
export default defineEventHandler(async (event) => {
  const { characterId } = getQuery(event);

  const character = await prisma.character.findUnique({
    where: { id: characterId },
    include: {
      playspace: {
        include: {
          hack: true,
          universe: true
        }
      },
      themeCards: {
        include: {
          powerTags: true,
          weaknessTags: true,
          quest: true
        }
      },
      heroCard: true,
      trackers: true
    }
  });

  // Format d'export avec contexte
  return {
    version: '2.0',
    metadata: {
      hack: character.playspace.hack.slug,
      universe: character.playspace.universe?.slug,
      exportedAt: new Date().toISOString()
    },
    character: {
      name: character.name,
      description: character.description,
      // Données selon le hack
      ...getHackSpecificData(character)
    }
  };
});
```

```typescript
// server/api/characters/import.ts
export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { playspaceId } = getQuery(event);

  // Validation du format
  if (!body.version || !body.metadata) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid export format'
    });
  }

  // Vérifier la compatibilité avec le playspace cible
  const targetPlayspace = await prisma.playspace.findUnique({
    where: { id: playspaceId },
    include: { hack: true }
  });

  if (targetPlayspace.hack.slug !== body.metadata.hack) {
    throw createError({
      statusCode: 400,
      statusMessage: `Cannot import ${body.metadata.hack} character into ${targetPlayspace.hack.slug} playspace`
    });
  }

  // Importer avec adaptation
  return importCharacterWithContext(body, targetPlayspace);
});
```

---

## TASK-020 : Documentation Utilisateur

### Changements Principaux
- **Guide playspace** : Explication du concept
- **Hiérarchie** : System → Hack → Universe
- **Migration** : Guide depuis l'ancienne version

```markdown
# Guide Utilisateur - Brumisater

## Concepts Fondamentaux

### Playspace
Un **playspace** est votre espace de jeu unique qui combine :
- Un **hack** (règles du jeu)
- Un **univers** (monde narratif)
- Vos **personnages**

### Hiérarchie du Système

```
Mist Engine (Système de base)
  ├── Legends in the Mist (Hack)
  │   ├── Zamanora (Univers)
  │   └── Hearts of Ravensdale (Univers)
  ├── City of Mist (Hack)
  │   └── The City (Univers)
  └── Otherscape (Hack)
      ├── Tokyo (Univers)
      └── Cairo (Univers)
```

### Traductions Contextuelles

Le système adapte automatiquement les termes selon votre playspace :
- **LITM** : "Gift Tags", "Hero", "Quest"
- **City of Mist** : "Power Tags", "Character", "Mystery"
- **Otherscape** : "Protocol Tags", "Agent", "Mission"

## Création de Personnage

1. **Créez un playspace** en choisissant hack + univers
2. **Accédez à la création** depuis votre playspace
3. **Remplissez les champs** adaptés à votre hack
4. **Sauvegardez** - Le personnage est lié au playspace

## Export/Import

Les exports incluent les métadonnées du playspace.
Vous ne pouvez importer que dans un playspace compatible.

## Performance

- Changement de playspace : <2s
- Création de personnage : <60s
- Export/Import : instantané
```

---

## Résumé Global des Révisions 006-020

### Points Clés

1. **Tous les chemins** sans préfixe `litm/`
2. **Logique adaptative** selon le hack du playspace
3. **Traductions contextuelles** via `useTranslations()`
4. **API génériques** avec validation polymorphique
5. **Tests multi-hacks** pour valider l'adaptabilité
6. **Export enrichi** avec métadonnées de contexte
7. **Documentation** expliquant la hiérarchie

### Impact

- **Code plus maintenable** : Un seul composant pour tous les hacks
- **Extension facilitée** : Ajouter un hack = ajouter des cas dans switch
- **Performance optimale** : Cache et résolution en cascade
- **UX cohérente** : Adaptation transparente pour l'utilisateur