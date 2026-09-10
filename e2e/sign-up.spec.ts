import { expect, test } from '@playwright/test';

test('sign-up is empty and does not create an account', async ({ page }) => {
  const demoUserGets: string[] = [];
  const demoUserPosts: string[] = [];

  page.on('request', (request) => {
    if (
      request.url().includes('/api/demo-user') &&
      request.method() === 'GET'
    ) {
      demoUserGets.push(request.url());
    }

    if (
      request.url().includes('/api/demo-user') &&
      request.method() === 'POST'
    ) {
      demoUserPosts.push(request.url());
    }
  });

  await page.goto('/sign-up');
  await expect(page.getByLabel('name')).toHaveValue('');
  await expect(page.getByLabel('email')).toHaveValue('');
  await expect(page.getByLabel('password')).toHaveValue('');
  await expect(
    page.getByRole('button', { name: 'Create account' }),
  ).toBeDisabled();

  await page.getByLabel('name').fill('Ada');
  await page.getByLabel('email').fill('ada@example.com');
  await page.getByLabel('password').fill('password1');
  await expect(
    page.getByRole('button', { name: 'Create account' }),
  ).toBeEnabled();
  await page.getByRole('button', { name: 'Create account' }).click();

  await expect(
    page.getByText('Sign-up temporarily unavailable.'),
  ).toBeVisible();
  await expect(page).toHaveURL(/\/sign-up$/);
  expect(demoUserGets).toEqual([]);
  expect(demoUserPosts).toEqual([]);
});

test('POST /api/auth/sign-up/email is blocked', async ({ request }) => {
  const signUpResponse = await request.post('/api/auth/sign-up/email', {
    data: {
      name: 'Ada',
      email: 'ada@example.com',
      password: 'password1',
    },
  });

  expect(signUpResponse.status()).toBe(403);
  await expect(signUpResponse.json()).resolves.toEqual({
    message: 'Sign-up temporarily unavailable',
  });
});
