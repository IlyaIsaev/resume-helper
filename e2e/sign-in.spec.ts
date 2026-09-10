import { expect, type Page, test } from '@playwright/test';

import { demoEmail, signInAsDemoUser } from './demo-user';

const notifications = (page: Page) =>
  page.getByRole('region', { name: /Notifications/i });

test('opening the app redirects guests to sign-in', async ({ page }) => {
  const demoUserGets: string[] = [];
  const demoUserPosts: string[] = [];
  const signUpRequests: string[] = [];

  page.on('requestfinished', (request) => {
    if (
      request.url().includes('/api/demo-user') &&
      request.method() === 'GET'
    ) {
      demoUserGets.push(request.url());
    }
  });

  page.on('request', (request) => {
    if (
      request.url().includes('/api/demo-user') &&
      request.method() === 'POST'
    ) {
      demoUserPosts.push(request.url());
    }

    if (request.url().includes('/api/auth/sign-up/email')) {
      signUpRequests.push(request.url());
    }
  });

  await page.goto('/');

  await expect(page).toHaveURL(/\/sign-in$/);
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
  await expect(page.getByLabel('email')).toHaveValue(demoEmail);
  await expect(page.getByLabel('password')).not.toHaveValue('');
  await expect(
    page.getByRole('heading', { name: 'We use cookies' }),
  ).toBeVisible();
  await expect(page.getByRole('link', { name: 'Sign up' })).toBeVisible();
  await expect(page.evaluate(() => document.cookie)).resolves.not.toContain(
    'createdDemoUser',
  );
  expect(demoUserGets).toHaveLength(1);
  expect(demoUserPosts).toEqual([]);
  expect(signUpRequests).toEqual([]);
});

test('signing in creates the demo user and lands on career steps', async ({
  page,
}) => {
  await signInAsDemoUser(page);

  await expect(
    notifications(page).getByText('Demo accounts are deleted after 24 hours.'),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Add career step' }),
  ).toBeVisible();
});

test('sign-in page shows cookie consent', async ({ page }) => {
  await page.goto('/sign-in');

  await expect(
    page.getByRole('heading', { name: 'We use cookies' }),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Accept' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Decline' })).toBeVisible();
});

test('accepting cookies hides the consent banner', async ({ page }) => {
  await page.goto('/sign-in');

  await page.getByRole('button', { name: 'Accept' }).click();

  await expect(
    page.getByRole('heading', { name: 'We use cookies' }),
  ).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
  await expect(page.evaluate(() => document.cookie)).resolves.toContain(
    'cookieConsent=true',
  );

  await page.reload();

  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'We use cookies' }),
  ).toHaveCount(0);
});

test('declining cookies leaves for Google without deleting a user', async ({
  page,
}) => {
  const deleteRequests: string[] = [];

  page.on('request', (request) => {
    if (
      request.url().includes('/api/demo-user') &&
      request.method() === 'DELETE'
    ) {
      deleteRequests.push(request.url());
    }
  });

  await page.goto('/sign-in');
  await page.getByRole('button', { name: 'Decline' }).click();

  await expect(page).toHaveURL(/google\.com/);
  expect(deleteRequests).toEqual([]);
});
