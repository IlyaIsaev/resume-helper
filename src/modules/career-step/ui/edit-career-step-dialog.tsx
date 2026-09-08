import type { ReactNode } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/common/ui/dialog';
import { Field, FieldGroup, FieldLabel } from '@/common/ui/field';
import { Skeleton } from '@/common/ui/skeleton';
import {
  ensureCareerStepInCollection,
  persistCareerStepMutation,
  useCareerStepCollection,
} from '../collection';
import {
  type CareerStep,
  careerStepFromFormValues,
  careerStepToFormValues,
} from '../schema';
import { CareerStepForm } from './career-step-form';

function EditCareerStepDialogFrame({
  onClose,
  children,
}: {
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit career step</DialogTitle>
          <DialogDescription>
            Record a role, what you did, and the technologies you used.
          </DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}

export function EditCareerStepDialog({
  step,
  onClose,
}: {
  step: CareerStep;
  onClose: () => void;
}) {
  const collection = useCareerStepCollection();

  return (
    <EditCareerStepDialogFrame onClose={onClose}>
      <CareerStepForm
        defaultValues={careerStepToFormValues(step)}
        submitLabel="Update career step"
        onSubmit={async (value) => {
          const previousPosition = step.position;
          try {
            ensureCareerStepInCollection(collection, step);
            const tx = collection.update(step.id, (draft) => {
              const next = careerStepFromFormValues(
                step.id,
                value,
                draft.createdAt,
              );
              draft.position = next.position;
              draft.startedOn = next.startedOn;
              draft.endedOn = next.endedOn;
              draft.description = next.description;
              draft.technologies = next.technologies;
            });
            await persistCareerStepMutation(tx);
            toast.success(`Career step “${previousPosition}” was updated.`);
          } catch (error) {
            toast.error(`Could not update career step “${previousPosition}”.`);
            throw error;
          }
        }}
        onSuccess={onClose}
      />
    </EditCareerStepDialogFrame>
  );
}

export function EditCareerStepDialogSkeleton({
  onClose,
}: {
  onClose: () => void;
}) {
  return (
    <EditCareerStepDialogFrame onClose={onClose}>
      <div className="flex flex-col gap-4">
        <FieldGroup>
          <Field>
            <FieldLabel>Position</FieldLabel>
            <Skeleton className="h-9 w-full" />
          </Field>
          <Field>
            <FieldLabel>Dates</FieldLabel>
            <Skeleton className="h-9 w-full" />
          </Field>
          <Field>
            <FieldLabel>Description</FieldLabel>
            <Skeleton className="min-h-40 w-full" />
          </Field>
          <Field>
            <FieldLabel>Technologies</FieldLabel>
            <Skeleton className="min-h-40 w-full" />
          </Field>
        </FieldGroup>
        <DialogFooter>
          <Skeleton className="h-9 w-40" />
        </DialogFooter>
      </div>
    </EditCareerStepDialogFrame>
  );
}
