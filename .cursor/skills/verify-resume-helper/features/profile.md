# Profile and session

Profile and session lets a signed-in user open the account menu, see their email on `/profile`, sign out back to prefilled demo sign-in, and delete the account (which mint a new demo pair).

## Sub-features

- `profile-guest` sends a guest from `/profile` to `/sign-in`.
- `profile-menu` opens `Open account menu` with `Profile` and `Sign out`.
- `profile-email` shows the signed-in email on `/profile`.
- `profile-signout` returns to `/sign-in` with the same demo email and password.
- `profile-delete-cancel` closes the delete dialog and keeps the account.
- `profile-delete` permanently deletes the demo user and prefills a **new** demo email.

## How to get to it (user POV)

- Choose `Open account menu` then `Profile` or `Sign out`.
- Open `/profile` while signed in.
- On profile, choose `Delete account`.

## Driving it with cursor-ide-browser

Preconditions:

- Doctor is ok at `http://127.0.0.1:3100`.
- For signed-in recipes, complete [sign-in.md](./sign-in.md) first and record the email.

- **Guest.** While signed out, `browser_navigate` to `http://127.0.0.1:3100/profile`. URL contains `/sign-in`. Button `Sign in` is visible.
- **Menu.** After sign-in, `browser_click` button `Open account menu`. Menuitems `Profile` and `Sign out` are visible.
- **Email.** Choose `Profile`. URL contains `/profile`. Heading `Profile` and the recorded email are visible. Button `Delete account` is visible.
- **Sign out.** From the menu choose `Sign out`. URL contains `/sign-in`. Email and password match the previous demo pair. `Sign in` again returns to `/` with `Open account menu`.
- **Cancel delete.** On `/profile`, choose `Delete account`. Dialog `Delete account` appears. Choose `Cancel`. Dialog gone, URL still `/profile`, email still visible.
- **Delete account.** Only when proving this sub-feature: confirm `Delete` exact. URL is `/sign-in` within 20s. Email matches `demo-user-[8 hex]@demo.com` and is **not** the deleted email. Password is non-empty.
- **Signed-in bounce.** While signed in, open `/sign-in`. URL becomes `/`. Button `Sign in` is absent.
- **Proof.** Snapshot/screenshot of `/profile` with the email, or of `/sign-in` after delete showing a different email. Record both emails in `meta.txt`.

## Gotchas

- Account delete is destructive for that demo user and cascades career steps. Do not run it against a session you still need. Do not wipe D1 to "clean up".
- Confirm button accessible name is `Delete` exact; the page also has `Delete account`.
- Sign-out reuses the same demo pair; delete mints a new pair. Do not mix those assertions.
- `Open account menu` exists only in the signed-in header. Guests on `/sign-in` have no avatar.
