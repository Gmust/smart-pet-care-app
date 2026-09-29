# Handoff

Session state for the next agent or developer. Update it at the end of any session
that changed code, contracts, or checks — see the Definition of Done in `AGENTS.md`.
Keep it short and factual: what is true now, what was actually verified, what is not.

## Current state

- Branch: `feature/welness-score` (PR #21), merged with `main` at `c870b49`.
- Backend error contract v1 adopted: `src/errors/` holds the alias translations
  (`errors` namespace) and `getApiError` / `getApiErrorMessage` / `setApiFieldErrors`.
  Screens branch on `code`; the convention is in `AGENTS.md` → API Layer.
- Auth interceptor refreshes only on `auth_authentication_required` (or a code-less
  401); `postApiAuthRefresh` is bound to `noAuthApi`, so a refresh can never hang.
- `pnpm test:api` runs contract tests against the real backend (`.env`:
  `EXPO_PUBLIC_API_URL`, and `API_TEST_EMAIL` / `API_TEST_PASSWORD` for a dedicated,
  confirmed test account — the suite rotates its refresh token).

## Verified evidence

- `pnpm check` — pass (2026-09-29): 30 suites, 257 tests. CI green on PR #21.
- `pnpm test:api` — pass (2026-09-29): 24/24 against the live backend.
- Real-server facts the code relies on: `errors` keys are PascalCase DTO names;
  a new pet's wellness evaluation is 422 `wellness_insufficient_data`; chat pages
  allow `limit` 1–8.
- Device pass (2026-09-29, Samsung S20 FE, Android 13, debug build, live backend),
  checked on screen and, where it matters, against server state:
  wrong password stays on the form; expired access token (15 min) refreshes
  silently and a write after expiry lands; sign-out stays signed out; assistant
  answers; health type switch stores no leftover symptoms/notes; an unchanged edit
  closes without error; a reminder edit keeps another device's concurrent change;
  a new pet shows "No score yet"; the reminder drawer preselects the pet from its
  profile; the actions menu is in the accessibility tree; Maestro 04 and 05 pass.

## Limitations

- Not verified on a device: login with an unconfirmed email and the confirmation
  code errors (need an inbox); assistant failure/retry paths and the wellness
  "Try again" card (offline pauses queries instead of failing them); photo over the
  size limit; `HealthPetCard` "/100" (only shown with a score).
- Offline with no cache, the wellness page claims "No wellness score yet" and drops
  the pet name from its hint (pre-existing).
- Maestro 03 (photo upload) not run: it would upload an image from the device gallery.
- `src/api/generated/` is gitignored; run `pnpm api:generate` after install or a
  spec change, or imports from `src/api/index.ts` will fail.
- Known spec gaps: `PatchFieldOf*` enum types and `PatchFieldOfDateTime` have no
  `null`, so those fields cannot be cleared through PATCH. Not worked around.
- Backend issues to raise: register repeats `auth_email_invalid` twice; empty chat
  text returns both `chat_message_text_required` and `_too_long`; the spec still
  declares `ProblemDetails` on most 4xx responses.

## Next task

One bounded, independently verifiable task:

- Device check of the confirmation-code flows with a fresh, unconfirmed account.

## Completion fields

- Outcome: Error contract v1 adopted app-wide; review findings fixed (auth refresh
  hang and loop, 409 handling, field errors, PATCH diffs, health type leak, wellness
  codes, perf tooling aborts).
- Files / contracts changed: `src/errors/**`, `src/api/{index,interceptors}.ts`,
  assistant/auth/forms error handling, `AGENTS.md` (errors rule, `test:api`),
  `package.json` (`test:api`, formatted `api:fetch`), `scripts/perf.sh`, `.maestro/04,05`.
- Checks run and results: `pnpm check` and `pnpm test:api` green as above; each fix
  has a test confirmed to fail without it.
- Platforms actually tested: None (Jest + live API only).
- Remaining limitations: see Limitations.
- Next bounded task: Android device pass.
