# Smart Pet Care App - Source and Claim Coverage Audit

## Purpose

This audit asks whether the current evidence is appropriate for each thesis
claim. It is stricter than the numeric-citation audit: a bibliography can be
mechanically complete while a claim is still unsupported, overgeneralized, or
based on the wrong evidence type.

The audit uses four evidence classes:

1. **Scholarly or standards source** - supports general scientific,
   methodological, quality, or safety statements.
2. **Official technical documentation** - supports library/platform behavior
   and configuration boundaries.
3. **Project evidence** - repository revision, contract, test, build, device,
   backend, AI-service, deployment, or defect record supporting what Smart Pet
   Care actually implements or achieves.
4. **Author/supervisor evidence** - approved title card, original motivation,
   team process, contribution record, scope decision, interpretation, or
   approval.

No evidence class substitutes for another. Library documentation cannot prove
project behavior, passing code checks cannot prove Android behavior, and AI
drafting cannot supply author motivation or research results.

## Evaluated baseline

- Audit date: 25 July 2026.
- Working DOCX SHA-256:
  `a6d395973b09f6bee67a8ded543fe594df9b4a9f7d48cc201c5d7afc76b16303`.
- Current bibliography: 23 entries, numbered continuously.
- Numeric integrity: every entry is cited; every citation has an entry; no
  temporary research-register identifier remains.
- Metadata integrity: all 23 entries were checked against authoritative
  publisher, DOI, PubMed, ISO, official-documentation, or store-listing records
  in `diploma/BIBLIOGRAPHY_METADATA_AUDIT.md`; no core metadata defect was found.
- Author-input markers: 30.

The 23-entry set is a working source set. Original-source review and supervisor
acceptance are still pending.

## Section-level claim coverage

