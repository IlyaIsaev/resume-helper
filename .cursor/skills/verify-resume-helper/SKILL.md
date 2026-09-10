---
name: verify-resume-helper
description: Drive Resume Helper's web UI the way a user does (demo sign-in, career steps, profile, blocked sign-up, theme) and capture proof. Use when proving a UI, auth, routing, or career-step change, or after a fix before calling it done.
---

# Verify Resume Helper

Resume Helper is a Vite SPA plus Cloudflare Worker (Hono, local D1, Better Auth). Users track career steps. This skill is the scripted way to launch a disposable instance, drive the real UI, and keep evidence. Read [features/README.md](features/README.md) before a proof; use the matching feature file as the recipe.

Do not treat `pnpm test` or `pnpm test:e2e` as a substitute for a live drive of the changed path. Playwright under `e2e/` is the regression harness and the source of stable ARIA names; mid-task proof still opens the app and exercises the user path.

## Launch

Default verify origin is `http://127.0.0.1:3100` so it does not steal the user's `pnpm dev` on port 3000 (`vite.config.ts` `strictPort: true`).

```bash
.cursor/skills/verify-resume-helper/scripts/launch.sh
```

What it does:

1. Requires repo-root `.dev.vars` (from `.dev.vars.example`: `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`). Do not commit `.dev.vars`.
2. Applies local D1 migrations with `pnpm db:migrate`.
3. Starts `BETTER_AUTH_URL=http://127.0.0.1:3100 pnpm exec vite --host 127.0.0.1 --port 3100`.
4. Waits until `GET /api/health` returns `{"ok":true}`.
5. Writes pid and URL to `.cursor/skills/verify-resume-helper/.run/`.

Ready: `GET http://127.0.0.1:3100/api/health` → `{"ok":true}` (Worker + D1). The SPA document at `/sign-in` contains `<div id="root">`.

Override port with `VERIFY_PORT`. `BETTER_AUTH_URL` must match the origin you open in the browser.

Teardown:

```bash
.cursor/skills/verify-resume-helper/scripts/cleanup.sh
```

Cleanup kills only the pid `launch.sh` wrote. It never deletes `evidence/`, never kills by process name, never wipes `.wrangler` / D1, and never touches the listener on port 3000.

Isolation:

- Two Vite processes can listen on different ports. They share the same local D1 under `.wrangler`. That is not full data isolation.
- Do not drive the user's `:3000` session. Do not run `clear-local-db` or delete `.wrangler` as verification cleanup.
- Cursor IDE browser cookies are per origin; `:3100` does not share the `:3000` session cookie.
- Refuse to start if `:3100` is already taken by a process this skill did not launch.
- Auth POSTs are rate-limited (`AUTH_RATE_LIMITER`, 30 / 10s). Do not hammer Sign in.

## Doctor

Run first whenever anything looks off, and after launch before the first click:

```bash
.cursor/skills/verify-resume-helper/scripts/doctor.sh
```

Pass means: `.dev.vars` exists, the launch pid is alive, that pid owns `VERIFY_PORT`, `/api/health` is `{"ok":true}`, `/sign-in` is the SPA. Fail means stop driving; relaunch or fix env. Do not click through a random process on that port.

Run launch/doctor/cleanup in a shell that can see the launched pid (`kill -0`). A sandbox that hides other processes reports `pid is not running` even when Vite is up.

## Drive

Pick the browser from `.cursor/rules/browser-mcp.mdc`:

- Cursor Agents in the IDE: `cursor-ide-browser` (`browser_navigate`, `browser_lock`, `browser_snapshot`, `browser_click`, `browser_fill`, `browser_take_screenshot`). Do not use Lightpanda in that environment.
- CLI / non-IDE: Lightpanda MCP. Playwright MCP only if Lightpanda cannot do the interaction.
- `pnpm test:e2e` (Chromium, `e2e/*.spec.ts`, `webServer` on port 3100) is the automated regression suite, not the mid-task proof loop.

Workflow for an IDE drive:

1. `launch.sh` then `doctor.sh`.
2. `browser_navigate` to `http://127.0.0.1:3100/` (or `/sign-in`).
3. `browser_lock` with `action: "lock"`.
4. `browser_snapshot` after every navigation or submit. Click by current snapshot refs. Prefer roles and accessible names below over CSS or coordinates.
5. `browser_lock` with `action: "unlock"` when the drive is finished.

Guest `/` redirects to `/sign-in`. Demo credentials are prefilled (`GET /api/demo-user`); email matches `demo-user-[8 hex]@demo.com`. Click **Sign in** — do not type a new password unless the feature file says so. Never click **Decline** on the cookie banner (it navigates to Google). **Accept** is optional for sign-in; e2e sign-in does not click it.

