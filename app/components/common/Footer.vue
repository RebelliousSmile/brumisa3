<script setup lang="ts">
/**
 * Footer Persistant
 *
 * Liens utilitaires :
 * - Dons (OpenCollective)
 * - Sponsors
 * - A Propos
 * - Legal (RGPD, Licences, CGU)
 */

const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="border-t border-gray-200 bg-gray-50">
    <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 gap-8 md:grid-cols-4">
        <!-- Brumisater -->
        <div>
          <h3 class="text-lg font-bold text-brand-violet">Brumisater</h3>
          <p class="mt-2 text-sm text-gray-600">
            L'outil de creation de personnages pour le Mist Engine
          </p>
        </div>

        <!-- Support -->
        <div>
          <h4 class="text-sm font-semibold text-gray-900">Support</h4>
          <ul class="mt-4 space-y-2">
            <li>
              <NuxtLink to="/support" class="text-sm text-gray-600 hover:text-brand-violet">
                Dons
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/support#sponsors" class="text-sm text-gray-600 hover:text-brand-violet">
                Sponsors
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/decouverte/guide" class="text-sm text-gray-600 hover:text-brand-violet">
                FAQ
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Decouverte -->
        <div>
          <h4 class="text-sm font-semibold text-gray-900">Decouverte</h4>
          <ul class="mt-4 space-y-2">
            <li>
              <NuxtLink to="/decouverte/guide" class="text-sm text-gray-600 hover:text-brand-violet">
                Guide complet
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/decouverte/tutoriels" class="text-sm text-gray-600 hover:text-brand-violet">
                Tutoriels
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/decouverte/exemples" class="text-sm text-gray-600 hover:text-brand-violet">
                Exemples
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Legal -->
        <div>
          <h4 class="text-sm font-semibold text-gray-900">Legal</h4>
          <ul class="mt-4 space-y-2">
            <li>
              <NuxtLink to="/about" class="text-sm text-gray-600 hover:text-brand-violet">
                A Propos
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/legal" class="text-sm text-gray-600 hover:text-brand-violet">
                Mentions Legales
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/legal#rgpd" class="text-sm text-gray-600 hover:text-brand-violet">
                RGPD
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="mt-8 border-t border-gray-200 pt-6">
        <div class="flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0">
          <p class="text-sm text-gray-600">
            © {{ currentYear }} Brumisater. Cree avec passion pour la communaute Mist Engine.
          </p>
          <div class="flex space-x-4">
            <a href="#" class="text-gray-400 hover:text-brand-violet">
              <Icon name="mdi:github" class="h-5 w-5" />
            </a>
            <a href="#" class="text-gray-400 hover:text-brand-violet">
              <Icon name="mdi:discord" class="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>
