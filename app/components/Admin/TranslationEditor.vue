<script setup lang="ts">
/**
 * TranslationEditor - Composant d'edition des traductions
 *
 * Permet de visualiser et editer les traductions avec leur hierarchie:
 * SYSTEM -> HACK -> UNIVERSE
 *
 * @module Admin/TranslationEditor
 */

import type { TranslationCategory, TranslationLevel } from '@prisma/client'

// ===========================================
// PROPS & EMITS
// ===========================================

interface Props {
  /** Categorie de traductions a afficher */
  category: TranslationCategory
  /** hackId courant */
  hackId: string
  /** universeId optionnel */
  universeId?: string | null
  /** Niveau d'edition autorise (HACK pour admin hack, UNIVERSE pour createurs) */
  editLevel: TranslationLevel
  /** Locale active */
  locale?: string
}

const props = withDefaults(defineProps<Props>(), {
  locale: 'fr',
  universeId: null
})

const emit = defineEmits<{
  (e: 'updated', key: string): void
}>()

// ===========================================
// STATE
// ===========================================

const translations = ref<Record<string, string>>({})
const loading = ref(false)
const error = ref<string | null>(null)
const searchQuery = ref('')
const editingKey = ref<string | null>(null)
const editingValue = ref('')
const savingKey = ref<string | null>(null)

// ===========================================
// COMPUTED
// ===========================================

const filteredTranslations = computed(() => {
  const entries = Object.entries(translations.value)
  if (!searchQuery.value) return entries

  const query = searchQuery.value.toLowerCase()
  return entries.filter(
    ([key, value]) =>
      key.toLowerCase().includes(query) || value.toLowerCase().includes(query)
  )
})

const translationCount = computed(() => Object.keys(translations.value).length)

// ===========================================
// METHODS
// ===========================================

async function loadTranslations() {
  loading.value = true
  error.value = null

  try {
    const response = await $fetch<{
      translations: Record<string, string>
      count: number
    }>('/api/translations/resolve', {
      query: {
        locale: props.locale,
        hackId: props.hackId,
        universeId: props.universeId,
        category: props.category
      }
    })

    translations.value = response.translations
    console.log(`[TranslationEditor] Loaded ${response.count} translations`)
  } catch (err: any) {
    error.value = err.message || 'Erreur de chargement'
    console.error('[TranslationEditor] Load error:', err)
  } finally {
    loading.value = false
  }
}

function startEdit(key: string, currentValue: string) {
  editingKey.value = key
  editingValue.value = currentValue
}

function cancelEdit() {
  editingKey.value = null
  editingValue.value = ''
}

async function saveEdit() {
  if (!editingKey.value) return

  savingKey.value = editingKey.value

  try {
    await $fetch('/api/translations/override', {
      method: 'POST',
      body: {
        key: editingKey.value,
        value: editingValue.value,
        locale: props.locale,
        category: props.category,
        level: props.editLevel,
        ...(props.editLevel === 'HACK' && { hackId: props.hackId }),
        ...(props.editLevel === 'UNIVERSE' && { universeId: props.universeId })
      }
    })

    // Mettre a jour localement
    translations.value[editingKey.value] = editingValue.value
    emit('updated', editingKey.value)

    cancelEdit()
  } catch (err: any) {
    error.value = err.message || 'Erreur de sauvegarde'
  } finally {
    savingKey.value = null
  }
}

async function removeOverride(key: string) {
  if (!confirm(`Supprimer l'override pour "${key}" ?`)) return

  savingKey.value = key

  try {
    await $fetch('/api/translations/override', {
      method: 'DELETE',
      query: {
        key,
        locale: props.locale,
        category: props.category,
        level: props.editLevel,
        hackId: props.hackId,
        universeId: props.universeId
      }
    })

    // Recharger les traductions pour obtenir la valeur parente
    await loadTranslations()
    emit('updated', key)
  } catch (err: any) {
    error.value = err.message || 'Erreur de suppression'
  } finally {
    savingKey.value = null
  }
}

// ===========================================
// LIFECYCLE
// ===========================================

onMounted(() => {
  loadTranslations()
})

watch(
  () => [props.category, props.hackId, props.universeId, props.locale],
  () => {
    loadTranslations()
  }
)
</script>

