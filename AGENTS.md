# AGENTS.md

## Package manager

Use **pnpm** for install, add, remove, and scripts (`pnpm add`, `pnpm install`, `pnpm run …`).

Do not use npm or yarn (`npm install`, `npx`, `package-lock.json`). Prefer `pnpm exec` / `pnpm dlx` over `npx` when a one-off binary is needed.

## Architecture (FEOD)

The project follows [FEOD](https://fractal-oriented.tech/en/) (Fractal Entity Oriented Design). Levels are `app`, `pages`, `modules`, `common`, and `global`. Import only through a module’s public `index.ts`. Do not deep-import internals (`ui/`, `model/`, `lib/`, a concrete file inside another module). Do not use `export *` in a public API.

| Level | In this repo | May import |
| --- | --- | --- |
| `app` | `src/router.tsx`, `src/routeTree.gen.ts` (TanStack entry) | `pages`, `modules`, `common` |
| `pages` | `src/routes/` (TanStack file routing) | `modules`, `common` |
| `modules` | `src/modules/<name>/` | `common`, public API of other modules, `@/db` |
| `common` | `src/common/` | other `common` entities (their public path), external packages |
| `global` | `src/global/`, `src/styles/app.css` | nothing from FEOD levels |

`common` must not import `modules`. `pages` must not import `app` or other pages (framework `Outlet` is not a page import). `common` has no barrel at `src/common/index.ts` or `src/common/ui/index.ts`; import `@/common/ui/button`, `@/common/cn`, `@/common/layout`.

**Exceptions**

- `src/routes` is the FEOD `pages` level. Route files stay thin: `createFileRoute`, loaders, `beforeLoad`, and composition. `src/routes/api/*` are server adapters that use module public APIs.
- `src/router.tsx` / `src/routeTree.gen.ts` are the FEOD `app` entry (TanStack requires them at `src/`).
- `src/db` is D1/Drizzle persistence, not a FEOD level. Modules may import `@/db`. No UI or form logic there.
- The root route may import global CSS (`src/styles/app.css`).
- Unit tests stay in `tests/` next to the file, not `__tests__/`.

The career steps page and the profile page share chrome via `src/routes/_protected.tsx` and `src/common/layout`. Do not add a header module.

## Testing

E2E tests live only under `e2e/` (outside `src/`). Use Playwright (`@playwright/test`) with Chromium and `*.spec.ts` names. Run with `pnpm test:e2e`. Do not put Playwright specs in `src/`.

Unit tests live next to the covered file in a `tests/` folder, e.g. `src/modules/auth/schema.ts` → `src/modules/auth/tests/schema.test.ts`. Use Vitest Browser Mode (`pnpm test`). Pattern: `src/**/tests/**/*.test.ts(x)`. Do not use a root `tests/` tree or sibling `src/foo.test.ts` files.

```
src/modules/auth/schema.ts          # entity
src/modules/auth/tests/schema.test.ts  # unit (Vitest)

e2e/sign-in.spec.ts             # e2e (Playwright)
```

## Browser (MCP)

When driving a browser from the agent (UI verification, clicking through the app, inspecting pages), use **Lightpanda MCP** (`lightpanda` namespace). See https://lightpanda.io/docs/usage/mcp.

Use Playwright MCP (`playwright` or `plugin-playwright-playwright`, tools such as `browser_navigate` / `browser_snapshot`) only if Lightpanda is not enough (missing capability, failed interaction, or Lightpanda unavailable). Do not start with Playwright MCP.

This does not change e2e tests: keep Playwright (`@playwright/test`) under `e2e/`.

## Forms

Use **TanStack Form** (`useForm` from `@tanstack/react-form`) plus **shadcn Field** (`Field`, `FieldLabel`, `FieldError`, `FieldGroup` from `src/common/ui/field.tsx`). Validate with a **Valibot** schema passed into TanStack Form `validators.onChange`. On field blur, call `field.handleBlur()` and `field.validate('change')` so that field can show an error without waiting for a keystroke.

Do not use React Hook Form, Zod, or a raw `<form>` without TanStack Form + Valibot.

Show `FieldError` only for the field that was blurred (`field.state.meta.isBlurred && !field.state.meta.isValid`), next to that field. Do not dump every field error on the form at once. A form-level `Alert` is only for server / auth failures, not schema validation.

Disable submit until the Valibot schema accepts the current values, and while submitting. Subscribe to `values` and `isSubmitting`, then `v.safeParse(schema, values).success`. Do not use TanStack’s `canSubmit` or `isValid` for the button: `canSubmit` is true on an untouched form, and `onBlur`/`onMount` error-map entries can stay stale after the values are already valid.

For forms that update an existing entity, also disable submit until any field has changed from the values the form was opened with. Subscribe to `isDirty` together with `values` and `isSubmitting`; disable when `!isDirty` (in addition to invalid or submitting). Create and auth forms stay as they are: disable only when invalid or submitting. Do not enable submit on an update form just because it opened with valid defaults.

## Toasts

After every **create** or **update** server call, show a Sonner toast (`toast` from `sonner`). `<Toaster />` lives in `src/routes/__root.tsx` (`src/common/ui/sonner.tsx`).

Copy includes the **entity name** and the **operation**:

- Success: `Career step “{name}” was created.` / `was updated.`
- Failure: `Could not create career step “{name}”.` / `Could not update career step “{name}”.`

Use `toast.success` and `toast.error`. Capture the name **before** `router.invalidate()`. Do not skip the failure toast because the form also shows an `Alert`.

Create uses the submitted identifying field (career step: `position`). Update success uses the **previous** name when that is the identity shown to the user.

