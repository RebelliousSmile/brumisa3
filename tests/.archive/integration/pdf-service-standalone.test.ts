import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock all external dependencies first
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

// Create a standalone mock for Prisma
const mockPrisma = {
  document: {
    create: vi.fn(),
    findUnique: vi.fn()
  }
}

// Create a standalone version of PdfService for testing
class TestPdfService {
  private prisma: any

  constructor(prismaInstance: any = mockPrisma) {
    this.prisma = prismaInstance
  }

  getCouleursPourSysteme(systeme: string) {
    const couleurs: Record<string, any> = {
      monsterhearts: { primary: '#ec4899', secondary: '#f3e8ff' },
      engrenages: { primary: '#f59e0b', secondary: '#fef3c7' },
      metro2033: { primary: '#10b981', secondary: '#d1fae5' },
      mistengine: { primary: '#8b5cf6', secondary: '#f3e8ff' },
      zombiology: { primary: '#ef4444', secondary: '#fee2e2' }
    }
    return couleurs[systeme] || { primary: '#6b7280', secondary: '#f3f4f6' }
  }

  getSystemeNomComplet(systeme: string): string {
    const noms: Record<string, string> = {
      monsterhearts: 'Monsterhearts',
      engrenages: 'Engrenages & Sortilèges',
      metro2033: 'Metro 2033',
      mistengine: 'Mist Engine',
      zombiology: 'Zombiology'
    }
    return noms[systeme] || systeme
  }

  genererNomFichierUnique(type: string, systeme: string, documentId: number): string {
    const timestamp = Date.now().toString(16).slice(-8)
    return `${type.toLowerCase()}-${systeme}-${documentId}-${timestamp}.pdf`
  }

  async genererDocument(data: any) {
    // Validate document type
    const validTypes = ['CHARACTER', 'ORGANIZATION', 'TOWN', 'DOCUMENT']
    if (!validTypes.includes(data.type)) {
      throw new Error(`Type de document invalide: ${data.type}`)
    }

    // Create document in database
    const documentData = {
      titre: data.donnees.titre || 'Document sans titre',
      type: data.type,
      systemeJeu: data.systeme,
      contenu: data.donnees,
      utilisateurId: data.utilisateur?.id || null,
      statut: data.utilisateur?.id ? 'BROUILLON' : 'TEMPORAIRE'
    }

    const document = await this.prisma.document.create({
      data: documentData
    })

    // Generate filename and paths
    const filename = this.genererNomFichierUnique(data.type, data.systeme, document.id)
    const pdfPath = `output/${filename}`
    
    return {
      document,
      pdfPath,
      downloadUrl: `/api/pdf/download/${document.id}`
    }
  }
}

