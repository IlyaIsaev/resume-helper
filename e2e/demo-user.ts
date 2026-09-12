import { expect, type Page } from '@playwright/test';

const demoEmail = /demo-user-[a-f0-9]{8}@demo\.com/;

export const signInAsDemoUser = async (
  page: Page,
): Promise<{ email: string; password: string }> => {
  await page.goto('/sign-in');

  await expect(page.getByLabel('email')).toHaveValue(demoEmail);

  const email = await page.getByLabel('email').inputValue();
  const password = await page.getByLabel('password').inputValue();

  await expect(page.getByRole('button', { name: 'Sign in' })).toBeEnabled();
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page).toHaveURL('/career-steps', { timeout: 20_000 });
  await expect(
    page.getByRole('button', { name: 'Open account menu' }),
  ).toBeVisible();

  return { email, password };
};

export { demoEmail };
