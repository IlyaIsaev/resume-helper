import { reatomComponent } from '@reatom/react';

import { SIGN_UP_PATH } from '@/shared/config';
import {
  Button,
  bindFormControl,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from '@/shared/ui';

import { isSignInSubmitDisabled, signInForm } from '../model/sign-in';
import { CookieConsent } from './consent-banner';

const SignInPage = reatomComponent(() => {
  const { fields, submit } = signInForm;
  const submitError = submit.error();
  const emailField = bindFormControl(fields.email);
  const passwordField = bindFormControl(fields.password);

  return (
    <>
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10">
        <Card className="card-glow">
          <CardHeader className="flex flex-row items-center justify-between py-2.5 px-3.5">
            <CardTitle className="text-xs text-muted-foreground tracking-[1.5px] uppercase font-normal">
              Sign in
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3.5 pb-4">
            <Form onSubmit={submit}>
              <FormField field={fields.email}>
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" autoComplete="email" {...emailField} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>
              <FormField field={fields.password}>
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      autoComplete="current-password"
                      {...passwordField}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>
              <FormMessage>{submitError?.message}</FormMessage>
              <Button type="submit" disabled={isSignInSubmitDisabled()}>
                Sign in
              </Button>
            </Form>
            <p className="mt-4 text-ui text-muted-foreground">
              Don't have an account?{' '}
              <a
                className="text-primary underline-offset-4 hover:underline"
                href={SIGN_UP_PATH}
              >
                Sign up
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
      <CookieConsent />
    </>
  );
}, 'SignInPage');

export default SignInPage;
