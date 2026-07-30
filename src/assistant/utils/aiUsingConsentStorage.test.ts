/// <reference types="jest" />

import * as SecureStore from "expo-secure-store";

import { clearAiUsingConsent, getAiUsingConsent, setAiUsingConsent } from "./aiUsingConsentStorage";

jest.mock("expo-secure-store", () => ({
  AFTER_FIRST_UNLOCK: 1,
  deleteItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
}));

describe("aiUsingConsentStorage", () => {
  beforeEach(() => jest.clearAllMocks());

  it("restores valid consent and clears invalid stored consent", async () => {
    jest.mocked(SecureStore.getItemAsync).mockResolvedValueOnce("true");
    expect(await getAiUsingConsent()).toEqual({ ok: true, value: true });

    jest.mocked(SecureStore.getItemAsync).mockResolvedValueOnce("not-a-boolean");
    expect(await getAiUsingConsent()).toEqual({ ok: false, reason: "invalid" });
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(expect.any(String));
  });

  it("returns null when no consent is stored", async () => {
    jest.mocked(SecureStore.getItemAsync).mockResolvedValueOnce(null);
    expect(await getAiUsingConsent()).toEqual({ ok: true, value: null });
  });

  it("persists consent with secure store options", async () => {
    expect(await setAiUsingConsent(true)).toEqual({ ok: true, value: undefined });
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      expect.any(String),
      "true",
      expect.anything()
    );
  });

  it("maps storage failures to unavailable", async () => {
    jest.mocked(SecureStore.setItemAsync).mockRejectedValueOnce(new Error("storage"));
    expect(await setAiUsingConsent(true)).toEqual({ ok: false, reason: "unavailable" });

    jest.mocked(SecureStore.deleteItemAsync).mockRejectedValueOnce(new Error("storage"));
    expect(await clearAiUsingConsent()).toEqual({ ok: false, reason: "unavailable" });
  });
});
