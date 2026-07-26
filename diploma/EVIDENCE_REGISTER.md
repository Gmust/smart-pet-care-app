# Smart Pet Care App - Thesis Evidence Register

## Purpose

This register maps candidate thesis claims to current repository evidence.
Evidence proves that code or documentation exists; it does not by itself prove
runtime correctness, usability, performance, security, or clinical safety.

## Repository baseline

- Package: `smart-pet-care-app`, version `1.0.0`.
- Client framework: Expo with React Native.
- Primary project entry point: `src/index.ts`.
- File-based routes: `src/app`.
- Committed backend contract snapshot: `docs/openapi.json`.
- Generated API client: `src/api/generated/index.ts` after generation; this
  directory is intentionally not committed.
- Repository-local validation commands: `pnpm lint`, `pnpm typecheck`, and
  `pnpm test`.

Record the final Git revision and validation date before using this baseline in
the thesis.

## Git-history attribution boundary

The inspected mobile-client history contains 26 commits attributed to `Illia
Dolbnia` across two email identities and 2 commits attributed to
`github-actions[bot]`. No other human author identity appears in this
repository's reachable `HEAD` history.

Separate local references contain 30 commits attributed to `Anastasia
Leonova`, primarily on `feature/care-screen`; they are not reachable from the
evaluated revision. They support a distinct frontend contribution record, not
proof that the branch behavior is present in the evaluated release. The
revision/branch distinction and closure evidence are recorded in
`diploma/PROJECT_CHRONOLOGY.md`.

This evidence supports Illia's visible mobile-client implementation and
frontend-lead role. It does not establish exact contribution percentages or
exclude design, research, review, pair-programming, backend, AI-service, or
other work performed outside the repository. The dated milestone reconstruction
and missing evidence are maintained in `diploma/PROJECT_CHRONOLOGY.md`.

## Candidate evidence matrix

