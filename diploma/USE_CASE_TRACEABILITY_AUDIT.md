# Smart Pet Care App - Use-Case Traceability Audit

## Purpose and boundary

This audit reconciles the provisional use-case diagram, functional requirements,
mobile implementation, committed OpenAPI contract, automated checks, and final
verification protocol as inspected on 25 July 2026. It is a design and
traceability record, not an acceptance report.

The identifiers below are stable working identifiers. A functional requirement
may map to more than one use case when one requirement deliberately combines
several user goals. Conversely, FR-11 is a cross-cutting connectivity behavior
rather than a single business transaction. This is preferable to inventing a
false one-to-one count.

Status vocabulary:

- **Verified - automated**: the named automated scope passed; final-build and
  runtime evidence may still be required.
- **Partially verified**: automated evidence covers only part of the use case.
- **Implemented - runtime proof required**: relevant client and contract
  evidence exists, but the complete scenario has not been executed on the
  identified final system.
- **Scope decision required**: implementation exists, but the approved thesis
  scope and requirement set do not yet include it.

## Use-case catalogue and evidence

| ID    | Use case and main success path                                                                                                                    | Actors and preconditions                                                                                     | Requirement mapping | Mobile and contract evidence                                                                                                                                                       | Automated and final-scenario evidence                                                   | Current status and gap                                                                                                                                            |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| UC-01 | **Register account.** The owner supplies valid credentials and accepts the required terms; the service creates a pending account.                 | Pet owner; backend service. The owner has reached the registration form and accepted the entry agreements.   | FR-01               | `EmailAuthForm.tsx`, `useRegisterMutation.ts`; `POST /api/auth/register`                                                                                                           | B-01; no direct registration-flow test                                                  | Implemented - runtime proof required. Execute invalid/valid input and sanitized service-response cases.                                                           |
| UC-02 | **Confirm email account.** The owner submits the received code and reaches the sign-in screen.                                                    | Pet owner; backend/email boundary. A pending account and confirmation code exist.                            | FR-01               | `ConfirmEmailPage.tsx`, `useConfirmEmailMutation.ts`, `useResendConfirmationMutation.ts`; `POST /api/auth/confirm-email`, `POST /api/auth/resend-confirmation`                     | B-02; no direct confirmation-flow test                                                  | Implemented - runtime proof required. The email-delivery boundary and invalid/expired-code behavior need evidence.                                                |
| UC-03 | **Sign in with email.** The owner supplies valid credentials; the client persists the returned session and opens the home flow.                   | Pet owner; backend service. A confirmed account exists.                                                      | FR-01               | `AuthPage.tsx`, `EmailAuthForm.tsx`, `AuthContext.tsx`, `useLoginMutation.ts`; `POST /api/auth/login`                                                                              | B-02, B-03; no direct login-flow test                                                   | Implemented - runtime proof required. Verify valid and invalid credentials plus protected-route behavior.                                                         |
| UC-04 | **Sign in with Google on Android.** The owner completes the native account chooser; the client exchanges the ID token.                            | Pet owner; Google identity provider; backend service. Valid Android OAuth configuration and Play Services.   | FR-02               | `GoogleAuthButton.tsx`, `useGoogleMobileAuthMutation.ts`; `POST /api/auth/oauth/google/mobile`                                                                                     | B-04, B-05; no direct native-flow test                                                  | Implemented - runtime proof required. Configuration presence, success, cancellation, and failure have not been proven on the named device.                        |
| UC-05 | **Resume an authenticated session.** The client restores an unexpired session or performs one controlled refresh.                                 | Pet owner; backend service. Protected session material may exist at application start or after a `401`.      | FR-03, NFR-05       | `AuthContext.tsx`, `interceptors.ts`, `tokenStorage.ts`; `POST /api/auth/refresh`                                                                                                  | B-06-B-09; current auth tests cover sign-out cleanup only                               | Partially verified. Startup restoration, refresh serialization, failed refresh, and forced sign-out still require dedicated tests and device evidence.            |
| UC-06 | **Manage account profile.** The owner views and updates profile fields or avatar.                                                                 | Authenticated pet owner; backend service.                                                                    | FR-12               | `ProfilePage.tsx`, `UpdateSelectionDialog.tsx`, `EditProfileDrawer.tsx`, `UpdateAvatarDrawer.tsx`; `GET /api/profile/me`, `PATCH /api/users`, `POST /api/profile/avatar`           | C-08; no direct profile test                                                            | Implemented - runtime proof required. Field validation, avatar replacement, cache refresh, and failures require final evidence.                                   |
| UC-07 | **Sign out.** The client attempts notification and Google cleanup, clears the protected local session, and returns to auth.                       | Authenticated pet owner; Google and notification boundaries when applicable.                                 | FR-12, NFR-05       | `ProfilePage.tsx`, `SignOutDrawer.tsx`, `AuthContext.tsx`; contract also declares `POST /api/auth/logout` but the inspected client sign-out path does not call it                  | B-09, B-10; three `AuthContext` tests cover cleanup ordering and failure tolerance      | Partially verified. Decide whether local-only sign-out is intended or server logout is mandatory, then execute the final device/storage scenario.                 |
| UC-08 | **Delete account.** The owner confirms deletion; the service deletes the account and the client clears local state.                               | Authenticated pet owner; backend service. A loaded profile identifier exists.                                | Candidate FR-13     | `ProfilePage.tsx`, `useDeleteAccountMutation.ts`; `DELETE /api/users/{id}`                                                                                                         | C-09 is conditional; no direct test                                                     | Scope decision required. Either approve a separate FR-13 and retain UC-08/C-09, or remove the feature from the thesis claims and explain the exclusion.           |
| UC-09 | **Manage pet profiles.** The owner lists, creates, opens, updates, and deletes pet profiles.                                                      | Authenticated pet owner; backend service.                                                                    | FR-04               | `PetListPage.tsx`, `PetProfilePage.tsx`, pet drawers/queries/schemas; `GET/POST /api/pets`, `GET/PATCH/DELETE /api/pets/{id}`                                                      | C-01-C-04; no direct pet-module test                                                    | Implemented - runtime proof required. Empty/populated, validation, CRUD, cache, and navigation results are not recorded.                                          |
| UC-10 | **Manage pet photograph.** The owner grants image access, selects an image, and uploads or replaces the photograph.                               | Authenticated pet owner; Android media boundary; backend service. A pet profile exists.                      | FR-05               | `UploadPetPhotoDrawer.tsx`, `useUploadPetPhoto.ts`, `upload-pet-photo.schema.ts`; `PATCH /api/pets/{id}/photo`                                                                     | C-05-C-07; no direct pet-photo test                                                     | Implemented - runtime proof required. Permission denial, image processing, upload failure, replacement, and cache refresh need evidence.                          |
| UC-11 | **Manage reminders.** The owner creates, lists, inspects, updates/statuses, and deletes a reminder.                                               | Authenticated pet owner; backend service. A pet exists for pet-scoped reminders.                             | FR-06               | `RemindersPage.tsx`, reminder drawers/hooks/queries/schemas; reminder CRUD, run-list, and acknowledge endpoints in `docs/openapi.json`                                             | D-01-D-03; no direct reminder-module test                                               | Implemented - runtime proof required. Recurrence, time-zone handling, status semantics, validation, cache effects, and failures need final proof.                 |
| UC-12 | **Synchronize Android notification token.** After authentication or token rotation, the client obtains and synchronizes a token.                  | Authenticated pet owner; Android notification service; Firebase Cloud Messaging; backend service.            | FR-07               | `NotificationProvider.tsx`, `notificationRegistration.ts`, `notificationTokenStorage.ts`; `POST /api/notifications/device-token`, `DELETE /api/notifications/device-token/{token}` | D-04-D-06; eight notification-registration tests                                        | Verified - automated for the service-level client scope. Repeat on the final revision and record one configured-device/backend exchange without exposing a token. |
| UC-13 | **Open reminder status from a notification.** A valid notification response opens the matching status drawer once.                                | Authenticated pet owner; Firebase Cloud Messaging; backend service. A delivered payload contains a valid ID. | FR-08               | `ReminderStatusPrompt.tsx`, `ReminderStatusDrawer.tsx`, reminder query/mutation hooks                                                                                              | D-07-D-10; no notification-response lifecycle test                                      | Implemented - runtime proof required. Foreground, background, terminated, duplicate, malformed, and unknown-ID cases are unproven.                                |
| UC-14 | **Review and decide assistant consent.** The owner accepts to continue or declines/clears consent and returns home.                               | Authenticated pet owner. Protected storage is available or the flow fails closed.                            | FR-09, NFR-08       | `ConsentDialog.tsx`, assistant entry pages, `aiUsingConsentStorage.ts`; no network endpoint                                                                                        | E-01, E-11; page and consent-storage tests cover restore, accept, decline, and failures | Partially verified. Final wording, screen-reader/focus behavior, and configured-device withdrawal still need approval and evidence.                               |
| UC-15 | **Select pet context.** The owner selects or creates a pet before entering a pet-scoped assistant conversation.                                   | Authenticated and consenting pet owner; backend pet service.                                                 | FR-09               | `AssistantPetSelectionPage.tsx`, `AssistantNewPetPage.tsx`, `PetSelection.tsx`; `GET/POST /api/pets`                                                                               | E-02; assistant page tests cover valid, changed, invalid, and empty pet states          | Partially verified. Live context propagation and device navigation have not been recorded.                                                                        |
| UC-16 | **Manage assistant conversation.** The client selects/creates a session, loads ordered history, sends a message, and shows a response.            | Authenticated and consenting pet owner; selected pet; backend and assistant-service boundary.                | FR-10, NFR-08       | `AssistantPage.tsx`, session/message queries, service adapter and schemas; session and message endpoints in `docs/openapi.json`                                                    | E-03-E-10; assistant page/query/schema/service tests cover substantial client behavior  | Partially verified. Final backend/AI versions, redacted live exchanges, cancellation, latency, and bounded safety evaluation are missing.                         |
| UC-17 | **Retry a failed assistant message.** The owner invokes retry for a retryable server-linked message and receives a new result or bounded failure. | Authenticated and consenting pet owner; active session and retryable message.                                | FR-10               | `AssistantPage.tsx`, `useRetryAssistantMessageMutation.ts`; `POST /api/sessions/{sessionId}/messages/{messageId}/retry`                                                            | E-06, E-07; page/query tests cover success, conflict, rate limit, and selected failures | Partially verified. A versioned live retry exchange and malformed-service cases are still required.                                                               |
| UC-18 | **Recover after connectivity change.** The client presents offline state and selected queries can recover after reconnection.                     | Pet owner; Android connectivity service. The flow crosses authenticated screens and server-state queries.    | FR-11, NFR-04       | `installOnlineManager.ts`, `useIsOnline.ts`, `OfflineBanner.tsx`, `OfflineScreen.tsx`, `RouteErrorFallback.tsx`, query-client configuration                                        | F-01-F-04; no direct offline/reconnect test                                             | Implemented - runtime proof required. Cached/uncached behavior, refetch scope, mutation limitations, retry, and offline sign-out are unproven.                    |

