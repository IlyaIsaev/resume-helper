import * as v from 'valibot';
import { expect, test } from 'vitest';

import { updateCareerStepSchema } from '../model/schema';

const VALID_STEP = {
  position: 'Senior Engineer',
  dates: { from: '2020-01-15', to: '2024-03-01' },
  description: 'Built the billing platform',
  technologies: 'TypeScript, PostgreSQL',
} as const;

test('should accept the update payload when it includes an id', () => {
  const result = v.safeParse(updateCareerStepSchema, {
    id: 'step-1',
    ...VALID_STEP,
  });

  expect(result.success).toBe(true);
});

test('should reject the update payload when it has no id', () => {
  const result = v.safeParse(updateCareerStepSchema, VALID_STEP);

  expect(result.success).toBe(false);
});
