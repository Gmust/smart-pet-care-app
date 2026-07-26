# Smart Pet Care App - Author-Input Resolution Register

## Purpose and baseline

This register converts every visible `AUTHOR INPUT REQUIRED` marker in the
working thesis into a named evidence or decision request. It is a coordination
record, not replacement thesis prose.

- Working DOCX audited on 25 July 2026:
  `diploma/output/Smart_Pet_Care_CDV_Thesis_Working_Draft.docx`.
- Baseline SHA-256:
  `a6d395973b09f6bee67a8ded543fe594df9b4a9f7d48cc201c5d7afc76b16303`.
- Baseline author-input markers: 30.
- Marker source: `diploma/scripts/build_thesis_working_draft.py`.

An item is closed only when its evidence is inspectable, the responsible
authors have approved the resulting wording, and the rebuilt DOCX no longer
contains the corresponding marker. Do not replace a marker with unsupported
prose merely to reduce the count.

## Status vocabulary

- **Waiting for input** - no sufficient author evidence or decision is linked.
- **Evidence supplied** - source material exists but has not been reviewed into
  thesis wording.
- **Drafted for review** - evidence-bounded text exists and awaits the named
  reviewers.
- **Approved** - authors and supervisor, where required, approved the wording.
- **Closed in DOCX** - the approved content is present and the marker is absent
  from a rebuilt and audited document.

All items currently have status **Waiting for input** unless a later dated row
in this register records otherwise.

## Resolution register

