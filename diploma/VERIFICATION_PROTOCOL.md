# Smart Pet Care App - Final Verification Protocol

## Purpose and evidence rule

This protocol converts the candidate requirements in
`REQUIREMENTS_TRACEABILITY.md` into repeatable final-build evidence. A result is
accepted only when the final mobile artifact and all relevant external-service
versions are identified. Source code alone is not a pass result.

The stable UC-01-UC-18 catalogue and the mapping from each use case to the
requirements, implementation, contract surface, and scenarios below are
maintained in `USE_CASE_TRACEABILITY_AUDIT.md`. UC-08/account deletion remains a
scope decision and C-09 remains conditional until a candidate FR-13 is approved
or the feature is explicitly excluded.

Each test record must contain:

- test identifier and requirement identifier;
- protocol version;
- preconditions and test data;
- mobile revision and artifact SHA-256;
- backend and AI-service release identifiers where relevant;
- device/emulator and Android/API level;
- executor, reviewer, and date/time;
- numbered steps, expected result, and observed result;
- pass, fail, blocked, or not-run status;
- sanitized evidence path and defect reference;
- limitations or deviations.

## Current device-availability checkpoint

On 25 July 2026, ADB identified one connected physical device:

- manufacturer/model: Samsung `SM-G781B`;
- operating system: Android 13, API level 33;
- build fingerprint:
  `samsung/r8qxeea/r8q:13/TP1A.220624.014/G781BXXSIHYJ1:user/release-keys`;
- installed package: `com.anonymous.smartpetcareapp`;
- package version: `1.0.0` (`versionCode=1`, `targetSdk=36`);
- package last-update time reported by Android: `2026-07-25 13:28:22`;
- resolved activity: `com.anonymous.smartpetcareapp/.MainActivity`;
- `am start -W` result: status `ok`, wait time 3,057 ms.

This checkpoint proves device availability, installed package metadata, activity
resolution, and successful launch-intent handling only. The device remained
locked and the UI hierarchy exposed Android System UI rather than application
content. No authentication, feature, screenshot, launch-performance, or other
Gate B-F result is therefore marked passed. The installed artifact has not yet
been cryptographically linked to a source revision or release record.

## Gate A - Reproducible static and automated checks

Run from a clean checkout of the final revision:

| ID    | Check                                                    | Acceptance condition                                                                              |
| ----- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| A-01  | `pnpm install --frozen-lockfile`                         | Exit code 0; lockfile unchanged                                                                   |
| A-02  | API-client generation                                    | Exit code 0; generated output matches the approved OpenAPI snapshot                               |
| A-03  | `pnpm lint`                                              | Exit code 0; zero lint errors and warnings                                                        |
| A-03b | `eslint . --max-warnings=0` or approved equivalent scope | Exit code 0, or a documented supervisor-approved exclusion for generated environment declarations |
| A-04  | `pnpm typecheck`                                         | Exit code 0; no TypeScript diagnostics                                                            |
| A-05  | full local Jest suite                                    | Every reviewed suite/test passes; no unaccepted console or open-handle warning                    |
| A-06  | Android Expo export                                      | Exit code 0; bundle metadata and SHA-256 recorded                                                 |
| A-07  | pull-request CI                                          | Successful named run on the final revision                                                        |

If coverage is reported, add the reviewed command, inclusion/exclusion rules,
thresholds, raw report, and interpretation. Do not derive coverage from the
number of passing tests.

### Current API-contract pre-check

On 25 July 2026, the repository fetcher successfully retrieved and normalized
the configured backend description into temporary storage. Comparison with
`docs/openapi.json` found additive drift: the live description has 4 more
paths, 7 more operations, and 10 more schemas. The added surface covers journal
entries and a symptom catalogue, and the health-record contract gained symptom
support. No operation or schema was removed.

This does not pass A-02. The approved final snapshot has not been selected, the
generated client has not been regenerated from the live description, and the
added operations have not been functionally tested. See
`diploma/API_CONTRACT_COMPARISON.md` for hashes, exact differences, method, and
limitations.

### Committed-snapshot generation checkpoint

