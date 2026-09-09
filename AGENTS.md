# AGENTS.md

## Package manager

Use **pnpm** for install, add, remove, and scripts (`pnpm add`, `pnpm install`, `pnpm run …`).

Do not use npm or yarn (`npm install`, `npx`, `package-lock.json`). Prefer `pnpm exec` / `pnpm dlx` over `npx` when a one-off binary is needed.

## Architecture (FSD)

The project follows [Feature-Sliced Design](https://fsd.how/) 2.x. Layers from top to bottom: `app`, `pages`, `widgets`, `entities`, `shared`. Do not add `processes` (deprecated) or empty layers. A module may import only from layers **below** it. Slices on the same layer must not import each other. Import a slice only through its public `index.ts`. Do not deep-import internals (`ui/`, `model/`, `api/`, `lib/`). Do not use `export *` in a public API. Inside a slice, use relative imports; across slices, use `@/` aliases.

| Layer | In this repo | May import |
| --- | --- | --- |
| `app` | `src/app/` (router, file routes, theme, styles) | `pages`, `widgets`, `entities`, `shared` |
| `pages` | `src/pages/<slice>/` | `widgets`, `entities`, `shared` |
| `widgets` | `src/widgets/<slice>/` | `entities`, `shared` |
| `entities` | `src/entities/<slice>/` | `shared` |
| `shared` | `src/shared/` (segments, no slices) | other `shared` segments, external packages |

`app` and `shared` have segments, not slices; those segments may import each other. `shared/ui` has no barrel: import `@/shared/ui/button`, `@/shared/lib/cn`. Run `pnpm lint:fsd` (Steiger) to check the import rule.

**Exceptions**

- `src/app/routes` is TanStack Start file routing. Route files stay thin: `createFileRoute`, loaders, `beforeLoad`, and passing data into page components as props. Pages must not import from `app` (do not call `Route.useLoaderData()` inside `pages/`). `src/app/routes/api/*` are server adapters.
- `src/app/router.tsx` / `src/app/routeTree.gen.ts` are the TanStack entry (`vite.config.ts` points `router.entry` and `routesDirectory` at `app/`).
- D1/Drizzle lives in `src/shared/db`. Better Auth’s factory (`getAuth`) is imported from `@/shared/config`. No UI or form logic there.
- The root route may import app CSS (`src/app/styles/app.css`).
- Unit tests stay in `tests/` next to the slice, not `__tests__/`.

Career steps and profile share chrome via `src/widgets/header`, composed from `src/app/routes/_protected.tsx`.

## Testing

E2E tests live only under `e2e/` (outside `src/`). Use Playwright (`@playwright/test`) with Chromium and `*.spec.ts` names. Run with `pnpm test:e2e`. Do not put Playwright specs in `src/`.

Unit tests live next to the covered file in a `tests/` folder, e.g. `src/entities/session/model/schema.ts` → `src/entities/session/tests/schema.test.ts`. Use Vitest Browser Mode (`pnpm test`). Pattern: `src/**/tests/**/*.test.ts(x)`. Do not use a root `tests/` tree or sibling `src/foo.test.ts` files.

```
src/entities/session/model/schema.ts          # entity
src/entities/session/tests/schema.test.ts  # unit (Vitest)

e2e/sign-in.spec.ts             # e2e (Playwright)
```

## Browser (MCP)

When driving a browser from the agent (UI verification, clicking through the app, inspecting pages), pick the browser by environment:

- **Cursor Agents in the Cursor IDE**: use the built-in Cursor Agents browser (`cursor-ide-browser` namespace: `browser_navigate`, `browser_snapshot`, `browser_click`, `browser_lock`, etc.). Do **not** use Lightpanda in that environment.
- **CLI / non-IDE agents** (or environments without the Cursor IDE browser): use **Lightpanda MCP** (`lightpanda` / `user-lightpanda`). See https://lightpanda.io/docs/usage/mcp. Use Playwright MCP (`playwright` or `plugin-playwright-playwright`) only if Lightpanda is not enough (missing capability, failed interaction, or Lightpanda unavailable). Do not start with Playwright MCP.

This does not change e2e tests: keep Playwright (`@playwright/test`) under `e2e/`.

## Forms

Use **TanStack Form** (`useForm` from `@tanstack/react-form`) plus **shadcn Field** (`Field`, `FieldLabel`, `FieldError`, `FieldGroup` from `src/shared/ui/field.tsx`). Validate with a **Valibot** schema passed into TanStack Form `validators.onChange`. On field blur, call `field.handleBlur()` and `field.validate('change')` so that field can show an error without waiting for a keystroke.

Do not use React Hook Form, Zod, or a raw `<form>` without TanStack Form + Valibot.

Show `FieldError` only for the field that was blurred (`field.state.meta.isBlurred && !field.state.meta.isValid`), next to that field. Do not dump every field error on the form at once. A form-level `Alert` is only for server / auth failures, not schema validation.

Disable submit until the Valibot schema accepts the current values, and while submitting. Subscribe to `values` and `isSubmitting`, then `v.safeParse(schema, values).success`. Do not use TanStack’s `canSubmit` or `isValid` for the button: `canSubmit` is true on an untouched form, and `onBlur`/`onMount` error-map entries can stay stale after the values are already valid.

For forms that update an existing entity, also disable submit until any field has changed from the values the form was opened with. Subscribe to `isDirty` together with `values` and `isSubmitting`; disable when `!isDirty` (in addition to invalid or submitting). Create and auth forms stay as they are: disable only when invalid or submitting. Do not enable submit on an update form just because it opened with valid defaults.

## Toasts

After every **create** or **update** server call, show a Sonner toast (`toast` from `sonner`). `<Toaster />` lives in `src/app/routes/__root.tsx` (`src/shared/ui/sonner.tsx`).

Copy includes the **entity name** and the **operation**:

- Success: `Career step “{name}” was created.` / `was updated.`
- Failure: `Could not create career step “{name}”.` / `Could not update career step “{name}”.`

Use `toast.success` and `toast.error`. Capture the name **before** `router.invalidate()`. Do not skip the failure toast because the form also shows an `Alert`.

Create uses the submitted identifying field (career step: `position`). Update success uses the **previous** name when that is the identity shown to the user.

