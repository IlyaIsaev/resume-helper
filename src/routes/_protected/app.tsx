import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_protected/app')({
  beforeLoad: () => {
    throw redirect({ to: '/' });
  },
  component: () => null,
});