Also on 25 July 2026, Orval 8.14.0 regenerated the Axios client from the
committed `docs/openapi.json` snapshot to temporary storage, without modifying
`src/api/generated`. The temporary and committed `index.ts` files were
byte-for-byte identical: both contain 1,252 lines, occupy 34,534 bytes, and have
SHA-256
`6116b5bab5e86f7e7abbeb8c3fa1df66554127f8995113a7d520e2f398f43aa2`.
`cmp` returned exit code 0, `diff -u` produced no output, and a fresh
`pnpm typecheck` completed with exit code 0.

This passes the current-snapshot reproducibility sub-check, not final A-02. The
worktree was not clean, the approved final contract has not been selected, and
the live additive drift remains unresolved. Repeat the check from a clean final
checkout and link it to the approved backend release. The exact procedure and
bounded interpretation are recorded in
`diploma/OPENAPI_CLIENT_REPRODUCIBILITY.md`.

### Current lint and test-warning checkpoint

On 25 July 2026, `pnpm lint` passed. The broader
`eslint . --max-warnings=0` diagnostic failed only on the ignored generated
`expo-env.d.ts` declaration, with one Prettier error and zero warnings. Repeating
that broad diagnostic with `--ignore-pattern expo-env.d.ts` passed. This
supports A-03 for the configured repository scope, but A-03b remains
provisional until the team and supervisor approve and record the exact
generated-file exclusion on the final clean revision.

All 9 suites and 79 tests passed in repeated standard and
`--detectOpenHandles` executions. The latest standard run still reported that
Jest did not exit one second after completion, while the latest diagnostic run
reported no concrete open handle. Earlier executions emitted React
`act(...)` warnings whose presence varied with grouping and timing. A-05
therefore remains open: a passing count is not accepted as a clean test gate
until the standard run exits promptly and both full executions are free of
unaccepted warnings. The full matrix, source observations, non-claims, and
closure protocol are recorded in
`diploma/STATIC_AND_TEST_WARNING_AUDIT.md`.

## Gate B - Authentication and account

| ID   | Requirements  | Scenario                                                                               |
| ---- | ------------- | -------------------------------------------------------------------------------------- |
| B-01 | FR-01         | Register with invalid and valid email/password values                                  |
| B-02 | FR-01         | Confirm a newly created account and sign in                                            |
| B-03 | FR-01         | Reject invalid credentials without exposing sensitive detail                           |
| B-04 | FR-02         | Complete configured Google sign-in on Android                                          |
| B-05 | FR-02         | Cancel Google sign-in and recover                                                      |
| B-06 | FR-03         | Restore an unexpired session after process restart                                     |
| B-07 | FR-03         | Refresh an expired session and retry one failed request                                |
| B-08 | FR-03         | Handle concurrent `401` responses without uncontrolled refresh calls                   |
| B-09 | FR-03, FR-12  | Clear local state and return to auth when refresh fails                                |
| B-10 | FR-12, NFR-05 | Sign out, verify notification-token cleanup attempt, and inspect protected local state |

## Gate C - Pet and profile workflows

| ID   | Requirements | Scenario                                                   |
| ---- | ------------ | ---------------------------------------------------------- |
| C-01 | FR-04        | Render empty and populated pet lists                       |
| C-02 | FR-04        | Reject invalid pet input and create a valid pet            |
| C-03 | FR-04        | Open and edit a pet profile; verify refreshed data         |
| C-04 | FR-04        | Delete a pet; verify list, detail cache, and navigation    |
| C-05 | FR-05        | Deny photo permission and recover                          |
| C-06 | FR-05        | Upload and replace a valid photograph                      |
| C-07 | FR-05        | Recover from compression, upload, or backend failure       |
| C-08 | FR-12        | Edit account information and avatar                        |
| C-09 | FR-12        | Delete-account behavior, if included in the approved scope |

## Gate D - Reminders and notifications

