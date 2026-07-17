import type { AssistantChatResponse, AssistantMessage } from "../schemas/assistant.schema";

export interface AssistantPetContext {
  id: string;
  name: string;
  species: string | null;
}

export interface AssistantRequest {
  requestId: string;
  locale: string;
  pet: AssistantPetContext;
  messages: AssistantMessage[];
  conversationId: string | null;
  userText: string;
  signal?: AbortSignal;
}

export type AssistantResult =
  | { kind: "response"; response: AssistantChatResponse }
  | { kind: "failure"; failure: "unavailable" | "invalid-response" | "cancelled" };

export interface AssistantService {
  assess(request: AssistantRequest): Promise<AssistantResult>;
}
