import { expect, test } from 'vitest';

import { careerStepEditPath, careerStepIdFromEditPath } from '../routes';

test('should read the step id from an edit path', () => {
  expect(careerStepIdFromEditPath(careerStepEditPath('step-1'))).toBe('step-1');
});

test('should reject paths that are not a career step edit url', () => {
  expect(careerStepIdFromEditPath('/career-steps')).toBeNull();
  expect(careerStepIdFromEditPath('/career-steps/step-1')).toBeNull();
  expect(
    careerStepIdFromEditPath('/career-steps/step-1/edit/extra'),
  ).toBeNull();
  expect(careerStepIdFromEditPath('/career-steps/a/b/edit')).toBeNull();
  expect(careerStepIdFromEditPath('/career-steps//edit')).toBeNull();
  expect(careerStepIdFromEditPath('/profile')).toBeNull();
});
