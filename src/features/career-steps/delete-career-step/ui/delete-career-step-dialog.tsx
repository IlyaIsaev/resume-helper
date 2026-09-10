import { wrap } from '@reatom/core';
import { reatomComponent } from '@reatom/react';
import { Trash2 } from 'lucide-react';

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui';

import {
  closeDeleteCareerStepDialog,
  deleteCareerStep,
  deleteCareerStepConfirmLabel,
  isCareerStepDeleteDialogOpen,
  setDeleteCareerStepDialogOpen,
} from '../model/delete-career-step';

type DeleteCareerStepProps = {
  stepId: string;
  position: string;
};

export const DeleteCareerStep = reatomComponent(
  ({ stepId, position }: DeleteCareerStepProps) => {
    const handleOpenChange = (shouldOpen: boolean) => {
      setDeleteCareerStepDialogOpen(stepId, shouldOpen);
    };

    return (
      <Dialog
        open={isCareerStepDeleteDialogOpen(stepId)}
        onOpenChange={wrap(handleOpenChange)}
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
              This permanently deletes “{position}”. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={wrap(closeDeleteCareerStepDialog)}
              disabled={!deleteCareerStep.ready()}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={wrap(deleteCareerStep)}
              disabled={!deleteCareerStep.ready()}
            >
              {deleteCareerStepConfirmLabel()}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  },
  'DeleteCareerStep',
);
