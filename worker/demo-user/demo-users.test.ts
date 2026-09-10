import { expect, test } from 'vitest';

import { isDemoUserEmail, isDemoUserExpired } from './demo-users';

test('should match the demo-user pattern when the email is generated', () => {
  expect(isDemoUserEmail('demo-user-abcd1234@demo.com')).toBe(true);

  expect(isDemoUserEmail('user@example.com')).toBe(false);

  expect(isDemoUserEmail('demo-user-abcd123@demo.com')).toBe(false);
});

test('should treat the demo user as expired when 24 hours have passed since create', () => {
  const createdAt = new Date('2026-09-06T12:00:00.000Z');

  expect(
    isDemoUserExpired({
      createdAt,
      now: new Date('2026-09-07T11:59:59.999Z'),
    }),
  ).toBe(false);

  expect(
    isDemoUserExpired({
      createdAt,
      now: new Date('2026-09-07T12:00:00.000Z'),
    }),
  ).toBe(true);
});
