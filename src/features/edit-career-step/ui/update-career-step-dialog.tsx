import { wrap } from '@reatom/core';
import { reatomComponent } from '@reatom/react';

import { CareerStepFields } from '@/entities/career-step';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Form,
  FormMessage,
  Skeleton,
} from '@/shared/ui';

import {
  isUpdateCareerStepFormReady,
  isUpdateCareerStepSubmitDisabled,
  setUpdateCareerStepDialogOpen,
  updateCareerStepDateParts,
  updateCareerStepForm,
  updateCareerStepSubmitLabel,
} from '../model/update-career-step';
import { CareerStepFieldsSkeleton } from './career-step-fields-skeleton';

export const UpdateCareerStep = reatomComponent(() => {
  const { fields, submit } = updateCareerStepForm;
  const submitError = submit.error();
  const isFormReady = isUpdateCareerStepFormReady();

  return (
    <Dialog open onOpenChange={wrap(setUpdateCareerStepDialogOpen)}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit career step</DialogTitle>
          <DialogDescription>
            Record a role, what you did, and the technologies you used.
          </DialogDescription>
        </DialogHeader>
        {isFormReady ? (
          <Form onSubmit={submit}>
            <CareerStepFields
              fields={fields}
              dateParts={updateCareerStepDateParts}
            />
            <FormMessage>{submitError?.message}</FormMessage>
            <DialogFooter>
              <Button
                type="submit"
                disabled={isUpdateCareerStepSubmitDisabled()}
              >
                {updateCareerStepSubmitLabel()}
              </Button>
            </DialogFooter>
          </Form>
        ) : (
          <div className="flex flex-col gap-4" aria-busy>
            <CareerStepFieldsSkeleton />
            <DialogFooter>
              <Skeleton className="h-9 w-40" />
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}, 'UpdateCareerStep');
