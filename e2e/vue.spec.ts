import { test, expect } from '@playwright/test'

// See here how to get started:
// https://playwright.dev/docs/intro
test('shows the overview screen', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('Minuten heute')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Neuer Eintrag' })).toBeVisible()
})

test('can open the new entry screen', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Neuer Eintrag' }).click()
  await expect(page.getByRole('heading', { name: 'Was möchtest du festhalten?' })).toBeVisible()
})
