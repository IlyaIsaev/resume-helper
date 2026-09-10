import * as v from 'valibot';
import { expect, test } from 'vitest';

import { signInSchema } from '../model/sign-in';

test('should accept the payload when email and password are valid', () => {
  const result = v.safeParse(signInSchema, {
    email: 'user@example.com',
    password: 'password1',
  });

  expect(result.success).toBe(true);
});

test('should reject the payload when the email is invalid', () => {
  const result = v.safeParse(signInSchema, {
    email: 'not-an-email',
    password: 'password1',
  });

  expect(result.success).toBe(false);
});

test('should reject the payload when the password is too short', () => {
  const result = v.safeParse(signInSchema, {
    email: 'user@example.com',
    password: 'short',
  });

  expect(result.success).toBe(false);
});
