import { expect, test } from '@playwright/test';

import { demoEmail, signInAsDemoUser } from './demo-user';

test('guest visiting /profile is sent to sign-in', async ({ page }) => {
  await page.goto('/profile');
  await expect(page).toHaveURL(/\/sign-in/);
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
});

test('avatar menu opens with profile and sign out', async ({ page }) => {
  await signInAsDemoUser(page);
  await page.getByRole('button', { name: 'Open account menu' }).click();
  await expect(page.getByRole('menuitem', { name: 'Profile' })).toBeVisible();
  await expect(page.getByRole('menuitem', { name: 'Sign out' })).toBeVisible();
});

test('profile page shows the user email', async ({ page }) => {
  const { email } = await signInAsDemoUser(page);
  await page.getByRole('button', { name: 'Open account menu' }).click();
  await page.getByRole('menuitem', { name: 'Profile' }).click();
  await expect(page).toHaveURL(/\/profile/);
  await expect(page.getByText(email)).toBeVisible();
});

test('sign out from the avatar menu reuses the same demo user', async ({
  page,
}) => {
  const { email, password } = await signInAsDemoUser(page);
  await page.getByRole('button', { name: 'Open account menu' }).click();
  await page.getByRole('menuitem', { name: 'Sign out' }).click();
  await expect(page).toHaveURL(/\/sign-in/);
  await expect(page.getByLabel('email')).toHaveValue(email);
  await expect(page.getByLabel('password')).toHaveValue(password);
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();

  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL('/career-steps', { timeout: 20_000 });
  await expect(
    page.getByRole('button', { name: 'Open account menu' }),
  ).toBeVisible();
});

test('signed-in users opening sign-in are sent to career steps', async ({
  page,
}) => {
  await signInAsDemoUser(page);
  await page.goto('/sign-in');
  await expect(page).toHaveURL('/career-steps');
  await expect(page.getByRole('button', { name: 'Sign in' })).toHaveCount(0);
});

test('canceling account deletion keeps the account', async ({ page }) => {
  const { email } = await signInAsDemoUser(page);
  await page.getByRole('button', { name: 'Open account menu' }).click();
  await page.getByRole('menuitem', { name: 'Profile' }).click();
  await page.getByRole('button', { name: 'Delete account' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: 'Cancel' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page).toHaveURL(/\/profile/);
  await expect(page.getByText(email)).toBeVisible();
});

test('deleting the account prefills a new demo user', async ({ page }) => {
  const { email: deletedEmail } = await signInAsDemoUser(page);
  await page.getByRole('button', { name: 'Open account menu' }).click();
  await page.getByRole('menuitem', { name: 'Profile' }).click();
  await page.getByRole('button', { name: 'Delete account' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: 'Delete', exact: true }).click();
  await expect(page).toHaveURL(/\/sign-in/, { timeout: 20_000 });
  await expect(page.getByLabel('email')).toHaveValue(demoEmail);
  await expect(page.getByLabel('email')).not.toHaveValue(deletedEmail);
  await expect(page.getByLabel('password')).not.toHaveValue('');
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
});
