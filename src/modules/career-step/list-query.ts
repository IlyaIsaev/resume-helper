import { formatCareerDateRange } from './dates';
import type { CareerStep } from './schema';

export const careerStepSortOptions = [
  { value: 'startedOn-desc', label: 'Start date (newest)' },
  { value: 'startedOn-asc', label: 'Start date (oldest)' },
  { value: 'position-asc', label: 'Position A–Z' },
  { value: 'position-desc', label: 'Position Z–A' },
] as const;

export type CareerStepSort = (typeof careerStepSortOptions)[number]['value'];

export const defaultCareerStepSort: CareerStepSort = 'startedOn-desc';

export function isCareerStepSort(value: string): value is CareerStepSort {
  return careerStepSortOptions.some((option) => option.value === value);
}

function careerStepSearchHaystack(step: CareerStep): string {
  return [
    step.id,
    step.position,
    step.startedOn,
    step.endedOn ?? '',
    step.description,
    step.technologies,
    step.createdAt,
    formatCareerDateRange(step.startedOn, step.endedOn),
  ]
    .join('\n')
    .toLowerCase();
}

export function careerStepMatchesQuery(
  step: CareerStep,
  query: string,
): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;

  return careerStepSearchHaystack(step).includes(needle);
}

function compareByStartDate(
  a: CareerStep,
  b: CareerStep,
  direction: 'asc' | 'desc',
) {
  const started = a.startedOn.localeCompare(b.startedOn);
  if (started !== 0) return direction === 'asc' ? started : -started;

  const created = b.createdAt.localeCompare(a.createdAt);
  if (created !== 0) return created;

  return a.id.localeCompare(b.id);
}

function compareByPosition(
  a: CareerStep,
  b: CareerStep,
  direction: 'asc' | 'desc',
) {
  const position = a.position.localeCompare(b.position, undefined, {
    sensitivity: 'base',
  });
  if (position !== 0) return direction === 'asc' ? position : -position;

  return compareByStartDate(a, b, 'desc');
}

function compareCareerSteps(
  a: CareerStep,
  b: CareerStep,
  sort: CareerStepSort,
) {
  switch (sort) {
    case 'startedOn-asc':
      return compareByStartDate(a, b, 'asc');
    case 'startedOn-desc':
      return compareByStartDate(a, b, 'desc');
    case 'position-asc':
      return compareByPosition(a, b, 'asc');
    case 'position-desc':
      return compareByPosition(a, b, 'desc');
  }
}

export function sortCareerSteps(
  steps: readonly CareerStep[],
  sort: CareerStepSort,
): CareerStep[] {
  return [...steps].sort((a, b) => compareCareerSteps(a, b, sort));
}

export function filterAndSortCareerSteps(
  steps: readonly CareerStep[],
  query: string,
  sort: CareerStepSort,
): CareerStep[] {
  return sortCareerSteps(
    steps.filter((step) => careerStepMatchesQuery(step, query)),
    sort,
  );
}
