export const HOME_PATH = '/' as const;

export const SIGN_IN_PATH = '/sign-in' as const;

export const SIGN_UP_PATH = '/sign-up' as const;

export const PROFILE_PATH = '/profile' as const;

export const CAREER_STEPS_PATH = '/career-steps' as const;

export const careerStepEditPath = (
  stepId: string,
): `${typeof CAREER_STEPS_PATH}/${string}/edit` =>
  `${CAREER_STEPS_PATH}/${stepId}/edit`;