| Thesis area                     | Repository evidence                                                                                                      | What it supports                                           | Additional proof required                                                       |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Application navigation          | `src/app/_layout.tsx`, `src/app/(auth)`, `src/app/(tabs)`                                                                | Authenticated and unauthenticated route structure          | Navigation screenshots and Android scenario results                             |
| Authentication state            | `src/auth/context/AuthContext.tsx`, `src/auth/hooks/useAuth.ts`, `docs/auth.md`                                          | Session state and restoration design                       | Valid login, refresh, expiry, and sign-out tests                                |
| Email and Google authentication | `src/auth/pages/AuthPage.tsx`, `src/auth/components/EmailAuthForm.tsx`, `src/auth/components/GoogleAuthButton.tsx`       | Two client authentication paths                            | Backend configuration and device-level Google sign-in evidence                  |
| Runtime form validation         | `src/auth/schemas`, `src/pets/schemas`, `src/reminders/schemas`, `src/assistant/schemas`                                 | Zod schemas at selected boundaries                         | Negative test results for invalid inputs                                        |
| Protected token storage         | `src/api/tokenStorage.ts`, `src/common/utils/secureStoreOptions.ts`                                                      | Use of platform-protected storage API                      | Threat model and platform behavior from official sources                        |
| Authenticated HTTP requests     | `src/api/interceptors.ts`, `src/api/axios.ts`, `docs/api.md`                                                             | Bearer-token injection, refresh, and retry architecture    | Controlled `401` scenario and sanitized logs                                    |
| Typed API integration           | `docs/openapi.json`, `orval.config.ts`, `src/api/index.ts`, `package.json`                                               | Contract-driven client-generation workflow                 | Successful generation output and contract-version record                        |
| Server-state management         | `src/api/queryClient.ts`, feature `queries` directories                                                                  | React Query caching and mutations                          | Query/mutation behavior tests and reconnect scenarios                           |
| Pet management                  | `src/pets/pages`, `src/pets/components`, `src/pets/queries`                                                              | Pet list/profile CRUD and photo flows                      | End-to-end scenarios and screenshots                                            |
| Reminder management             | `src/reminders/pages`, `src/reminders/components`, `src/reminders/queries`                                               | Reminder CRUD, grouping, and status UI                     | Scenario results for create/update/delete/status                                |
| Native notifications            | `src/notifications`, `docs/push-notifications.md`                                                                        | FCM-token registration and reminder tap routing            | Physical/emulated Android delivery in foreground/background/terminated states   |
| Home overview                   | `src/home/pages`, `src/home/components`, `src/home/queries`                                                              | Dashboard composition from pet, reminder, and profile data | Screenshots with controlled datasets                                            |
| Assistant consent and pet scope | `src/assistant/pages`, `src/assistant/components/dialogs`, `src/assistant/components/pet-selection`                      | Consent gate and pet selection                             | UI tests and author-approved safety wording                                     |
| Assistant sessions and messages | `src/assistant/queries`, `src/assistant/components/chat`, `docs/openapi.json`                                            | Session bootstrap, history, send, and retry integration    | Live backend scenarios and redacted request/response evidence                   |
| Assistant safety presentation   | `src/assistant/utils/assistantEmergency.ts`, `src/assistant/components/chat/PredictionCard.tsx`                          | Local emergency indicator and urgency UI                   | Veterinary/legal review; never claim clinical validation without it             |
| Offline awareness               | `src/common/utils/installOnlineManager.ts`, `src/common/hooks/useIsOnline.ts`, `src/common/components/OfflineBanner.tsx` | Network-state integration and offline presentation         | Device offline/reconnect scenario results                                       |
| Error recovery                  | `src/common/components/RouteErrorFallback.tsx`, route `ErrorBoundary` exports                                            | Route-level failure recovery design                        | Injected rendering/query failure scenarios                                      |
| Localization                    | `src/i18n.ts`, feature `locales/en.json` files                                                                           | English translation namespaces                             | Language inventory and missing-key check                                        |
| Styling system                  | `src/styles`, `src/shadecn/ui`                                                                                           | Shared theme and UI primitives                             | Representative screen captures and contrast measurements                        |
| Automated tests                 | Nine current `*.test.ts` or `*.test.tsx` files under `src`                                                               | Existing unit, hook, context, registration, and page tests | Current test run, count, failures, and coverage if claimed                      |
| Engineering decisions           | ignored local design files under `openspec/changes/archive`; `TECHNOLOGY_DECISION_AUDIT.md`                              | Written alternatives, trade-offs, and migration plans      | Confirm provenance, participants, dates, team approval, and match to final code |
| Mobile contribution attribution | reachable Git history, `feature/care-screen`, `MOBILE_IMPLEMENTATION_ATTRIBUTION_AUDIT.md`                               | Visible commit/path ownership and inclusion boundary       | Confirm identities, collaboration, accepted revision, results, and percentages  |

## Public API surface represented in the contract

The committed OpenAPI snapshot includes operations for:

- user profile and avatar;
- user update and deletion;
- pets and pet photos;
- pet weight history;
- pet health records;
- pet feeding logs;
- reminders, reminder runs, and acknowledgement;
- device notification tokens;
- assistant sessions, messages, send, and retry;
- account registration, confirmation, login, refresh, logout, and Google OAuth.

This list describes the committed contract, not necessarily the subset exposed
in the finished mobile interface. Each thesis feature claim must be traced to
both a route/component and a verified user scenario.

## Live API contract checkpoint

An authenticated, read-only fetch on 25 July 2026 found additive drift between
the committed contract and the configured backend description. The detailed,
reproducible record is maintained in
`diploma/API_CONTRACT_COMPARISON.md`.

- Committed normalized snapshot SHA-256:
  `fa597ae48cd99e18771c6ed8bc5b4980d730cfc00719d5c54011cd2c3fb27c1d`.
- Fetched normalized live description SHA-256:
  `01f3236acad6bc7cde933812f1b011abe4c7ac71d58bf9effa779ed054d981d9`.
