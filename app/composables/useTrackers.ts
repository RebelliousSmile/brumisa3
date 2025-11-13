/**
 * Composable: useTrackers
 * Gestion des Trackers du personnage
 *
 * Trackers Types:
 * - Statuses: Conditions temporaires (tier 1-5, positif/négatif)
 * - Story Tags: Tags narratifs pour l'histoire
 * - Story Themes: Thèmes d'histoire en cours
 */

import { ref } from 'vue'
import type { Trackers, Status, StoryTag, StoryTheme } from '../../shared/stores/character'

export function useTrackers() {
  const uiStore = useUiStore()
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Met à jour les trackers d'un personnage (remplacement complet)
   */
  async function updateTrackers(
    characterId: string,
    input: {
      statuses?: Array<{
        name: string
        tier: number
        positive: boolean
      }>
      storyTags?: Array<{
        name: string
      }>
      storyThemes?: Array<{
        name: string
      }>
    }
  ): Promise<Trackers> {
    loading.value = true
    error.value = null

    try {
      const updated = await $fetch<Trackers>(`/api/characters/${characterId}/trackers`, {
        method: 'PUT',
        body: input
      })

      uiStore.notifierSucces('Trackers mis à jour')
      return updated
    } catch (err: any) {
      error.value = err.message || 'Erreur lors de la mise à jour des trackers'
      uiStore.notifierErreur('Erreur de mise à jour', error.value)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Ajoute un status
   */
  async function addStatus(
    characterId: string,
    currentTrackers: Trackers,
    status: {
      name: string
      tier: number
      positive: boolean
    }
  ): Promise<Trackers> {
    const newStatuses = [...(currentTrackers.statuses || []), status]
    return updateTrackers(characterId, {
      statuses: newStatuses.map(s => ({
        name: s.name,
        tier: s.tier,
        positive: s.positive
      }))
    })
  }

  /**
   * Supprime un status
   */
  async function removeStatus(
    characterId: string,
    currentTrackers: Trackers,
    statusId: string
  ): Promise<Trackers> {
    const newStatuses = (currentTrackers.statuses || []).filter(s => s.id !== statusId)
    return updateTrackers(characterId, {
      statuses: newStatuses.map(s => ({
        name: s.name,
        tier: s.tier,
        positive: s.positive
      }))
    })
  }

  /**
   * Modifie le tier d'un status
   */
  async function updateStatusTier(
    characterId: string,
    currentTrackers: Trackers,
    statusId: string,
    newTier: number
  ): Promise<Trackers> {
    const newStatuses = (currentTrackers.statuses || []).map(s =>
      s.id === statusId ? { ...s, tier: newTier } : s
    )
    return updateTrackers(characterId, {
      statuses: newStatuses.map(s => ({
        name: s.name,
        tier: s.tier,
        positive: s.positive
      }))
    })
  }

  /**
   * Ajoute un story tag
   */
  async function addStoryTag(
    characterId: string,
    currentTrackers: Trackers,
    storyTag: {
      name: string
    }
  ): Promise<Trackers> {
    const newStoryTags = [...(currentTrackers.storyTags || []), storyTag]
    return updateTrackers(characterId, {
      storyTags: newStoryTags.map(st => ({ name: st.name }))
    })
  }

  /**
   * Supprime un story tag
   */
  async function removeStoryTag(
    characterId: string,
    currentTrackers: Trackers,
    storyTagId: string
  ): Promise<Trackers> {
    const newStoryTags = (currentTrackers.storyTags || []).filter(st => st.id !== storyTagId)
    return updateTrackers(characterId, {
      storyTags: newStoryTags.map(st => ({ name: st.name }))
    })
  }

  /**
   * Ajoute un story theme
   */
  async function addStoryTheme(
    characterId: string,
    currentTrackers: Trackers,
    storyTheme: {
      name: string
    }
  ): Promise<Trackers> {
    const newStoryThemes = [...(currentTrackers.storyThemes || []), storyTheme]
    return updateTrackers(characterId, {
      storyThemes: newStoryThemes.map(st => ({ name: st.name }))
    })
  }

  /**
   * Supprime un story theme
   */
  async function removeStoryTheme(
    characterId: string,
    currentTrackers: Trackers,
    storyThemeId: string
  ): Promise<Trackers> {
    const newStoryThemes = (currentTrackers.storyThemes || []).filter(st => st.id !== storyThemeId)
    return updateTrackers(characterId, {
      storyThemes: newStoryThemes.map(st => ({ name: st.name }))
    })
  }

  /**
   * Valide le tier (1-5)
   */
  function validateTier(tier: number): boolean {
    return tier >= 1 && tier <= 5
  }

  /**
   * Récupère le label du tier
   */
  function getTierLabel(tier: number): string {
    const labels: Record<number, string> = {
      1: 'Léger',
      2: 'Modéré',
      3: 'Sérieux',
      4: 'Grave',
      5: 'Critique'
    }
    return labels[tier] || 'Inconnu'
  }

  /**
   * Récupère la couleur CSS selon le tier et positive/negative
   */
  function getStatusColor(tier: number, positive: boolean): string {
    if (positive) {
      const colors = ['green-300', 'green-400', 'green-500', 'green-600', 'green-700']
      return colors[tier - 1] || 'green-500'
    } else {
      const colors = ['red-300', 'red-400', 'red-500', 'red-600', 'red-700']
      return colors[tier - 1] || 'red-500'
    }
  }

  /**
   * Compte les statuses par type
   */
  function countStatuses(statuses: Status[]): { positive: number; negative: number; total: number } {
    const positive = statuses.filter(s => s.positive).length
    const negative = statuses.filter(s => !s.positive).length

    return {
      positive,
      negative,
      total: statuses.length
    }
  }

  /**
   * Récupère les labels contextuels selon le hack
   * CoM: Attention (crack/mark/fade)
   * LITM: Attention
   * Otherscape: Upgrade/Decay
   */
  function getLabels(hackId: string): {
    statuses: string
    storyTags: string
    storyThemes: string
  } {
    if (hackId === 'otherscape') {
      return {
        statuses: 'Statuses',
        storyTags: 'Story Tags',
        storyThemes: 'Story Themes'
      }
    }

    return {
      statuses: 'Statuses',
      storyTags: 'Story Tags',
      storyThemes: 'Story Themes'
    }
  }

  return {
    loading,
    error,
    updateTrackers,
    addStatus,
    removeStatus,
    updateStatusTier,
    addStoryTag,
    removeStoryTag,
    addStoryTheme,
    removeStoryTheme,
    validateTier,
    getTierLabel,
    getStatusColor,
    countStatuses,
    getLabels
  }
}
