import {
  createFileRoute,
  Outlet,
  redirect,
  useNavigate,
  useRouter,
} from '@tanstack/react-router';
import { SiteHeader } from '@/common/layout';
import { authClient } from '@/modules/auth';

export const Route = createFileRoute('/_protected')({
  beforeLoad: async ({ context, location }) => {
    if (!context.session) {
      throw redirect({
        to: '/sign-in',
        search: { redirect: location.href },
      });
    }

    return { user: context.session.user };
  },
  component: ProtectedLayout,
});

function ProtectedLayout() {
  const { user, queryClient } = Route.useRouteContext();
  const navigate = useNavigate();
  const router = useRouter();

  async function signOut() {
    await authClient.signOut();
    queryClient.clear();
    await router.invalidate();
    await navigate({ to: '/sign-in' });
  }

  return (
    <>
      <SiteHeader user={user} onSignOut={signOut} />
      <Outlet />
    </>
  );
}
