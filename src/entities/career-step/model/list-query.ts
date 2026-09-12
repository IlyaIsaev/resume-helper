import type { Range } from '@tanstack/react-virtual';
import { clamp, range } from 'es-toolkit';
import * as v from 'valibot';

export const CAREER_STEP_SORT_OPTIONS = [
  { value: 'startedOn-desc', label: 'Newest' },
  { value: 'startedOn-asc', label: 'Oldest' },
] as const satisfies ReadonlyArray<{
  readonly value: string;
  readonly label: string;
}>;

export type CareerStepSort = (typeof CAREER_STEP_SORT_OPTIONS)[number]['value'];

export const DEFAULT_CAREER_STEP_SORT: CareerStepSort = 'startedOn-desc';

export const CAREER_STEP_PAGE_SIZE = 20;
export const CAREER_STEP_LIST_VISIBLE_LIMIT = 10;
export const CAREER_STEP_LIST_ESTIMATE_SIZE = 220;
export const CAREER_STEP_LIST_GAP = 16;
export const CAREER_STEP_LIST_MAX_HEIGHT =
  CAREER_STEP_LIST_VISIBLE_LIMIT * CAREER_STEP_LIST_ESTIMATE_SIZE +
  (CAREER_STEP_LIST_VISIBLE_LIMIT - 1) * CAREER_STEP_LIST_GAP;

export const isCareerStepSort = (value: unknown): value is CareerStepSort =>
  typeof value === 'string' &&
  CAREER_STEP_SORT_OPTIONS.some((option) => option.value === value);

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
  CAREER_STEP_SORT_OPTIONS[0].value,
  CAREER_STEP_SORT_OPTIONS[1].value,
]);

export const careerStepListInputSchema = v.object({
  query: v.optional(v.string(), ''),
  sort: v.optional(careerStepSortSchema, DEFAULT_CAREER_STEP_SORT),
  cursor: v.optional(v.nullable(careerStepListCursorSchema)),
  limit: v.optional(
    v.pipe(
      v.number(),
      v.integer(),
      v.minValue(1),
      v.transform((value) => clamp(value, CAREER_STEP_PAGE_SIZE)),
    ),
    CAREER_STEP_PAGE_SIZE,
  ),
});

export type CareerStepListInput = v.InferOutput<
  typeof careerStepListInputSchema
>;

export const careerStepListRangeExtractor = ({
  startIndex,
  endIndex,
  count,
}: Range): Array<number> => {
  if (count <= 0) return [];

  const start = clamp(startIndex, 0, count - 1);
  const end = Math.min(
    endIndex,
    start + CAREER_STEP_LIST_VISIBLE_LIMIT - 1,
    count - 1,
  );

  if (end < start) return [];

  return range(start, end + 1);
};
