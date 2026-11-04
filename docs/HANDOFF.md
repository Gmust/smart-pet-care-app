# Handoff

Session state for the next agent or developer. Update it at the end of any session
that changed code, contracts, or checks — see the Definition of Done in `AGENTS.md`.
Keep it short and factual: what is true now, what was actually verified, what is not.

## Current state

- Branch: `feature/password-reset`, off `main` at `7f312ac` (auth redesign merged).
- Password reset v1 (backend spec "Password reset v1"; `pnpm api:update` pulled
  `forgot-password` / `reset-password`):
  - Sign-in has "Forgot password?" → `(auth)/forgot-password` (email prefilled). Every `202`
    shows "Check your inbox" with "Send again": the server answers the same for unknown addresses.
  - The emailed link is `https://smart-pet-care.duckdns.org/reset-password?token=…`. The app
    declares it as an Android App Link (`app.json` `intentFilters`, `autoVerify`) for
    `(auth)/reset-password`. Reached without the app (desktop, app missing, link not verified),
    the API's page only says to open the link on a phone with Miso installed; it no longer hands
    the token to `miso://`. The scheme changed `smartpetcareapp` → `miso` to match the backend's
    default `PASSWORD_RESET_APP_LINK`; nothing else used the old scheme.
  - **Release blocker lifted on 2026-11-04** (backend fix in Jira KAN-93, follow-up to KAN-92).
    The blocker was a `miso://` fallback that carried the token, so any app registering `miso`
    could take over the account. Rule in `AGENTS.md`. Checked against the live API:
    `/.well-known/assetlinks.json` answers `200 application/json` without a redirect, for
    `com.misopets.app` with the debug SHA-256
    `FA:C6:17:45:DC:09:03:78:6F:B9:ED:E6:2A:96:2B:39:9F:73:48:F0:BB:6F:89:9B:83:32:66:75:91:03:3B:9C`
    only. `GET /reset-password` with a live token shows "Your reset link is ready / open this link
    on your phone" with no link, script, meta refresh or echoed token (`Cache-Control: no-store`,
    `Referrer-Policy: no-referrer`); a dead token shows "This link no longer works". The OpenAPI
    spec did not change. Only the debug key is listed because the APKs handed to testers are built
    locally, and `release` in the generated `build.gradle` signs with the debug key too. iOS
    Universal Links are out of scope (no paid Apple account).

  - **Known limitation: that key is public.** `debug.keystore` is the stock React Native template
    key, identical in every RN project. Anyone can sign an APK as `com.misopets.app` with it; it
    would pass App Link verification and could even install over Miso as an update. It needs the
    victim to sideload it, which is far harder than registering `miso://`, so it is acceptable for
    tester builds. Before real users: own signing key (EAS), its SHA-256 into `assetlinks.json`,
    its SHA-1 into the Google Android OAuth client (sign-in is bound to the debug SHA-1 today),
    and every tester reinstalls once (a new signature cannot update the old APK).
  - Reset posts token + new password (register rules, shared `newPassword` in `auth.schema.ts`).
    `204` → toast; signed out → sign-in, signed in → `dismissTo("/(tabs)/home")` (not
    `replace("/")`, which would mount a second `(tabs)`). No `signOut` here: the link may belong to
    another account, and if it was this one, the revoked refresh token signs the device out via
    `setUnauthorizedHandler` on the next refresh. `auth_reset_token_invalid` / `_expired` → Forgot
    password. The token is parsed with zod (`resetPasswordRouteParamsSchema`): missing, blank or
    repeated → "This link is incomplete" instead of the form.
  - Reachable signed in, so neither screen offers sign-in over a live session: Reset hides its
    footer unless `unauthenticated`; Forgot shows "Back to the app" (`/(tabs)/home`) when signed
    in, "Back to sign in" when signed out, nothing while `loading`.
  - Push re-registration after a reset needs nothing new: `NotificationProvider` posts the device
    token on every sign-in.
  - `AuthHeader` gained an optional `icon` badge. `ConfirmEmailPage` still draws its own badge.
  - Not done: a 60 s cooldown on "Send again" (the server sends nothing inside 60 s; the old link
    stays live).
  - Verified: `pnpm check`, `ResetPasswordPage.test.tsx` (9 cases) and
    `ForgotPasswordPage.test.tsx` (5), each new branch checked to fail when broken, real API: an invalid token returns `400 auth_reset_token_invalid`, an empty
    one `errors.Token: auth_reset_token_required`. On the S20 FE (debug build, before the review
    fixes): `miso://reset-password?token=bogus` cold-starts into the reset screen; Save → "This
    reset link no longer works" and Forgot password; an address with no account → "Check your
    inbox"; Back to sign in; the sign-in link carries the typed email over. After the fixes and a
    `prebuild`: the manifest has the `autoVerify` https filter, `pm get-app-links` shows the debug
    signature above and state `1024` (verification failed: no `assetlinks.json` yet);
    `https://…/reset-password` opened with the package set shows "This link is incomplete" →
    Request a new link → Forgot password; with `?token=` it shows the form. On the device after
    the second review round: `…/reset-password?token=a&token=b` cold-starts into "This link is
    incomplete", no crash. Both screens scroll with `KeyboardAwareScrollView`: the confirm field
    used to sit under the keyboard (found in manual testing, fix checked on the device). The
    developer then tested the flow by hand on the S20 FE and reported it working.
  - Verified on 2026-11-04 on the S20 FE (Android 13, debug build of this branch, after KAN-93):
    `pm get-app-links com.misopets.app` → `smart-pet-care.duckdns.org: verified`;
    `resolve-activity` for the https link → `com.misopets.app/.MainActivity` (no chooser). By the
    developer, by hand: a real emailed link opened the app straight on the reset screen, the reset
    succeeded, sign-in with the new password worked, and a second device signed in to the same
    account was signed out on its next refresh. Not verified on a device: the signed-in paths of
    the second review round (Back to the app, `dismissTo` home).