- The committed description contains 34 paths, 50 operations, and 60 schemas.
- The live description contains 38 paths, 57 operations, and 70 schemas.
- No path, operation, or schema was removed.
- Seven operations for pet journal entries and the symptom catalogue were
  added.
- The existing health-record contract gained symptom filtering and
  symptom-related fields.

The generated client inspected during this checkpoint contains no journal or
symptom-catalog symbols. The checkpoint therefore proves contract drift, not
mobile implementation or endpoint behavior. Backend revision attribution,
functional tests, scope approval, and final contract reconciliation remain
required.

## OpenAPI client reproducibility checkpoint

On 25 July 2026, the installed Orval 8.14.0 generator wrote a client from the
committed `docs/openapi.json` snapshot to temporary storage rather than to the
repository's generated directory.

- Committed OpenAPI SHA-256:
  `fa597ae48cd99e18771c6ed8bc5b4980d730cfc00719d5c54011cd2c3fb27c1d`.
- Committed generated-client SHA-256:
  `6116b5bab5e86f7e7abbeb8c3fa1df66554127f8995113a7d520e2f398f43aa2`.
- Temporary generated-client SHA-256:
  `6116b5bab5e86f7e7abbeb8c3fa1df66554127f8995113a7d520e2f398f43aa2`.
- Both generated clients contain 1,252 lines and 34,534 bytes.
- `cmp` returned exit code 0; `diff -u` produced no output.
- A fresh `pnpm typecheck` completed with exit code 0.
- `docs/openapi.json` and `src/api/generated/index.ts` remained clean.

This proves byte-for-byte reproducibility for the current committed snapshot.
It does not approve that snapshot as the final contract, reconcile the live
additive drift, prove endpoint behavior, or identify an immutable clean
release. See `diploma/OPENAPI_CLIENT_REPRODUCIBILITY.md`.

## Existing automated tests

Current test files:

- `src/assistant/pages/AssistantPage.test.tsx`
- `src/assistant/queries/assistantQueries.test.tsx`
- `src/assistant/schemas/assistant.schema.test.ts`
- `src/assistant/services/mockAssistantService.test.ts`
- `src/assistant/utils/aiUsingConsentStorage.test.ts`
- `src/assistant/utils/assistantErrors.test.ts`
- `src/assistant/utils/assistantMessages.test.ts`
- `src/auth/context/AuthContext.test.tsx`
- `src/notifications/tests/notificationRegistration.test.ts`

The 79 passing test cases are not evenly distributed across product features.
Seven of the nine files target the assistant module; the remaining files target
authentication sign-out and Android notification-token registration. No current
test file directly targets the pet, reminder, home, profile, or general
navigation modules. This is a test-inventory observation, not a statement of
line or branch coverage.

Run the full suite on the final revision and record:

- test suites passed/failed;
- tests passed/failed;
- execution time;
- environment;
- any intentionally skipped tests.

Do not infer coverage percentages from passing tests. Generate and report
coverage only if the coverage configuration and scope are reviewed.

## Validation record

### Run on 25 July 2026

- Evaluated Git revision:
  `0d5e33b091e9582a7075786c0b9cf724510825f9`.
- Runtime: Node.js `v24.18.0`.
- Working tree: not clean; it contained the pre-existing `pnpm-lock.yaml`
  modification and the thesis-planning files. Therefore, the Git revision alone
  is not a complete identifier for the evaluated file state.
- Jest command: `./node_modules/.bin/jest --runInBand`.
- Jest result: every observed full execution passed 9 of 9 suites and 79 of 79
  tests with 0 snapshots. In the latest recheck, the standard run reported
  4.265 seconds and the `--detectOpenHandles` run reported 4.261 seconds.
- Jest limitation: the latest standard run reported that Jest did not exit one
  second after completion, while the latest diagnostic run reported no concrete
  open handle and no warning. Earlier full executions emitted React
  `act(...)` warnings from assistant/TanStack Query or `VirtualizedList` update
  paths, with counts that changed between runs and groupings. The passing count
  is therefore not a clean A-05 result.
