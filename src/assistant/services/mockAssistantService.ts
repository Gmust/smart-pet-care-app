import { assistantChatResponseSchema } from "../schemas/assistant.schema";
import type { AssistantService } from "./assistantService";
import {
  assistantFixtures,
  emergencyIndicators,
  emergencyResponse,
  genericHealthResponse,
  serviceFixtureTriggers,
} from "./fixtures";

export const normalizeAssistantInput = (value: string): string =>
  value.trim().toLocaleLowerCase("en").replace(/\s+/g, " ");

export const hasEmergencyIndicator = (value: string): boolean => {
  const normalized = normalizeAssistantInput(value);
  return emergencyIndicators.some((indicator) => normalized.includes(indicator));
};

export const mockAssistantService: AssistantService = {
  async assess(request) {
    if (request.signal?.aborted) return { kind: "failure", failure: "cancelled" };

    const input = normalizeAssistantInput(request.userText);
    if (hasEmergencyIndicator(input) || input.includes(serviceFixtureTriggers.emergency)) {
      return { kind: "response", response: emergencyResponse };
    }
    if (input.includes(serviceFixtureTriggers.failure)) {
      return { kind: "failure", failure: "unavailable" };
    }
    if (input.includes(serviceFixtureTriggers.malformed)) {
      const parsed = assistantChatResponseSchema.safeParse({ mode: "invalid" });
      if (!parsed.success) return { kind: "failure", failure: "invalid-response" };
    }

    const fixture = assistantFixtures.find(({ keywords }) =>
      keywords.some((keyword) => input.includes(keyword))
    );
    return { kind: "response", response: fixture?.response ?? genericHealthResponse };
  },
};
