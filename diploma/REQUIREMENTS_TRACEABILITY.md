# Smart Pet Care App - Requirements Traceability Register

## Status

This register connects candidate thesis requirements to repository artifacts
and verification evidence available on 25 July 2026. It is not the final
acceptance report.

Status vocabulary:

- **Verified - automated**: a relevant automated check passed, within the stated
  scope.
- **Partially verified**: some behavior is covered, but the complete requirement
  is not.
- **Implemented - runtime proof required**: relevant code exists, but the user
  scenario has not been recorded.
- **Unverified**: current evidence is insufficient.
- **Failed gate**: a defined check currently fails.

No status in this register proves clinical correctness, complete security,
complete accessibility, or platform behavior outside the named evidence.

## Functional requirements

| ID    | Candidate requirement                                                                 | Repository evidence                                                                             | Current verification                                                                           | Status                               | Required final evidence                                                                                       |
| ----- | ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| FR-01 | A user can register, confirm an account, and sign in with email credentials.          | `src/auth/pages`, `src/auth/components/EmailAuthForm.tsx`, `docs/openapi.json`                  | No automated test covers the complete registration/confirmation/login flow.                    | Implemented - runtime proof required | Fresh-account Android scenario, confirmation evidence, valid/invalid login, sanitized API result.             |
| FR-02 | A user can authenticate with Google on Android.                                       | `src/auth/components/GoogleAuthButton.tsx`, auth configuration                                  | No current automated or device result proves configured native Google sign-in.                 | Implemented - runtime proof required | Named Android device/build, valid login, cancelled login, configuration failure, backend exchange evidence.   |
| FR-03 | The application restores a session and refreshes expired authentication when allowed. | `src/auth/context/AuthContext.tsx`, `src/api/interceptors.ts`, `src/api/tokenStorage.ts`        | Auth tests cover sign-out cleanup, not restoration, controlled `401`, or refresh contention.   | Partially verified                   | Restart restoration, expired-token refresh, concurrent `401`, failed refresh, and forced sign-out scenarios.  |
| FR-04 | A user can create, view, edit, and delete pet profiles.                               | `src/pets/pages`, `src/pets/components`, `src/pets/queries`, `src/pets/schemas`                 | No current test file directly targets the pet module.                                          | Implemented - runtime proof required | Empty/populated list plus create/read/update/delete Android scenarios with screenshots and API evidence.      |
| FR-05 | A user can upload or replace a pet photograph.                                        | pet image-picker/upload components and pet mutation hooks                                       | Commit `f855e9f` and code establish implementation history; no recorded runtime result.        | Implemented - runtime proof required | Permission denial, valid image, upload failure, replacement, cache refresh, and sanitized storage/API proof.  |
| FR-06 | A user can create, view, update, and delete reminders.                                | `src/reminders/pages`, `src/reminders/components`, `src/reminders/queries`, `docs/openapi.json` | No current test file directly targets reminder CRUD or status behavior.                        | Implemented - runtime proof required | Create/update/status/delete scenarios, validation errors, recurrence cases, API responses, and screenshots.   |
| FR-07 | The authenticated Android client registers and synchronizes a notification token.     | `src/notifications`, notification registration tests                                            | Eight automated tests cover permission, token creation/rotation, synchronization, and cleanup. | Verified - automated                 | Repeat on final revision and add one configured-device request plus redacted backend receipt.                 |
| FR-08 | A reminder notification opens the intended reminder-status workflow.                  | notification response handling and reminder route/status components                             | Token-registration tests do not prove notification-tap routing or lifecycle behavior.          | Implemented - runtime proof required | Foreground, background, and terminated-state delivery/tap plus missing/malformed identifier scenarios.        |
| FR-09 | Assistant use requires consent and a selected pet context.                            | `src/assistant/pages`, consent storage, pet-selection components                                | Assistant page and consent-storage tests cover missing/restored consent and pet selection.     | Partially verified                   | Final wording approval, Android screen-reader/focus check, consent withdrawal, and live pet-context evidence. |
| FR-10 | The assistant loads sessions and exchanges, paginates, sends, and retries messages.   | assistant queries, pages, chat components, schemas, and API contract                            | Query/page tests cover bootstrap, history, send, retry, rate limiting, and several failures.   | Partially verified                   | Versioned live AI/backend scenarios, redacted requests/responses, cancellation, malformed response, latency.  |
| FR-11 | The application presents offline state and recovers selected data after reconnection. | `installOnlineManager.ts`, `useIsOnline.ts`, `OfflineBanner.tsx`, server-state configuration    | No current test file proves offline-to-online behavior across product flows.                   | Implemented - runtime proof required | Offline launch, transition, retry, cached-data behavior, mutation limitation, and sign-out-while-offline.     |
| FR-12 | A user can update the account profile and sign out with local cleanup.                | profile pages/components and `AuthContext.tsx`                                                  | Three auth tests cover cleanup ordering and failure tolerance during sign-out.                 | Partially verified                   | Profile edit/avatar scenarios, successful sign-out on device, protected-route check, and storage inspection.  |

