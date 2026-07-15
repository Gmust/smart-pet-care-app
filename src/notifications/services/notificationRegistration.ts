import { deleteApiNotificationsDeviceTokenToken, postApiNotificationsDeviceToken } from "@/api";
import { AnimalSpecies, DevicePlatform } from "@/api/generated";

import {
  clearStoredDeviceToken,
  getStoredDeviceToken,
  setStoredDeviceToken,
} from "../services/notificationTokenStorage";
import { isAxiosError } from "axios";
import * as Notifications from "expo-notifications";

export const ANDROID_NOTIFICATION_CHANNEL_ID = "default";

export const ANDROID_NOTIFICATION_CHANNEL_ID_BY_SPECIES = {
  [AnimalSpecies.Unknown]: ANDROID_NOTIFICATION_CHANNEL_ID,
  [AnimalSpecies.Dog]: "pet-reminders-dog-v1",
  [AnimalSpecies.Cat]: "pet-reminders-cat-v1",
  [AnimalSpecies.Rabbit]: ANDROID_NOTIFICATION_CHANNEL_ID,
  [AnimalSpecies.Hamster]: ANDROID_NOTIFICATION_CHANNEL_ID,
  [AnimalSpecies.GuineaPig]: "pet-reminders-guinea-pig-v1",
  [AnimalSpecies.Bird]: "pet-reminders-bird-v1",
  [AnimalSpecies.Fish]: "pet-reminders-fish-v1",
  [AnimalSpecies.Turtle]: ANDROID_NOTIFICATION_CHANNEL_ID,
  [AnimalSpecies.Other]: ANDROID_NOTIFICATION_CHANNEL_ID,
} satisfies Record<AnimalSpecies, string>;

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
  const token = await getStoredDeviceToken();
  if (!token) return;

  try {
    await deleteApiNotificationsDeviceTokenToken(token);
  } catch (error) {
    // 404 = token already gone server-side (e.g. account deleted). Still clear local copy.
    if (!(isAxiosError(error) && error.response?.status === 404)) {
      console.error("Failed to unregister the Android notification token.", error);
      return;
    }
  }

  try {
    await clearStoredDeviceToken();
  } catch (error) {
    console.error("Failed to clear the stored Android notification token.", error);
  }
};

export const synchronizeAndroidDeviceToken = async (): Promise<void> => {
  await Promise.all([
    Notifications.setNotificationChannelAsync(ANDROID_NOTIFICATION_CHANNEL_ID, {
      name: "Default",
      importance: Notifications.AndroidImportance.DEFAULT,
    }),
    Notifications.setNotificationChannelAsync(
      ANDROID_NOTIFICATION_CHANNEL_ID_BY_SPECIES[AnimalSpecies.Dog],
      {
        name: "Dog reminders",
        importance: Notifications.AndroidImportance.DEFAULT,
        sound: "dog.wav",
      }
    ),
    Notifications.setNotificationChannelAsync(
      ANDROID_NOTIFICATION_CHANNEL_ID_BY_SPECIES[AnimalSpecies.Cat],
      {
        name: "Cat reminders",
        importance: Notifications.AndroidImportance.DEFAULT,
        sound: "cat.wav",
      }
    ),
    Notifications.setNotificationChannelAsync(
      ANDROID_NOTIFICATION_CHANNEL_ID_BY_SPECIES[AnimalSpecies.GuineaPig],
      {
        name: "Guinea pig reminders",
        importance: Notifications.AndroidImportance.DEFAULT,
        sound: "guinea_pig.wav",
      }
    ),
    Notifications.setNotificationChannelAsync(
      ANDROID_NOTIFICATION_CHANNEL_ID_BY_SPECIES[AnimalSpecies.Bird],
      {
        name: "Bird reminders",
        importance: Notifications.AndroidImportance.DEFAULT,
        sound: "bird.wav",
      }
    ),
    Notifications.setNotificationChannelAsync(
      ANDROID_NOTIFICATION_CHANNEL_ID_BY_SPECIES[AnimalSpecies.Fish],
      {
        name: "Fish reminders",
        importance: Notifications.AndroidImportance.DEFAULT,
        sound: "fish.wav",
      }
    ),
  ]);

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
