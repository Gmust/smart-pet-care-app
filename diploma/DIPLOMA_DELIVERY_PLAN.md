# Smart Pet Care App - Twelve-Week Diploma Delivery Plan

## Planning assumptions

This plan starts from the structurally audited working draft produced on
25 July 2026. It assumes approximately 10 to 15 focused hours per person per
week, timely access to the backend and AI-service repositories, and several
short supervisor review cycles. Twelve weeks gives the team time to resolve
scope, collect original research and system evidence, write and integrate the
thesis, obtain feedback, and complete final rendering and submission QA. The
final week is protected for corrections and submission, not new
content-development.

Use `diploma/THESIS_COMPLETION_AUDIT.md` as the authoritative readiness
checklist. A weekly exit criterion is complete only when that matrix points to
inspectable evidence, not merely a planned action.

If required repositories, university metadata, device access, or supervisor
feedback arrive late, the affected task moves the submission date. Missing
evidence must not be replaced by invented prose or inferred results.

## Roles used by this plan

- **Volodymyr:** backend lead.
- **Ksenia:** backend developer and research lead.
- **Anastasia Leonova:** idea/product lead and frontend developer.
- **Illia:** team lead, frontend lead, and AI backend-service lead.

The roles are confirmed descriptions. The contribution percentages remain a
draft until the evidence from every repository and collaboration tool is
reviewed and the team signs the CDV allocation.

## Twelve-week roadmap

| Weeks | Main outcome                                                                                     | Primary owners                 |
| ----- | ------------------------------------------------------------------------------------------------ | ------------------------------ |
| 1     | Confirm university metadata, approved topic, evidence locations, and academic-integrity protocol | All authors; Illia coordinates |
| 2     | Freeze requirements and scope; approve the evaluated release and decision packet                 | All authors; supervisor        |
| 3     | Produce backend, AI-service, contract, deployment, and attribution evidence                      | Volodymyr, Ksenia, Illia       |
| 4     | Execute authentication, pet, reminder, notification, and account scenarios                       | Volodymyr, Anastasia, Illia    |
| 5     | Execute assistant, offline, accessibility, performance, and failure scenarios                    | Illia, Anastasia, Ksenia       |
| 6     | Complete literature review, research method, market review, and source approval                  | Ksenia; all authors review     |
| 7     | Write requirements, methodology, architecture, and team-organization chapters                    | Ksenia, Illia, Volodymyr       |
| 8     | Write implementation, deployment, results, limitations, abstracts, and conclusions from evidence | All authors                    |
| 9     | Integrate the thesis and reconcile citations, diagrams, tables, and contribution claims          | Illia coordinates; all authors |
| 10    | Submit the evidence-indexed draft for supervisor review and close first corrections              | All authors; supervisor        |
| 11    | Perform final DOCX/PDF, accessibility, privacy, package, and practical-artifact QA               | Illia, Anastasia, Volodymyr    |
| 12    | Protected correction, final approval, upload rehearsal, and submission package freeze            | All authors; supervisor        |

The schedule is sequential at its decision gates but parallel in production:
research, backend evidence, frontend evidence, and AI-service evidence can run
at the same time after the scope decision in Week 2.

## Weeks 1-2 - Freeze scope and evidence baseline

### Team tasks

- Confirm the thesis language, study mode, academic year, approved Polish and
  English titles, supervisor, deadline, full legal names, and album numbers.
- If the thesis or defence is conducted in a student-selected language, obtain
  the required written approval from the deputy dean and thesis supervisor.
- Obtain the current binding CDV/Wirtualna Uczelnia document package.
- Record the current Dean's order for the topic, submission, and defence
  schedule; do not use an older public deadline as the team's deadline.
- Approve the functional and non-functional requirement wording.
- Agree on the evidence folder, release identifier, synthetic test accounts,
  and privacy/redaction rules.
- Complete `diploma/TEAM_EVIDENCE_INTAKE.md`; link every claimed responsibility
  to a dated, reviewable artifact.
- Review `diploma/AI_USE_LOG.md` against the retained session export and add
  any separate AI assistance used by individual authors.

