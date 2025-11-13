import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock dependencies pour les tests d'intégration
vi.mock('pdfkit', () => {
  const mockDoc = {
    fillColor: vi.fn().mockReturnThis(),
    fontSize: vi.fn().mockReturnThis(),
    font: vi.fn().mockReturnThis(),
    text: vi.fn().mockReturnThis(),
    moveTo: vi.fn().mockReturnThis(),
    lineTo: vi.fn().mockReturnThis(),
    strokeColor: vi.fn().mockReturnThis(),
    lineWidth: vi.fn().mockReturnThis(),
    stroke: vi.fn().mockReturnThis(),
    pipe: vi.fn().mockReturnValue({
      on: vi.fn((event, callback) => {
        if (event === 'finish') {
          setTimeout(callback, 10)
        }
        return mockDoc.pipe()
      })
    }),
    end: vi.fn()
  }
  return { default: vi.fn(() => mockDoc) }
})

vi.mock('fs', () => ({
  createWriteStream: vi.fn().mockReturnValue({
    on: vi.fn()
  })
}))

vi.mock('fs/promises', () => ({
  access: vi.fn().mockResolvedValue(undefined),
  mkdir: vi.fn().mockResolvedValue(undefined)
}))

// Mock Prisma
const mockCreate = vi.fn()
const mockFindUnique = vi.fn()

vi.mock('~/server/utils/prisma', () => ({
  prisma: {
    document: {
      create: mockCreate,
      findUnique: mockFindUnique
    }
  }
}))

