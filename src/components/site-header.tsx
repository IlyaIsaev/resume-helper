import { Link } from '@tanstack/react-router'
import { ThemeToggle } from '@/components/theme-toggle'
import { UserMenu } from '@/components/user-menu'
import { Button } from '@/components/ui/button'

type HeaderUser = {
  email: string
  name: string
  image?: string | null
} | null

export function SiteHeader({ user }: { user: HeaderUser }) {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-border px-4 py-3">
      <Link
        to="/"
        className="text-xs tracking-[2px] uppercase text-muted-foreground"
      >
        Resume Helper
      </Link>
      <div className="flex items-center gap-2">
        {user ? (
          <UserMenu user={user} />
        ) : (
          <>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/sign-in">Sign in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/sign-up">Sign up</Link>
            </Button>
          </>
        )}
        <ThemeToggle />
      </div>
    </header>
  )
}