## Use-case and verification coverage

The detailed catalogue, implementation boundary, contract surface, and gap for
each record are maintained in `USE_CASE_TRACEABILITY_AUDIT.md`.

| Requirement     | Stable use-case IDs | Verification scenarios | Open decision                                                                                                    |
| --------------- | ------------------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------- |
| FR-01           | UC-01-UC-03         | B-01-B-03              | Email delivery and complete account-flow runtime evidence                                                        |
| FR-02           | UC-04               | B-04-B-05              | Final Android OAuth configuration and device proof                                                               |
| FR-03           | UC-05               | B-06-B-09              | Restore/refresh automation, contention, failure, and final-device proof                                          |
| FR-04           | UC-09               | C-01-C-04              | Pet-module automation and final CRUD evidence                                                                    |
| FR-05           | UC-10               | C-05-C-07              | Permission, image-processing, upload, and replacement evidence                                                   |
| FR-06           | UC-11               | D-01-D-03              | Approved recurrence/status/time-zone semantics and evidence                                                      |
| FR-07           | UC-12               | D-04-D-06              | Repeat automated checks on the final revision and capture one redacted configured-device/backend exchange        |
| FR-08           | UC-13               | D-07-D-10              | Foreground/background/terminated notification-response evidence                                                  |
| FR-09           | UC-14-UC-15         | E-01-E-02, E-11        | Final consent wording, accessibility, withdrawal, and live pet-context evidence                                  |
| FR-10           | UC-16-UC-17         | E-03-E-07              | Versioned live backend/AI exchanges and bounded failure/safety evidence                                          |
| FR-11           | UC-18               | F-01-F-04              | Cached/uncached, transition, retry, mutation-limitation, and offline sign-out evidence                           |
| FR-12           | UC-06-UC-07         | B-09-B-10, C-08        | Decide local-only versus server logout semantics; capture profile, avatar, sign-out, route, and storage evidence |
| Candidate FR-13 | UC-08               | C-09                   | Approve account deletion as a requirement or explicitly exclude it from the evaluated scope                      |

This mapping proves planned coverage, not final acceptance. Account deletion is
implemented but remains outside FR-01-FR-12. Weight-history, health-record,
feeding-log, journal, and symptom-catalogue contract surfaces likewise require
an explicit include/exclude decision before the scope is frozen. The evidence,
safe interim treatment, and approval conditions are consolidated in
`SCOPE_FREEZE_DECISION_PACKET.md`; no provisional treatment in that packet is a
final approval.

## Non-functional requirements

