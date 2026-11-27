import * as SecureStore from "expo-secure-store";

import { SECURE_STORE_OPTIONS } from "@/common/utils/secureStoreOptions";

const PET_LIST_MODE_KEY = "spc.pets.petListMode.v1";

export type PetListMode = "on" | "off";

export type PetListModeReadResult =
  | { ok: true; value: PetListMode | null }
  | { ok: false; reason: "invalid" | "unavailable" };

export type PetListModeWriteResult =
  | { ok: true; value: undefined }
  | { ok: false; reason: "unavailable" };

export const getPetListMode = async (): Promise<PetListModeReadResult> => {
  try {
    const raw = await SecureStore.getItemAsync(PET_LIST_MODE_KEY);
    if (raw === null) return { ok: true, value: null };

    if (raw === "on" || raw === "off") return { ok: true, value: raw };

    await SecureStore.deleteItemAsync(PET_LIST_MODE_KEY);
    return { ok: false, reason: "invalid" };
  } catch {
    return { ok: false, reason: "unavailable" };
  }
};

export const setPetListMode = async (mode: PetListMode): Promise<PetListModeWriteResult> => {
  try {
    await SecureStore.setItemAsync(PET_LIST_MODE_KEY, mode, SECURE_STORE_OPTIONS);
    return { ok: true, value: undefined };
  } catch {
    return { ok: false, reason: "unavailable" };
  }
};
