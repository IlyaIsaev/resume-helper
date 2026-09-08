import { useForm } from '@tanstack/react-form';
import { CircleAlert } from 'lucide-react';
import { useState } from 'react';
import * as v from 'valibot';
import { Alert, AlertDescription } from '@/common/ui/alert';
import { Button } from '@/common/ui/button';
import { DialogFooter } from '@/common/ui/dialog';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/common/ui/field';
import { Input } from '@/common/ui/input';
import { Textarea } from '@/common/ui/textarea';
import { type CareerStepValues, careerStepSchema } from '../schema';
import { DateRangePicker } from './date-range-picker';

function careerStepValuesEqual(a: CareerStepValues, b: CareerStepValues) {
  return (
    a.position === b.position &&
    a.dates.from === b.dates.from &&
    a.dates.to === b.dates.to &&
    a.description === b.description &&
    a.technologies === b.technologies
  );
}

export function CareerStepForm({
  defaultValues,
  onSubmit,
  onSuccess,
  submitLabel = 'Save career step',
}: {
  defaultValues: CareerStepValues;
  onSubmit: (value: CareerStepValues) => Promise<void>;
  onSuccess: () => void;
  submitLabel?: string;
}) {
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm({
    defaultValues,
    validators: {
      onChange: careerStepSchema,
    },
    onSubmit: async ({ value }) => {
      setFormError(null);

      try {
        await onSubmit(value);
        onSuccess();
      } catch (error) {
        setFormError(
          error instanceof Error ? error.message : 'Could not save career step',
        );
      }
    },
  });

  return (
    <form
      className="flex flex-col gap-4"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
    >
      {formError ? (
        <Alert variant="destructive">
          <CircleAlert />
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      ) : null}

      <FieldGroup>
        <form.Field name="position">
          {(field) => {
            const isInvalid =
              field.state.meta.isBlurred && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Position</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={() => {
                    field.handleBlur();
                    void field.validate('change');
                  }}
                  onChange={(event) => field.handleChange(event.target.value)}
                  aria-invalid={isInvalid}
                />
                {isInvalid ? (
                  <FieldError errors={field.state.meta.errors} />
                ) : null}
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="dates">
          {(field) => {
            const isInvalid =
              field.state.meta.isBlurred && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Dates</FieldLabel>
                <DateRangePicker
                  id={field.name}
                  value={field.state.value}
                  onBlur={() => {
                    field.handleBlur();
                    void field.validate('change');
                  }}
                  onChange={field.handleChange}
                  aria-invalid={isInvalid}
                />
                {isInvalid ? (
                  <FieldError errors={field.state.meta.errors} />
                ) : null}
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="description">
          {(field) => {
            const isInvalid =
              field.state.meta.isBlurred && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                <Textarea
                  id={field.name}
                  name={field.name}
                  className="min-h-40"
                  value={field.state.value}
                  onBlur={() => {
                    field.handleBlur();
                    void field.validate('change');
                  }}
                  onChange={(event) => field.handleChange(event.target.value)}
                  aria-invalid={isInvalid}
                />
                {isInvalid ? (
                  <FieldError errors={field.state.meta.errors} />
                ) : null}
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="technologies">
          {(field) => {
            const isInvalid =
              field.state.meta.isBlurred && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Technologies</FieldLabel>
                <Textarea
                  id={field.name}
                  name={field.name}
                  className="min-h-40"
                  value={field.state.value}
                  onBlur={() => {
                    field.handleBlur();
                    void field.validate('change');
                  }}
                  onChange={(event) => field.handleChange(event.target.value)}
                  aria-invalid={isInvalid}
                />
                {isInvalid ? (
                  <FieldError errors={field.state.meta.errors} />
                ) : null}
              </Field>
            );
          }}
        </form.Field>
      </FieldGroup>

      <DialogFooter>
        <form.Subscribe
          selector={(state) => ({
            values: state.values,
            isSubmitting: state.isSubmitting,
          })}
        >
          {({ values, isSubmitting }) => {
            const isValid = v.safeParse(careerStepSchema, values).success;
            const isUnchanged = careerStepValuesEqual(values, defaultValues);
            return (
              <Button
                type="submit"
                disabled={!isValid || isSubmitting || isUnchanged}
              >
                {isSubmitting
                  ? submitLabel === 'Update career step'
                    ? 'Updating'
                    : 'Saving'
                  : submitLabel}
              </Button>
            );
          }}
        </form.Subscribe>
      </DialogFooter>
    </form>
  );
}