describe('PDF Generation Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Setup default mocks
    mockCreate.mockResolvedValue({
      id: 1,
      titre: 'Test Document',
      type: 'CHARACTER',
      systemeJeu: 'monsterhearts',
      contenu: {},
      statut: 'BROUILLON'
    })
  })

  describe('Character PDF Generation', () => {
    it('should generate PDF for Monsterhearts character', async () => {
      const { PdfService } = await import('~/server/services/PdfService')
      const pdfService = new PdfService()
      
      const characterData = {
        type: 'CHARACTER' as const,
        systeme: 'monsterhearts',
        donnees: {
          titre: 'Vampire Séductrice',
          nom: 'Luna Bloodworth',
          concept: 'Une vampire de 300 ans qui se fait passer pour une lycéenne',
          caracteristiques: {
            Hot: 3,
            Cold: 0,
            Volatile: -1,
            Dark: 2
          },
          relations: [
            'Marcus le Loup-Garou (rival)',
            'Sarah la Mortelle (proie)'
          ]
        },
        utilisateur: {
          id: 1,
          email: 'test@example.com',
          role: 'UTILISATEUR'
        }
      }
      
      const result = await pdfService.genererDocument(characterData)
      
      expect(result).toBeDefined()
      expect(result.document).toBeDefined()
      expect(result.pdfPath).toBeDefined()
      expect(result.downloadUrl).toBe('/api/pdf/download/1')
      
      // Vérifier que Prisma a été appelé avec les bonnes données
      expect(mockCreate).toHaveBeenCalledWith({
        data: {
          titre: 'Vampire Séductrice',
          type: 'CHARACTER',
          systemeJeu: 'monsterhearts',
          contenu: characterData.donnees,
          utilisateurId: 1,
          statut: 'BROUILLON'
        }
      })
    })

    it('should generate PDF for Engrenages & Sortilèges character', async () => {
      const { PdfService } = await import('~/server/services/PdfService')
      const pdfService = new PdfService()
      
      const characterData = {
        type: 'CHARACTER' as const,
        systeme: 'engrenages',
        donnees: {
          titre: 'Artificier Mécanique',
          nom: 'Gideon Rouagefer',
          concept: 'Un inventeur obsédé par les automates',
          competences: {
            Mécanique: 4,
            Sciences: 3,
            Combat: 1,
            Social: 2
          },
          inventions: [
            'Automate de combat Mark III',
            'Lunettes de vision mécanique'
          ]
        }
      }
      
      const result = await pdfService.genererDocument(characterData)
      
      expect(result).toBeDefined()
      expect(result.document.systemeJeu).toBe('engrenages')
      
      // Vérifier que les données ont été sauvegardées
      expect(mockCreate).toHaveBeenCalledWith({
        data: {
          titre: 'Artificier Mécanique',
          type: 'CHARACTER',
          systemeJeu: 'engrenages',
          contenu: characterData.donnees,
          utilisateurId: null,
          statut: 'TEMPORAIRE'
        }
      })
    })
  })

  describe('Organization PDF Generation', () => {
    it('should generate PDF for organization', async () => {
      const { PdfService } = await import('~/server/services/PdfService')
      const pdfService = new PdfService()
      
      const orgData = {
        type: 'ORGANIZATION' as const,
        systeme: 'metro2033',
        donnees: {
          titre: 'Station Polis',
          nom: 'République de Polis',
          description: 'La dernière démocratie du métro moscovite',
          membres: [
            {
              nom: 'Colonel Miller',
              role: 'Commandant des Rangers'
            },
            {
              nom: 'Khan',
              role: 'Philosophe mystique'
            }
          ],
          ressources: [
            'Bibliothèque pré-guerre',
            'Arsenal militaire',
            'Station de filtration d\'air'
          ]
        }
      }
      
      const result = await pdfService.genererDocument(orgData)
      
      expect(result).toBeDefined()
      expect(result.document.type).toBe('ORGANIZATION')
      expect(result.document.systemeJeu).toBe('metro2033')
    })
  })

  describe('Error Handling', () => {
    it('should handle invalid document type', async () => {
      const { PdfService } = await import('~/server/services/PdfService')
      const pdfService = new PdfService()
      
      const invalidData = {
        type: 'INVALID_TYPE' as any,
        systeme: 'monsterhearts',
        donnees: { titre: 'Test' }
      }
      
      await expect(pdfService.genererDocument(invalidData))
        .rejects
        .toThrow('Type de document invalide: INVALID_TYPE')
    })

    it('should handle database errors gracefully', async () => {
      mockCreate.mockRejectedValue(new Error('Database connection failed'))
      
      const { PdfService } = await import('~/server/services/PdfService')
      const pdfService = new PdfService()
      
      const characterData = {
        type: 'CHARACTER' as const,
        systeme: 'monsterhearts',
        donnees: { titre: 'Test Character', nom: 'Test' }
      }
      
      await expect(pdfService.genererDocument(characterData))
        .rejects
        .toThrow('Database connection failed')
    })
  })

  describe('System-specific Features', () => {
    it('should apply correct colors for each system', async () => {
      const { PdfService } = await import('~/server/services/PdfService')
      const pdfService = new PdfService()
      
      const systems = [
        { id: 'monsterhearts', expectedPrimary: '#ec4899' },
        { id: 'engrenages', expectedPrimary: '#f59e0b' },
        { id: 'metro2033', expectedPrimary: '#10b981' },
        { id: 'mistengine', expectedPrimary: '#8b5cf6' },
        { id: 'zombiology', expectedPrimary: '#ef4444' }
      ]
      
      for (const system of systems) {
        const colors = (pdfService as any).getCouleursPourSysteme(system.id)
        expect(colors.primary).toBe(system.expectedPrimary)
      }
    })

    it('should generate correct system names', async () => {
      const { PdfService } = await import('~/server/services/PdfService')
      const pdfService = new PdfService()
      
      const systems = [
        { id: 'monsterhearts', expected: 'Monsterhearts' },
        { id: 'engrenages', expected: 'Engrenages & Sortilèges' },
        { id: 'metro2033', expected: 'Metro 2033' },
        { id: 'mistengine', expected: 'Mist Engine' },
        { id: 'zombiology', expected: 'Zombiology' }
      ]
      
      for (const system of systems) {
        const name = (pdfService as any).getSystemeNomComplet(system.id)
        expect(name).toBe(system.expected)
      }
    })
  })

  describe('File Path Generation', () => {
    it('should generate unique filenames', async () => {
      const { PdfService } = await import('~/server/services/PdfService')
      const pdfService = new PdfService()
      
      const filename1 = (pdfService as any).genererNomFichierUnique('CHARACTER', 'monsterhearts', 1)
      const filename2 = (pdfService as any).genererNomFichierUnique('CHARACTER', 'monsterhearts', 1)
      
      expect(filename1).toMatch(/^character-monsterhearts-1-[a-f0-9]{8}\.pdf$/)
      expect(filename2).toMatch(/^character-monsterhearts-1-[a-f0-9]{8}\.pdf$/)
      expect(filename1).not.toBe(filename2) // Should be different due to timestamp
    })
  })
})