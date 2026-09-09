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
  await expect(
    page.getByRole('button', { name: 'Add career step' }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Open account menu' }),
  ).toBeVisible();
}

function careerStepDateInput(page: Page, name: 'Start' | 'End') {
  return page.getByRole('dialog').getByRole('textbox', { name });
}

async function pickCareerStepStartDate(
  page: Page,
  startDate: 'today' | 'previous-month-first',
) {
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('button', { name: 'Select start date' }).click();

  if (startDate === 'today') {
    await page.getByRole('button', { name: /^Today,/ }).click();
    return;
  }

  await page.getByRole('button', { name: 'Go to the Previous Month' }).click();
  const dataDay = await page.evaluate(() => {
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() - 1);
    return date.toLocaleDateString();
  });
  await page.locator(`[data-day="${dataDay}"]`).click();
}

async function addCareerStep(
  page: Page,
  step: {
    position: string;
    description: string;
    technologies: string;
    startDate?: 'today' | 'previous-month-first';
  },
) {
  await page.getByRole('button', { name: 'Add career step' }).click();

  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();

  await dialog.getByLabel('Position').fill(step.position);
  await pickCareerStepStartDate(page, step.startDate ?? 'today');
  await expect(careerStepDateInput(page, 'End')).toHaveValue('');
  await expect(careerStepDateInput(page, 'End')).toHaveAttribute(
    'placeholder',
    'Present',
  );
  await dialog.getByLabel('Description').fill(step.description);
  await dialog.getByLabel('Technologies').fill(step.technologies);
  await dialog.getByRole('button', { name: 'Save career step' }).click();

  await expect(dialog).toBeHidden();
  await expect(
    page.getByText(`Career step “${step.position}” was created.`),
  ).toBeVisible();
}

