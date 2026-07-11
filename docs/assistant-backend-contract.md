# AI Assistant — Backend Contract (Frontend ↔ C# Backend)

Handoff document for the backend developer. Defines the endpoint the mobile app expects, what the backend must persist, and how it maps to the AI microservice `/chat` contract. The frontend is built against exactly these shapes (see `openspec/changes/integrate-ai-chat-backend/` for full design rationale).

## Architecture

```
RN app ──POST /api/assistant/chat──▶ C# backend ──POST /Prod/chat (X-API-Key)──▶ FastAPI AI microservice
        { conversationId?, petId?,     owns history + rolling
          message }                    symptomSummary, replays
                                       both every turn
        ◀── wrapped response ──        ◀── ChatResponse ──
```

The AI microservice is stateless. The C# backend is the single owner of conversation state. The frontend never sees `symptomSummary`, `sessionId`, or message-history replay — do not expose them.

## Endpoint: `POST /api/assistant/chat`

Authenticated (existing app auth). One new user message per call.

### Request (from app)

```json
{
  "conversationId": "c7f3…",   // optional; omitted/null on first message → backend creates conversation
  "petId": "p123…",            // optional; used to resolve petType hint for the microservice
  "message": "My dog is vomiting and won't eat"   // required, 1–4000 chars
}
```

Validation: reject empty or >4000-char message with 400. Reject `conversationId` not owned by the authenticated user with 404 (not 403 — don't leak existence).

### Response (to app)

```json
{
  "messageId": "m456…",          // backend-assigned id of the ASSISTANT message
  "conversationId": "c7f3…",     // backend-assigned; app echoes it on next turn
  "mode": "health",              // "general" | "health" | "emergency"
  "answer": "These symptoms may be related to digestive issues. How long has this been happening?",
  "prediction": {                 // null when mode = "general"
    "predictedCondition": "Digestive Issues",
    "confidence": 0.84,
    "topK": [
      { "condition": "Digestive Issues", "confidence": 0.84 },
      { "condition": "Infectious and Parasitic Diseases", "confidence": 0.09 }
    ],
    "urgency": "CONSULT_SOON",    // MONITOR | CONSULT_SOON | URGENT | EMERGENCY
    "specialist": "general_vet",
    "diseaseCategory": "GASTROINTESTINAL",
    "homeAdvice": ["Ensure fresh water is available."]
  },
  "relatedTopics": [],            // populated only when mode = "general"
  "needsClarification": true,
  "disclaimer": "This is an AI-assisted pre-assessment and not a veterinary diagnosis."
}
```

Mapping from microservice `ChatResponse`: pass through `mode`, `answer`, `prediction`, `relatedTopics`, `needsClarification`, `disclaimer` unchanged. Strip `symptomSummary` (persist it instead). Add `messageId` + `conversationId`.

Enum stability: the app branches strictly on `mode` and `prediction.urgency` — adding new members there is a breaking change requiring coordination. `specialist` and `diseaseCategory` are display-only — the app tolerates unknown values, safe to extend.

### Errors (to app)

Map upstream failures to your standard error shape; the app collapses them into `unavailable | invalid-response`:

| Upstream condition | Backend response to app |
|---|---|
| Microservice 422 (validation) | 502 — backend bug (backend owns building a valid `ChatRequest`); log `detail` array |
| Microservice timeout / 5xx / network | 503 (retryable) |
| Microservice malformed body | 502 |
| Bad app request (empty / >4000 chars) | 400 |
| Conversation not found / not owned | 404 |

## Per-turn backend algorithm

1. Resolve or create conversation for the authenticated user (`conversationId` null → create).
2. Persist the new user message.
3. Load recent history (see replay window below) + persisted `symptomSummary` from the conversation.
4. Resolve `petType` hint: pet's species mapped to microservice `PetType` enum (`dog, cat, rabbit, hamster, guinea_pig, bird, fish, turtle, other`); unmappable/absent species → `other` or omit.
5. Call microservice `POST /chat`:
   ```json
   {
     "sessionId": "<conversationId — telemetry only>",
     "messages": [ /* oldest-first, 1–50, LAST entry MUST be the new user message */ ],
     "symptomSummary": "<from conversation row; null on first turn>",
     "petType": "dog"
   }
   ```
   Replay window: last N messages capped at 50 (microservice hard limit). Suggest N = 20 — `symptomSummary` carries older context.
6. Persist the assistant message (full response payload) and overwrite `conversation.symptomSummary` with the response's `symptomSummary`. **This persistence is mandatory** — the summary is the rolling triage state; losing it degrades every following turn.
7. Return the wrapped response.

Concurrency: serialize turns per conversation (row lock or optimistic concurrency on the conversation). Two parallel turns would race on `symptomSummary`.

## DB entities (suggested)

### AssistantConversation

| Column | Type | Notes |
|---|---|---|
| Id | uuid PK | returned as `conversationId` |
| UserId | FK → User | owner; enforce on every access |
| PetId | FK → Pet, nullable | pet context at conversation start |
| SymptomSummary | text, nullable | rolling summary; overwrite each turn |
| CreatedAt / UpdatedAt | timestamptz | |

### AssistantMessage

| Column | Type | Notes |
|---|---|---|
| Id | uuid PK | assistant rows: returned as `messageId` |
| ConversationId | FK → AssistantConversation | index (ConversationId, CreatedAt) |
| Role | enum: user \| assistant | matches microservice `ChatRole` |
| Content | text | user text, or assistant `answer` |
| Mode | enum, nullable | assistant rows only |
| PredictionJson | jsonb, nullable | full `prediction` object as sent to app |
| RelatedTopicsJson | jsonb, nullable | |
| NeedsClarification | bool, default false | |
| Disclaimer | text, nullable | |
| CreatedAt | timestamptz | |

Rationale for storing the full assistant payload: the history endpoint (below) must return messages in the same shape as the live chat response, so the app renders history identically. Prediction as jsonb avoids a table-per-enum explosion; it's read-only display data.

Replay to microservice uses only `Role` + `Content` (user text and assistant `answer`) — prediction data is never replayed.

## Future endpoint: conversation history (not needed for v1, design for it)

The app currently keeps a local copy of the conversation but is written so the backend becomes the single source of truth. Frontend code has `TODO(backend-history)` markers waiting on:

```
GET /api/assistant/conversations                       → list (id, petId, updatedAt, last message preview)
GET /api/assistant/conversations/{id}/messages         → messages, same shape as chat response
                                                         (paginated, newest-first cursor)
```

Two asks that affect the v1 schema:
1. Message shape returned by history must equal the live wrapped response (hence full payload persistence above).
2. **Open question (answer needed):** should `POST /api/assistant/chat` also return the persisted user message's `messageId`? The app can then reconcile its optimistic message with the server row exactly. Cheap to add now (`userMessageId` field), annoying to retrofit. Frontend preference: yes.

## Microservice call details (recap)

- Base path behind API Gateway: `/Prod/chat`. Header `X-API-Key: <key>`. JSON.
- `System.Text.Json` + `JsonStringEnumConverter` (wire strings match enum member names exactly, including lowercase `general_vet`-style members) + `DefaultIgnoreCondition = WhenWritingNull`.
- `messages`: oldest-first, 1–50 entries, last entry = the new user message. Content 1–4000 chars each.
- 422 responses carry FastAPI `detail` array — log it; never forward to the app.
