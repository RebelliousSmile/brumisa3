/**
 * Tests E2E Character Wizard - MVP v1.0
 *
 * Tests critiques du workflow de création character (< 60s)
 * - Wizard 4 étapes
 * - Validation min 2 theme cards
 * - Création complète avec performance monitoring
 */

import { test, expect } from '@playwright/test'
import { resetDatabase, createTestUser, createTestPlayspace } from '../helpers/database'
import { login } from '../helpers/auth'

test.describe('Character Creation Wizard', () => {
  let user: any
  let playspace: any

  test.beforeEach(async ({ page }) => {
    await resetDatabase()
    user = await createTestUser()
    playspace = await createTestPlayspace(user.id, 'litm')

    // Login (assume auth is implemented or use guest mode)
    // Pour MVP: skip auth, aller directement à la page
  })

  test('should complete character creation wizard in < 60s', async ({ page }) => {
    const startTime = Date.now()

    // Navigate to new character page
    await page.goto(`/characters/new`)

    // Step 1: Basic Info
    await page.fill('input#name', 'Aria the Mist Weaver')
    await page.fill('textarea#description', 'A mysterious hero who can manipulate shadows')

    // Click Next
    await page.click('button:has-text("Suivant")')

    // Step 2: Theme Cards (add min 2)
    // Add first theme card
    await page.click('button:has-text("Ajouter")')

    // Modal should open
    await expect(page.locator('text=Nouvelle Theme Card')).toBeVisible()

    // Fill theme card form
    await page.fill('input#name', 'Shadow Dancer')
    await page.selectOption('select#type', 'ORIGIN')
    await page.fill('textarea#description', 'Can manipulate shadows')

    // Submit theme card
    await page.click('button:has-text("Créer")')

    // Modal should close, theme card should appear in preview
    await expect(page.locator('text=Shadow Dancer')).toBeVisible()

    // Add second theme card
    await page.click('button:has-text("Ajouter")')
    await page.fill('input#name', 'Night Vision')
    await page.selectOption('select#type', 'ADVENTURE')
    await page.click('button:has-text("Créer")')

    await expect(page.locator('text=Night Vision')).toBeVisible()

    // Now we have 2 theme cards, can proceed
    await page.click('button:has-text("Suivant")')

    // Step 3: Hero Card
    await page.fill('textarea#identity', 'A former detective haunted by her past')
    await page.fill('textarea#mystery', 'Touched by the Shadow Realm')

    await page.click('button:has-text("Suivant")')

    // Step 4: Recap
    // Verify recap shows all data
    await expect(page.locator('text=Aria the Mist Weaver')).toBeVisible()
    await expect(page.locator('text=Shadow Dancer')).toBeVisible()
    await expect(page.locator('text=Night Vision')).toBeVisible()

    // Create character
    await page.click('button:has-text("Créer le personnage")')

    // Should redirect to character detail page
    await page.waitForURL(/\/characters\/[a-z0-9]+$/, { timeout: 60000 })

    const duration = Date.now() - startTime

    // Performance assertion
    expect(duration).toBeLessThan(60000)

    // Verify character was created
    await expect(page.locator('text=Aria the Mist Weaver')).toBeVisible()

    console.log(`Character creation completed in ${duration}ms`)
  })

  test('should enforce min 2 theme cards validation', async ({ page }) => {
    await page.goto(`/characters/new`)

    // Step 1: Fill basic info
    await page.fill('input#name', 'Test Character')
    await page.click('button:has-text("Suivant")')

    // Step 2: Try to proceed without theme cards
    const nextButton = page.locator('button:has-text("Suivant")')

    // Button should be disabled with 0 theme cards
    await expect(nextButton).toBeDisabled()

    // Add only 1 theme card
    await page.click('button:has-text("Ajouter")')
    await page.fill('input#name', 'Single Theme')
    await page.selectOption('select#type', 'ORIGIN')
    await page.click('button:has-text("Créer")')

    // Button should still be disabled with 1 theme card
    await expect(nextButton).toBeDisabled()

    // Add second theme card
    await page.click('button:has-text("Ajouter")')
    await page.fill('input#name', 'Second Theme')
    await page.selectOption('select#type', 'ADVENTURE')
    await page.click('button:has-text("Créer")')

    // Now button should be enabled
    await expect(nextButton).toBeEnabled()
  })

  test('should validate max 4 theme cards', async ({ page }) => {
    await page.goto(`/characters/new`)

    // Navigate to step 2
    await page.fill('input#name', 'Test Character')
    await page.click('button:has-text("Suivant")')

    // Add 4 theme cards
    for (let i = 1; i <= 4; i++) {
      await page.click('button:has-text("Ajouter")')
      await page.fill('input#name', `Theme ${i}`)
      await page.selectOption('select#type', i === 1 ? 'ORIGIN' : i === 2 ? 'ADVENTURE' : i === 3 ? 'GREATNESS' : 'FELLOWSHIP')
      await page.click('button:has-text("Créer")')
      await expect(page.locator(`text=Theme ${i}`)).toBeVisible()
    }

    // Add button should now be disabled
    const addButton = page.locator('button:has-text("Ajouter")').first()
    await expect(addButton).toBeDisabled()
  })

  test('should show contextual theme types for LITM', async ({ page }) => {
    await page.goto(`/characters/new`)

    // Navigate to step 2
    await page.fill('input#name', 'LITM Character')
    await page.click('button:has-text("Suivant")')

    // Open theme card form
    await page.click('button:has-text("Ajouter")')

    // Check that select has LITM types
    const select = page.locator('select#type')
    const options = await select.locator('option').allTextContents()

    // Should have LITM types
    expect(options).toContain('Origin')
    expect(options).toContain('Adventure')
    expect(options).toContain('Greatness')
    expect(options).toContain('Fellowship')
    expect(options).toContain('Backpack')

    // Should NOT have City of Mist types
    expect(options).not.toContain('Mythos')
    expect(options).not.toContain('Logos')
  })

  test('should show contextual hero card labels for LITM', async ({ page }) => {
    await page.goto(`/characters/new`)

    // Navigate through to step 3
    await page.fill('input#name', 'Test')
    await page.click('button:has-text("Suivant")')

    // Add 2 theme cards quickly
    for (let i = 1; i <= 2; i++) {
      await page.click('button:has-text("Ajouter")')
      await page.fill('input#name', `Theme ${i}`)
      await page.selectOption('select#type', 'ORIGIN')
      await page.click('button:has-text("Créer")')
    }

    await page.click('button:has-text("Suivant")')

    // Step 3: Verify labels are "Identity" and "Mystery" (not Self/Itch)
    await expect(page.locator('label:has-text("Identity")')).toBeVisible()
    await expect(page.locator('label:has-text("Mystery")')).toBeVisible()
  })
})
