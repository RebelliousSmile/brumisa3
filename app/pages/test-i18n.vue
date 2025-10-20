<template>
  <div class="container mx-auto p-8">
    <h1 class="text-3xl font-bold mb-6">{{ $t('app.title') }} - Test i18n</h1>

    <div class="space-y-6">
      <!-- Test de traduction basique -->
      <section class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-xl font-semibold mb-4">Traductions de base</h2>
        <ul class="space-y-2">
          <li><strong>Welcome:</strong> {{ $t('app.welcome') }}</li>
          <li><strong>Loading:</strong> {{ $t('common.loading') }}</li>
          <li><strong>Save:</strong> {{ $t('common.save') }}</li>
          <li><strong>Cancel:</strong> {{ $t('common.cancel') }}</li>
        </ul>
      </section>

      <!-- Test de changement de langue -->
      <section class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-xl font-semibold mb-4">Changement de langue</h2>
        <p class="mb-4">Locale actuelle: <strong>{{ locale }}</strong></p>

        <div class="flex gap-4">
          <button
            @click="setLocale('fr')"
            class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            :class="{ 'ring-2 ring-blue-700': locale === 'fr' }"
          >
            Francais
          </button>
          <button
            @click="setLocale('en')"
            class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            :class="{ 'ring-2 ring-green-700': locale === 'en' }"
          >
            English
          </button>
        </div>
      </section>

      <!-- Test de format de dates -->
      <ClientOnly>
        <section class="bg-white p-6 rounded-lg shadow">
          <h2 class="text-xl font-semibold mb-4">Formats de dates</h2>
          <ul class="space-y-2">
            <li v-if="dateShort"><strong>Date courte:</strong> {{ dateShort }}</li>
            <li v-if="dateLong"><strong>Date longue:</strong> {{ dateLong }}</li>
            <li v-if="!now" class="text-gray-400">Chargement...</li>
          </ul>
        </section>
      </ClientOnly>

      <!-- Test de format de nombres -->
      <ClientOnly>
        <section class="bg-white p-6 rounded-lg shadow">
          <h2 class="text-xl font-semibold mb-4">Formats de nombres</h2>
          <ul class="space-y-2">
            <li><strong>Decimal:</strong> {{ numberDecimal }}</li>
            <li><strong>Currency:</strong> {{ numberCurrency }}</li>
          </ul>
        </section>
      </ClientOnly>

      <!-- Informations de debug -->
      <section class="bg-gray-100 p-6 rounded-lg">
        <h2 class="text-xl font-semibold mb-4">Debug Info</h2>
        <pre class="text-sm overflow-auto">{{ debugInfo }}</pre>
      </section>

      <div class="text-center">
        <NuxtLink to="/" class="text-blue-600 hover:underline">
          {{ $t('common.back') }}
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { locale, setLocale, locales } = useI18n()
const now = ref<Date | null>(null)

// Initialiser la date uniquement côté client pour éviter les problèmes d'hydratation
onMounted(() => {
  now.value = new Date()
})

// Formatage manuel des dates et nombres avec l'API Intl
const dateShort = computed(() => {
  if (!now.value) return ''
  return new Intl.DateTimeFormat(locale.value, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(now.value)
})

const dateLong = computed(() => {
  if (!now.value) return ''
  return new Intl.DateTimeFormat(locale.value, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  }).format(now.value)
})

const numberDecimal = computed(() => {
  return new Intl.NumberFormat(locale.value, {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(1234.56)
})

const numberCurrency = computed(() => {
  const currency = locale.value === 'fr' ? 'EUR' : 'USD'
  return new Intl.NumberFormat(locale.value, {
    style: 'currency',
    currency
  }).format(1234.56)
})

const debugInfo = computed(() => ({
  currentLocale: locale.value,
  availableLocales: locales.value,
  date: now.value?.toISOString() || 'Loading...',
  userAgent: process.client ? navigator.userAgent : 'SSR'
}))
</script>
