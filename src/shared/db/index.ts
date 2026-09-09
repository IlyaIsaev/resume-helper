import { createServerOnlyFn } from '@tanstack/react-start';
import { drizzle } from 'drizzle-orm/d1';
import { getCloudflareEnv } from '@/shared/config/cloudflare.server';
import * as schema from './schema';

export const getDb = createServerOnlyFn(() => {
  return drizzle(getCloudflareEnv().DB, { schema });
});

export type Database = ReturnType<typeof getDb>;
export { careerStep } from './schema';
export { schema };
