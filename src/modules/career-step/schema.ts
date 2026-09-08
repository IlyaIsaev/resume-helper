import * as v from 'valibot';

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

export type CareerStep = {
  id: string;
  position: string;
  startedOn: string;
  endedOn: string | null;
  description: string;
  technologies: string;
  createdAt: string;
};

export function toCareerStep(step: {
  id: string;
  position: string;
  startedOn: string;
  endedOn: string | null;
  description: string;
  technologies: string;
  createdAt: Date | string;
}): CareerStep {
  return {
    id: step.id,
    position: step.position,
    startedOn: step.startedOn,
    endedOn: step.endedOn,
    description: step.description,
    technologies: step.technologies,
    createdAt:
      step.createdAt instanceof Date
        ? step.createdAt.toISOString()
        : step.createdAt,
  };
}

export function careerStepFromFormValues(
  id: string,
  value: CareerStepValues,
  createdAt: string,
): CareerStep {
  return {
    id,
    position: value.position,
    startedOn: value.dates.from,
    endedOn: value.dates.to || null,
    description: value.description,
    technologies: value.technologies,
    createdAt,
  };
}

export const updateCareerStepSchema = v.intersect([
  v.object({
    id: v.pipe(v.string(), v.minLength(1, 'Id is required')),
  }),
  careerStepSchema,
]);

export type UpdateCareerStepValues = v.InferOutput<
  typeof updateCareerStepSchema
>;

export const deleteCareerStepSchema = v.object({
  id: v.pipe(v.string(), v.minLength(1, 'Id is required')),
});

export type DeleteCareerStepValues = v.InferOutput<
  typeof deleteCareerStepSchema
>;

export const emptyCareerStepValues: CareerStepValues = {
  position: '',
  dates: { from: '', to: '' },
  description: '',
  technologies: '',
};

export function careerStepToFormValues(step: {
  position: string;
  startedOn: string;
  endedOn: string | null;
  description: string;
  technologies: string;
}): CareerStepValues {
  return {
    position: step.position,
    dates: { from: step.startedOn, to: step.endedOn ?? '' },
    description: step.description,
    technologies: step.technologies,
  };
}
