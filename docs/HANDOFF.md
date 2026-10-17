# Handoff

Session state for the next agent or developer. Update it at the end of any session
that changed code, contracts, or checks — see the Definition of Done in `AGENTS.md`.
Keep it short and factual: what is true now, what was actually verified, what is not.

## Current state

- Branch: `feature/feeding-nutrition`.
- The Wellness screen moved from `/pets/wellness` (route removed) into the first tab of
  `AssessmentPage` (`/(tabs)/pets/assessment?petId=…`), opened by the "Assessment" button on a pet
  card.
- Pet screens opened from Home pass `from: "home"` and return to Home on Back
  (`useBackToOrigin`).
- The 7-day chart shows each bar's value for 3 s after a tap on the card (a second tap hides
  them) and while a finger is held on it for 300 ms.
- Meals: log, edit, delete (from the tab, the log screen and the FAB). Tapping a schedule slot
  logs the meal with the reminder's `reminderId`, which makes the server record the completion;
  `POST /reminders/{id}/complete` is still sent after it and answers `alreadyRecorded: true`. If
  that fails, the meal stays saved and a toast says the slot was not closed. A blank name takes
  the reminder's title. A slot hides while a log tied to its reminder exists that day; a slot
  past its time shows "Missed" (device clock, `isOverdue` is unreliable).
- Analysis: one call analyses one day. It runs only with a meal today and calories on all of
  today's meals; a repeat needs a meal added or edited, or the goal changed, since the last run
  (`hasNewLogsSince`, goal `updatedAt`). The first run shows a progress card.
- Weight history: 1 month / 3 months / 1 year chips (server-side range), chart with axes,
  entries with Edit / Delete.
- The schedule card opens the pet profile on its Reminders tab (`tab` param).
- Pull-to-refresh on the feeding screens, Wellness and every pet-profile tab (`useRefreshControl`).
- Shared pieces touched: `Tabs` (generic over its keys, state-driven indicator, `chips` variant),
  `Card`, `Chip` (`onDark` variant), `Button` (`inline` size), `SectionHeader`, `drawer` (footer
  fade; titles no longer upper-case, `textPrimary`), `theme` (`shadows.card`, tight line height
  1.25), `PetProfilePage`, `Fab`, `PetListCard`, `HealthPetCard`, `(tabs)/_layout`,
  `pets/_layout`, `jest.setup.ts`.

## Verified evidence

- `pnpm check`: lint and typecheck clean, 68 suites / 609 tests. `act` warnings come only from
  suites outside this feature (activity, assistant, pet notes) and vary with timing.
- The feeding tests were mutation-checked (about 400 mutants); the survivors are equivalent or
  visual-only.
- Checked on an Android device: the whole Feeding flow (tab, log screen, weight history, goal
  sheet, meal logging through the FAB and through a slot, the analysis run), the drawers, and the
  Home entry with Back.
- Not checked on a device: the analysis error card (a server failure cannot be forced; the
  branches are covered by tests), narrow screens (layout).
- `pnpm test:api` rotates the test account's refresh token, so a device signed in with the same
  account gets signed out.
- Android only. iOS and web untested.

## Limitations

- Figma says the analysis covers "Last 7 days" and "Avg actual"; the API returns one day. The app
  shows the date and "Actual". Needs a word from the designer or backend.
- The API does not turn grams or food type into calories, so a meal without calories blocks the
  analysis.
- Completing a reminder cannot be undone: deleting a meal does not reopen a missed slot. A
  reminder edited after its slot came due keeps the old, already created run, shown as "Missed".
- Tests run with `TZ=UTC` pinned (`jest.config.js`), so the day-grouping and slot tests cannot
  tell a local calendar day from a UTC one.
- The tab lists today only; a slot set after midnight is tomorrow's and is not fetched.
  `GET /feeding-logs` has no date range, so the log is fetched whole; slots come from 30 days.
- After a meal is deleted the analysis cannot be re-run: the "run again" rule compares timestamps
  and the API stamps no deletions.
- A note saved offline is queued in memory, so an app kill drops it, and create is not
  idempotent, so retyping while offline lands one note per attempt.
- `behavioralNotes` is still on the pet DTOs and the backend keeps it: its AI analysis needs the
  field. The app no longer reads, writes or clears it, and old values never moved into notes.
- `PatchFieldOf*` enum, `DateTime` and `decimal` types have no `null` in the spec.
- `installOnlineManager.ts` treats `isInternetReachable !== false` as online, so it reports
  online while the probe is still `null`; the global `retry: false` makes that failure terminal.
- `pnpm` ignores `node-linker=hoisted`, so `node_modules` is `isolated` although `AGENTS.md`
  says hoisted. Decide between `nodeLinker: hoisted` in `pnpm-workspace.yaml` and correcting
  `AGENTS.md`.

## Next task

Bring back a place in the app for `behavioralNotes` (see Limitations): decide with the designer
where the field lives, since the notes feature no longer has it. Waiting on the backend: calories
from grams, undoing a completion, `isOverdue`, a weekly analysis mode, the PATCH `null` gap.
