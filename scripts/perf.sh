#!/usr/bin/env bash
# Performance measurement matrix for the Android release build.
# Usage:
#   scripts/perf.sh all                # everything below, N=10
#   scripts/perf.sh size               # APK + JS bundle size
#   scripts/perf.sh startup            # cold + warm startup (am start -W)
#   scripts/perf.sh scenarios          # maestro flows + gfxinfo + meminfo + [perf] logcat
#   scripts/perf.sh reliability        # repeat flows, count pass/fail + crashes/ANRs
#   scripts/perf.sh energy             # batterystats over a fixed session
#   scripts/perf.sh flashlight         # FPS/CPU/RAM score via @perf-profiler/cli
#   scripts/perf.sh summary            # median/p90/95% CI over out/*.csv, first run discarded, PSS slope
# Env: N (iterations, default 10), PET_NAME (default Rex), OUT (default perf-out),
#      ENERGY_LOOPS (flow loops for energy run, default 5).
set -euo pipefail

PKG="com.anonymous.smartpetcareapp"
ACTIVITY="$PKG/.MainActivity"
N="${N:-10}"
PET_NAME="${PET_NAME:-Rex}"
OUT="${OUT:-perf-out}"
ENERGY_LOOPS="${ENERGY_LOOPS:-5}"
FLOWS=".maestro"
SCENARIOS=(01-navigate-tabs 02-load-pet-records 03-select-image 04-schedule-reminder 05-assistant-message)

mkdir -p "$OUT/logcat"

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
  apk=$(stat -f %z "$OUT/app.apk" 2>/dev/null || stat -c %s "$OUT/app.apk")
  bundle=$(unzip -l "$OUT/app.apk" | awk '/index.android.bundle/ {print $1; exit}')
  csv size "apk_bytes,js_bundle_bytes" "$apk ${bundle:-}"
  echo "apk=$((apk/1024))kB bundle=$((${bundle:-0}/1024))kB"
}

# ---------- startup ----------
startup() {
  echo ">> startup ($N cold + $N warm)"
  for i in $(seq 1 "$N"); do
    adb shell am force-stop "$PKG"; sleep 3
    local t
    t=$(adb shell am start -W -n "$ACTIVITY" | awk -F: '/TotalTime/ {gsub(/ /,"",$2); print $2}')
    csv startup "kind,iteration,total_ms" "cold $i $t"
    echo "cold #$i: ${t}ms"
    sleep 3
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
run_flow() { # name iteration -> exit code
  local name="$1" i="$2"
  adb shell dumpsys gfxinfo "$PKG" reset > /dev/null
  adb logcat -c
  local rc=0
  maestro test -e "PET_NAME=$PET_NAME" -e "TS=$(date +%s)" "$FLOWS/$name.yaml" > "$OUT/logcat/$name-$i.maestro.log" 2>&1 || rc=$?
  adb logcat -d -v time -s ReactNativeJS ActivityTaskManager > "$OUT/logcat/$name-$i.logcat.txt"
  local gfx pss java native
  gfx=$(adb shell dumpsys gfxinfo "$PKG")
  local total janky p50 p90 p95 p99
  total=$(echo "$gfx" | awk '/Total frames rendered/ {print $4; exit}')
  janky=$(echo "$gfx" | awk '/^Janky frames:/ {gsub(/[()%]/,"",$4); print $4; exit}')
  p50=$(echo "$gfx" | awk '/50th percentile/ {gsub(/ms/,"",$3); print $3; exit}')
  p90=$(echo "$gfx" | awk '/90th percentile/ {gsub(/ms/,"",$3); print $3; exit}')
  p95=$(echo "$gfx" | awk '/95th percentile/ {gsub(/ms/,"",$3); print $3; exit}')
  p99=$(echo "$gfx" | awk '/99th percentile/ {gsub(/ms/,"",$3); print $3; exit}')
  local mem
  mem=$(adb shell dumpsys meminfo "$PKG")
  pss=$(echo "$mem" | awk '/TOTAL PSS:/ {print $3; exit}')
  java=$(echo "$mem" | awk '/Java Heap:/ {print $3; exit}')
  native=$(echo "$mem" | awk '/Native Heap:/ {print $3; exit}')
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
energy() {
  echo ">> energy ($ENERGY_LOOPS loops of all flows, unplug USB power: adb shell dumpsys battery unplug)"
  local uid u0
  uid=$(adb shell cmd package list packages -U "$PKG" | sed -n 's/.*uid:\([0-9]*\).*/\1/p')
  u0="u0a$((uid-10000))"
  adb shell dumpsys battery unplug
  adb shell dumpsys batterystats --reset > /dev/null
  local lvl0 t0 lvl1 t1
  lvl0=$(adb shell dumpsys battery | awk '/level/ {print $2}'); t0=$(date +%s)
  for _ in $(seq 1 "$ENERGY_LOOPS"); do
    for s in "${SCENARIOS[@]}"; do
      maestro test -e "PET_NAME=$PET_NAME" -e "TS=$(date +%s)" "$FLOWS/$s.yaml" > /dev/null 2>&1 || true
    done
  done
  lvl1=$(adb shell dumpsys battery | awk '/level/ {print $2}'); t1=$(date +%s)
  adb shell dumpsys batterystats --charged > "$OUT/batterystats.txt"
  local mah
  mah=$(awk -v u="$u0" '/Estimated power use/ {on=1} on && index(tolower($0), "uid "u) {gsub(/[^0-9.]/,"",$3); print $3; exit}' "$OUT/batterystats.txt")
  csv energy "duration_s,battery_drop_pct,estimated_mah" "$((t1-t0)) $((lvl0-lvl1)) ${mah:-}"
  adb shell dumpsys battery reset
  echo "duration=$((t1-t0))s drop=$((lvl0-lvl1))% est=${mah:-?}mAh (full dump: $OUT/batterystats.txt)"
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
  all) device_info; size; startup; scenarios; reliability; energy; summary ;;
  size|startup|scenarios|reliability|energy|flashlight|summary) device_info; "$1" ;;
  *) echo "unknown command: $1"; exit 1 ;;
esac
