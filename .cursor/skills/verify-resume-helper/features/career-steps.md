# Career steps

Career steps lets a signed-in user record a role, see it on a card, search and sort the list, edit from the card or URL, and delete it.

## Sub-features

- `steps-create` opens `Add career step`, saves position/dates/description/technologies, and toasts `Career step “{position}” was created.`
- `steps-persist` still shows the card after reload.
- `steps-search` filters across position, description, technologies, and date text, including the empty match state.
- `steps-sort` orders by start date `Newest` or `Oldest`.
- `steps-edit` opens `/career-steps/:id/edit`, updates the position, toasts using the **previous** name, and returns to `/`.
- `steps-delete` confirms deletion, toasts `Career step “{name}” was deleted.`, and shows `No career steps yet.` when the list is empty.

## How to get to it (user POV)

- After sign-in, the home URL `/` is the list. `Add career step` is focused.
- Choose `Add career step`.
- Hover a card and choose `Edit career step` or `Delete career step`.
- Open `/career-steps/:id/edit` directly.
- Type in `Search career steps`. Change `Sort career steps`.

## Driving it with cursor-ide-browser

Preconditions:

- Doctor is ok at `http://127.0.0.1:3100`.
- Signed in via [sign-in.md](./sign-in.md). URL is `/`. `Add career step` is visible.
- Use a unique position `verify-<unix>-Engineer` so shared D1 rows are obvious.

- **Open create.** Choose `Add career step`. Run `browser_click` on button `Add career step`. Dialog heading `Add career step` appears. End textbox placeholder is `Present`.
- **Fill and save.** Fill `Position`, choose start via `Select start date` then `Today, …` (or type `15 Jan 2020` into `Start`), fill `Description` and `Technologies`. Run `browser_click` on `Save career step` once it is enabled. Dialog hides. Toast `Career step “verify-…-Engineer” was created.` Card `data-testid="career-step-card"` shows the position, `Present` (if no end date), description, and technologies.
- **Persist.** Reload `/`. The same card text is still visible.
- **Search.** Fill searchbox `Search career steps` with a unique description token. Only matching cards remain. Fill `no such career step`. Text `No career steps match your search.` appears. Clear the searchbox; the full list returns.
- **Sort.** With two steps on different start dates, open combobox `Sort career steps` and choose `Oldest`. The earlier start date is first. `Newest` puts the later start first. Options `Position A–Z` / `Position Z–A` must not exist.
- **Edit.** Hover the card, choose link `Edit career step`. URL matches `/career-steps/<id>/edit`. Dialog heading `Edit career step`. `Update career step` is disabled until a field changes. Change `Position` and submit. Toast uses the **previous** position. URL is `/`. New title is on the card; old title is gone. Reload to confirm.
- **Close edit.** Reopen edit and choose `Close`. Dialog hides, URL is `/`, card unchanged.
- **Delete.** Hover the card, choose `Delete career step`. Dialog heading `Delete career step`. `Cancel` keeps the card through reload. Confirm with button `Delete` exact. Toast `Career step “{name}” was deleted.` If this was the last card, `No career steps yet.` survives reload.
- **Proof.** Snapshot and screenshot the populated list (or empty state after delete) under `evidence/<run-id>/` with the unique position visible or confirmed absent.

## Gotchas

- `Save career step` / `Update career step` stay disabled while `!dirty` or invalid. Blur to see field messages.
- Edit/delete controls are `opacity-0` until hover or focus-within. Snapshot may still list them; click without hover can miss.
- Update toast quotes the previous position, not the new one.
- The list virtualizes: at most about 10 cards in the DOM even when `data-loaded-count` is higher. Scroll `[data-testid=career-step-list]` to bring a card into view.
- Typed dates parse on input; the displayed value uses the app's date format after blur.
- Do not delete unrelated cards that belong to other demo users in shared D1; this session only shows the signed-in user's rows.
