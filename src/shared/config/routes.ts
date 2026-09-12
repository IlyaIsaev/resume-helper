import { urlAtom } from '@reatom/core';

export const HOME_PATH = '/' as const;

export const SIGN_IN_PATH = '/sign-in' as const;

export const SIGN_UP_PATH = '/sign-up' as const;

export const PROFILE_PATH = '/profile' as const;

export const CAREER_STEPS_PATH = '/career-steps' as const;

export const careerStepEditPath = (
  stepId: string,
): `${typeof CAREER_STEPS_PATH}/${string}/edit` =>
  `${CAREER_STEPS_PATH}/${stepId}/edit`;

const CAREER_STEP_EDIT_PATH_PREFIX = `${CAREER_STEPS_PATH}/`;
const CAREER_STEP_EDIT_PATH_SUFFIX = '/edit';

export const careerStepIdFromEditPath = (pathname: string): string | null => {
  if (
    !pathname.startsWith(CAREER_STEP_EDIT_PATH_PREFIX) ||
    !pathname.endsWith(CAREER_STEP_EDIT_PATH_SUFFIX)
  ) {
    return null;
  }

  const stepId = pathname.slice(
    CAREER_STEP_EDIT_PATH_PREFIX.length,
    pathname.length - CAREER_STEP_EDIT_PATH_SUFFIX.length,
  );

  if (stepId.length === 0 || stepId.includes('/')) return null;

  return stepId;
};

export const pathWithSearch = (path: string): string =>
  `${path}${urlAtom().search}`;
