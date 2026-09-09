import { createFileRoute, redirect } from '@tanstack/react-router';
import { createDemoUserCredentials, SignUpForm } from '@/pages/auth';

export const Route = createFileRoute('/sign-up')({
  beforeLoad: async ({ context }) => {
    if (context.session) {
      throw redirect({ to: '/' });
    }
  },
  loader: () => createDemoUserCredentials(),
  component: SignUpRoute,
});

function SignUpRoute() {
  const demoUser = Route.useLoaderData();
  return <SignUpForm defaultValues={demoUser} />;
}