async function addSeniorEngineerStep(page: Page) {
  await addCareerStep(page, {
    position: 'Senior Engineer',
    description: 'Built the billing platform',
    technologies: 'TypeScript, PostgreSQL',
  });
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

test('creates a career step from a typed start date and a year dropdown', async ({
  page,
}) => {
  await signUpAsDemoUser(page);
  await page.getByRole('button', { name: 'Add career step' }).click();

  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();

  await dialog.getByLabel('Position').fill('Intern');
  await careerStepDateInput(page, 'Start').fill('15 Jan 2020');
  await expect(careerStepDateInput(page, 'Start')).toHaveValue(/15 Jan 2020/);

  await dialog.getByRole('button', { name: 'Select end date' }).click();
  await page
    .getByRole('combobox', { name: 'Choose the Year' })
    .selectOption('2021');
  await page
    .getByRole('combobox', { name: 'Choose the Month' })
    .selectOption('0');
  const endDay = await page.evaluate(() =>
    new Date(2021, 0, 20).toLocaleDateString(),
  );
  await page.locator(`[data-day="${endDay}"]`).click();

  await dialog.getByLabel('Description').fill('Helped with research');
  await dialog.getByLabel('Technologies').fill('Figma');
  await dialog.getByRole('button', { name: 'Save career step' }).click();

  await expect(dialog).toBeHidden();
  await expect(
    page.getByText('Career step “Intern” was created.'),
  ).toBeVisible();

  const card = page.getByTestId('career-step-card');
  await expect(card.getByText('Intern')).toBeVisible();
  await expect(card.getByText(/15 Jan 2020/)).toBeVisible();
  await expect(card.getByText(/20 Jan 2021/)).toBeVisible();
  await expect(card.getByText(/Present/)).toHaveCount(0);
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
  await expect(careerStepDateInput(page, 'Start')).not.toHaveValue('');
  await expect(careerStepDateInput(page, 'End')).toHaveValue('');
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
  await expect(
    page.getByRole('searchbox', { name: 'Search career steps' }),
  ).toBeVisible();
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

  await page.reload();
  await expect(
    page.getByTestId('career-step-card').getByText('Senior Engineer'),
  ).toBeVisible();

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

test('filters career steps across fields and restores the full list', async ({
  page,
}) => {
  await signUpAsDemoUser(page);
  await addSeniorEngineerStep(page);
  await addCareerStep(page, {
    position: 'Product Designer',
    description: 'Designed the mobile app',
    technologies: 'Figma',
  });

  const search = page.getByRole('searchbox', { name: 'Search career steps' });
  await expect(page.getByTestId('career-step-card')).toHaveCount(2);

  await search.fill('billing');
  await expect(page.getByTestId('career-step-card')).toHaveCount(1);
  await expect(
    page.getByTestId('career-step-card').getByText('Senior Engineer'),
  ).toBeVisible();

  await search.fill('figma');
  await expect(page.getByTestId('career-step-card')).toHaveCount(1);
  await expect(
    page.getByTestId('career-step-card').getByText('Product Designer'),
  ).toBeVisible();

  await search.fill('present');
  await expect(page.getByTestId('career-step-card')).toHaveCount(2);

  await search.fill('no such career step');
  await expect(page.getByTestId('career-step-card')).toHaveCount(0);
  await expect(
    page.getByText('No career steps match your search.'),
  ).toBeVisible();

  await search.fill('');
  await expect(page.getByTestId('career-step-card')).toHaveCount(2);
});

test('sorts career steps by start date', async ({ page }) => {
  await signUpAsDemoUser(page);
  await addCareerStep(page, {
    position: 'Product Designer',
    description: 'Designed the mobile app',
    technologies: 'Figma',
    startDate: 'previous-month-first',
  });
  await addSeniorEngineerStep(page);

  const cards = page.getByTestId('career-step-card');
  await expect(cards).toHaveCount(2);
  await expect(cards.nth(0)).toContainText('Senior Engineer');
  await expect(cards.nth(1)).toContainText('Product Designer');

  await page.getByRole('combobox', { name: 'Sort career steps' }).click();
  await expect(page.getByRole('option', { name: 'Newest' })).toBeVisible();
  await expect(page.getByRole('option', { name: 'Oldest' })).toBeVisible();
  await expect(page.getByRole('option', { name: 'Position A–Z' })).toHaveCount(
    0,
  );
  await expect(page.getByRole('option', { name: 'Position Z–A' })).toHaveCount(
    0,
  );

  await page.getByRole('option', { name: 'Oldest' }).click();
  await expect(cards.nth(0)).toContainText('Product Designer');
  await expect(cards.nth(1)).toContainText('Senior Engineer');
});

async function expectCardsDoNotOverlapAddButton(page: Page) {
  const addButton = page.getByRole('button', { name: 'Add career step' });
  await expect(addButton).toBeVisible();
  await expect(addButton).toBeInViewport();

  const addBox = await addButton.boundingBox();
  expect(addBox).toBeTruthy();
  if (!addBox) return;

  const topLabel = await page.evaluate(
    ({ x, y }) => {
      const node = document.elementFromPoint(x, y);
      return (
        node?.closest('button')?.textContent?.trim() ??
        node?.textContent?.trim() ??
        ''
      );
    },
    { x: addBox.x + addBox.width / 2, y: addBox.y + addBox.height / 2 },
  );

  expect(topLabel).toContain('Add career step');
}

test('scrolls to a created career step that is out of view', async ({
  page,
}) => {
  test.setTimeout(180_000);
  await signUpAsDemoUser(page);

  for (let index = 1; index <= 11; index += 1) {
    await addCareerStep(page, {
      position: `Role ${index}`,
      description: `Did work ${index}`,
      technologies: 'TypeScript',
    });
    const list = page.getByTestId('career-step-list');
    const overflows = await list.evaluate(
      (element) => element.scrollHeight > element.clientHeight,
    );
    if (overflows) break;
  }

  await expect
    .poll(async () =>
      page
        .getByTestId('career-step-list')
        .evaluate((element) => element.scrollHeight > element.clientHeight),
    )
    .toBe(true);

  await addCareerStep(page, {
    position: 'Summer Intern',
    description: 'Helped with research',
    technologies: 'Figma',
    startDate: 'previous-month-first',
  });

  const created = page.getByTestId('career-step-card').filter({
    has: page.getByText('Summer Intern', { exact: true }),
  });
  await expect(created).toBeInViewport();

  const list = page.getByTestId('career-step-list');
  await expect
    .poll(async () => {
      const [listBox, cardBox] = await Promise.all([
        list.boundingBox(),
        created.boundingBox(),
      ]);
      if (!listBox || !cardBox) return Number.POSITIVE_INFINITY;
      return Math.abs(cardBox.y - listBox.y);
    })
    .toBeLessThan(8);
});

test('virtual list shows at most 10 career steps and stays above add', async ({
  page,
}) => {
  test.setTimeout(180_000);
  await signUpAsDemoUser(page);

  for (let index = 1; index <= 11; index += 1) {
    await addCareerStep(page, {
      position: `Role ${index}`,
      description: `Did work ${index}`,
      technologies: 'TypeScript',
    });
  }

  const list = page.getByTestId('career-step-list');
  await expect(list).toBeVisible();
  await expect(list).toHaveAttribute('data-loaded-count', '11');

  const visibleCards = page.getByTestId('career-step-card');
  await expect.poll(async () => visibleCards.count()).toBeLessThanOrEqual(10);
  await expect.poll(async () => visibleCards.count()).toBeGreaterThan(0);
  await expectCardsDoNotOverlapAddButton(page);

  await expect
    .poll(async () =>
      list.evaluate((element) => element.scrollHeight - element.clientHeight),
    )
    .toBeGreaterThan(0);

  await list.evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });

  await expect(visibleCards.getByText('Role 1', { exact: true })).toBeVisible();
  await expect.poll(async () => visibleCards.count()).toBeLessThanOrEqual(10);
  await expectCardsDoNotOverlapAddButton(page);
});
