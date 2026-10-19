# Handoff

Session state for the next agent or developer. Update it at the end of any session
that changed code, contracts, or checks — see the Definition of Done in `AGENTS.md`.
Keep it short and factual: what is true now, what was actually verified, what is not.

## Current state

- Branch: `feature/feeding-nutrition`, with `main` merged in at `bab6138`.
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
  (`hasNewLogsSince`, goal `updatedAt`). The first run shows a progress card. The cards say "goal"
  only when it is provable (a calorie goal unchanged since the run, same target) and "target"
  otherwise: the analysis DTO has no target source.
- Weight history: 1 month / 3 months / 1 year chips (server-side range), chart with axes,
  entries with Edit / Delete.
- The schedule card opens the pet profile on its Reminders tab (`tab` param).
- Pull-to-refresh on the feeding screens, Wellness and every pet-profile tab (`useRefreshControl`).
- Shared pieces touched: `Tabs` (generic over its keys, state-driven indicator, `chips` variant),
  `Card`, `Chip` (`onDark` variant), `Button` (`inline` size), `SectionHeader`,
  `drawer` (footer fade; titles no longer upper-case, `textPrimary`), `theme` (`shadows.card`,
  tight line height 1.25), `PetProfilePage`, `Fab`, `PetListCard`, `HealthPetCard`,
  `(tabs)/_layout`, `pets/_layout`, `jest.setup.ts`.
- `PhotoViewer` (`src/common/components/`) opens a photo full screen in a native `Modal` on a tap
  (pet profile hero and `ProfileAvatar`, only when a photo exists); a tap or Android back closes
  it. No pinch-zoom.
- Account switch: query keys are not user-scoped, so `signOut` clears the query cache and ends the
  session even when deleting the stored tokens fails (logged), and `signIn` clears it again. A
  mutation still in flight at sign-in can write into it. AI-assistant consent is revoked by
  `revokeAiConsent` (`AuthContext.tsx`) at `signOut` and before `signIn` stores new tokens; it is
  stored per device. If the revoke cannot be done, `signIn` throws and stores nothing.
- Legal links: `src/common/utils/legalUrls.ts` builds `/terms.html` and `/privacy.html` from
  `EXPO_PUBLIC_API_URL`. They show in the Welcome agreements dialog, under the Google button on
  `AuthPage` and in a Legal section on Profile, and open in the system browser (an error toast if
  that fails). `AuthPage` gates register on acceptance: without `agreed=1` it starts in login, and
  "Create an account" opens the agreements dialog first.
- Maps: Apple Maps on iOS (iOS 17+; `expo-maps` renders nothing below), Google Maps on Android;
  the 6 s load timeout and POI-as-tap are Android-only. `ExpandableActivityMap` is a static
  preview, and a tap opens a fullscreen `Modal`; that Modal must not register a drawer native
  activity, or the details drawer bounces back on swipe-down. The location picker opens on Poznań
  when no position is known.
- The project is on Expo SDK 55 / React Native 0.83.10 (SDK 56 needs Xcode 26.4+, which macOS
  15.7 cannot run). After switching SDKs run `pnpm install`, `prebuild --clean` and rebuild: a dev
  client built on one SDK against the other's Metro fails with `ReferenceError: Property
'MessageQueue' doesn't exist`.
- App identity is `com.misopets.app` (name "Miso") on both platforms. Gitignored at the root:
  `google-services.json` (pass it to prebuild as `GOOGLE_SERVICES_JSON=./google-services.json`)
  and `GoogleService-Info.plist` (stored, not wired: push is Android-only). `package.json` `main`
  is `src/index.ts`, so the Unistyles config loads before the routes. On iOS, `app.json` passes
  `GoogleUtilities` and `RecaptchaInterop` as `extraPods` with `modular_headers`, or `pod install`
  fails. EAS (`@reflexivecdvs-team/miso`) has `GOOGLE_SERVICES_JSON`, `EXPO_PUBLIC_API_URL`, the
  Google client IDs and `GOOGLE_MAPS_API_KEY` in all three profiles; no EAS build has run with
  them yet.
- Pet notes are first-class entities behind `/api/pets/{petId}/notes`; the route
  `/(tabs)/pets/note` takes `petId` and an optional `noteId`. `SingleNoteEditor` saves on unmount
  and sends only the changed fields.

## Verified evidence

- `pnpm check` on this branch with `main` merged in (SDK 55): lint and typecheck clean, 70 suites
  / 642 tests. `act` warnings come only from suites outside this feature (activity, assistant,
  pet notes) and vary with timing.
- The feeding tests were mutation-checked (about 400 mutants); the survivors are equivalent or
  visual-only.
