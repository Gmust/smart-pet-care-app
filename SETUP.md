# Vibe Coding from Phone — EAS Update Pipeline

This repo is wired so that changes you make (even committed from your phone) show
up on your phone within seconds via **EAS Update** (over-the-air JS/asset updates),
with **GitHub Actions** doing the publishing for you.

## The loop

```
edit code ──► git push to `preview` branch
                     │
                     ├─ JS / assets only ──► eas-update.yml ──► OTA update to `preview` channel
                     │                                              │
                     │                                              ▼
                     │                                     phone reloads app, new code appears
                     │
                     └─ native deps / config change ──► eas-build.yml ──► new APK build
                                                            │
                                                            ▼
                                             reinstall the build once on the phone
```

- **Most edits** (screens, components, logic, styles, images) are pure JS/assets.
  They ship as an OTA update — no rebuild, no reinstall. The `preview` build already
  on your phone picks them up on next launch.
- **Native changes** (adding a native module, changing `app.json`/`app.config.ts`,
  changing `package.json`/lockfile) change the **runtime fingerprint**. OTA can't
  ship those, so `eas-build.yml` produces a fresh APK you install once.

`runtimeVersion.policy` is set to `"fingerprint"` in `app.json`, so EAS
automatically refuses to apply an OTA update to a build whose native layer differs —
this prevents shipping a broken update.

## What's already in the repo

- `app.json` — `updates.url` (points at EAS project `05b59c80-...`) and
  `runtimeVersion.policy: "fingerprint"`.
- `expo-updates` added to `package.json` dependencies.
- `eas.json` — `development`, `preview`, `production` build profiles, each mapped to
  a matching EAS Update channel.
- `.github/workflows/eas-update.yml` — OTA publish on push to `preview`.
- `.github/workflows/eas-build.yml` — native rebuild (manual or on native-file change).

## One-time manual setup (you must do these)

These require interactive login / secrets and can't be done from this session.

1. **Install pinned deps** (locally, so the lockfile updates):

   ```bash
   npx expo install expo-updates
   pnpm install
   ```

   `npx expo install` pins `expo-updates` to the exact version compatible with SDK 56.
   Commit the updated `pnpm-lock.yaml`.

2. **Log in to EAS** (locally):

   ```bash
   eas login          # or: npx eas-cli login
   eas whoami         # confirm
   ```

   The EAS `projectId` is already in `app.json`, so the project is linked. If you ever
   need to relink or scaffold profiles, run `eas build:configure` (it will not overwrite
   the eas.json committed here unless you let it).

3. **Generate an Expo access token** for CI:
   - Go to https://expo.dev/settings/access-tokens → **Create token**.
   - Copy the token value.

4. **Add the token as a GitHub secret**:
   - GitHub repo → **Settings → Secrets and variables → Actions → New repository secret**.
   - Name: `EXPO_TOKEN` — Value: the token from step 3.

5. **Create the working branch** the workflows watch:

   ```bash
   git switch -c preview
   git push -u origin preview
   ```

   (Both workflows trigger on push to `preview`. Rename the branch in the two workflow
   files if you prefer a different one.)

6. **Build and install the preview app on your phone once**:

   ```bash
   eas build -p android --profile preview
   ```

   Install the resulting APK on your phone (scan the QR / download link EAS gives you).
   This is the build that will receive all future OTA updates. Rebuild only when
   `eas-build.yml` runs (native changes).

## Daily use

- Edit code, commit, and push to `preview` (from laptop or phone git client).
- Within a minute the OTA update is published; relaunch the app to see it.
- Changed a native dep or app config? The build workflow runs (or trigger it from the
  Actions tab), then reinstall the new APK once.

## Manual publish / build from the CLI (optional)

```bash
eas update --branch preview --message "quick fix"      # publish an OTA update now
eas build -p android --profile preview                 # native rebuild now
```

## Notes

- SDK 56 / React Native 0.85 with the New Architecture — all compatible with EAS Update.
- `production` uses a separate `production` channel so preview updates never reach real users.
- The existing `ci.yml` (lint/typecheck/test) still runs on PRs and is independent of this pipeline.
