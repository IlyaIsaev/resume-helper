# AGENTS.md

## Package manager

Use **pnpm** for install, add, remove, and scripts (`pnpm add`, `pnpm install`, `pnpm run …`).

Do not use npm or yarn (`npm install`, `npx`, `package-lock.json`). Prefer `pnpm exec` / `pnpm dlx` over `npx` when a one-off binary is needed.

## Testing

E2E tests live only under `e2e/` (outside `src/`). Use Playwright (`@playwright/test`) with Chromium and `*.spec.ts` names. Run with `pnpm test:e2e`. Do not put Playwright specs in `src/`.

Unit tests live next to the covered file in a `tests/` folder, e.g. `src/lib/auth/schema.ts` → `src/lib/auth/tests/schema.test.ts`. Use Vitest Browser Mode (`pnpm test`). Pattern: `src/**/tests/**/*.test.ts(x)`. Do not use a root `tests/` tree or sibling `src/foo.test.ts` files.

```
src/lib/auth/schema.ts          # entity
src/lib/auth/tests/schema.test.ts  # unit (Vitest)

e2e/sign-in.spec.ts             # e2e (Playwright)
```

## Browser (MCP)

When driving a browser from the agent (UI verification, clicking through the app, inspecting pages), use **Lightpanda MCP** (`lightpanda` namespace). See https://lightpanda.io/docs/usage/mcp.

Use Playwright MCP (`playwright` or `plugin-playwright-playwright`, tools such as `browser_navigate` / `browser_snapshot`) only if Lightpanda is not enough (missing capability, failed interaction, or Lightpanda unavailable). Do not start with Playwright MCP.

This does not change e2e tests: keep Playwright (`@playwright/test`) under `e2e/`.

## Forms

Use **TanStack Form** (`useForm` from `@tanstack/react-form`) plus **shadcn Field** (`Field`, `FieldLabel`, `FieldError`, `FieldGroup` from `src/components/ui/field.tsx`). Validate with a **Valibot** schema passed into TanStack Form `validators.onChange`. On field blur, call `field.handleBlur()` and `field.validate('change')` so that field can show an error without waiting for a keystroke.

Do not use React Hook Form, Zod, or a raw `<form>` without TanStack Form + Valibot.

Show `FieldError` only for the field that was blurred (`field.state.meta.isBlurred && !field.state.meta.isValid`), next to that field. Do not dump every field error on the form at once. A form-level `Alert` is only for server / auth failures, not schema validation.

Disable submit until the Valibot schema accepts the current values, and while submitting. Subscribe to `values` and `isSubmitting`, then `v.safeParse(schema, values).success`. Do not use TanStack’s `canSubmit` or `isValid` for the button: `canSubmit` is true on an untouched form, and `onBlur`/`onMount` error-map entries can stay stale after the values are already valid.

