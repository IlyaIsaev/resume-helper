import { expect, test } from 'vitest';
import {
  careerStepMatchesQuery,
  defaultCareerStepSort,
  filterAndSortCareerSteps,
  isCareerStepSort,
  sortCareerSteps,
} from '../list-query';
import type { CareerStep } from '../schema';

function step(
  overrides: Partial<CareerStep> & Pick<CareerStep, 'id'>,
): CareerStep {
  return {
    position: 'Engineer',
    startedOn: '2020-01-15',
    endedOn: '2024-03-01',
    description: 'Built the billing platform',
    technologies: 'TypeScript, PostgreSQL',
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

const designer = step({
  id: 'designer',
  position: 'Product Designer',
  startedOn: '2018-06-01',
  endedOn: null,
  description: 'Designed the mobile app',
  technologies: 'Figma',
  createdAt: '2026-01-02T00:00:00.000Z',
});

const engineer = step({
  id: 'engineer',
  position: 'Senior Engineer',
  startedOn: '2022-09-08',
  endedOn: '2024-03-01',
  description: 'Built the billing platform',
  technologies: 'TypeScript, PostgreSQL',
  createdAt: '2026-01-03T00:00:00.000Z',
});

const intern = step({
  id: 'intern',
  position: 'Intern',
  startedOn: '2022-09-08',
  endedOn: '2023-01-01',
  description: 'Wrote internal docs',
  technologies: 'Markdown',
  createdAt: '2026-01-04T00:00:00.000Z',
});

test('empty search matches every step', () => {
  expect(careerStepMatchesQuery(engineer, '')).toBe(true);
  expect(careerStepMatchesQuery(engineer, '   ')).toBe(true);
});

test('matches position, description, and technologies', () => {
  expect(careerStepMatchesQuery(engineer, 'senior')).toBe(true);
  expect(careerStepMatchesQuery(engineer, 'billing')).toBe(true);
  expect(careerStepMatchesQuery(engineer, 'postgresql')).toBe(true);
  expect(careerStepMatchesQuery(engineer, 'figma')).toBe(false);
});

test('matches ISO dates, Present, and formatted date text', () => {
  expect(careerStepMatchesQuery(engineer, '2022-09-08')).toBe(true);
  expect(careerStepMatchesQuery(engineer, '2024-03-01')).toBe(true);
  expect(careerStepMatchesQuery(designer, 'present')).toBe(true);
  expect(careerStepMatchesQuery(engineer, 'present')).toBe(false);
  expect(careerStepMatchesQuery(designer, '2018')).toBe(true);
});

test('matches id and createdAt', () => {
  expect(careerStepMatchesQuery(engineer, 'engineer')).toBe(true);
  expect(careerStepMatchesQuery(engineer, '2026-01-03')).toBe(true);
  expect(careerStepMatchesQuery(engineer, designer.id)).toBe(false);
});

test('is case-insensitive and trims the query', () => {
  expect(careerStepMatchesQuery(engineer, '  SENIOR ENGINEER  ')).toBe(true);
});

test('defaults to newest start date', () => {
  expect(defaultCareerStepSort).toBe('startedOn-desc');
  expect(isCareerStepSort('startedOn-desc')).toBe(true);
  expect(isCareerStepSort('startedOn-asc')).toBe(true);
  expect(isCareerStepSort('position-asc')).toBe(false);
  expect(isCareerStepSort('company-asc')).toBe(false);
});

test('sorts by start date newest first, then recently created', () => {
  expect(
    sortCareerSteps([designer, intern, engineer], 'startedOn-desc').map(
      (item) => item.id,
    ),
  ).toEqual(['intern', 'engineer', 'designer']);
});

test('sorts by start date oldest first', () => {
  expect(
    sortCareerSteps([intern, engineer, designer], 'startedOn-asc').map(
      (item) => item.id,
    ),
  ).toEqual(['designer', 'intern', 'engineer']);
});

test('filters then sorts the visible list', () => {
  expect(
    filterAndSortCareerSteps(
      [designer, intern, engineer],
      '2022-09-08',
      'startedOn-desc',
    ).map((item) => item.id),
  ).toEqual(['intern', 'engineer']);
});
