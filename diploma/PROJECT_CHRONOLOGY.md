# Smart Pet Care App - Evidence-Based Project Chronology

## Status and interpretation

This chronology is reconstructed from the Git history and local branch
references of the mobile-client repository as inspected on 25 July 2026. It is
a starting point for the methodology and implementation chapters, not a
complete team history. The path-level attribution and claim rules are expanded
in `MOBILE_IMPLEMENTATION_ATTRIBUTION_AUDIT.md`.

The ancestry reachable from evaluated revision `0d5e33b` attributes 26 human
commits to `Illia Dolbnia` across two email identities and two commits to
`github-actions[bot]`. Separate local references contain 30 commits attributed
to `Anastasia Leonova`, primarily on `feature/care-screen`; those commits are
not reachable from the evaluated revision. This supports visible mobile-client
implementation by both authors while distinguishing release ancestry from
unmerged branch evidence. It does not prove the complete contribution of
either author or exclude design work, pair programming, research, review,
testing, backend repositories, AI-service repositories, shared accounts, or
squashed commits.

Before this chronology is used in the thesis, every team member must:

- confirm or correct the sequence;
- attach evidence for work performed outside this repository;
- identify collaborative work and the person who authored each artifact;
- reconcile the chronology with the final signed CDV work-allocation sheet.

## Repository milestones

| Date       | Git evidence | Repository milestone                                                               | Thesis use                                               |
| ---------- | ------------ | ---------------------------------------------------------------------------------- | -------------------------------------------------------- |
| 2026-04-11 | `8ee6c2e`    | Initial mobile-client repository commit.                                           | Establishes the earliest visible repository state.       |
| 2026-04-25 | `5bc6316`    | Reusable components and a GitHub Actions review flow were introduced.              | UI-system and quality-workflow origin.                   |
| 2026-05-24 | `ed8a243`    | Reusable components and icons were expanded from the Figma work.                   | Design-to-implementation milestone; ownership to verify. |
| 2026-05-24 | `2531f27`    | Documentation for reusable UI components was added.                                | Documentation milestone.                                 |
| 2026-06-01 | `f699b65`    | Initial home-page implementation.                                                  | First main authenticated-screen milestone.               |
| 2026-06-04 | `8a9bd81`    | Home mock screen, toast behavior, and additional lint rules were added.            | UI iteration and code-quality milestone.                 |
| 2026-06-04 | `0985784`    | Query and navigation behavior was improved.                                        | Client-state and navigation refinement.                  |
| 2026-06-06 | `63a6b46`    | Onboarding/authentication page and authentication flow were introduced.            | Authentication milestone.                                |
| 2026-06-20 | `8f17f55`    | Pet-list and pet-profile pages plus pet-creation functionality were introduced.    | Pet-management milestone.                                |
| 2026-06-29 | `47b8c7f`    | User-profile page with profile and avatar editing was added.                       | User-profile milestone.                                  |
| 2026-06-30 | `f855e9f`    | Pet-image upload functionality was added.                                          | Media-upload milestone.                                  |
| 2026-06-30 | `8832347`    | A set of smaller code improvements was integrated.                                 | Refinement milestone; exact changes require commit diff. |
| 2026-07-01 | `d2fe9bf`    | Push-notification functionality and reminder behavior were extended.               | Native integration and reminder milestone.               |
| 2026-07-05 | `c3681d1`    | Cross-project improvements and a reminders tab in the pet profile were introduced. | Feature integration milestone.                           |
| 2026-07-13 | `1d25103`    | Email-code confirmation and reminder defect fixes were introduced.                 | Authentication completion and stabilization milestone.   |
| 2026-07-15 | `0d5e33b`    | The AI-chatting screen was integrated.                                             | Assistant-client milestone and current checked revision. |

## Separate branch evidence not included in the evaluated revision

The local `feature/care-screen` reference contains 30 commits attributed to
Anastasia Leonova between 3 and 17 July 2026. Commit subjects describe a pet
care tab, sections and cards, loading states, form validation, shared drawer
structure, deletion behavior, theme/UI updates, navigation-bar integration,
and icon automation. These records support Anastasia's visible frontend
contribution, but the content must not be described as part of the evaluated
release until the team identifies the merged revision or intentionally
includes and verifies that branch.

Before using this evidence in the final allocation:

