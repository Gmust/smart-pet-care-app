# Handoff

Session state for the next agent or developer. Update it at the end of any session
that changed code, contracts, or checks — see the Definition of Done in `AGENTS.md`.
Keep it short and factual: what is true now, what was actually verified, what is not.

## Current state

- Pet list mode (Figma "Pet list setting", node `2765:5587`). A device-wide choice kept in SecureStore
  (`petListModeStorage`, `"on"`/`"off"`, nothing stored until the user decides); `PetListModeProvider`
  sits in `AppProvider`. The Pets tab (`PetsTabPage`) shows `PetListPage` when it is on and the pet
  profile otherwise. Settings screen `PetListSettingsPage` is a hidden tab route
  (`(tabs)/pet-list-settings`, so back follows tab history and the Pets tab stays lit); reached from
  Profile → Customize app, the settings button in the "Choose a pet" drawer (replaces the "X";
  `DrawerHeaderButton`; off on Activity and the Home Fab pickers via `showSettings={false}`; the sheet
  height follows the pet count, capped at 94%) and the list header. `PetListSuggestionDrawer` opens on the Pets tab at 5+
  pets (`PET_LIST_SUGGESTION_THRESHOLD`) while nothing is stored; Switch stores `on`, Don’t show again stores
  `off`; closing the sheet stores nothing and hides it until the next launch (kept in the provider, so
  a remount does not bring it back); it also stays shut while the pets query is stale (`isStale`), since
  right after a delete the cache still holds the old count. Never switches on its own. New: `SettingRow`, `Callout`, `ProfileLinkRow`,
  settings and arrow-right icons, `Switch` `accessibilityLabel`. `pnpm check` green (85 suites, 723 tests).
  On the phone: Profile block, settings (toggle, tiles, back), list with the new header button,
  drawer button, back from each entry. Not checked: the suggestion sheet (needs an unset choice and
  5 pets), Home and Activity entries through the drawer, iOS.
