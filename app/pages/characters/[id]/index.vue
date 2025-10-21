<script setup lang="ts">
/**
 * Page Vue Personnage (Lecture Seule)
 *
 * Header personnage : Avatar, Nom, Niveau
 * [Mode MJ] Badge : PJ ou PNJ
 * Actions : Modifier, Dupliquer, Exporter, Supprimer
 * Apercu sections :
 * - Theme Cards (preview)
 * - Hero Card (preview)
 */

definePageMeta({
  layout: 'playspace',
  middleware: ['auth', 'playspace']
})

const route = useRoute()
const characterId = route.params.id as string

// TODO: Implementer vue personnage
// const characterStore = useCharacterStore()
// const character = computed(() => characterStore.getCharacterById(characterId))

useSeoMeta({
  title: 'Personnage - Brumisater',
  description: 'Vue detaillee de votre personnage'
})
