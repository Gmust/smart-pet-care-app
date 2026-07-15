import type {
  ChatMessageRole,
  ChatMessageStatus,
  SessionMessageResponseDto,
} from "@/api/generated";

export interface ServerTranscriptMessage {
  kind: "server";
  id: string;
  messageId: string;
  role: ChatMessageRole;
  status: ChatMessageStatus | null;
  content: string;
  createdAt: string;
}

export interface OptimisticUserMessage {
  kind: "optimistic-user";
  id: string;
  requestId: string;
  role: "user";
  content: string;
}

export interface PendingAssistantMessage {
  kind: "pending-assistant";
  id: string;
  requestId: string;
  role: "assistant";
  localEmergency: boolean;
}

export interface LiveAssistantMessage {
  kind: "live-assistant";
  id: string;
  requestId: string;
  role: "assistant";
  response: SessionMessageResponseDto;
  localEmergency: boolean;
  serverMessageId: string | null;
}

export type AssistantFailureKind = "conflict" | "not-found" | "rate-limited" | "unavailable";

export interface FailedAssistantMessage {
  kind: "failed-assistant";
  id: string;
  requestId: string;
  role: "assistant";
  messageId: string | null;
  failure: AssistantFailureKind;
  retryable: boolean;
  retryAfterSeconds: number | null;
  localEmergency: boolean;
  serverMessageId: string | null;
}

export type AssistantTranscriptMessage =
  | ServerTranscriptMessage
  | OptimisticUserMessage
  | PendingAssistantMessage
  | LiveAssistantMessage
  | FailedAssistantMessage;
