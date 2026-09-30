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
- Set `ANDROID_SERIAL` when `adb devices` lists more than one entry. Wireless debugging often adds an
  mDNS duplicate (`adb-<serial>._adb-tls-connect._tcp`) of the same phone.
- For `energy`, keep the device off the charger. Wireless debugging works; over USB the phone charges,
  so only the `batterystats` estimate (`app_estimated_mah`) is meaningful.

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

Re-running `scenarios` or `reliability` into the same `$OUT` resumes: iterations that already passed are
skipped. A flow that fails because of ADB or the Maestro driver (`device offline`, `DeviceServerDied`,
"0 devices") is not recorded. It is retried up to 3 times after a reconnect, and its log goes to
`$OUT/infra-failed/`.

While `startup`, `scenarios`, `reliability`, `energy` and `flashlight` run, the script holds the screen on and
restores the previous `screen_off_timeout` on exit. Maestro taps do not count as user activity, so without this
the phone locks in the middle of a run.

Flows live in `.maestro/`. Run one directly: `maestro test -e PET_NAME=Rex .maestro/02-load-pet-records.yaml`.
The system photo picker, crop editor and time picker vary by Android version — tune those steps once with `maestro studio`.
`03-select-image` is tuned for the Android 13 photo picker (`com.google.android.photopicker`) and the
expo-image-picker crop screen. Push a test image right before a run so it is the newest photo:
`adb push photo.jpg /sdcard/Pictures/`.
With 3-button navigation, a bare `"Home"` or `"Back"` also matches the system navigation bar, so flows
anchor those taps (`leftOf`, `above`) and check tabs with `selected: true`.

## What is measured

| File              | Columns                                                                                                               | Source                                                                                                                           |
| ----------------- | --------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `startup.csv`     | `kind` (cold/warm), `total_ms`                                                                                        | `adb shell am start -W` `TotalTime`                                                                                              |
| `ttfd.csv`        | `first_screen_ms`, `data_settled_ms` (cold only)                                                                      | logcat: launch intent → first `[perf] route` mark → last `query:success/error` mark                                              |
| `scenarios.csv`   | `passed`, `frames`, `janky_pct`, `p50/p90/p95/p99_ms`, `pss_kb`, `java_heap_kb`, `native_heap_kb`, `janky_legacy_pct` | `dumpsys gfxinfo` (reset before each flow), `dumpsys meminfo` after                                                              |
| `marks.csv`       | `from`, `to`, `delta_ms`                                                                                              | `[perf]` logcat lines from `PerfLogger`: route changes, query fetch→success, mutation pending→success                            |
| `reliability.csv` | `runs`, `passed`, `success_pct`                                                                                       | Maestro exit codes                                                                                                               |
| `energy.csv`      | `phase` (active/idle), `duration_s`, `battery_drop_pct`, `charge_drop_uah`, `avg_ma`, `app_estimated_mah`             | `/sys/class/power_supply/battery/{capacity,charge_counter}` (whole device); `dumpsys batterystats` for the app UID (active only) |
| `summary.csv`     | `metric`, `n`, `median`, `p90`, `min`, `max`                                                                          | computed from the above                                                                                                          |

Notification delivery: reminders are pushed by the backend at their due time. After
`04-schedule-reminder` runs, wait for the due time and count:

```bash
adb shell dumpsys notification --noredact | grep -c "pkg=com.anonymous.smartpetcareapp"
```

Repeat with the device in Doze (`adb shell dumpsys deviceidle force-idle`) for the low-power case.

## Scenario map

| Diploma scenario                          | Flow                      | Metrics                                                                  |
| ----------------------------------------- | ------------------------- | ------------------------------------------------------------------------ |
| Opening the application                   | `00-open-app` + `startup` | cold / warm `total_ms`, `first_screen_ms`, `data_settled_ms`             |
| Navigating between principal screens      | `01-navigate-tabs`        | `janky_pct`, `p90_ms`, `route → route` marks                             |
| Loading pet records                       | `02-load-pet-records`     | `query:fetch → query:success` marks, `pss_kb`                            |
| Selecting an image                        | `03-select-image`         | `success_pct`, `mutation` marks                                          |
| Scheduling a notification                 | `04-schedule-reminder`    | `success_pct`, delivered count                                           |
| Exchanging messages with the AI assistant | `05-assistant-message`    | `mutation:pending → success` per message, `pss_kb` growth, `success_pct` |

## Reading the results

- `total_ms` is the first frame, which in a React Native app is the splash screen. Use `ttfd.csv` for when the user sees Home and its data.
- Every flow starts with `launchApp`, which restarts the process. Frame stats therefore include cold-start frames, and `pss_slope_kb_per_iter` shows drift between runs, not a leak inside one session.
- `janky_pct` counts frames that miss the display deadline, which is 8.3 ms on a 120 Hz screen, so it runs high on such phones. `janky_legacy_pct` uses a fixed 16 ms frame-duration threshold and also catches long cold-start frames, so in a flow it can exceed `janky_pct`. Report both, with the refresh rate (`adb shell dumpsys display | grep fps=`).
- `avg_ma` covers the whole device (screen, radio, ADB). Compare the `active` row with the `idle` row rather than reading it on its own.
- Battery values come from sysfs because `dumpsys battery unplug` (needed for `batterystats` over USB) freezes what `dumpsys battery` reports. Runs before this change always recorded `battery_drop_pct` as 0.
