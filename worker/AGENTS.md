# Backend

The API is a [Hono](https://hono.dev) Cloudflare Worker. Official docs for LLMs: https://hono.dev/llms.txt

General style, naming, and kebab-case come from the parent `AGENTS.md`. Frontend rules live in `src/AGENTS.md`.

```text
index.ts             ← mount auth, demo-user, career-steps, health; hourly demo expiry cron
auth/                ← Better Auth Hono app
demo-user/           ← generate or reuse demo credentials, create on Sign in, delete
  demo-users.ts      ← demo email, 24h expiry, delete helpers
career-steps/        ← career step CRUD + cursor list
db/                  ← Drizzle schema + D1 client
```

## Validation

Validate request bodies and params with Valibot via `@hono/valibot-validator` (`vValidator`). Do not add Zod.

## Hono

- Only `/api/*` hits the Worker (`run_worker_first`). Everything else is the SPA.
- Bindings come from `wrangler types` (`Env`). Do not hand-write binding interfaces.
- Use `wrangler.jsonc`. Enable `nodejs_compat`. Do not store production secrets in config. Local secrets go in `.dev.vars`.
- Dedicated Hono apps: `auth` at `/api/auth`, `demo-user` at `/api/demo-user`, `career-steps` at `/api/career-steps`. Mount more specific apps before `/api`.
- Chain Hono handlers so `AppType` infers. The UI may import `AppType` as types only from `src/shared/api`; do not add runtime exports for the SPA.
- Default export is `{ fetch, scheduled }`, not the Hono app. Keep `export type AppType = typeof app`. Hourly cron (`0 * * * *`) deletes expired demo users. Production `fetch` 404s `/__scheduled` unless the host is `127.0.0.1` or `localhost`.

## Auth

Authentication is [Better Auth](https://better-auth.com) with email and password.

- Server: `createAuth(env)` in `auth/` — create per request, never as a Worker singleton.
- Handler: dedicated Hono `auth` app, mounted at `/api/auth`. `POST /api/auth/sign-up/email` returns 403 `{ message: 'Sign-up temporarily unavailable' }`. Do not set Better Auth `emailAndPassword.disableSignUp` — `POST /api/demo-user` still creates demo users with `auth.api.signUpEmail`.
- `GET /api/demo-user` reads the HttpOnly `createdDemoUser` cookie when it holds a valid demo email and password; otherwise it invents `demo-user-{8 hex}@demo.com` credentials and sets that cookie. It does not insert a row. Called from `/sign-in`, not `/sign-up`. Responses use `Cache-Control: private, no-store`.
- `POST /api/demo-user` creates the account (or signs in if it exists), sets session cookies, and refreshes the HttpOnly demo cookie. If that demo row is older than 24 hours, POST deletes it first and then signs up again. POST `/api/demo-user` and POST `/api/auth/*` are rate-limited with `AUTH_RATE_LIMITER` keyed by path and `CF-Connecting-IP`.
- Demo accounts are deleted 24 hours after `user.createdAt`. An hourly cron purges expired demo users. Career-step requests also delete an expired demo session and return 401.
- `DELETE /api/demo-user` deletes the signed-in user (any email). Career steps cascade. It expires `createdDemoUser` and session cookies so the next `GET` invents new demo credentials.
- Cookie consent is only on `/sign-in`: Accept sets `cookieConsent=true`; Decline redirects to `https://www.google.com`.
- Copy `.dev.vars.example` to `.dev.vars`. Production: `wrangler secret put BETTER_AUTH_SECRET`.

## Database

Persistence is [Drizzle](https://orm.drizzle.team) on Cloudflare D1.

- Schema: `db/schema.ts`. Client: `createDatabase(env.DB)` from `db/client.ts`.
- `career_step` has a unique `id`, position, dates, description, technologies, and `user_id` (FK to `user.id`, cascade on delete). List and mutate only that user's rows.
- Generate SQL with `pnpm db:generate`. Apply locally with `pnpm db:migrate`.
- Local `database_id` is a placeholder. Create a real D1 database before remote deploy.
