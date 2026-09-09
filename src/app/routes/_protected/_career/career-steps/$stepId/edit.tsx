import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { getCareerStep } from '@/entities/career-step';
import {
  EditCareerStepDialog,
  EditCareerStepDialogSkeleton,
} from '../../-ui/edit-career-step-dialog';

export const Route = createFileRoute(
  '/_protected/_career/career-steps/$stepId/edit',
)({
  loader: async ({ params }) => {
    const step = await getCareerStep({ data: params.stepId });

    if (!step) {
      throw redirect({ to: '/' });
    }

    return step;
  },
  pendingMs: 0,
  pendingComponent: EditCareerStepPending,
  component: EditCareerStepPage,
});

function EditCareerStepPending() {
  const navigate = useNavigate();

  return (
    <EditCareerStepDialogSkeleton onClose={() => void navigate({ to: '/' })} />
  );
}

function EditCareerStepPage() {
  const step = Route.useLoaderData();
  const navigate = useNavigate();

  return (
    <EditCareerStepDialog
      step={step}
      onClose={() => void navigate({ to: '/' })}
    />
  );
}
