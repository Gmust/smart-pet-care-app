# Handoff

Session state for the next agent or developer. Update it at the end of any session
that changed code, contracts, or checks — see the Definition of Done in `AGENTS.md`.
Keep it short and factual: what is true now, what was actually verified, what is not.

## Current state

- Branch: `feature/legal-ios-map` (PR #25), with `main` merged in at `8921356` (photo viewer
  merged as #24).
- `PhotoViewer` (`src/common/components/`) wraps a thumbnail in a `Pressable`; a tap opens
  the photo full screen in a native `Modal` (`contentFit="contain"`, black backdrop). A tap
  anywhere or Android back closes it. Used on the pet profile hero and `ProfileAvatar`, only
  when a photo exists. No pinch-zoom.
- Query keys are not user-scoped and `staleTime` is 1 h, so after switching Google accounts
  the new account saw the old one's profile and pets until an app restart. Now `signOut`
  clears the cache and ends the session even when deleting the stored tokens fails (logged,
  not rethrown), and `signIn` clears the cache again to drop data a mutation that settled
  after sign-out wrote back. One still in flight at sign-in can still write into it.
- AI-assistant consent is revoked by `revokeAiConsent` in `AuthContext.tsx`, from `signOut`
  (before the tokens are cleared) and from `signIn` (before the new tokens are stored, so an
  app killed in between cannot carry the old consent over). It is stored per device, so each
  new sign-in must give its own; a restart or token refresh keeps it. If the delete fails, it
  overwrites the consent with `false` (only `true` counts). If that fails too, `signOut` logs
  and still signs out, while `signIn` throws and stores nothing. `signIn` is the only entry
  point for a new account (`AuthPage`), which also covers a session that expired at startup.
  The local `ai-veterinary-assistant` spec (`openspec/` is gitignored) describes the sign-in
  revoke only, not the one at sign-out.
- `clearStoredSession` attempts all three deletes (`Promise.allSettled`) and throws only when
  the access-token delete fails.
- Legal documents: the app linked `/legal/terms` and `/legal/privacy`, which return 404.
  `src/common/utils/legalUrls.ts` now builds `/terms.html` and `/privacy.html` from
  `EXPO_PUBLIC_API_URL`. The backend contract is the legal-documents API doc (suffixed routes
  are deterministic; bare `/terms` returns a PDF to non-browser clients). The links are shown
  in three places: the Welcome agreements dialog, under the Google button on `AuthPage`
  (Google sign-up records acceptance with no checkbox), and a new Legal section on Profile.
  All open in the system browser through `openLegalUrl`, which shows an error toast if
  `Linking.openURL` rejects (no app for the URL, or a relative URL when `EXPO_PUBLIC_API_URL`
  is unset). The notice under the Google button names Google and shows in login mode too:
  a Google sign-in from login can still create an account.
- `AuthPage` gates register on acceptance. Arriving without `agreed=1` (confirm-email sends
  `mode=login`, or a bare deep link) starts in login, and "Create an account" opens the
  `AgreementsDialog` first. Before this, that switch sent `termsAccepted: false` and the
  backend rejected it with `auth_terms_not_accepted`.
- `useDeleteAccountMutation` no longer clears the cache itself; its only caller signs out
  right after.
- Home wellness card: the three signal values (`SignalStat`) use the `label` text style,
  12px semibold, down from 14px. Not checked on a device.
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

- iOS: `pod install` failed because the Swift pod `AppCheckCore` (from GoogleSignIn 9) needs
  module maps for `GoogleUtilities` and `RecaptchaInterop`. `app.json` now passes both as
  `expo-build-properties` `ios.extraPods` with `modular_headers: true`, so prebuild keeps it.
  The `Cannot find module 'expo-dev-client/package.json'` printed during `pod install` is a
  non-fatal check by `expo-updates`, and it still prints.

- Two latent iOS bugs, found while running the app on an iOS simulator (it had only run on
  Android): (1) `StyleSheet.configure` ran from `src/app/_layout.tsx`, but expo-router can
  evaluate route files first, so `StyleSheet.create` threw "no theme has been selected".
  `package.json` `main` is now `src/index.ts`, which imports the config before
  `expo-router/entry` (the Unistyles Expo Router setup). (2) `drawer.tsx` subscribed to
  `AppState` `"focus"`, which iOS rejects with a red screen; it is now Android-only.
  (3) `ChevronIcon` rotated the root `<Svg>`, which iOS ignores, so every chevron pointed
  right; the rotation is now on the `<Path>`.
- `ActivityMap` renders Apple Maps on iOS (`AppleMaps.View`, no API key) and Google Maps on
  Android. Apple Maps has no load event or POI tap, so the 6 s load timeout and the POI-as-tap
  handler are Android-only. `ActivityMap.test.tsx` covers the iOS branch and fails if the
  timeout also runs on iOS. Seen on an iOS simulator only as far as the screen opening; map
  taps and markers on iOS are not checked yet.
- `ExpandableActivityMap` wraps `ActivityMap` in the create/edit location field and the
  activity details drawer. The small map is a static preview (panning it fought the bottom
  sheet's drag); a tap opens a fullscreen `Modal` where the map pans, zooms and, in the form,
  places the pin, with a Done button. Checked on an Android emulator: the Modal does not
  collapse the drawer, so it no longer registers a drawer native activity — doing so left
  `isRecoveringNativeActivityRef` stuck and the details drawer bounced back on swipe-down.
  The fullscreen camera anchor is frozen at open so placing a pin keeps the zoom; with nothing
  to centre on it is `null`, which `ActivityMap` treats as "set no camera" (only an omitted
  `center` falls back to the first marker). The preview is unmounted while fullscreen is open,
  so one native map is alive, and its remount on close retries a timed-out map. The unit tests mock the
  drawer, so they cannot catch a drawer interaction like that; it needs a device. On an
  unsupported map the fullscreen view still shows the pick hint and Done.
- Apple Maps is gated on iOS 17 (expo-maps renders nothing below it, and the app targets
  16.4), and hides POI labels when picking, since Apple Maps does not report taps on them.
- **The project is on Expo SDK 55 / React Native 0.83.10.** macOS 15.7 cannot run Xcode
  26.4+, which SDK 56 needs, and SDK 55 builds with Xcode 26.0.1. `chore/expo-sdk-55`
  (`156438f`, then merged with this branch) was fast-forwarded into `feature/legal-ios-map`
  at `14d6760`, and `AGENTS.md` and `SETUP.md` now say SDK 55 / RN 0.83. The worktree
  `../smart-pet-care-app-sdk55` was removed. After switching SDKs, run `pnpm install`,
  then `prebuild --clean` for each platform, and rebuild. A dev client built on one SDK and
  pointed at a Metro on the other fails at startup with `ReferenceError: Property
'MessageQueue' doesn't exist`. The dev launcher reconnects to the last server it used, so
  this happens even when the new Metro runs on another port. Simulators now live on the
  internal disk; the old SSD set is kept at
  `~/Library/Developer/CoreSimulator/Devices.ssd-link`.
- The auth screen's "Already have an account? / Create an account" link now sits under the
  email form's submit button, not after Terms/Privacy. On a 1080×2400 phone it was below the
  fold, and with the scroll indicator hidden nothing showed it was there.

- App identity is now `com.misopets.app` on both platforms (was `com.anonymous.*`) and the
  display name is "Miso". The Firebase owner registered `com.misopets.app` on Android and iOS
  in `smart-pet-care-firebase`. Both files are gitignored at the repo root:
  `google-services.json` (now holds both the old and the new Android client) and
  `GoogleService-Info.plist`. The plist is stored, not wired: push is Android-only and
  nothing on iOS reads it. It has no `CLIENT_ID`, so setting `ios.googleServicesFile` while
  `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` is empty would make the google-signin plugin look for a
  `REVERSED_CLIENT_ID` that is not there. Do not add the Firebase iOS SDK through Xcode/SPM
  either: `ios/` is regenerated by prebuild. The Google sign-in client IDs live in a
  different GCP project (`1000214284290`) from Firebase (`807057259896`).
  `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` is now set in the local `.env` (from `1000214284290`),
  and the iOS prebuild puts its reversed form in `CFBundleURLTypes`. iOS Google sign-in
  itself is not checked yet. **Still on the Google Cloud owner**: confirm the Android OAuth
  client for
  `com.misopets.app` with debug SHA-1
  `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25` (also used for release),
  plus the Maps key restriction. EAS (`@reflexivecdvs-team/miso`) had no variables at all;
  it now has `GOOGLE_SERVICES_JSON` (file), `EXPO_PUBLIC_API_URL`,
  `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`, `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` and
  `GOOGLE_MAPS_API_KEY` in development, preview and production, copied from `.env` (one API
  URL for all three). No EAS build has run with them yet.

## Verified evidence

- Photo viewer: `pnpm check` — pass: 34 suites, 291 tests. **Not checked on a device** — no
  Android device was attached. `.expo/types/router.d.ts` was stale (missing `/pets/note`)
  and failed typecheck until `expo start` regenerated it.
- Codex/dual-review fixes (consent before session, abort on double failure, `allSettled`
  token clear, spec): `pnpm check` — pass: 34 suites, 296 tests. The new abort test fails
  without the `throw`, and moving `setStoredSession` back above the consent clear fails
  three order tests. `clearStoredSession` has no test. Not checked on a device.
- Account-switch fix: `pnpm check` — pass: 34 suites, 295 tests. `AuthContext.test.tsx`
  covers the sign-out clear, the order of the sign-in consent and cache clears, a failing
  consent delete, and a failing `clearStoredSession`; each test fails when its fix is
  removed. **Not checked on a device** — the account switch itself is untested.
- Pet notes: `pnpm check` — pass: 34 suites, 291 tests. `pnpm test:api` — pass: 28 against the live backend.
- Checked on an Android device against the live backend: the whole note CRUD including
  autosave on exit, and the offline paths — the offline screen on a cold cache, a queued
  save that lands by itself on reconnect, and the retry on a failed fetch.
- Not checked on a device: the 404 redirect and the back button when there is history.
- `noteFieldContract.api-test.ts` pins how the server treats a blank field: it is accepted
  and comes back as `null`, both fields blank is a 400, and `null` on PATCH clears a field.
  `NoteResponseDto` types the fields as `string`, so the `null` is a spec gap.
- iOS: `expo prebuild -p ios` + `pod install` — pass (144 pods). The iOS app has not been built
  or run.
- Android only. iOS and web untested.

- Legal links + register gate + consent revoke: `pnpm check` — pass: 35 suites, 299 tests.
- Android emulator (`Medium_Phone_API_35`, SDK 56 build from the old `android/` folder):
  app starts through the new `src/index.ts` entry; welcome agreements dialog and the auth
  legal notice render; sign-in; creating a walk with a pin from the fullscreen map; details
  drawer preview and fullscreen render the pin; details drawer closes on swipe-down after
  the fullscreen map (it bounced back before the fix). A Play services auto-update on the
  emulator killed the app once mid-test; unrelated to the code.
  `AuthContext.test.tsx` fails if the sign-in revoke moves after `setStoredSession`, if
  `signOut` drops the revoke, or if the fallback stops logging (each checked by breaking it).
  `AuthPage.test.tsx` covers the gate from confirm-email, a bare deep link, and the welcome
  path. Breaking the switch guard or the initial mode each fails its test. `curl` against production:
  `/terms.html` and `/privacy.html` 200 `text/html`, `/legal/terms` and `/legal/privacy` 404.
  **Not checked on a device** — no Android device was attached.
- Merge of `main` (#24) into this branch: `pnpm check` — pass: 36 suites, 311 tests. The
  consent conflict resolved to `main`'s abort on sign-in plus this branch's revoke on
  sign-out. The abort test fails without the `throw`, and "still signs out when the consent
  cannot be revoked" fails if `signOut` throws on it. Not checked on a device.
- New `google-services.json`: `GOOGLE_SERVICES_JSON=./google-services.json expo prebuild -p
android --clean`, then `expo run:android` on the `Medium_Phone_API_35` emulator. The build
  passed, and `processDebugGoogleServices` passed where it had failed with only the old
  client. `com.misopets.app` installed, and logcat shows `FirebaseApp initialization
successful`. No `com.anonymous.*` app was on the emulator. **Not checked**: obtaining an
  FCM token or registering it with the backend (needs a signed-in session), Google sign-in on
  the new package, and anything on iOS. No code changed, so `pnpm check` was not rerun.
- SDK 55: `prebuild -p ios --clean` + pods passed. `expo run:ios` on the iPhone 17 Pro
  simulator (iOS 26.0) built, and the welcome screen renders from the main tree's Metro.
  `prebuild -p android --clean` + `expo run:android` on a Samsung SM-G781B passed (33 min
  cold), and the welcome and register screens render. The moved auth link shows above the
  fold on that phone. `pnpm check` passed: 36 suites, 311 tests. **Not checked** on either
  platform: sign-in, push, photos, maps, account switch. The link move has no test: it is
  layout.

## Limitations

- No paid Apple Developer account, so iOS push is out of scope: APNs keys need the paid
  program, and the backend sends through FCM, which cannot use the APNs token iOS returns.
  Notifications stay Android-only (`NotificationProvider` returns early on iOS). The same
  account limit rules out TestFlight; the expo-notifications plugin also adds the
  `aps-environment` entitlement, which a free Apple ID cannot sign for a physical iPhone.
  Backend follow-up is tracked in Jira KAN-91.

- Accepted for now: if SecureStore fails to delete the access token at sign-out, the app
  shows signed out but the token survives, and the next app start restores that account
  until its first 401 (the refresh token is most likely gone). No retry flag, since it would
  live in the same storage that just failed.
- `onAuthenticated` is not awaited (`EmailAuthForm.tsx:73`, `GoogleAuthButton.tsx:60`), so a
  throw from `signIn` (no access token, consent not revocable, `setStoredSession` failing)
  is an unhandled rejection: the user stays on the auth screen after a success toast.
- `restoreSession`'s `clearStoredSession` (`AuthContext.tsx`) has no catch; a throw leaves
  the app on "loading".
- A mutation still in flight across an account switch can write the old account's data into
  the new cache; `signIn`'s `queryClient.clear()` narrows the window, it does not close it.
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

On the SDK 55 phone build of `com.misopets.app`, sign in with Google and with email, then
confirm the FCM token reaches the backend (no "Expected an Android FCM token" warning, and a
test push arrives). If Google sign-in fails with `DEVELOPER_ERROR`, the Android OAuth client in
project `1000214284290` is missing the package or SHA-1. On the iOS simulator, check Google
sign-in with the new iOS client ID. Then an EAS `preview` Android build, to confirm the EAS
variables reach the build.

Check the photo viewer on an Android device: tap the pet hero photo and the profile avatar
(Google and custom), confirm the photo opens edge to edge, and that a tap and the back button
close it. A tap on a flag chip should open it too (`pointerEvents: "none"`).
Then switch Google accounts (sign in A, sign out, sign in B) and confirm B's profile and pets
show without a restart, and that the assistant asks B for consent.
Legal links: on the device, tap Terms and Privacy in the Welcome dialog, under the Google
button and on Profile. Each one should open the HTML page in the browser, not a 404 or a PDF.
Then sign in with an unconfirmed email, confirm it, tap "Create an account" on the sign-in
screen and check that the agreements dialog appears before the register form.
Pet notes: what is left waits on the backend's answer about `behavioralNotes`.
