import { test, expect } from '@playwright/test'
import { DEMO_TRIP_ID } from '../src/infrastructure/database/mocks/trip-services.mock'

test('invoice PDF download', async ({ page }) => {
  const consoleErrors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
  })
  page.on('pageerror', (err) => consoleErrors.push(err.message))

  await page.goto('/login')
  await page.getByLabel('Work email').fill('admin@egyliere.com')
  await page.getByLabel('Password').fill('admin')
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page.getByRole('heading', { name: /Your dashboard/ })).toBeVisible()

  await page.goto(`/trips/${DEMO_TRIP_ID}/documents`)
  await page.getByRole('button', { name: 'Create invoice' }).click()
  await page.getByRole('button', { name: 'Create draft' }).click()
  await expect(page.getByText(/-INV-/)).toBeVisible({ timeout: 15_000 })

  const downloadPromise = page.waitForEvent('download', { timeout: 60_000 })
  await page.getByRole('button', { name: 'Export PDF' }).click()
  await expect(page.getByRole('dialog', { name: 'Invoice PDF preview' })).toBeVisible({ timeout: 30_000 })
  await page.getByRole('button', { name: 'Download PDF' }).click()
  const download = await downloadPromise

  expect(download.suggestedFilename()).toMatch(/\.pdf$/i)
  expect(consoleErrors, consoleErrors.join('\n')).toEqual([])
})
