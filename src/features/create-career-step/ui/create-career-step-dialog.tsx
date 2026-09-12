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
} from '@/shared/ui';

import {
  createCareerStepDateParts,
  createCareerStepForm,
  createCareerStepSubmitLabel,
  isCreateCareerStepDialogOpen,
  isCreateCareerStepSubmitDisabled,
  openCreateCareerStep,
  setCreateCareerStepDialogOpen,
} from '../model/create-career-step';

export const CreateCareerStep = reatomComponent(() => {
  const isDialogOpen = isCreateCareerStepDialogOpen();
  const { fields, submit } = createCareerStepForm;
  const submitError = submit.error();

  return (
    <Dialog
      open={isDialogOpen}
      onOpenChange={wrap(setCreateCareerStepDialogOpen)}
    >
      <Button
        type="button"
        className="w-full focus:ring-1 focus:ring-ring"
        autoFocus
        onClick={wrap(openCreateCareerStep)}
      >
        Add career step
      </Button>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add career step</DialogTitle>
          <DialogDescription>
            Record a role, what you did, and the technologies you used.
          </DialogDescription>
        </DialogHeader>
        {isDialogOpen ? (
          <Form onSubmit={submit}>
            <CareerStepFields
              fields={fields}
              dateParts={createCareerStepDateParts}
            />
            <FormMessage>{submitError?.message}</FormMessage>
            <DialogFooter>
              <Button
                type="submit"
                disabled={isCreateCareerStepSubmitDisabled()}
              >
                {createCareerStepSubmitLabel()}
              </Button>
            </DialogFooter>
          </Form>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}, 'CreateCareerStep');