| ID     | Category               | Candidate measurable requirement                                                                                                  | Current evidence                                                                                                                     | Status                                      | Required final evidence                                                                                                                    |
| ------ | ---------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| NFR-01 | Type safety            | The final client completes the strict TypeScript check without diagnostics.                                                       | `tsc --noEmit` passed on 25 July 2026.                                                                                               | Verified - automated                        | Repeat on a clean final revision and preserve command, environment, time, and exit code.                                                   |
| NFR-02 | Code quality           | The final client completes the approved lint scope with zero errors and zero warnings.                                            | `pnpm lint` passes; broad `eslint .` fails only on ignored generated `expo-env.d.ts`; broad scope passes with an explicit exclusion. | Partially verified - scope approval pending | Approve and document the exact generated-file exclusion, then repeat configured and approved broad scopes on the clean final revision.     |
| NFR-03 | Automated regression   | All reviewed automated suites pass without runtime warnings.                                                                      | 9/9 suites and 79/79 tests pass, but warning/exit behavior varies; the latest standard run reported delayed exit.                    | Partially verified                          | Resolve asynchronous cleanup, rerun standard and diagnostic suites warning-free, and document the feature imbalance in the test inventory. |
| NFR-04 | Reliability            | Defined authentication, query, offline, and route failures recover without an application restart where recovery is intended.     | Error boundaries and recovery code exist; only selected assistant failures tested.                                                   | Implemented - runtime proof required        | Execute the named failure matrix and record recovery time, user-visible state, data integrity, and defects.                                |
| NFR-05 | Protected local data   | Session material is stored only through the selected platform-protected storage boundary and is cleared on sign-out.              | SecureStore wrapper and sign-out cleanup tests exist.                                                                                | Partially verified                          | OWASP MASVS-scoped code/config review, backup/log inspection, device storage behavior, exact untested controls.                            |
| NFR-06 | Accessibility          | Critical Android flows pass named label, role, focus, font-scaling, touch-target, contrast, and non-color-cue checks.             | Assistant tests cover selected labels, a 44pt+ target, and a non-color cue.                                                          | Partially verified                          | Manual TalkBack/focus/font-scale/contrast/touch checks across authentication, pets, reminders, and assistant.                              |
| NFR-07 | Performance            | Selected critical screens meet defined responsiveness and resource thresholds on a named device and dataset.                      | No project-specific performance protocol or measurement exists.                                                                      | Unverified                                  | Define device/API level, release build, dataset, warm-up, repetitions, metrics, targets, and raw results.                                  |
| NFR-08 | AI safety presentation | Consent, limitations, urgency presentation, failure fallback, and escalation cues behave consistently for a versioned service.    | Extensive assistant tests cover several client states; no clinical evaluation.                                                       | Partially verified                          | Supervisor-approved wording, live versioned cases, adversarial/malformed inputs, expert review if claimed.                                 |
| NFR-09 | Contract consistency   | The generated client is reproducible from the committed OpenAPI snapshot and passes type checking without manual generated edits. | Orval 8.14.0 temporary regeneration matched the committed client byte-for-byte; `pnpm typecheck` passed.                             | Partially verified                          | Repeat from a clean final checkout after contract approval; identify the backend version/date and resolve documented drift.                |

The Android-only Expo export on 25 July 2026 bundled 2,817 modules and 84
assets successfully. It supports the bundling aspect of the release pipeline,
but it does not change any functional requirement to verified because no
native artifact was installed or exercised.

## Current automated-test distribution

| Area                              | Test files | Evidence scope                                                                                         |
| --------------------------------- | ---------: | ------------------------------------------------------------------------------------------------------ |
| Assistant                         |          7 | schemas, adapters, mock service, consent storage, query/session behavior, page behavior, accessibility |
| Authentication                    |          1 | sign-out cleanup and failure tolerance                                                                 |
| Android notification registration |          1 | permission, token rotation/synchronization, cleanup                                                    |
| Pets                              |          0 | no direct test file                                                                                    |
| Reminders                         |          0 | no direct test file                                                                                    |
| Home/profile/general navigation   |          0 | no direct test file                                                                                    |

The table describes test-file ownership, not executed-line coverage. One test
file can exercise dependencies from another module, and a missing test file does
not prove that no indirect execution occurs.

## Provisional responsibility mapping

This mapping follows the confirmed role descriptions but is not final
authorship evidence.

| Responsibility area                        | Proposed lead       | Required attribution evidence                                                       |
| ------------------------------------------ | ------------------- | ----------------------------------------------------------------------------------- |
| Product problem and workflow acceptance    | Anastasia Leonova   | product brief, Figma/user flows, dated decisions, review records                    |
| Mobile-client architecture and integration | Illia               | current Git history, pull requests, architecture decisions, final revision          |
| Mobile component/screen implementation     | Anastasia and Illia | file/branch/PR ownership, Figma versions, pair-programming or review evidence       |
| Core backend/API behavior                  | Volodymyr           | backend repository, commit identity, endpoint ownership, tests, deployment evidence |
| Backend research/support                   | Ksenia              | backend repository plus research/source-review artifacts                            |
| AI backend service                         | Illia               | AI-service repository, configuration, deployment, evaluation, integration evidence  |
| Cross-component verification               | All authors         | named executor and reviewer on each final scenario/result                           |

## Final acceptance rules

A requirement may be marked **achieved** in the thesis only when:

- its wording and scope are approved;
- implementation evidence is located;
- the stated acceptance method was executed on the final identified build;
- expected and observed results are recorded;
- failures and limitations are included;
- the evidence can be inspected without exposing secrets or personal data;
- the responsible authors approve the attribution.
