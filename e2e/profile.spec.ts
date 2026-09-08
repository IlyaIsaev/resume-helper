import { expect, test, type Page } from '@playwright/test'

async function signUpFromDemoForm(page: Page) {
  await page.goto('/sign-up')
  await page.waitForLoadState('networkidle')
  const emailInput = page.getByLabel('Email')
  await expect(emailInput).not.toHaveValue('')
  const email = await emailInput.inputValue()
  await expect(page.getByRole('button', { name: 'Create account' })).toBeEnabled()
  await page.getByRole('button', { name: 'Create account' }).click()
  await expect(page).toHaveURL('/')
  await expect(
    page.getByRole('button', { name: 'Open account menu' }),
  ).toBeVisible()
  return email
}

test('guest visiting /profile is sent to sign-in', async ({ page }) => {
  await page.goto('/profile')
  await expect(page).toHaveURL(/\/sign-in/)
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible()
})

test('avatar menu opens with profile and sign out', async ({ page }) => {
  await signUpFromDemoForm(page)
  await page.getByRole('button', { name: 'Open account menu' }).click()
  await expect(page.getByRole('menuitem', { name: 'Profile' })).toBeVisible()
  await expect(page.getByRole('menuitem', { name: 'Sign out' })).toBeVisible()
})

test('profile page shows the user email', async ({ page }) => {
  const email = await signUpFromDemoForm(page)
  await page.getByRole('button', { name: 'Open account menu' }).click()
  await page.getByRole('menuitem', { name: 'Profile' }).click()
  await expect(page).toHaveURL(/\/profile/)
  await expect(page.getByText(email)).toBeVisible()
})

test('sign out from the avatar menu goes to sign-in', async ({ page }) => {
  await signUpFromDemoForm(page)
  await page.getByRole('button', { name: 'Open account menu' }).click()
  await page.getByRole('menuitem', { name: 'Sign out' }).click()
  await expect(page).toHaveURL(/\/sign-in/)
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible()
})

test('canceling account deletion keeps the account', async ({ page }) => {
  const email = await signUpFromDemoForm(page)
  await page.getByRole('button', { name: 'Open account menu' }).click()
  await page.getByRole('menuitem', { name: 'Profile' }).click()
  await page.getByRole('button', { name: 'Delete account' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.getByRole('button', { name: 'Cancel' }).click()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(page).toHaveURL(/\/profile/)
  await expect(page.getByText(email)).toBeVisible()
})

test('deleting the account redirects to sign-in', async ({ page }) => {
  await signUpFromDemoForm(page)
  await page.getByRole('button', { name: 'Open account menu' }).click()
  await page.getByRole('menuitem', { name: 'Profile' }).click()
  await page.getByRole('button', { name: 'Delete account' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.getByRole('button', { name: 'Delete', exact: true }).click()
  await expect(page).toHaveURL(/\/sign-in/)
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible()
})