- TypeScript command: `pnpm typecheck`.
- TypeScript result: passed with exit code 0 and no diagnostics.
- Configured lint command: `pnpm lint`.
- Configured lint result: passed with exit code 0; this command runs Expo lint
  and the TypeScript check.
- Broader lint command: `./node_modules/.bin/eslint . --max-warnings=0`.
- Broader lint result: failed with one Prettier error at
  `expo-env.d.ts:3:73`; no warnings were reported. The file is generated and
  ignored by Git.
- Broad lint with generated-file exclusion:
  `./node_modules/.bin/eslint . --max-warnings=0 --ignore-pattern
expo-env.d.ts`.
- Broad lint with exclusion result: passed with exit code 0 and no output.
- Android bundling command:
  `./node_modules/.bin/expo export --platform android --output-dir
/private/tmp/smart-pet-care-android-export`.
- Android bundling result: passed with exit code 0; Metro reported 2,817
  modules and 84 assets. The approximately 6.8 MiB Hermes bundle had SHA-256
  `b4785f3588da7eab6f7e45c36745804c7d3df889b1b72b4f4fae32fbff34fb7d`.
- Android bundling limitation: this was a JavaScript/asset export, not an APK,
  native build, installation, OAuth/FCM check, or production deployment.
- Physical-device availability check: ADB identified a Samsung `SM-G781B`
  running Android 13 / API 33 with build fingerprint
  `samsung/r8qxeea/r8q:13/TP1A.220624.014/G781BXXSIHYJ1:user/release-keys`.
  Android reported the installed package
  `com.anonymous.smartpetcareapp`, version `1.0.0`, version code 1, target SDK
  36, last updated at `2026-07-25 13:28:22`.
- Launch-intent check: Android resolved
  `com.anonymous.smartpetcareapp/.MainActivity`; `am start -W` returned status
  `ok` with a 3,057 ms wait time.
- Physical-device limitation: the device remained locked and the captured UI
  hierarchy contained Android System UI, not application content. The installed
  artifact was not linked by digest to the evaluated source. This check is not
  a functional, screenshot, or performance pass.

This run supports a provisional statement that the existing automated tests
and strict type check pass, the configured lint scope passes, the broader lint
scope passes when its ignored generated declaration is explicitly excluded,
and the Android JavaScript/assets bundle builds. It does not support a claim
that all quality gates pass, because the lint exclusion is not yet the approved
final scope, the standard Jest process does not consistently terminate cleanly,
earlier runs emitted asynchronous React warnings, and Android runtime
validation was not part of the run. The detailed warning matrix and closure
protocol are preserved in `diploma/STATIC_AND_TEST_WARNING_AUDIT.md`.

## Thesis-document build and QA checkpoint

### Rebuilt on 26 July 2026

- Output:
  `diploma/output/Smart_Pet_Care_CDV_Thesis_Working_Draft.docx`.
- SHA-256:
  `a6d395973b09f6bee67a8ded543fe594df9b4a9f7d48cc201c5d7afc76b16303`.
- Structure: 2 A4 portrait sections, 308 paragraphs, 11 tables, 8 inline
  figures, 13 Heading 1 paragraphs, and 37 Heading 2 paragraphs.
- Author-input markers: 30.
- Chapter 1: source-backed English working prose with continuous numeric
  citations, including a dated four-product market desk review whose claims are
  bounded to official store listings. Official Zod and Orval documentation now
  supports the bounded runtime-validation and OpenAPI-client-generation
  explanations. The chapter now records the preliminary targeted-search method
  and ends with a synthesis that distinguishes the intended engineering
  contribution from medical, outcome, framework-superiority, or market-novelty
  claims.
- Chapter 4: repository-grounded implementation prose now includes the C#
  backend through `6d79951` and the Python AI service at main `682dfb5` and
  unified-chat feature `74019ea`, with explicit ownership of persistence,
  bounded history, resilience, analysis, safety routing, and generation. It also
  retains the authenticated
  25 July 2026 API-contract comparison and states the additive drift and its
  verification limits. Section 4.9 now classifies the current static,
  generation, bundling, device-availability, and contract-drift observations in
  Table 4.2 without treating them as final functional acceptance. Table 4.1 and
  `MOBILE_IMPLEMENTATION_ATTRIBUTION_AUDIT.md` distinguish Illia's
  evaluated-revision ancestry from Anastasia's separate 30-commit care-screen
  branch and do not treat branch code as evaluated-release functionality.
