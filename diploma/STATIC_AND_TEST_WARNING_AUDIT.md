# Smart Pet Care App - Static and Test Warning Audit

## Purpose

This record separates three questions that must not be conflated in the thesis:

1. whether the repository's configured lint and type-check command passes;
2. whether a broader ad hoc ESLint scope passes and, if not, what it includes;
3. whether the passing Jest suite terminates and updates React state cleanly.

The audit records observed behavior and a closure protocol. It does not change
application code, generated declarations, lint configuration, or tests.

## Evaluated state

- Date: 25 July 2026.
- Git revision: `0d5e33b091e9582a7075786c0b9cf724510825f9`.
- Runtime: Node.js `v24.18.0`.
- Test runner: Jest `29.7.0`.
- React Native Testing Library: `13.3.3`.
- Working tree: not clean; it contained the pre-existing `pnpm-lock.yaml`
  modification and the untracked diploma workspace.
- Generated declaration: `expo-env.d.ts` is ignored by `.gitignore`, identifies
  itself as generated, and states that it should not be edited.

The revision is therefore necessary but not sufficient to identify the
evaluated state. Final evidence must be repeated from the approved clean
revision.

## Lint and type-check matrix

| Check                                                                          | Result on 25 July 2026                                                            | Interpretation                                                                                                            |
| ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `pnpm lint`                                                                    | Exit code 0; Expo lint completed and `tsc --noEmit` reported no diagnostics       | The repository's configured quality command passes                                                                        |
| `./node_modules/.bin/eslint . --max-warnings=0`                                | Exit code 1; one `prettier/prettier` error at `expo-env.d.ts:3:73`; zero warnings | The broad filesystem scope includes an ignored generated declaration that the configured Expo lint scope does not include |
| `./node_modules/.bin/eslint . --max-warnings=0 --ignore-pattern expo-env.d.ts` | Exit code 0; no output                                                            | The same broad diagnostic passes when the generated declaration is explicitly excluded                                    |

Expo's lint command documents its default project scope as the `src`, `app`,
and `components` directories. The flat ESLint configuration does not currently
list `expo-env.d.ts` in its `ignores` array, and a broad `eslint .` invocation
does not automatically adopt the repository's `.gitignore` entry.

The earlier label "failed lint gate" was too broad. The evidence supports this
more precise status:

- configured repository lint/type-check gate: passing;
- ad hoc all-files diagnostic without generated-file exclusion: failing on one
  ignored generated declaration;
- the same all-files diagnostic with an explicit exclusion: passing;
- final approved lint scope and exclusion rationale: pending team/supervisor
  approval and a clean-revision rerun.

The audit does not recommend editing `expo-env.d.ts`. If the team adopts the
broad all-files command as a formal gate, it should encode and document the
generated-file exclusion in the approved configuration or command.

## Jest execution matrix

All observed runs completed 9 of 9 suites and 79 of 79 tests with zero failed
tests and zero snapshots. Warning behavior varied between repeated executions.

| Execution                                                  | Passing result                                                       | Additional observation                                                                                                                                                                        |
| ---------------------------------------------------------- | -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `./node_modules/.bin/jest --runInBand`                     | 9/9 suites; 79/79 tests; reported time 4.265 s in the latest recheck | Jest reported that it did not exit one second after completion                                                                                                                                |
| `./node_modules/.bin/jest --runInBand --detectOpenHandles` | 9/9 suites; 79/79 tests; reported time 4.261 s in the latest recheck | No concrete open handle and no warning were reported in this execution                                                                                                                        |
| Earlier full standard executions                           | 9/9 suites; 79/79 tests                                              | React `act(...)` warnings were observed from `VirtualizedList` and assistant query/page update paths; a delayed-exit message was also observed                                                |
| Earlier full `--detectOpenHandles` executions              | 9/9 suites; 79/79 tests                                              | No concrete open handle was identified; at least one execution still emitted an assistant `act(...)` warning                                                                                  |
| Isolated assistant groups and individual tests             | Selected tests passed                                                | Warning presence changed with grouping and `--detectOpenHandles`; one pending-request test previously produced an environment-after-teardown error when run alone without the diagnostic flag |

The changing warning count is itself evidence of asynchronous scheduling or
teardown sensitivity. It is not valid to report a fixed warning count or to
claim that the latest clean diagnostic execution proves the earlier issue is
resolved.

## Source-level observations

The warning stacks and test sources identify plausible cleanup boundaries,
without proving a single root cause:

- `AssistantPage.test.tsx` creates a fresh TanStack Query `QueryClient` in its
  render helper with query and mutation `gcTime: Infinity`; the client is not
  returned or explicitly cleared after each test.
- `assistantQueries.test.tsx` also creates per-test query clients, while React
  Testing Library unmount cleanup does not itself document a QueryClient cache
  and notification cleanup step.
- several assistant-page tests deliberately install promises that never
  resolve, including the pending-request unmount, consent-restore loading, and
  duplicate-submit cases;
- observed stacks passed through TanStack Query's scheduled notification path
  or React Native `VirtualizedList` timer-driven updates;
- warning presence changed when tests were split or run with
  `--detectOpenHandles`, which is consistent with inter-test scheduling or
  teardown sensitivity but does not prove the exact responsible callback.

React Native Testing Library `13.3.3` performs automatic component cleanup.
That does not justify adding a second manual RNTL cleanup call. Any remediation
should instead make owned asynchronous work deterministic and release
test-created resources.

## Required closure work

Ksenia and Illia should coordinate the test-hygiene change; Anastasia Leonova
should review UI-list behavior; Volodymyr should review any backend-mock
lifecycle assumptions.

1. Return or track each test-created QueryClient and clear it after the tested
   tree is unmounted.
2. Replace never-settling mock promises with controllable deferred promises and
   resolve, reject, or abort them before teardown while preserving the intended
   assertion.
3. Await all user interactions and asynchronous assertions; prefer semantic
   RNTL queries and `findBy*` for appearance after asynchronous work.
4. Avoid adding broad manual `act` wrappers around RNTL operations that already
   manage React updates.
5. If a timer must be controlled, use fake timers only in the targeted test,
   flush promise-based work with Jest's asynchronous timer APIs, run only
   intended pending timers, and restore real timers after the test.
6. Repeat individual pending-work tests, the combined assistant suites, the
   full standard suite, and the full `--detectOpenHandles` suite.
7. Accept NFR-03 only when every reviewed test passes, the standard run exits
   promptly, no unaccepted console/React warning is present, and the diagnostic
   run identifies no open handle.

## Claim boundary

The current evidence supports the statement that the configured lint and
strict type-check command pass and that all 79 existing automated tests pass.
It does not support a statement that:

- every repository file belongs to the approved lint scope;
- the ignored generated declaration should be manually edited;
- the test suite is warning-free or teardown-clean;
- the 79 tests provide balanced feature or coverage evidence;
- Gate A is complete on the final release.

Final Gate A evidence must identify the clean revision, approved lint scope,
test command, environment, complete output, reviewer, date, and accepted
exception list.
