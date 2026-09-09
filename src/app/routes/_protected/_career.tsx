import { createFileRoute, Outlet } from '@tanstack/react-router';
import {
  careerStepListInfiniteQueryOptions,
  defaultCareerStepSort,
} from '@/entities/career-step';
import { CareerStepsPage } from '@/pages/career-steps';

export const Route = createFileRoute('/_protected/_career')({
  loader: ({ context }) =>
    context.queryClient.ensureInfiniteQueryData(
      careerStepListInfiniteQueryOptions('', defaultCareerStepSort),
    ),
  component: CareerLayout,
});

function CareerLayout() {
  return (
    <CareerStepsPage>
      <Outlet />
    </CareerStepsPage>
  );
}
