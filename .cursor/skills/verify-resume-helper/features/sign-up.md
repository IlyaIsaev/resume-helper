# Blocked sign-up

Blocked sign-up lets a guest open `/sign-up`, fill name/email/password, and learn that custom sign-up is unavailable, without creating an account or calling demo-user APIs.

## Sub-features

- `signup-empty` loads `/sign-up` with empty name, email, and password. `Create account` is disabled.
- `signup-toast` enables submit after valid fields, toasts `Sign-up temporarily unavailable.`, and stays on `/sign-up`.
- `signup-api` `POST /api/auth/sign-up/email` returns 403 `{ "message": "Sign-up temporarily unavailable" }`.
- `signup-no-demo` does not call `GET` or `POST /api/demo-user`.

## How to get to it (user POV)

- Open `/sign-up`.
- Choose link `Sign up` on `/sign-in`.
- Choose link `Sign in` on `/sign-up` to return.

## Driving it with cursor-ide-browser

Preconditions:

- Doctor is ok at `http://127.0.0.1:3100`.
- Browser is signed out (signed-in users are redirected from `/sign-up` to `/`).

- **Empty form.** `browser_navigate` to `http://127.0.0.1:3100/sign-up`. Labels `Name`, `Email`, `Password` are empty. Button `Create account` is disabled. Card title `Sign up`. No cookie banner (consent UI is only on `/sign-in`).
- **Fill and submit.** Fill `Name` `Ada`, `Email` `ada@example.com`, `Password` `password1`. `Create account` enables. `browser_click` that button. Text `Sign-up temporarily unavailable.` is visible. URL still ends with `/sign-up`.
- **API.** `curl -sS -o body.json -w "%{http_code}" -X POST http://127.0.0.1:3100/api/auth/sign-up/email -H 'content-type: application/json' -d '{"name":"Ada","email":"ada@example.com","password":"password1"}'` → `403` and body `{"message":"Sign-up temporarily unavailable"}`.
- **Proof.** Snapshot/screenshot of `/sign-up` showing the toast and empty-or-filled form still on that URL. Save the curl status and body next to it.

## Gotchas

- Do not treat this page as a way to create users. Demo accounts are created only by Sign in on `/sign-in`.
- A signed-in session will bounce `/sign-up` to `/`. Sign out first.
- Cookie Decline is not on this page; do not look for it here.
