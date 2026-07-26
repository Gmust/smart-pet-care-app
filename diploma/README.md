# Smart Pet Care App Diploma Workspace

## Current deliverables

- `THESIS_BLUEPRINT.md` - CDV-aligned scope, chapter plan, evidence plan,
  formatting rules, and academic-integrity protocol.
- `TOPIC_APPROVAL_BRIEF.md` - provisional title, problem, objective, research
  questions, scope, acceptance criteria, and supervisor decision record.
- `CDV_SUPPLIED_DOCUMENTS_AUDIT.md` - read-only audit of the three official CDV
  DOCX inputs supplied by the authors, including metadata and contribution-sheet
  reconciliation requirements.
- `DIPLOMA_DELIVERY_PLAN.md` - twelve-week owned schedule, role-based roadmap,
  weekly exit criteria, critical path, and submission definition of done.
- `TEAM_WORK_ALLOCATION.md` - four-person role and percentage proposal.
- `TEAM_EVIDENCE_INTAKE.md` - Week 1 metadata sheet and separate evidence
  requests for Volodymyr, Ksenia, Anastasia Leonova, and Illia.
- `AUTHOR_INPUT_RESOLUTION_REGISTER.md` - one-to-one ownership, evidence, and
  closure criteria for all 30 visible thesis author-input markers.
- `AI_USE_LOG.md` - factual working record of AI assistance, verification
  boundaries, retained/rejected material, and pending author/supervisor review.
- `THESIS_COMPLETION_AUDIT.md` - requirement-by-requirement proof matrix for
  final submission readiness and remaining ownership.
- `CDV_COMPLIANCE_MATRIX.md` - current official-source baseline, public
  requirement-to-artifact mapping, package hashes, and Wirtualna Uczelnia
  authority boundary.
- `EVIDENCE_REGISTER.md` - repository-to-claim mapping and current validation
  evidence.
- `PROJECT_CHRONOLOGY.md` - dated mobile-repository milestones, attribution
  limits, and missing contribution evidence.
- `MOBILE_IMPLEMENTATION_ATTRIBUTION_AUDIT.md` - evaluated-release versus
  care-screen-branch attribution, path/revision mapping, claim limits, and
  author-review closure evidence for Chapter 4.
- `SCOPE_FREEZE_DECISION_PACKET.md` - provisional include/exclude matrix,
  evidence rule, approval record, and propagation checklist for unresolved
  release, contract, branch, and live-service boundaries.
- `IMPLEMENTATION_STATUS_CONFIRMATION.md` - author-confirmed first-version,
  version-2, and unconfirmed checklist ranges reconciled with repository
  evidence and acceptance limits.
- `REQUIREMENTS_TRACEABILITY.md` - candidate functional and quality
  requirements mapped to implementation, verification status, and missing
  acceptance evidence.
- `USE_CASE_TRACEABILITY_AUDIT.md` - stable UC-01-UC-18 catalogue with
  requirement, route, API, automated-test, and final-scenario coverage plus
  explicit scope decisions.
- `VERIFICATION_PROTOCOL.md` - repeatable final-build gates and scenario
  records for requirements, Android behavior, accessibility, and performance.
- `DEPLOYMENT_RUNBOOK.md` - repository-grounded build/release model and the
  evidence record required for local, EAS, backend, and AI-service deployment.
- `API_CONTRACT_COMPARISON.md` - authenticated, read-only comparison of the
  committed and live OpenAPI descriptions, including the identified additive
  drift and reconciliation boundary.
- `OPENAPI_CLIENT_REPRODUCIBILITY.md` - byte-for-byte temporary regeneration
  check for the committed OpenAPI snapshot and generated TypeScript client.
- `STATIC_AND_TEST_WARNING_AUDIT.md` - exact configured/broad lint matrix,
  repeated Jest-warning observations, claim limits, and the clean-gate closure
  protocol.
- `diagrams/` - editable PlantUML sources and reviewed working exports for the
  use-case, contract-level domain-class, component, deployment,
  authentication, notification, and assistant diagrams.
- `SOURCE_REGISTER.md` - official documentation, engineering standards,
  peer-reviewed candidate literature, search records, and remaining research
  gaps.
