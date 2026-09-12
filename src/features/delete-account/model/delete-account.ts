import {
  action,
  computed,
  reatomBoolean,
  urlAtom,
  withAsync,
  wrap,
} from '@reatom/core';

import { clientApi } from '@/shared/api';
import { createdDemoUser, session } from '@/shared/auth';
import { SIGN_IN_PATH } from '@/shared/config';
import { toast } from '@/shared/ui';

export const isDeleteAccountDialogOpen = reatomBoolean(
  false,
  'isDeleteAccountDialogOpen',
);

export const openDeleteAccount = isDeleteAccountDialogOpen.setTrue;

export const closeDeleteAccountDialog = isDeleteAccountDialogOpen.setFalse;

export const setDeleteAccountDialogOpen = action((shouldOpen: boolean) => {
  if (shouldOpen) {
    openDeleteAccount();

    return;
  }

  closeDeleteAccountDialog();
}, 'setDeleteAccountDialogOpen');

export const deleteAccount = action(async () => {
  try {
    await wrap(clientApi.deleteUser());
  } catch {
    toast.error('Could not delete the account. Try again later.');

    return;
  }

  closeDeleteAccountDialog();

  createdDemoUser.set(null);

  await wrap(session.retry());

  urlAtom.go(SIGN_IN_PATH);
}, 'deleteAccount').extend(withAsync());

export const deleteAccountConfirmLabel = computed(() => {
  if (!deleteAccount.ready()) return 'Deleting';

  return 'Delete';
}, 'deleteAccountConfirmLabel');
