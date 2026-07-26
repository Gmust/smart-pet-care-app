# Author-confirmed implementation status

## Purpose and evidence level

This record captures Illia Dolbnia's implementation-status response supplied on
26 July 2026. It allows thesis drafting to proceed while keeping author
confirmation separate from independently executed acceptance evidence.

Legend:

- **R** — reported by the author as implemented and ready for first-version
  documentation;
- **V2** — deliberately deferred to version 2;
- **Unconfirmed** — omitted from the response and therefore not classified;
- **Repository-supported** — corresponding implementation artifacts were found
  during read-only repository inspection;
- **Acceptance pending** — the final immutable revisions, runtime scenarios, and
  team/supervisor approval have not yet been attached.

## Status supplied by the author

| Checklist items | Author status | Thesis treatment                                                                        |
| --------------- | ------------- | --------------------------------------------------------------------------------------- |
| 1-10            | R             | Include in the first-version implementation baseline; attach final acceptance evidence. |
| 11-16           | R             | Include in the first-version implementation baseline; attach final acceptance evidence. |
| 17-24           | R             | Include in the first-version implementation baseline; attach final acceptance evidence. |
| 25-26           | V2            | Exclude from first-version acceptance and describe as planned future work.              |
| 27              | Unconfirmed   | Do not claim until the team classifies it.                                              |
| 28-36           | R             | Include in the first-version implementation baseline; attach final acceptance evidence. |
| 37-38           | R             | Include in the first-version implementation baseline; attach final acceptance evidence. |
| 39-40           | Unconfirmed   | Do not claim until the team classifies them.                                            |
| 41              | R             | Include in the first-version implementation baseline; attach final acceptance evidence. |
| 42-43           | Unconfirmed   | Do not claim until the team classifies them.                                            |
| 44-57           | R             | Include in the first-version implementation baseline; attach final acceptance evidence. |
| 58-63           | Unconfirmed   | Do not claim until the team classifies them.                                            |
| 64-67           | R             | Include in the first-version implementation baseline; attach final acceptance evidence. |
| 68              | Unconfirmed   | Do not claim until the team classifies it.                                              |
| 69-73           | R             | Include in the first-version implementation baseline; attach final acceptance evidence. |
| 74-81           | R             | Include in the first-version implementation baseline; attach final acceptance evidence. |

The response used the range **74-90**, while the checklist presented in the
conversation ended at item 81. This record applies the answer to items 74-81
only. Items 82-90 are not invented.

## Current interpretation by product area

| Area                                                                                           | Current working classification | Evidence boundary                                                                                                                                                      |
| ---------------------------------------------------------------------------------------------- | ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Authentication, account, profile, and session handling                                         | Author-confirmed first version | Mobile and backend artifacts exist; final Android and API acceptance records remain required.                                                                          |
| Pet profiles, photographs, weight, health, journal, and symptom-related records                | Author-confirmed first version | Client, API, backend, or branch artifacts exist in different revisions; the accepted release set must be identified.                                                   |
| Reminders, notification-token handling, and reminder status                                    | Author-confirmed first version | Source and automated-test evidence exists; final FCM lifecycle scenarios remain required.                                                                              |
| Pet-scoped assistant and classifier integration                                                | Author-confirmed first version | C# integration exists in the backend repository; unified `/chat` exists on the AI-service feature branch; merged/deployed revision and live exchanges remain required. |
| Feeding mobile interface and nutrition goals (items 25-26)                                     | Version 2                      | Backend feeding capability may be documented as an implemented service boundary, but no completed first-version end-to-end mobile feeding claim is made.               |
| Omitted dashboard and smart-feature items                                                      | Unconfirmed                    | Items 27, 39-40, 42-43, and 58-63 remain outside claims until classified.                                                                                              |
| English, accessibility, recovery, Android, tests, CI, and deployment items in confirmed ranges | Author-confirmed first version | Repository artifacts support parts of the claim; final clean-revision and runtime evidence remain required.                                                            |
| Polish interface (item 68)                                                                     | Unconfirmed                    | The inspected mobile baseline contains English resources only.                                                                                                         |

## Repository reconciliation performed on 26 July 2026

- The core C# backend repository contains authentication, pet, reminder,
  notification, health, feeding, journal, chat-session, and classifier-client
  implementation artifacts.
- Volodymyr Biletskyi has the dominant backend commit history. Kseniia Kushlak's
  identifiable commits cover Cloudinary pet photographs, feeding, weight
  history, and classifier/chat integration, with two commits recording
  Volodymyr as co-author.
- The C# backend owns authenticated pet/session access, message persistence,
  bounded history, request forwarding, retry and circuit-breaker behavior,
  error mapping, and metrics. It does not own condition prediction.
- Illia Dolbnia is the sole visible author in the inspected AI-service
  repository history. The unified stateless `/chat` endpoint, deterministic
  triage safeguards, classifier workflow, tests, CI, and model-release
  documentation are present on
  `origin/feature/unified-caht-endpoint-tests-and-docs` at `74019ea`.
- The AI repository's `main` revision `682dfb5` contains the earlier
  `/predict`, `/ask`, and `/wellness` implementation. Therefore, the thesis must
  identify the accepted AI branch or release rather than treating `main` and
  the integrated `/chat` implementation as the same artifact.

## Required closure

Before these author-confirmed statuses become final thesis results, the team
must:

1. classify omitted items 27, 39-40, 42-43, 58-63, and 68;
2. record immutable mobile, C# backend, AI-service, and OpenAPI revisions;
3. show which branches were merged or deployed;
4. execute the mapped Android and service scenarios on those revisions;
5. attach sanitized results, defects, and limitations;
6. obtain review from the responsible authors and the supervisor.