### Owned work

| Owner     | Work                                                                                                                                                              |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Volodymyr | Provide the core-backend repository, revision history, architecture, API ownership, tests, configuration, and deployment topology                                 |
| Ksenia    | Review candidate literature in the original sources; prepare the search/inclusion record; supply backend research and implementation evidence                     |
| Anastasia | Supply product-origin notes, Figma history, user flows, design decisions, frontend artifacts, and acceptance rationale                                            |
| Illia     | Maintain the mobile evidence baseline; provide frontend architecture, AI-service repository, coordination records, validation results, and the master thesis file |

### Weeks 1-2 exit criteria

- Approved metadata sheet with no unresolved identity/title field.
- Frozen requirement list with named acceptance evidence.
- Mobile, backend, AI-service, Figma, and research evidence locations.
- Completed and reviewed individual evidence-intake statements.
- AI-use log reconciled with retained conversation evidence; disclosure format
  awaiting or carrying supervisor approval.
- Draft allocation recalculated from all visible artifacts.
- Thesis working draft rebuilt and structurally audited.

The current workspace already satisfies the last item only. The remaining
Weeks 1-2 criteria require team and supervisor input.

## Weeks 3-5 - Produce final-system evidence

### Build and release baseline

- Identify one thesis-evaluated mobile artifact, backend release, and
  AI-service release.
- Record Git revisions, clean/dirty state, lockfile and artifact digests,
  OpenAPI version, EAS/build identifiers, environment, and Android device.
- Run frozen dependency installation, client generation, configured and broad
  lint scopes, strict TypeScript, Jest, Android export, native build, and CI.

### Scenario execution

- Authentication and account lifecycle.
- Pet/profile CRUD and photograph handling.
- Reminder CRUD, recurrence/time-zone cases, notification registration, and
  foreground/background/terminated notification taps.
- Assistant consent, pet scoping, session/history/send/retry, malformed
  responses, urgency presentation, and approved high-risk cases.
- Offline/reconnect, error recovery, TalkBack, font scaling, touch targets,
  contrast, and the approved performance protocol.

### Evidence capture

Every test record must name the executor and reviewer, use fictional test data,
record expected and observed behavior, preserve failures, and link sanitized
screenshots/logs. Each failed case receives a defect and retest record.

### Weeks 3-5 exit criteria

- Every mandatory verification-protocol item is passed, failed, blocked, or
  explicitly not run.
- All pass results identify the final evaluated system.
- Required screenshots and diagrams are supported by current evidence.
- No credential, token, personal email, or real medical data is present.

## Weeks 6-8 - Complete the academic content

### Chapter ownership

| Content                                                                               | Primary owner | Required reviewers   |
| ------------------------------------------------------------------------------------- | ------------- | -------------------- |
| Problem origin, users, workflow, and UI decisions                                     | Anastasia     | Illia, Ksenia        |
| Scientific current-state chapter and source verification                              | Ksenia        | All authors          |
| Core backend architecture, implementation, tests, and deployment                      | Volodymyr     | Ksenia, Illia        |
| Mobile architecture, frontend implementation, integration, and release                | Illia         | Anastasia, Volodymyr |
| AI-service architecture, configuration, evaluation, safety boundaries, and deployment | Illia         | Ksenia, Volodymyr    |
| Requirements, methodology, cross-system results, and conclusions                      | All authors   | Supervisor           |

### Document work

- Replace every visible author-input marker with reviewed team-authored
  content or remove the unsupported claim.
- Insert final use-case, class/object, component, deployment, and selected
  sequence diagrams.
- Insert screenshot figures with captions, sources, build/device metadata, and
  redaction notes.
- Review the current 23-entry numeric citation sequence, add any sources
  required by the completed chapters, then renumber and rerun the
  in-text/bibliography integrity audit if the source set changes.
- Write the results table from Weeks 3-5 evidence.
- Write conclusions against each approved objective without exceeding the
  evidence.
- Prepare Polish and English abstracts and five or six keywords in each
  language.

### Weeks 6-8 exit criteria

- No placeholder, temporary citation identifier, invented result, or
  unattributed team claim remains.
