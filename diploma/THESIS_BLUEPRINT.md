# Smart Pet Care App - CDV Engineering Thesis Blueprint

## Document status

This is a planning artifact for a Collegium Da Vinci engineering thesis. It is
not submission-ready prose. Items marked **confirm** require the authors or
supervisor to supply or approve the information before they are used in the
thesis.

## Current requirement authority

The public CDV 2026/2027 study regulation is the current baseline for general
eligibility, approved thesis language, and defence conditions. The public
Informatics formatting package still carries 2024/2025-labelled files, so its
chapter, formatting, diagram, bibliography, and work-allocation rules remain
provisional until the team confirms the current Wirtualna Uczelnia/Dean
package. See `diploma/CDV_COMPLIANCE_MATRIX.md` and `diploma/SOURCE_REGISTER.md`
for source dates, links, and authority limits.

## Working assumptions to confirm

- Programme: Informatics, first-cycle engineering degree.
- Institution: Collegium Da Vinci, Faculty of Applied Sciences.
- Project: the mobile client in this repository, supported by an external API.
- Thesis type: four-person team thesis.
- Thesis language: **confirm Polish or English**.
- Study mode: **confirm full-time or part-time**.
- Academic year and submission deadline: **confirm from Wirtualna Uczelnia**.
- Authors' full legal names, album numbers, supervisor, and final work
  allocation percentages: **confirm**.

The public CDV Informatics package states that projects are normally completed
by teams of three or four. An individual thesis requires explicit approval.

## Candidate title

The title must be approved by the supervisor and CDV Quality Committee.

Polish:

> Inteligentny asystent opieki nad zwierzętami

English:

> Smart Pet Care Assistant

The author-provided words "inteligentny" and "smart" require an operational
definition in the objective and results. Do not interpret them as claims of
medical diagnosis, veterinary effectiveness, security certification, or
AI-powered superiority unless the thesis evaluates and supports those claims.

## Proposed engineering problem

Pet-care information is often distributed across calendars, notes,
communication tools, and separate health records. The engineering problem is
to design a coherent mobile client that lets an authenticated owner manage pet
profiles and recurring care activities, receive reminder notifications, and
access pet-scoped informational assistance through a consistent interface.

The thesis must distinguish:

- features implemented in this mobile repository;
- behavior exposed by the external backend API;
- functionality verified on Android or another named platform;
- planned or unverified functionality.

## Proposed objective

The main objective is to design, implement, and verify the Smart Pet Care
Assistant as a cross-platform mobile application supporting selected pet-care
workflows. The solution should
provide authenticated access, pet-profile management, reminders, push
notification handling, and a pet-scoped assistant while applying typed API
integration, runtime boundary validation, protected session storage,
connectivity-aware data fetching, and automated tests. In this objective,
“smart” or “intelligent” means observable assistant behavior—such as pet-context
selection, consent handling, structured response presentation, configured
urgency cues, and failure handling—not veterinary diagnosis or clinical
effectiveness.

The objective is achieved only when the authors define measurable acceptance
criteria and present evidence from the finished application. A source-code
listing alone does not demonstrate achievement.

## Scope

### Candidate in-scope areas

- Email/password and Google authentication.
- Restoration and refresh of authenticated sessions.
- Secure storage of authentication material.
- Pet-profile creation, reading, editing, deletion, and photo upload.
- Reminder creation, grouping, update, deletion, and status handling.
- Native Android notification-token registration and reminder deep-link flow.
- Pet-scoped assistant sessions, messages, retry behavior, consent, urgency,
  and emergency presentation.
- Offline awareness and reconnect behavior.
- Typed HTTP client generated from the committed OpenAPI contract.
- Forms and runtime validation.
- Localization and accessibility measures present in the client.
- Automated unit, hook, context, and page tests.

### Out of scope unless separate evidence is supplied

- Backend implementation internals.
- Veterinary or diagnostic correctness of assistant output.
- iOS production notification delivery.
- Clinical validation, diagnosis, treatment, medication, or dosage advice.
- Claims of complete accessibility conformance.
- Performance at a particular scale without measurements.
- Security certification or penetration-test results.

## CDV-required document structure

The final thesis should use the following order.

1. Official CDV title page.
2. Table of contents.
3. Unnumbered Introduction, no more than two pages.
4. Numbered Chapter 1: Current state of knowledge.
5. Numbered Chapter 2: Objective and scope.
6. Numbered Chapter 3: Methodology.
7. Numbered Chapter 4: Project implementation.
8. Numbered Chapter 5: Deployment and operation.
9. Unnumbered Summary and conclusions, no more than two pages.
10. Bibliography, separating printed and online sources.
11. List of figures.
12. List of tables.
13. Polish and English abstracts with five or six keywords each.
14. Signed work-allocation sheet as the final pages for a team thesis.