After sign-in, URL is `/`, **Open account menu** and **Add career step** are visible, and a notifications region contains `Demo accounts are deleted after 24 hours.`

Stable handles (from `e2e/` and the UI):

| Control | Role / name |
|---|---|
| Sign in submit | button `Sign in` |
| Email / password | labels `Email` / `Password` (Playwright also matches `email` / `password`) |
| Cookie banner | heading `We use cookies`; buttons `Accept`, `Decline` |
| Sign up link | link `Sign up` → `/sign-up` |
| Create account | button `Create account` |
| Add career step | button `Add career step` (focused when the career page opens) |
| Create dialog | dialog; heading `Add career step`; labels `Position`, `Start`, `End`, `Description`, `Technologies`; submit `Save career step` |
| Start date | textbox `Start`, or button `Select start date` then calendar `Today, …` |
| Search | searchbox `Search career steps` |
| Sort | combobox `Sort career steps`; options `Newest`, `Oldest` |
| Card | `data-testid="career-step-card"` (edit/delete hidden until hover or focus-within) |
| Edit | link `Edit career step` → `/career-steps/:id/edit`; dialog heading `Edit career step`; submit `Update career step` |
| Close edit | button `Close` (returns to `/`) |
| Delete step | button `Delete career step` → dialog `Delete career step`; confirm `Delete` exact, or `Cancel` |
| Account menu | button `Open account menu`; menuitems `Profile`, `Sign out` |
| Profile | heading `Profile`; user email text; button `Delete account` |
| Delete account | dialog `Delete account`; confirm `Delete` exact, or `Cancel` |
| Theme | button `Switch to dark theme` / `Switch to light theme` (header, signed-in only) |
| Brand | link `Resume Helper` → `/` |
| Toasts | region matching `Notifications` |

Create/update toasts (curly quotes): `Career step “{name}” was created.` / `was updated.` Update success uses the **previous** position. Delete: `Career step “{name}” was deleted.` Sign-up submit toasts `Sign-up temporarily unavailable.` and stays on `/sign-up`. Empty list: `No career steps yet.` Search miss: `No career steps match your search.` End date placeholder `Present` means ongoing.

Use a unique position such as `verify-<unix>-Staff` so shared D1 rows are identifiable. Hover the card before Edit/Delete. Save stays disabled until the create/update form is dirty and valid; blur fields to show `FormMessage`.

Do not call test-only endpoints. `GET`/`POST /api/demo-user` and `/api/auth/*` are production app APIs; still prove via the UI, not by POSTing a session from curl, except the sign-up feature's explicit `POST /api/auth/sign-up/email` 403 check.

## Evidence

Directory: `.cursor/skills/verify-resume-helper/evidence/<run-id>/` where `<run-id>` is UTC `YYYYMMDD-HHMMSS` plus the feature id (example: `evidence/20260910-121500-sign-in/`).

`browser_take_screenshot` may write under Cursor's temp `screenshots/` tree even when given a workspace path. Copy the PNG into `evidence/<run-id>/` before cleanup.

Capture all of:

- Doctor stdout (`doctor.txt`).
- Action plus result: ARIA snapshot after the click/submit (`after.aria.yml` from `browser_snapshot`) and a screenshot with app identity visible (`after.png` — `Sign in` card or header `Resume Helper`).
- Side effect: reload the page (or reopen the card) and capture a second snapshot showing persisted state. For sign-in, **Open account menu** after reload is enough session proof; for career steps, the card text after reload.
- Feature id and URL in `meta.txt`.

Proof standards:

- Exercise the real user path, not internal atoms or test-only routes.
- Capture the action and the resulting state, not only the final screen.
- Verify persistence (reload or second view) alongside what is visible.
- Do not mock Better Auth or D1.
- Never click **Decline**.
- Never delete the user's `:3000` data. Delete-account and delete-career-step only against the demo user this drive signed in as, and only when that feature file requires it.

Cleanup must not remove this directory.

## Cleanup

```bash
.cursor/skills/verify-resume-helper/scripts/cleanup.sh
```

After a failed iteration, run cleanup (or doctor + targeted UI reset) so a wedged dialog does not poison the next attempt. Leave evidence in place. Do not `wrangler d1` reset.

## Helpers

All scripts are executable. Run them from any cwd; they resolve the repo root themselves.

| Script | Invocation |
|---|---|
| Launch | `.cursor/skills/verify-resume-helper/scripts/launch.sh` |
| Doctor | `.cursor/skills/verify-resume-helper/scripts/doctor.sh` |
| Cleanup | `.cursor/skills/verify-resume-helper/scripts/cleanup.sh` |

`launch.sh` calls `scripts/detach-vite.py` so the Vite process survives the helper exiting. Do not invoke the Python file directly.

Optional: `VERIFY_PORT=3200` for a second parallel instance. Remember D1 is still shared.