## Requirement coverage

| Requirement     | Use-case coverage   | Verification coverage | Traceability result                                                                                                 |
| --------------- | ------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------- |
| FR-01           | UC-01, UC-02, UC-03 | B-01-B-03             | Complete planned coverage; runtime evidence missing                                                                 |
| FR-02           | UC-04               | B-04-B-05             | Complete planned coverage; native configuration/runtime evidence missing                                            |
| FR-03           | UC-05               | B-06-B-09             | Complete planned coverage; restoration/refresh automated and runtime evidence incomplete                            |
| FR-04           | UC-09               | C-01-C-04             | Complete planned coverage; pet-module tests and runtime evidence missing                                            |
| FR-05           | UC-10               | C-05-C-07             | Complete planned coverage; permission/upload runtime evidence missing                                               |
| FR-06           | UC-11               | D-01-D-03             | Complete planned coverage; status, recurrence, and time-zone semantics need approval and proof                      |
| FR-07           | UC-12               | D-04-D-06             | Automated client-service coverage exists; final configured-device/backend evidence missing                          |
| FR-08           | UC-13               | D-07-D-10             | Complete planned coverage; notification lifecycle proof missing                                                     |
| FR-09           | UC-14, UC-15        | E-01-E-02, E-11       | Complete planned coverage; approved wording and live context/withdrawal evidence missing                            |
| FR-10           | UC-16, UC-17        | E-03-E-07             | Core interaction coverage exists; E-08-E-10 additionally evaluate NFR-08 presentation and bounded adversarial cases |
| FR-11           | UC-18               | F-01-F-04             | Cross-cutting flow is now explicit; automated and runtime recovery evidence missing                                 |
| FR-12           | UC-06, UC-07        | B-09-B-10, C-08       | Profile/sign-out coverage exists; server-logout semantics require a decision                                        |
| Candidate FR-13 | UC-08               | C-09                  | Not part of the approved candidate set; explicit include/exclude decision required                                  |

