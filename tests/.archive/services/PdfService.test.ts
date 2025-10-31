import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PdfService } from '~/server/services/PdfService'
import { join } from 'path'

// Mock external dependencies
vi.mock('pdfkit', () => {
  const mockPipe = vi.fn().mockReturnValue({
    on: vi.fn((event, callback) => {
      if (event === 'finish') {
        setTimeout(() => callback(), 10)
      }
      return mockPipe
    })
  })

  return {
    default: vi.fn().mockImplementation(() => ({
      fillColor: vi.fn().mockReturnThis(),
      fontSize: vi.fn().mockReturnThis(),
      font: vi.fn().mockReturnThis(),
      text: vi.fn().mockReturnThis(),
      moveTo: vi.fn().mockReturnThis(),
      lineTo: vi.fn().mockReturnThis(),
      strokeColor: vi.fn().mockReturnThis(),
      lineWidth: vi.fn().mockReturnThis(),
      stroke: vi.fn().mockReturnThis(),
      pipe: mockPipe,
      end: vi.fn()
    }))
  }
})

vi.mock('fs', () => ({
  createWriteStream: vi.fn().mockReturnValue({
    on: vi.fn()
  })
}))

vi.mock('fs/promises', () => ({
  access: vi.fn().mockResolvedValue(undefined),
  mkdir: vi.fn().mockResolvedValue(undefined),
  readdir: vi.fn().mockResolvedValue([])
}))

vi.mock('~/server/utils/prisma', () => ({
  prisma: {
    document: {
      create: vi.fn().mockResolvedValue({
        id: 1,
        titre: 'Test Document',
        type: 'CHARACTER',
        systemeJeu: 'monsterhearts'
      }),
      findUnique: vi.fn().mockResolvedValue({
        id: 1,
        systemeJeu: 'monsterhearts'
      })
    }
  }
}))

describe('PdfService', () => {
  let pdfService: PdfService

  beforeEach(() => {
    vi.clearAllMocks()
    pdfService = new PdfService()
  })

  describe('genererDocument', () => {
    it('should generate a PDF document successfully', async () => {
      const options = {
        type: 'CHARACTER' as const,
        systeme: 'monsterhearts',
        donnees: {
          titre: 'Test Character',
          nom: 'Vampire Girl',
          concept: 'A mysterious vampire'
        },
        utilisateur: {
          id: 1,
          email: 'test@example.com',
          role: 'UTILISATEUR'
        }
      }

      const result = await pdfService.genererDocument(options)

      expect(result).toHaveProperty('document')
      expect(result).toHaveProperty('pdfPath')
      expect(result).toHaveProperty('downloadUrl')
      expect(result.downloadUrl).toBe('/api/pdf/download/1')
    })

    it('should throw error for invalid document type', async () => {
      const options = {
        type: 'INVALID_TYPE' as any,
        systeme: 'monsterhearts',
        donnees: { titre: 'Test' }
      }

      await expect(pdfService.genererDocument(options))
        .rejects
        .toThrow('Type de document invalide: INVALID_TYPE')
    })

    it('should handle anonymous user (no utilisateur)', async () => {
      const options = {
        type: 'CHARACTER' as const,
        systeme: 'monsterhearts',
        donnees: { titre: 'Anonymous Character' }
      }

      const result = await pdfService.genererDocument(options)
      expect(result).toHaveProperty('document')
    })
  })

  describe('getCouleursPourSysteme', () => {
    it('should return correct colors for monsterhearts', () => {
      const pdfService = new PdfService()
      const colors = (pdfService as any).getCouleursPourSysteme('monsterhearts')
      
      expect(colors.primary).toBe('#ec4899')
      expect(colors.secondary).toBe('#be185d')
    })

    it('should return default colors for unknown system', () => {
      const pdfService = new PdfService()
      const colors = (pdfService as any).getCouleursPourSysteme('unknown')
      
      expect(colors.primary).toBe('#6b7280')
      expect(colors.secondary).toBe('#4b5563')
    })
  })

  describe('getSystemeNomComplet', () => {
    it('should return full name for known systems', () => {
      const pdfService = new PdfService()
      
      expect((pdfService as any).getSystemeNomComplet('monsterhearts')).toBe('Monsterhearts')
      expect((pdfService as any).getSystemeNomComplet('engrenages')).toBe('Engrenages & Sortilèges')
      expect((pdfService as any).getSystemeNomComplet('metro2033')).toBe('Metro 2033')
    })

    it('should return system id for unknown system', () => {
      const pdfService = new PdfService()
      
      expect((pdfService as any).getSystemeNomComplet('unknown')).toBe('unknown')
    })
  })

  describe('genererNomFichierUnique', () => {
    it('should generate unique filename with correct format', () => {
      const pdfService = new PdfService()
      const filename = (pdfService as any).genererNomFichierUnique('CHARACTER', 'monsterhearts', 123)
      
      expect(filename).toMatch(/^character-monsterhearts-123-[a-f0-9]{8}\.pdf$/)
    })

    it('should generate different filenames for same parameters', () => {
      const pdfService = new PdfService()
      
      const filename1 = (pdfService as any).genererNomFichierUnique('CHARACTER', 'monsterhearts', 123)
      // Attendre un peu pour avoir un timestamp différent
      const filename2 = (pdfService as any).genererNomFichierUnique('CHARACTER', 'monsterhearts', 123)
      
      expect(filename1).not.toBe(filename2)
    })
  })
})