| Thesis section                                     | Current evidence                                                                                                             | Coverage assessment                                                                                                                                            | Required closure                                                                                                                                                 |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Introduction                                       | Repository-grounded feature summary; IN-01 and IN-02                                                                         | Product summary is bounded; original motivation, approved problem context, and final chapter map are missing                                                   | Authors supply concept history and approved thesis card; add final structure paragraph                                                                           |
| 1.1 Pet-care workflow context                      | [4], [11], [12]                                                                                                              | Recent review and European/UK owner surveys support information-use and limitation claims; no Polish prevalence or outcome claim is made                       | Ksenia reviews full papers/available original text and preserves sample/geographic limits                                                                        |
| 1.2 Existing solutions                             | [13], [18], [19], [22] and dated extraction table                                                                            | Appropriate for public listing claims only; no observed functionality, quality, privacy compliance, or novelty proof                                           | Recheck listings; approve comparison set; add permitted hands-on observation or retain explicit non-observation                                                  |
| 1.3 Cross-platform architecture                    | [1], [3], [15]                                                                                                               | Empirical studies support context-dependent performance; Expo Router documentation supports routing behavior                                                   | Review original studies; retain older-framework limitation; add only project-specific Android performance results                                                |
| 1.4 Client-server communication and server state   | [16], [20], [21] plus repository/contract evidence                                                                           | Orval and TanStack documentation support declared library behavior; project reproducibility is separately evidenced                                            | Add Axios documentation only if an Axios-specific general claim remains; approve final OpenAPI/backend revision                                                  |
| 1.5 Runtime validation, privacy, and AI boundaries | [2], [14], [17], [23]                                                                                                        | Good conceptual coverage for Zod behavior, protected-storage boundary, MASVS categories, and veterinary generative-AI risks                                    | Identify project-validated boundaries, perform scoped mobile-security review, and add versioned AI-service evaluation; do not claim clinical validation          |
| 1.6 Mobile-application testing                     | [5], [6], [7]                                                                                                                | Standards organize usability, quality, and testing concepts; full ISO texts are not yet confirmed                                                              | Confirm CDV-library access or limit claims to official abstracts; add project-specific test/device evidence                                                      |
| 1.7 Synthesis and project positioning              | [1], [2], [3], [4], [11], [12], [13], [18], [19], [22]                                                                       | Literature and market evidence are synthesized into a bounded engineering contribution without novelty, clinical-outcome, or framework-superiority claims      | Ksenia and all authors verify the synthesis against original sources and the approved thesis objective                                                           |
| 2.1 Objective                                      | Repository scope, `TOPIC_APPROVAL_BRIEF.md`, and IN-04                                                                       | Candidate problem/objective and acceptance criteria are explicit, but they are not an approved objective                                                       | All authors and supervisor approve or replace the title, objective, research questions, scope, and measurable acceptance criteria                                |
| 2.2 Actors                                         | Mobile routes/integrations and provisional diagrams                                                                          | Candidate actors are defensible at client boundary; external implementation remains unverified                                                                 | Approve final system boundary and remove unevidenced actors                                                                                                      |
| 2.3 Functional requirements                        | Repository, committed contract, use-case audit                                                                               | Appropriate primary evidence for candidate requirements; not proof of acceptance                                                                               | Freeze scope and attach final Gate B-E results                                                                                                                   |
| 2.4 Non-functional requirements                    | [6] conceptually; project check results                                                                                      | Candidate quality concerns exist, but several targets and methods remain provisional                                                                           | Approve measurable targets, context, devices/datasets, and Gate A/F results                                                                                      |
| 2.5 Use-case catalogue                             | Repository, contract, tests, verification protocol                                                                           | Planned traceability is strong; UC-08 and additional contract surfaces remain unresolved                                                                       | Apply the dated scope-freeze decision and execute mapped scenarios                                                                                               |
| 2.6 Scope limitations                              | Current evidence boundary                                                                                                    | Appropriately conservative                                                                                                                                     | Reconcile with final approved scope and results                                                                                                                  |
| 2.7 Team roles/allocation                          | Supplied CDV sheet; author-confirmed roles; mobile, backend, and AI Git histories; Jira context                              | Responsibility boundaries and the official 25% overall shares are documented; signatures and complete non-code evidence remain pending                         | Add Figma/research/review/coordination evidence; all authors review and sign the official allocation                                                             |
| 2.8 Author-confirmed first-version scope           | `IMPLEMENTATION_STATUS_CONFIRMATION.md`, `SCOPE_FREEZE_DECISION_PACKET.md`, repository revisions, and contract/branch audits | Table 2.5 separates reported first-version, version-2, and omitted items without treating author confirmation as acceptance testing                            | Classify omitted items, identify accepted artifacts, propagate the freeze, and execute evidence for every included item                                          |
| 3.1 Requirements method                            | [6], [9] plus placeholder IN-06                                                                                              | Standards provide concepts only; actual team process is missing                                                                                                | Authors supply dated discovery, prioritization, change, and acceptance evidence                                                                                  |
| 3.2 Project organization                           | Mobile chronology; IN-07                                                                                                     | Mobile chronology is evidenced, but complete team workflow is not                                                                                              | Add backend/AI/Figma/research histories, reviews, communication, and actual gates                                                                                |
| 3.3 System architecture                            | [10], three repository boundaries, backend contract docs, AI architecture/ADR docs, Figures 3.1-3.2                          | Component ownership and deployment definitions are repository-supported; final deployed versions and runtime topology remain provisional                       | Technical leads confirm immutable releases, hosts, storage/migration state, monitoring, and live topology                                                        |
| 3.4 Domain/interaction models                      | OpenAPI snapshot, mobile code, UC/FR audit, Figures 3.3-3.8                                                                  | Appropriate contract/client evidence; not proof of backend persistence design                                                                                  | Resolve multiplicities, final contract, service topology, and provisional diagram labels                                                                         |
| 3.5 Technology-selection method                    | Repository/configuration evidence; local OpenSpec records; `TECHNOLOGY_DECISION_AUDIT.md`; [1], [15], [16], [20], [21], [23] | Table 3.1 distinguishes implemented technologies, explicit local alternatives, and unverified historical rationale; ignored records do not prove team approval | Illia and Ksenia coordinate a dated author review; confirm participants, constraints, genuine alternatives, trade-offs, and reconsideration triggers             |
| 3.6 Verification method                            | [8], [17], verification protocol                                                                                             | Generic process/security framing and explicit PASS/FAIL/BLOCKED/NOT RUN synthesis rules are documented; planned tests are not results                          | Authors approve the rules; execute the final protocol and retain failures, retests, environment, executor, and reviewer                                          |
| 4.1 Mobile structure                               | Mobile repository and refs; `MOBILE_IMPLEMENTATION_ATTRIBUTION_AUDIT.md`; Table 4.1                                          | Evaluated-release and care-branch attribution are separated; Git does not prove design, collaboration, percentages, or acceptance                              | Illia and Anastasia verify identities, accepted revision, design/review contribution, decisions, problems, Android results, and final inclusion                  |
| 4.2 Authentication/session                         | Mobile repository, contract, auth tests, Figure 3.6                                                                          | Client behavior is partly evidenced; Google, restore/refresh contention, backend logout, and device behavior remain incomplete                                 | Approve server-logout semantics and execute B-01-B-10                                                                                                            |
| 4.3 Pet profiles                                   | Mobile repository and contract                                                                                               | Implementation description is grounded; no dedicated automated/device acceptance evidence                                                                      | Owners verify code attribution and execute C-01-C-07                                                                                                             |
| 4.4 Reminders/notifications                        | Mobile repository, contract, token tests, Figure 3.7                                                                         | Client token branches are tested; delivery/lifecycle behavior is not                                                                                           | Verify recurrence/time-zone semantics, backend delivery, and D-01-D-10 on final Android release                                                                  |
| 4.5 Assistant                                      | Mobile repository/tests, C# chat module/contract/tests, AI unified-chat branch/tests/docs, Figure 3.8, [2], [23]             | Client, integration, persistence, resilience, classifier, and deterministic safety implementations are evidenced; deployed revision and effectiveness are not  | Identify deployed service/model release and execute expected/observed cases, failures, and limitations                                                           |
| 4.6 Offline/recovery                               | Mobile connectivity/query code                                                                                               | Describes implemented read/recovery design, not complete offline operation                                                                                     | Execute cached/uncached/reconnect/error scenarios and record unsupported mutations                                                                               |
| 4.7 UI/localization/accessibility                  | Mobile code and selected assistant tests                                                                                     | English-only localization claim is grounded; general accessibility remains weak                                                                                | Add Figma/ownership evidence and manual Android TalkBack/font/contrast/touch/focus results                                                                       |
| 4.8 Backend and AI services                        | Backend main through `6d79951`; AI main `682dfb5` and unified-chat branch `74019ea`; Jira and contract comparison            | Internals and visible attribution are now repository-supported; final merge/deployment, runtime configuration, and acceptance remain unverified                | Provide immutable releases/image digests, sanitized deployments, live exchanges, tests, monitoring, and author review                                            |
| 4.9 Verification results                           | Current Gate A evidence, Android availability checkpoint, contract checks                                                    | Table 4.2 classifies accurate provisional checkpoints and non-claims; it is not final-system or requirement-level acceptance                                   | Replace the checkpoint table with final requirement outcomes after a clean revision, approved contract, accepted gates, device scenarios, and backend/AI results |
| 5.1-5.3 Deployment                                 | Repository config, build profiles, OpenAPI/runbook evidence                                                                  | Supports intended/configured process; no immutable final deployment proof                                                                                      | Record supported versions, final build/deployment IDs, environment boundaries, and redacted procedure                                                            |
| 5.4 User operation                                 | Current source flows only; IN-23                                                                                             | No final-artifact screenshots or reviewed instructions                                                                                                         | Add dated/redacted screenshots and numbered instructions tied to final release/device                                                                            |
| 5.5 Maintenance/limitations                        | Repository/query/release observations                                                                                        | Suitable working limitations, subject to final result                                                                                                          | Reconcile with defects, release ownership, operational monitoring, and approved future work                                                                      |
| Summary/conclusions                                | IN-24                                                                                                                        | Cannot be written honestly before final objective/results                                                                                                      | All authors interpret evidence; distinguish achieved, partial, failed, and untested outcomes                                                                     |
| Bibliography                                       | 23 mechanically audited entries; IN-25                                                                                       | Numeric integrity is confirmed; original review and ISO access are not                                                                                         | Ksenia/technical leads review originals; supervisor approves final alphabetized set                                                                              |
| Polish/English abstracts                           | IN-28 and IN-29                                                                                                              | Missing by design                                                                                                                                              | Draft only after objective, results, and conclusions are approved                                                                                                |

