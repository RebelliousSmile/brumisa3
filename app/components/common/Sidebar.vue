<script setup lang="ts">
/**
 * Sidebar Gauche - Collapsible
 *
 * Structure :
 * - Section "Playspaces" (si authentifie ou guest avec data)
 *   - Badge indicateur role : [MJ] ou [PJ]
 *   - Liste playspaces avec indicateur actif
 *   - [+ Nouveau Playspace]
 * - Section "Raccourcis" (v1.1+)
 */

// TODO: Implementer stores
// const playspaceStore = usePlayspaceStore()
// const { playspaces, activePlayspace } = storeToRefs(playspaceStore)

// Collapsed state
const isCollapsed = ref(false)

// Mock data pour dev
const mockPlayspaces = ref([
  {
    id: '1',
    name: 'LITM - Chicago Noir',
    role: 'PJ',
    characterCount: 3,
    isActive: true
  },
  {
    id: '2',
    name: 'Campagne Test',
    role: 'MJ',
    characterCount: 5,
    isActive: false
  }
])

// TODO: Switch playspace handler
const switchPlayspace = (playspaceId: string) => {
  // await playspaceStore.setActivePlayspace(playspaceId)
  console.log('Switch to playspace:', playspaceId)
}

// Role badge colors
const getRoleBadgeClass = (role: string) => {
  return role === 'MJ'
    ? 'bg-orange-100 text-orange-800 border-orange-300'
    : 'bg-blue-100 text-blue-800 border-blue-300'
}

<template>
  <aside
    :class="[
      'fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 transition-all duration-300 z-40',
      isCollapsed ? 'w-16' : 'w-64'
    ]"
  >
    <!-- Toggle Button -->
    <button
      class="absolute -right-3 top-4 flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm hover:bg-gray-50"
      @click="isCollapsed = !isCollapsed"
    >
      <Icon
        :name="isCollapsed ? 'heroicons:chevron-right' : 'heroicons:chevron-left'"
        class="h-4 w-4 text-gray-600"
      />
    </button>

    <!-- Content -->
    <div class="flex h-full flex-col overflow-hidden">
      <!-- Section Playspaces -->
      <div class="flex-1 overflow-y-auto p-4">
        <!-- Header Section -->
        <div v-if="!isCollapsed" class="mb-4 flex items-center justify-between">
          <h2 class="text-sm font-semibold text-gray-700">Playspaces</h2>
        </div>

        <!-- Liste Playspaces -->
        <div class="space-y-2">
          <button
            v-for="playspace in mockPlayspaces"
            :key="playspace.id"
            :class="[
              'w-full rounded-lg p-3 text-left transition-all',
              playspace.isActive
                ? 'bg-brand-violet text-white shadow-md'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            ]"
            @click="switchPlayspace(playspace.id)"
          >
            <!-- Collapsed View (Icon Only) -->
            <template v-if="isCollapsed">
              <div class="flex justify-center">
                <div
                  :class="[
                    'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold',
                    playspace.isActive ? 'bg-white text-brand-violet' : 'bg-gray-200 text-gray-700'
                  ]"
                >
                  {{ playspace.name.charAt(0) }}
                </div>
              </div>
            </template>

            <!-- Expanded View -->
            <template v-else>
              <div class="flex items-start justify-between">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center space-x-2">
                    <span class="truncate text-sm font-medium">
                      {{ playspace.name }}
                    </span>
                    <span
                      v-if="playspace.isActive"
                      class="flex-shrink-0"
                    >
                      <Icon name="heroicons:star-solid" class="h-4 w-4" />
                    </span>
                  </div>
                  <div class="mt-1 flex items-center space-x-2 text-xs">
                    <span
                      :class="[
                        'inline-flex items-center rounded-full border px-2 py-0.5 font-medium',
                        playspace.isActive
                          ? 'bg-white text-brand-violet border-white'
                          : getRoleBadgeClass(playspace.role)
                      ]"
                    >
                      {{ playspace.role }}
                    </span>
                    <span :class="playspace.isActive ? 'text-white/80' : 'text-gray-500'">
                      {{ playspace.characterCount }} perso{{ playspace.characterCount > 1 ? 's' : '' }}
                    </span>
                  </div>
                </div>
              </div>
            </template>
          </button>
        </div>

        <!-- Nouveau Playspace Button -->
        <NuxtLink
          to="/playspaces/new"
          :class="[
            'mt-4 flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-3 text-sm font-medium text-gray-600 transition-colors hover:border-brand-violet hover:text-brand-violet',
            isCollapsed ? '' : ''
          ]"
        >
          <Icon name="heroicons:plus" class="h-5 w-5" />
          <span v-if="!isCollapsed" class="ml-2">Nouveau Playspace</span>
        </NuxtLink>
      </div>

      <!-- Section Raccourcis (v1.1+) -->
      <div v-if="!isCollapsed" class="border-t border-gray-200 p-4">
        <h3 class="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Raccourcis
        </h3>
        <div class="space-y-1">
          <button class="w-full rounded-lg px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100">
            Export complet
          </button>
          <button class="w-full rounded-lg px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100">
            Parametres rapides
          </button>
        </div>
      </div>
    </div>
  </aside>
</template>