The numbering above describes the likely engineering narrative. The supervisor
may approve another number of implementation chapters, but the CDV-required
content and order must remain present.

## Detailed chapter plan

### Introduction - unnumbered, maximum two pages

- Introduce the practical context of organizing pet care.
- Define the class of problems addressed by the application.
- Explain why a cross-platform mobile solution was selected.
- State the practical value without presenting results prematurely.
- Preview the structure of the thesis.

Evidence needed:

- Approved thesis topic.
- Authors' motivation and project origin.
- Concise statement of who the intended users are.

### 1. Current state of knowledge

#### 1.1 Domain context

- Common pet-care information and reminder workflows.
- Constraints of handling health-adjacent information.
- Difference between informational assistance and veterinary diagnosis.

#### 1.2 Existing solution and market review

- Define comparison criteria before choosing products.
- Compare a small, justified set of current applications.
- Cover workflow breadth, platform availability, reminders, health records,
  privacy disclosures, and assistant behavior where relevant.
- Date every online observation.

Evidence needed:

- Reproducible comparison table.
- Screenshots only where legally and academically appropriate.
- Direct citations to official product documentation or store listings.

#### 1.3 Cross-platform mobile architecture

- Native and cross-platform approaches.
- Rationale for the selected application framework.
- File-based navigation and modular feature organization.

#### 1.4 Client-server communication and state

- HTTP API contracts and generated clients.
- Server-state caching and mutation handling.
- Session refresh and failure recovery.

#### 1.5 Data validation, privacy, and safety boundaries

- Compile-time types versus runtime validation.
- Protected local storage for authentication material.
- Minimal pet context and consent in the assistant workflow.
- Limits of client-side emergency indicators.

#### 1.6 Mobile-application testing

- Unit, component, integration, and device-level testing.
- What each chosen test level can and cannot prove.

All technology facts in this chapter require current primary documentation or
scientific/technical literature. Repository source code is evidence of this
project's implementation, not a general reference for external technology.

### 2. Objective and scope

#### 2.1 Main objective

Use the approved objective and define observable completion criteria.

#### 2.2 Stakeholders and actors

Candidate actors:

- unauthenticated visitor;
- authenticated pet owner;
- Google identity provider;
- backend API;
- Firebase Cloud Messaging;
- assistant service.

#### 2.3 Functional requirements

Create a numbered table with, at minimum:

- identifier;
- requirement;
- actor;
- priority;
- acceptance criterion;
- implemented status;
- verification evidence.

Do not mark a requirement complete until the corresponding flow has been
observed or tested.

#### 2.4 Non-functional requirements

Candidate categories:

- security and privacy;
- usability and accessibility;
- reliability and error recovery;
- maintainability and type safety;
- performance;
- portability;
- localization.

Each requirement needs a metric or verification method. Avoid unmeasurable
terms such as "fast", "secure", or "user-friendly".

#### 2.5 Scope limitations

State the exclusions listed in this blueprint and any backend or device limits.

#### 2.6 Team work allocation

For every author, record:

- project roles;
- responsibility by phase;
- concrete artifacts or modules;
- percentage contribution to each project phase;
- overall percentage consistent with the signed CDV sheet.

The current draft team roles are:

- Volodymyr - backend lead;
- Ksenia - backend developer and research lead;
- Anastasia Leonova - idea/product lead and frontend developer;
- Illia - team lead, frontend lead, and AI backend-service lead.

Illia's frontend-lead role has been confirmed. The proposed phase percentages
and concrete responsibilities are maintained in
`diploma/TEAM_WORK_ALLOCATION.md`.

### 3. Methodology

#### 3.1 Requirements discovery and prioritization

- Source of requirements.
- Use cases or user stories.
- Prioritization method.
- Acceptance criteria.

#### 3.2 Project organization

- Team workflow and responsibilities.
- Version-control strategy.
- Change-proposal process, code review, and quality gates.
- Iterative delivery approach actually used by the team.

Do not retroactively claim a formal methodology that the team did not use.

#### 3.3 Architecture design

- Mobile client, backend API, identity provider, notification service, and
  assistant-service boundaries.
- Feature-module organization.
- Navigation and provider hierarchy.
- API generation from the OpenAPI contract.

#### 3.4 Data and interaction models

- Core domain entities.
- Request/response boundaries.
- Authentication lifecycle.
- Reminder notification lifecycle.
- Assistant session/message lifecycle.

