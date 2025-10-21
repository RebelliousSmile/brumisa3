<script setup lang="ts">
/**
 * Page Creation Playspace
 *
 * Wizard 5 etapes :
 * 1. Role (MJ ou PJ) - NOUVELLE ETAPE CRITIQUE
 * 2. Systeme (Mist Engine / City of Mist)
 * 3. Hack (LITM / Otherscape)
 * 4. Univers (Chicago / Londres / Custom)
 * 5. Nom (suggestion auto avec role)
 */

definePageMeta({
  layout: 'default',
  middleware: ['auth']
})

// TODO: Implementer wizard creation
// const currentStep = ref(1)
// const formData = ref({
//   role: null as 'MJ' | 'PJ' | null,
//   systemId: null as string | null,
//   hackId: null as string | null,
//   universeId: null as string | null,
//   name: ''
// })

useSeoMeta({
  title: 'Nouveau Playspace - Brumisater',
  description: 'Creez un nouveau playspace : choisissez votre role MJ/PJ, systeme, hack et univers'
})
