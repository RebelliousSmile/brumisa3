/**
 * Tests E2E Theme Cards Validation - MVP v1.0
 *
 * Tests validation multi-hack :
 * - Types contextuels selon hackId
 * - Min 2, Max 4 theme cards
 * - Validation avant création/suppression
 */

import { test, expect } from '@playwright/test'
import { resetDatabase, createTestUser, createTestPlayspace, createTestCharacter, createTestThemeCard } from '../helpers/database'

test.describe('Theme Cards Validation', () => {
  let user: any
  let playspaceLITM: any
  let playspaceOtherscape: any
  let playspaceCoM: any
  let character: any

  test.beforeEach(async () => {
    await resetDatabase()
    user = await createTestUser()

    // Create playspaces for each hack
    playspaceLITM = await createTestPlayspace(user.id, 'litm')
    playspaceOtherscape = await createTestPlayspace(user.id, 'otherscape')
    playspaceCoM = await createTestPlayspace(user.id, 'city-of-mist')
  })

  test('should validate LITM theme types', async ({ page }) => {
    character = await createTestCharacter(playspaceLITM.id, 'LITM Character')

    await page.goto(`/characters/${character.id}/edit`)

    // Navigate to theme cards section
    await page.click('button:has-text("Theme Cards")')

    // Click add theme card
    await page.click('button:has-text("Ajouter Theme Card")')

    // Modal should show LITM types
    const select = page.locator('select#type')
    const options = await select.locator('option').allTextContents()

    // LITM types should be present
    expect(options.join('')).toContain('Origin')
    expect(options.join('')).toContain('Adventure')
    expect(options.join('')).toContain('Greatness')
    expect(options.join('')).toContain('Fellowship')
    expect(options.join('')).toContain('Backpack')

    // City of Mist types should NOT be present
    expect(options.join('')).not.toContain('Mythos')
    expect(options.join('')).not.toContain('Logos')
  })

  test('should validate Otherscape theme types', async ({ page }) => {
    character = await createTestCharacter(playspaceOtherscape.id, 'Otherscape Character')

    await page.goto(`/characters/${character.id}/edit`)
    await page.click('button:has-text("Theme Cards")')
    await page.click('button:has-text("Ajouter Theme Card")')

    const select = page.locator('select#type')
    const options = await select.locator('option').allTextContents()

    // Otherscape types
    expect(options.join('')).toContain('Noise')
    expect(options.join('')).toContain('Self')
    expect(options.join('')).toContain('Mythos-OS')
    expect(options.join('')).toContain('Crew-OS')
    expect(options.join('')).toContain('Loadout')

    // LITM types should NOT be present
    expect(options.join('')).not.toContain('Origin')
    expect(options.join('')).not.toContain('Adventure')
  })

  test('should enforce max 4 theme cards', async ({ page }) => {
    character = await createTestCharacter(playspaceLITM.id, 'Test Character')

    // Create 4 theme cards via Prisma
    for (let i = 1; i <= 4; i++) {
      await createTestThemeCard(character.id, 'ORIGIN', `Theme ${i}`)
    }

    await page.goto(`/characters/${character.id}/edit`)
    await page.click('button:has-text("Theme Cards")')

    // Verify count shows 4/4
    await expect(page.locator('text=4/4')).toBeVisible()

    // Add button should be disabled
    const addButton = page.locator('button:has-text("Ajouter Theme Card")')
    await expect(addButton).toBeDisabled()
  })

  test('should enforce min 2 theme cards when deleting', async ({ page }) => {
    character = await createTestCharacter(playspaceLITM.id, 'Test Character')

    // Create only 2 theme cards
    const theme1 = await createTestThemeCard(character.id, 'ORIGIN', 'Theme 1')
    const theme2 = await createTestThemeCard(character.id, 'ADVENTURE', 'Theme 2')

    await page.goto(`/characters/${character.id}/edit`)
    await page.click('button:has-text("Theme Cards")')

    // Verify 2 theme cards are shown
    await expect(page.locator('text=Theme 1')).toBeVisible()
    await expect(page.locator('text=Theme 2')).toBeVisible()

    // Find delete button on first theme card (should be disabled)
    const deleteButtons = page.locator('button:has(svg[class*="trash"])')
    const firstDeleteButton = deleteButtons.first()

    // With only 2 theme cards, delete should be disabled
    await expect(firstDeleteButton).toBeDisabled()
  })
})