<template>
  <div class="translation-editor">
    <!-- Header -->
    <div class="editor-header">
      <h3 class="editor-title">
        Traductions: {{ category }}
        <span class="count">({{ translationCount }})</span>
      </h3>

      <div class="editor-controls">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Rechercher..."
          class="search-input"
        />
        <button class="btn-refresh" @click="loadTranslations" :disabled="loading">
          Actualiser
        </button>
      </div>
    </div>

    <!-- Error -->
    <div v-if="error" class="error-message">
      {{ error }}
      <button class="btn-close" @click="error = null">x</button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-state">
      Chargement...
    </div>

    <!-- Translations List -->
    <div v-else class="translations-list">
      <div
        v-for="[key, value] in filteredTranslations"
        :key="key"
        class="translation-item"
        :class="{ editing: editingKey === key, saving: savingKey === key }"
      >
        <div class="translation-key">
          {{ key }}
        </div>

        <div class="translation-value">
          <!-- Mode edition -->
          <template v-if="editingKey === key">
            <textarea
              v-model="editingValue"
              class="edit-textarea"
              rows="2"
              @keydown.escape="cancelEdit"
            />
            <div class="edit-actions">
              <button class="btn-save" @click="saveEdit" :disabled="savingKey === key">
                Sauvegarder
              </button>
              <button class="btn-cancel" @click="cancelEdit">
                Annuler
              </button>
            </div>
          </template>

          <!-- Mode lecture -->
          <template v-else>
            <span class="value-text">{{ value }}</span>
            <div class="item-actions">
              <button class="btn-edit" @click="startEdit(key, value)">
                Editer
              </button>
              <button
                class="btn-remove"
                @click="removeOverride(key)"
                title="Supprimer l'override"
              >
                Reset
              </button>
            </div>
          </template>
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="filteredTranslations.length === 0 && !loading" class="empty-state">
        <template v-if="searchQuery">
          Aucune traduction trouvee pour "{{ searchQuery }}"
        </template>
        <template v-else>
          Aucune traduction dans cette categorie
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.translation-editor {
  background: var(--bg-secondary, #1a1a2e);
  border-radius: 8px;
  padding: 1rem;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.editor-title {
  margin: 0;
  font-size: 1.25rem;
  color: var(--text-primary, #fff);
}

.count {
  font-weight: normal;
  color: var(--text-muted, #888);
  font-size: 0.9rem;
}

.editor-controls {
  display: flex;
  gap: 0.5rem;
}

.search-input {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border-color, #333);
  border-radius: 4px;
  background: var(--bg-primary, #0f0f1a);
  color: var(--text-primary, #fff);
  min-width: 200px;
}

.search-input:focus {
  outline: none;
  border-color: var(--accent-color, #7c3aed);
}

.btn-refresh {
  padding: 0.5rem 1rem;
  background: var(--accent-color, #7c3aed);
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-refresh:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error-message {
  background: #ff4444;
  color: #fff;
  padding: 0.75rem 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn-close {
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
  font-size: 1.25rem;
}

.loading-state {
  text-align: center;
  color: var(--text-muted, #888);
  padding: 2rem;
}

.translations-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.translation-item {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 1rem;
  padding: 0.75rem;
  background: var(--bg-primary, #0f0f1a);
  border-radius: 4px;
  border: 1px solid transparent;
  transition: border-color 0.2s;
}

.translation-item:hover {
  border-color: var(--border-color, #333);
}

.translation-item.editing {
  border-color: var(--accent-color, #7c3aed);
}

.translation-item.saving {
  opacity: 0.6;
  pointer-events: none;
}

.translation-key {
  font-family: monospace;
  font-size: 0.85rem;
  color: var(--text-muted, #aaa);
  word-break: break-all;
}

.translation-value {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.value-text {
  color: var(--text-primary, #fff);
}

.item-actions {
  display: flex;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.2s;
}

.translation-item:hover .item-actions {
  opacity: 1;
}

.btn-edit,
.btn-remove {
  padding: 0.25rem 0.5rem;
  font-size: 0.8rem;
  border: none;
  border-radius: 3px;
  cursor: pointer;
}

.btn-edit {
  background: var(--accent-color, #7c3aed);
  color: #fff;
}

.btn-remove {
  background: transparent;
  color: var(--text-muted, #888);
  border: 1px solid var(--border-color, #333);
}

.btn-remove:hover {
  border-color: #ff4444;
  color: #ff4444;
}

.edit-textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--accent-color, #7c3aed);
  border-radius: 4px;
  background: var(--bg-secondary, #1a1a2e);
  color: var(--text-primary, #fff);
  font-family: inherit;
  resize: vertical;
}

.edit-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-save {
  padding: 0.25rem 0.75rem;
  background: var(--success-color, #22c55e);
  color: #fff;
  border: none;
  border-radius: 3px;
  cursor: pointer;
}

.btn-cancel {
  padding: 0.25rem 0.75rem;
  background: transparent;
  color: var(--text-muted, #888);
  border: 1px solid var(--border-color, #333);
  border-radius: 3px;
  cursor: pointer;
}

.empty-state {
  text-align: center;
  color: var(--text-muted, #888);
  padding: 2rem;
  font-style: italic;
}

@media (max-width: 768px) {
  .translation-item {
    grid-template-columns: 1fr;
  }

  .editor-header {
    flex-direction: column;
    align-items: stretch;
  }

  .editor-controls {
    flex-direction: column;
  }

  .search-input {
    min-width: auto;
  }
}
</style>
