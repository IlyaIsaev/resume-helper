import { reatomRoute, urlAtom, wrap } from '@reatom/core';
import { lazy, Suspense } from 'react';

import {
  careerSteps,
  careerStepsQuery,
  careerStepsSort,
  initCareerStep,
  initCareerSteps,
  resetCareerSteps,
} from '@/entities/career-step';
import { initUpdateCareerStepForm } from '@/features/career-steps/update-career-step';
import { initSignIn } from '@/pages/sign-in/index/model/sign-in';
import { clientApi } from '@/shared/api';
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

const CareerStepsLayout = lazy(
  () => import('@/pages/career-steps/layout/ui/layout'),
);

const CareerStepsPage = lazy(
  () => import('@/pages/career-steps/index/ui/career-steps-page'),
);

const EditCareerStepPage = lazy(
  () => import('@/pages/career-steps/edit/index/ui/edit-career-step-page'),
);

const SignInPage = lazy(() => import('@/pages/sign-in/index/ui/sign-in-page'));

const SignUpPage = lazy(() => import('@/pages/sign-up/index/ui/sign-up-page'));

const ProfilePage = lazy(() => import('@/pages/profile/index/ui/profile-page'));

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

      if (!user && careerSteps() !== null) {
        resetCareerSteps();
      }

      if (!user && !onAuthPage) {
        signInRoute.go(undefined, true);

        return null;
      }

      if (!user && onAuthPage) return null;

      if (onAuthPage) {
        urlAtom.go(HOME_PATH, true);

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
        pathname !== HOME_PATH &&
        !pathname.startsWith(`${CAREER_STEPS_PATH}/`)
      ) {
        return null;
      }

      return {};
    },
    async loader() {
      if (!session.data()?.user) return;

      const page = await wrap(
        clientApi.loadCareerSteps({
          query: careerStepsQuery(),
          sort: careerStepsSort(),
        }),
      );

      initCareerSteps(page);
    },
    render(self) {
      self.loader.ready();

      if (careerSteps() === null)
        return <PageFallback key="careerStepsRoute" />;

      const child = self.outlet();

      return (
        <CareerStepsLayout key="careerStepsRoute">
          <Suspense fallback={<PageFallback />}>
            {child.length > 0 ? child : <CareerStepsPage />}
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
      const step = await wrap(clientApi.loadCareerStep(stepId));
      if (!step) {
        careerStepsRoute.go(undefined, true);

        return;
      }

      initCareerStep(step);
      initUpdateCareerStepForm();
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
    async loader() {
      const user = session.data()?.user;
      if (!user) return null;

      return {
        name: user.name,
        email: user.email,
      };
    },
    render(self) {
      if (!self.loader.ready()) return <PageFallback key="profileRoute" />;

      const user = self.loader.data();
      if (!user) return <PageFallback key="profileRoute" />;

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

      const credentials = await wrap(clientApi.loadDemoUser());

      initSignIn(credentials);
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
