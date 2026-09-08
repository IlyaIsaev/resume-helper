import { expect, type Page, test } from '@playwright/test';

async function signUpAsDemoUser(page: Page) {
  await page.goto('/sign-up');
  await page.waitForLoadState('networkidle');
  await expect(page.getByLabel('Email')).not.toHaveValue('');
  await expect(
    page.getByRole('button', { name: 'Create account' }),
  ).toBeEnabled();
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page).toHaveURL('/', { timeout: 20000 });
  await expect(page.getByRole('heading', { name: 'Career' })).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Open account menu' }),
  ).toBeVisible();
}

async function addSeniorEngineerStep(page: Page) {
  await page.getByRole('button', { name: 'Add career step' }).click();

  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();

  await dialog.getByLabel('Position').fill('Senior Engineer');
  await dialog.getByLabel('Dates').click();
  await page.getByRole('button', { name: /^Today,/ }).click();
  await page.keyboard.press('Escape');
  await expect(dialog.getByLabel('Dates')).toContainText('Present');
  await dialog.getByLabel('Description').fill('Built the billing platform');
  await dialog.getByLabel('Technologies').fill('TypeScript, PostgreSQL');
  await dialog.getByRole('button', { name: 'Save career step' }).click();

  await expect(dialog).toBeHidden();
  await expect(
    page.getByText('Career step “Senior Engineer” was created.'),
  ).toBeVisible();
}

test('add career step is focused when the career page opens', async ({
  page,
}) => {
  await signUpAsDemoUser(page);
  await expect(
    page.getByRole('button', { name: 'Add career step' }),
  ).toBeFocused();
});

test('adds a career step card from the dialog form', async ({ page }) => {
  await signUpAsDemoUser(page);
  await addSeniorEngineerStep(page);

  const card = page.getByTestId('career-step-card');
  await expect(card.getByText('Senior Engineer')).toBeVisible();
  await expect(card.getByText(/Present/)).toBeVisible();
  await expect(card.getByText('Built the billing platform')).toBeVisible();
  await expect(card.getByText('TypeScript, PostgreSQL')).toBeVisible();

  await page.reload();
  await expect(
    page.getByTestId('career-step-card').getByText('Senior Engineer'),
  ).toBeVisible();
  await expect(
    page.getByTestId('career-step-card').getByText(/Present/),
  ).toBeVisible();
  await expect(page.getByText('Built the billing platform')).toBeVisible();
  await expect(page.getByText('TypeScript, PostgreSQL')).toBeVisible();
});

test('edits a career step from the card', async ({ page }) => {
  await signUpAsDemoUser(page);
  await addSeniorEngineerStep(page);

  const card = page.getByTestId('career-step-card');
  await card.hover();
  await card.getByRole('link', { name: 'Edit career step' }).click();

  await expect(page).toHaveURL(/\/career-steps\/[^/]+\/edit$/);

  const editDialog = page.getByRole('dialog');
  await expect(editDialog).toBeVisible();
  await expect(
    editDialog.getByRole('heading', { name: 'Edit career step' }),
  ).toBeVisible();
  await expect(editDialog.getByLabel('Position')).toHaveValue(
    'Senior Engineer',
  );
  await expect(editDialog.getByLabel('Description')).toHaveValue(
    'Built the billing platform',
  );
  await expect(editDialog.getByLabel('Technologies')).toHaveValue(
    'TypeScript, PostgreSQL',
  );
  await expect(
    editDialog.getByRole('button', { name: 'Update career step' }),
  ).toBeDisabled();

  await editDialog.getByLabel('Position').fill('Staff Engineer');
  await expect(
    editDialog.getByRole('button', { name: 'Update career step' }),
  ).toBeEnabled();
  await editDialog.getByRole('button', { name: 'Update career step' }).click();
  await expect(editDialog).toBeHidden();
  await expect(page).toHaveURL('/');
  await expect(
    page.getByText('Career step “Senior Engineer” was updated.'),
  ).toBeVisible();

  await expect(card.getByText('Staff Engineer')).toBeVisible();
  await expect(card.getByText('Senior Engineer')).toHaveCount(0);

  await page.reload();
  await expect(
    page.getByTestId('career-step-card').getByText('Staff Engineer'),
  ).toBeVisible();
  await expect(page.getByText('Built the billing platform')).toBeVisible();
});

