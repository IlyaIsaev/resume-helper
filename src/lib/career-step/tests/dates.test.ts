import { expect, test } from 'vitest'
import {
  formatCareerDateRange,
  formatIsoDate,
  parseIsoDate,
} from '../dates'

test('parses a valid ISO date as a local calendar day', () => {
  const date = parseIsoDate('2026-09-08')

  expect(date).toEqual(new Date(2026, 8, 8))
})

test('rejects an invalid ISO date', () => {
  expect(parseIsoDate('2026-13-01')).toBeUndefined()
  expect(parseIsoDate('not-a-date')).toBeUndefined()
  expect(parseIsoDate('')).toBeUndefined()
})

test('formats a local date as YYYY-MM-DD without UTC shift', () => {
  expect(formatIsoDate(new Date(2026, 8, 8))).toBe('2026-09-08')
})

test('formats an open range as Present', () => {
  expect(formatCareerDateRange('2026-09-08', null)).toMatch(
    /8 Sept? 2026 – Present/,
  )
  expect(formatCareerDateRange('2026-09-08', '')).toMatch(
    /8 Sept? 2026 – Present/,
  )
})

test('formats a closed range', () => {
  expect(formatCareerDateRange('2026-09-08', '2026-12-01')).toMatch(
    /8 Sept? 2026 – 1 Dec 2026/,
  )
})
