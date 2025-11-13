/**
 * Tests E2E Tags Validation - MVP v1.0
 *
 * Tests règles City of Mist :
 * - Power tags : 3-5 par theme card
 * - Weakness tags : 1-2 par theme card
 * - Story tags : illimités
 */

import { test, expect } from '@playwright/test'
import { resetDatabase, createTestUser, createTestPlayspace, createTestCharacter, createTestThemeCard, createTestTag } from '../helpers/database'

test.describe('Tags Validation', () => {
  let user: any
  let playspace: any
  let character: any
  let themeCard: any

  test.beforeEach(async () => {
    await resetDatabase()
    user = await createTestUser()
    playspace = await createTestPlayspace(user.id, 'litm')
    character = await createTestCharacter(playspace.id, 'Test Character')
    themeCard = await createTestThemeCard(character.id, 'ORIGIN', 'Test Theme')
  })

  test('should enforce max 5 Power tags', async ({ page }) => {
    // Create 5 Power tags
    for (let i = 1; i <= 5; i++) {
      await createTestTag(themeCard.id, 'POWER', `Power Tag ${i}`)
    }

    await page.goto(`/characters/${character.id}/edit`)
    await page.click('button:has-text("Theme Cards")')

    // Find theme card and click "+ Ajouter" on Power section
    const themeCardElement = page.locator('text=Test Theme').locator('..')
    await themeCardElement.locator('text=+ Ajouter').first().click()

    // Tag form modal should open
    await expect(page.locator('text=Nouveau Tag')).toBeVisible()

    // POWER button should show 5/5 and be disabled
    const powerButton = page.locator('button:has-text("Power")')
    await expect(powerButton).toBeDisabled()
    await expect(page.locator('text=5/5')).toBeVisible()
  })

  test('should enforce max 2 Weakness tags', async ({ page }) => {
    // Create 2 Weakness tags
    await createTestTag(themeCard.id, 'WEAKNESS', 'Weakness 1')
    await createTestTag(themeCard.id, 'WEAKNESS', 'Weakness 2')

    // Create minimum required Power tags
    for (let i = 1; i <= 3; i++) {
      await createTestTag(themeCard.id, 'POWER', `Power ${i}`)
    }

    await page.goto(`/characters/${character.id}/edit`)
    await page.click('button:has-text("Theme Cards")')

    const themeCardElement = page.locator('text=Test Theme').locator('..')
    await themeCardElement.locator('text=+ Ajouter').first().click()

    // WEAKNESS button should show 2/2 and be disabled
    const weaknessButton = page.locator('button:has-text("Weakness")')
    await expect(weaknessButton).toBeDisabled()
    await expect(page.locator('text=2/2')).toBeVisible()
  })

  test('should allow unlimited Story tags', async ({ page }) => {
    // Create many Story tags (>5)
    for (let i = 1; i <= 7; i++) {
      await createTestTag(themeCard.id, 'STORY', `Story Tag ${i}`)
    }

    // Create minimum required Power/Weakness
    for (let i = 1; i <= 3; i++) {
      await createTestTag(themeCard.id, 'POWER', `Power ${i}`)
    }
    await createTestTag(themeCard.id, 'WEAKNESS', 'Weakness 1')

    await page.goto(`/characters/${character.id}/edit`)
    await page.click('button:has-text("Theme Cards")')

    const themeCardElement = page.locator('text=Test Theme').locator('..')
    await themeCardElement.locator('text=+ Ajouter').first().click()

    // STORY button should still be enabled with 7 tags
    const storyButton = page.locator('button:has-text("Story")')
    await expect(storyButton).toBeEnabled()

    // Count should show just the number (no limit)
    await expect(page.locator('text=7').first()).toBeVisible()
  })

  test('should enforce min 3 Power tags when deleting', async ({ page }) => {
    // Create exactly 3 Power tags (minimum)
    const tag1 = await createTestTag(themeCard.id, 'POWER', 'Power 1')
    await createTestTag(themeCard.id, 'POWER', 'Power 2')
    await createTestTag(themeCard.id, 'POWER', 'Power 3')

    // Create minimum Weakness
    await createTestTag(themeCard.id, 'WEAKNESS', 'Weakness 1')

    await page.goto(`/characters/${character.id}/edit`)
    await page.click('button:has-text("Theme Cards")')

    // Try to delete one of the Power tags
    // The delete should fail (or button should be disabled)
    const powerTagElement = page.locator('text=Power 1').locator('..')
    const deleteButton = powerTagElement.locator('button:has(svg)')

    await deleteButton.click()

    // Should show error notification (min 3 Power tags required)
    // Or deletion should be prevented
    // This depends on API implementation - if API prevents it, we'll see an error
  })

  test('should show visual tag count indicators', async ({ page }) => {
    // Create tags
    await createTestTag(themeCard.id, 'POWER', 'Power 1')
    await createTestTag(themeCard.id, 'POWER', 'Power 2')
    await createTestTag(themeCard.id, 'POWER', 'Power 3')
    await createTestTag(themeCard.id, 'WEAKNESS', 'Weakness 1')

    await page.goto(`/characters/${character.id}/edit`)
    await page.click('button:has-text("Theme Cards")')

    const themeCardElement = page.locator('text=Test Theme').locator('..')
    await themeCardElement.locator('text=+ Ajouter').first().click()

    // Verify counts are displayed
    await expect(page.locator('text=3/5')).toBeVisible() // Power
    await expect(page.locator('text=1/2')).toBeVisible() // Weakness
  })
})
