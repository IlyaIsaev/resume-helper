import * as v from 'valibot'
import { expect, test } from 'vitest'
import { signInSchema } from '../schema'

test('accepts a valid email and password', () => {
  const result = v.safeParse(signInSchema, {
    email: 'user@example.com',
    password: 'password1',
  })

  expect(result.success).toBe(true)
})

test('rejects an invalid email', () => {
  const result = v.safeParse(signInSchema, {
    email: 'not-an-email',
    password: 'password1',
  })

  expect(result.success).toBe(false)
})

test('rejects a short password', () => {
  const result = v.safeParse(signInSchema, {
    email: 'user@example.com',
    password: 'short',
  })

  expect(result.success).toBe(false)
})
