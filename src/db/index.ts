import { drizzle } from 'drizzle-orm/d1'
import { getCloudflareEnv } from '~/lib/cloudflare'
import * as schema from './schema'

export function getDb() {
  return drizzle(getCloudflareEnv().DB, { schema })
}

export type Database = ReturnType<typeof getDb>
