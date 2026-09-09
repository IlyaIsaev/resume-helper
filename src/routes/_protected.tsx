import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
  useNavigate,
  useRouter,
} from '@tanstack/react-router';
import { ThemeToggle, UserMenu } from '@/common/layout';
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
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex items-center justify-between gap-4 border-b border-border px-4 py-3">
        <Link
          to="/"
          className="text-xs tracking-[2px] uppercase text-muted-foreground"
        >
          Resume Helper
        </Link>
        <div className="flex items-center gap-2">
          <UserMenu user={user} onSignOut={signOut} />
          <ThemeToggle />
        </div>
      </header>
      <div className="flex min-h-0 flex-1 flex-col">
        <Outlet />
      </div>
    </div>
  );
}
