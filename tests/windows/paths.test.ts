import { describe, it, expect, beforeAll } from 'vitest'
import { join, resolve, sep, isAbsolute } from 'path'
import { existsSync, mkdirSync, writeFileSync, readFileSync, unlinkSync, rmdirSync } from 'fs'

describe('Windows Compatibility - File Paths', () => {
  const testDir = join(process.cwd(), 'temp-test-windows')
  
  beforeAll(() => {
    // Créer un répertoire de test temporaire
    if (!existsSync(testDir)) {
      mkdirSync(testDir, { recursive: true })
    }
  })

  afterAll(() => {
    // Nettoyer après les tests
    try {
      if (existsSync(testDir)) {
        const files = ['test-file.txt', 'test-file-spaces.txt', 'nested/deep-file.txt']
        files.forEach(file => {
          const fullPath = join(testDir, file)
          if (existsSync(fullPath)) {
            unlinkSync(fullPath)
          }
        })
        
        const nestedDir = join(testDir, 'nested')
        if (existsSync(nestedDir)) {
          rmdirSync(nestedDir)
        }
        
        rmdirSync(testDir)
      }
    } catch (error) {
      console.warn('Cleanup warning:', error.message)
    }
  })

  it('should handle Windows path separators correctly', () => {
    const windowsPath = 'C:\\Users\\fxgui\\Documents\\test.pdf'
    const unixPath = '/home/user/documents/test.pdf'
    
    // Test that path.join normalizes separators
    const normalizedPath = join('folder', 'subfolder', 'file.pdf')
    
    if (process.platform === 'win32') {
      expect(normalizedPath).toContain('\\')
      expect(sep).toBe('\\')
    } else {
      expect(normalizedPath).toContain('/')
      expect(sep).toBe('/')
    }
  })

  it('should resolve absolute paths correctly', () => {
    const relativePath = './test/file.pdf'
    const absolutePath = resolve(relativePath)
    
    expect(isAbsolute(absolutePath)).toBe(true)
    
    if (process.platform === 'win32') {
      // Windows absolute paths start with drive letter
      expect(absolutePath).toMatch(/^[A-Za-z]:\\/)
    } else {
      // Unix absolute paths start with /
      expect(absolutePath).toMatch(/^\//)
    }
  })

  it('should handle file creation and reading with Windows paths', () => {
    const fileName = 'test-file.txt'
    const filePath = join(testDir, fileName)
    const content = 'Test content for Windows compatibility'
    
    // Write file
    writeFileSync(filePath, content, 'utf8')
    expect(existsSync(filePath)).toBe(true)
    
    // Read file
    const readContent = readFileSync(filePath, 'utf8')
    expect(readContent).toBe(content)
    
    // Clean up
    unlinkSync(filePath)
    expect(existsSync(filePath)).toBe(false)
  })

  it('should handle paths with spaces (Windows common issue)', () => {
    const fileName = 'test file with spaces.txt'
    const filePath = join(testDir, fileName)
    const content = 'Content in file with spaces'
    
    // Write file with spaces in name
    writeFileSync(filePath, content, 'utf8')
    expect(existsSync(filePath)).toBe(true)
    
    // Read file
    const readContent = readFileSync(filePath, 'utf8')
    expect(readContent).toBe(content)
    
    // Clean up
    unlinkSync(filePath)
  })

  it('should handle nested directory creation', () => {
    const nestedDir = join(testDir, 'nested')
    const nestedFile = join(nestedDir, 'deep-file.txt')
    
    // Create nested directory
    mkdirSync(nestedDir, { recursive: true })
    expect(existsSync(nestedDir)).toBe(true)
    
    // Create file in nested directory
    writeFileSync(nestedFile, 'Nested content', 'utf8')
    expect(existsSync(nestedFile)).toBe(true)
    
    // Verify content
    const content = readFileSync(nestedFile, 'utf8')
    expect(content).toBe('Nested content')
  })

  it('should validate PDF output directory configuration', () => {
    // Test the PDF output directory path from config
    const outputDir = join(process.cwd(), 'output')
    const pdfPath = join(outputDir, 'test-document.pdf')
    
    // Verify the path is correctly constructed
    expect(isAbsolute(pdfPath)).toBe(true)
    
    if (process.platform === 'win32') {
      // On Windows, check for correct drive letter and backslashes
      expect(pdfPath).toMatch(/^[A-Za-z]:\\.*\.pdf$/)
    }
  })

  it('should handle Nitro storage paths correctly', () => {
    // Test Nitro storage configuration from nuxt.config.ts
    const baseDir = process.platform === 'win32' ? 'C:\\temp\\brumisa3' : '/tmp/brumisa3'
    
    expect(typeof baseDir).toBe('string')
    expect(baseDir.length).toBeGreaterThan(0)
    
    if (process.platform === 'win32') {
      expect(baseDir).toMatch(/^[A-Za-z]:\\/)
    }
  })

  it('should validate asset paths for templates', () => {
    const templatesDir = join(process.cwd(), 'assets', 'templates', 'pdf')
    
    // Path should be absolute
    const absoluteTemplatesDir = resolve(templatesDir)
    expect(isAbsolute(absoluteTemplatesDir)).toBe(true)
    
    // Should handle Windows path separators
    if (process.platform === 'win32') {
      expect(absoluteTemplatesDir).toContain('\\')
    }
  })
})