import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { type Context, Hono, type Next } from 'hono';

import { createDatabase } from '../db/client';
import * as schema from '../db/schema';
import { trustedOriginsFor } from './trusted-origins';

export { isTrustedAuthOrigin, trustedOriginsFor } from './trusted-origins';

export const createAuth = (env: Env) =>
  betterAuth({
    appName: 'resume-helper',
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    database: drizzleAdapter(createDatabase(env.DB), {
      provider: 'sqlite',
      schema,
      transaction: false,
    }),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
    },
    trustedOrigins: trustedOriginsFor(env.BETTER_AUTH_URL),
    rateLimit: {
      enabled: true,
    },
    advanced: {
      ipAddress: {
        ipAddressHeaders: ['cf-connecting-ip'],
      },
    },
  });

const isPublicEmailSignUp = ({
  method,
  pathname,
}: {
  method: string;
  pathname: string;
}): boolean => method === 'POST' && pathname.endsWith('/sign-up/email');

const rejectPublicEmailSignUp = async (
  context: Context<{ Bindings: Env }>,
  next: Next,
) => {
  if (
    !isPublicEmailSignUp({
      method: context.req.method,
      pathname: new URL(context.req.url).pathname,
    })
  ) {
    await next();

    return;
  }

  return context.json({ message: 'Sign-up temporarily unavailable' }, 403);
};

export const auth = new Hono<{ Bindings: Env }>()
  .use(rejectPublicEmailSignUp)
  .on(['GET', 'POST'], '/*', (context) =>
    createAuth(context.env).handler(context.req.raw),
  );
