# Demo sign-in

Demo sign-in lets a guest reach `/sign-in`, use prefilled demo credentials, accept cookies without leaving the app, and land on the career-step list as a signed-in user.

## Sub-features

- `signin-redirect` sends guests from `/` and other protected URLs to `/sign-in`.
- `signin-prefill` fills email `demo-user-[8 hex]@demo.com` and a non-empty password via `GET /api/demo-user` (no POST yet).
- `signin-consent-accept` hides `We use cookies` after `Accept` and sets `cookieConsent=true`.
- `signin-submit` creates/signs in the demo user and opens career steps.

## How to get to it (user POV)

- Open `/` while signed out.
- Open `/sign-in` directly.
- Open `/profile` or `/career-steps/:id/edit` while signed out (redirects to `/sign-in`).
- Follow the `Sign in` link from `/sign-up`.

## Driving it with cursor-ide-browser

Preconditions:

- Doctor reports `doctor ok` at `http://127.0.0.1:3100`.
- The browser is not already signed in on that origin (or use a fresh browser tab).
- Do not click `Decline`.

- **Guest redirect.** Open `/`. Run `browser_navigate` to `http://127.0.0.1:3100/`. URL ends with `/sign-in`. Button `Sign in` is visible. Heading `We use cookies` is visible unless this browser already accepted cookies on this origin.
- **Prefill.** Read labels `Email` and `Password`. Email matches `demo-user-[8 hex]@demo.com`. Password is not empty. Link `Sign up` is visible.
- **Accept cookies.** Choose `Accept`. Run `browser_click` on button `Accept`. Heading `We use cookies` is gone. `Sign in` remains. Reload `/sign-in`; the banner stays gone.
- **Submit.** Choose `Sign in`. Run `browser_click` on button `Sign in`. URL becomes `/` within 20s. Button `Open account menu` is visible. Button `Add career step` is visible. Region `Notifications` contains `Demo accounts are deleted after 24 hours.`
- **Proof.** Save `browser_snapshot` and a screenshot showing header `Resume Helper` and `Add career step` under `evidence/<run-id>/`. Reload `/` and confirm `Open account menu` remains (session cookie). Write `meta.txt` with feature id `signin-submit` and the demo email.

## Gotchas

- `Decline` assigns `https://www.google.com` and leaves the app. Never use it in other features.
- Credentials live in an HttpOnly cookie, not `document.cookie` as `createdDemoUser`. Do not assert that name in `document.cookie`.
- Signed-in users who open `/sign-in` are sent to `/`. That is a different feature (`profile.md` signed-in bounce); prove guest sign-in in a signed-out browser.
- POST `/api/demo-user` happens on submit, not on page load. Prefill uses GET only.
- Auth POST rate limit is 30 / 10s. Failed retries can 429.
