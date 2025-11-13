/**
 * Composable: useHeroCard
 * Gestion de la Hero Card du personnage
 *
 * Notes:
 * - Identity: Personnalité mundane (CoM/LITM) ou Self (Otherscape)
 * - Mystery: Essence mystique (CoM/LITM) ou Itch (Otherscape)
 * - Relationships: Connexions avec autres personnages/PNJs
 */

import { ref } from 'vue'
import type { HeroCard } from '../../shared/stores/character'

export function useHeroCard() {
  const uiStore = useUiStore()
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Met à jour la hero card d'un personnage
   */
  async function updateHeroCard(
    characterId: string,
    input: {
      identity?: string
      mystery?: string
    }
  ): Promise<HeroCard> {
    loading.value = true
    error.value = null

    try {
      const updated = await $fetch<HeroCard>(`/api/characters/${characterId}/hero-card`, {
        method: 'PUT',
        body: input
      })

      uiStore.notifierSucces('Hero Card mise à jour')
      return updated
    } catch (err: any) {
      error.value = err.message || 'Erreur lors de la mise à jour de la hero card'
      uiStore.notifierErreur('Erreur de mise à jour', error.value)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Met à jour uniquement l'identity
   */
  async function updateIdentity(characterId: string, identity: string): Promise<HeroCard> {
    return updateHeroCard(characterId, { identity })
  }

  /**
   * Met à jour uniquement le mystery
   */
  async function updateMystery(characterId: string, mystery: string): Promise<HeroCard> {
    return updateHeroCard(characterId, { mystery })
  }

  /**
   * Récupère les labels contextuels selon le hack
   * CoM/LITM: Identity/Mystery
   * Otherscape: Self/Itch
   */
  function getLabels(hackId: string): { identity: string; mystery: string } {
    if (hackId === 'otherscape') {
      return {
        identity: 'Self',
        mystery: 'Itch'
      }
    }

    return {
      identity: 'Identity',
      mystery: 'Mystery'
    }
  }

  /**
   * Récupère les placeholders contextuels selon le hack
   */
  function getPlaceholders(hackId: string): { identity: string; mystery: string } {
    if (hackId === 'otherscape') {
      return {
        identity: 'Qui êtes-vous vraiment dans ce monde technologique ?',
        mystery: 'Quelle démangeaison vous pousse à agir ?'
      }
    }

    if (hackId === 'litm') {
      return {
        identity: 'Votre identité de héros légendaire',
        mystery: 'Le mystère qui vous entoure'
      }
    }

    // City of Mist
    return {
      identity: 'Votre identité mundane',
      mystery: 'Votre essence mythique'
    }
  }

  /**
   * Récupère les descriptions d'aide selon le hack
   */
  function getHelpText(hackId: string): { identity: string; mystery: string } {
    if (hackId === 'otherscape') {
      return {
        identity: 'Votre Self représente qui vous êtes dans le monde d\'Otherscape',
        mystery: 'Votre Itch est ce qui vous pousse à agir, votre motivation profonde'
      }
    }

    if (hackId === 'litm') {
      return {
        identity: 'Votre Identity définit votre rôle de héros',
        mystery: 'Votre Mystery cache les secrets de votre quête'
      }
    }

    // City of Mist
    return {
      identity: 'Votre Identity représente votre vie mundane quotidienne',
      mystery: 'Votre Mystery est l\'essence mythique qui s\'éveille en vous'
    }
  }

  return {
    loading,
    error,
    updateHeroCard,
    updateIdentity,
    updateMystery,
    getLabels,
    getPlaceholders,
    getHelpText
  }
}