- Review fixes: `theme.textStyles.labelCaps` (Figma: Inter SemiBold 12, 0.3% spacing) replaces hand-set `letterSpacing` on uppercase labels (dropdown, select, reminders, home cards); the score and "/100" on the Home pet card no longer override the `display`/`titleL` spacing; `hitSlop` on the search-clear button follows `(minTouchTarget - size) / 2` (larger areas elsewhere were left alone); `SelectContent` defaults `sideOffset` to `spacing(1.5)`; `DialogCloseButton` label is translated; `button.tsx` lost its base `fontFamily` (every `hug` button is icon-only). `DESIGN.md` typography, colours and component typography now mirror `theme.ts`/`palette.ts`. `pnpm check` green (85 suites, 726 tests). Not checked on a device: caps-label spacing, Select menu offset. Open: `tabs.tsx` pill still sets Inter Medium 12 by hand (no token; used by `RemindersPage`); `HomeHeader` forces `letterSpacing: 0` on `titleL`.
- Pet list card (`src/pets/components/pet-list/PetListCard.tsx`) lost its "View info" action bar: the whole card is the tap target, as in Figma. `pets:petListCard.viewInfo` removed. The list page is shown by `PetsTabPage` when list mode is on; looked at on the phone.
- Branch: `main` at `ef012b0`, with #29 (EAS `updates.url`), #30 (reminder status) and #31
  (password reset) merged on 2026-11-04.
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
    in, "Back to sign in" when signed out, nothing while `loading`. Reset's Save is disabled while
    `loading` (and `onSubmit` returns early): the destination after a reset is picked from
    `status`, and a cold start from the App Link would otherwise send a soon-signed-in device to
    sign-in. The test fails only with both guards removed; each one alone holds it.
  - Push re-registration after a reset needs nothing new: `NotificationProvider` posts the device
    token on every sign-in.
  - `AuthHeader` gained an optional `icon` badge. `ConfirmEmailPage` still draws its own badge.
  - Not done: a 60 s cooldown on "Send again" (the server sends nothing inside 60 s; the old link
    stays live).
  - Verified: `pnpm check`, `ResetPasswordPage.test.tsx` (10 cases) and
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
  - Verified on 2026-11-04 on the S20 FE (Android 13, debug build of #31, after KAN-93):
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
- Reminder status (#30): API `status: Completed` means "no triggers
  left", not "done". `getReminderStatus` shows `Completed` with `lastCompletedAt: null` as
  "Missed" (a one-off that fired and was ignored used to read "Done"). The push status prompt no
  longer PATCHes `Missed`, from its button or on dismiss: any status but `Active` switches the
  reminder off in the scheduler, so a dismissed prompt stopped a recurring reminder for good.
  "Cancel reminder" still PATCHes `Cancelled` until the backend offers `/cancel`.
- Deleting a pet (`useDeletePet`) invalidates the whole query cache. The server deletes the pet's
  reminders, meals, activities, records and notes with it, and with the one-hour `staleTime`
  Home kept showing a deleted pet's reminder until the app restarted (found in the 2026-11-05
  device run).
- Species (branch `feature/all-animal-species`): the create and edit pickers offer every
  `AnimalSpecies` but `Unknown`. `PET_SPECIES` (`src/pets/constants.ts`) is derived from the
  generated enum, so a species the backend adds shows up after `pnpm api:generate`, and typecheck
  fails until it has a `pets:species.*` key. `useSpeciesLabel` translates the species on the
  profile Basics row, the profile flag and the assistant pet picker, which showed raw values such
  as `GuineaPig`. `PetSpeciesImage`: Hamster and Guinea pig → `RatIcon`, Fish → `FishSymbolIcon`,
  Other → `PawPrintIcon`, and new `BirdIcon` / `TurtleIcon` copied from Lucide 1.70.0 (the
  existing `RatIcon` matches that release path for path). Unknown or no species stays blank, and
  the profile flag skips it instead of showing a green "Unknown". Edit Pet now PATCHes only the
  fields that changed (`src/pets/utils/buildPetPatch.ts`): text trimmed, blank list rows dropped,
  a cleared list sent as `null` and a cleared breed as `""` (the server reads `breed: null` as "not
  sent"), and an unchanged species never resent. The server rejects `species: "Unknown"` with
  `pet_species_invalid`, so before this every save of a pet stored as `Unknown` failed; and every
  field went out raw (`allergies: [""]`), overwriting concurrent edits. Edit Pet no longer has a
  Weight field (`editPetSchema` = create schema minus `weightKg`): `UpdatePetDto` has no
  `weightKg` and the server ignores it (`{"weightKg": 10}` alone → `pet_update_empty`), so a typed
  weight was thrown away behind a success toast. Weight changes through the weight log
  (pet profile → Feeding tab → weight history); creating a pet seeds its first log entry.
- The Wellness screen moved from `/pets/wellness` (route removed) into the pet profile's
  Wellness tab (`/(tabs)/pets/pet-profile?petId=…&tab=wellness`). The separate Assessment page and
  its "Assessment" button on the pet card are gone.
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
- The schedule card opens the global reminders screen (`/(tabs)/reminders`).
- Pull-to-refresh on every pet-profile tab (Overview, Health, Wellness, Feeding) through
  `useRefreshControl`.
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
  Google client IDs and `GOOGLE_MAPS_API_KEY` in all three profiles. The first EAS build,
  `preview` Android `0d70eeee` from `7f312ac`, finished on 29 October 2026 (runtime `3ac597b4…`).
  It was built before #29, so it still carries the old `updates.url` and receives no OTA
  updates. EAS generated the release keystore on that run: SHA-1
  `36:C5:68:76:55:DC:E9:1F:DB:02:6F:7F:3C:49:A8:70:CC:BE:BB:3F`.
- `updates.url` pointed at the pre-rename EAS project `05b59c80` while `projectId` was
  `44433327` (miso); it now matches. Run `eas build`/`eas update` from the CLI with
  `GOOGLE_SERVICES_JSON=./google-services.json` (see `SETUP.md`); without it the first build
  failed with "Runtime version mismatch".
- From #29 (`a13e83c`): `preview` build `746acf59` and update group `674a99de` share
  runtime `6d41f023…`. The `preview` channel had no linked branch, so no APK on it could get an
  update; it now points at the `preview` branch (an EAS-side setting, not in the repo).
- Pet notes are first-class entities behind `/api/pets/{petId}/notes`; the route
  `/(tabs)/pets/note` takes `petId` and an optional `noteId`. `SingleNoteEditor` saves on unmount
  and sends only the changed fields.

- Pet profile cleanup (branch `chore/pet-profile-tabs-cleanup`, from `origin/main` `0af2a57`;
  PR #36):
  - Pet profile tabs are Overview / Health / Wellness / Feeding. Care, Reminders and the
    Recommendations placeholder are removed, and `AssessmentPage` with its route, params schema
    and hero is deleted; its Wellness and Feeding content now renders in `PetProfilePage`, and the
    Home wellness card opens `pet-profile?tab=wellness`. An old `tab=reminders` link opens
    Overview (the schema's `.catch`).
  - Reminder rows show the pet name before the time (`usePetNames`, looked up from the cached pets
    list because reminders carry only `petId`).
  - Health > Basics is one card with a sliding `Tabs variant="track"` switch (Allergies /
    Conditions / Behavior), a pencil (`EditBasicsDrawer`, all three lists) and a plus
    (`AddBasicsItemDrawer`, one item appended). Both send only the changed lists
    (`buildBasicsPatch`); the plus replaces the whole list server-side, so a concurrent edit of the
    same list is overwritten.
  - The profile top bar is the pet switcher (`PetSwitcher` + `PetPickerDrawer`, moved from
    `src/activity` to `src/common/components`; the `petSelector` copy moved to the `common`
    namespace). The picker has an "Add a new pet" action (`onCreatePet`, profile only). The chosen
    pet is shared by Activity and the profile (`PetSelectionProvider` in `AppProvider`,
    `usePetSelection`); a pick that is no longer in the list falls back to the first pet. The
    profile has no back button at the tab root; the pushed `pet-profile` route (list mode, Home links) shows one, and the hardware back honours `from=home`.
  - The Pets tab (`(tabs)/pets/index`) renders `PetsTabPage`: `PetProfilePage`, or `PetListPage` when list mode is on; `petId` in the profile's params is optional
    and selects that pet once the pets are loaded (a link to a pet that is gone keeps the current pick and toasts "Pet not found"). With no pets it shows an "Add a new pet" empty state; a failed pets request shows the error state, not the empty one.
  - `PetListPage` and `PetListCard` are the list mode of the Pets tab (a setting, off by default);
    the assessment button was removed from the card.
  - Look at on the phone (written without a device): the Basics card gliding between segments,
    the switcher/hero morph between Overview and the other tabs (`heroEntering` / `heroExiting`
    in `PetProfilePage`), tap-outside to drop focus in the pet drawers (`DrawerKeyboardDismiss`),
    and the add-to-list drawer, 75 % tall with no scroll: field and Save sit at the top and stay
    above the keyboard (seen on the phone).
  - Creating a pet is two steps (Figma node 2622:4269): "About your pet" (name, species, weight,
    birth date, breed, sex as chips) and an optional "Add health info" (allergies, chronic
    conditions, behavior; lists start empty, a blank row disappears on blur). One form
    (`useCreatePetForm`) holds both steps and the pet is created only on the last "Add pet";
    "Next" stays disabled (it fades between the two looks) until name, species and a weight above
    zero are valid; errors show under a field once it was left. A tap on the header or on empty
    space drops the focus (`DrawerKeyboardDismiss` around the whole sheet content). The sheet is a
    fixed 94% scrollable drawer like the reminder one (header and footer fades come from it), so it does not
    change height with the keyboard. The main button is the sheet's footer, always visible. Only once the keyboard has fully opened does a copy appear as the
    last item of the fields, so it can be scrolled to; it is removed as soon as the keyboard starts to close, before the
    footer is uncovered (that overlap showed as a second, cropped button). "Clear form" sits under the footer button on the first step only (also drawn in the Figma Step 1 frames with a draft). The scroll ends above the whole footer fade (footer height + `DRAWER_FOOTER_SOFT_FADE_SPACING`), so the last "Add ..." row is clear of the gradient and the button. The "i" hint is `InfoHint`, built on the shared `Tooltip` (`src/shadecn/ui/tooltip.tsx`): a card with an arrow that points at its trigger, shifted left of it so the arrow clears the rounded corner. The floating footer is 8 lower than the sheet default, and a tall footer gets a taller fade, so the Sex chips are not cropped when every field shows an error. The scroll header fade now shows (the header wrapper has a z-index so it paints over the scroll), and the footer takes `softFade`: a fade that turns fully white exactly at the footer top. A text field that holds only spaces is emptied on blur, so it does not count as a draft. The required-field messages follow the Figma copy ("Name is required" etc.). "Edit pet info" no longer has the health lists: they are edited from the
    Health tab only. Closing the drawer keeps what was typed on both steps and reopens on step 1. The draft is one for every entry point
    (Home, the picker, the empty state): `CreatePetDraftProvider` in the `(tabs)` layout holds the form, so signing out
    unmounts it and drops the draft; a created pet or the "Clear form" link under the main button empties it. It is not
    stored on disk, so an app restart loses it. Not built from the Figma: the tooltip arrow (the "i" opens a menu-style
    popover), and the species value keeps the shared Select's own text style. The copy of the
    allergies and behavior hints is mine, only the chronic-conditions text is from the design.
    Checked on the phone: sheet height, keyboard on both steps, scrolling to the main button, focus on
    a new row. The tooltips still need a look.
  - Edit pet: changing only the name lit the birth date red ("Enter a valid birth date") although the date was
    untouched. The server returns the birth date as a date-time without a zone, and the schema accepted only "Z";
    `birthDate` now takes "Z", an offset or no zone (`create-pet.schema.test.ts`). Checked on the phone with Miso
    (name changed, nothing saved). Whether the server's value really has no zone was inferred from the fix, not read from the response.
  - Card press: every tappable card now highlights with `surfacePage` and waits a short delay first, so a scroll
    over it does not leave it lit (Feeding's behaviour). The delays moved from `src/feeding/constants.ts` to
    `src/common/constants.ts`. Applied to: Health tab rows and history cards, `ReminderRow` (the overdue red card
    too), `ActivityCard` (now with a 1px border), notes (`NoteRow`, the empty notes card), `AddPetCard` on Home and the
    pet choice in the assistant. `HealthRecordCard` was left out on purpose. Checked on the phone by holding a card:
    Health, Activity, the overdue reminder. Not checked: notes, the Home "Add a new pet" card, the assistant pet choice, the
    Reminders page itself.
  - Hero chips: "Allergies" and "Chronic condition" on the pet photo are tappable and open a `Tooltip` with the
    items (`PetFlag.details`, built in `PetProfilePage`, drawn by `FlagChip`). There is no species chip any more: a pet with no allergies and no chronic
    conditions shows no chip at all. The card is `Tooltip` `variant="white"` (light, dark text, narrow, no "Got it"). A tap on
    the empty part of the chip row reaches the photo (`pointerEvents: "box-none"`). Checked on the
    phone: both chips, and the photo still opens. Not checked: long lists, a chip near the right edge, TalkBack.
    `FlagChip` now draws a `Chip` with the new `variant="onPhoto"` (translucent brown fill, peach outline, light label), inside a
    `Pressable` for the tooltip. The AI button on the photo uses a 16 icon like the one on Home. The translucent fill is
    `${brand.peachDefault}80` in both `chip.tsx` and `button.tsx`.
  - The AI button on the pet photo is `Button` `variant="iconOnPhoto"`: the same translucent brown fill, peach outline and light icon as the
    status chips there. The fill is built from `brand.peachDefault` (as in the `onPhoto` chip). Checked on the phone in its normal state; not pressed, not disabled.
  - Not done yet: Figma's share button on Wellness and Feeding is
    not built (the profile keeps its "..." menu). The Basics card shows Figma's dashed "Add ..."
    button when the active list is empty. `PetSwitcher` follows Figma (sunken chip, Title/M name,
    36 px avatar, no avatar on Overview), so the Activity chip changed with it.

- Pet photo frame: `PET_PHOTO_ASPECT` in `src/pets/constants.ts` feeds the picker's crop editor, the
  `ImagePicker` preview and the profile hero (height from `usePetHeroHeight`, because a style
  `aspectRatio` left the hero narrower than the page margins on the S20 FE). Set to 16:9; 2:1 was
  looked at on the phone and is a one-line change. iOS ignores `aspect` in the system editor, so
  there the crop is still square: a custom cropper is needed for a true match. Where the photo sits
  in the avatar circle is undecided (the backend has no focal-point field).
- `PetProfilePageSkeleton` now mirrors the Overview tab (name chip, framed hero, tabs, Basics and
  Notes lists); only checked in typecheck and lint, the loading state was too short to catch on the phone.
- `Tooltip`: the arrow ignores the card's first, parked layout, so it no longer jumps for a chip at
  the left edge (open state checked on the phone; the jump itself was not seen frame by frame).
  Every dropdown menu and tooltip now opens and closes at once (the overlay's `FadeIn`/`FadeOut` are gone): on Android the
  card's fill, shadow and border faded apart (seen at a slowed 4 s fade), which showed as a flash.
  `needsOffscreenAlphaCompositing` did not help. Checked on the phone: the card is gone 0.3 s after the tap.
- LEGACY font tokens (`theme.fonts`, `theme.fontSize`, `theme.textSizing`) removed where the
  PERMANENT style matches exactly: `bodySemiBold` (reminder add buttons, `ReminderRow` title),
  `label` (reminder group titles, `DropdownMenuLabel`); the dead `trendLabel` style in
  `HealthPetCard` is deleted; the `DrawerTitle` size overrides in `EditPetDrawer` and
  `UploadPetPhotoDrawer` are gone (title is now `titleL` 24 with its own letter spacing).
  `pnpm check` passes. The remaining LEGACY cases were migrated later in this branch; the tokens
  are gone from `theme.ts`.
- `DrawerDescription` is now `body` 15 in `textSecondary` (was Regular 16, slate-600); its only user is
  `SignOutDrawer`; it spans the drawer's full content width (negative margin cancels the header's
  side padding, which only the title needs). Seen on the phone after an app restart (fast refresh
  did not pick the change up).
- `ImagePicker`: placeholder is `body`; the "Remove" control is now `Button` `dangerText`/`inline`
  (`bodySemiBold`) with the `imagePicker.remove` string (was a hardcoded, untranslated `Pressable`).
  Its `label` prop is passed by no caller; it is `bodyS` now (removal undecided). The drawer
  description is centered like the title (not yet seen on the phone).
- `AddPetCard`: title `titleM`, subtitle `bodyS`, icon `iconSize["2xl"]` (24), dashed border
  `spacing(0.375)` (1.5, as in `Input`); `EditPetDrawer` select labels `bodyS` like `Input` labels.
  `pnpm check` passes; not yet looked at on the phone.
- Assistant `PetSelection`: pet name and state titles `titleM`, pet meta `bodyS`, footnote `caption`,
  body and state copy `body` (the `lineHeight` overrides are gone), icon `iconSize.xl` (20).
  `pnpm check` passes.
  `selectionBody` is `textSecondary`. `FocusHeading` (also the chat header title) is `titleL`.
- Reminders LEGACY fonts, screen by screen with the user: drawer title overrides removed, secondary
  text `bodyS`, `runDate` and the row menu items `bodySemiBold`, description `body`, row time
  `bodyS`; the page top bar now matches the health record list (`BackButton`, `titleL`/`bodyS`,
  `AddButton`); `runNote`/`hint` `caption`, `emptyTitle`/`summaryTitle` `body`, `timeOverdue` keeps
  only the red color. No LEGACY fonts left in `src/reminders`. Page top bar seen on the phone; the
  drawers were not opened.
- Home LEGACY fonts: greeting `titleL`, `SignalStat` label `caption`, `AiInsightCard` eyebrow `label` and
  text `bodyS`, its icon `iconSize.lg`; the assistant button label is now the `home:assistantButton`
  string. `HomeHeader` `date` is now `bodyS`; the line is not in Figma, kept on purpose (weekday
  matters in a reminders app, cheap to remove later).
  `AiInsightCard` still shows the hardcoded `Test ai reposnse`; the card is parked (`<InsightSection />`
  is commented out in `HomePage`). Not yet seen on the phone.
- Home pet card: `SignalStat` columns are now separate rounded tiles with a translucent dark backing
  (`primaryDark` at 0.55, like the header pills) instead of divider lines; the `first` prop and the
  row's top border are gone; the photo overlay is now `primaryDark` at 0.45 (was 0.25) so the score and
  band stay readable; the date/greeting gap in `HomeHeader` is removed. Seen on the phone with a photo card.
- Home pet card without a photo now shows the two paw-print decorations from Figma (node 102:435):
  new `src/icons/paw-decoration` (primarySoft), each in a wrapper `View` rotated as in Figma (about
  20.7 deg clockwise and 23.1 deg counter-clockwise, centres as % of card width; the top one is
  nudged right and the bottom one up from Figma). Opacity is Figma's 0.08. Rotation and opacity must
  stay on the wrapper: on the `Svg` itself Android clips the rotated shape and 0.08 rendered as
  invisible. Seen on the phone; the rotation direction was
  derived from the Figma numbers, not compared pixel by pixel.
- Pet profile: tapping the empty hero (no photo) now opens `UploadPetPhotoDrawer`, same as the menu's
  "Set pet photo"; the accessibility label reuses `petProfilePage.actions.changePhoto`. Seen on the
  phone (Boba, no photo): the drawer opens. Not tried: picking and saving a photo from it.
- Profile is LEGACY-free: eyebrow `body` uppercase (its `letterSpacing: 0.5` dropped), hero name
  `titleL`, email `bodyS`, `InfoRow` `body`, `SectionHeader` `label`, menu row `bodySemiBold` +
  `bodyS`, avatar initials `titleL`, sign-out card `bodySemiBold` uppercase (fall back to `label` if
  it looks heavy) + `bodyS`, delete dialog text `body`; drawer title overrides removed. Icons 18/32
  now `iconSize.lg`/`3xl`. Seen on the phone: the Profile tab only; sign-out drawer, edit drawers
  and delete dialog not opened yet.
- Profile editing is one drawer now: the "what would you like to do" dialog, `UpdateAvatarDrawer`
  and `set-new-avatar.schema.ts` are gone. `EditProfileDrawer` holds the avatar (`ImagePicker` with
  the current avatar as placeholder, `AvatarPickerPlaceholder`) plus name and phone; Save sends only
  the changed PATCH fields, then uploads the avatar if one was picked; disabled until something
  changed. Pitfalls: the drawer body renders in a portal outside `QueryClientProvider`, so query
  hooks live in `EditProfileDrawer` (`useProfileAvatar`) and reach the placeholder as props; on
  Android `ImagePicker` closes the drawer, so `onPickStart`/`onBlur` guard the form reset.
  `editProfileSchema` now accepts an empty phone (the submit already mapped "" to null; before, an
  avatar-only change was impossible without a phone). Profile spacing: label to card `spacing(2)`,
  card to next label `spacing(2)` + `spacing(4)` = 24, as in Figma 169:5793 (the pet profile
  code used 28; `OverviewTabContent` `listCard.marginBottom` is now `spacing(4)` too); the hero's top padding is `spacing(2)` so the header sits closer to the avatar. The
  photo overlay is a taller strip (`spacing(2.5)` padding) with an `iconSize.xl` icon. Seen on the phone: drawer opens, a typed name survives the photo picker, picked
  photo previews with "Remove photo", reopening resets. Not done: pressing Save with a new photo
  (it would overwrite the real account avatar), iOS, a failed upload.
- Block spacing on the pet-profile tabs and the feeding sub-screens follows Figma (card to next label 24,
  label to card 8): `OverviewTabContent` card margin `spacing(4)`; `gap: spacing(6)` in `WellnessTabContent`,
  `FeedingTabContent`, `NutritionAnalysisPage`, `FeedingLogListPage`; `WeightHistoryPage` keeps the chips-to-chart
  16 and gives the entries block `marginTop: spacing(2)`. Health already had 24. Seen on the phone: the
  Feeding tab only. Wellness has labelled sections (Summary, Recommendations) that Figma 189:1086 does not.
- Assistant chat is LEGACY-free (`PredictionCard` included, unused but migrated). Tokens chosen with the owner from
  device screenshots: empty title `titleL` + `textBody`, subtitle `bodyS` + `textSecondary`, prompt
  chips `body`, safety link `controlM`, pet chip name `titleM`, composer input `body`, note `caption`,
  messages/answers `body`, pending/failure text `bodyS`, urgency/emergency lines `bodySemiBold`,
  advice `bodyS`, disclaimers `caption`, emergency title `titleM` in `danger`, emergency text
  `peachDefault`, its disclaimer `textSecondary`; dialog title overrides removed, description spreads `body`. Consent dialog description
  `textSecondary`, `AssistantPage.warning` `bodyS`. The scroll-to-end button now sits above
  `PetSelectorChip` (`bottom: spacing(16)`) instead of under it; both it and the chip are shifted to `right: spacing(2)`
  so they stick out past the message edge. Seen on the phone: empty, pending,
  answer, urgency, emergency, new-chat and consent states, and the button above the chip. Not seen:
  failure rows, session/history error screens, the `warning` banner.
- Activity field/group labels (`ActivityFilterDrawer`, `CreateActivityDrawer`, `ActivityLocationField`) moved from LEGACY
  regular 14 to `bodyS` + `textSecondary`, matching the `Input` labels. Seen on the phone: the filter and
  add-activity drawers (incl. Location). Change log with before/after: `.claude/notes/design-changes/2026-11-20-design-edits/`.
- Shared components off LEGACY: `FabMenuItem` title `body` + subtitle `caption`, `AppToast` title `bodySemiBold` +
  message `bodyS`, `OfflineBanner` `bodySemiBold`. Seen on the phone: the `+` menu and the offline banner; the
  toast was not re-checked after the change (it only shows when data is saved).
- `AppToast` and `FabMenuItem` now use `Text` from `@/shadecn/ui/text` with `variant` (they imported the RN one);
  the toast icon uses `theme.iconSize.xl` and `OfflineBanner` offsets with `theme.spacing(2)` instead of 8.
- `theme.fonts`, `fontSize` and `textSizing` are removed from `src/styles/theme.ts`; the file now reads fonts,
  sizes, text styles, then the theme object. Docs and DESIGN.md mention none of them as live tokens.
- Delete pet and delete account now use the shared `DeleteConfirmDialog` (trash badge, `titleL` title, button
  "Delete"); the dialog's own title override is gone, so every delete dialog is `titleL` now. `confirm`/`cancel`
  keys removed from the pets and profile locales. Seen on the phone: both dialogs opened and cancelled; the
  delete itself was not run.
- Assistant consent dialog: dismissing it with back (or decline) now calls `router.back()` (home only when there
  is no history) instead of leaving a blank screen. Not seen on the phone: consent is already accepted on this
  account and clearing it would need a data wipe.
- Profile menu rows use `unstable_pressDelay` (80 ms; 50 ms for the legal links), same as other cards, so scrolling
  over them no longer flashes the highlight. Not seen on the phone.
- Last four LEGACY files migrated: `AddHealthRecordDrawer` labels `bodyS`; `select` value `bodySemiBold`, items `body`,
  group label `label`; `FieldError` `caption`; `DeletePetConfirmation` description `body`. `theme.fonts/fontSize/textSizing`
- Tabs use `backBehavior="history"` (`src/app/(tabs)/_layout.tsx`): back from the assistant returns to the screen it
  was opened from (Pets, Activity, Home) instead of the first tab. Seen on the phone: Pets profile, Activity, Home, and
  the system back key from the Pets profile. Not seen: back after the pet-selection screen from other tabs.

## Verified evidence

- Species branch: `pnpm check` clean, 78 suites / 690 tests; deleting the `Turtle` key fails
  typecheck. `buildPetPatch.test.ts` fails when the species is always sent, when list rows are not
  trimmed, when the breed is not trimmed, when a blanked breed is sent as `null`, or when a stored
  name or breed is compared untrimmed (each checked
  by breaking the helper). On the S20 FE on 2026-11-11 (dev build, test account, pet J): with Edit
  open, breed `Syrian` and allergies `["Dust"]` were PATCHed from curl; renaming J on the phone
  saved the name and both server values survived. Clearing the breed on the phone stored `null`
  (the first try, sending `null`, was silently ignored by the server, which is how the `""` rule
  was found). After the Weight field was removed, Edit showed no weight row and a rename still
  saved with the weight unchanged. J was restored to its baseline. The Unknown profile flag was **not** checked on a
  device: the server refuses `Unknown` on create and update, so no test pet can carry it.
  On the S20 FE on 2026-11-10 (dev build, driven over adb): Create and Edit list the 9
  species with "Guinea pig"; pet J edited through Guinea pig, Turtle, Bird, Fish and Other saved
  each time, and the profile hero showed the mapped icon while the Basics row and flag showed the
  translated name. The assistant pet picker read "Guinea Pig" until its capitalize
  `textTransform` was removed, then "Guinea pig". J was set back to Hamster; no `FATAL EXCEPTION`.
- Release APK from `main` `a8ef8ad` (local `assembleRelease` after `prebuild --clean`, signed with
  the debug key, handed to testers) on the S20 FE on 2026-11-05, driven over adb: App Link
  `verified`; signed in, Forgot password shows "Back to the app" → Home; a signed-in https reset
  link opens the form without "Back to sign in", and a dead token → toast + Forgot password;
  pet create and delete; a one-off reminder's push arrived on time (the FCM token reaches the
  backend), the status prompt offers only Mark completed / Cancel reminder, and dismissing it left
  the reminder shown as "Missed"; the Google Map renders (Poznań); a meal is logged; the assistant
  asks for consent after a fresh sign-in. No `FATAL EXCEPTION`. Not checked: Google sign-in, an
  account switch, a recurring reminder firing again after a dismissed prompt, Mark completed.
- `main` after the three merges (`ef012b0`): lint and typecheck clean, 76 suites / 682 tests.
  Five suites (ConfirmEmail, NutritionAnalysis, CreateActivityDrawer, Assistant, FeedingTabContent)
  failed once on `waitFor` timeouts with the machine at load average 25 and passed when re-run
  alone (139 tests).
- #30: `pnpm check` clean, 74 suites / 667 tests. The new
  `reminderGroups` test fails with the `lastCompletedAt` guard removed. The status prompt was not
  re-checked on a device.
- `pnpm check` on the auth redesign (#28, SDK 55): lint and typecheck clean, 74 suites / 666 tests. `act`
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
- Checked before #27, on a Samsung phone with SDK 55: pets list and profile, the photo
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

- Not checked: whether the server updates `pet.weightKg` when a later weight log is added (the
  client assumes so and invalidates `["pets"]` after every weight-log mutation).
- `UpdatePetDto`'s plain nullable fields (`name`, `species`, `breed`, `birthDate`, `sex`) ignore
  `null`: each sent alone as `null` returns `pet_update_empty`. `""` clears `breed`; no way to
  clear `birthDate` is known (`""` was not tried). Recorded in `AGENTS.md`; raise with the backend.
- Signing out in the dev build logged `Failed to unregister the Android notification token`
  (401, `notificationRegistration.ts:54`), seen on 2026-11-11. The unregister call seems to run
  after the session is gone, so the server may keep pushing to this device for the old account.
  Not investigated.
- The species dropdown holds 9 items and cuts off exactly after Turtle: "Other" is reachable by
  scrolling, but no partial row or scrollbar shows that the list scrolls. A fix belongs in the
  shared `Select` (a max height that leaves half a row visible), which touches every dropdown.
- The assistant pet picker shows the breed exactly as typed now that the meta line no longer
  capitalises every word.
- Reminders already PATCHed to `Missed` by the old prompt stay switched off in the scheduler;
  restoring them to `Active` is a backend question. A recurring reminder that ended by `endAt`
  shows "Done" if any earlier run was completed, even when its last run was missed: the run
  history is the exact record.
- No paid Apple Developer account: iOS push is out of scope (APNs keys need the paid program and
  the backend sends through FCM), so notifications stay Android-only, and TestFlight and a
  physical iPhone are ruled out. Backend follow-up is in Jira KAN-91.
- Accepted: if SecureStore fails to delete the access token at sign-out, the app shows signed out
  but the next start restores that account until its first 401.
- `restoreSession`'s `clearStoredSession` (`AuthContext.tsx`) has no catch; a throw leaves the
  app on "loading".
- A note saved offline is queued in memory, so an app kill drops it, and create is not
  idempotent, so retyping while offline lands one note per attempt.
- `behavioralNotes` is on the pet DTOs and the backend keeps it: its AI analysis needs the field.
  It is back in the app as the "Behavior" segment of the Health > Basics card (edit and add
  drawers). Old values never moved into notes, so notes and this list can overlap.
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

Pet profile cleanup (PR #36, branch `chore/pet-profile-tabs-cleanup`): review fixes are in. The
Maestro flows in `.maestro/` were rewritten for the new navigation (`subflows/open-pet-profile.yaml`
picks the pet from the switcher; the Reminders tab, the assessment route and the
Recommendations/Care placeholders are gone, and `limitations-coming-soon` was deleted) and were run on
a Samsung phone with `PET_NAME=Miso` on 2026-11-24: `02`, `04`, `05` and `evidence/fr-14` to `fr-20`
pass. Not run: `03` (needs an image in the system photo picker), `fr-13` (opens account deletion) and
`fr-21` (signs the app out). `04` taps the time dialog's button by id because its label follows the phone's
language. `PetPickerDrawer` was looked at with a shrunken window (screen density 640): at its height
cap the list scrolls to the last row. OpenSpec is gitignored, so `openspec/` was not checked: the pet
selection and list mode have no change of their own there, and two specs may still say a bad pet link
redirects to the pet list. On a device, still to look at: swiping between the four profile tabs,
pull-to-refresh on each, the Basics card and its drawers, Home → Wellness, Feeding → Schedule →
reminders.

Before a build goes to real users: the EAS release keystore already exists (SHA-1 under Current
state); take its SHA-256 from `eas credentials` and have the backend add it to
`assetlinks.json`, and add the SHA-1 to the Google Android OAuth client. Drop the public debug
fingerprint once testers move to EAS builds.

On the SDK 55 build of `com.misopets.app`: sign in with Google, switch accounts (A, sign out, B)
and confirm B sees their own pets. If Google sign-in fails with `DEVELOPER_ERROR`, the
Android OAuth client in project `1000214284290` is missing the package or SHA-1
`5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`; the owner also has to confirm the
Maps key restriction. On the iOS simulator, check Google sign-in with the new iOS client ID.

EAS: install build `746acf59` on a device, publish a small `eas update` to `preview`, and
confirm the app picks it up after a relaunch; not yet verified. Google sign-in in an EAS APK
needs the EAS keystore SHA-1 above added to the Android OAuth client; until then expect
`DEVELOPER_ERROR`. `eas-build.yml` and `eas-update.yml` have never run; in CI they lack
`google-services.json` and should hit the same runtime mismatch.

Feeding: waiting on the backend: calories from grams, undoing a
completion, `isOverdue`, a weekly analysis mode, the PATCH `null` gap, a target source on the
analysis DTO.

Reminders: once the backend ships `/cancel` (or limits PATCH `status`), move "Cancel reminder"
onto it and stop sending `status` in PATCH. Then check the push prompt on a device: dismissing
it must leave the reminder `Active` and firing.
