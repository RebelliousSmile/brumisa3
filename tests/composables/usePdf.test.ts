import { describe, it, expect, vi, beforeEach } from 'vitest'
import { usePdf } from '~/composables/usePdf'
import type { PdfGenerationRequest } from '~/composables/usePdf'

// Mock $fetch
const mockFetch = vi.fn()
vi.mock('#app', () => ({
  $fetch: mockFetch
}))

describe('usePdf', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return correct initial state', () => {
    const { loading, error, progress } = usePdf()
    
    expect(loading.value).toBe(false)
    expect(error.value).toBe(null)
    expect(progress.value).toBe(0)
  })

  it('should validate PDF request data correctly', () => {
    const { validerDonneesPdf } = usePdf()
    
    const validRequest: PdfGenerationRequest = {
      type: 'CHARACTER',
      systeme: 'monsterhearts',
      donnees: { nom: 'Test Character' }
    }
    
    const errors = validerDonneesPdf(validRequest)
    expect(errors).toEqual([])
  })

  it('should return validation errors for invalid request', () => {
    const { validerDonneesPdf } = usePdf()
    
    const invalidRequest: PdfGenerationRequest = {
      type: '' as any,
      systeme: '',
      donnees: {}
    }
    
    const errors = validerDonneesPdf(invalidRequest)
    
    expect(errors).toContain('Le type de document est requis')
    expect(errors).toContain('Le système de jeu est requis')
    expect(errors).toContain('Les données du document sont requises')
  })

  it('should validate character-specific requirements', () => {
    const { validerDonneesPdf } = usePdf()
    
    const characterRequest: PdfGenerationRequest = {
      type: 'CHARACTER',
      systeme: 'monsterhearts',
      donnees: { description: 'No name provided' }
    }
    
    const errors = validerDonneesPdf(characterRequest)
    expect(errors).toContain('Le nom du personnage est requis')
  })

  it('should estimate generation duration based on data complexity', () => {
    const { estimerDureeGeneration } = usePdf()
    
    const simpleRequest: PdfGenerationRequest = {
      type: 'CHARACTER',
      systeme: 'monsterhearts',
      donnees: { nom: 'Simple' }
    }
    
    const complexRequest: PdfGenerationRequest = {
      type: 'ORGANIZATION',
      systeme: 'engrenages',
      donnees: {
        nom: 'Complex Org',
        description: 'Long description',
        membres: ['Member 1', 'Member 2'],
        histoire: 'Long history'
      }
    }
    
    const simpleDuration = estimerDureeGeneration(simpleRequest)
    const complexDuration = estimerDureeGeneration(complexRequest)
    
    expect(complexDuration).toBeGreaterThan(simpleDuration)
    expect(simpleDuration).toBeGreaterThanOrEqual(2000) // Base duration
  })

  it('should preview content correctly for character', () => {
    const { previsualiserContenu } = usePdf()
    
    const request: PdfGenerationRequest = {
      type: 'CHARACTER',
      systeme: 'monsterhearts',
      donnees: {
        nom: 'Vampire Girl',
        concept: 'A mysterious vampire',
        caracteristiques: {
          Hot: 2,
          Cold: 1,
          Volatile: -1,
          Dark: 3
        }
      }
    }
    
    const preview = previsualiserContenu(request)
    
    expect(preview.titre).toBe('Vampire Girl')
    expect(preview.type).toBe('CHARACTER')
    expect(preview.systeme).toBe('monsterhearts')
    expect(preview.sections).toHaveLength(2) // Concept + Caractéristiques
    expect(preview.sections[0].titre).toBe('Concept')
    expect(preview.sections[1].titre).toBe('Caractéristiques')
  })

  it('should preview content correctly for organization', () => {
    const { previsualiserContenu } = usePdf()
    
    const request: PdfGenerationRequest = {
      type: 'ORGANIZATION',
      systeme: 'engrenages',
      donnees: {
        nom: 'Les Engreneurs',
        description: 'Une guilde mystérieuse',
        membres: [
          { nom: 'Jean', role: 'Chef' },
          'Marie'
        ]
      }
    }
    
    const preview = previsualiserContenu(request)
    
    expect(preview.titre).toBe('Les Engreneurs')
    expect(preview.sections).toHaveLength(2) // Description + Membres
    expect(preview.sections[1].contenu).toContain('Jean')
    expect(preview.sections[1].contenu).toContain('Marie')
  })
})