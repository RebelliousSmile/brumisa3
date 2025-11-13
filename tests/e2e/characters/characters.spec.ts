/**
 * Tests E2E Characters - MVP v1.0
 *
 * Tests :
 * - List characters (par playspace)
 * - Create character
 * - Update character
 * - Delete character
 * - Performance création < 60s
 */

import { test, expect } from '@playwright/test'
import { resetDatabase, createTestUser, createTestPlayspace } from '../helpers/database'

test.describe('Characters E2E', () => {
  test.beforeEach(async () => {
    await resetDatabase()
  })

  test('should list characters for playspace', async ({ page }) => {
    // Setup
    const user = await createTestUser()
    const playspace = await createTestPlayspace(user.id, 'litm', null, false)

    // TODO: Create test characters via Prisma
    // TODO: Login
    // TODO: Navigate to characters page
    // TODO: Verify list displayed
  })

  test('should create character in < 60s', async ({ page }) => {
    // TODO: Implémenter après auth + UI
    // - Login
    // - Select playspace
    // - Click "New Character"
    // - Fill form (name, description)
    // - Submit
    // - Measure time < 60000ms
  })

  test('should update character name', async ({ page }) => {
    // TODO: Implémenter après auth + UI
  })

  test('should delete character with confirmation', async ({ page }) => {
    // TODO: Implémenter après auth + UI
  })

  test('should display character count per playspace', async ({ page }) => {
    // TODO: Implémenter après auth + UI
  })
})
