import { useEffect } from "react";
import type { ReactNode } from "react";
import { AppState, Platform } from "react-native";

// TODO: app icon, splash icon, android adaptive icons, and notification icon are
// placeholders (see app.json: icon, splash-icon, android-icon-*, notification-icon).
// Swap in final assets once design is ready.
import { ReminderStatusPrompt } from "../components/ReminderStatusPrompt";
import {
  registerAndroidDeviceToken,
  synchronizeAndroidDeviceToken,
} from "../services/notificationRegistration";
import * as Notifications from "expo-notifications";

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

    return () => {
      appStateSubscription.remove();
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
