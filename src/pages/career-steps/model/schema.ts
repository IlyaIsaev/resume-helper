import * as v from 'valibot';

import { careerStepSchema } from '@/features/create-career-step';

export const updateCareerStepSchema = v.intersect([
  v.object({
    id: v.pipe(v.string(), v.minLength(1, 'Id is required')),
  }),
  careerStepSchema,
]);