- Every requirement has a result and every conclusion points to evidence.
- All figures/tables are numbered, captioned, cited, and listed.
- Bibliography and online-access dates are complete and supervisor-ready.

## Weeks 9-11 - Supervisor review and submission QA

### Review cycle

- Deliver the evidence-indexed draft to the supervisor at the start of Week 10.
- Log each requested change, owner, decision, implementation, and verification.
- Reconcile all team role descriptions and percentages with the signed CDV
  work-allocation sheet.
- Confirm the approved AI-use disclosure and academic-integrity statement.
- Verify that each student has completed the programme, required examinations
  and practice, required ECTS, fee obligations, and supervisor acceptance before
  requesting the defence.
- Confirm the oral defence scope, three-person commission (supervisor, reviewer,
  and chair), question list, place, and notice date from the current Dean/WU
  communication.

### Final document QA

- Apply official title page and metadata.
- Update the table of contents and lists of figures/tables in Word.
- Inspect every DOCX page at 100% zoom for clipping, wrapping, headings, page
  breaks, tables, figures, margins, and footer numbering.
- Export the submission PDF and inspect every PDF page.
- Run structural, accessibility, field, package-integrity, placeholder,
  citation, bibliography, and metadata/privacy audits.
- Verify the submitted practical-work archive and all Wirtualna Uczelnia
  filenames/forms against the current binding instructions.

### Weeks 9-11 exit criteria

- Supervisor-requested changes are closed or documented.
- Final DOCX and PDF match visually and contain no unresolved marker.
- Signed allocation, abstracts, bibliography, lists, and practical artifact
  are present.
- A release-candidate submission package has hashes and named team approval;
  any open item is explicitly assigned into the Week 12 buffer.

## Week 12 - Protected correction and submission buffer

### Permitted buffer work

- Apply late supervisor corrections and record how each comment was closed.
- Repeat only the verification affected by a corrected mobile, backend, or
  AI-service release.
- Update Word fields, rerender the DOCX, re-export the PDF, and inspect every
  page after the final change.
- Correct official filenames, forms, signatures, archive structure, or upload
  issues discovered during the submission rehearsal.
- Recalculate hashes and reapprove the immutable package after every material
  change.

Week 12 must not be used to invent missing research, silently add untested
features, or bypass author/supervisor review. A content gap discovered in this
week is reported and handled through an explicit scope or deadline decision.

### Week 12 exit criteria

- Every supervisor correction has a recorded closed or formally accepted
  status.
- The final DOCX and PDF have passed full-page visual inspection after the last
  edit.
- The signed allocation sheet, approved AI-use disclosure, abstracts,
  bibliography, figures/tables lists, and practical-work package are present.
- One immutable submission package has SHA-256 hashes, backup copies, a
  successful upload rehearsal or submission record, and named approval from
  all four authors.
- The WU/Dean eligibility and defence record is attached to the final internal
  checklist, including language approval where applicable.

## Critical path and internal buffers

The critical path is:

1. official metadata and title;
2. external repository/deployment evidence;
3. final integrated build;
4. device and service verification;
5. evidence-backed results/conclusions;
6. supervisor review;
7. Word/PDF visual QA and submission.

Use two internal buffers:

- reserve the final two working days of Week 5 for failed-scenario fixes and
  retests;
- reserve the final working day of Week 11 for the complete submission
  rehearsal;
- protect all of Week 12 for corrections, reruns, final rendering, and upload
  problems.

If the university deadline leaves fewer than twelve weeks, protect the
evidence, supervisor, and final-QA stages first. Compress parallel drafting and
review where responsible authors are available; reduce unsupported scope
rather than claiming untested functionality.

## Short coordination rule

Use one 15-minute checkpoint on working days during Weeks 1-10 and two
checkpoints per week during Weeks 11-12:

- evidence produced since the previous checkpoint;
- decisions or blockers;
- next artifact and owner;
- thesis section affected;
- privacy or academic-integrity risk.

Illia maintains the master tracker, but the owner of each artifact remains
responsible for its factual correctness and authorship statement.
