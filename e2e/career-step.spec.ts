import { expect, type Page, test } from '@playwright/test'

async function signUpAsDemoUser(page: Page) {
  await page.goto('/sign-up')
  await page.waitForLoadState('networkidle')
  await expect(page.getByLabel('Email')).not.toHaveValue('')
  await expect(page.getByRole('button', { name: 'Create account' })).toBeEnabled()
  await page.getByRole('button', { name: 'Create account' }).click()
  await expect(page).toHaveURL('/', { timeout: 20000 })
  await expect(page.getByRole('heading', { name: 'Career' })).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Open account menu' }),
  ).toBeVisible()
}

test('adds a career step card from the dialog form', async ({ page }) => {
  await signUpAsDemoUser(page)

  await page.getByRole('button', { name: 'Add career step' }).click()

  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()

  await dialog.getByLabel('Position').fill('Senior Engineer')
  await dialog.getByLabel('Dates').click()
  await page.getByRole('button', { name: /^Today,/ }).click()
  await page.keyboard.press('Escape')
  await expect(dialog.getByLabel('Dates')).toContainText('Present')
  await dialog.getByLabel('Description').fill('Built the billing platform')
  await dialog.getByLabel('Technologies').fill('TypeScript, PostgreSQL')
  await dialog.getByRole('button', { name: 'Save career step' }).click()

  await expect(dialog).toBeHidden()

  const card = page.getByTestId('career-step-card')
  await expect(card.getByText('Senior Engineer')).toBeVisible()
  await expect(card.getByText(/Present/)).toBeVisible()
  await expect(card.getByText('Built the billing platform')).toBeVisible()
  await expect(card.getByText('TypeScript, PostgreSQL')).toBeVisible()

  await page.reload()
  await expect(
    page.getByTestId('career-step-card').getByText('Senior Engineer'),
  ).toBeVisible()
  await expect(page.getByTestId('career-step-card').getByText(/Present/)).toBeVisible()
  await expect(page.getByText('Built the billing platform')).toBeVisible()
  await expect(page.getByText('TypeScript, PostgreSQL')).toBeVisible()
})
