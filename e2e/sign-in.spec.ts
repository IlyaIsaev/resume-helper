import { expect, test } from '@playwright/test';

test('guest visiting / is sent to sign-in', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/sign-in/);
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
});
