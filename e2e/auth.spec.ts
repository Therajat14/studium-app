import { test, expect } from '@playwright/test'

/**
 * Auth E2E tests.
 * Requires both the dev server (port 5000) and the client (port 5173) to be
 * running. Start them with:
 *   cd server && npm run dev
 *   cd client && npm run dev
 *
 * These tests use a real running stack. Seed a test user before running or
 * adjust credentials to match an existing account.
 */
test.describe('Authentication flows', () => {
  test('home page loads and has a Sign In button', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('link', { name: /Sign In|Login|Get Started/i }).first()).toBeVisible()
  })

  test('/login route is accessible', async ({ page }) => {
    await page.goto('/login')
    await expect(page).toHaveTitle(/Studium/)
    await expect(page.getByRole('button', { name: /Sign In/i })).toBeVisible()
  })

  test('login form shows validation error for empty submission', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('button', { name: /Sign In/i }).click()
    // Zod validation fires — expect an error message to appear
    await expect(page.locator('[class*="text-red"]').first()).toBeVisible()
  })

  test('signup flow: step 1 renders correctly', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('button', { name: /Sign Up/i }).click()
    await expect(page.getByText(/Step 1 of 3/i)).toBeVisible()
    await expect(page.getByLabelText(/Full Name/i)).toBeVisible()
    await expect(page.getByLabelText(/College Email/i)).toBeVisible()
    await expect(page.getByLabelText(/Roll Number/i)).toBeVisible()
  })

  test('signup step 2 has college dropdown', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('button', { name: /Sign Up/i }).click()

    // Fill step 1
    await page.getByLabel(/Full Name/i).fill('Test Student')
    await page.getByLabel(/College Email/i).fill('newstudent@geu.ac.in')
    await page.getByLabel(/Roll Number/i).fill('GEU21CS099')
    const pwFields = page.getByPlaceholder(/password/i)
    await pwFields.nth(0).fill('password123')
    await pwFields.nth(1).fill('password123')
    await page.getByRole('button', { name: /Continue/i }).click()

    // Step 2: college is a select
    await expect(page.getByText(/Step 2 of 3/i)).toBeVisible()
    const collegeField = page.getByLabel(/College \/ University/i)
    await expect(collegeField).toBeVisible()
    expect(await collegeField.evaluate((el) => el.tagName.toLowerCase())).toBe('select')
  })

  test('protected route redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/dashboard')
    // Should redirect to login
    await expect(page).toHaveURL(/\/login/)
  })
})
