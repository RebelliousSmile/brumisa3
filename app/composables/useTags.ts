/**
 * Composable: useTags
 * Gestion des Tags pour les Theme Cards
 *
 * Business Rules (City of Mist):
 * - Power tags: 3-5 par theme card
 * - Weakness tags: 1-2 par theme card
 * - Story tags: illimités
 */

import { ref } from 'vue'
import type { Tag } from '../../shared/stores/character'

export function useTags() {
  const uiStore = useUiStore()
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Crée un nouveau tag
   */
  async function createTag(
    themeCardId: string,
    input: {
      name: string
      type: 'POWER' | 'WEAKNESS' | 'STORY'
      burned?: boolean
      inverted?: boolean
    }
  ): Promise<Tag> {
    loading.value = true
    error.value = null

    try {
      const newTag = await $fetch<Tag>(`/api/theme-cards/${themeCardId}/tags`, {
        method: 'POST',
        body: {
          ...input,
          themeCardId
        }
      })

      uiStore.notifierSucces('Tag créé', `${input.name} a été ajouté`)
      return newTag
    } catch (err: any) {
      error.value = err.message || 'Erreur lors de la création du tag'
      uiStore.notifierErreur('Erreur de création', error.value)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Met à jour un tag
   */
  async function updateTag(
    tagId: string,
    input: {
      name?: string
      type?: 'POWER' | 'WEAKNESS' | 'STORY'
      burned?: boolean
      inverted?: boolean
    }
  ): Promise<Tag> {
    loading.value = true
    error.value = null

    try {
      const updated = await $fetch<Tag>(`/api/tags/${tagId}`, {
        method: 'PUT',
        body: input
      })

      uiStore.notifierSucces('Tag mis à jour')
      return updated
    } catch (err: any) {
      error.value = err.message || 'Erreur lors de la mise à jour du tag'
      uiStore.notifierErreur('Erreur de mise à jour', error.value)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Supprime un tag
   * Validation: respecte les limites min/max
   */
  async function deleteTag(tagId: string): Promise<void> {
    loading.value = true
    error.value = null

    try {
      const confirme = await uiStore.confirmer(
        'Supprimer Tag',
        'Êtes-vous sûr de vouloir supprimer ce tag ?',
        {
          labelConfirmer: 'Supprimer',
          typeConfirmer: 'danger'
        }
      )

      if (!confirme) {
        loading.value = false
        return
      }

      await $fetch(`/api/tags/${tagId}`, {
        method: 'DELETE'
      })

      uiStore.notifierSucces('Tag supprimé')
    } catch (err: any) {
      error.value = err.message || 'Erreur lors de la suppression du tag'
      uiStore.notifierErreur('Erreur de suppression', error.value)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Toggle burned state
   */
  async function toggleBurned(tagId: string, currentState: boolean): Promise<Tag> {
    return updateTag(tagId, { burned: !currentState })
  }

  /**
   * Toggle inverted state
   */
  async function toggleInverted(tagId: string, currentState: boolean): Promise<Tag> {
    return updateTag(tagId, { inverted: !currentState })
  }

  /**
   * Valide si on peut ajouter un tag selon le type et le count actuel
   */
  function canAddTag(tags: Tag[], type: 'POWER' | 'WEAKNESS' | 'STORY'): { valid: boolean; reason?: string } {
    const powerCount = tags.filter(t => t.type === 'POWER').length
    const weaknessCount = tags.filter(t => t.type === 'WEAKNESS').length

    if (type === 'POWER' && powerCount >= 5) {
      return { valid: false, reason: 'Maximum 5 Power tags' }
    }

    if (type === 'WEAKNESS' && weaknessCount >= 2) {
      return { valid: false, reason: 'Maximum 2 Weakness tags' }
    }

    if (type === 'STORY') {
      return { valid: true } // Story tags illimités
    }

    return { valid: true }
  }

  /**
   * Valide si on peut supprimer un tag selon le type et le count actuel
   */
  function canDeleteTag(tags: Tag[], tagId: string): { valid: boolean; reason?: string } {
    const tag = tags.find(t => t.id === tagId)
    if (!tag) return { valid: false, reason: 'Tag non trouvé' }

    const powerCount = tags.filter(t => t.type === 'POWER').length
    const weaknessCount = tags.filter(t => t.type === 'WEAKNESS').length

    if (tag.type === 'POWER' && powerCount <= 3) {
      return { valid: false, reason: 'Minimum 3 Power tags requis' }
    }

    if (tag.type === 'WEAKNESS' && weaknessCount <= 1) {
      return { valid: false, reason: 'Minimum 1 Weakness tag requis' }
    }

    return { valid: true }
  }

  /**
   * Compte les tags par type
   */
  function countByType(tags: Tag[]): { power: number; weakness: number; story: number } {
    return {
      power: tags.filter(t => t.type === 'POWER').length,
      weakness: tags.filter(t => t.type === 'WEAKNESS').length,
      story: tags.filter(t => t.type === 'STORY').length
    }
  }

  /**
   * Valide qu'une theme card a tous les tags requis
   */
  function validateThemeCardTags(tags: Tag[]): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    const counts = countByType(tags)

    if (counts.power < 3) {
      errors.push('Minimum 3 Power tags requis')
    }
    if (counts.power > 5) {
      errors.push('Maximum 5 Power tags autorisés')
    }
    if (counts.weakness < 1) {
      errors.push('Minimum 1 Weakness tag requis')
    }
    if (counts.weakness > 2) {
      errors.push('Maximum 2 Weakness tags autorisés')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  return {
    loading,
    error,
    createTag,
    updateTag,
    deleteTag,
    toggleBurned,
    toggleInverted,
    canAddTag,
    canDeleteTag,
    countByType,
    validateThemeCardTags
  }
}
