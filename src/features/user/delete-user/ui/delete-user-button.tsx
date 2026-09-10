import { wrap } from '@reatom/core';
import { reatomComponent } from '@reatom/react';

import { Button } from '@/shared/ui';

import { openDeleteUser } from '../model/delete-user';

export const DeleteUserButton = reatomComponent(() => {
  return (
    <Button type="button" variant="destructive" onClick={wrap(openDeleteUser)}>
      Delete account
    </Button>
  );
}, 'DeleteUserButton');
