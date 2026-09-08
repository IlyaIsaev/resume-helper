import { createFileRoute } from '@tanstack/react-router';
import { ProfileSettings } from '@/modules/auth';

export const Route = createFileRoute('/_protected/profile')({
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = Route.useRouteContext();
  return <ProfileSettings email={user.email} />;
}
