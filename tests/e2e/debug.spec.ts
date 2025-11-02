import { test, expect } from '@playwright/test'

/**
 * Debug Tests - Check what's actually on the pages
 */

test.describe('Debug Tests', () => {
  test('check homepage title and content', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })

    const title = await page.title()
    console.log('=== HOMEPAGE ===')
    console.log('Title:', title)
    console.log('URL:', page.url())
    console.log('Body visible:', await page.locator('body').isVisible())

    // Log all headings
    const headings = await page.locator('h1, h2, h3').allTextContents()
    console.log('Headings:', headings)

    // Print page content snippet
    const bodyText = await page.locator('body').textContent()
    console.log('Body preview:', bodyText?.substring(0, 200))
  })

  test('check login page inputs', async ({ page }) => {
    await page.goto('/auth/login', { waitUntil: 'domcontentloaded' })

    console.log('=== LOGIN PAGE ===')
    console.log('URL:', page.url())
    console.log('Title:', await page.title())

    // Check for inputs
    const emailInputs = await page.locator('input[type="email"]').count()
    const passwordInputs = await page.locator('input[type="password"]').count()
    const allInputs = await page.locator('input').count()

    console.log('Email inputs:', emailInputs)
    console.log('Password inputs:', passwordInputs)
    console.log('Total inputs:', allInputs)

    // Log input types
    const inputTypes = await page.locator('input').evaluateAll((inputs: any[]) =>
      inputs.map(i => ({ type: i.type, name: i.name, id: i.id }))
    )
    console.log('Input details:', JSON.stringify(inputTypes, null, 2))

    // Log all headings
    const headings = await page.locator('h1, h2, h3').allTextContents()
    console.log('Headings:', headings)
  })
})
