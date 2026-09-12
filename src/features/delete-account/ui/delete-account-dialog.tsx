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
  closeDeleteAccountDialog,
  deleteAccount,
  deleteAccountConfirmLabel,
  isDeleteAccountDialogOpen,
  openDeleteAccount,
  setDeleteAccountDialogOpen,
} from '../model/delete-account';

export const DeleteAccount = reatomComponent(() => {
  return (
    <Dialog
      open={isDeleteAccountDialogOpen()}
      onOpenChange={wrap(setDeleteAccountDialogOpen)}
    >
      <Button
        type="button"
        variant="destructive"
        onClick={wrap(openDeleteAccount)}
      >
        Delete account
      </Button>
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
            onClick={wrap(closeDeleteAccountDialog)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={!deleteAccount.ready()}
            onClick={wrap(deleteAccount)}
          >
            {deleteAccountConfirmLabel()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}, 'DeleteAccount');
