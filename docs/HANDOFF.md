# Handoff

Session state for the next agent or developer. Update it at the end of any session
that changed code, contracts, or checks — see the Definition of Done in `AGENTS.md`.
Keep it short and factual: what is true now, what was actually verified, what is not.

## Current state

- Branch: `feature/pet-notes`, merged with `main` at `e503d1d`.
- Notes are first-class entities behind `/api/pets/{petId}/notes`, replacing the free-text
  `behavioralNotes` array on Pet. Route `/(tabs)/pets/note` takes `petId` and an optional
  `noteId`; without a `noteId` it is create mode. Hooks live in `src/pets/queries/notes/`.
- `SingleNoteEditor` has no save button: it saves on unmount. Blank title and blank content
  together delete an existing note, an unchanged one sends nothing, and PATCH carries only
  the fields that changed.
- `useUndoRedoText` checkpoints on a 500 ms typing pause, and commits a pending checkpoint
  before stepping so the edit in flight is not dropped.
- A failed or offline-paused notes fetch renders `QueryErrorState` rather than the
  "note not found" redirect; a 404 still redirects, since no retry could fix it.
- `pnpm test:api` rotates the test account's refresh token, so a device signed in with the
  same account gets signed out.

## Verified evidence

- `pnpm check` — pass: 34 suites, 291 tests. `pnpm test:api` — pass: 28 against the live backend.
- Checked on an Android device against the live backend: the whole note CRUD including
  autosave on exit, and the offline paths — the offline screen on a cold cache, a queued
  save that lands by itself on reconnect, and the retry on a failed fetch.
- Not checked on a device: the 404 redirect and the back button when there is history.
- `noteFieldContract.api-test.ts` pins how the server treats a blank field: it is accepted
  and comes back as `null`, both fields blank is a 400, and `null` on PATCH clears a field.
  `NoteResponseDto` types the fields as `string`, so the `null` is a spec gap.
- Android only. iOS and web untested.

## Limitations

- A note saved offline is queued, not written. The queue is in memory, so an app kill drops
  it, and create is not idempotent, so retyping while offline lands one note per attempt.
- `behavioralNotes` is still on the pet DTOs, but the app no longer reads, writes or clears
  it, and old values never moved into notes. Waiting on the backend to say whether they are
  migrated or dropped.
- `installOnlineManager.ts` treats `isInternetReachable !== false` as online, so it reports
  online while the probe is still `null`. A request can fire into a connection that is not
  usable yet, and the global `retry: false` makes that failure terminal — which is what the
  note screen's Try again runs into. Left alone: the policy is global.
- `PatchFieldOf*` enum types, `PatchFieldOfDateTime` and `PatchFieldOfdecimal` have no
  `null` in the spec, so those fields cannot be cleared through PATCH at all.
- Unfinished from the perf work, and it outlives that branch: pnpm ignores
  `node-linker=hoisted`, so `node_modules` is `isolated` although `AGENTS.md` says hoisted.
  Decide between `nodeLinker: hoisted` in `pnpm-workspace.yaml` and correcting `AGENTS.md`.
  Everything else from that handoff is in `docs/performance-measurement.md` and
  `git log docs/HANDOFF.md`.

## Next task

Nothing bounded on our side: what is left waits on the backend's answer about
`behavioralNotes`.
