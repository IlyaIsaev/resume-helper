# Theme

Theme lets a signed-in user toggle the header between light and dark. The choice persists in `localStorage` key `theme` and the document `html` class `dark`.

## Sub-features

- `theme-to-dark` changes the toggle from `Switch to dark theme` to `Switch to light theme` and adds class `dark` on `html`.
- `theme-to-light` reverses that.
- `theme-persist` keeps the mode after reload.

## How to get to it (user POV)

- Sign in, then use the icon button in the header next to the account menu.

## Driving it with cursor-ide-browser

Preconditions:

- Doctor is ok at `http://127.0.0.1:3100`.
- Signed in via [sign-in.md](./sign-in.md). Header `Resume Helper` is visible.

- **Toggle dark.** Note the current accessible name. If it is `Switch to dark theme`, `browser_click` it. Name becomes `Switch to light theme`. `document.documentElement.classList.contains('dark')` is true.
- **Toggle light.** Click `Switch to light theme`. Name becomes `Switch to dark theme`. `html` does not have `dark`.
- **Persist.** Set dark, reload `/`. Header still shows `Switch to light theme` and `html` has `dark`.
- **Proof.** Screenshot of the signed-in header in the chosen mode, plus a one-line note of `localStorage.theme` (`light` or `dark`).

## Gotchas

- The toggle is not on `/sign-in` or `/sign-up`; those pages have no header. Prove theme only while signed in.
- Default is light (`theme` atom). A previous drive on the same browser origin can leave `localStorage.theme=dark`.
- Do not add `next-themes`; the app uses the Reatom `theme` atom only.
