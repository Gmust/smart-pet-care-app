# Smart Pet Care App - Topic and Objective Approval Brief

## Status and authority

This is a **provisional decision brief** for the four authors and the
supervisor. It is not an approved thesis card and must not be used as evidence
that the university has accepted the topic. The approved title, language,
scope, and acceptance criteria must be copied from the signed or Wirtualna
Uczelnia record after approval.

## Candidate topic

### English

**Smart Pet Care Assistant**

### Polish

**Inteligentny asystent opieki nad zwierzętami**

The topic wording is supplied by the author team. Before approval, the terms
“inteligentny” and “smart” must be defined through observable assistant
capabilities and evidence. The title must not be interpreted as a claim of
medical diagnosis, veterinary effectiveness, clinical safety, artificial-
intelligence superiority, or market novelty.

## Candidate problem statement

Pet owners may need one mobile place to manage pet profiles, reminders,
notifications, and informational assistant interactions. The engineering
problem is to design and implement a cross-platform client that integrates
these workflows with authenticated services while keeping data, connectivity,
notification, and assistant limitations explicit.

This statement is a candidate framing. Anastasia must confirm the product
origin and user problem from the team's dated records; Ksenia must confirm the
supporting literature; Volodymyr and Illia must confirm the actual service
boundaries.

## Candidate objective

Design and implement the Smart Pet Care Assistant cross-platform mobile client
and its documented service integrations, then evaluate the accepted release against an
approved set of functional and quality scenarios covering authentication, pet
profiles, reminders and notifications, assistant consent and interaction,
connectivity recovery, and selected accessibility and reliability checks.

The objective is achieved only when the team identifies an immutable evaluated
release, maps every included requirement to implementation and verification
evidence, reports expected and observed results, and states unsupported
features and limitations. It does not require or imply clinical validation.

## Candidate research questions

1. How can a cross-platform mobile architecture organize authenticated pet,
   reminder, notification, and assistant workflows while preserving clear
   service boundaries?
2. Which implementation and verification evidence demonstrates the selected
   workflows on the accepted release, and which behaviors remain unverified?
3. How should consent, urgency presentation, connectivity recovery, and data
   limitations be communicated without presenting the assistant as a clinical
   decision-maker?

The supervisor may replace these questions with a different approved research
design. No research question should be retained if the team cannot collect the
corresponding evidence.

## Candidate scope freeze

### Include if approved and verified

- account registration, confirmation, login, session restoration, and the
  approved sign-out semantics;
- pet-profile creation, viewing, editing, deletion, and photo handling;
- reminder CRUD, recurrence/status behavior, notification-token handling, and
  approved notification-response flows;
- assistant consent, pet context, session/history/send/retry behavior, and
  non-clinical safety presentation;
- selected connectivity, error-recovery, accessibility, and reliability
  scenarios;
- the backend and AI-service boundaries only to the extent that their revisions,
  deployment, interfaces, and results are supplied by the responsible owners.

### Exclude unless separately approved and verified

- account deletion as UC-08/Candidate FR-13;
- weight history, health records, and feeding logs;
- the separate care-screen branch and its mock-backed collections;
- journal and symptom-catalogue surfaces found only in the live contract;
- clinical effectiveness, veterinary diagnosis, security certification, or
  unsupported cross-platform runtime claims.

The authoritative evidence matrix is maintained in
`SCOPE_FREEZE_DECISION_PACKET.md` and the provisional DOCX Table 2.5.

## Candidate acceptance criteria

| ID    | Criterion                                                                                           | Evidence required                                                                       |
| ----- | --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| AC-01 | Approved objective, title, language, and scope are recorded.                                        | Thesis card, WU/Dean record, dated author and supervisor approval.                      |
| AC-02 | An immutable mobile, backend, AI-service, and contract baseline is identified.                      | Revision IDs, deployment/build identifiers, contract digest, environment record.        |
| AC-03 | Every included functional requirement maps to an implementation path and scenario.                  | Requirements/use-case matrix, final source paths, scenario IDs.                         |
| AC-04 | Expected and observed results are recorded for every executed scenario.                             | Dated logs, screenshots, API results, failures, retests, executor/reviewer.             |
| AC-05 | Quality claims are bounded to measured device, dataset, and protocol evidence.                      | Android/device metadata, accessibility/performance/reliability results.                 |
| AC-06 | Contributions are attributed from inspectable artifacts and agree with the signed allocation sheet. | Backend, frontend, AI, design, research, review, and coordination evidence.             |
| AC-07 | Academic-integrity and AI-use disclosures are complete and supervisor-approved.                     | Source decisions, retained AI records, author annotations, JSA result, disclosure text. |

## Decision record

| Field                                     | Required entry  |
| ----------------------------------------- | --------------- |
| Decision date                             | `[TO COMPLETE]` |
| Approved Polish title                     | `[TO COMPLETE]` |
| Approved English title                    | `[TO COMPLETE]` |
| Approved thesis language                  | `[TO COMPLETE]` |
| Approved study mode and academic year     | `[TO COMPLETE]` |
| Approved objective and research questions | `[TO COMPLETE]` |
| Approved included requirements/use cases  | `[TO COMPLETE]` |
| Explicit exclusions and limitations       | `[TO COMPLETE]` |
| Accepted release and service revisions    | `[TO COMPLETE]` |
| Supervisor decision                       | `[TO COMPLETE]` |
| Volodymyr review                          | `[TO COMPLETE]` |
| Ksenia review                             | `[TO COMPLETE]` |
| Anastasia Leonova review                  | `[TO COMPLETE]` |
| Illia review                              | `[TO COMPLETE]` |

## Propagation rule

After approval, copy the exact wording—not a paraphrase—to the thesis card,
title page, Introduction, Chapter 2 objective and scope, requirements/use-case
register, results, limitations, abstracts, conclusions, and official
work-allocation sheet. Rebuild and re-audit the DOCX after every approved
change.
