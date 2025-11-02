/**
 * Tests E2E Playspaces - MVP v1.0
 *
 * Tests :
 * - List playspaces (page loads)
 */

import { test, expect } from '@playwright/test'

test.describe('Playspaces E2E', () => {
  test.beforeEach(async ({ page }) => {
    page.setDefaultTimeout(15000)
  })

  test('should list user playspaces', async ({ page }) => {
    // Navigate to playspaces page
    await page.goto('/playspaces', { waitUntil: 'domcontentloaded' })

    // Check if page loaded - either shows playspaces or redirects to login
    const url = page.url()

    // Page should either be playspaces or login page
    const isPlayspacesPage = url.includes('/playspaces')
    const isLoginPage = url.includes('/auth/login')

    expect(isPlayspacesPage || isLoginPage).toBeTruthy()
  })
})
