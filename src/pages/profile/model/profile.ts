import { computed } from '@reatom/core';

import { session } from '@/shared/auth';

export const profileUser = computed(() => {
  const user = session.data()?.user;
  if (!user) return null;

  return {
    name: user.name,
    email: user.email,
  };
}, 'profileUser');
