import { useForm } from '@tanstack/react-form'
import { useRouter } from '@tanstack/react-router'
import { CircleAlert } from 'lucide-react'
import { useState } from 'react'
import * as v from 'valibot'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { DateRangePicker } from '@/components/date-range-picker'
import { createCareerStep } from '@/lib/career-step/functions'
import { careerStepSchema } from '@/lib/career-step/schema'

export function AddCareerStepDialog() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">Add career step</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add career step</DialogTitle>
          <DialogDescription>
            Record a role, what you did, and the technologies you used.
          </DialogDescription>
        </DialogHeader>
        {open ? (
          <CareerStepForm
            onSuccess={() => {
              setOpen(false)
            }}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

function CareerStepForm({ onSuccess }: { onSuccess: () => void }) {
  const router = useRouter()
  const [formError, setFormError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: {
      position: '',
      dates: { from: '', to: '' },
      description: '',
      technologies: '',
    },
    validators: {
      onChange: careerStepSchema,
    },
    onSubmit: async ({ value }) => {
      setFormError(null)

      try {
        await createCareerStep({ data: value })
        await router.invalidate()
        onSuccess()
      } catch (error) {
        setFormError(
          error instanceof Error ? error.message : 'Could not save career step',
        )
      }
    },
  })

  return (
    <form
      className="flex flex-col gap-4"
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        void form.handleSubmit()
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
              field.state.meta.isBlurred && !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Position</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={() => {
                    field.handleBlur()
                    void field.validate('change')
                  }}
                  onChange={(event) => field.handleChange(event.target.value)}
                  aria-invalid={isInvalid}
                />
                {isInvalid ? (
                  <FieldError errors={field.state.meta.errors} />
                ) : null}
              </Field>
            )
          }}
        </form.Field>

        <form.Field name="dates">
          {(field) => {
            const isInvalid =
              field.state.meta.isBlurred && !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Dates</FieldLabel>
                <DateRangePicker
                  id={field.name}
                  value={field.state.value}
                  onBlur={() => {
                    field.handleBlur()
                    void field.validate('change')
                  }}
                  onChange={field.handleChange}
                  aria-invalid={isInvalid}
                />
                {isInvalid ? (
                  <FieldError errors={field.state.meta.errors} />
                ) : null}
              </Field>
            )
          }}
        </form.Field>

        <form.Field name="description">
          {(field) => {
            const isInvalid =
              field.state.meta.isBlurred && !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                <Textarea
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={() => {
                    field.handleBlur()
                    void field.validate('change')
                  }}
                  onChange={(event) => field.handleChange(event.target.value)}
                  aria-invalid={isInvalid}
                />
                {isInvalid ? (
                  <FieldError errors={field.state.meta.errors} />
                ) : null}
              </Field>
            )
          }}
        </form.Field>

        <form.Field name="technologies">
          {(field) => {
            const isInvalid =
              field.state.meta.isBlurred && !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Technologies</FieldLabel>
                <Textarea
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={() => {
                    field.handleBlur()
                    void field.validate('change')
                  }}
                  onChange={(event) => field.handleChange(event.target.value)}
                  aria-invalid={isInvalid}
                />
                {isInvalid ? (
                  <FieldError errors={field.state.meta.errors} />
                ) : null}
              </Field>
            )
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
            const isValid = v.safeParse(careerStepSchema, values).success
            return (
              <Button type="submit" disabled={!isValid || isSubmitting}>
                {isSubmitting ? 'Saving' : 'Save career step'}
              </Button>
            )
          }}
        </form.Subscribe>
      </DialogFooter>
    </form>
  )
}
