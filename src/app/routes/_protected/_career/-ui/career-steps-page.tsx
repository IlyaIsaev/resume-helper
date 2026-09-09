import type { ReactNode } from 'react';
import { AddCareerStepDialog } from './add-career-step-dialog';
import { CareerStepCreatedFocusProvider } from './career-step-created-focus';
import { CareerStepList } from './career-step-list';

export function CareerStepsPage({ children }: { children?: ReactNode }) {
  return (
    <CareerStepCreatedFocusProvider>
      <div className="mx-auto flex min-h-0 w-full max-w-2xl flex-1 flex-col px-4 pt-10 pb-4">
        <section className="flex min-h-0 flex-1 flex-col gap-4 pb-4">
          <CareerStepList />
        </section>
        <div className="relative z-10 shrink-0 bg-background pt-4">
          <AddCareerStepDialog />
        </div>
        {children}
      </div>
    </CareerStepCreatedFocusProvider>
  );
}
