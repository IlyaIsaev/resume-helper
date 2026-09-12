import type { ReactNode } from 'react';

import { CreateCareerStep } from '@/features/create-career-step';

import { CareerStepList } from './career-step-list';

type CareerStepsLayoutProps = {
  children?: ReactNode;
};

export function CareerStepsLayout({ children }: CareerStepsLayoutProps) {
  return (
    <div className="mx-auto flex min-h-0 w-full max-w-2xl flex-1 flex-col px-4 pt-10 pb-4">
      <section className="flex min-h-0 flex-1 flex-col gap-4 pb-4">
        <CareerStepList />
      </section>
      <div className="relative z-10 shrink-0 bg-background pt-4">
        <CreateCareerStep />
      </div>
      {children}
    </div>
  );
}
