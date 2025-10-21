<script setup lang="ts">
/**
 * Page Accueil - MVP v1.0
 *
 * Version simplifiee pointant vers les sections principales
 * Les composants legacy (HeroSection, SystemCards, etc.) seront reimplementes en v1.1+
 */

definePageMeta({
  layout: 'default'
})

useSeoMeta({
  title: 'Brumisa3 - Createur de fiches Mist Engine',
  description: 'Creez et gerez vos fiches de personnages pour Legends in the Mist et autres jeux Mist Engine'
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Hero Section Simplifie -->
    <section class="relative overflow-hidden bg-gradient-to-br from-brand-violet via-purple-700 to-indigo-900 py-20">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <h1 class="mb-6 text-5xl font-bold text-white md:text-6xl">
            Brumisa3
          </h1>
          <p class="mb-8 text-xl text-purple-100">
            Createur de fiches de personnages pour Mist Engine
          </p>
          <div class="flex flex-wrap justify-center gap-4">
            <UiButton to="/decouverte" variant="primary" size="lg">
              Decouvrir
            </UiButton>
            <UiButton to="/preparation" variant="secondary" size="lg">
              Commencer
            </UiButton>
          </div>
        </div>
      </div>
    </section>

    <!-- Sections Principales -->
    <section class="py-16">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 class="mb-12 text-center text-3xl font-bold text-gray-900">
          Explorez Brumisa3
        </h2>

        <div class="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <!-- Decouverte -->
          <NuxtLink
            to="/decouverte"
            class="group rounded-lg border border-gray-200 bg-white p-6 transition-all hover:border-brand-violet hover:shadow-lg"
          >
            <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 text-2xl">
              💡
            </div>
            <h3 class="mb-2 text-xl font-semibold text-gray-900 group-hover:text-brand-violet">
              Decouverte
            </h3>
            <p class="text-gray-600">
              Guides, tutoriels et exemples pour bien demarrer
            </p>
          </NuxtLink>

          <!-- Preparation -->
          <NuxtLink
            to="/preparation"
            class="group rounded-lg border border-gray-200 bg-white p-6 transition-all hover:border-brand-violet hover:shadow-lg"
          >
            <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-2xl">
              ✏️
            </div>
            <h3 class="mb-2 text-xl font-semibold text-gray-900 group-hover:text-brand-violet">
              Preparation
            </h3>
            <p class="text-gray-600">
              Creez et gerez vos playspaces et personnages
            </p>
          </NuxtLink>

          <!-- Solo (v1.3+) -->
          <div class="rounded-lg border border-gray-200 bg-gray-50 p-6 opacity-60">
            <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gray-200 text-2xl">
              🎮
            </div>
            <h3 class="mb-2 text-xl font-semibold text-gray-500">
              Jouer en solo
            </h3>
            <p class="text-gray-400">
              HUD de jeu solo (disponible v1.3+)
            </p>
          </div>

          <!-- VTT (v2.0+) -->
          <div class="rounded-lg border border-gray-200 bg-gray-50 p-6 opacity-60">
            <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gray-200 text-2xl">
              👥
            </div>
            <h3 class="mb-2 text-xl font-semibold text-gray-500">
              Table VTT
            </h3>
            <p class="text-gray-400">
              Interface multi-joueurs (disponible v2.0+)
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="bg-brand-violet py-16">
      <div class="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <h2 class="mb-4 text-3xl font-bold text-white">
          Pret a creer vos personnages ?
        </h2>
        <p class="mb-8 text-xl text-purple-100">
          Rejoignez la communaute Mist Engine et donnez vie a vos histoires
        </p>
        <div class="flex flex-wrap justify-center gap-4">
          <UiButton to="/auth/register" variant="secondary" size="lg">
            Creer un compte
          </UiButton>
          <UiButton to="/decouverte/guide" variant="ghost" size="lg" class="text-white hover:bg-white/10">
            En savoir plus
          </UiButton>
        </div>
      </div>
    </section>
  </div>
</template>
