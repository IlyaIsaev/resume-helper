import { createFileRoute, Outlet } from '@tanstack/react-router';
import { Suspense } from 'react';
import {
  AddCareerStepDialog,
  CareerStepList,
  careerStepCollection,
} from '@/modules/career-step';

export const Route = createFileRoute('/_protected/_career')({
  loader: ({ context }) =>
    context.dbClient.collection(careerStepCollection).preload(),
  component: CareerLayout,
});

function CareerLayout() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 pt-10 pb-4">
      <section className="flex flex-1 flex-col gap-4 pb-4">
        <h1 className="text-xs text-muted-foreground tracking-[1.5px] uppercase font-normal">
          Career
        </h1>
        <Suspense fallback={null}>
          <CareerStepList />
        </Suspense>
      </section>
      <div className="sticky bottom-4 z-10 mt-auto bg-background pt-4">
        <AddCareerStepDialog />
      </div>
      <Outlet />
    </div>
  );
}