- identify which care-screen revision was accepted or merged;
- map the accepted files and features to approved requirements;
- verify the author identity and any pair/review contributions;
- attach final Android and review evidence;
- reconcile the result with Anastasia's Figma/product artifacts and the signed
  work-allocation sheet.

## Provisional development phases

### Phase 1 - Foundation and reusable interface

Visible period: 11 April to 24 May 2026.

Repository evidence:

- initial Expo/React Native project structure;
- reusable UI components and icons;
- automated review/documentation workflow;
- early UI documentation.

Author input still needed:

- original product brief and Figma history;
- Anastasia Leonova's design and frontend artifacts;
- decisions that led to the reusable-component system.

### Phase 2 - Application shell and home experience

Visible period: 1 to 4 June 2026.

Repository evidence:

- home-page iterations;
- navigation and query improvements;
- toast behavior;
- lint and formatting rules.

Author input still needed:

- acceptance criteria used for the home page;
- screenshots or prototypes showing design evolution;
- explanation of the query/navigation defects that were corrected.

### Phase 3 - Authentication and core owner workflows

Visible period: 6 to 30 June 2026.

Repository evidence:

- onboarding and authentication;
- pet list, profile, creation, editing, deletion, and image handling;
- user profile and avatar editing.

Author input still needed:

- backend API version used at each milestone;
- email/Google authentication test evidence;
- details of collaboration with backend developers;
- issues encountered in image upload and cache invalidation.

### Phase 4 - Reminders and native notifications

Visible period: 1 to 13 July 2026.

Repository evidence:

- extended reminder workflows;
- Android push-token and notification integration;
- reminder integration with pet profiles;
- email confirmation and reminder fixes.

Author input still needed:

- Firebase and backend deployment chronology;
- device/API-level test records;
- notification lifecycle results;
- defect reports or pull-request discussion explaining the fixes.

### Phase 5 - Assistant integration

Visible milestone: 15 July 2026.

Repository evidence:

- assistant pages, components, schemas, queries, client-side consent, pet scope,
  messages, retry, urgency, and emergency presentation;
- frontend/backend contract documentation.

Author input still needed:

- AI-service repository and deployment history;
- model/provider/version and safety configuration;
- Illia's AI-service implementation evidence;
- backend integration work by Volodymyr or Ksenia;
- versioned assistant evaluation scenarios and redacted results.

## Contribution-evidence implications

The current repository and inspected local references can support these narrow
statements:

- Illia is the only named human committer in the evaluated revision's reachable
  ancestry.
- Anastasia has a separate, repository-visible care-screen branch history that
  is not part of the evaluated revision.
- The visible histories are consistent with Illia's team/frontend-lead role and
  Anastasia's frontend-developer role, while product/idea leadership still
  requires design and decision evidence.

The current repository cannot by itself support these statements:

- exact percentages for any team member;
- Anastasia Leonova's claimed frontend share;
- Volodymyr's or Ksenia's backend implementation;
- Illia's AI backend-service implementation;
- complete authorship of design, research, testing, or documentation;
- a conclusion that the named committer performed all underlying work.

## Evidence still required from each team member

### Volodymyr

- backend repository URL/path and commit identity;
- API architecture and deployment artifacts;
- endpoint ownership and test/deployment evidence;
- code review or integration evidence.

### Ksenia

- backend repository URL/path and commit identity;
- research log, source-selection decisions, and chapter ownership;
- backend features, tests, and documentation authored;
- review or integration evidence.

### Anastasia Leonova

- Figma file/version history or exported design evidence;
- product brief, user-flow, and feature-prioritization artifacts;
- frontend branches, pull requests, commits, pair-programming records, or
  specific source files owned;
- Android scenario or usability-testing evidence.

### Illia

- confirmation of the commit identity shown in this repository;
- pull-request and review records where relevant;
- AI backend-service repository and deployment evidence;
- coordination artifacts, schedules, decisions, and integration records.

## Final chronology acceptance checklist

- [ ] All milestone dates were checked against pull requests and external
      repositories.
- [ ] Every team member reviewed their attribution.
- [ ] Design/research work not visible in Git was added with dated evidence.
- [ ] The chronology matches the final work-allocation percentages.
- [ ] The supervisor approved the description of team collaboration.
- [ ] No shared account or squashed history is misrepresented as individual
      authorship.
