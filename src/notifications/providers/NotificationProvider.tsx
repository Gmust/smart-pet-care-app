import { useEffect } from "react";
import type { ReactNode } from "react";
import { AppState, Platform } from "react-native";
import * as Notifications from "expo-notifications";

// TODO: app icon, splash icon, android adaptive icons, and notification icon are
// placeholders (see app.json: icon, splash-icon, android-icon-*, notification-icon).
// Swap in final assets once design is ready.
import { ReminderStatusPrompt } from "../components/ReminderStatusPrompt";
import {
  ANDROID_NOTIFICATION_CHANNEL_ID,
  ANDROID_NOTIFICATION_CHANNEL_ID_BY_SPECIES,
  registerAndroidDeviceToken,
  synchronizeAndroidDeviceToken,
} from "../services/notificationRegistration";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

interface NotificationProviderProps {
  children: ReactNode;
  isAuthenticated: boolean;
}

const logAndroidNotificationChannel = (
  source: "received" | "response",
  notification: Notifications.Notification
): void => {
  if (!__DEV__) return;

  const trigger = notification.request.trigger;
  const remoteMessage =
    trigger && "type" in trigger && trigger.type === "push" ? trigger.remoteMessage : undefined;
  const contentData = notification.request.content.data ?? {};
  const contentSpecies = contentData.petSpecies;
  const petSpecies =
    typeof contentSpecies === "string" ? contentSpecies : (remoteMessage?.data.petSpecies ?? null);
  const notificationChannelId = remoteMessage?.notification?.channelId ?? null;
  const contentChannelId = contentData.channelId;
  const dataChannelId =
    typeof contentChannelId === "string"
      ? contentChannelId
      : (remoteMessage?.data.channelId ?? null);
  const effectiveChannelId =
    notificationChannelId ?? dataChannelId ?? ANDROID_NOTIFICATION_CHANNEL_ID;
  const expectedChannelId =
    Object.entries(ANDROID_NOTIFICATION_CHANNEL_ID_BY_SPECIES).find(
      ([species]) => species === petSpecies
    )?.[1] ?? null;

  console.warn("[notifications] Android push channel", {
    dataChannelId,
    effectiveChannelId,
    expectedChannelId,
    fcmNotificationChannelId: notificationChannelId,
    fcmSound: remoteMessage?.notification?.sound ?? null,
    matchesExpectedChannel: expectedChannelId === effectiveChannelId,
    notificationId: notification.request.identifier,
    petSpecies,
    source,
  });
};

export function NotificationProvider({ children, isAuthenticated }: NotificationProviderProps) {
  useEffect(() => {
    if (!isAuthenticated || Platform.OS !== "android") {
      return;
    }

    const synchronize = () => {
      void synchronizeAndroidDeviceToken().catch((error: unknown) => {
        console.error("Failed to synchronize the Android notification token.", error);
      });
    };

    synchronize();

    const appStateSubscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        synchronize();
      }
    });
    const tokenSubscription = Notifications.addPushTokenListener((devicePushToken) => {
      if (devicePushToken.type !== "android" || typeof devicePushToken.data !== "string") {
        return;
      }

      void registerAndroidDeviceToken(devicePushToken.data).catch((error: unknown) => {
        console.error("Failed to register a rotated Android notification token.", error);
      });
    });
    const notificationSubscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        logAndroidNotificationChannel("received", notification);
      }
    );
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        logAndroidNotificationChannel("response", response.notification);
      }
    );

    return () => {
      appStateSubscription.remove();
      notificationSubscription.remove();
      responseSubscription.remove();
      tokenSubscription.remove();
    };
  }, [isAuthenticated]);

  return (
    <>
      {children}
      {isAuthenticated && Platform.OS === "android" && <ReminderStatusPrompt />}
    </>
  );
}