## Contract and interface surfaces outside the frozen use-case set

The committed OpenAPI description also exposes pet weight-history, health-record,
and feeding-log operations. The inspected pet profile currently shows related
tabs and summary information, but this audit found no approved end-to-end
functional requirement or verification gate for managing those records. The
live contract additionally adds journal and symptom-catalogue operations that
are not present in the committed generated client.

These surfaces must not be silently treated as achieved thesis functionality.
Before scope freeze, the team and supervisor must choose one of two evidence-
preserving options for each surface:

1. include it with a uniquely identified requirement, use case, implementation
   evidence, test scenarios, and final results; or
2. list it explicitly as contract or future-work surface outside the evaluated
   mobile scope.

The current evidence and approval conditions for these choices are consolidated
in `SCOPE_FREEZE_DECISION_PACKET.md` and summarized in provisional DOCX
Table 2.5. The packet is a decision aid, not an approved freeze.

## Decisions required before scope freeze

1. Approve the UC-01-UC-18 names and boundaries.
2. Decide whether UC-08 account deletion becomes FR-13 or is excluded from the
   evaluated scope.
3. Decide whether sign-out must invoke `POST /api/auth/logout` or whether
   documented local session termination is the intended behavior.
4. Decide whether weight, health, feeding, journal, and symptom-catalogue
   surfaces are evaluated features or out-of-scope contract capabilities.
5. Confirm the external-system boundary and AI-service topology with Volodymyr,
   Ksenia, and Illia before removing provisional labels from the UML figures.
6. Have Anastasia Leonova and Illia confirm that each owner-facing path matches
   the final Android interface.
7. Freeze the final FR/UC/test identifiers, then record all changes instead of
   reusing identifiers for different behavior.

## Audit conclusion

Every current FR-01-FR-12 now has explicit use-case and verification-protocol
coverage. This proves planned traceability only. It does not prove that any
unexecuted Android or live-service scenario passed. UC-08 and the additional
contract surfaces remain deliberate scope decisions, and the server-logout
semantic mismatch remains an implementation/requirements decision for the
technical leads and supervisor.
