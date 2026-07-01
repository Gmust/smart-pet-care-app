import { deleteApiNotificationsDeviceTokenToken, postApiNotificationsDeviceToken } from "@/api";
import { DevicePlatform } from "@/api/generated";

import {
  clearStoredDeviceToken,
  getStoredDeviceToken,
  setStoredDeviceToken,
} from "../services/notificationTokenStorage";
import * as Notifications from "expo-notifications";

export const ANDROID_NOTIFICATION_CHANNEL_ID = "default";

export const registerAndroidDeviceToken = async (token: string): Promise<void> => {
  const previousToken = await getStoredDeviceToken();
  if (previousToken && previousToken !== token) {
    try {
      await deleteApiNotificationsDeviceTokenToken(previousToken);
    } catch (error) {
      console.error("Failed to delete the previous Android notification token.", error);
    }
  }

  await postApiNotificationsDeviceToken({
    token,
    platform: DevicePlatform.Android,
  });
  await setStoredDeviceToken(token);
};

export const unregisterStoredDeviceToken = async (): Promise<void> => {
  try {
    const token = await getStoredDeviceToken();
    if (!token) return;

    await deleteApiNotificationsDeviceTokenToken(token);
  } catch (error) {
    console.error("Failed to unregister the Android notification token.", error);
    return;
  }

  try {
    await clearStoredDeviceToken();
  } catch (error) {
    console.error("Failed to clear the stored Android notification token.", error);
  }
};

// TODO: future - per-species notification sounds. Register a channel per pet
// species (own `sound`), have server pick channelId by reminder's pet species
// when sending push. See NotificationProvider.tsx sound TODO too.
export const synchronizeAndroidDeviceToken = async (): Promise<void> => {
  await Notifications.setNotificationChannelAsync(ANDROID_NOTIFICATION_CHANNEL_ID, {
    name: "Default",
    importance: Notifications.AndroidImportance.DEFAULT,
  });

  let permissions = await Notifications.getPermissionsAsync();
  if (permissions.status !== Notifications.PermissionStatus.GRANTED && permissions.canAskAgain) {
    permissions = await Notifications.requestPermissionsAsync();
  }

  if (permissions.status !== Notifications.PermissionStatus.GRANTED) {
    await unregisterStoredDeviceToken();
    return;
  }

  const devicePushToken = await Notifications.getDevicePushTokenAsync();
  if (devicePushToken.type !== "android" || typeof devicePushToken.data !== "string") {
    console.warn("Expected an Android FCM token but received a different token type.");
    return;
  }

  await registerAndroidDeviceToken(devicePushToken.data);
};
