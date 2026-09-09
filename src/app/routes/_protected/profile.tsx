import { createFileRoute } from '@tanstack/react-router';
import { ProfilePage } from '@/pages/profile';

export const Route = createFileRoute('/_protected/profile')({
  component: ProfileRoute,
});

function ProfileRoute() {
  const { user } = Route.useRouteContext();
  return <ProfilePage email={user.email} />;
}
