import * as v from 'valibot';

import type { CareerStep } from '@/shared/api';

export type { CareerStep };

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
);

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
});

export type CareerStepValues = v.InferOutput<typeof careerStepSchema>;

export const EMPTY_CAREER_STEP_VALUES: CareerStepValues = {
  position: '',
  dates: { from: '', to: '' },
  description: '',
  technologies: '',
};

export const updateCareerStepSchema = v.intersect([
  v.object({
    id: v.pipe(v.string(), v.minLength(1, 'Id is required')),
  }),
  careerStepSchema,
]);

export const deleteCareerStepSchema = v.object({
  id: v.pipe(v.string(), v.minLength(1, 'Id is required')),
});

export const careerStepToFormValues = (step: CareerStep): CareerStepValues => ({
  position: step.position,
  dates: { from: step.startedOn, to: step.endedOn ?? '' },
  description: step.description,
  technologies: step.technologies,
});