- Chapter 2: Table 2.3 maps stable UC-01-UC-18 identifiers to FR-01-FR-12,
  implementation/contract boundaries, and Gates B-F without treating unexecuted
  scenarios as passes. Revised Table 2.5,
  `IMPLEMENTATION_STATUS_CONFIRMATION.md`, and
  `SCOPE_FREEZE_DECISION_PACKET.md` classify author-reported first-version,
  version-2, and omitted items without converting confirmation into acceptance.
- Chapter 3: Table 3.1 and `TECHNOLOGY_DECISION_AUDIT.md` distinguish
  implemented technology boundaries, explicit but Git-ignored local decision
  records, retrospective inference, and missing author confirmation. IN-10
  remains open for dated participants, genuine alternatives, constraints,
  trade-offs, and owner approval.
- Bibliography: 23 provisional scientific and online entries in a continuous
  numeric sequence. The custom audit confirms that entries 1-23 are ordered,
  every entry is cited from the current prose or market table, no cited number
  lacks an entry, and no temporary research-register identifier remains in the
  DOCX.
- Custom thesis audit: passed.
- Deterministic-package checkpoint: the builder normalizes DOCX ZIP-entry
  timestamps; two consecutive builds were byte-identical at the SHA-256 above.
- DOCX ZIP package integrity: passed.
- Heading audit: passed with no hierarchy findings.
- Section audit: confirmed A4 portrait pages with approximately 2.5 cm margins
  and an independently numbered body footer.
- Table-geometry audit: all eleven tables are centred and have matching 9,060 DXA
  width, 100 DXA start-cell-margin indent, grid, and cell widths.
- Table-caption checkpoint: all eleven tables are immediately preceded by a
  left-aligned Caption paragraph with a Word `SEQ Table` field and a source
  statement; Tables 1.1, 2.1-2.5, 3.1, 4.1-4.2, 5.1, and A.1 are each
  referenced from body prose. The sequence restarts at the relevant
  chapter/appendix boundary.
- Figure checkpoint: eight PlantUML working-draft figures compile successfully
  with PlantUML 1.2026.3 and its embedded Smetana layout. They cover a two-part
  UC-01-UC-18 view, contract-level domain classes, components, deployment,
  authentication refresh, notification/reminder status, and assistant
  send/retry behavior.
  Each DOCX image is inline, has a Caption style paragraph with a Word `SEQ
Figure` field, and contains alternative text.
- Figure limitation: the component, deployment, and assistant sequence figures
  are reconciled with backend and AI repository evidence. They retain visible
  confirmation requirements for final deployment and acceptance artifacts.
  Successful compilation and visual inspection of the standalone PNG exports
  do not prove that a particular revision was deployed or clinically valid.
- Figure-caption checkpoint: all eight figure captions are below their inline
  image, left-aligned, and generated with Word `SEQ Figure` fields. The field
  audit reports 19 sequence fields, three table-of-contents/list fields, and
  one page-number field. Figures 3.1-3.8 are each referenced from body prose,
  and the figure sequence restarts in Chapter 3.
- Accessibility audit: zero high-, medium-, or low-severity findings for the
  current structure and eight embedded figures. This does not establish
  accessibility of final screenshots or later content.
- Canonical page-image rendering: not completed because LibreOffice
  (`soffice`) is not installed. The current checkpoint is structurally
  verified, not visually approved.

The DOCX remains a working draft. The source selection still requires author
and supervisor approval; author-input markers, provisional figures, missing
final screenshots, and unapproved metadata prevent submission.

## Required runtime evidence

### Authentication

