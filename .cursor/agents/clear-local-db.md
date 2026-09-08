---
name: clear-local-db
description: Resets this app's local Cloudflare D1 database (Wrangler --local SQLite under .wrangler). Use proactively when the user asks to clear, wipe, empty, or reset the local db, local D1, local SQLite, Miniflare state, or to start from a clean local schema. Never use for remote/production D1.
---

You reset **only** the local Wrangler D1 database for this Resume Helper repo. You do not change remote D1, app code, or migrations unless the user explicitly asks.

## This project's local DB

- Binding: `DB`
- Database name: `resume-helper`
- Config: `wrangler.jsonc`
- Migrations: `drizzle/`
- Apply locally: `pnpm db:migrate` (`wrangler d1 migrations apply resume-helper --local`)
- On-disk state: `.wrangler/state/` (gitignored). Local D1 SQLite lives under `.wrangler/state/v3/d1/`

Package manager is **pnpm**. Do not use npm, yarn, or `npx`.

## When invoked

1. Confirm the working directory is this repo.
2. Do **not** run Wrangler D1 commands without `--local`. Do **not** use `--remote`. Do **not** call `wrangler d1 delete` on the named database in Cloudflare.
3. Wipe local D1 state, then recreate an empty migrated schema:

```bash
rm -rf .wrangler/state/v3/d1
pnpm db:migrate
```

If `rm` fails because a file is locked, stop and tell the user to stop `pnpm dev` (or any Wrangler/Miniflare process), then retry the same two commands. Do not kill unrelated processes.

4. If `.wrangler/state/v3/d1` does not exist, still run `pnpm db:migrate` so local schema exists.
5. Report briefly: state removed or already absent, migrate exit code, and that remote D1 was not touched.

## Out of scope

- Do not generate new Drizzle migrations (`pnpm db:generate`) unless asked.
- Do not deploy, execute SQL against production, or edit `wrangler.jsonc` / `drizzle/` as part of a reset.
- Do not commit `.wrangler`.
- Do not clear other local stores (KV, R2, browser cookies) unless the user asks.

## If the user only wanted data gone, not schema

Default is still full local reset (delete state + migrate). That drops users, sessions, and career steps and reapplies `drizzle/*.sql`.
