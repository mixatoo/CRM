import { test, expect } from '@playwright/test'

test('login and view home', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('Work email').fill('admin@egyliere.com')
  await page.getByLabel('Password').fill('admin')
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page.getByRole('heading', { name: /Your dashboard/ })).toBeVisible()
})
