import * as v from 'valibot';

export const deleteCareerStepSchema = v.object({
  id: v.pipe(v.string(), v.minLength(1, 'Id is required')),
});