| ID    | Thesis location and required result                              | Primary owner(s)                         | Required evidence or decision                                                                                          | Approval / closure test                                                                             |
| ----- | ---------------------------------------------------------------- | ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| IN-01 | Introduction: original motivation and approved problem context   | Anastasia Leonova                        | Dated concept notes, target-user/problem decision, approved thesis card                                                | All authors approve original wording; supervisor accepts it; Introduction remains within two pages  |
| IN-02 | Introduction: final chapter-structure paragraph                  | Illia                                    | Stable final chapter order and contents                                                                                | Added only after chapters are frozen; every description matches the finished document               |
| IN-03 | 1.2: final existing-solution comparison                          | Ksenia; Anastasia                        | Dated listing recheck, approved comparison set, and any permitted hands-on observation record                          | Claims are current, source-bounded, dated, and supervisor-approved                                  |
| IN-04 | 2.1: approved objective and measurable acceptance criteria       | All authors; Illia coordinates           | Approved thesis card, final scope, and named acceptance evidence                                                       | Objective, FR/NFR set, results, and conclusions use identical approved wording                      |
| IN-05 | 2.7: exact author metadata and evidence-based allocation         | All authors                              | Privately verified legal names/album numbers, artifact register, approved percentages                                  | Four authors approve; percentages sum correctly; official allocation form agrees                    |
| IN-06 | 3.1: actual requirements-discovery and prioritization method     | Anastasia; Ksenia                        | Dated meetings, design decisions, rejected alternatives, change history, and traceability                              | Text describes what actually happened without assigning an unsupported formal method                |
| IN-07 | 3.2: actual project organization and quality process             | Illia                                    | Repository/PR strategy, issue/change workflow, review records, communication cadence, and gates                        | All authors confirm the process and their review responsibilities                                   |
| IN-08 | 3.3: verified system-architecture diagrams                       | Volodymyr; Illia                         | Backend and AI-service revisions, components, protocols, hosting, databases, monitoring, ownership                     | Every provisional diagram label is replaced or removed; technical owners approve                    |
| IN-09 | 3.4: verified domain and interaction models                      | Anastasia; Volodymyr; Illia              | Final scope, entity relationships, Android behavior, approved contract, backend and AI-service evidence                | UC-08/FR-13, multiplicities, service boundary, retry, auth, and notification semantics are resolved |
| IN-10 | 3.5: confirm provisional technology decision matrix              | Illia; Ksenia                            | `TECHNOLOGY_DECISION_AUDIT.md`; dated alternatives, criteria, participants, decision records, and sources              | Each selected technology is tied to a requirement and a genuinely reviewed alternative              |
| IN-11 | 3.6: final traceability/results table                            | Illia coordinates; all technical owners  | Clean revisions, final artifacts, Gate A-F records, failures, retests, screenshots/logs                                | Every approved FR/NFR has a result and evidence; not-run items remain explicit                      |
| IN-12 | Chapter 4 opening: author verification of implementation chapter | Volodymyr; Ksenia; Anastasia; Illia      | Owned modules, implementation evidence, problems, decisions, and reviewer notes                                        | Every responsible author verifies and rewrites claims about their work                              |
| IN-13 | 4.1: confirm mobile structure attribution and results            | Illia; Anastasia                         | `MOBILE_IMPLEMENTATION_ATTRIBUTION_AUDIT.md`; accepted revisions, decisions, diagrams, problems, and final results     | Owners approve identities, inclusion boundaries, attribution, collaboration, and results            |
| IN-14 | 4.2: authentication/session attribution and results              | Illia; Volodymyr                         | Mobile/backend auth revisions, protocol decision, tests, Google/device evidence, server-logout decision                | Client and backend semantics agree; final scenarios and limitations are recorded                    |
| IN-15 | 4.3: pet-profile attribution and results                         | Anastasia; Volodymyr                     | Owned UI/backend modules, validation/upload decisions, tests, Android CRUD/photo evidence                              | Final pet and photo workflows are evidenced and owner-approved                                      |
| IN-16 | 4.4: reminders/notifications attribution and results             | Illia; Volodymyr                         | Reminder/notification modules, recurrence/time-zone rules, Firebase/backend delivery evidence, Android lifecycle tests | D-01-D-10 have reviewed results or explicit limitations                                             |
| IN-17 | 4.5: assistant attribution, evaluation, and results              | Illia; Ksenia                            | AI-service revision/model/provider, protocol, dataset, safety cases, live exchanges, failures, consent evidence        | Software behavior is evidenced without claiming veterinary or clinical validation                   |
| IN-18 | 4.6: offline/recovery attribution and results                    | Illia; Anastasia                         | Connectivity implementation decisions and final cached/uncached/reconnect/error scenarios                              | Supported and unsupported offline behavior is measured and accurately bounded                       |
| IN-19 | 4.7: UI/localization/accessibility attribution and results       | Anastasia; Illia                         | Figma/frontend evidence, localization inventory, TalkBack/font/contrast/touch/error results                            | Final text states English-only UI accurately and links named accessibility evidence                 |
| IN-20 | 4.8: external backend and AI-service boundaries                  | Volodymyr; Illia                         | Repository identifiers, releases, modules, interfaces, data flow, deployment, tests, monitoring, attribution           | External implementation is distinguished from contract-only or proposed information                 |
| IN-21 | 4.9: clean final verification result                             | Illia coordinates; all technical owners  | Approved lint exclusion, warning-free test evidence, final Android/backend/AI scenarios, artifact hashes, CI           | Gate A and every selected Gate B-F item has a reviewed final status                                 |
| IN-22 | 5.2: reproducible installation and Android execution             | Illia; Volodymyr                         | Clean-checkout record, supported tool/runtime versions, build/install log, configuration boundary                      | Another reviewer can follow the redacted procedure against the approved release                     |
| IN-23 | 5.4: final user-operation instructions and screenshots           | Anastasia; Illia                         | Final artifact, device/API level, synthetic data, dated/redacted screenshots, scenario IDs                             | Instructions match the release and screenshots contain captions, provenance, and no sensitive data  |
| IN-24 | Summary and conclusions                                          | All authors; Ksenia and Illia coordinate | Approved objective, final results, defects, limitations, and grounded future work                                      | Every conclusion maps to evidence; maximum two pages; supervisor approves                           |
| IN-25 | Bibliography: ISO access and claim boundary                      | Ksenia                                   | CDV-library availability record or official abstract-only access record                                                | Standards claims match the material actually reviewed; source type is recorded accurately           |
| IN-26 | List of figures: approved caption language and updated field     | Illia; Ksenia                            | Final thesis language and binding caption rule                                                                         | All figure captions use the approved label; Word field is updated and visually checked              |
| IN-27 | List of tables: approved caption language and updated field      | Illia; Ksenia                            | Final thesis language and binding caption rule                                                                         | All table captions use the approved label; Word field is updated and visually checked               |
| IN-28 | Polish abstract and five or six keywords                         | Ksenia; all authors                      | Approved final objective, method, results, conclusions, and terminology                                                | Polish text is author-reviewed, consistent with the thesis, and supervisor-approved                 |
| IN-29 | English abstract and five or six keywords                        | Ksenia; all authors                      | Approved Polish/final thesis facts and terminology review                                                              | English text is author-reviewed, factually equivalent, and supervisor-approved                      |
| IN-30 | Signed official CDV work-allocation sheet                        | All authors; Illia coordinates           | Verified legal metadata, evidence-based percentages, binding form, signatures, supervisor approval                     | Official sheet, thesis role table, percentages, and contribution prose agree exactly                |

