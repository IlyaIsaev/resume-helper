import { createServerOnlyFn } from '@tanstack/react-start';
import { drizzle } from 'drizzle-orm/d1';
import { getCloudflareEnv } from '@/common/cloudflare.server';
import * as schema from './schema';

export const getDb = createServerOnlyFn(() => {
  return drizzle(getCloudflareEnv().DB, { schema });
});

export type Database = ReturnType<typeof getDb>;
