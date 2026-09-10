# Frontend

General style, semicolons, one-line guards, immutability, domain naming, and kebab-case come from user-level `~/.cursor/AGENTS.md`. Parent `AGENTS.md` adds `es-toolkit/fp` pipelines and `es-toolkit/types`. This file adds architecture, React, Reatom, UI, and unit-test conventions.

## Architecture

Use [Feature-Sliced Design (FSD)](https://fsd.how). Layers from top to bottom: `app` → `pages` → `features` → `entities` → `shared`. A module may import only from layers **below** it. Slices on the same layer must not import each other except through a public `index.ts` when sharing UI (create → update fields). Do not import a slice's internals (`ui/`, `model/`). Do not use `export *` in a public API. Inside a slice, use relative imports; across slices, use `@/` aliases. Do not adopt `widgets/` or `processes`.

Pages are the exception: see **Pages and routes**. Consume `features/` and `entities/` through their public `index.ts`. `shared/ui` may be imported via `@/shared/ui` or `@/shared/ui/button`. Run `pnpm lint:fsd` (Steiger) to check the import rule.

### Current layout

```text
app/                 ← entrypoint, Reatom logger, routes, Header composition
pages/career-steps/  ← career list layout + edit overlay
  layout/            ← list chrome; loader inits list
  index/             ← empty/list body
  edit/index/        ← /career-steps/:stepId/edit dialog
pages/profile/index/ ← signed-in profile
pages/sign-in/index/ ← demo sign-in + cookie consent
pages/sign-up/index/ ← blocked custom sign-up
features/career-steps/create-career-step/
features/career-steps/update-career-step/
features/career-steps/delete-career-step/
features/theme-switcher/
features/user/user-menu/
features/user/delete-user/
entities/career-step/
shared/{api,auth,theme,config,ui,lib}
```

## Pages and routes

Define routes in `src/app/routes.tsx`. Pages export UI; they do not import from `app/`. Path strings live in `@/shared/config`. Pages and features must not import route atoms from `app/`. Navigate with `urlAtom.go` or path helpers.

- Nest page folders to match `reatomRoute` parent/child inheritance.
- Page `ui/` files have only a default export. Do not add a page slice `index.ts`.
- Load pages with `React.lazy(() => import('@/pages/.../ui/...'))`. Do not statically import page screens in `app/`.
- If a resource is loaded for a route, fetch it in the `reatomRoute` `loader`, then `init*` on the entity. Do not call `clientApi` for that resource from the list UI.
- Auth / invalid URL: `params()` → `.go(..., true)`. Missing resource after fetch: `loader`.

## React

- Declare with `function`, never arrow functions (exception to the parent “prefer arrow functions” rule).
- Always extract props into a separate `type`.

## Reatom

Use [Reatom v1001](https://v1001.reatom.dev) for:

- **State** — `atom`, `computed`, `action`, `effect` from `@reatom/core`
- **Routing** — `reatomRoute` / `urlAtom` (do not add TanStack Router or React Router)
- **Forms** — `reatomForm` + Valibot `schema` (Standard Schema) + shadcn `Form` / `FormField` / `FormMessage` from `@/shared/ui`. Do not add TanStack Form, React Hook Form, or Zod.
- **Async** — `computed` + `withAsyncData` for queries, `action` + `withAsync` for mutations, `clientApi` from `@/shared/api`. Do not add TanStack Query or TanStack DB.

- Import `src/app/setup.ts` before any other app module.
- Name every atom, action, computed, effect, form, and route.
- After `await` or in external callbacks, use `wrap(...)`.
- UI that reads atoms is a `reatomComponent(() => { ... }, 'Name')`. Keep JSX declarative; put multi-step logic in named `action`s.
- Form submit lives in `reatomForm({ onSubmit })`. Show `FormMessage` only when the field was triggered (blur). Disable submit until the schema accepts values and while `!submit.ready()`. Create and update forms also disable when `!form.focus().dirty`. Auth forms disable only when invalid or submitting.
- Do not import `worker/` at runtime. The only allowed `src/` → `worker/` import is `import type { AppType } from '../../../worker'` in `@/shared/api`.

## Toasts

After every **create** or **update** server call, show a Sonner toast (`toast` from `@/shared/ui`). `<Toaster />` lives in `src/app/app.tsx`.

- Success: `Career step “{name}” was created.` / `was updated.`
- Failure: `Could not create career step “{name}”.` / `Could not update career step “{name}”.`

Create uses the submitted `position`. Update success uses the **previous** name. Capture the name before refetch. Do not skip the failure toast because the form also shows an error.

## Auth

- Client: `authClient` in `@/shared/auth`. Session is a Reatom `computed` + `withAsyncData`. Do not use `useSession`.
- On `/sign-in`, `GET /api/demo-user` prefills the form. Credentials stay in the `createdDemoUser` atom, never `document.cookie`. Demo Sign in `POST /api/demo-user`, then `session.retry()`, then toast that demo accounts are deleted after 24 hours. Other emails use `authClient.signIn.email`; on failure toast “This user doesn't exist anymore.”
- On `/sign-up`, the form is empty. Do not call `GET`/`POST /api/demo-user`. Submit only toasts “Sign-up temporarily unavailable.”
- Cookie-consent UI is only on `/sign-in`. Accept sets `cookieConsent=true`. Decline assigns `https://www.google.com`.
- Guests on protected URLs go to `/sign-in` (never auto-navigate to `/sign-up`). Guests on `/sign-in` or `/sign-up` stay. Signed-in users on `/` or auth URLs go to the career list.
- Sign-out returns to `/sign-in` and reuses the same demo pair (`GET /api/demo-user`). Account delete uses `clientApi.deleteUser()` then `/sign-in` with a **new** generated pair.
- Theme is the Reatom `theme` atom (`src/shared/theme`) plus the `.dark` class. Do not add `next-themes`.

## Testing

Vitest Browser Mode (`pnpm test`). Tests under `src/` live in a `tests/` folder next to the code they cover. Do not put Playwright specs in `src/`.
