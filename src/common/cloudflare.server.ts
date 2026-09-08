import { env } from 'cloudflare:workers';

export function getCloudflareEnv(): Env {
  if (!env.DB) {
    throw new Error(
      'D1 binding DB is not available. Check wrangler.jsonc and @cloudflare/vite-plugin.',
    );
  }

  return env;
}
