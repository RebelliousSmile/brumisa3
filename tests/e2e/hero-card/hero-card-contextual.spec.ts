/**
 * Tests E2E Hero Card - Contextual Labels - MVP v1.0
 *
 * Tests :
 * - Labels Identity/Mystery pour CoM et LITM
 * - Labels Self/Itch pour Otherscape
 * - Update hero card avec validation
 */

import { test, expect } from '@playwright/test'
import { resetDatabase, createTestUser, createTestPlayspace, createTestCharacter } from '../helpers/database'

test.describe('Hero Card Contextual Labels', () => {
  let user: any

  test.beforeEach(async () => {
    await resetDatabase()
    user = await createTestUser()
  })

  test('should show Identity/Mystery labels for LITM', async ({ page }) => {
    const playspace = await createTestPlayspace(user.id, 'litm')
    const character = await createTestCharacter(playspace.id, 'LITM Hero')

    await page.goto(`/characters/${character.id}/edit`)

    // Navigate to Hero Card section
    await page.click('button:has-text("Hero Card")')

    // Verify labels are "Identity" and "Mystery" (not Self/Itch)
    await expect(page.locator('label:has-text("Identity")')).toBeVisible()
    await expect(page.locator('label:has-text("Mystery")')).toBeVisible()

    // Should NOT show Otherscape labels
    await expect(page.locator('label:has-text("Self")')).not.toBeVisible()
    await expect(page.locator('label:has-text("Itch")')).not.toBeVisible()

    // Fill hero card
    await page.fill('textarea#identity', 'A legendary warrior from ancient times')
    await page.fill('textarea#mystery', 'Blessed by the gods with immortality')

    // Submit (HeroCardForm has inline submit)
    await page.click('button:has-text("Mettre à jour")')

    // Should show success notification
    await expect(page.locator('text=Hero Card mise à jour')).toBeVisible()
  })

  test('should show Identity/Mystery labels for City of Mist', async ({ page }) => {
    const playspace = await createTestPlayspace(user.id, 'city-of-mist')
    const character = await createTestCharacter(playspace.id, 'CoM Rift')

    await page.goto(`/characters/${character.id}/edit`)
    await page.click('button:has-text("Hero Card")')

    // Same labels as LITM (Identity/Mystery)
    await expect(page.locator('label:has-text("Identity")')).toBeVisible()
    await expect(page.locator('label:has-text("Mystery")')).toBeVisible()

    // Fill with City of Mist context
    await page.fill('textarea#identity', 'A mundane detective in the city')
    await page.fill('textarea#mystery', 'Touched by the Phoenix mythos')

    await page.click('button:has-text("Mettre à jour")')
    await expect(page.locator('text=Hero Card mise à jour')).toBeVisible()
  })

  test('should show Self/Itch labels for Otherscape', async ({ page }) => {
    const playspace = await createTestPlayspace(user.id, 'otherscape')
    const character = await createTestCharacter(playspace.id, 'Otherscape Hacker')

    await page.goto(`/characters/${character.id}/edit`)
    await page.click('button:has-text("Hero Card")')

    // Verify labels are "Self" and "Itch" (Otherscape specific)
    await expect(page.locator('label:has-text("Self")')).toBeVisible()
    await expect(page.locator('label:has-text("Itch")')).toBeVisible()

    // Should NOT show standard labels
    await expect(page.locator('label:has-text("Identity")')).not.toBeVisible()
    await expect(page.locator('label:has-text("Mystery")')).not.toBeVisible()

    // Fill with Otherscape context
    await page.fill('textarea#identity', 'A cyberpunk hacker in Neo-Tokyo') // Field ID is still "identity" but label is "Self"
    await page.fill('textarea#mystery', 'Driven by the need to expose corporate corruption') // Field ID is "mystery" but label is "Itch"

    await page.click('button:has-text("Mettre à jour")')
    await expect(page.locator('text=Hero Card mise à jour')).toBeVisible()
  })

  test('should validate required fields', async ({ page }) => {
    const playspace = await createTestPlayspace(user.id, 'litm')
    const character = await createTestCharacter(playspace.id, 'Test')

    await page.goto(`/characters/${character.id}/edit`)
    await page.click('button:has-text("Hero Card")')

    // Clear existing values
    await page.fill('textarea#identity', '')
    await page.fill('textarea#mystery', '')

    // Try to submit (button should be disabled)
    const submitButton = page.locator('button:has-text("Mettre à jour")')
    await expect(submitButton).toBeDisabled()

    // Fill only identity
    await page.fill('textarea#identity', 'A')

    // Still disabled (< 2 characters)
    await expect(submitButton).toBeDisabled()

    // Fill with valid length
    await page.fill('textarea#identity', 'Valid identity')
    await page.fill('textarea#mystery', 'Valid mystery')

    // Now should be enabled
    await expect(submitButton).toBeEnabled()
  })
})
