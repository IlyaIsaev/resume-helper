import { CircleAlert, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/common/ui/alert';
import { Button } from '@/common/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/common/ui/dialog';
import {
  ensureCareerStepInCollection,
  persistCareerStepMutation,
  useCareerStepCollection,
} from '../collection';
import type { CareerStep } from '../schema';

export function DeleteCareerStepDialog({ step }: { step: CareerStep }) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const collection = useCareerStepCollection();

  async function handleDelete() {
    setIsDeleting(true);
    setDeleteError(null);

    try {
      await ensureCareerStepInCollection(collection, step);
      const tx = collection.delete(step.id);
      await persistCareerStepMutation(tx);
      toast.success(`Career step “${step.position}” was deleted.`);
      setOpen(false);
    } catch (error) {
      setDeleteError(
        error instanceof Error ? error.message : 'Could not delete career step',
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) {
          setDeleteError(null);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Delete career step"
        >
          <Trash2 />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete career step</DialogTitle>
          <DialogDescription>
            This permanently deletes “{step.position}”. This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        {deleteError ? (
          <Alert variant="destructive">
            <CircleAlert />
            <AlertDescription>{deleteError}</AlertDescription>
          </Alert>
        ) : null}
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => void handleDelete()}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