- `SOURCE_CLAIM_COVERAGE_AUDIT.md` - section-by-section and entry-by-entry
  assessment of whether scholarly, technical, project, or author evidence
  supports each retained thesis claim.
- `BIBLIOGRAPHY_METADATA_AUDIT.md` - authoritative metadata check for all 23
  working entries, ISO abstract-only boundaries, dynamic-listing recheck rules,
  and the source-freeze gate.
- `TECHNOLOGY_DECISION_AUDIT.md` - implementation-versus-decision evidence
  hierarchy, technology matrix, explicit local alternatives, and the closure
  packet for Chapter 3.5.
- `MARKET_REVIEW.md` - dated, claim-bounded comparison of four current Android
  pet-care products and the required follow-up observation protocol.
- `output/Smart_Pet_Care_CDV_Thesis_Working_Draft.docx` - editable working
  thesis file.
- `output/team-work-packets/` - five shareable Word files: one common team work
  plan and one evidence-based scope-of-work packet for each author.

The DOCX is intentionally not submission-ready. It contains visible author
input markers wherever approved facts, original research, measurements,
citations, personal information, or supervisor decisions are missing.
It also contains a blue `WHO WRITES THIS` instruction and a short `TIP` directly
below every working chapter and subsection heading so the shared copy shows
both ownership and what to write or research. Remove these instructions before
the final submission build.
Chapter 1 now contains English source-backed working prose with a continuous
numeric citation sequence. The 23-entry scientific/online bibliography is
cross-reference audited, but the authors and supervisor must still approve the
source set and renumber it if entries change.
The DOCX also contains eight inline working-draft UML figures with captions,
Word figure-sequence fields, source statements, and alternative text. The
component, deployment, and assistant sequence figures now use inspected backend
and AI-service repository evidence while retaining visible requirements for
final deployed revisions and runtime acceptance.
All eleven current tables have numbered Word sequence fields, left-aligned titles
above the table, source statements, explicit geometry, and references from the
body prose.

## Confirmed team roles

- Volodymyr Biletskyi - lead C# backend developer and infrastructure owner.
- Kseniia Kushlak - backend feature developer and researcher.
- Anastasia Leonova - idea/product lead and frontend developer.
- Illia Dolbnia - team lead, frontend lead, and AI backend-service lead.

## Build the working DOCX

The builder uses an isolated runtime and does not add Python dependencies to the
mobile project. It also normalizes DOCX package timestamps so identical source
produces a byte-identical working artifact:

```bash
uv run --no-project --with python-docx \
  python diploma/scripts/build_thesis_working_draft.py
```

## Structural verification

```bash
uv run --no-project --with python-docx \
  python diploma/scripts/audit_thesis_working_draft.py
```

Additional document audits use the Codex document-skill helpers:

- heading hierarchy;
- A4 sections and margins;
- style lint;
- exact table width, indent, grid, and cell geometry.

## Visual verification limitation

The canonical DOCX renderer requires LibreOffice (`soffice`). It is not
installed in the current environment, so page-image rendering could not be
completed. Before submission:

1. Open the working file in Microsoft Word or LibreOffice.
2. Update the table of contents and list fields.
3. Inspect every page at 100% zoom.
4. Check title-page placement, page breaks, table wrapping, captions, margins,
   and footer numbering.
5. Export one PDF and inspect every PDF page.

## Information still needed

- final thesis language;
- private confirmation of the supplied legal names and album numbers;
- study mode and academic year;
- approved Polish and English titles;
- supervisor confirmation of the supplied title and name;
- approved thesis card;
- current Wirtualna Uczelnia deadline and binding document package;
- final evidence-based work allocation;
- final backend and AI-service release, deployment, monitoring, and live-test
  evidence;
- team review of the candidate academic literature;
- supervisor-approved hands-on observations for the preliminary market review;
- screenshots, final evidence-approved diagrams, Android scenario results, and
  measurements;
- supervisor feedback and approved AI-use disclosure.

## Academic-integrity boundary

The team remains responsible for every claim, result, source, and contribution
statement. Do not convert planning prompts into final prose without original
author input and source verification. Do not invent research, implementation
work, measurements, user studies, or test outcomes.
