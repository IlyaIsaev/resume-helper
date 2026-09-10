# End-to-end tests

Playwright specs for the app. General style and naming come from the parent `AGENTS.md`. Unit tests live in `src/**/tests/` and `worker/**/*.test.ts` (see `src/AGENTS.md`).

- Specs live in this folder as `*.spec.ts` (`sign-in`, `sign-up`, `profile`, `career-step`).
- Run with `pnpm test:e2e` (Chromium). `webServer` is the Vite SPA (`pnpm exec vite --port 3100`).
- Do not put e2e specs in `src/`.
- Demo auth uses `/sign-in` + prefilled `demo-user-…@demo.com` (`e2e/demo-user.ts`), not public `/sign-up`.
- Cookie banner is on `/sign-in`. Accept stays; Decline leaves for Google. Do not click Decline in other specs.
- Career-step and profile specs sign in via that demo path.
