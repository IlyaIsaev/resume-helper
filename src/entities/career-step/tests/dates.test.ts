import { expect, test } from 'vitest';
import {
  careerStepCalendarBounds,
  formatCareerDate,
  formatCareerDateRange,
  formatIsoDate,
  parseIsoDate,
  parseTypedDate,
} from '../lib/dates';

test('parses a valid ISO date as a local calendar day', () => {
  const date = parseIsoDate('2026-09-08');

  expect(date).toEqual(new Date(2026, 8, 8));
});

test('rejects an invalid ISO date', () => {
  expect(parseIsoDate('2026-13-01')).toBeUndefined();
  expect(parseIsoDate('not-a-date')).toBeUndefined();
  expect(parseIsoDate('')).toBeUndefined();
});

test('formats a local date as YYYY-MM-DD without UTC shift', () => {
  expect(formatIsoDate(new Date(2026, 8, 8))).toBe('2026-09-08');
});

test('formats an open range as Present', () => {
  expect(formatCareerDateRange({ from: '2026-09-08', to: null })).toMatch(
    /8 Sept? 2026 – Present/,
  );
  expect(formatCareerDateRange({ from: '2026-09-08', to: '' })).toMatch(
    /8 Sept? 2026 – Present/,
  );
});

test('formats a closed range', () => {
  expect(
    formatCareerDateRange({ from: '2026-09-08', to: '2026-12-01' }),
  ).toMatch(/8 Sept? 2026 – 1 Dec 2026/);
});

test('formats a single ISO date for the typed input', () => {
  expect(formatCareerDate('2026-09-08')).toMatch(/^8 Sept? 2026$/);
  expect(formatCareerDate('')).toBe('');
  expect(formatCareerDate('not-a-date')).toBe('');
});

test('parses a typed ISO date as a local calendar day', () => {
  expect(parseTypedDate('2026-09-08')).toEqual(new Date(2026, 8, 8));
  expect(parseTypedDate('  2026-09-08  ')).toEqual(new Date(2026, 8, 8));
});

test('parses the display date the formatter produces', () => {
  const formatted = formatCareerDate('2026-09-08');

  expect(parseTypedDate(formatted)).toEqual(new Date(2026, 8, 8));
});

test('parses long month names typed into the field', () => {
  expect(parseTypedDate('8 September 2026')).toEqual(new Date(2026, 8, 8));
});

test('rejects incomplete or impossible typed dates', () => {
  expect(parseTypedDate('')).toBeUndefined();
  expect(parseTypedDate('8 Sept')).toBeUndefined();
  expect(parseTypedDate('Sept 2026')).toBeUndefined();
  expect(parseTypedDate('31 Feb 2026')).toBeUndefined();
});

test('bounds the career calendar from 1970 through next year', () => {
  const now = new Date(2026, 8, 9);
  const bounds = careerStepCalendarBounds(now);

  expect(bounds.startMonth).toEqual(new Date(1970, 0, 1));
  expect(bounds.endMonth).toEqual(new Date(2027, 11, 1));
});
