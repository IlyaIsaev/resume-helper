import * as v from 'valibot'

export const careerStepDatesSchema = v.pipe(
  v.object({
    from: v.pipe(
      v.string(),
      v.minLength(1, 'Start date is required'),
      v.isoDate('Start date is invalid'),
    ),
    to: v.union([
      v.literal(''),
      v.pipe(v.string(), v.isoDate('End date is invalid')),
    ]),
  }),
  v.check(
    (range) => !range.to || range.to >= range.from,
    'End date must be on or after the start date',
  ),
)

export const careerStepSchema = v.object({
  position: v.pipe(
    v.string(),
    v.trim(),
    v.minLength(1, 'Position is required'),
    v.maxLength(120, 'Position is too long'),
  ),
  dates: careerStepDatesSchema,
  description: v.pipe(
    v.string(),
    v.trim(),
    v.minLength(1, 'Description is required'),
    v.maxLength(4000, 'Description is too long'),
  ),
  technologies: v.pipe(
    v.string(),
    v.trim(),
    v.minLength(1, 'Technologies are required'),
    v.maxLength(2000, 'Technologies is too long'),
  ),
})

export type CareerStepValues = v.InferOutput<typeof careerStepSchema>
