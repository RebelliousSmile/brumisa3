/**
 * Composable: useThemeCards
 * Gestion des Theme Cards pour les personnages
 *
 * Business Rules:
 * - Min 2 Theme Cards par personnage (City of Mist)
 * - Max 4 Theme Cards par personnage (City of Mist)
 * - Types de thèmes varient selon hack:
 *   - LITM: ORIGIN, ADVENTURE, GREATNESS, FELLOWSHIP, BACKPACK
 *   - Otherscape: NOISE, SELF, MYTHOS_OS, CREW_OS, LOADOUT
 *   - City of Mist: MYTHOS, LOGOS, MIST, CREW
 */

import { ref } from 'vue'
import type { ThemeCard } from '~/shared/stores/character'
import { useUiStore } from '~/shared/stores/ui'

export function useThemeCards() {
  const uiStore = useUiStore()
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Récupère les theme cards d'un personnage
   */
  async function getThemeCards(characterId: string): Promise<ThemeCard[]> {
    loading.value = true
    error.value = null

    try {
      const themeCards = await $fetch<ThemeCard[]>(`/api/characters/${characterId}/theme-cards`)
      return themeCards
    } catch (err: any) {
      error.value = err.message || 'Erreur lors de la récupération des theme cards'
      uiStore.notifierErreur('Erreur', error.value)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Crée une nouvelle theme card
   */
  async function createThemeCard(
    characterId: string,
    input: {
      name: string
      type: string
      description?: string
      attention?: number
    }
  ): Promise<ThemeCard> {
    loading.value = true
    error.value = null

    try {
      const newThemeCard = await $fetch<ThemeCard>(`/api/characters/${characterId}/theme-cards`, {
        method: 'POST',
        body: {
          ...input,
          characterId
        }
      })

      uiStore.notifierSucces('Theme Card créée', `${input.name} a été ajoutée`)
      return newThemeCard
    } catch (err: any) {
      error.value = err.message || 'Erreur lors de la création de la theme card'
      uiStore.notifierErreur('Erreur de création', error.value)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Met à jour une theme card
   */
  async function updateThemeCard(
    themeCardId: string,
    input: {
      name?: string
      type?: string
      description?: string
      attention?: number
    }
  ): Promise<ThemeCard> {
    loading.value = true
    error.value = null

    try {
      const updated = await $fetch<ThemeCard>(`/api/theme-cards/${themeCardId}`, {
        method: 'PUT',
        body: input
      })

      uiStore.notifierSucces('Theme Card mise à jour')
      return updated
    } catch (err: any) {
      error.value = err.message || 'Erreur lors de la mise à jour de la theme card'
      uiStore.notifierErreur('Erreur de mise à jour', error.value)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Supprime une theme card
   * Validation: minimum 2 theme cards requis
   */
  async function deleteThemeCard(themeCardId: string): Promise<void> {
    loading.value = true
    error.value = null

    try {
      const confirme = await uiStore.confirmer(
        'Supprimer Theme Card',
        'Êtes-vous sûr de vouloir supprimer cette theme card ? Minimum 2 theme cards requis.',
        {
          labelConfirmer: 'Supprimer',
          typeConfirmer: 'danger'
        }
      )

      if (!confirme) {
        loading.value = false
        return
      }

      await $fetch(`/api/theme-cards/${themeCardId}`, {
        method: 'DELETE'
      })

      uiStore.notifierSucces('Theme Card supprimée')
    } catch (err: any) {
      error.value = err.message || 'Erreur lors de la suppression de la theme card'
      uiStore.notifierErreur('Erreur de suppression', error.value)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Valide qu'une theme card peut être supprimée (min 2)
   */
  function canDeleteThemeCard(currentCount: number): boolean {
    return currentCount > 2
  }

  /**
   * Valide qu'une theme card peut être ajoutée (max 4)
   */
  function canAddThemeCard(currentCount: number): boolean {
    return currentCount < 4
  }

  /**
   * Récupère les types de thèmes disponibles selon le hack
   */
  function getAvailableThemeTypes(hackId: string): { value: string; label: string }[] {
    const themeTypes: Record<string, { value: string; label: string }[]> = {
      'litm': [
        { value: 'ORIGIN', label: 'Origin' },
        { value: 'ADVENTURE', label: 'Adventure' },
        { value: 'GREATNESS', label: 'Greatness' },
        { value: 'FELLOWSHIP', label: 'Fellowship' },
        { value: 'BACKPACK', label: 'Backpack' }
      ],
      'otherscape': [
        { value: 'NOISE', label: 'Noise' },
        { value: 'SELF', label: 'Self' },
        { value: 'MYTHOS_OS', label: 'Mythos-OS' },
        { value: 'CREW_OS', label: 'Crew-OS' },
        { value: 'LOADOUT', label: 'Loadout' }
      ],
      'city-of-mist': [
        { value: 'MYTHOS', label: 'Mythos' },
        { value: 'LOGOS', label: 'Logos' },
        { value: 'MIST', label: 'Mist' },
        { value: 'CREW', label: 'Crew' }
      ]
    }

    return themeTypes[hackId] || themeTypes['city-of-mist']
  }

  return {
    loading,
    error,
    getThemeCards,
    createThemeCard,
    updateThemeCard,
    deleteThemeCard,
    canDeleteThemeCard,
    canAddThemeCard,
    getAvailableThemeTypes
  }
}