## First decision packet

The following decisions unblock the greatest number of markers and should be
answered first in one dated team/supervisor record:

1. approved Polish title, English title, thesis language, study mode, academic
   year, supervisor, deadline, and binding Wirtualna Uczelnia package;
2. approved main objective and measurable acceptance criteria;
3. include or exclude UC-08/account deletion and the journal, symptom, weight,
   feeding, and health-record surfaces;
4. local-only or server-backed logout semantics;
5. approved final OpenAPI/backend revision and AI-service revision/model;
6. approved caption language and AI-use disclosure format;
7. evidence-based contribution percentages and official allocation-form
   version.

## Evidence-link worksheet

Add one row per supplied item. Sensitive originals remain in the approved
private location; this register stores only a sanitized reference.

| Date            | Input ID(s)                | Owner                          | Sanitized artifact or decision reference                                                 | Revision/version                                              | Reviewer                            | Status             |
| --------------- | -------------------------- | ------------------------------ | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------- | ----------------------------------- | ------------------ |
| 25.07.2026      | IN-04, IN-09, IN-11, IN-24 | All authors; Illia coordinates | `TOPIC_APPROVAL_BRIEF.md`; `SCOPE_FREEZE_DECISION_PACKET.md`; provisional DOCX Table 2.5 | Mobile `0d5e33b`; committed/live contract and branch evidence | All authors and supervisor pending  | Drafted for review |
| 25.07.2026      | IN-10                      | Illia; Ksenia                  | `TECHNOLOGY_DECISION_AUDIT.md`; provisional DOCX Table 3.1                               | Mobile `0d5e33b`; local OpenSpec records                      | Relevant technical owners pending   | Drafted for review |
| 25.07.2026      | IN-13                      | Illia; Anastasia               | `MOBILE_IMPLEMENTATION_ATTRIBUTION_AUDIT.md`; provisional DOCX Table 4.1                 | Mobile `0d5e33b`; `feature/care-screen`                       | Both authors and supervisor pending | Drafted for review |
| `[TO COMPLETE]` |                            |                                |                                                                                          |                                                               |                                     | Waiting for input  |

## Rebuild and closure protocol

For each approved item:

1. preserve the source/decision reference and reviewer;
2. draft only evidence-supported text in the responsible authors' voice;
3. review contribution attribution and privacy;
4. replace the corresponding builder marker;
5. rebuild the DOCX;
6. rerun placeholder, citation, heading, section, table, image, field,
   accessibility, package-integrity, and visual page checks;
7. update the DOCX hash and this item's status to **Closed in DOCX**.

The marker count may fall only when this protocol is satisfied.
