import { describe, it, expect } from 'vitest'

interface PdfGenerationRequest {
  type: 'CHARACTER' | 'TOWN' | 'GROUP' | 'ORGANIZATION' | 'DANGER' | 'GENERIQUE'
  donnees: Record<string, any>
  systeme: string
}

export function validerDonneesPdf(request: PdfGenerationRequest): string[] {
  const erreurs: string[] = []
  
  if (!request.type) {
    erreurs.push('Le type de document est requis')
  }
  
  if (!request.systeme) {
    erreurs.push('Le système de jeu est requis')
  }
  
  if (!request.donnees || Object.keys(request.donnees).length === 0) {
    erreurs.push('Les données du document sont requises')
  }
  
  // Validations spécifiques par type
  switch (request.type) {
    case 'CHARACTER':
      if (!request.donnees.nom && !request.donnees.titre) {
        erreurs.push('Le nom du personnage est requis')
      }
      break
      
    case 'ORGANIZATION':
      if (!request.donnees.nom && !request.donnees.titre) {
        erreurs.push('Le nom de l\'organisation est requis')
      }
      break
      
    case 'TOWN':
      if (!request.donnees.nom && !request.donnees.titre) {
        erreurs.push('Le nom du lieu est requis')
      }
      break
      
    default:
      if (!request.donnees.titre) {
        erreurs.push('Le titre du document est requis')
      }
  }
  
  return erreurs
}

export function estimerDureeGeneration(request: PdfGenerationRequest): number {
  let dureeEstimee = 2000 // 2 secondes de base
  
  // Ajouter du temps selon la complexité des données
  const nombreChamps = Object.keys(request.donnees).length
  dureeEstimee += nombreChamps * 100
  
  // Ajouter du temps pour certains types
  if (['ORGANIZATION', 'TOWN'].includes(request.type)) {
    dureeEstimee += 1000
  }
  
  return dureeEstimee
}

describe('PDF Validation Utils', () => {
  describe('validerDonneesPdf', () => {
    it('should validate correct PDF request', () => {
      const validRequest: PdfGenerationRequest = {
        type: 'CHARACTER',
        systeme: 'monsterhearts',
        donnees: { nom: 'Test Character', concept: 'A vampire' }
      }
      
      const errors = validerDonneesPdf(validRequest)
      expect(errors).toEqual([])
    })

    it('should return errors for missing required fields', () => {
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
      const characterRequest: PdfGenerationRequest = {
        type: 'CHARACTER',
        systeme: 'monsterhearts',
        donnees: { description: 'No name provided' }
      }
      
      const errors = validerDonneesPdf(characterRequest)
      expect(errors).toContain('Le nom du personnage est requis')
    })

    it('should validate organization-specific requirements', () => {
      const orgRequest: PdfGenerationRequest = {
        type: 'ORGANIZATION',
        systeme: 'engrenages',
        donnees: { description: 'No name provided' }
      }
      
      const errors = validerDonneesPdf(orgRequest)
      expect(errors).toContain('Le nom de l\'organisation est requis')
    })
  })

  describe('estimerDureeGeneration', () => {
    it('should return base duration for simple request', () => {
      const simpleRequest: PdfGenerationRequest = {
        type: 'CHARACTER',
        systeme: 'monsterhearts',
        donnees: { nom: 'Simple' }
      }
      
      const duration = estimerDureeGeneration(simpleRequest)
      expect(duration).toBeGreaterThanOrEqual(2000)
      expect(duration).toBeLessThan(3000)
    })

    it('should increase duration for complex documents', () => {
      const complexRequest: PdfGenerationRequest = {
        type: 'ORGANIZATION',
        systeme: 'engrenages',
        donnees: {
          nom: 'Complex Org',
          description: 'Long description',
          membres: ['Member 1', 'Member 2'],
          histoire: 'Long history',
          ressources: 'Many resources'
        }
      }
      
      const duration = estimerDureeGeneration(complexRequest)
      expect(duration).toBeGreaterThan(3000) // Base + complexity + org bonus
    })

    it('should add bonus time for organizations and towns', () => {
      const orgRequest: PdfGenerationRequest = {
        type: 'ORGANIZATION',
        systeme: 'engrenages',
        donnees: { nom: 'Org' }
      }

      const townRequest: PdfGenerationRequest = {
        type: 'TOWN',
        systeme: 'metro2033',
        donnees: { nom: 'Town' }
      }

      const charRequest: PdfGenerationRequest = {
        type: 'CHARACTER',
        systeme: 'monsterhearts',
        donnees: { nom: 'Char' }
      }
      
      const orgDuration = estimerDureeGeneration(orgRequest)
      const townDuration = estimerDureeGeneration(townRequest)
      const charDuration = estimerDureeGeneration(charRequest)
      
      expect(orgDuration).toBeGreaterThan(charDuration)
      expect(townDuration).toBeGreaterThan(charDuration)
    })
  })
})