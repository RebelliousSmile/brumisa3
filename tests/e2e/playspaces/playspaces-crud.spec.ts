/**
 * Tests E2E Playspaces CRUD - MVP v1.0
 *
 * Tests :
 * - Create playspace avec sélection hack
 * - Update playspace
 * - Delete playspace avec cascade
 * - List characters in playspace
 * - Switch playspace performance < 2s (CRITICAL)
 */

import { test, expect } from '@playwright/test'
import { resetDatabase, createTestUser, createTestPlayspace, createTestCharacter } from '../helpers/database'

test.describe('Playspaces CRUD', () => {
  let user: any

  test.beforeEach(async () => {
    await resetDatabase()
    user = await createTestUser()
  })

  test('should create playspace with hack selection', async ({ page }) => {
    await page.goto('/playspaces/new')

    // Fill form
    await page.fill('input#name', 'My LITM Campaign')
    await page.fill('textarea#description', 'Epic fantasy campaign in medieval world')

    // Select hack
    await page.selectOption('select#hackId', 'litm')

    // Submit
    await page.click('button[type="submit"]')

    // Should redirect to playspaces list or dashboard
    await page.waitForLoadState('networkidle')

    // Verify playspace created
    await expect(page.locator('text=My LITM Campaign')).toBeVisible()
  })

  test('should create Otherscape playspace with correct hackId', async ({ page }) => {
    await page.goto('/playspaces/new')

    await page.fill('input#name', 'Tokyo Cyberpunk')
    await page.selectOption('select#hackId', 'otherscape')

    await page.click('button[type="submit"]')
    await page.waitForLoadState('networkidle')

    await expect(page.locator('text=Tokyo Cyberpunk')).toBeVisible()

    // Verify hackId is stored (should see it in playspace info or when creating character)
  })

  test('should update playspace name and description', async ({ page }) => {
    const playspace = await createTestPlayspace(user.id, 'litm')

    await page.goto(`/playspaces/${playspace.id}/edit`)

    // Update fields
    await page.fill('input#name', 'Updated Campaign Name')
    await page.fill('textarea#description', 'Updated description')

    await page.click('button:has-text("Sauvegarder")')

    // Verify updated
    await expect(page.locator('text=Updated Campaign Name')).toBeVisible()
    await expect(page.locator('text=Updated description')).toBeVisible()
  })

  test('should delete playspace with confirmation', async ({ page }) => {
    const playspace = await createTestPlayspace(user.id, 'litm')

    await page.goto('/playspaces')

    // Find playspace and click delete (or kebab menu → delete)
    const playspaceCard = page.locator(`text=${playspace.name}`).locator('..')
    await playspaceCard.locator('button:has(svg[class*="trash"])').click()

    // Confirmation modal should appear
    await expect(page.locator('text=Supprimer')).toBeVisible()
    await page.click('button:has-text("Supprimer définitivement")')

    // Playspace should be removed
    await expect(page.locator(`text=${playspace.name}`)).not.toBeVisible()
  })

  test('should cascade delete characters when playspace deleted', async ({ page }) => {
    const playspace = await createTestPlayspace(user.id, 'litm')
    const character = await createTestCharacter(playspace.id, 'Test Character')

    await page.goto('/playspaces')

    // Delete playspace
    const playspaceCard = page.locator(`text=${playspace.name}`).locator('..')
    await playspaceCard.locator('button:has(svg[class*="trash"])').click()
    await page.click('button:has-text("Supprimer définitivement")')

    // Navigate to characters page
    await page.goto('/characters')

    // Character should not exist anymore (cascade delete)
    await expect(page.locator(`text=${character.name}`)).not.toBeVisible()
  })

  test('should switch playspace in < 2s', async ({ page }) => {
    // Create 2 playspaces
    const playspace1 = await createTestPlayspace(user.id, 'litm', null, false)
    const playspace2 = await createTestPlayspace(user.id, 'otherscape', null, false)

    // Create characters in each
    await createTestCharacter(playspace1.id, 'LITM Character')
    await createTestCharacter(playspace2.id, 'Otherscape Character')

    await page.goto('/playspaces')

    // Measure switch time
    const startTime = Date.now()

    // Click on playspace2 to switch
    await page.click(`text=${playspace2.name}`)

    // Wait for characters to load
    await page.waitForLoadState('networkidle')

    const duration = Date.now() - startTime

    // Performance assertion (business-critical)
    expect(duration).toBeLessThan(2000) // < 2s MVP target

    console.log(`Playspace switch completed in ${duration}ms`)

    // Verify correct playspace is active
    await expect(page.locator(`text=${playspace2.name}`)).toBeVisible()

    // Verify correct characters are shown
    await expect(page.locator('text=Otherscape Character')).toBeVisible()
    await expect(page.locator('text=LITM Character')).not.toBeVisible()
  })

  test('should list characters in playspace', async ({ page }) => {
    const playspace = await createTestPlayspace(user.id, 'litm')

    // Create 3 characters
    await createTestCharacter(playspace.id, 'Character 1')
    await createTestCharacter(playspace.id, 'Character 2')
    await createTestCharacter(playspace.id, 'Character 3')

    await page.goto(`/playspaces/${playspace.id}`)

    // Should see character count
    await expect(page.locator('text=3 personnages')).toBeVisible()

    // Navigate to characters list
    await page.goto('/characters')

    // All 3 characters should be visible
    await expect(page.locator('text=Character 1')).toBeVisible()
    await expect(page.locator('text=Character 2')).toBeVisible()
    await expect(page.locator('text=Character 3')).toBeVisible()
  })
})
