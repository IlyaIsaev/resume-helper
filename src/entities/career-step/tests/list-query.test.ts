import * as v from 'valibot';
import { expect, test } from 'vitest';
import {
  CAREER_STEP_LIST_VISIBLE_LIMIT,
  CAREER_STEP_PAGE_SIZE,
  careerStepListInputSchema,
  careerStepListRangeExtractor,
  careerStepSearchNeedle,
  defaultCareerStepSort,
  isCareerStepSort,
  matchesPresentLabel,
} from '../model/list-query';

test('defaults to newest start date', () => {
  expect(defaultCareerStepSort).toBe('startedOn-desc');
  expect(isCareerStepSort('startedOn-desc')).toBe(true);
  expect(isCareerStepSort('startedOn-asc')).toBe(true);
  expect(isCareerStepSort('position-asc')).toBe(false);
  expect(isCareerStepSort('company-asc')).toBe(false);
});

test('trims and lowercases the search needle', () => {
  expect(careerStepSearchNeedle('  SENIOR ENGINEER  ')).toBe('senior engineer');
  expect(careerStepSearchNeedle('   ')).toBe('');
});

test('matches Present for ongoing roles', () => {
  expect(matchesPresentLabel('present')).toBe(true);
  expect(matchesPresentLabel('pre')).toBe(true);
  expect(matchesPresentLabel('SENT')).toBe(false);
  expect(matchesPresentLabel('')).toBe(false);
  expect(matchesPresentLabel('absent')).toBe(false);
});

test('page size is 20 and larger limits are clamped', () => {
  expect(CAREER_STEP_PAGE_SIZE).toBe(20);

  const parsed = v.parse(careerStepListInputSchema, { limit: 50 });
  expect(parsed.limit).toBe(20);

  const defaults = v.parse(careerStepListInputSchema, {});
  expect(defaults.query).toBe('');
  expect(defaults.sort).toBe('startedOn-desc');
  expect(defaults.limit).toBe(20);
  expect(defaults.cursor).toBeUndefined();
});

test('range extractor never returns more than 10 indexes', () => {
  expect(CAREER_STEP_LIST_VISIBLE_LIMIT).toBe(10);
  expect(
    careerStepListRangeExtractor({
      startIndex: 0,
      endIndex: 20,
      overscan: 0,
      count: 50,
    }),
  ).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  expect(
    careerStepListRangeExtractor({
      startIndex: 8,
      endIndex: 25,
      overscan: 0,
      count: 30,
    }),
  ).toEqual([8, 9, 10, 11, 12, 13, 14, 15, 16, 17]);
});

test('range extractor stays within the loaded count', () => {
  expect(
    careerStepListRangeExtractor({
      startIndex: 0,
      endIndex: 9,
      overscan: 0,
      count: 3,
    }),
  ).toEqual([0, 1, 2]);
  expect(
    careerStepListRangeExtractor({
      startIndex: 0,
      endIndex: 9,
      overscan: 0,
      count: 0,
    }),
  ).toEqual([]);
});
