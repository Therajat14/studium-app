import type { Page } from '@playwright/test'

export const TEST_CREDENTIALS = {
  email:    'testuser@geu.ac.in',
  password: 'password123',
  name:     'Test User',
}

/** Fills and submits the login form. */
export async function loginAs(page: Page, email: string, password: string) {
  await page.goto('/login')
  await page.getByLabel('Email or Roll Number').fill(email)
  await page.getByLabel('Password').fill(password)
  await page.getByRole('button', { name: 'Sign In' }).click()
  // Wait for the dashboard to load
  await page.waitForURL('**/dashboard', { timeout: 10_000 })
}

/** Logs out by clicking the Logout button in the sidebar. */
export async function logout(page: Page) {
  await page.getByRole('button', { name: 'Logout' }).click()
  await page.waitForURL('**/login', { timeout: 5_000 })
}
