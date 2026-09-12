import * as v from 'valibot';
import { expect, test } from 'vitest';

import { deleteCareerStepSchema } from '../model/schema';

test('should accept the delete payload when it includes an id', () => {
  const result = v.safeParse(deleteCareerStepSchema, { id: 'step-1' });

  expect(result.success).toBe(true);
});

test('should reject the delete payload when it has no id', () => {
  const result = v.safeParse(deleteCareerStepSchema, {});

  expect(result.success).toBe(false);
});

test('should reject the delete payload when the id is empty', () => {
  const result = v.safeParse(deleteCareerStepSchema, { id: '' });

  expect(result.success).toBe(false);
});
