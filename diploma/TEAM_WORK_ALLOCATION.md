# Smart Pet Care App - Team Responsibilities and Working Allocation

## Status

The role boundaries below were revised against the mobile, C# backend,
AI-service, Jira, product-concept, and supplied CDV document evidence available
on 26 July 2026. The official breakdown sheet assigns 25% overall to each
author, but the sheet still requires author signatures and supervisor review.

## Attribution warning

Git attribution is used to support module ownership, not to calculate effort.
The inspected evidence contains Illia's mobile and AI-service histories,
Anastasia's separate care-screen branch, and distinguishable Volodymyr/Kseniia
backend histories. Design, research, review, coordination, pair programming,
squashed work, and deployment still require their own artifacts.

## Team roles

### Volodymyr Biletskyi (album 29934) - lead C# backend developer

Confirmed responsibility:

- lead the core backend architecture and implementation;
- define and maintain server-side domain and application boundaries;
- coordinate database, authentication, reminder, pet, profile, and
  notification API work;
- support the OpenAPI contract and frontend integration;
- lead backend deployment, diagnostics, and reliability work;
- contribute backend test evidence and implementation documentation.

Repository-supported scope includes the dominant backend history: architecture,
database and migrations, authentication, core pet APIs, reminders, Firebase
notifications, health, journal, OpenAPI, deployment, and reliability work.
Final image/deployment identifiers and author review remain required.

### Kseniia Kushlak (album 30081) - backend feature developer and researcher

Confirmed responsibility:

- implement assigned backend features, validation, integration, and tests;
- own Cloudinary pet photographs, feeding, weight-history, and C# classifier/chat
  integration work evidenced by identifiable squash commits;
- contribute domain and technology research;
- define and maintain the literature-search protocol and source register;
- prepare the current-state-of-knowledge and market-comparison evidence;
- support requirements, test planning, and interpretation of results;
- verify that claims are supported by current academic or primary sources.

The C# integration responsibility does not include condition analysis: it covers
persisting chat state, selecting bounded history, calling the Python service,
and handling resilience and errors. Research notes, review evidence, and final
deployment/runtime results remain required.

### Anastasia Leonova (album 29945) - idea/product lead and frontend developer

Confirmed responsibility:

- originate and refine the product concept and target user workflows;
- lead problem framing, user needs, feature scope, and acceptance criteria;
- implement assigned mobile screens, components, forms, and interaction flows;
- contribute visual design, usability, accessibility, and localization work;
- prepare representative screenshots and user-operation instructions;
- support frontend tests and final product demonstration.

Repository evidence includes a 30-commit care-screen branch. Product-concept
history, accepted merge/release evidence, Figma/design evidence, and usability
or accessibility results remain required.

### Illia Dolbnia (album 30151) - team, frontend, and AI-service lead

Confirmed responsibility:

- coordinate scope, schedule, integration, reviews, and delivery;
- lead the mobile-client architecture and frontend implementation;
- coordinate API-client integration and cross-feature application behavior;
- lead the AI backend-service architecture and integration;
- define assistant session, message, retry, urgency, and safety boundaries;
- coordinate quality gates, final integration, deployment evidence, and defense
  preparation.

Repository evidence includes the evaluated mobile history and all visible
AI-service commits. The unified `/chat` endpoint, deterministic safety layer,
classifier workflow, tests, CI, and model-release pipeline are present on AI
feature revision `74019ea`. Final merged/deployed revision, model evaluation,
and coordination/release records remain required.

## Official working overall allocation

| Team member         | Overall share in supplied CDV breakdown sheet |
| ------------------- | --------------------------------------------: |
| Volodymyr Biletskyi |                                           25% |
| Kseniia Kushlak     |                                           25% |
| Anastasia Leonova   |                                           25% |
| Illia Dolbnia       |                                           25% |
| **Total**           |                                      **100%** |

This table reproduces the supplied university sheet; it is not a commit-count
calculation. The detailed activity shares in the signed final appendix must
agree with the evidence and the responsibility descriptions.

## Concrete artifact allocation

The final thesis should identify concrete ownership at a more detailed level.
Use the following draft only after checking it against repositories and project
history.

| Artifact or responsibility                       | Primary owner       | Supporting owners             |
| ------------------------------------------------ | ------------------- | ----------------------------- |
| Product concept and user problem                 | Anastasia Leonova   | Ksenia, Illia                 |
| Functional requirements and acceptance criteria  | Anastasia Leonova   | Ksenia, Illia, Volodymyr      |
| Current-state-of-knowledge research              | Kseniia Kushlak     | all authors review            |
| Market comparison                                | Kseniia Kushlak     | Anastasia Leonova             |
| Core backend architecture                        | Volodymyr Biletskyi | Kseniia, Illia                |
| Core backend implementation                      | Volodymyr Biletskyi | Kseniia Kushlak               |
| Pet photos, feeding, and weight backend features | Kseniia Kushlak     | Volodymyr Biletskyi           |
| C# assistant integration and chat persistence    | Kseniia Kushlak     | Volodymyr Biletskyi           |
| OpenAPI contract and client/backend coordination | Volodymyr Biletskyi | Illia, Kseniia                |
| Mobile-client architecture                       | Illia               | Anastasia Leonova             |
| Mobile screen and component implementation       | Anastasia Leonova   | Illia                         |
| Cross-feature frontend integration               | Illia               | Anastasia Leonova             |
| AI backend-service architecture and analysis     | Illia               | Volodymyr, Kseniia            |
| Assistant safety and consent boundary            | Illia               | Kseniia, Anastasia Leonova    |
| Backend automated tests                          | Volodymyr           | Kseniia, Illia for AI service |
| Frontend automated tests                         | Illia               | Anastasia Leonova             |
| Device-level user-flow validation                | Anastasia Leonova   | Illia                         |
| Deployment and release integration               | Volodymyr           | Illia                         |
| Final evidence register                          | Ksenia              | all authors                   |
| Thesis integration and schedule                  | Illia               | all authors                   |
| Defense demonstration                            | all authors         | role-specific sections        |

## Evidence protocol

For each claimed responsibility, collect at least one verifiable artifact:

- issue, user story, or approved requirement;
- design decision or diagram;
- commit or pull request;
- code module;
- automated test;
- device-test record;
- deployment record;
- research note or source-evaluation entry;
- meeting decision accepted by the team;
- supervisor feedback and resulting revision.

Commit counts and lines of code must not be used as the sole measure of
contribution. Research, architecture, integration, testing, management, and
documentation are legitimate contributions when supported by artifacts.

## CDV thesis presentation

The final thesis should include:

1. A concise role table in the Objective and scope chapter.
2. The official evidence-backed contribution table.
3. Explanatory prose connecting each role to concrete project artifacts.
4. The official signed CDV work-allocation sheet as the final pages.

The percentages and wording in all four locations must agree.

## Confirmation checklist

- [x] Confirm that Illia's role is "frontend lead".
- [x] Add every author's full legal name.
- [x] Add every album number.
- [x] Confirm the backend and AI-service repository scope.
- [x] Reconcile the overall percentages with the supplied CDV sheet.
- [ ] Map each author to owned modules and non-code artifacts.
- [ ] Obtain all four authors' approval.
- [ ] Obtain supervisor approval.
- [ ] Transfer the final allocation to the official CDV sheet.
