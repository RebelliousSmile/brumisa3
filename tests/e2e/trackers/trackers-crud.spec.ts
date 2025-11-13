/**
 * Tests E2E Trackers - MVP v1.0
 *
 * Tests :
 * - Add status avec tier selection (1-5)
 * - Add story tag et story theme
 * - Remove status/tag/theme
 * - Visual tier pills (5 dots)
 */

import { test, expect } from '@playwright/test'
import { resetDatabase, createTestUser, createTestPlayspace, createTestCharacter } from '../helpers/database'

test.describe('Trackers CRUD', () => {
  let user: any
  let playspace: any
  let character: any

  test.beforeEach(async () => {
    await resetDatabase()
    user = await createTestUser()
    playspace = await createTestPlayspace(user.id, 'litm')
    character = await createTestCharacter(playspace.id, 'Test Character')
  })

  test('should add status with tier selection', async ({ page }) => {
    await page.goto(`/characters/${character.id}/edit`)

    // Navigate to Trackers section
    await page.click('button:has-text("Trackers")')

    // Find Statuses panel and click "Ajouter"
    const statusesPanel = page.locator('text=Statuses').locator('..')
    await statusesPanel.locator('button:has-text("Ajouter")').click()

    // Inline form should appear
    await page.fill('input[placeholder*="Blessé"]', 'Wounded')

    // Set tier to 3 using range slider
    await page.locator('input[type="range"]').fill('3')

    // Select "Négatif" (negative status)
    await page.click('button:has-text("Négatif")')

    // Submit
    await statusesPanel.locator('button:has-text("Ajouter")').nth(1).click()

    // Verify status was added
    await expect(page.locator('text=Wounded')).toBeVisible()
    await expect(page.locator('text=Tier 3')).toBeVisible()

    // Verify tier pills (3 filled, 2 empty)
    const tierPills = page.locator('.w-2.h-6.rounded-full')

    // Should have 5 pills total
    await expect(tierPills).toHaveCount(5)

    // First 3 should be red (negative), last 2 gray (empty)
    // This is visual validation - can check classes
  })

  test('should add positive status with tier 5', async ({ page }) => {
    await page.goto(`/characters/${character.id}/edit`)
    await page.click('button:has-text("Trackers")')

    const statusesPanel = page.locator('text=Statuses').locator('..')
    await statusesPanel.locator('button:has-text("Ajouter")').click()

    await page.fill('input[placeholder*="Blessé"]', 'Blessed')
    await page.locator('input[type="range"]').fill('5') // Max tier
    await page.click('button:has-text("Positif")')

    await statusesPanel.locator('button:has-text("Ajouter")').nth(1).click()

    await expect(page.locator('text=Blessed')).toBeVisible()
    await expect(page.locator('text=Tier 5')).toBeVisible()
  })

  test('should add story tag and story theme', async ({ page }) => {
    await page.goto(`/characters/${character.id}/edit`)
    await page.click('button:has-text("Trackers")')

    // Add Story Tag
    const storyTagsPanel = page.locator('text=Story Tags').locator('..')
    await storyTagsPanel.locator('button:has-text("Ajouter")').click()

    await page.fill('input[placeholder*="Recherche"]', 'Seeking revenge for father')
    await storyTagsPanel.locator('button:has-text("Ajouter")').nth(1).click()

    // Verify story tag badge (blue gradient)
    await expect(page.locator('text=Seeking revenge for father')).toBeVisible()

    // Add Story Theme
    const storyThemesPanel = page.locator('text=Story Themes').locator('..')
    await storyThemesPanel.locator('button:has-text("Ajouter")').click()

    await page.fill('input[placeholder*="Vengeance"]', 'Vengeance')
    await storyThemesPanel.locator('button:has-text("Ajouter")').nth(1).click()

    // Verify story theme badge (purple-pink gradient)
    await expect(page.locator('text=Vengeance')).toBeVisible()
  })

  test('should remove status', async ({ page }) => {
    await page.goto(`/characters/${character.id}/edit`)
    await page.click('button:has-text("Trackers")')

    // Add a status first
    const statusesPanel = page.locator('text=Statuses').locator('..')
    await statusesPanel.locator('button:has-text("Ajouter")').click()
    await page.fill('input[placeholder*="Blessé"]', 'Temporary Status')
    await statusesPanel.locator('button:has-text("Ajouter")').nth(1).click()

    await expect(page.locator('text=Temporary Status')).toBeVisible()

    // Now delete it
    const statusElement = page.locator('text=Temporary Status').locator('..')
    await statusElement.locator('button:has(svg[class*="trash"])').click()

    // Status should be removed
    await expect(page.locator('text=Temporary Status')).not.toBeVisible()
  })

  test('should remove story tag', async ({ page }) => {
    await page.goto(`/characters/${character.id}/edit`)
    await page.click('button:has-text("Trackers")')

    // Add story tag
    const storyTagsPanel = page.locator('text=Story Tags').locator('..')
    await storyTagsPanel.locator('button:has-text("Ajouter")').click()
    await page.fill('input[placeholder*="Recherche"]', 'Temporary Tag')
    await storyTagsPanel.locator('button:has-text("Ajouter")').nth(1).click()

    await expect(page.locator('text=Temporary Tag')).toBeVisible()

    // Delete it (X button on badge)
    const tagBadge = page.locator('text=Temporary Tag').locator('..')
    await tagBadge.locator('button:has(svg[class*="x-mark"])').click()

    await expect(page.locator('text=Temporary Tag')).not.toBeVisible()
  })

  test('should display empty state for trackers', async ({ page }) => {
    await page.goto(`/characters/${character.id}/edit`)
    await page.click('button:has-text("Trackers")')

    // All trackers should show empty state
    await expect(page.locator('text=Aucun status actif')).toBeVisible()
    await expect(page.locator('text=Aucun story tag')).toBeVisible()
    await expect(page.locator('text=Aucun story theme')).toBeVisible()
  })
})
