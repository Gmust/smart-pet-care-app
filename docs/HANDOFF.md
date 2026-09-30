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
- New `perf.sh` logic, checked only in parts:
  - the TTFD awk reproduces the run's `ttfd.csv` from its logcat;
  - `summary` works on a copy of the run;
  - the `battery()` parser works on the device.

## Limitations

- The extended `scripts/perf.sh` has not run end to end on a device. Untested paths:
  `keep_awake`, `reconnect`, retry and resume of flows, and the idle baseline in
  `energy`.
- pnpm 11 ignores `node-linker=hoisted` in `.npmrc`, so `node_modules` is `isolated`,
  although `AGENTS.md` says the layout is hoisted. Decide: move it to
  `pnpm-workspace.yaml` (`nodeLinker: hoisted`) or correct `AGENTS.md`.
- Wireless ADB drops during long runs, and the phone's IP/port changes after sleep.
  22 flow attempts were lost to this in the measurement run and were re-run.
- Frame jank measured through Maestro is overstated because its accessibility queries
  run on the UI thread. A clean tab-switching measurement with `adb input` has not
  been taken.
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

- Run `ANDROID_SERIAL=<device> N=2 IDLE_S=60 ENERGY_LOOPS=1 pnpm perf all` once on the
  phone to exercise the new `perf.sh` paths end to end.

## Completion fields

- Outcome: performance measured for the diploma; release build unblocked; perf tooling
  hardened against flaky wireless ADB.
- Files / contracts changed: `package.json`, `pnpm-lock.yaml`, `.maestro/00–03`,
  `scripts/perf.sh`, `docs/performance-measurement.md`, `docs/HANDOFF.md`.
- Checks run and results: `pnpm check` green; release bundle builds; device run as above.
- Platforms actually tested: Android (Samsung S20 FE, Android 13, release build).
- Remaining limitations: see Limitations.
- Next bounded task: end-to-end run of the extended `perf.sh`.
