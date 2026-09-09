import {
  createFileRoute,
  Outlet,
  redirect,
  useNavigate,
  useRouter,
} from '@tanstack/react-router';
import { authClient } from '@/entities/session';
import { Header } from './-header/header';

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
    <div className="flex min-h-0 flex-1 flex-col">
      <Header user={user} onSignOut={signOut} />
      <div className="flex min-h-0 flex-1 flex-col">
        <Outlet />
      </div>
    </div>
  );
}
