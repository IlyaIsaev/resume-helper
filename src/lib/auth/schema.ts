import * as v from 'valibot'

export const signInSchema = v.object({
  email: v.pipe(v.string(), v.trim(), v.email('Enter a valid email')),
  password: v.pipe(
    v.string(),
    v.minLength(8, 'Password must be at least 8 characters'),
  ),
})

export const signUpSchema = v.object({
  name: v.pipe(
    v.string(),
    v.trim(),
    v.minLength(1, 'Name is required'),
    v.maxLength(80, 'Name is too long'),
  ),
  email: v.pipe(v.string(), v.trim(), v.email('Enter a valid email')),
  password: v.pipe(
    v.string(),
    v.minLength(8, 'Password must be at least 8 characters'),
    v.maxLength(128, 'Password is too long'),
  ),
})

export type SignInValues = v.InferOutput<typeof signInSchema>
export type SignUpValues = v.InferOutput<typeof signUpSchema>
