import { Link } from '@tanstack/react-router';
import { ThemeToggle } from './theme-toggle';
import { UserMenu } from './user-menu';

type HeaderUser = {
  email: string;
  name: string;
  image?: string | null;
};

export function SiteHeader({
  user,
  onSignOut,
}: {
  user: HeaderUser;
  onSignOut: () => void | Promise<void>;
}) {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-border px-4 py-3">
      <Link
        to="/"
        className="text-xs tracking-[2px] uppercase text-muted-foreground"
      >
        Resume Helper
      </Link>
      <div className="flex items-center gap-2">
        <UserMenu user={user} onSignOut={onSignOut} />
        <ThemeToggle />
      </div>
    </header>
  );
}
