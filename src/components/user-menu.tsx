import { Link, useNavigate, useRouter } from '@tanstack/react-router'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { authClient } from '@/lib/auth/client'

type UserMenuUser = {
  email: string
  name: string
  image?: string | null
}

function userInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
  }
  return (parts[0]?.slice(0, 2) || name.slice(0, 2) || '?').toUpperCase()
}

export function UserMenu({ user }: { user: UserMenuUser }) {
  const navigate = useNavigate()
  const router = useRouter()

  async function signOut() {
    await authClient.signOut()
    await router.invalidate()
    await navigate({ to: '/sign-in' })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Open account menu"
        >
          <Avatar>
            {user.image ? <AvatarImage src={user.image} alt="" /> : null}
            <AvatarFallback>{userInitials(user.name)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link to="/profile">Profile</Link>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => void signOut()}>
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
