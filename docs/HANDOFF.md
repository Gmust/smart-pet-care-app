# Handoff

Session state for the next agent or developer. Update it at the end of any session
that changed code, contracts, or checks — see the Definition of Done in `AGENTS.md`.
Keep it short and factual: what is true now, what was actually verified, what is not.

## Current state

- Branch: `chore/perf-measurement`, three commits on `main` (`ab047e8`), not pushed:
  babel dependencies declared, Maestro flows fixed, `scripts/perf.sh` extended.
- Diploma performance measurement done on Android. The results live in
  `perf-out/run-20260929-204322/` (gitignored): `THESIS.md` is the write-up and
  `RESULTS.md` has the full tables.
- `babel-preset-expo` and `babel-plugin-react-compiler` are now devDependencies.
  Before this, release bundling (`createBundleReleaseJsAndAssets`) failed with
  "Cannot find module".
- Backend error contract v1: `src/errors/` holds the alias translations and
  `getApiError` / `getApiErrorMessage` / `setApiFieldErrors`. Screens branch on
  `code`; the convention is in `AGENTS.md` → API Layer.
- `pnpm test:api` runs contract tests against the real backend with a dedicated test
  account (`API_TEST_EMAIL` / `API_TEST_PASSWORD`). The suite rotates that
  account's refresh token, so a device signed in with the same account is signed out.

## Verified evidence

- `pnpm check` — pass (2026-09-30, after the dependency change): 30 suites, 257 tests.
- Release JS bundle builds with no `NODE_PATH` workaround:
  `expo export:embed --platform android --dev false` bundles 2957 modules.
- Device run (2026-09-29, Samsung S20 FE, Android 13, 120 Hz, release build `ab047e8`
  with `EXPO_PUBLIC_PERF_LOG=1`, test account, Wi-Fi):
  - Maestro flows pass: 01–04 ten times each, 05 five times.
  - 20/20 cold and warm starts; 0 crashes or ANRs (`dumpsys dropbox`).
  - Cold TTID 746 ms; Home rendered at 844 ms; Home data loaded at 1.77 s.
  - Memory (PSS) after a scenario: 423–506 MB. AI reply: median 1.5 s.
  - Active use drew 645 mA against 441 mA idle.
- Extended `perf.sh` on the device (2026-09-30, `perf-out/verify-0942/`):
  `startup` (N=2) writes `ttfd.csv` and restores `screen_off_timeout`;
  `scenarios` (N=1) passes all 5 flows, and a second run into the same `$OUT` resumes
  in 1 s; `energy` reads the fuel gauge from sysfs, warns when the phone is charging,
  and leaves fields empty when they cannot be read.
- `dumpsys battery unplug` freezes the values `dumpsys battery` reports, so every
  earlier `energy` run recorded `battery_drop_pct` = 0. The diploma run is not affected:
  its charge-counter reads happened outside the unplugged window.
- New `perf.sh` logic, checked earlier on recorded data:
  - the TTFD awk reproduces the run's `ttfd.csv` from its logcat;
  - `summary` works on a copy of the run;
  - the `battery()` parser works on the device.

## Limitations

- Not exercised on a device: the infra retry/`reconnect` path of `perf.sh` (it needs an
  ADB drop), and a full `energy` run on battery; the verify run was on the charger.
- pnpm 11 ignores `node-linker=hoisted` in `.npmrc`, so `node_modules` is `isolated`,
  although `AGENTS.md` says the layout is hoisted. Decide: move it to
  `pnpm-workspace.yaml` (`nodeLinker: hoisted`) or correct `AGENTS.md`.
- Wireless ADB drops during long runs, and the phone's IP/port changes after sleep.
  22 flow attempts were lost to this in the measurement run and were re-run.
- Frame jank is high on this 120 Hz phone. A control run of tab switching with
  `adb input`, without Maestro (2026-09-30), gave 67–73 % janky against the 8.3 ms
  deadline but 15 % against the legacy 16 ms threshold; p50 is 10 ms and p99 is 20 ms.
  The cause is render-thread draw commands, not the JS/UI thread. Maestro does not
  inflate the jank figure. `perf.sh` now also records `janky_legacy_pct`. In flows it can exceed `janky_pct`,
  because it also counts long cold-start frames.
- Not measured: delivery of a scheduled push at its due time, and memory growth
  within one session.
- Not verified on a device: the confirmation-code flows (need an inbox), assistant
  failure/retry paths, and a photo over the size limit.
- `src/api/generated/` is gitignored; run `pnpm api:generate` after install.
- Known spec gaps: `PatchFieldOf*` enum types and `PatchFieldOfDateTime` have no
  `null`. Backend issues to raise: duplicate `auth_email_invalid` on register, and
  empty chat text returns both `_required` and `_too_long`.

## Next task

One bounded, independently verifiable task:

- Decide the pnpm node linker: `nodeLinker: hoisted` in `pnpm-workspace.yaml` (as
  `AGENTS.md` intends), or correct `AGENTS.md` to say `isolated`. Then run `pnpm check`
  and a release build.

## Completion fields

- Outcome: performance measured for the diploma, including a control run of tab navigation
  without Maestro; release build unblocked; perf tooling hardened against flaky wireless ADB;
  frozen battery readings in `energy` fixed.
- Files / contracts changed: `package.json`, `pnpm-lock.yaml`, `.maestro/00–03`,
  `scripts/perf.sh`, `docs/performance-measurement.md`, `docs/HANDOFF.md`.
- Checks run and results: `pnpm check` green; release bundle builds; device run as above.
- Platforms actually tested: Android (Samsung S20 FE, Android 13, release build).
- Remaining limitations: see Limitations.
- Next bounded task: decide the pnpm node linker.
