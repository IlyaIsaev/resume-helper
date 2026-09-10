import { wrap } from '@reatom/core';
import { reatomComponent } from '@reatom/react';

import { signOut } from '@/shared/auth';
import { PROFILE_PATH } from '@/shared/config';
import {
  Avatar,
  AvatarFallback,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui';

import { user } from '../model/user';

export const UserMenu = reatomComponent(() => {
  const currentUser = user();
  if (!currentUser) return null;

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
            <AvatarFallback>{currentUser.initials}</AvatarFallback>
          </Avatar>
          <span className="sr-only">{currentUser.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <a href={PROFILE_PATH}>Profile</a>
        </DropdownMenuItem>
        <DropdownMenuItem disabled={!signOut.ready()} onClick={wrap(signOut)}>
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}, 'UserMenu');
