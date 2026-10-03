# Performance measurement

Repeatable Android measurements for startup time, screen responsiveness, memory,
energy and reliability of platform-dependent features. Output is CSV under
`perf-out/` (gitignored), summarised as median / p90 / bootstrap 95% CI per metric.

## Prerequisites

- Android device (or emulator) connected via `adb`; report model + Android version from `device.txt` in the run folder.
- [Maestro](https://maestro.mobile.dev) CLI: `curl -Ls https://get.maestro.mobile.dev | bash`.
- Release build with perf marks enabled — dev builds are not valid for measurement:

```bash
EXPO_PUBLIC_PERF_LOG=1 pnpm exec expo run:android --variant release
```

- Signed in on the device with at least one pet. Flows take the pet name from `PET_NAME` (default `Rex`).
- Same device, brightness, network for every run. Close other apps.

## Run

```bash
pnpm perf all                     # startup + scenarios + reliability + energy + summary (N=10)
N=5 PET_NAME=Rex pnpm perf scenarios
pnpm perf size                    # APK + JS bundle bytes
pnpm perf startup                 # cold/warm `am start -W`
pnpm perf reliability             # image picker, reminder, assistant × N — pass/fail + crash/ANR count
pnpm perf energy                  # batterystats over ENERGY_LOOPS × all flows
pnpm perf flashlight              # FPS / CPU / RAM score (npx @perf-profiler/cli)
pnpm perf summary                 # recompute perf-out/summary.csv
```

`pnpm perf all` writes to a fresh `perf-out/run-<timestamp>/`, so each full run is summarised on
its own. Single subcommands append to `$OUT` (default `perf-out/`) so a run can be built up step
by step. Point them at a new folder when the build or device changes, for example
`OUT=perf-out/pixel7-v2 pnpm perf startup` and then `OUT=perf-out/pixel7-v2 pnpm perf summary`.
Mixing samples from different builds in one folder corrupts the medians and the PSS slope.

Flows live in `.maestro/`. Run one directly: `maestro test -e PET_NAME=Rex .maestro/02-load-pet-records.yaml`.
The system photo picker, crop editor and time picker vary by Android version — tune those steps once with `maestro studio`.

## What is measured

| File              | Columns                                                                                           | Source                                                                                                |
| ----------------- | ------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `startup.csv`     | `kind` (cold/warm), `total_ms`                                                                    | `adb shell am start -W` `TotalTime`                                                                   |
| `scenarios.csv`   | `passed`, `frames`, `janky_pct`, `p50/p90/p95/p99_ms`, `pss_kb`, `java_heap_kb`, `native_heap_kb` | `dumpsys gfxinfo` (reset before each flow), `dumpsys meminfo` after                                   |
| `marks.csv`       | `from`, `to`, `delta_ms`                                                                          | `[perf]` logcat lines from `PerfLogger`: route changes, query fetch→success, mutation pending→success |
| `reliability.csv` | `runs`, `passed`, `success_pct`                                                                   | Maestro exit codes                                                                                    |
| `energy.csv`      | `duration_s`, `battery_drop_pct`, `estimated_mah`                                                 | `dumpsys batterystats` (`Estimated power use` for the app UID)                                        |
| `summary.csv`     | `metric`, `n`, `median`, `p90`, `min`, `max`                                                      | computed from the above                                                                               |

Notification delivery: reminders are pushed by the backend at their due time. After
`04-schedule-reminder` runs, wait for the due time and count:

```bash
adb shell dumpsys notification --noredact | grep -c "pkg=com.anonymous.smartpetcareapp"
```

Repeat with the device in Doze (`adb shell dumpsys deviceidle force-idle`) for the low-power case.

## Scenario map

| Diploma scenario                          | Flow                      | Metrics                                                                  |
| ----------------------------------------- | ------------------------- | ------------------------------------------------------------------------ |
| Opening the application                   | `00-open-app` + `startup` | cold / warm `total_ms`, first `route` mark                               |
| Navigating between principal screens      | `01-navigate-tabs`        | `janky_pct`, `p90_ms`, `route → route` marks                             |
| Loading pet records                       | `02-load-pet-records`     | `query:fetch → query:success` marks, `pss_kb`                            |
| Selecting an image                        | `03-select-image`         | `success_pct`, `mutation` marks                                          |
| Scheduling a notification                 | `04-schedule-reminder`    | `success_pct`, delivered count                                           |
| Exchanging messages with the AI assistant | `05-assistant-message`    | `mutation:pending → success` per message, `pss_kb` growth, `success_pct` |
