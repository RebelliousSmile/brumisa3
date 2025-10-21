<script setup lang="ts">
/**
 * Page Edition Personnage
 *
 * Navigation tabs verticale (ancres internes) :
 * - #informations (Nom, Description, Avatar, Niveau, Type PJ/PNJ si MJ)
 * - #theme-cards (Section Theme Cards 2-4)
 * - #hero-card (Section Hero Card optionnelle)
 *
 * Composants utilises :
 * - ThemeCard.vue (edition inline Power/Weakness tags)
 * - HeroCard.vue (Relations, Quintessences)
 */

definePageMeta({
  layout: 'playspace',
  middleware: ['auth', 'playspace']
})

const route = useRoute()
const characterId = route.params.id as string

// TODO: Implementer edition personnage
// const characterStore = useCharacterStore()
// const character = computed(() => characterStore.getCharacterById(characterId))

// Navigation interne
// const activeSection = ref<'informations' | 'theme-cards' | 'hero-card'>('informations')

useSeoMeta({
  title: 'Editer Personnage - Brumisater',
  description: 'Editez votre personnage : informations, Theme Cards, Hero Card'
})
