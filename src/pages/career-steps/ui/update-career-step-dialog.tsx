import { wrap } from '@reatom/core';
import { reatomComponent } from '@reatom/react';
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
  isUpdateCareerStepSubmitDisabled,
  setUpdateCareerStepDialogOpen,
  updateCareerStepDateParts,
  updateCareerStepForm,
  updateCareerStepSubmitLabel,
} from '../model/update-career-step';
import { CareerStepFields } from './career-step-fields';

export const UpdateCareerStep = reatomComponent(() => {
  const { fields, submit } = updateCareerStepForm;
  const submitError = submit.error();

  return (
    <Dialog open onOpenChange={wrap(setUpdateCareerStepDialogOpen)}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit career step</DialogTitle>
          <DialogDescription>
            Record a role, what you did, and the technologies you used.
          </DialogDescription>
        </DialogHeader>
        <Form onSubmit={submit}>
          <CareerStepFields
            fields={fields}
            dateParts={updateCareerStepDateParts}
          />
          <FormMessage>{submitError?.message}</FormMessage>
          <DialogFooter>
            <Button type="submit" disabled={isUpdateCareerStepSubmitDisabled()}>
              {updateCareerStepSubmitLabel()}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}, 'UpdateCareerStep');
