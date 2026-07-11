import { SECURE_STORE_OPTIONS } from "@/common/utils/secureStoreOptions";

import { assistantConsentSchema } from "../schemas/assistant.schema";
import * as SecureStore from "expo-secure-store";
import type { z } from "zod";

const AI_USING_CONSENT_KEY = "spc.assistant.aiUsingConsent.v1";

export type AiUsingConsent = z.infer<typeof assistantConsentSchema>;

export const getAiUsingConsent = async () => {
  try {
    const raw = await SecureStore.getItemAsync(AI_USING_CONSENT_KEY);
    if (raw === null) return false;

    const parsed = assistantConsentSchema.safeParse(raw === "true");
    if (parsed.success && (raw === "true" || raw === "false")) return parsed.data;

    await SecureStore.deleteItemAsync(AI_USING_CONSENT_KEY);
    return false;
  } catch {
    return false;
  }
};

export const setAiUsingConsent = async (consent: AiUsingConsent) => {
  try {
    const parsed = assistantConsentSchema.parse(consent);
    await SecureStore.setItemAsync(AI_USING_CONSENT_KEY, String(parsed), SECURE_STORE_OPTIONS);
    return { ok: true, value: undefined };
  } catch {
    return { ok: false, reason: "unavailable" };
  }
};

export const clearAiUsingConsent = async () => {
  try {
    await SecureStore.deleteItemAsync(AI_USING_CONSENT_KEY);
    return { ok: true, value: undefined };
  } catch {
    return { ok: false, reason: "unavailable" };
  }
};
