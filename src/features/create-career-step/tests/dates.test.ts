import { expect, test } from 'vitest';
import {
  careerStepCalendarBounds,
  formatCareerDate,
  formatCareerDateRange,
  formatIsoDate,
  parseIsoDate,
  parseTypedDate,
} from '../lib/dates';

test('should parse a local calendar day when the input is a valid ISO date', () => {
  const date = parseIsoDate('2026-09-08');

  expect(date).toEqual(new Date(2026, 8, 8));
});

test('should return undefined when the ISO date is invalid', () => {
  expect(parseIsoDate('2026-13-01')).toBeUndefined();
  expect(parseIsoDate('not-a-date')).toBeUndefined();
  expect(parseIsoDate('')).toBeUndefined();
});

test('should format as YYYY-MM-DD when the date is a local calendar day', () => {
  expect(formatIsoDate(new Date(2026, 8, 8))).toBe('2026-09-08');
});

test('should format the range as Present when the end date is open', () => {
  expect(formatCareerDateRange({ from: '2026-09-08', to: null })).toMatch(
    /8 Sept? 2026 – Present/,
  );
  expect(formatCareerDateRange({ from: '2026-09-08', to: '' })).toMatch(
    /8 Sept? 2026 – Present/,
  );
});

test('should format both ends when the date range is closed', () => {
  expect(
    formatCareerDateRange({ from: '2026-09-08', to: '2026-12-01' }),
  ).toMatch(/8 Sept? 2026 – 1 Dec 2026/);
});

test('should format a display date when the input is a single ISO date', () => {
  expect(formatCareerDate('2026-09-08')).toMatch(/^8 Sept? 2026$/);
  expect(formatCareerDate('')).toBe('');
  expect(formatCareerDate('not-a-date')).toBe('');
});

test('should parse a local calendar day when the typed value is ISO', () => {
  expect(parseTypedDate('2026-09-08')).toEqual(new Date(2026, 8, 8));
  expect(parseTypedDate('  2026-09-08  ')).toEqual(new Date(2026, 8, 8));
});

test('should parse the same local day when the typed value is the formatted display date', () => {
  const formatted = formatCareerDate('2026-09-08');

  expect(parseTypedDate(formatted)).toEqual(new Date(2026, 8, 8));
});

test('should parse a local calendar day when the typed month name is long', () => {
  expect(parseTypedDate('8 September 2026')).toEqual(new Date(2026, 8, 8));
});

test('should return undefined when the typed date is incomplete or impossible', () => {
  expect(parseTypedDate('')).toBeUndefined();
  expect(parseTypedDate('8 Sept')).toBeUndefined();
  expect(parseTypedDate('Sept 2026')).toBeUndefined();
  expect(parseTypedDate('31 Feb 2026')).toBeUndefined();
});

test('should span 1970 through next year when computing calendar bounds', () => {
  const now = new Date(2026, 8, 9);
  const bounds = careerStepCalendarBounds(now);

  expect(bounds.startMonth).toEqual(new Date(1970, 0, 1));
  expect(bounds.endMonth).toEqual(new Date(2027, 11, 1));
});
