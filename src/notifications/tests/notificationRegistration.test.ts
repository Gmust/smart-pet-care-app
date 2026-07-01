/// <reference types="jest" />

import { deleteApiNotificationsDeviceTokenToken, postApiNotificationsDeviceToken } from "@/api";
import { DevicePlatform } from "@/api/generated";

import {
  ANDROID_NOTIFICATION_CHANNEL_ID,
  registerAndroidDeviceToken,
  synchronizeAndroidDeviceToken,
  unregisterStoredDeviceToken,
} from "../services/notificationRegistration";
import {
  clearStoredDeviceToken,
  getStoredDeviceToken,
  setStoredDeviceToken,
} from "../services/notificationTokenStorage";
import * as Notifications from "expo-notifications";

jest.mock("expo-notifications", () => ({
  AndroidImportance: { DEFAULT: 3 },
  PermissionStatus: {
    DENIED: "denied",
    GRANTED: "granted",
    UNDETERMINED: "undetermined",
  },
  getDevicePushTokenAsync: jest.fn(),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
}));

jest.mock("@/api", () => ({
  deleteApiNotificationsDeviceTokenToken: jest.fn(),
  postApiNotificationsDeviceToken: jest.fn(),
}));

jest.mock("@/api/generated", () => ({
  DevicePlatform: { Android: "Android", iOS: "iOS" },
}));

jest.mock("./notificationTokenStorage", () => ({
  clearStoredDeviceToken: jest.fn(),
  getStoredDeviceToken: jest.fn(),
  setStoredDeviceToken: jest.fn(),
}));

const mockedNotifications = jest.mocked(Notifications);
const mockedDeleteDeviceToken = jest.mocked(deleteApiNotificationsDeviceTokenToken);
const mockedPostDeviceToken = jest.mocked(postApiNotificationsDeviceToken);
const mockedClearStoredDeviceToken = jest.mocked(clearStoredDeviceToken);
const mockedGetStoredDeviceToken = jest.mocked(getStoredDeviceToken);
const mockedSetStoredDeviceToken = jest.mocked(setStoredDeviceToken);

describe("Android notification token registration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedNotifications.setNotificationChannelAsync.mockResolvedValue(null);
    mockedNotifications.requestPermissionsAsync.mockResolvedValue({
      canAskAgain: false,
      expires: "never",
      granted: false,
      status: Notifications.PermissionStatus.DENIED,
    });
    mockedGetStoredDeviceToken.mockResolvedValue(null);
    mockedSetStoredDeviceToken.mockResolvedValue();
    mockedClearStoredDeviceToken.mockResolvedValue();
  });

  it("creates the channel, gets a native token, and posts Android when permission is granted", async () => {
    const calls: string[] = [];
    mockedNotifications.setNotificationChannelAsync.mockImplementation(async () => {
      calls.push("channel");
      return null;
    });
    mockedNotifications.getPermissionsAsync.mockImplementation(async () => {
      calls.push("permissions");
      return {
        canAskAgain: false,
        expires: "never",
        granted: true,
        status: Notifications.PermissionStatus.GRANTED,
      };
    });
    mockedNotifications.getDevicePushTokenAsync.mockImplementation(async () => {
      calls.push("token");
      return { data: "fcm-token", type: "android" };
    });

    await synchronizeAndroidDeviceToken();

    expect(calls).toEqual(["channel", "permissions", "token"]);
    expect(mockedNotifications.getDevicePushTokenAsync.mock.invocationCallOrder[0]).toBeLessThan(
      mockedPostDeviceToken.mock.invocationCallOrder[0]
    );
    expect(mockedNotifications.setNotificationChannelAsync).toHaveBeenCalledWith(
      ANDROID_NOTIFICATION_CHANNEL_ID,
      {
        importance: Notifications.AndroidImportance.DEFAULT,
        name: "Default",
      }
    );
    expect(mockedPostDeviceToken).toHaveBeenCalledWith({
      platform: DevicePlatform.Android,
      token: "fcm-token",
    });
    expect(mockedSetStoredDeviceToken).toHaveBeenCalledWith("fcm-token");
  });

  it("requests undetermined permission once and does not fetch a token when denied", async () => {
    mockedNotifications.getPermissionsAsync.mockResolvedValue({
      canAskAgain: true,
      expires: "never",
      granted: false,
      status: Notifications.PermissionStatus.UNDETERMINED,
    });

    await synchronizeAndroidDeviceToken();

    expect(mockedNotifications.requestPermissionsAsync).toHaveBeenCalledTimes(1);
    expect(mockedNotifications.getDevicePushTokenAsync).not.toHaveBeenCalled();
    expect(mockedPostDeviceToken).not.toHaveBeenCalled();
  });

  it("requests permission when Android reports denied but still allows asking", async () => {
    mockedNotifications.getPermissionsAsync.mockResolvedValue({
      canAskAgain: true,
      expires: "never",
      granted: false,
      status: Notifications.PermissionStatus.DENIED,
    });

    await synchronizeAndroidDeviceToken();

    expect(mockedNotifications.requestPermissionsAsync).toHaveBeenCalledTimes(1);
  });

  it("re-registers the same token on each authenticated synchronization", async () => {
    mockedNotifications.getPermissionsAsync.mockResolvedValue({
      canAskAgain: false,
      expires: "never",
      granted: true,
      status: Notifications.PermissionStatus.GRANTED,
    });
    mockedNotifications.getDevicePushTokenAsync.mockResolvedValue({
      data: "shared-device-token",
      type: "android",
    });
    mockedGetStoredDeviceToken.mockResolvedValue("shared-device-token");

    await synchronizeAndroidDeviceToken();
    await synchronizeAndroidDeviceToken();

    expect(mockedPostDeviceToken).toHaveBeenCalledTimes(2);
  });

  it("registers a rotated token and persists it only after the API call", async () => {
    await registerAndroidDeviceToken("rotated-token");

    expect(mockedPostDeviceToken.mock.invocationCallOrder[0]).toBeLessThan(
      mockedSetStoredDeviceToken.mock.invocationCallOrder[0]
    );
    expect(mockedPostDeviceToken).toHaveBeenCalledWith({
      platform: DevicePlatform.Android,
      token: "rotated-token",
    });
  });

  it("unregisters and clears a stored token when permission is revoked", async () => {
    mockedNotifications.getPermissionsAsync.mockResolvedValue({
      canAskAgain: false,
      expires: "never",
      granted: false,
      status: Notifications.PermissionStatus.DENIED,
    });
    mockedGetStoredDeviceToken.mockResolvedValue("revoked-token");

    await synchronizeAndroidDeviceToken();

    expect(mockedDeleteDeviceToken).toHaveBeenCalledWith("revoked-token");
    expect(mockedClearStoredDeviceToken).toHaveBeenCalledTimes(1);
  });

  it("clears the local token when backend deletion fails", async () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation();
    mockedGetStoredDeviceToken.mockResolvedValue("offline-token");
    mockedDeleteDeviceToken.mockRejectedValue(new Error("offline"));

    await unregisterStoredDeviceToken();

    expect(mockedClearStoredDeviceToken).toHaveBeenCalledTimes(1);
    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });
});
