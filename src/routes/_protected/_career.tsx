import { createFileRoute, Outlet } from '@tanstack/react-router';
import {
  AddCareerStepDialog,
  CareerStepList,
  listCareerSteps,
} from '@/modules/career-step';

export const Route = createFileRoute('/_protected/_career')({
  loader: () => listCareerSteps(),
  component: CareerLayout,
});

function CareerLayout() {
  const careerSteps = Route.useLoaderData();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 pt-10 pb-4">
      <section className="flex flex-1 flex-col gap-4 pb-4">
        <h1 className="text-xs text-muted-foreground tracking-[1.5px] uppercase font-normal">
          Career
        </h1>
        {careerSteps.length === 0 ? (
          <p className="text-sm text-muted-foreground">No career steps yet.</p>
        ) : (
          <CareerStepList steps={careerSteps} />
        )}
      </section>
      <div className="sticky bottom-4 z-10 mt-auto bg-background pt-4">
        <AddCareerStepDialog />
      </div>
      <Outlet />
    </div>
  );
}