#### 3.5 Technology-selection criteria

Compare plausible alternatives using explicit criteria. Explain decisions
already recorded in the repository, including:

- virtualized lists;
- explicit pull-to-refresh;
- route-level error boundaries;
- network status integration;
- per-data-class cache freshness;
- route-parameter validation;
- protected storage accessibility.

#### 3.6 Verification strategy

- Static analysis and strict type checking.
- Automated tests by level and feature.
- API contract checks.
- Android build and manual scenario tests.
- Performance, accessibility, and reliability measurements.

### 4. Project implementation

#### 4.1 Application structure

- Expo Router entry points under `src/app`.
- Feature modules under `src`.
- Shared providers, UI primitives, styles, and localization.

#### 4.2 Authentication and session lifecycle

- Email/password and Google OAuth flows.
- Auth context states.
- protected token storage;
- request interceptor;
- refresh on `401`;
- sign-out and unauthorized-session cleanup.

#### 4.3 Pet-profile management

- List and detail presentation.
- Form validation.
- Create, update, delete, and photo-upload flows.
- Cache invalidation and error states.

#### 4.4 Reminder and notification workflows

- Reminder queries and mutations.
- Grouping and status changes.
- Android FCM token registration.
- Notification tap to reminder-status flow.

#### 4.5 Assistant workflow

- Explicit consent and pet selection.
- Session bootstrap and server history.
- Optimistic messages, send, and retry.
- Runtime validation and error narrowing.
- Urgency and emergency presentation.
- Boundaries preventing diagnostic claims.

#### 4.6 Offline behavior and resilience

- Network-state integration.
- Offline banner/screen.
- reconnect behavior;
- route-level error recovery;
- limitations such as the absence of offline mutation queueing.

#### 4.7 User interface, accessibility, and localization

- Theme and component system.
- Keyboard and screen-reader considerations.
- non-color urgency cues;
- English localization currently present in the repository.

#### 4.8 External backend and AI-service boundaries

- Core backend repository, architecture, deployment, and ownership.
- AI backend-service repository, model/provider version, safety configuration,
  evaluation, deployment, and ownership.
- Interfaces and protocols consumed by the mobile client.
- Clear distinction between implemented, externally verified, and proposed
  elements.

#### 4.9 Verification results

Present actual results, not intended tests:

- command, environment, date, and revision;
- automated test counts and results;
- tested Android device/emulator details;
- scenario outcomes;
- measured performance or accessibility results;
- defects found and resolved;
- known unresolved limitations.

### 5. Deployment and operation

#### 5.1 Prerequisites

- Supported Node and package-manager versions.
- Android build environment.
- backend API address;
- Google OAuth identifiers;
- Firebase Android client configuration.

Do not expose credentials or include private configuration files.

#### 5.2 Installation and local execution

- Dependency installation.
- environment-file preparation;
- generated API client;
- development build;
- Android execution.

#### 5.3 Backend and external services

- State that the API is external to this repository.
- Describe the OpenAPI contract and client generation.
- Explain Google identity and FCM boundaries.

#### 5.4 User operation

Provide a screenshot-backed sequence:

1. Create or access an account.
2. Add a pet profile.
3. Create and manage a reminder.
4. Respond to a reminder notification.
5. Open a pet-scoped assistant session.
6. Update the user profile or sign out.

#### 5.5 Maintenance and limitations

- Updating the API specification and regenerating the client.
- Platform-specific notification setup.
- known limitations and safe rollback behavior;
- recommended future improvements.

### Summary and conclusions - unnumbered, maximum two pages

- Revisit every objective and acceptance criterion.
- State what was achieved and what was only partially achieved.
- Interpret test and measurement results.
- Discuss the most important engineering problems and trade-offs.
- Identify future work grounded in observed limitations.

Do not introduce new sources, features, or results in the conclusion.

## Mandatory engineering diagrams

The CDV guide requires at least:

1. Complete use-case diagram from the perspectives of end users and other
   actors.
2. Class and/or object diagrams with relationships.
3. Component diagram with dependencies and interfaces.
4. Deployment diagram for the distributed application, including nodes,
   dependencies, interfaces, and communication protocols.

Recommended additional diagrams:

- authentication sequence;
- reminder notification sequence;
- assistant send/retry sequence;
- navigation/state diagram;
- entity relationship model based on the public API contract.

Every diagram must match the final code and API contract. Each figure needs a
caption, source statement, in-text reference, and entry in the list of figures.

## Evidence and measurement plan

Before writing results, collect:

