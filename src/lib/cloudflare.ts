import { getRequest } from '@tanstack/react-start/server'

export type CloudflareEnv = {
  DB: D1Database
  BETTER_AUTH_SECRET?: string
  BETTER_AUTH_URL?: string
}

type CloudflareRequest = Request & {
  runtime?: {
    cloudflare?: {
      env?: CloudflareEnv
    }
  }
  context?: {
    cloudflare?: {
      env?: CloudflareEnv
    }
  }
}

export function getCloudflareEnv(): CloudflareEnv {
  const request = getRequest() as CloudflareRequest
  const env =
    request.runtime?.cloudflare?.env ?? request.context?.cloudflare?.env

  if (!env?.DB) {
    throw new Error(
      'D1 binding DB is not available on this request. Check wrangler.jsonc and the Nitro Cloudflare preset.',
    )
  }

  return env
}
