import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import {
  careerStepCollection,
  EditCareerStepDialog,
  EditCareerStepDialogSkeleton,
} from '@/modules/career-step';

export const Route = createFileRoute(
  '/_protected/_career/career-steps/$stepId/edit',
)({
  loader: async ({ context, params }) => {
    const collection = context.dbClient.collection(careerStepCollection);
    await collection.preload();
    const step = collection.get(params.stepId);

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
