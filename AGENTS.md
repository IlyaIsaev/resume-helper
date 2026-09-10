# Coding standards

Write TypeScript in a **functional style**. User-level `~/.cursor/AGENTS.md` is the default (including semicolons and one-line `return` / `throw` guards). This file adds project overrides.

## Overrides

For collections, object updates, and composition, use `es-toolkit/fp`. For type utilities TypeScript does not ship, use `es-toolkit/types`. Do not chain native `Array.prototype` methods when a pipeline can say the same thing.

## Package manager

Use **pnpm** for install, add, remove, and scripts (`pnpm add`, `pnpm install`, `pnpm run …`).

Do not use npm or yarn (`npm install`, `npx`, `package-lock.json`). Prefer `pnpm exec` / `pnpm dlx` over `npx` when a one-off binary is needed.

## Scoped rules

- Frontend (FSD, React, Reatom, Vitest): `src/AGENTS.md`
- Backend (Hono, wrangler, D1): `worker/AGENTS.md`
- End-to-end tests: `e2e/AGENTS.md`
