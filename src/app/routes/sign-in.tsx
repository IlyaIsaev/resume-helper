import { useForm } from '@tanstack/react-form';
import {
  createFileRoute,
  Link,
  redirect,
  useNavigate,
  useRouter,
} from '@tanstack/react-router';
import { CircleAlert } from 'lucide-react';
import { useState } from 'react';
import * as v from 'valibot';
import { authClient, signInSchema } from '@/entities/session';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/shared/ui/field';
import { Input } from '@/shared/ui/input';

type SignInSearch = {
  redirect?: string;
};

export const Route = createFileRoute('/sign-in')({
  validateSearch: (search: Record<string, unknown>): SignInSearch => ({
    redirect: typeof search.redirect === 'string' ? search.redirect : undefined,
  }),
  beforeLoad: async ({ context, search }) => {
    if (context.session) {
      throw redirect({ href: search.redirect || '/' });
    }
  },
  component: SignInPage,
});

function SignInPage() {
  const { redirect: redirectTo } = Route.useSearch();
  const navigate = useNavigate();
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    validators: {
      onChange: signInSchema,
    },
    onSubmit: async ({ value }) => {
      setFormError(null);
      const result = await authClient.signIn.email({
        email: value.email,
        password: value.password,
      });

      if (result.error) {
        setFormError(result.error.message || 'Could not sign in');
        return;
      }

      await router.invalidate();
      await navigate({ href: redirectTo || '/' });
    },
  });

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10">
      <Card className="card-glow">
        <CardHeader className="flex flex-row items-center justify-between py-2.5 px-3.5">
          <CardTitle className="text-xs text-muted-foreground tracking-[1.5px] uppercase font-normal">
            Sign in
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3.5 pb-4">
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
              <form.Field name="email">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isBlurred && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="email"
                        autoComplete="email"
                        value={field.state.value}
                        onBlur={() => {
                          field.handleBlur();
                          void field.validate('change');
                        }}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        aria-invalid={isInvalid}
                      />
                      {isInvalid ? (
                        <FieldError errors={field.state.meta.errors} />
                      ) : null}
                    </Field>
                  );
                }}
              </form.Field>

              <form.Field name="password">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isBlurred && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="password"
                        autoComplete="current-password"
                        value={field.state.value}
                        onBlur={() => {
                          field.handleBlur();
                          void field.validate('change');
                        }}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
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

            <form.Subscribe
              selector={(state) => ({
                values: state.values,
                isSubmitting: state.isSubmitting,
              })}
            >
              {({ values, isSubmitting }) => {
                const isValid = v.safeParse(signInSchema, values).success;
                return (
                  <Button type="submit" disabled={!isValid || isSubmitting}>
                    {isSubmitting ? 'Signing in' : 'Sign in'}
                  </Button>
                );
              }}
            </form.Subscribe>
          </form>
          <p className="mt-4 text-sm text-muted-foreground">
            Need an account?{' '}
            <Link
              to="/sign-up"
              className="text-primary underline-offset-4 hover:underline"
            >
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
