import type { Range } from '@tanstack/react-virtual';
import * as v from 'valibot';

export const careerStepSortOptions = [
  { value: 'startedOn-desc', label: 'Newest' },
  { value: 'startedOn-asc', label: 'Oldest' },
] as const;

export type CareerStepSort = (typeof careerStepSortOptions)[number]['value'];

export const defaultCareerStepSort: CareerStepSort = 'startedOn-desc';

export const CAREER_STEP_PAGE_SIZE = 20;
export const CAREER_STEP_LIST_VISIBLE_LIMIT = 10;
export const CAREER_STEP_LIST_ESTIMATE_SIZE = 220;
export const CAREER_STEP_LIST_GAP = 16;
export const CAREER_STEP_LIST_MAX_HEIGHT =
  CAREER_STEP_LIST_VISIBLE_LIMIT * CAREER_STEP_LIST_ESTIMATE_SIZE +
  (CAREER_STEP_LIST_VISIBLE_LIMIT - 1) * CAREER_STEP_LIST_GAP;

export const isCareerStepSort = (value: string): value is CareerStepSort =>
  careerStepSortOptions.some((option) => option.value === value);

export const careerStepSearchNeedle = (query: string): string =>
  query.trim().toLowerCase();

export const matchesPresentLabel = (needle: string): boolean =>
  needle.length > 0 && 'present'.includes(needle);

export const careerStepListCursorSchema = v.object({
  startedOn: v.pipe(v.string(), v.isoDate()),
  createdAt: v.pipe(v.string(), v.isoTimestamp()),
  id: v.pipe(v.string(), v.minLength(1, 'Id is required')),
});

export type CareerStepListCursor = v.InferOutput<
  typeof careerStepListCursorSchema
>;

const careerStepSortSchema = v.picklist([
  careerStepSortOptions[0].value,
  careerStepSortOptions[1].value,
]);

export const careerStepListInputSchema = v.object({
  query: v.optional(v.string(), ''),
  sort: v.optional(careerStepSortSchema, defaultCareerStepSort),
  cursor: v.optional(v.nullable(careerStepListCursorSchema)),
  limit: v.optional(
    v.pipe(
      v.number(),
      v.integer(),
      v.minValue(1),
      v.transform((value) => Math.min(value, CAREER_STEP_PAGE_SIZE)),
    ),
    CAREER_STEP_PAGE_SIZE,
  ),
});

export type CareerStepListInput = v.InferOutput<
  typeof careerStepListInputSchema
>;

export const careerStepListRangeExtractor = (range: Range): number[] => {
  if (range.count <= 0) return [];

  const start = Math.min(Math.max(range.startIndex, 0), range.count - 1);
  const end = Math.min(
    range.endIndex,
    start + CAREER_STEP_LIST_VISIBLE_LIMIT - 1,
    range.count - 1,
  );

  if (end < start) return [];

  const indexes: number[] = [];
  for (let index = start; index <= end; index += 1) {
    indexes.push(index);
  }
  return indexes;
};