| ID   | Requirements | Scenario                                                               |
| ---- | ------------ | ---------------------------------------------------------------------- |
| D-01 | FR-06        | Create a valid reminder and reject invalid input                       |
| D-02 | FR-06        | View, update, complete/miss/cancel, and delete a reminder              |
| D-03 | FR-06        | Verify recurrence and UTC-offset behavior with defined time-zone cases |
| D-04 | FR-07        | Grant permission and synchronize the native Android token              |
| D-05 | FR-07        | Rotate/reassign a token and sign out while online/offline              |
| D-06 | FR-07        | Deny and revoke notification permission                                |
| D-07 | FR-08        | Receive and tap a valid reminder notification in foreground            |
| D-08 | FR-08        | Receive and tap in background                                          |
| D-09 | FR-08        | Receive and tap after terminated-state launch                          |
| D-10 | FR-08        | Handle missing, non-string, duplicate, and unknown `reminderId` values |

## Gate E - Assistant behavior and safety presentation

| ID   | Requirements  | Scenario                                                                                                           |
| ---- | ------------- | ------------------------------------------------------------------------------------------------------------------ |
| E-01 | FR-09         | Require approved consent before first use                                                                          |
| E-02 | FR-09         | Select and change pet context without stale-session replacement                                                    |
| E-03 | FR-10         | Bootstrap existing and first-time sessions                                                                         |
| E-04 | FR-10         | Load more message history and preserve ordering                                                                    |
| E-05 | FR-10         | Send successfully and show the server response                                                                     |
| E-06 | FR-10         | Handle rate limit, transient failure, retry, and new-chat confirmation                                             |
| E-07 | FR-10, NFR-08 | Reject a malformed or incomplete service response safely                                                           |
| E-08 | NFR-08        | Present local conservative emergency wording without claiming diagnosis                                            |
| E-09 | NFR-08        | Present versioned backend urgency/prediction states and disclaimer                                                 |
| E-10 | NFR-08        | Exercise ambiguous, irrelevant, prompt-injection, and high-risk inputs within the approved non-clinical evaluation |
| E-11 | FR-09, NFR-08 | Withdraw/reset consent and verify subsequent behavior                                                              |

The assistant evaluation establishes client/service behavior for the tested
cases. It must not be reported as veterinary validity, diagnostic accuracy, or
medical safety unless a separately approved expert study supports those claims.

## Gate F - Reliability, accessibility, and performance

| ID   | Requirements  | Scenario or measurement                                                         |
| ---- | ------------- | ------------------------------------------------------------------------------- |
| F-01 | FR-11, NFR-04 | Launch offline; record cached/uncached screen behavior                          |
| F-02 | FR-11, NFR-04 | Transition offline to online and verify selected refetch/recovery               |
| F-03 | NFR-04        | Inject route rendering and API query failures; use visible retry                |
| F-04 | NFR-04        | Verify no unsupported claim of offline mutation queueing                        |
| F-05 | NFR-06        | TalkBack labels, roles, states, hints, focus order, and announcements           |
| F-06 | NFR-06        | Font scaling, keyboard visibility, touch targets, contrast, and non-color cues  |
| F-07 | NFR-07        | Cold/warm launch and selected navigation response on a named release build      |
| F-08 | NFR-07        | Pet, reminder, and assistant lists with declared dataset sizes                  |
| F-09 | NFR-07        | Memory, frame, network, and bundle measurements using an approved tool/protocol |

Performance thresholds must be approved before results are collected. Record
warm-up, repetitions, aggregation, variance, device power/thermal state, and
all raw values. A single emulator observation is not a general performance
claim.

## Evidence capture and privacy

Use a stable hierarchy such as:

`evidence/<release-id>/<gate>/<test-id>/`

Recommended contents:

- `result.md` with the complete test record;
- redacted screenshots or screen recordings;
- redacted request/response extracts;
- command output and environment/version manifest;
- raw measurement files;
- defect link and retest record where applicable.

Do not capture passwords, access/refresh tokens, OAuth credentials, Firebase
credentials, private keys, personal email addresses, real pet medical data, or
unredacted identifiers. Prefer synthetic accounts and fictional pet data.

## Completion rule

The thesis may call the objective achieved only when:

- the approved functional and quality requirements are frozen;
- all mandatory gates have a final status;
- every pass has inspectable evidence from the final identified system;
- every failure, blocked test, and not-run test is discussed;
- the results and limitations are reviewed by the responsible team member;
- the conclusions answer the approved objective without exceeding the evidence.
