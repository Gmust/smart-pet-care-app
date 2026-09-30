#!/usr/bin/env bash
# Performance measurement matrix for the Android release build.
# Usage:
#   scripts/perf.sh all                # everything below, N=10
#   scripts/perf.sh size               # APK + JS bundle size
#   scripts/perf.sh startup            # cold + warm startup (am start -W) + cold time to Home/data
#   scripts/perf.sh scenarios          # maestro flows + gfxinfo + meminfo + [perf] logcat
#   scripts/perf.sh reliability        # repeat flows, count pass/fail + crashes/ANRs
#   scripts/perf.sh energy             # charge counter + batterystats over a fixed session, idle baseline
#   scripts/perf.sh flashlight         # FPS/CPU/RAM score via @perf-profiler/cli
#   scripts/perf.sh summary            # median/p90/95% CI over out/*.csv, first run discarded, PSS slope
# Env: N (iterations, default 10), PET_NAME (default Rex),
#      OUT (default perf-out/run-<timestamp> for `all`, perf-out otherwise),
#      ENERGY_LOOPS (flow loops for energy run, default 5), IDLE_S (idle baseline seconds, default 300),
#      ANDROID_SERIAL (pick the device when adb lists more than one entry).
set -euo pipefail

PKG="com.anonymous.smartpetcareapp"
ACTIVITY="$PKG/.MainActivity"
N="${N:-10}"
PET_NAME="${PET_NAME:-Rex}"
# A full run gets its own folder: the CSVs are append-only, so re-running into
# the same folder would silently mix samples from an earlier build or device
# into the summary. Single subcommands still append to $OUT on purpose, so a
# run can be built up step by step (and summarised with the same OUT).
if [[ "${1:-all}" == "all" && -z "${OUT:-}" ]]; then
  OUT="perf-out/run-$(date +%Y%m%d-%H%M%S)"
fi
OUT="${OUT:-perf-out}"
ENERGY_LOOPS="${ENERGY_LOOPS:-5}"
IDLE_S="${IDLE_S:-300}"
FLOWS=".maestro"
SCENARIOS=(01-navigate-tabs 02-load-pet-records 03-select-image 04-schedule-reminder 05-assistant-message)

mkdir -p "$OUT/logcat"

# Maestro's taps do not count as user activity, so the screen times out (and
# locks) mid-run. Hold it on for the run and put the user's setting back after.
SCREEN_TIMEOUT0=""
UNPLUGGED=0
keep_awake() {
  SCREEN_TIMEOUT0=$(adb shell settings get system screen_off_timeout | tr -d '\r')
  adb shell settings put system screen_off_timeout 14400000
}
cleanup() {
  if [[ -n "$SCREEN_TIMEOUT0" ]]; then
    adb shell settings put system screen_off_timeout "$SCREEN_TIMEOUT0" > /dev/null 2>&1 || true
  fi
  # Never leave the device reporting "unplugged" (it stops charging-state updates until reset).
  if [[ "$UNPLUGGED" == 1 ]]; then adb shell dumpsys battery reset > /dev/null 2>&1 || true; fi
}
trap cleanup EXIT

device_info() {
  {
    echo "model=$(adb shell getprop ro.product.model)"
    echo "android=$(adb shell getprop ro.build.version.release)"
    echo "sdk=$(adb shell getprop ro.build.version.sdk)"
    echo "app_version=$(adb shell dumpsys package "$PKG" | grep versionName | head -1 | tr -d ' ')"
    echo "date=$(date -Iseconds)"
  } > "$OUT/device.txt"
  cat "$OUT/device.txt"
}

csv() { # file header row...
  local f="$OUT/$1.csv"; shift
  [[ -f "$f" ]] || echo "$1" > "$f"
  shift
  echo "$*" | tr ' ' ',' >> "$f"
}

