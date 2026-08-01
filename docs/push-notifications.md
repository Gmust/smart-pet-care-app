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
3. Send FCM v1 notifications using one custom species channel and the `default` channel.
4. Verify foreground, background, and terminated-state delivery use the expected sounds.
5. Sign out and confirm `DELETE /api/notifications/device-token/{token}` is attempted before the local session is cleared.

Also test permission denial or revocation, offline sign-out, and signing into a second account on the same device. The backend must globally upsert/reassign tokens so registration is idempotent across users.

## Species notification sounds

The app registers custom Android channels for species that have bundled sounds. The backend must derive the channel from the reminder's `petSpecies` and set it in the FCM v1 payload at `message.android.notification.channel_id`. Sending `petSpecies` only as notification data does not select a channel for background or terminated-state notifications.

| `petSpecies`                                                  | Android channel ID            | Sound            |
| ------------------------------------------------------------- | ----------------------------- | ---------------- |
| `Dog`                                                         | `pet-reminders-dog-v1`        | `dog.wav`        |
| `Cat`                                                         | `pet-reminders-cat-v1`        | `cat.wav`        |
| `GuineaPig`                                                   | `pet-reminders-guinea-pig-v1` | `guinea_pig.wav` |
| `Bird`                                                        | `pet-reminders-bird-v1`       | `bird.wav`       |
| `Fish`                                                        | `pet-reminders-fish-v1`       | `fish.wav`       |
| `Rabbit`, `Hamster`, `Turtle`, `Unknown`, `Other`, or missing | `default`                     | Android default  |

For Android 7.1 and earlier, also set `message.android.notification.sound` to the custom filename or `default`. Channel sound settings are immutable after Android creates a channel, so use a new versioned channel ID when replacing a sound file.

Changing the bundled sound list requires regenerating and rebuilding the native Android app. Expo Go cannot load these custom sounds.

## Reminder status routing

When a reminder notification carries `data.reminderId`, tapping it opens the app and shows a status drawer (`ReminderStatusPrompt` → `ReminderStatusDrawer`) for that reminder. The user picks a status (`Completed`, `Missed`, or `Cancelled`), persisted via `PATCH /api/reminders/{id}`. Dismissing the drawer without choosing marks the reminder `Missed`. Notifications without a string `data.reminderId` open the app with no drawer.
