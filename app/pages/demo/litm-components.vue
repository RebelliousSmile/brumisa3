<script setup lang="ts">
/**
 * Page de démonstration des composants LITM
 *
 * Permet de tester visuellement tous les composants de base et ThemeCard
 */

import type { ThemeCardTag, ThemeCardQuest } from '~/components/litm/ThemeCard.vue'
import type { Relationship } from '~/components/litm/RelationshipList.vue'
import type { Quintessence } from '~/components/litm/QuintessenceList.vue'
import type { BackpackItem } from '~/components/litm/BackpackList.vue'

definePageMeta({
  layout: 'default',
  title: 'Demo LITM Components',
})

// Sample data for ThemeCard
const sampleThemeCard = ref({
  id: 'demo-1',
  type: 'origin' as const,
  themebook: 'Guerrier des Brumes',
  title: 'Ma carte de thème',
  mainTag: 'Force surhumaine',
  powerTags: [
    { id: '1', text: 'Combat au corps à corps', isPower: true },
    { id: '2', text: 'Résistance à la douleur', isPower: true },
  ] as ThemeCardTag[],
  weaknessTags: [
    { id: '3', text: 'Impulsif en combat', isPower: false },
  ] as ThemeCardTag[],
  quest: {
    text: 'Prouver ma valeur en protégeant les faibles',
    progressPips: 3,
    totalPips: 9,
  } as ThemeCardQuest,
  improvements: [
    'Amélioration 1: Force augmentée',
    'Amélioration 2: Endurance légendaire',
  ],
})

// Handlers
const handleUpdatePowerTags = (tags: ThemeCardTag[]) => {
  sampleThemeCard.value.powerTags = tags
}

const handleUpdateWeaknessTags = (tags: ThemeCardTag[]) => {
  sampleThemeCard.value.weaknessTags = tags
}

const handleUpdateQuest = (quest: ThemeCardQuest) => {
  sampleThemeCard.value.quest = quest
}

const handleDelete = () => {
  console.log('Delete card:', sampleThemeCard.value.id)
}

// Sample data for HeroCard
const sampleHeroCard = ref({
  id: 'hero-1',
  name: 'Aelara Brume-Argent',
  backstory: 'Née dans les brumes éternelles, Aelara a toujours eu un lien étrange avec les esprits.',
  birthright: 'Vision des esprits: Peut percevoir et communiquer avec les entités des brumes.',
  relationships: [
    { id: 'rel-1', name: 'Theron', description: 'Compagnon de route, frère d\'armes' },
    { id: 'rel-2', name: 'Maître Elwin', description: 'Mentor, guide spirituel' },
  ] as Relationship[],
  quintessences: [
    { id: 'quint-1', name: 'Courage inébranlable', description: '' },
    { id: 'quint-2', name: 'Empathie profonde', description: '' },
  ] as Quintessence[],
  backpackItems: [
    { id: 'item-1', name: 'Épée des brumes' },
    { id: 'item-2', name: 'Amulette protectrice' },
    { id: 'item-3', name: 'Carnet de voyage' },
  ] as BackpackItem[],
})
</script>

