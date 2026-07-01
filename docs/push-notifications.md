# Android Push Notifications

Android builds register the native Firebase Cloud Messaging (FCM) token with the authenticated API. The backend sends directly through FCM; the app does not use Expo Push Tokens or an EAS project ID.

## Firebase setup

- Create an EAS file environment variable named `GOOGLE_SERVICES_JSON` from the Firebase Android client file for every Android build environment. `app.config.ts` passes the temporary file path to Expo during the build.
- For local builds, keep the client file at the ignored repository-root path `google-services.json` and expose its path when running Expo commands:

```bash
GOOGLE_SERVICES_JSON=./google-services.json pnpm exec expo prebuild --platform android
GOOGLE_SERVICES_JSON=./google-services.json pnpm android
```

- Confirm its Android package is exactly `com.anonymous.smartpetcareapp`, matching `expo.android.package` in `app.json`.
- Keep Firebase service-account credentials on the backend. Do not add them to the app.
- Regenerate and rebuild the native Android app after changing `google-services.json`, notification plugin settings, or `expo-notifications`.

Expo Go cannot validate this integration. Use a development or release build on an Android device or emulator with Google Play services.

## Manual FCM test

1. Sign in and accept the Android notification permission prompt.
2. Confirm the backend receives `POST /api/notifications/device-token` with `platform: "Android"`.
3. Send an FCM v1 notification to the stored token using channel ID `default`.
4. Verify foreground, background, and terminated-state delivery.
5. Sign out and confirm `DELETE /api/notifications/device-token/{token}` is attempted before the local session is cleared.

Also test permission denial or revocation, offline sign-out, and signing into a second account on the same device. The backend must globally upsert/reassign tokens so registration is idempotent across users.

## Reminder status routing

When a reminder notification carries `data.reminderId`, tapping it opens the app and shows a status drawer (`ReminderStatusPrompt` → `ReminderStatusDrawer`) for that reminder. The user picks a status (`Completed`, `Missed`, or `Cancelled`), persisted via `PATCH /api/reminders/{id}`. Dismissing the drawer without choosing marks the reminder `Missed`. Notifications without a string `data.reminderId` open the app with no drawer.
