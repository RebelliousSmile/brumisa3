<script setup lang="ts">
/**
 * Page de création d'un nouveau personnage Legends in the Mist
 */

definePageMeta({
  layout: 'default',
  middleware: 'auth', // Nécessite authentification
})

const { t } = useI18n()
const router = useRouter()
const store = useLitmCharacterStore()

// État du formulaire
const characterName = ref('')
const gameType = ref<'litm' | 'cotm'>('litm')
const isCreating = ref(false)
const error = ref<string | null>(null)

// Créer le personnage
const createCharacter = async () => {
  if (!characterName.value.trim()) {
    error.value = 'Le nom du personnage est requis'
    return
  }

  isCreating.value = true
  error.value = null

  try {
    const character = await store.createCharacter({
      name: characterName.value.trim(),
      gameType: gameType.value,
    })

    if (character) {
      // Rediriger vers la page d'édition du personnage
      await router.push(`/univers/legends-in-the-mist/personnages/${character.id}`)
    }
  } catch (err: any) {
    error.value = err.message || 'Une erreur est survenue lors de la création du personnage'
    console.error('Error creating character:', err)
  } finally {
    isCreating.value = false
  }
}

// Annuler et retourner à la liste
const cancel = () => {
  router.push('/univers/legends-in-the-mist/personnages')
}
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-2xl">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">
        Créer un nouveau personnage
      </h1>
      <p class="text-gray-600">
        Commencez par donner un nom à votre personnage Legends in the Mist
      </p>
    </div>

    <!-- Formulaire de création -->
    <div class="bg-white rounded-lg shadow-md p-6 space-y-6">
      <!-- Nom du personnage -->
      <div>
        <label for="character-name" class="block text-sm font-medium text-gray-700 mb-2">
          Nom du personnage *
        </label>
        <input
          id="character-name"
          v-model="characterName"
          type="text"
          class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Ex: Akira le Sage"
          maxlength="100"
          @keyup.enter="createCharacter"
        />
        <p class="mt-1 text-sm text-gray-500">
          {{ characterName.length }}/100 caractères
        </p>
      </div>

      <!-- Type de jeu -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Type de jeu
        </label>
        <div class="space-y-2">
          <label class="flex items-center">
            <input
              v-model="gameType"
              type="radio"
              value="litm"
              class="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500"
            />
            <span class="text-gray-900">Legends in the Mist</span>
          </label>
          <label class="flex items-center">
            <input
              v-model="gameType"
              type="radio"
              value="cotm"
              class="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500"
            />
            <span class="text-gray-900">City of Mist</span>
          </label>
        </div>
      </div>

      <!-- Message d'erreur -->
      <div v-if="error" class="p-4 bg-red-50 border border-red-200 rounded-md">
        <p class="text-sm text-red-800">
          {{ error }}
        </p>
      </div>

      <!-- Boutons d'action -->
      <div class="flex gap-4">
        <button
          type="button"
          :disabled="isCreating"
          class="flex-1 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          @click="createCharacter"
        >
          <span v-if="!isCreating">Créer le personnage</span>
          <span v-else class="flex items-center justify-center">
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Création en cours...
          </span>
        </button>
        <button
          type="button"
          :disabled="isCreating"
          class="px-6 py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          @click="cancel"
        >
          Annuler
        </button>
      </div>
    </div>

    <!-- Info box -->
    <div class="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
      <h3 class="text-sm font-medium text-blue-900 mb-2">
        Prochaines étapes
      </h3>
      <ul class="text-sm text-blue-800 space-y-1">
        <li>1. Créer votre Hero Card avec backstory et birthright</li>
        <li>2. Ajouter vos Theme Cards (Origin, Fellowship, Expertise, Mythos)</li>
        <li>3. Configurer vos trackers (Status, Story Tags, Story Themes)</li>
        <li>4. Ajouter vos relations, quintessences et équipement</li>
      </ul>
    </div>
  </div>
</template>