- Fresh registration and confirmation.
- Email login.
- Google login on Android.
- App restart with a restored session.
- Expired-token refresh.
- Refresh failure leading to sign-out.
- Explicit logout and protected-data cleanup.

### Pet workflows

- Empty and populated pet list.
- Create a pet with invalid and valid values.
- Open profile.
- Edit profile.
- Upload/change photo.
- Delete pet and confirm cache/navigation behavior.

### Reminder and notification workflows

- Create a reminder.
- Edit status.
- Delete reminder.
- Pull to refresh.
- Register the FCM token.
- Receive and tap a notification in each app lifecycle state.
- Handle missing or malformed `reminderId`.
- Deny/revoke notification permission.
- Sign out while offline.

### Assistant workflows

- Consent required before the first message.
- Pet selection.
- Existing-session bootstrap.
- First-session creation.
- Send success.
- send rate limit or transient failure;
- retryable failed message;
- new-chat confirmation;
- pet change while data is in flight;
- local emergency warning;
- backend emergency result;
- malformed or incomplete response behavior;
- offline behavior.

### Reliability and usability

- Route rendering error and retry.
- API query failure with recovery.
- offline to online transition;
- keyboard-visible chat composition;
- screen reader labels and focus on critical flows;
- increased font scale;
- list behavior with a defined large dataset.

## Required screenshots and figures

Capture from the final evaluated build:

- welcome/authentication;
- home dashboard;
- pet list and pet profile;
- create/edit pet;
- reminder list and reminder form;
- notification status prompt;
- assistant consent;
- assistant pet selection;
- assistant normal answer;
- assistant urgent/emergency presentation;
- profile and sign-out;
- offline/error state.

For each capture record:

- figure identifier;
- screen and scenario;
- device/API level;
- build revision;
- personal-data redactions;
- caption and source statement;
- thesis section where it is referenced.

## Claim-risk register

| Risky claim                         | Why risky                                                          | Safe evidence-based wording                                                                                                                          |
| ----------------------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| "The app is secure"                 | Security is broader than selected controls                         | "The client stores session tokens through the platform protected-storage API and refreshes sessions through an authenticated API flow."              |
| "The assistant detects emergencies" | Keyword or service classification is not clinically complete       | "The client presents a conservative emergency warning when configured indicators or backend metadata signal urgency; it is not a diagnostic system." |
| "The app works offline"             | Mutations and live API data are not queued                         | "The client detects connectivity changes, presents offline state, and resumes selected queries after reconnection."                                  |
| "The app is accessible"             | Selected labels and targets do not prove conformance               | "The implementation includes named accessibility measures that were evaluated in the documented scenarios."                                          |
| "The app is cross-platform"         | The framework targets several platforms, but all may not be tested | "The client is implemented with a cross-platform framework; runtime verification covered the explicitly named platforms."                            |
| "The app is scalable"               | No load or dataset measurements yet                                | State the tested dataset size and observed measurements only.                                                                                        |
| "AI provides veterinary advice"     | Could imply clinical authority                                     | "The assistant presents informational, pet-scoped responses with disclaimers and escalation cues."                                                   |

## Author-supplied evidence still missing

- Approved thesis card and title.
- Full legal names and album numbers for Volodymyr, Ksenia, Anastasia Leonova,
  and Illia.
- Confirmation and evidence for the proposed allocation in
  `diploma/TEAM_WORK_ALLOCATION.md`.
- Contribution evidence that can attribute the documented chronology to all
  four authors, including Figma/design, pairing, research, backend, and AI
  service work.
- Backend repository or architecture description, if included.
- Deployment topology.
- Final Android build.
- Device test records.
- Screenshots.
- Performance and accessibility measurements.
- Supervisor feedback.
- Final supervisor-approved bibliography and stable numeric citations.
- Supervisor-approved hands-on market observations and versioned screenshots.
- AI-use disclosure approved by the supervisor.
- Retained Codex session export/screenshots reconciled with
  `diploma/AI_USE_LOG.md`, including author annotations of accepted, changed,
  and rejected assistance.
