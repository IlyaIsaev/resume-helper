import { reatomRoute, urlAtom } from '@reatom/core';
import { lazy, Suspense } from 'react';
import { loadEditCareerStep } from '@/pages/career-steps/edit';
import { careerSteps, loadCareerSteps } from '@/pages/career-steps/index';
import { loadSignIn } from '@/pages/sign-in';
import { session } from '@/shared/auth';
import {
  CAREER_STEPS_PATH,
  HOME_PATH,
  PROFILE_PATH,
  SIGN_IN_PATH,
  SIGN_UP_PATH,
} from '@/shared/config';
import { PageFallback } from '@/shared/ui';

import { Header } from './header';

const CareerStepsLayout = lazy(() =>
  import('@/pages/career-steps/index').then((module) => ({
    default: module.CareerStepsLayout,
  })),
);

const EditCareerStepPage = lazy(() =>
  import('@/pages/career-steps/edit').then((module) => ({
    default: module.EditCareerStepPage,
  })),
);

const SignInPage = lazy(() => import('@/pages/sign-in'));

const SignUpPage = lazy(() => import('@/pages/sign-up'));

const ProfilePage = lazy(() => import('@/pages/profile'));

export const rootRoute = reatomRoute(
  {
    layout: true,
    render({ outlet }) {
      return <Suspense fallback={<PageFallback />}>{outlet()}</Suspense>;
    },
  },
  'rootRoute',
);

export const protectedRoute = rootRoute.reatomRoute(
  {
    layout: true,
    params() {
      const { pathname } = urlAtom();
      const onAuthPage = pathname === SIGN_IN_PATH || pathname === SIGN_UP_PATH;

      if (!session.ready() && onAuthPage) return null;

      if (!session.ready() && !onAuthPage) return {};

      const user = session.data()?.user;

      if (!user && !onAuthPage) {
        signInRoute.go(undefined, true);

        return null;
      }

      if (!user && onAuthPage) return null;

      if (onAuthPage) {
        urlAtom.go(CAREER_STEPS_PATH, true);

        return null;
      }

      if (pathname === HOME_PATH) {
        urlAtom.go(CAREER_STEPS_PATH, true);

        return null;
      }

      return {};
    },
    render(self) {
      if (!session.ready()) return <PageFallback key="protectedRoute" />;

      return (
        <div key="protectedRoute" className="flex min-h-0 flex-1 flex-col">
          <Header />
          {self.outlet()}
        </div>
      );
    },
  },
  'protectedRoute',
);

export const careerStepsRoute = protectedRoute.reatomRoute(
  {
    layout: true,
    params() {
      const { pathname } = urlAtom();
      if (pathname === PROFILE_PATH) return null;
      if (
        pathname !== CAREER_STEPS_PATH &&
        !pathname.startsWith(`${CAREER_STEPS_PATH}/`)
      ) {
        return null;
      }

      return {};
    },
    async loader() {
      if (!session.data()?.user) return;

      await loadCareerSteps();
    },
    render(self) {
      self.loader.ready();

      if (careerSteps() === null)
        return <PageFallback key="careerStepsRoute" />;

      const child = self.outlet();

      return (
        <CareerStepsLayout key="careerStepsRoute">
          <Suspense fallback={<PageFallback />}>
            {child.length > 0 ? child : null}
          </Suspense>
        </CareerStepsLayout>
      );
    },
  },
  'careerStepsRoute',
);

export const editCareerStepRoute = careerStepsRoute.reatomRoute(
  {
    path: 'career-steps/:stepId/edit',
    params({ stepId }) {
      if (!session.ready() || !session.data()?.user) return null;

      return { stepId };
    },
    async loader({ stepId }) {
      const step = await loadEditCareerStep(stepId);
      if (!step) {
        urlAtom.go(CAREER_STEPS_PATH, true);
      }
    },
    render(self) {
      if (!self.loader.ready())
        return <PageFallback key="editCareerStepRoute" />;

      return <EditCareerStepPage key="editCareerStepRoute" />;
    },
  },
  'editCareerStepRoute',
);

export const profileRoute = protectedRoute.reatomRoute(
  {
    path: PROFILE_PATH.slice(1),
    render() {
      return <ProfilePage key="profileRoute" />;
    },
  },
  'profileRoute',
);

export const signInRoute = rootRoute.reatomRoute(
  {
    path: SIGN_IN_PATH.slice(1),
    params() {
      if (!session.ready()) return {};

      if (session.data()?.user) return null;

      return {};
    },
    async loader() {
      if (session.data()?.user) return;

      await loadSignIn();
    },
    render(self) {
      if (!self.loader.ready()) return <PageFallback key="signInRoute" />;

      return <SignInPage key="signInRoute" />;
    },
  },
  'signInRoute',
);

export const signUpRoute = rootRoute.reatomRoute(
  {
    path: SIGN_UP_PATH.slice(1),
    params() {
      if (!session.ready()) return {};

      if (session.data()?.user) return null;

      return {};
    },
    render() {
      return <SignUpPage key="signUpRoute" />;
    },
  },
  'signUpRoute',
);

export const APP_ROUTE = {
  root: rootRoute,
  protected: protectedRoute,
  careerSteps: careerStepsRoute,
  editCareerStep: editCareerStepRoute,
  profile: profileRoute,
  signIn: signInRoute,
  signUp: signUpRoute,
} as const;