# ---------- size ----------
size() {
  echo ">> size"
  local remote
  remote=$(adb shell pm path "$PKG" | head -1 | sed 's/^package://' | tr -d '\r')
  adb pull "$remote" "$OUT/app.apk" > /dev/null
  local apk bundle
  # wc, not stat: stat's flags differ between BSD and GNU, and GNU `stat -f`
  # prints file-system info instead of failing.
  apk=$(wc -c < "$OUT/app.apk" | tr -d ' ')
  # No `exit` in awk: quitting early SIGPIPEs unzip, and pipefail + set -e then
  # abort the whole run (rc 141). The bundle entry is unique anyway.
  bundle=$(unzip -l "$OUT/app.apk" | awk '/index.android.bundle/ {print $1}')
  csv size "apk_bytes,js_bundle_bytes" "$apk ${bundle:-}"
  echo "apk=$((apk/1024))kB bundle=$((${bundle:-0}/1024))kB"
}

# ---------- startup ----------
startup() {
  echo ">> startup ($N cold + $N warm)"
  for i in $(seq 1 "$N"); do
    adb shell am force-stop "$PKG"; sleep 3
    adb logcat -c
    local t ttfd
    t=$(adb shell am start -W -n "$ACTIVITY" | awk -F: '/TotalTime/ {gsub(/ /,"",$2); print $2}')
    csv startup "kind,iteration,total_ms" "cold $i $t"
    sleep 8
    # TotalTime is the first frame, which for React Native is the splash screen.
    # From the launch intent: first route mark (screen shown), last query settled (data loaded).
    ttfd=$(adb logcat -d -v epoch -s ActivityTaskManager ReactNativeJS | tee "$OUT/logcat/startup-cold-$i.txt" | awk '
      /ActivityTaskManager: START u0/ && /smartpetcareapp/ && !s { s=$1 }
      /\[perf\] route \// && !/\[perf\] route \/ t=/ && !r { r=$1 }
      /\[perf\] query:(success|error)/ { q=$1 }
      END { printf "%s %s", (s && r ? sprintf("%.0f", (r-s)*1000) : ""), (s && q ? sprintf("%.0f", (q-s)*1000) : "") }')
    csv ttfd "iteration,first_screen_ms,data_settled_ms" "$i $ttfd"
    echo "cold #$i: ${t}ms (screen, data: $ttfd ms)"
  done
  for i in $(seq 1 "$N"); do
    adb shell input keyevent KEYCODE_HOME; sleep 2
    local t
    t=$(adb shell am start -W -n "$ACTIVITY" | awk -F: '/TotalTime/ {gsub(/ /,"",$2); print $2}')
    csv startup "kind,iteration,total_ms" "warm $i $t"
    echo "warm #$i: ${t}ms"
    sleep 2
  done
}

# ---------- scenarios: frames + memory + [perf] marks ----------
# Wireless ADB drops and Maestro driver restarts are not app failures.
INFRA_RE="DeviceServerDied|devices connected|Not enough devices|device offline|waiting for device|device not found|host:transport"

reconnect() {
  # An offline mDNS duplicate of a wireless device makes Maestro see 0 devices.
  adb devices | awk '/offline/ {print $1}' | while read -r d; do adb disconnect "$d" > /dev/null 2>&1 || true; done
  if [[ "${ANDROID_SERIAL:-}" == *:* ]]; then adb connect "$ANDROID_SERIAL" > /dev/null 2>&1 || true; fi
  for _ in $(seq 1 36); do
    [[ "$(adb get-state 2>/dev/null)" == device ]] && return 0
    sleep 5
  done
}

run_flow() { # name iteration -> exit code
  local name="$1" i="$2" try rc
  # Resume: an iteration that already passed in this $OUT is not run again.
  grep -q "^$name,$i,1," "$OUT/scenarios.csv" 2>/dev/null && return 0
  for try in 1 2 3; do
    rc=0; measure_flow "$name" "$i" || rc=$?
    [[ $rc -eq 0 ]] && return 0
    grep -qE "$INFRA_RE" "$OUT/logcat/$name-$i.maestro.log" || return $rc
    # Drop the row, keep the log, reconnect and re-run the same iteration.
    echo "   infra failure ($name #$i, try $try): reconnecting"
    sed -i.bak '$d' "$OUT/scenarios.csv" && rm -f "$OUT/scenarios.csv.bak"
    mkdir -p "$OUT/infra-failed"
    mv "$OUT/logcat/$name-$i.maestro.log" "$OUT/infra-failed/$name-$i-try$try.maestro.log"
    reconnect
  done
  return 1
}

measure_flow() { # name iteration -> exit code
  local name="$1" i="$2"
  adb shell dumpsys gfxinfo "$PKG" reset > /dev/null
  adb logcat -c
  local rc=0
  maestro test -e "PET_NAME=$PET_NAME" -e "TS=$(date +%s)" "$FLOWS/$name.yaml" > "$OUT/logcat/$name-$i.maestro.log" 2>&1 || rc=$?
  adb logcat -d -v time -s ReactNativeJS ActivityTaskManager > "$OUT/logcat/$name-$i.logcat.txt"
  local gfx pss java native
  gfx=$(adb shell dumpsys gfxinfo "$PKG")
  # Here-strings, not `echo | awk ... exit`: awk quitting at the first match
  # SIGPIPEs echo once a dump outgrows the pipe buffer, aborting under pipefail.
  local total janky p50 p90 p95 p99
  total=$(awk '/Total frames rendered/ {print $4; exit}' <<< "$gfx")
  janky=$(awk '/^Janky frames:/ {gsub(/[()%]/,"",$4); print $4; exit}' <<< "$gfx")
  p50=$(awk '/50th percentile/ {gsub(/ms/,"",$3); print $3; exit}' <<< "$gfx")
  p90=$(awk '/90th percentile/ {gsub(/ms/,"",$3); print $3; exit}' <<< "$gfx")
  p95=$(awk '/95th percentile/ {gsub(/ms/,"",$3); print $3; exit}' <<< "$gfx")
  p99=$(awk '/99th percentile/ {gsub(/ms/,"",$3); print $3; exit}' <<< "$gfx")
  local mem
  mem=$(adb shell dumpsys meminfo "$PKG")
  pss=$(awk '/TOTAL PSS:/ {print $3; exit}' <<< "$mem")
  java=$(awk '/Java Heap:/ {print $3; exit}' <<< "$mem")
  native=$(awk '/Native Heap:/ {print $3; exit}' <<< "$mem")
  csv scenarios "scenario,iteration,passed,frames,janky_pct,p50_ms,p90_ms,p95_ms,p99_ms,pss_kb,java_heap_kb,native_heap_kb" \
    "$name $i $([[ $rc -eq 0 ]] && echo 1 || echo 0) ${total:-} ${janky:-} ${p50:-} ${p90:-} ${p95:-} ${p99:-} ${pss:-} ${java:-} ${native:-}"
  echo "$name #$i: rc=$rc janky=${janky:-?}% p90=${p90:-?}ms pss=${pss:-?}kB"
  return $rc
}

scenarios() {
  echo ">> scenarios ($N each)"
  for s in "${SCENARIOS[@]}"; do
    for i in $(seq 1 "$N"); do run_flow "$s" "$i" || true; done
  done
  # route/query timings from [perf] marks: delta between consecutive marks per file
  for f in "$OUT"/logcat/*.logcat.txt; do
    awk -v file="$(basename "$f" .logcat.txt)" '
      /\[perf\]/ { match($0, /t=[0-9]+/); t=substr($0, RSTART+2, RLENGTH-2);
        match($0, /\[perf\] [^ ]+ [^ ]+/); ev=substr($0, RSTART+7, RLENGTH-7); gsub(/,/, ";", ev);
        if (prev != "") printf "%s,%s,%s,%d\n", file, prev_ev, ev, t-prev; prev=t; prev_ev=ev }
    ' "$f"
  done | { echo "file,from,to,delta_ms"; cat; } > "$OUT/marks.csv"
  echo "marks -> $OUT/marks.csv"
}

# ---------- reliability ----------
crash_count() {
  adb shell dumpsys dropbox --print data_app_crash data_app_anr data_app_native_crash 2>/dev/null \
    | grep -c "Package: $PKG" || true
}

reliability() {
  echo ">> reliability ($N runs each; platform-dependent flows only)"
  local crashes0
  crashes0=$(crash_count)
  for s in 03-select-image 04-schedule-reminder 05-assistant-message; do
    local ok=0
    for i in $(seq 1 "$N"); do
      run_flow "$s" "r$i" && ok=$((ok+1))
    done
    csv reliability "scenario,runs,passed,success_pct" "$s $N $ok $((ok*100/N))"
    echo "$s: $ok/$N"
  done
  local crashes
  crashes=$(( $(crash_count) - crashes0 ))
  csv crashes "crashes_and_anrs" "$crashes"
  echo "crashes/ANRs during reliability: $crashes"
  echo "notifications delivered (check after reminder due time):"
  adb shell dumpsys notification --noredact | grep -c "pkg=$PKG" || true
}

# ---------- energy ----------
battery() { adb shell dumpsys battery | awk -v k="$1" '$0 ~ k {print $NF; exit}' | tr -d '\r'; }
energy_row() { # phase seconds level0 level1 charge0_uah charge1_uah [app_mah]
  local drop ma
  # Charge counter is the fuel gauge (uAh, whole device): valid only while not charging.
  drop=$(( ${5:-0} - ${6:-0} ))
  ma=$(awk -v d="$drop" -v s="$2" 'BEGIN { printf "%.0f", d * 3.6 / s }')
  csv energy "phase,duration_s,battery_drop_pct,charge_drop_uah,avg_ma,app_estimated_mah" \
    "$1 $2 $(( ${3:-0} - ${4:-0} )) $drop $ma ${7:-}"
  echo "$1: ${2}s drop=$(( ${3:-0} - ${4:-0} ))% charge=${drop}uAh avg=${ma}mA app_est=${7:-n/a}mAh"
}

energy() {
  echo ">> energy ($ENERGY_LOOPS loops of all flows, then ${IDLE_S}s idle baseline; do not charge the device)"
  local uid u0
  uid=$(adb shell cmd package list packages -U "$PKG" | sed -n 's/.*uid:\([0-9]*\).*/\1/p')
  u0="u0a$((uid-10000))"
  adb shell dumpsys battery unplug; UNPLUGGED=1
  adb shell dumpsys batterystats --reset > /dev/null
  local lvl0 cc0 t0 lvl1 cc1 t1
  lvl0=$(battery level); cc0=$(battery "Charge counter"); t0=$(date +%s)
  for _ in $(seq 1 "$ENERGY_LOOPS"); do
    for s in "${SCENARIOS[@]}"; do
      maestro test -e "PET_NAME=$PET_NAME" -e "TS=$(date +%s)" "$FLOWS/$s.yaml" > /dev/null 2>&1 || true
    done
  done
  lvl1=$(battery level); cc1=$(battery "Charge counter"); t1=$(date +%s)
  adb shell dumpsys batterystats --charged > "$OUT/batterystats.txt"
  local mah
  mah=$(awk -v u="$u0" '/Estimated power use/ {on=1} on && index(tolower($0), "uid "u) {gsub(/[^0-9.]/,"",$3); print $3; exit}' "$OUT/batterystats.txt")
  energy_row active "$((t1-t0))" "$lvl0" "$lvl1" "$cc0" "$cc1" "${mah:-}"
  # Idle baseline: same screen, radio and ADB state, app on Home, no input.
  # active - idle is what the scripted use itself costs.
  adb shell am start -n "$ACTIVITY" > /dev/null; sleep 5
  lvl0=$(battery level); cc0=$(battery "Charge counter"); t0=$(date +%s)
  sleep "$IDLE_S"
  lvl1=$(battery level); cc1=$(battery "Charge counter"); t1=$(date +%s)
  energy_row idle "$((t1-t0))" "$lvl0" "$lvl1" "$cc0" "$cc1"
  adb shell dumpsys battery reset; UNPLUGGED=0
  echo "full batterystats dump: $OUT/batterystats.txt"
}

# ---------- flashlight ----------
flashlight() {
  echo ">> flashlight (FPS/CPU/RAM score)"
  for s in "${SCENARIOS[@]}"; do
    npx --yes @perf-profiler/cli test --bundleId "$PKG" --iterationCount "$N" \
      --testCommand "maestro test -e PET_NAME=$PET_NAME -e TS=\$(date +%s) $FLOWS/$s.yaml" \
      --resultsFilePath "$OUT/flashlight-$s.json"
  done
  npx --yes @perf-profiler/cli report "$OUT"/flashlight-*.json
}

# ---------- summary ----------
summary() {
  python3 - "$OUT" <<'PY'
import csv, random, statistics, sys, pathlib
random.seed(0)
out = pathlib.Path(sys.argv[1])
rows = []
def ci95(vals):
    meds = sorted(statistics.median(random.choices(vals, k=len(vals))) for _ in range(2000))
    return meds[int(0.025*len(meds))], meds[int(0.975*len(meds))]
def stats(label, vals):
    vals = sorted(float(v) for v in vals if v not in ("", None))
    if not vals: return
    p90 = vals[min(len(vals)-1, int(round(0.9*(len(vals)-1))))]
    lo, hi = ci95(vals) if len(vals) > 1 else (vals[0], vals[0])
    rows.append((label, len(vals), statistics.median(vals), p90, lo, hi, vals[0], vals[-1]))
def load(path):
    if not (out/path).exists(): return []
    data = list(csv.DictReader(open(out/path)))
    # A flow that failed early looks fast and lean, and reliability() repeats
    # ("r"-prefixed iterations) land in scenarios.csv too: keep neither.
    data = [r for r in data if r.get("passed", "1") == "1" and not r["iteration"].startswith("r")]
    # discard warm-up: first iteration of each group is JIT/cache cold
    groups = {}
    for r in data: groups.setdefault(r.get("kind") or r.get("scenario"), []).append(r)
    kept = []
    for g in groups.values():
        kept += [r for r in g if r["iteration"].lstrip("r") != "1"] if len(g) > 3 else g
    return kept
def group(data, key, metrics):
    for k in sorted({r[key] for r in data}):
        for m in metrics:
            stats(f"{k} {m}", [r[m] for r in data if r[key]==k])
group(load("startup.csv"), "kind", ["total_ms"])
ttfd = load("ttfd.csv")
for m in ("first_screen_ms", "data_settled_ms"):
    stats(f"cold {m}", [r[m] for r in ttfd])
scen = load("scenarios.csv")
group(scen, "scenario", ["janky_pct","p90_ms","p99_ms","pss_kb","java_heap_kb"])
# memory leak check: least-squares slope of PSS over iteration order per scenario
slopes = []
for k in sorted({r["scenario"] for r in scen}):
    ys = [float(r["pss_kb"]) for r in scen if r["scenario"]==k and r["pss_kb"]]
    if len(ys) < 3: continue
    xs = range(len(ys)); mx = statistics.mean(xs); my = statistics.mean(ys)
    slope = sum((x-mx)*(y-my) for x, y in zip(xs, ys)) / sum((x-mx)**2 for x in xs)
    slopes.append((k, len(ys), slope))
if (out/"energy.csv").exists():
    for r in csv.DictReader(open(out/"energy.csv")):
        if r.get("avg_ma"):
            stats(f"energy {r['phase']} avg_ma", [r["avg_ma"]])
if (out/"marks.csv").exists():
    data = list(csv.DictReader(open(out/"marks.csv")))
    for k in sorted({(r["from"],r["to"]) for r in data}):
        stats(f"mark {k[0]} -> {k[1]}", [r["delta_ms"] for r in data if (r["from"],r["to"])==k])
with open(out/"summary.csv","w",newline="") as f:
    w = csv.writer(f); w.writerow(["metric","n","median","p90","ci95_lo","ci95_hi","min","max"]); w.writerows(rows)
    for k, n, slope in slopes: w.writerow([f"{k} pss_slope_kb_per_iter", n, f"{slope:.1f}", "", "", "", "", ""])
for r in rows: print(f"{r[0]:<60} n={r[1]:<3} med={r[2]:<9.1f} p90={r[3]:<9.1f} ci95=[{r[4]:.0f},{r[5]:.0f}] min={r[6]:.0f} max={r[7]:.0f}")
for k, n, slope in slopes: print(f"{k+' pss_slope_kb_per_iter':<60} n={n:<3} {slope:+.1f} kB/iter{'  <-- possible leak' if slope > 2048 else ''}")
print(f"-> {out/'summary.csv'}")
PY
}

case "${1:-all}" in
  all) device_info; keep_awake; size; startup; scenarios; reliability; energy; summary ;;
  startup|scenarios|reliability|energy|flashlight) device_info; keep_awake; "$1" ;;
  size|summary) device_info; "$1" ;;
  *) echo "unknown command: $1"; exit 1 ;;
esac
