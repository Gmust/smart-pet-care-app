/// <reference types="jest" />

import * as SecureStore from "expo-secure-store";

import { getPetListMode, setPetListMode } from "./petListModeStorage";

jest.mock("expo-secure-store", () => ({
  AFTER_FIRST_UNLOCK: 1,
  deleteItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
}));

describe("petListModeStorage", () => {
  beforeEach(() => jest.clearAllMocks());

  it("restores a stored mode", async () => {
    jest.mocked(SecureStore.getItemAsync).mockResolvedValueOnce("on");
    expect(await getPetListMode()).toEqual({ ok: true, value: "on" });

    jest.mocked(SecureStore.getItemAsync).mockResolvedValueOnce("off");
    expect(await getPetListMode()).toEqual({ ok: true, value: "off" });
  });

  it("returns null when the user never chose, so the suggestion can still show", async () => {
    jest.mocked(SecureStore.getItemAsync).mockResolvedValueOnce(null);
    expect(await getPetListMode()).toEqual({ ok: true, value: null });
  });

  it("drops a stored value that is not a mode", async () => {
    jest.mocked(SecureStore.getItemAsync).mockResolvedValueOnce("true");
    expect(await getPetListMode()).toEqual({ ok: false, reason: "invalid" });
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(expect.any(String));
  });

  it("persists the mode with the secure store options", async () => {
    expect(await setPetListMode("on")).toEqual({ ok: true, value: undefined });
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      expect.any(String),
      "on",
      expect.anything()
    );
  });

  it("maps storage failures to unavailable", async () => {
    jest.mocked(SecureStore.getItemAsync).mockImplementationOnce(() => Promise.reject(new Error()));
    expect(await getPetListMode()).toEqual({ ok: false, reason: "unavailable" });

    jest.mocked(SecureStore.setItemAsync).mockImplementationOnce(() => Promise.reject(new Error()));
    expect(await setPetListMode("off")).toEqual({ ok: false, reason: "unavailable" });
  });
});
