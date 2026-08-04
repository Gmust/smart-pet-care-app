import * as SecureStore from "expo-secure-store";
import type { z } from "zod";

import { SECURE_STORE_OPTIONS } from "@/common/utils/secureStoreOptions";

import { assistantConsentSchema } from "../schemas/assistant.schema";

const AI_USING_CONSENT_KEY = "spc.assistant.aiUsingConsent.v1";

export type AiUsingConsent = z.infer<typeof assistantConsentSchema>;

export type ConsentReadResult =
  | { ok: true; value: boolean | null }
  | { ok: false; reason: "invalid" | "unavailable" };

export type ConsentWriteResult =
  | { ok: true; value: undefined }
  | { ok: false; reason: "unavailable" };

export const getAiUsingConsent = async (): Promise<ConsentReadResult> => {
  try {
    const raw = await SecureStore.getItemAsync(AI_USING_CONSENT_KEY);
    if (raw === null) return { ok: true, value: null };

    if (raw === "true" || raw === "false") return { ok: true, value: raw === "true" };

    await SecureStore.deleteItemAsync(AI_USING_CONSENT_KEY);
    return { ok: false, reason: "invalid" };
  } catch {
    return { ok: false, reason: "unavailable" };
  }
};

export const setAiUsingConsent = async (consent: AiUsingConsent): Promise<ConsentWriteResult> => {
  try {
    const parsed = assistantConsentSchema.parse(consent);
    await SecureStore.setItemAsync(AI_USING_CONSENT_KEY, String(parsed), SECURE_STORE_OPTIONS);
    return { ok: true, value: undefined };
  } catch {
    return { ok: false, reason: "unavailable" };
  }
};

export const clearAiUsingConsent = async (): Promise<ConsentWriteResult> => {
  try {
    await SecureStore.deleteItemAsync(AI_USING_CONSENT_KEY);
    return { ok: true, value: undefined };
  } catch {
    return { ok: false, reason: "unavailable" };
  }
};