- Checked on an Android device: the whole Feeding flow (tab, log screen, weight history, goal
  sheet, meal logging through the FAB and through a slot, the analysis run), the drawers, and the
  Home entry with Back.
- Checked before this branch, on a Samsung phone with SDK 55: pets list and profile, the photo
  viewer, Terms opening the HTML page, notification permission with no FCM warning, the activity
  map (current location, fullscreen tap, Poznań default); the whole note CRUD and its offline
  paths against the live backend. iOS: prebuild and pods pass, the welcome screen renders on a
  simulator.
- `noteFieldContract.api-test.ts` pins how the server treats a blank note field: accepted and
  returned as `null`; both blank is a 400; `null` on PATCH clears a field.
- `pnpm test:api` rotates the test account's refresh token, so a device signed in with the same
  account gets signed out.
- Not checked on a device: the analysis error card (a server failure cannot be forced; the
  branches are covered by tests), narrow screens (layout), the account switch, Google sign-in on
  `com.misopets.app`, FCM token registration, the note 404 redirect, iOS sign-in and map taps.
- Feeding was checked on Android only; iOS and web are untested. Elsewhere in the app iOS has
  only been built and opened on a simulator.

## Limitations

- No paid Apple Developer account: iOS push is out of scope (APNs keys need the paid program and
  the backend sends through FCM), so notifications stay Android-only, and TestFlight and a
  physical iPhone are ruled out. Backend follow-up is in Jira KAN-91.
- Accepted: if SecureStore fails to delete the access token at sign-out, the app shows signed out
  but the next start restores that account until its first 401.
- `onAuthenticated` is not awaited (`EmailAuthForm.tsx`, `GoogleAuthButton.tsx`), so a throw from
  `signIn` is an unhandled rejection: the user stays on the auth screen after a success toast.
- `restoreSession`'s `clearStoredSession` (`AuthContext.tsx`) has no catch; a throw leaves the
  app on "loading".
- A note saved offline is queued in memory, so an app kill drops it, and create is not
  idempotent, so retyping while offline lands one note per attempt.
- `behavioralNotes` is still on the pet DTOs and the backend keeps it: its AI analysis needs the
  field. The app no longer reads, writes or clears it, and old values never moved into notes.
- Figma says the analysis covers "Last 7 days" and "Avg actual"; the API returns one day. The app
  shows the date and "Actual". Needs a word from the designer or backend.
- The API does not turn grams or food type into calories, so a meal without calories blocks the
  analysis.
- A slot is hidden by a log tied to its reminder on the same day, so moving that log's `fedAt` to
  another day brings the slot back; what the server returns for such a run was not checked.
- Completing a reminder cannot be undone: deleting a meal does not reopen a missed slot. A
  reminder edited after its slot came due keeps the old, already created run, shown as "Missed".
- Tests run with `TZ=UTC` pinned (`jest.config.js`), so the day-grouping and slot tests cannot
  tell a local calendar day from a UTC one.
- The tab lists today only; a slot set after midnight is tomorrow's and is not fetched.
  `GET /feeding-logs` has no date range, so the log is fetched whole; slots come from 30 days.
- After a meal is deleted the analysis cannot be re-run: the "run again" rule compares timestamps
  and the API stamps no deletions.
- `installOnlineManager.ts` treats `isInternetReachable !== false` as online, so it reports
  online while the probe is still `null`; the global `retry: false` makes that failure terminal.
- `PatchFieldOf*` enum, `DateTime` and `decimal` types have no `null` in the spec.
- `pnpm` ignores `node-linker=hoisted`, so `node_modules` is `isolated` although `AGENTS.md`
  says hoisted. Decide between `nodeLinker: hoisted` in `pnpm-workspace.yaml` and correcting
  `AGENTS.md`.

## Next task

On the SDK 55 build of `com.misopets.app`: sign in with Google and with email, switch accounts
(A, sign out, B) and confirm B sees their own pets and is asked for assistant consent, and
confirm the FCM token reaches the backend. If Google sign-in fails with `DEVELOPER_ERROR`, the
Android OAuth client in project `1000214284290` is missing the package or SHA-1
`5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`; the owner also has to confirm the
Maps key restriction. On the iOS simulator, check Google sign-in with the new iOS client ID. Then
an EAS `preview` Android build, to confirm the EAS variables reach the build.

Feeding: bring back a place in the app for `behavioralNotes` (see Limitations) and decide with the
designer where the field lives. Waiting on the backend: calories from grams, undoing a
completion, `isOverdue`, a weekly analysis mode, the PATCH `null` gap, a target source on the
analysis DTO.
