import { createFileRoute, Outlet } from '@tanstack/react-router';
import {
  AddCareerStepDialog,
  CareerStepCreatedFocusProvider,
  CareerStepList,
  careerStepListInfiniteQueryOptions,
  defaultCareerStepSort,
} from '@/modules/career-step';

export const Route = createFileRoute('/_protected/_career')({
  loader: ({ context }) =>
    context.queryClient.ensureInfiniteQueryData(
      careerStepListInfiniteQueryOptions('', defaultCareerStepSort),
    ),
  component: CareerLayout,
});

function CareerLayout() {
  return (
    <CareerStepCreatedFocusProvider>
      <div className="mx-auto flex min-h-0 w-full max-w-2xl flex-1 flex-col px-4 pt-10 pb-4">
        <section className="flex min-h-0 flex-1 flex-col gap-4 pb-4">
          <CareerStepList />
        </section>
        <div className="relative z-10 shrink-0 bg-background pt-4">
          <AddCareerStepDialog />
        </div>
        <Outlet />
      </div>
    </CareerStepCreatedFocusProvider>
  );
}
