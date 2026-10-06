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
- **The backend rejects a note whose title or content is empty, which the UI allows.**
  Worked around with a U+200B sentinel (`noteFieldSentinel.ts`): encode on send, decode on
  read. A ticket is open to accept blank fields and reject only when both are empty; remove
  the sentinel once it lands.
- A failed or offline-paused notes fetch renders `QueryErrorState` rather than the
  "note not found" redirect; a 404 still redirects, since no retry could fix it.
- Touched outside `src/pets/`: `src/common/components/` (`QueryErrorState`,
  `RouteErrorFallback`), `src/shadecn/ui/{input,button}.tsx`, `src/styles/theme.ts`,
  `docs/reusable-ui.md`.
- `pnpm test:api` rotates the test account's refresh token, so a device signed in with the
  same account gets signed out.

## Verified evidence

- `pnpm check` — pass: 35 suites, 292 tests. `pnpm test:api` not run.
- The full round trip on an Android device against the live backend: create, read, edit and
  delete, with delete exercised both ways — by clearing both fields, and through the trash
  button and its confirm dialog. Autosave on leaving the screen writes.
- Offline behaviour on the device: a cold cache shows the offline screen instead of
  redirecting away, the note loads by itself once the network returns, and a failed fetch
  shows the error state whose Try again issues a real request.
- Covered by tests only, never seen on a device: the 404 → pet-list redirect, and the back
  button when there is history to pop.
- The sentinel was validated against the live backend, not the spec: a blank field is
  rejected, U+200B is accepted, and `null` on PATCH does **not** clear `title`.
- Android only. iOS and web untested.
- Diploma performance measurement and the release-build fix are in `e503d1d`; results live
  in `perf-out/` (gitignored) and `docs/performance-measurement.md`.

## Limitations

- **Creating a note offline is silently broken.** No toast, nothing in the list, and every
  retry queues another POST. Measured: three attempts offline issued zero requests and then
  three POSTs on reconnect, one note each. A paused mutation never settles, so its `gcTime`
  never starts and the queue has no expiry; nothing persists it, so an app kill drops it
  instead. Stopping the duplicates for good needs idempotency from the backend. Flushing on
  `AppState` → background, still unimplemented, would duplicate notes for the same reason.
- `behavioralNotes` still exists on `PetResponseDto` / `UpdatePetDto` / `CreatePetDto`, but
  nothing reads, writes or clears it, and nothing migrates it into notes. Existing values are
  invisible and undeletable from the UI. With the backend; if the answer is "drop them", the
  field should also come off `CreatePetDto`.
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

One bounded, independently verifiable task:

- Add a `pnpm test:api` contract test for what the sentinel rests on: a note with an empty
  field is rejected, U+200B is accepted, and whether `null` on PATCH clears a field. It pins
  the behaviour the workaround depends on, so the sentinel can be removed safely once the
  backend ticket lands.
