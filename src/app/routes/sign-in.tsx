import { createFileRoute, redirect } from '@tanstack/react-router';
import { SignInForm } from '@/pages/auth';

type SignInSearch = {
  redirect?: string;
};

export const Route = createFileRoute('/sign-in')({
  validateSearch: (search: Record<string, unknown>): SignInSearch => ({
    redirect: typeof search.redirect === 'string' ? search.redirect : undefined,
  }),
  beforeLoad: async ({ context, search }) => {
    if (context.session) {
      throw redirect({ href: search.redirect || '/' });
    }
  },
  component: SignInRoute,
});

function SignInRoute() {
  const { redirect: redirectTo } = Route.useSearch();
  return <SignInForm redirectTo={redirectTo} />;
}
