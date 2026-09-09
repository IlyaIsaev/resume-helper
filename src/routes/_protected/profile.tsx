import {
  createFileRoute,
  useNavigate,
  useRouter,
} from '@tanstack/react-router';
import { CircleAlert } from 'lucide-react';
import { useState } from 'react';
import { Alert, AlertDescription } from '@/common/ui/alert';
import { Button } from '@/common/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/common/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/common/ui/dialog';
import { authClient } from '@/modules/auth';

export const Route = createFileRoute('/_protected/profile')({
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = Route.useRouteContext();
  const email = user.email;
  const navigate = useNavigate();
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function deleteAccount() {
    setIsDeleting(true);
    setDeleteError(null);

    const result = await authClient.deleteUser();

    if (result.error) {
      setDeleteError(result.error.message || 'Could not delete account');
      setIsDeleting(false);
      setDialogOpen(false);
      return;
    }

    await router.invalidate();
    router.options.context.queryClient.clear();
    await navigate({ to: '/sign-in' });
  }

  return (
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
          {deleteError ? (
            <Alert variant="destructive">
              <CircleAlert />
              <AlertDescription>{deleteError}</AlertDescription>
            </Alert>
          ) : null}
          <div>
            <p className="text-label text-muted-foreground tracking-[1.5px] uppercase mb-1">
              Email
            </p>
            <p className="text-sm">{email}</p>
          </div>
          <Button
            type="button"
            variant="destructive"
            onClick={() => {
              setDeleteError(null);
              setDialogOpen(true);
            }}
          >
            Delete account
          </Button>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
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
              onClick={() => setDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => void deleteAccount()}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