## Entry-level review register

| No. | Source                                          | Current thesis use                                        | Original-source availability                     | Author review status                                               |
| --: | ----------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------ |
|   1 | Biørn-Hansen et al., cross-platform performance | Context-dependent framework performance                   | Publisher/DOI; open-access paper identified      | Pending Ksenia and Illia                                           |
|   2 | Chu, generative AI in veterinary medicine       | AI hallucination, privacy, transparency, adjunct boundary | Open-access full text                            | Pending Ksenia and Illia                                           |
|   3 | Dorfer et al., mobile resource use              | Historical controlled React Native energy result          | Open-access proceedings paper                    | Pending Ksenia and Illia                                           |
|   4 | Haase et al., pet-owner mHealth requirements    | Requirements and application limitations                  | Open-access full text                            | Pending Ksenia                                                     |
|   5 | ISO 9241-11:2018                                | Usability in a specified context                          | Official abstract; full-text access unconfirmed  | Pending Ksenia; IN-25                                              |
|   6 | ISO/IEC 25010:2023                              | Product-quality model                                     | Official abstract; full-text access unconfirmed  | Pending Ksenia; IN-25                                              |
|   7 | ISO/IEC/IEEE 29119-1:2022                       | General testing concepts                                  | Official abstract; full-text access unconfirmed  | Pending Ksenia; IN-25                                              |
|   8 | ISO/IEC/IEEE 29119-2:2021                       | Generic test processes                                    | Official abstract; full-text access unconfirmed  | Pending Ksenia; IN-25                                              |
|   9 | ISO/IEC/IEEE 29148:2018                         | Requirements as life-cycle information                    | Official abstract; full-text access unconfirmed  | Pending Ksenia; IN-25                                              |
|  10 | ISO/IEC/IEEE 42010:2022                         | Architecture-description concepts                         | Official abstract; full-text access unconfirmed  | Pending Ksenia; IN-25                                              |
|  11 | Kogan et al., UK pet-owner internet use         | Historical corroborating owner-information behavior       | PubMed abstract/metadata identified              | Pending Ksenia; consider exclusion if full claim cannot be checked |
|  12 | Springer et al., European owner-information use | Recent owner behavior, benefits, and risks                | Open-access full text                            | Pending Ksenia                                                     |
|  13 | 11pets Google Play listing                      | Dated public product claims                               | Official store listing                           | Pending Ksenia/Anastasia recheck                                   |
|  14 | Expo SecureStore                                | Library storage behavior and limitations                  | Official versioned documentation                 | Pending Illia                                                      |
|  15 | Expo Router introduction                        | File-based route behavior                                 | Official documentation                           | Pending Illia                                                      |
|  16 | Orval overview                                  | OpenAPI-derived TypeScript client/model generation        | Official documentation and Context7 record       | Pending Illia/Volodymyr                                            |
|  17 | OWASP MASVS 2.1.0                               | Mobile-security control categories                        | Official standard/guidance page                  | Pending Illia/Volodymyr                                            |
|  18 | PetDesk Google Play listing                     | Dated public product claims                               | Official store listing                           | Pending Ksenia/Anastasia recheck                                   |
|  19 | PetnotePlus Google Play listing                 | Dated public product claims                               | Official store listing                           | Pending Ksenia/Anastasia recheck                                   |
|  20 | TanStack Query invalidation                     | Stale marking and targeted invalidation                   | Official v5 documentation                        | Pending Illia                                                      |
|  21 | TanStack Query React Native                     | Focus/connectivity integration                            | Official v5 documentation                        | Pending Illia                                                      |
|  22 | VitusVet Google Play listing                    | Dated public product claims                               | Official store listing                           | Pending Ksenia/Anastasia recheck                                   |
|  23 | Zod basic usage                                 | Runtime parsing, `safeParse()`, inferred types            | Official Zod 4 documentation and Context7 record | Pending Illia/Ksenia                                               |