test('closes the edit dialog and returns to the career page', async ({
  page,
}) => {
  await signUpAsDemoUser(page);
  await addSeniorEngineerStep(page);

  const card = page.getByTestId('career-step-card');
  await card.hover();
  await card.getByRole('link', { name: 'Edit career step' }).click();

  const editDialog = page.getByRole('dialog');
  await expect(editDialog).toBeVisible();
  await expect(page).toHaveURL(/\/career-steps\/[^/]+\/edit$/);

  await editDialog.getByRole('button', { name: 'Close' }).click();
  await expect(editDialog).toBeHidden();
  await expect(page).toHaveURL('/');
  await expect(card.getByText('Senior Engineer')).toBeVisible();
});

test('opens a prefilled edit dialog from the career step URL', async ({
  page,
}) => {
  await signUpAsDemoUser(page);
  await addSeniorEngineerStep(page);

  const href = await page
    .getByRole('link', { name: 'Edit career step' })
    .getAttribute('href');
  expect(href).toMatch(/\/career-steps\/[^/]+\/edit$/);
  if (!href) {
    throw new Error('Expected an edit career step URL');
  }

  await page.goto(href);
  await expect(page).toHaveURL(href);
  await expect(page.getByRole('heading', { name: 'Career' })).toBeVisible();
  await expect(
    page.getByTestId('career-step-card').getByText('Senior Engineer'),
  ).toBeVisible();

  const editDialog = page.getByRole('dialog');
  await expect(editDialog).toBeVisible();
  await expect(
    editDialog.getByRole('heading', { name: 'Edit career step' }),
  ).toBeVisible();
  await expect(editDialog.getByLabel('Position')).toHaveValue(
    'Senior Engineer',
  );
  await expect(editDialog.getByLabel('Description')).toHaveValue(
    'Built the billing platform',
  );
  await expect(editDialog.getByLabel('Technologies')).toHaveValue(
    'TypeScript, PostgreSQL',
  );
});

test('canceling career step deletion keeps the card', async ({ page }) => {
  await signUpAsDemoUser(page);
  await addSeniorEngineerStep(page);

  const card = page.getByTestId('career-step-card');
  await card.hover();
  await card.getByRole('button', { name: 'Delete career step' }).click();

  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(
    dialog.getByRole('heading', { name: 'Delete career step' }),
  ).toBeVisible();
  await dialog.getByRole('button', { name: 'Cancel' }).click();
  await expect(dialog).toBeHidden();

  await expect(card.getByText('Senior Engineer')).toBeVisible();

  await page.reload();
  await expect(
    page.getByTestId('career-step-card').getByText('Senior Engineer'),
  ).toBeVisible();
});

test('deletes a career step from the card', async ({ page }) => {
  await signUpAsDemoUser(page);
  await addSeniorEngineerStep(page);

  const card = page.getByTestId('career-step-card');
  await card.hover();
  await card.getByRole('button', { name: 'Delete career step' }).click();

  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Delete', exact: true }).click();
  await expect(dialog).toBeHidden();
  await expect(
    page.getByText('Career step “Senior Engineer” was deleted.'),
  ).toBeVisible();

  await expect(page.getByTestId('career-step-card')).toHaveCount(0);
  await expect(page.getByText('No career steps yet.')).toBeVisible();

  await page.reload();
  await expect(page.getByTestId('career-step-card')).toHaveCount(0);
  await expect(page.getByText('No career steps yet.')).toBeVisible();
});
