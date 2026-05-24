import { test, expect } from '@playwright/test'
import { loginAs, TEST_CREDENTIALS } from './helpers.js'

/**
 * Post flow E2E tests.
 * Requires running stack + a seeded account matching TEST_CREDENTIALS.
 */
test.describe('Post flows', () => {
  test.skip(
    !process.env['E2E_ENABLED'],
    'Set E2E_ENABLED=1 to run post flow tests (requires running stack + seeded account)',
  )

  test.beforeEach(async ({ page }) => {
    await loginAs(page, TEST_CREDENTIALS.email, TEST_CREDENTIALS.password)
  })

  test('dashboard loads with My Branch feed tab', async ({ page }) => {
    await expect(page.getByRole('tab', { name: /My Branch/i })).toBeVisible()
    await expect(page.getByRole('tab', { name: /My College/i })).toBeVisible()
    await expect(page.getByRole('tab', { name: /Everyone/i })).toBeVisible()
  })

  test('can compose and see post composer', async ({ page }) => {
    // PostComposer is visible
    await expect(page.getByPlaceholder(/Share something/i).or(page.getByRole('textbox').first())).toBeVisible()
  })

  test('can navigate to Lost & Found', async ({ page }) => {
    await page.getByRole('link', { name: /Lost & Found/i }).click()
    await expect(page).toHaveURL(/\/lostfound/)
    await expect(page.getByRole('button', { name: /Report Item/i })).toBeVisible()
  })

  test('can navigate to Knowledge Hub', async ({ page }) => {
    await page.getByRole('link', { name: /Knowledge Hub/i }).click()
    await expect(page).toHaveURL(/\/knowledge/)
  })

  test('logout works correctly', async ({ page }) => {
    await page.getByRole('button', { name: /Logout/i }).click()
    await expect(page).toHaveURL(/\/login/)
  })
})