## Priority gaps before source freeze

### Priority 0 - Cannot be supplied by literature

- approved thesis titles, language, scope, objective, and acceptance criteria;
- actual team process, decisions, contributions, and signatures;
- external backend and AI-service implementation/release evidence;
- final Android, deployment, accessibility, performance, and AI evaluation
  results;
- supervisor approval.

These are author/project evidence gaps. Searching for more publications will
not close them.

### Priority 1 - Original-source review

- Ksenia reviews [1]-[12] in the original material available to the team;
- confirm complete ISO access through the CDV library or preserve the
  abstract-only claim boundary;
- relevant technical leads review [14]-[17], [20], [21], and [23];
- Ksenia and Anastasia recheck [13], [18], [19], and [22].

### Priority 2 - Add only if a retained claim needs it

Potential official documentation still worth evaluating:

- Axios interceptor/cancellation behavior;
- Expo development builds and notifications;
- Android notification channels, runtime permission, and lifecycle behavior;
- Google Sign-In and Firebase Cloud Messaging;
- React Native accessibility/virtualized-list behavior;
- Jest and React Native Testing Library;
- Unistyles, TanStack Form, and i18next.

Do not add every dependency to the bibliography. Add a source only when a
retained thesis statement genuinely requires external support and cannot be
supported more directly by project evidence.

### Priority 3 - Add only under an approved research method

- Polish pet-owner information behavior;
- usability study participants or representative reviewers;
- expert assessment of assistant safety or veterinary correctness.

These require a supervisor-approved study design, consent/privacy controls,
actual data collection, and honest reporting. They must not be synthesized from
general literature or invented after implementation.

## Source-freeze gate

The bibliography may be frozen only when:

- every retained general claim has an appropriate source;
- every project-specific claim points to project evidence;
- every original source has a named author reviewer and completed review;
- access limitations are explicit;
- unused entries are removed;
- scientific and online sections remain alphabetized according to the binding
  CDV rule;
- the numeric sequence is regenerated after the final ordering;
- every entry is cited and every citation resolves;
- the supervisor approves the final source set.

After any later source change, rebuild the DOCX and rerun the complete citation
and document audit.
