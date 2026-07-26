# Scope Freeze Decision Packet

## Purpose and status

This packet gives the four authors and the supervisor one dated record for
freezing the evaluated scope of the Smart Pet Care diploma project. It prevents
an endpoint, branch, mock, design, or live-service surface from becoming a
thesis claim merely because it exists somewhere in the available evidence.

The packet is **provisional**. It records evidence inspected on 25-26 July 2026 and
does not replace the approved thesis card, an accepted release revision, final
requirements, test results, or supervisor approval.

## Evidence baseline

- Evaluated mobile revision: `0d5e33b`.
- Committed API baseline: `docs/openapi.json`, containing 34 paths, 50
  operations, and 60 schemas.
- Live API observation: authenticated read-only description inspected on
  25 July 2026, containing 38 paths, 57 operations, and 70 schemas.
- Separate mobile branch: `feature/care-screen`, 30 commits ahead of the
  evaluated revision at the inspected local references.
- C# backend: `smart-pet-care-api` main through `6d79951`.
- AI service: `pet-diseases-classifier` main `682dfb5` and unified-chat feature
  revision `74019ea`.
- Author-status baseline: Illia Dolbnia's numbered checklist response of
  26 July 2026, recorded in `IMPLEMENTATION_STATUS_CONFIRMATION.md`.
- Requirements baseline: candidate FR-01-FR-12, UC-01-UC-18, and the
  verification protocol. These remain subject to author and supervisor
  approval.

The detailed contract drift is recorded in `API_CONTRACT_COMPARISON.md`. The
branch and attribution boundary is recorded in
`MOBILE_IMPLEMENTATION_ATTRIBUTION_AUDIT.md`.

## Freeze rule

A function belongs to the evaluated thesis scope only when all of the following
are true:

1. it is named in the approved objective or an approved requirement;
2. it is present in the accepted release artifact, not only in another branch,
   a mock, an unused generated client, or an independently changing live API;
3. its service boundary and expected behavior are documented;
4. it has an approved verification scenario and a result linked to immutable
   evidence; and
5. the authors and supervisor accept the corresponding claim and limitation.

Anything failing one or more conditions is excluded from evaluated
functionality by default. It may still be described as a contract capability,
prototype, branch candidate, limitation, or future-work item if that wording is
accurate and evidence-bounded.

## Provisional decision matrix

The matrix below preserves the conservative artifact-only assessment made on
25 July. The author confirmation received the next day changes the drafting
treatment but does not erase the acceptance conditions.

| Candidate boundary                                 | Evidence at the inspected baseline                                                                                                                                                                                                            | Provisional freeze treatment                                                                                  | Decision required before closure                                                                                                                                                      |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Account deletion (UC-08 / candidate FR-13)         | The evaluated client contains a profile confirmation flow, `useDeleteAccountMutation`, and `DELETE /api/users/{id}`. The committed contract contains the endpoint. No approved FR-13 or dedicated result exists.                              | **Decision required.** Technically present but not yet approved as evaluated functionality.                   | Include by approving FR-13, UC-08, scenario C-09, acceptance criteria, result, privacy wording, and limitations; otherwise explicitly exclude it from the evaluated scope.            |
| Sign-out semantics (UC-07 / FR-12)                 | The UI says “this device only.” `AuthContext.signOut` removes local credentials, notification registration, and the Google session. It does not call the committed `POST /api/auth/logout` operation. Tests cover the local cleanup sequence. | **Include only as device-local sign-out** at the current baseline. Do not claim server-side token revocation. | Approve local-only behavior and document the limitation, or implement and verify server logout before changing the claim.                                                             |
| Weight history                                     | CRUD operations exist in the committed contract and generated client. The evaluated source search found pet-profile weight display/editing but no mobile use of the history operations.                                                       | **Exclude from evaluated functionality** unless integrated and verified.                                      | Add an approved requirement, accepted UI/service implementation, scenarios, results, and evidence, or retain only as an unused contract capability.                                   |
| Health records                                     | CRUD operations exist in the committed contract and generated client. The evaluated release has no demonstrated health-record workflow using those operations.                                                                                | **Exclude from evaluated functionality** unless integrated and verified.                                      | Add an approved requirement, accepted implementation, scenarios, results, and evidence. Distinguish health data management from medical advice.                                       |
| Feeding logs                                       | CRUD operations exist in the committed contract and generated client. The evaluated release search found no use of the feeding-log operations.                                                                                                | **Exclude from evaluated functionality** unless integrated and verified.                                      | Add an approved requirement, accepted implementation, scenarios, results, and evidence.                                                                                               |
| Care-screen branch                                 | `feature/care-screen` is separate from the evaluated revision, 30 commits ahead at the inspected references, uses client-side mock collections, and contains no care-specific test files.                                                     | **Exclude from the evaluated release.** It may be described only as branch/prototype work.                    | Merge or otherwise accept an immutable revision, replace or explicitly retain mocks, reconcile requirements/contracts, execute final gates, and approve attribution before inclusion. |
| Journal                                            | The live description adds five journal operations and related schemas. They are absent from the committed snapshot and generated client, and no evaluated mobile workflow was found.                                                          | **Exclude as live-contract drift.**                                                                           | Reconcile and commit the approved contract, regenerate the client, implement the release workflow, map requirements/tests, and verify results before inclusion.                       |
| Symptom catalogue and symptom-enhanced health data | The live description adds two symptom-catalogue operations, a `Symptom` enum, and symptom fields/query behavior. These are absent from the committed client baseline.                                                                         | **Exclude as live-contract drift.** Never present catalogue output as diagnosis.                              | Reconcile the contract and release, approve safety/privacy wording, map requirements and tests, and verify non-clinical presentation before inclusion.                                |

