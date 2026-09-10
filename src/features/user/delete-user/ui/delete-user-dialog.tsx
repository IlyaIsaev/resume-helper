import { wrap } from '@reatom/core';
import { reatomComponent } from '@reatom/react';

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui';

import {
  closeDeleteUserDialog,
  deleteUser,
  deleteUserConfirmLabel,
  isDeleteUserDialogOpen,
  setDeleteUserDialogOpen,
} from '../model/delete-user';

export const DeleteUser = reatomComponent(() => {
  return (
    <Dialog
      open={isDeleteUserDialogOpen()}
      onOpenChange={wrap(setDeleteUserDialogOpen)}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete account</DialogTitle>
          <DialogDescription>
            This permanently deletes your account. This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={wrap(closeDeleteUserDialog)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={!deleteUser.ready()}
            onClick={wrap(deleteUser)}
          >
            {deleteUserConfirmLabel()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}, 'DeleteUser');
