import { wrap } from '@reatom/core';
import { reatomComponent } from '@reatom/react';
import { Trash2 } from 'lucide-react';

import type { CareerStep } from '@/entities/career-step';
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
  step: CareerStep;
};

export const DeleteCareerStep = reatomComponent(
  ({ step }: DeleteCareerStepProps) => {
    const handleOpenChange = (shouldOpen: boolean) => {
      setDeleteCareerStepDialogOpen(step.id, shouldOpen);
    };

    return (
      <Dialog
        open={isCareerStepDeleteDialogOpen(step.id)}
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
              This permanently deletes “{step.position}”. This cannot be undone.
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