<template>
  <div class="min-h-screen bg-gray-100 py-8">
    <div class="container mx-auto px-4">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          Démonstration Composants LITM
        </h1>
        <p class="text-gray-600">
          Test visuel des composants de base et ThemeCard
        </p>
      </div>

      <!-- Edit Mode Toggle -->
      <div class="mb-8 flex items-center gap-4">
        <LitmEditModeToggle :show-label="true" />
        <span class="text-sm text-gray-600">
          Activez le mode édition pour modifier les composants
        </span>
      </div>

      <!-- Base Components Demo -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">
          Composants de Base
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Buttons -->
          <div class="bg-white p-6 rounded-lg shadow">
            <h3 class="text-lg font-semibold mb-4">Boutons</h3>
            <div class="flex flex-wrap gap-2">
              <LitmButton variant="primary">
                Primary
              </LitmButton>
              <LitmButton variant="secondary">
                Secondary
              </LitmButton>
              <LitmButton variant="danger">
                Danger
              </LitmButton>
              <LitmButton variant="ghost">
                Ghost
              </LitmButton>
            </div>
          </div>

          <!-- Tags -->
          <div class="bg-white p-6 rounded-lg shadow">
            <h3 class="text-lg font-semibold mb-4">Tags</h3>
            <div class="flex flex-wrap gap-2">
              <LitmEditableTag
                model-value="Power Tag"
                type="power"
                :editable="true"
              />
              <LitmEditableTag
                model-value="Weakness Tag"
                type="weakness"
                :editable="true"
              />
              <LitmEditableTag
                model-value="Neutral Tag"
                type="neutral"
                :editable="false"
              />
            </div>
          </div>

          <!-- Pips -->
          <div class="bg-white p-6 rounded-lg shadow">
            <h3 class="text-lg font-semibold mb-4">Indicateur de Pips</h3>
            <LitmPipIndicator
              :current="3"
              :max="9"
              :editable="true"
              :show-percentage="false"
            />
          </div>

          <!-- Card Base -->
          <div class="bg-white p-6 rounded-lg shadow">
            <h3 class="text-lg font-semibold mb-4">Carte de Base</h3>
            <LitmCardBase
              title="Titre de la carte"
              subtitle="Sous-titre"
              elevation="md"
            >
              <template #front>
                <p class="text-gray-600">
                  Contenu de la face avant
                </p>
              </template>
            </LitmCardBase>
          </div>
        </div>
      </section>

      <!-- ThemeCard Demo -->
      <section>
        <h2 class="text-2xl font-bold text-gray-900 mb-4">
          Carte de Thème (ThemeCard)
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Origin Card -->
          <LitmThemeCard
            v-bind="sampleThemeCard"
            @update:power-tags="handleUpdatePowerTags"
            @update:weakness-tags="handleUpdateWeaknessTags"
            @update:quest="handleUpdateQuest"
            @delete="handleDelete"
          />

          <!-- Fellowship Card -->
          <LitmThemeCard
            id="demo-2"
            type="fellowship"
            themebook="Compagnons d'Armes"
            title="Carte de Compagnie"
            main-tag="Liens fraternels"
            :power-tags="[
              { id: '1', text: 'Coordination tactique', isPower: true },
            ]"
            :weakness-tags="[
              { id: '2', text: 'Trop protecteur', isPower: false },
            ]"
            :quest="{
              text: 'Sauver mon compagnon capturé',
              progressPips: 5,
              totalPips: 9,
            }"
            @update:power-tags="(tags) => console.log('Power tags:', tags)"
            @update:weakness-tags="(tags) => console.log('Weakness tags:', tags)"
            @update:quest="(quest) => console.log('Quest:', quest)"
            @delete="() => console.log('Delete fellowship card')"
          />

          <!-- Expertise Card -->
          <LitmThemeCard
            id="demo-3"
            type="expertise"
            themebook="Érudit des Arcanes"
            title="Carte d'Expertise"
            main-tag="Connaissance mystique"
            :power-tags="[
              { id: '1', text: 'Lecture des runes anciennes', isPower: true },
              { id: '2', text: 'Manipulation des énergies', isPower: true },
            ]"
            :weakness-tags="[
              { id: '3', text: 'Faible constitution', isPower: false },
            ]"
            :quest="{
              text: 'Découvrir le secret du grimoire perdu',
              progressPips: 2,
              totalPips: 9,
            }"
            @update:power-tags="(tags) => console.log('Power tags:', tags)"
            @update:weakness-tags="(tags) => console.log('Weakness tags:', tags)"
            @update:quest="(quest) => console.log('Quest:', quest)"
            @delete="() => console.log('Delete expertise card')"
          />
        </div>
      </section>

      <!-- HeroCard Demo -->
      <section class="mt-12">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">
          Carte de Héros (HeroCard)
        </h2>

        <div class="flex justify-center">
          <LitmHeroCard
            v-bind="sampleHeroCard"
            @update:name="(name) => sampleHeroCard.name = name"
            @update:backstory="(backstory) => sampleHeroCard.backstory = backstory"
            @update:birthright="(birthright) => sampleHeroCard.birthright = birthright"
            @update:relationships="(relationships) => sampleHeroCard.relationships = relationships"
            @update:quintessences="(quintessences) => sampleHeroCard.quintessences = quintessences"
            @update:backpack-items="(items) => sampleHeroCard.backpackItems = items"
            @delete="() => console.log('Delete hero card')"
          />
        </div>
      </section>
    </div>
  </div>
</template>
