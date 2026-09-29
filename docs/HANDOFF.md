# Handoff

Session state for the next agent or developer. Update it at the end of any session
that changed code, contracts, or checks — see the Definition of Done in `AGENTS.md`.
Keep it short and factual: what is true now, what was actually verified, what is not.

## Current state

- Branch: `feature/testing-agentic-repo-setup-skill`.
- Agent workflow set up: `AGENTS.md` is the single source of truth; `CLAUDE.md`
  imports it. `pnpm check` is the one quality gate (lint + typecheck + test).
- Product features implemented: `src/activity`, `src/assistant`, `src/auth`,
  `src/health`, `src/home`, `src/notifications`, `src/pets`, `src/profile`.
  `src/health` is the reference feature shape.

## Verified evidence

- `pnpm check` — pass (2026-09-08). `expo lint`, `tsc --noEmit`, and Jest
  (19 suites, 179 tests) all green.
- CI (`.github/workflows/ci.yml`) runs the same steps plus `expo export`.

## Limitations

- Nothing verified on a device or emulator this session. A green suite is not
  evidence that native modules, permissions, or platform UI work.
- `src/api/generated/` is gitignored; run `pnpm api:generate` after install or a
  spec change, or imports from `src/api/index.ts` will fail.
- Known spec gap: `PatchFieldOf*` enum types have no `null` member, so enum fields
  cannot be cleared through PATCH. Not worked around in code; raise with backend.

## Next task

One bounded, independently verifiable task:

- _(none queued)_

## Completion fields

Fill these in when closing out work:

- Outcome: Added canonical authorship, project-component, contributor and licensing documentation.
- Files / contracts changed: `README.md`, `PROJECT_AGREEMENT.md`, `PROJECT_COMPONENTS.md`,
  `CONTRIBUTORS.md`, and `LICENSE`; agent-workflow documentation was also updated.
- Checks run and results: Documentation links verified locally; no code checks run (docs-only change).
- Platforms actually tested: None; no platform behavior changed.
- Remaining limitations: `PROJECT_AGREEMENT.md` remains proposed until contributors explicitly accept it.
- Next bounded task: _(none queued)_
