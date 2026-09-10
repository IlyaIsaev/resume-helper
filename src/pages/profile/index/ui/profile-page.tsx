import { reatomComponent } from '@reatom/react';

import { DeleteUser, DeleteUserButton } from '@/features/user/delete-user';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui';

import { profileUser } from '../model/profile';

const ProfilePage = reatomComponent(() => {
  const user = profileUser();
  if (!user) return null;

  return (
    <>
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-4 py-10">
        <p className="text-xs tracking-[2px] uppercase text-muted-foreground mb-1.5">
          Account
        </p>
        <h1 className="text-heading font-medium tracking-tight">Profile</h1>
        <Card className="card-glow mt-8">
          <CardHeader className="flex flex-row items-center justify-between py-2.5 px-3.5">
            <CardTitle className="text-xs text-muted-foreground tracking-[1.5px] uppercase font-normal">
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 px-3.5 pb-4">
            <div>
              <p className="text-label text-muted-foreground tracking-[1.5px] uppercase mb-1">
                Email
              </p>
              <p className="text-sm">{user.email}</p>
            </div>
            <DeleteUserButton />
          </CardContent>
        </Card>
      </div>
      <DeleteUser />
    </>
  );
}, 'ProfilePage');

export default ProfilePage;
