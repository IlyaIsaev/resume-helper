# Resume Helper verification map

This directory is the maintained source for verifying the user-facing behavior of Resume Helper. Read the index before driving the app, then use the matching feature file as the recipe.

## Baseline preconditions

- Launch with `.cursor/skills/verify-resume-helper/scripts/launch.sh` (default `http://127.0.0.1:3100`).
- Run `.cursor/skills/verify-resume-helper/scripts/doctor.sh` and require `doctor ok` and `{"ok":true}`.
- Repo-root `.dev.vars` exists. Do not use the user's `http://127.0.0.1:3000` session.
- Never drive an instance this skill did not launch.
- Shared local D1: create rows with unique `verify-<unix>-…` names. Do not wipe `.wrangler`.
- Cookie banner: never click `Decline`.

## Driving conventions

- Start every recipe from the baseline state unless its preconditions say otherwise. Sign-in is the gate for career steps, profile, and theme.
- Prefer ARIA roles and accessible names from the skill's Drive table over CSS or coordinates.
- In Cursor IDE, drive with `cursor-ide-browser`. Hover `data-testid="career-step-card"` before Edit/Delete.
- Restore mutated career steps when the recipe created them. Do not remove proof artifacts during cleanup.

## Proof and skip reporting

- Capture the user action and the resulting state, not only the final screen.
- UI proof includes an ARIA snapshot and a screenshot with Sign in or `Resume Helper` visible.
- Mutation proof includes a reload or second view of the stored value.
- Record the feature ID and entry point in `evidence/<run-id>/meta.txt`.
- Report an unreachable path with the attempted URL and the unmet precondition.
- Do not report a skipped entry point as verified through a different path.

## Feature entry contract

Each feature file starts with an H1 title and one paragraph describing the user-visible behavior. It then uses exactly four H2 sections in this order.

1. `Sub-features` lists short IDs with one line for each behavior.
2. `How to get to it (user POV)` lists every user entry point.
3. `Driving it with cursor-ide-browser` starts with `Preconditions:` and uses labeled bullets that pair each user action with an exact command and observable result.
4. `Gotchas` lists traps that can waste or invalidate a verification run.

Keep implementation details out of the map. Name only user paths, stable handles, required state, commands, and observable proof.

## Features

- [Demo sign-in](./sign-in.md) covers guest redirect, prefilled demo credentials, cookie consent, and landing on career steps.
- [Career steps](./career-steps.md) covers create, persist, search, sort, edit, and delete.
- [Profile and session](./profile.md) covers the account menu, profile email, sign out, and account deletion.
- [Blocked sign-up](./sign-up.md) covers the empty form, toast, and API 403.
- [Theme](./theme.md) covers light/dark toggle in the signed-in header.
