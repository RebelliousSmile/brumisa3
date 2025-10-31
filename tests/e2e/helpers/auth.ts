import { Page } from '@playwright/test'

/**
 * Helper functions for authentication in E2E tests
 */

export async function login(page: Page, email: string = 'test@brumisa3.com', password: string = 'test123') {
  await page.goto('/auth/login')
  await page.fill('input[name="email"]', email)
  await page.fill('input[name="password"]', password)
  await page.click('button[type="submit"]')
  await page.waitForURL('/dashboard')
}

export async function logout(page: Page) {
  await page.click('button[data-test="logout"]')
  await page.waitForURL('/auth/login')
}

export async function loginAsGuest(page: Page) {
  await page.goto('/auth/login')
  await page.click('button[data-test="guest-mode"]')
  await page.waitForURL('/dashboard')
}