- Auth redesign (Figma "Full Design"): Welcome, SignIn and SignUp are separate routes and Confirm
  email is rebuilt in the same style. Terms are a checkbox on sign-up; Google asks in a consent
  sheet on both screens, and the server records no consent for it.
- Shared pieces touched: new `Checkbox` and `ActionRow`; `Button` (`tonal`, `secondary`,
  `dangerText`, `inline` size; no `lg`); `DialogTitle` (`titleL` in all dialogs); `Input` type;
  `theme` (`controlS/M/L`, `shadows.card`, tight line height 1.25); `Tabs` (generic over its keys,
  state-driven indicator, `chips` variant); `Card` (`pressDelay`); `Chip` (`onDark` variant);
  `Text`; `SectionHeader`; `drawer` (footer fade, titles no longer upper-case, scrollable drawers
  claim taps so a tap inside does not reach the backdrop); `DropdownMenuContent` (safe-area
  insets); `PetProfilePage`, `Fab`, `PetListCard`, `HealthPetCard`, `(tabs)/_layout`,
  `pets/_layout`, `jest.setup.ts`.
- Reminders: the edit form no longer offers pet or type (the PATCH takes neither), a saved PATCH
  response goes into the detail cache, and query keys live in `reminderQueryKeys`.
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
- `PhotoViewer` (`src/common/components/`) opens a photo full screen in a native `Modal` on a tap
  (pet profile hero and `ProfileAvatar`, only when a photo exists); a tap or Android back closes
  it. No pinch-zoom.
- Account switch: query keys are not user-scoped, so `signOut` clears the query cache and ends the
  session even when deleting the stored tokens fails (logged), and `signIn` clears it again. A
  mutation still in flight at sign-in can write into it. AI-assistant consent is revoked by
  `revokeAiConsent` (`AuthContext.tsx`) at `signOut` and before `signIn` stores new tokens; it is
  stored per device. If the revoke cannot be done, `signIn` throws and stores nothing.
- Legal links: `src/common/utils/legalUrls.ts` builds `/terms.html` and `/privacy.html` from
  `EXPO_PUBLIC_API_URL`. They show in the sign-up consent row, in the Google consent sheet and in a
  Legal section on Profile, and open in the system browser (an error toast if that fails).
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

- `pnpm check` on this branch (SDK 55): lint and typecheck clean, 74 suites / 666 tests. `act`
  warnings come only from suites outside this feature (activity, assistant, pet notes) and vary
  with timing.
- The feeding tests were mutation-checked (about 400 mutants); the survivors are equivalent or
  visual-only.
- Checked on an Android device: the auth screens (Welcome, SignIn, SignUp, the consent sheet,
  Confirm email), the button, dialog and drawer restyling, taps inside scrollable
  drawers (`Gesture.Manual` in `drawer.tsx`), the dropdown near the bottom edge, and editing a
  reminder's time twice in a row.
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

Password reset, signed in, on a device: Forgot password shows "Back to the app" (→ Home), and a
reset opened while signed in returns Home through `dismissTo`. Before a build goes to real users:
an own signing key (EAS), its SHA-256 into `assetlinks.json` (backend) and its SHA-1 into the
Google Android OAuth client. `android/` still lists the old `smartpetcareapp` scheme next to
`miso` until a `prebuild --clean`.

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
