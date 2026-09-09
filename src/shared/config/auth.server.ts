import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { getRequest } from '@tanstack/react-start/server';
import { betterAuth } from 'better-auth';
import { tanstackStartCookies } from 'better-auth/tanstack-start';
import { getDb, schema } from '@/shared/db';
import { getCloudflareEnv } from './cloudflare.server';

function getBaseURL() {
  const env = getCloudflareEnv();
  if (env.BETTER_AUTH_URL) {
    return env.BETTER_AUTH_URL;
  }
  if (process.env.BETTER_AUTH_URL) {
    return process.env.BETTER_AUTH_URL;
  }
  const request = getRequest();
  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}

export function getAuth() {
  const env = getCloudflareEnv();
  const secret = env.BETTER_AUTH_SECRET ?? process.env.BETTER_AUTH_SECRET;

  if (!secret) {
    throw new Error(
      'BETTER_AUTH_SECRET is not set. Add it to .env.local and .dev.vars.',
    );
  }

  const baseURL = getBaseURL();
  const requestUrl = new URL(getRequest().url);
  const requestOrigin = `${requestUrl.protocol}//${requestUrl.host}`;

  return betterAuth({
    secret,
    baseURL,
    trustedOrigins: [...new Set([baseURL, requestOrigin])],
    database: drizzleAdapter(getDb(), {
      provider: 'sqlite',
      schema,
      transaction: false,
    }),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
    },
    user: {
      deleteUser: {
        enabled: true,
      },
    },
    plugins: [tanstackStartCookies()],
  });
}