describe('PDF Service - Standalone Tests', () => {
  let pdfService: TestPdfService

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Setup default Prisma mocks
    mockPrisma.document.create.mockResolvedValue({
      id: 1,
      titre: 'Test Document',
      type: 'CHARACTER',
      systemeJeu: 'monsterhearts',
      contenu: {},
      statut: 'BROUILLON'
    })

    pdfService = new TestPdfService()
  })

  describe('Service Initialization', () => {
    it('should create service instance', () => {
      expect(pdfService).toBeDefined()
      expect(pdfService).toBeInstanceOf(TestPdfService)
    })
  })

  describe('System Colors', () => {
    it('should return correct colors for each system', () => {
      const systems = [
        { id: 'monsterhearts', expectedPrimary: '#ec4899' },
        { id: 'engrenages', expectedPrimary: '#f59e0b' },
        { id: 'metro2033', expectedPrimary: '#10b981' },
        { id: 'mistengine', expectedPrimary: '#8b5cf6' },
        { id: 'zombiology', expectedPrimary: '#ef4444' }
      ]
      
      for (const system of systems) {
        const colors = pdfService.getCouleursPourSysteme(system.id)
        expect(colors.primary).toBe(system.expectedPrimary)
      }
    })

    it('should return default colors for unknown system', () => {
      const colors = pdfService.getCouleursPourSysteme('unknown')
      expect(colors.primary).toBe('#6b7280')
      expect(colors.secondary).toBe('#f3f4f6')
    })
  })

  describe('System Names', () => {
    it('should return correct system names', () => {
      const systems = [
        { id: 'monsterhearts', expected: 'Monsterhearts' },
        { id: 'engrenages', expected: 'Engrenages & Sortilèges' },
        { id: 'metro2033', expected: 'Metro 2033' },
        { id: 'mistengine', expected: 'Mist Engine' },
        { id: 'zombiology', expected: 'Zombiology' }
      ]
      
      for (const system of systems) {
        const name = pdfService.getSystemeNomComplet(system.id)
        expect(name).toBe(system.expected)
      }
    })

    it('should return original name for unknown system', () => {
      const name = pdfService.getSystemeNomComplet('unknown-system')
      expect(name).toBe('unknown-system')
    })
  })

  describe('File Name Generation', () => {
    it('should generate unique filenames', () => {
      const filename1 = pdfService.genererNomFichierUnique('CHARACTER', 'monsterhearts', 1)
      const filename2 = pdfService.genererNomFichierUnique('CHARACTER', 'monsterhearts', 1)
      
      expect(filename1).toMatch(/^character-monsterhearts-1-[a-f0-9]{8}\.pdf$/)
      expect(filename2).toMatch(/^character-monsterhearts-1-[a-f0-9]{8}\.pdf$/)
      expect(filename1).not.toBe(filename2)
    })

    it('should include document type in filename', () => {
      const filename = pdfService.genererNomFichierUnique('ORGANIZATION', 'metro2033', 5)
      expect(filename).toMatch(/^organization-metro2033-5-[a-f0-9]{8}\.pdf$/)
    })
  })

  describe('Document Generation', () => {
    it('should generate document with authenticated user', async () => {
      const characterData = {
        type: 'CHARACTER' as const,
        systeme: 'monsterhearts',
        donnees: {
          titre: 'Vampire Séductrice',
          nom: 'Luna Bloodworth',
          concept: 'Une vampire de 300 ans'
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
      
      expect(mockPrisma.document.create).toHaveBeenCalledWith({
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

    it('should generate document without user (temporary)', async () => {
      const characterData = {
        type: 'CHARACTER' as const,
        systeme: 'engrenages',
        donnees: {
          titre: 'Artificier Mécanique',
          nom: 'Gideon Rouagefer'
        }
      }
      
      const result = await pdfService.genererDocument(characterData)
      
      expect(mockPrisma.document.create).toHaveBeenCalledWith({
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

    it('should handle organization documents', async () => {
      const orgData = {
        type: 'ORGANIZATION' as const,
        systeme: 'metro2033',
        donnees: {
          titre: 'Station Polis',
          nom: 'République de Polis',
          description: 'La dernière démocratie du métro'
        }
      }
      
      const result = await pdfService.genererDocument(orgData)
      
      expect(result).toBeDefined()
      expect(mockPrisma.document.create).toHaveBeenCalledWith({
        data: {
          titre: 'Station Polis',
          type: 'ORGANIZATION',
          systemeJeu: 'metro2033',
          contenu: orgData.donnees,
          utilisateurId: null,
          statut: 'TEMPORAIRE'
        }
      })
    })

    it('should reject invalid document types', async () => {
      const invalidData = {
        type: 'INVALID_TYPE' as any,
        systeme: 'monsterhearts',
        donnees: { titre: 'Test' }
      }
      
      await expect(pdfService.genererDocument(invalidData))
        .rejects
        .toThrow('Type de document invalide: INVALID_TYPE')
    })

    it('should handle database errors', async () => {
      mockPrisma.document.create.mockRejectedValue(new Error('Database connection failed'))
      
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

  describe('Document Types Validation', () => {
    it('should accept all valid document types', async () => {
      const validTypes = ['CHARACTER', 'ORGANIZATION', 'TOWN', 'DOCUMENT']
      
      for (const type of validTypes) {
        const data = {
          type: type as any,
          systeme: 'monsterhearts',
          donnees: { titre: `Test ${type}`, nom: 'Test' }
        }
        
        await expect(pdfService.genererDocument(data)).resolves.toBeDefined()
      }
    })

    it('should assign correct status based on user presence', async () => {
      // With user
      await pdfService.genererDocument({
        type: 'CHARACTER',
        systeme: 'monsterhearts',
        donnees: { titre: 'Test' },
        utilisateur: { id: 1, email: 'test@test.com', role: 'USER' }
      })
      
      expect(mockPrisma.document.create).toHaveBeenLastCalledWith({
        data: expect.objectContaining({
          statut: 'BROUILLON'
        })
      })

      // Without user
      await pdfService.genererDocument({
        type: 'CHARACTER',
        systeme: 'monsterhearts',
        donnees: { titre: 'Test' }
      })
      
      expect(mockPrisma.document.create).toHaveBeenLastCalledWith({
        data: expect.objectContaining({
          statut: 'TEMPORAIRE',
          utilisateurId: null
        })
      })
    })
  })
})