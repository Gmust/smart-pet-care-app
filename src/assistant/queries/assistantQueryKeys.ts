type AssistantRootKey = readonly ["assistant"];
type AssistantSessionsKey = readonly ["assistant", "sessions"];
type AssistantMessagesKey = readonly ["assistant", "session", string, "messages"];

export const assistantQueryKeys = {
  root: (): AssistantRootKey => ["assistant"],
  sessions: (): AssistantSessionsKey => ["assistant", "sessions"],
  messages: (sessionId: string): AssistantMessagesKey => [
    "assistant",
    "session",
    sessionId,
    "messages",
  ],
};
