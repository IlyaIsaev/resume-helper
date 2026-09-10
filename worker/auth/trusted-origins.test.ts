import { expect, test } from 'vitest';

import { isTrustedAuthOrigin, trustedOriginsFor } from './trusted-origins';

const LOCAL_BETTER_AUTH_URL = 'http://127.0.0.1:3100';
const PRODUCTION_BETTER_AUTH_URL = 'https://resume-helper.example';

test('should return every local origin when BETTER_AUTH_URL is a local origin', () => {
  expect(trustedOriginsFor(LOCAL_BETTER_AUTH_URL)).toEqual([
    'http://127.0.0.1:3000',
    'http://localhost:3000',
    'http://127.0.0.1:3100',
    'http://localhost:3100',
  ]);
});

test('should return only that origin when BETTER_AUTH_URL is not local', () => {
  expect(trustedOriginsFor(PRODUCTION_BETTER_AUTH_URL)).toEqual([
    'https://resume-helper.example',
  ]);
});

test('should trust another local origin when BETTER_AUTH_URL is local', () => {
  expect(
    isTrustedAuthOrigin({
      origin: 'http://localhost:3000',
      betterAuthUrl: LOCAL_BETTER_AUTH_URL,
    }),
  ).toBe(true);
});

test('should reject a foreign origin when BETTER_AUTH_URL is production', () => {
  expect(
    isTrustedAuthOrigin({
      origin: 'https://evil.example',
      betterAuthUrl: PRODUCTION_BETTER_AUTH_URL,
    }),
  ).toBe(false);
});
