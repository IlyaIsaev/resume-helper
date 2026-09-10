import { expect, test } from 'vitest';

import { datePartAfterType } from '../model/career-date-part';

test('clears the ISO value when the typed draft is empty', () => {
  expect(datePartAfterType('')).toEqual({
    type: 'empty',
    draft: '',
  });
  expect(datePartAfterType('   ')).toEqual({
    type: 'empty',
    draft: '   ',
  });
});

test('keeps the draft and leaves ISO unchanged while the date is incomplete', () => {
  expect(datePartAfterType('8 Sept')).toEqual({
    type: 'invalid',
    draft: '8 Sept',
  });
});

test('commits an ISO date and month when the typed date parses', () => {
  expect(datePartAfterType('8 Sep 2026')).toEqual({
    type: 'valid',
    draft: '8 Sep 2026',
    iso: '2026-09-08',
    month: new Date(2026, 8, 8),
  });
  expect(datePartAfterType('2026-09-08')).toEqual({
    type: 'valid',
    draft: '2026-09-08',
    iso: '2026-09-08',
    month: new Date(2026, 8, 8),
  });
});