- Git revision representing the evaluated release.
- Android device/emulator model and OS/API level.
- build type and relevant configuration;
- automated test output;
- static-analysis and type-check output;
- functional scenario checklist;
- screenshots of all documented user flows;
- API request/response evidence with personal data and tokens removed;
- cold-start and selected-screen timing measurements if performance is claimed;
- list-rendering measurements with defined dataset sizes if scalability is
  claimed;
- accessibility inspection results if accessibility is claimed;
- notification results for foreground, background, and terminated states;
- offline and reconnect scenario results;
- assistant emergency, rate-limit, malformed-response, and retry scenarios.

## Bibliography plan

Maintain separate sections for printed/scientific literature and online
sources, as required by CDV. Every listed source must be cited in the thesis,
and every factual technology or market claim must be traceable to a source.
Candidate primary sources and unresolved research gaps are maintained in
`diploma/SOURCE_REGISTER.md`.

Priority order:

1. Peer-reviewed literature or academic books for research and engineering
   concepts.
2. Official documentation for frameworks, APIs, protocols, and platform
   behavior.
3. Official product pages for market comparison.
4. High-quality technical standards or government guidance where relevant.

Do not cite generated summaries as factual sources. Record the access date for
every online source.

## CDV formatting specification

- Page size: A4.
- Body font: Verdana, 10 pt.
- Body line spacing: 1.15.
- Body alignment: justified.
- Paragraphs: first-line indentation, no spacing between consecutive body
  paragraphs.
- Chapter title: 12 pt, bold, left-aligned.
- Subchapter and lower numbered title: 10 pt, bold, left-aligned.
- Start every numbered chapter on a new page.
- Use 1.5-line separation around headings as specified in the CDV guide.
- Include all numbered chapters and subchapters in the table of contents.
- Do not prefix titles with the word "Chapter".
- Count pages from the title page, but display page numbers only from the first
  Introduction page, in the right side of the footer.
- Use numeric citations in square brackets inside sentences.
- Do not use footnotes.
- Put numbered table titles above tables, left-aligned.
- Put numbered figure captions below figures, left-aligned.
- Center tables and figures and keep them within margins.
- Add either a numeric source citation or "(source: authors' own work)" to
  every figure and table caption.
- Refer to every figure and table from the body text.

The official title-page template controls title-page typography and placement.

## Quality target based on the CDV assessment sheet

The working review should score the thesis against the current 50-point sheet:

- title/content consistency: 2;
- objective and current knowledge: 6;
- literature and citations: 4;
- domain analysis, technology selection, and implementation description: 10;
- results, verification, interpretation, and conclusions: 10;
- originality: 4;
- practical or cognitive value: 4;
- language quality: 5;
- editorial compliance: 5.

The final internal review should target at least 45 points, while recognizing
that only the official supervisor and reviewer assign grades.

## Academic-integrity and AI-use protocol

The CDV Informatics guide recommends avoiding AI-generated theoretical
content, requires critical and ethical reflection, and asks students to cite
AI-generated elements. It also suggests preserving screenshots of relevant AI
conversations in an appendix.

For this thesis:

- Authors remain responsible for every claim, result, decision, and citation.
- AI may organize material, propose questions, check consistency, and help
  edit author-provided drafts.
- No interviews, surveys, measurements, test outcomes, implementation work, or
  sources may be invented.
- Theoretical statements must be rebuilt from and verified against cited
  primary or academic sources.
- AI-assisted text must be reviewed and rewritten into the authors' genuine
  account of their work.
- Maintain an AI-use log containing date, purpose, tool, relevant prompts,
  accepted output, rejected output, verification, and final author revision.
- Use `diploma/AI_USE_LOG.md` as the working record; reconcile it with the
  retained session export and add every author's separate AI use.
- Obtain supervisor approval for the disclosure and citation format before
  submission.

## Inputs still required from the authors

- Approved Polish and English titles.
- Thesis language.
- Full-time or part-time status and academic year.
- Authors' names and album numbers.
- Supervisor's title and name.
- Approved thesis card.
- Final work allocation and contribution percentages.
- Original project motivation and chronology.
- Team methodology actually used.
- Backend architecture evidence or a decision to treat the backend as an
  external system.
- Screenshots and diagrams.
- Device-level test results and measurements.
- Supervisor comments.
- Current deadline and submission instructions from Wirtualna Uczelnia.

## Deliverables

After the missing inputs and evidence are supplied:

1. Approved source and evidence register.
2. Chapter drafts reviewed by the authors and supervisor.
3. Final editable DOCX matching the CDV format.
4. Rendered-page visual quality review.
5. Final single-file PDF.
6. Practical-project submission checklist.
7. Presentation and defense-question pack.
