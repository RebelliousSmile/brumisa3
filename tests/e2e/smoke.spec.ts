import { test, expect } from '@playwright/test'

/**
 * Smoke Tests - Verify basic app functionality
 */

test.describe('Smoke Tests', () => {
  test('homepage loads successfully', async ({ page }) => {
    await page.goto('/')

    // Check that the page loaded
    await expect(page).toHaveTitle(/Brumisa3/i)

    // Check for main heading or logo
    const heading = page.locator('h1, h2').first()
    await expect(heading).toBeVisible()
  })

  test('can navigate to login page', async ({ page }) => {
    await page.goto('/')

    // Click login link (adjust selector based on actual UI)
    await page.click('a[href="/auth/login"]')

    // Verify we're on login page
    await expect(page).toHaveURL('/auth/login')
    await expect(page.locator('input[name="email"]')).toBeVisible()
  })

  test('dashboard requires authentication', async ({ page }) => {
    // Try to access protected route
    await page.goto('/dashboard')

    // Should redirect to login
    await expect(page).toHaveURL('/auth/login')
  })
})