## Author-confirmed drafting decision of 26 July 2026

Illia reported checklist items 1-24, 28-38, 41, 44-57, 64-67, and 69-81 as
ready for first-version documentation. Items 25-26 were deliberately deferred
to version 2. Items 27, 39-40, 42-43, 58-63, and 68 were omitted and remain
unconfirmed.

This author decision permits the thesis to describe the reported first-version
implementation, including account deletion, server-backed functions, weight,
health, journal, symptom-related records, care screens, assistant integration,
and confirmed quality/deployment ranges. Each claim must carry the evidence
boundary appropriate to its artifact:

- repository-supported implementation may be described as implemented;
- branch-only work must name the branch and cannot be called merged;
- a deployment definition cannot be called a successful deployment;
- an author-confirmed status cannot be reported as a passed acceptance test;
- health and assistant behavior remains non-diagnostic.

The C# feeding API is repository-supported, but checklist items 25-26 place the
mobile feeding interface and nutrition goals in version 2. The thesis may
describe the backend capability as part of the architecture while excluding a
completed first-version end-to-end feeding experience.

## Recommended safe baseline

Until the decision record is signed, the thesis may use the 26 July
author-confirmed ranges as its implementation narrative and scope-planning
baseline. Requirement-level PASS results remain restricted to functions present
in the accepted immutable release and supported by completed evidence.
Version-2 and omitted items must not be presented as first-version acceptance
results.

This recommendation is deliberately narrower than the total API surface. It
does not ask the team to discard work. It places unfinished or divergent work
in the correct evidentiary category until the acceptance conditions are met.

## Consequences of the final decision

After approval, the same decision must be propagated to:

- the Polish and English titles and the measurable objective;
- FR/NFR and UC catalogues;
- domain, component, deployment, and interaction diagrams;
- API baseline and generated client;
- release revision and contribution record;
- verification protocol, results, screenshots, and user instructions;
- limitations, future work, summary, and conclusions; and
- the signed CDV work-allocation sheet where inclusion changes contribution
  evidence.

## Approval record

| Field                                                | Required entry                                               |
| ---------------------------------------------------- | ------------------------------------------------------------ |
| Decision date                                        | `[TO COMPLETE]`                                              |
| Accepted mobile revision / artifact digest           | `[TO COMPLETE]`                                              |
| Accepted backend revision / deployment identifier    | `[TO COMPLETE]`                                              |
| Accepted AI-service revision / deployment identifier | `[TO COMPLETE]`                                              |
| Accepted committed API contract digest               | `[TO COMPLETE]`                                              |
| Final account-deletion decision                      | `[TO COMPLETE: include as FR-13 or explicitly exclude]`      |
| Final sign-out semantics                             | `[TO COMPLETE: device-local only or verified server logout]` |
| Final treatment of each remaining matrix row         | `[TO COMPLETE]`                                              |
| Volodymyr approval                                   | `[TO COMPLETE]`                                              |
| Ksenia approval                                      | `[TO COMPLETE]`                                              |
| Anastasia Leonova approval                           | `[TO COMPLETE]`                                              |
| Illia approval                                       | `[TO COMPLETE]`                                              |
| Supervisor approval                                  | `[TO COMPLETE]`                                              |

## Closure test

This packet closes the scope-freeze gap only when every matrix row has an
explicit include/exclude decision, each included item satisfies the freeze rule,
the accepted artifacts are immutable and identifiable, all affected thesis
artifacts agree, and the authors and supervisor have approved the record.
