import * as v from 'valibot';
import { expect, test } from 'vitest';

import type { CareerStep } from '@/shared/api';

import { careerStepSchema, careerStepToFormValues } from '../model/schema';

const VALID_STEP = {
  position: 'Senior Engineer',
  dates: { from: '2020-01-15', to: '2024-03-01' },
  description: 'Built the billing platform',
  technologies: 'TypeScript, PostgreSQL',
} as const;

const CLOSED_CAREER_STEP = {
  id: 'step-1',
  position: VALID_STEP.position,
  startedOn: VALID_STEP.dates.from,
  endedOn: VALID_STEP.dates.to,
  description: VALID_STEP.description,
  technologies: VALID_STEP.technologies,
  createdAt: '2026-01-01T00:00:00.000Z',
} as const satisfies CareerStep;

test('should accept the payload when all career step fields are valid', () => {
  const result = v.safeParse(careerStepSchema, VALID_STEP);

  expect(result.success).toBe(true);
});

test('should accept the payload when the end date is empty', () => {
  const result = v.safeParse(careerStepSchema, {
    ...VALID_STEP,
    dates: { from: '2020-01-15', to: '' },
  });

  expect(result.success).toBe(true);
});

test('should trim whitespace when position, description, and technologies have padding', () => {
  const result = v.safeParse(careerStepSchema, {
    position: '  Senior Engineer  ',
    dates: VALID_STEP.dates,
    description: '  Built the billing platform  ',
    technologies: '  TypeScript, PostgreSQL  ',
  });

  expect(result.success).toBe(true);
  if (result.success) {
    expect(result.output).toEqual(VALID_STEP);
  }
});

test('should reject the payload when the position is empty', () => {
  const result = v.safeParse(careerStepSchema, {
    ...VALID_STEP,
    position: '   ',
  });

  expect(result.success).toBe(false);
});

test('should reject the payload when the description is empty', () => {
  const result = v.safeParse(careerStepSchema, {
    ...VALID_STEP,
    description: '',
  });

  expect(result.success).toBe(false);
});

test('should reject the payload when technologies is empty', () => {
  const result = v.safeParse(careerStepSchema, {
    ...VALID_STEP,
    technologies: '',
  });

  expect(result.success).toBe(false);
});

test('should reject the payload when the start date is missing', () => {
  const result = v.safeParse(careerStepSchema, {
    ...VALID_STEP,
    dates: { from: '', to: '' },
  });

  expect(result.success).toBe(false);
});

test('should reject the payload when the end date is before the start date', () => {
  const result = v.safeParse(careerStepSchema, {
    ...VALID_STEP,
    dates: { from: '2024-03-01', to: '2020-01-15' },
  });

  expect(result.success).toBe(false);
});

test('should copy fields into the form when the step has a closed date range', () => {
  expect(careerStepToFormValues(CLOSED_CAREER_STEP)).toEqual(VALID_STEP);
});

test('should use an empty end date when endedOn is null', () => {
  expect(
    careerStepToFormValues({ ...CLOSED_CAREER_STEP, endedOn: null }),
  ).toEqual({
    ...VALID_STEP,
    dates: { from: VALID_STEP.dates.from, to: '' },
  });
});
