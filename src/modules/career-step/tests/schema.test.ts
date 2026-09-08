import * as v from 'valibot';
import { expect, test } from 'vitest';
import {
  careerStepSchema,
  deleteCareerStepSchema,
  updateCareerStepSchema,
} from '../schema';

const validStep = {
  position: 'Senior Engineer',
  dates: { from: '2020-01-15', to: '2024-03-01' },
  description: 'Built the billing platform',
  technologies: 'TypeScript, PostgreSQL',
};

test('accepts a complete career step', () => {
  const result = v.safeParse(careerStepSchema, validStep);

  expect(result.success).toBe(true);
});

test('accepts a start date without an end date', () => {
  const result = v.safeParse(careerStepSchema, {
    ...validStep,
    dates: { from: '2020-01-15', to: '' },
  });

  expect(result.success).toBe(true);
});

test('trims whitespace from fields', () => {
  const result = v.safeParse(careerStepSchema, {
    position: '  Senior Engineer  ',
    dates: validStep.dates,
    description: '  Built the billing platform  ',
    technologies: '  TypeScript, PostgreSQL  ',
  });

  expect(result.success).toBe(true);
  if (result.success) {
    expect(result.output).toEqual(validStep);
  }
});

test('rejects an empty position', () => {
  const result = v.safeParse(careerStepSchema, {
    ...validStep,
    position: '   ',
  });

  expect(result.success).toBe(false);
});

test('rejects an empty description', () => {
  const result = v.safeParse(careerStepSchema, {
    ...validStep,
    description: '',
  });

  expect(result.success).toBe(false);
});

test('rejects empty technologies', () => {
  const result = v.safeParse(careerStepSchema, {
    ...validStep,
    technologies: '',
  });

  expect(result.success).toBe(false);
});

test('rejects a missing start date', () => {
  const result = v.safeParse(careerStepSchema, {
    ...validStep,
    dates: { from: '', to: '' },
  });

  expect(result.success).toBe(false);
});

test('rejects an end date before the start date', () => {
  const result = v.safeParse(careerStepSchema, {
    ...validStep,
    dates: { from: '2024-03-01', to: '2020-01-15' },
  });

  expect(result.success).toBe(false);
});

test('accepts an update payload with an id', () => {
  const result = v.safeParse(updateCareerStepSchema, {
    id: 'step-1',
    ...validStep,
  });

  expect(result.success).toBe(true);
});

test('rejects an update payload without an id', () => {
  const result = v.safeParse(updateCareerStepSchema, validStep);

  expect(result.success).toBe(false);
});

test('accepts a delete payload with an id', () => {
  const result = v.safeParse(deleteCareerStepSchema, { id: 'step-1' });

  expect(result.success).toBe(true);
});

test('rejects a delete payload without an id', () => {
  const result = v.safeParse(deleteCareerStepSchema, {});

  expect(result.success).toBe(false);
});

test('rejects a delete payload with an empty id', () => {
  const result = v.safeParse(deleteCareerStepSchema, { id: '' });

  expect(result.success).toBe(false);
});
