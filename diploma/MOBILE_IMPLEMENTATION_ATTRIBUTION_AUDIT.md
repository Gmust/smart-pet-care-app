# Smart Pet Care App - Mobile Implementation Attribution Audit

## Purpose and baseline

This audit supports Chapter 4 and the final CDV work-allocation evidence. It
maps visible mobile implementation to Git revisions and paths while separating
repository authorship from design, research, review, pair programming,
external-service work, and final-release acceptance.

- Evaluated mobile revision:
  `0d5e33b091e9582a7075786c0b9cf724510825f9`.
- Evaluated ancestry: 26 human commits attributed to `Illia Dolbnia` across two
  email identities and two automation commits.
- Separate branch: `feature/care-screen`.
- Branch relation: merge base equals the evaluated revision; the branch is zero
  commits behind and 30 commits ahead.
- Branch attribution: all 30 branch-only commits are attributed to `Anastasia
Leonova <hihikka22@gmail.com>`.
- Inspection date: 25 July 2026.

These statements concern the locally available Git references. The final
submission must cite immutable remote revisions or an archived repository
package, because local branches can move or disappear.

## Attribution rules

1. A named Git author supports repository-visible commit authorship within the
   inspected history.
2. A commit subject and diff support a bounded description of changed files,
   not the complete human activity behind the change.
3. A branch-only change is not functionality of the evaluated release.
4. Source presence is not proof of a passing runtime scenario, usability,
   accessibility, backend integration, or production deployment.
5. A commit by one person does not exclude design, review, research, testing,
   or pair-programming contributions by another.
6. Contribution percentages must be derived from the complete cross-repository
   artifact set and approved by all authors; commit counts are not percentages.

## Evaluated-revision implementation matrix

| Mobile scope                    | Repository paths                                             | Reachable milestone evidence                                                                                | Defensible attribution and limit                                                                                              |
| ------------------------------- | ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Application shell and shared UI | `src/app`, `src/common`, `src/styles`, `src/shadecn`, icons  | Initial/reusable UI, home, query/navigation, and later integration commits from `8ee6c2e` through `0d5e33b` | Commits are attributed to Illia; Figma/design authorship, reviews, and pair contributions remain unverified.                  |
| Authentication and profile      | `src/auth`, `src/profile`, shared API/session utilities      | `63a6b46`, `47b8c7f`, `1d25103`                                                                             | Illia's reachable client implementation is visible; backend behavior and Google/device acceptance are separate.               |
| Pet profiles and media          | `src/pets`, image/network utilities                          | `8f17f55`, `f855e9f`, later fixes                                                                           | Illia's reachable client commits are visible; product/design ownership and final Android CRUD/photo results need evidence.    |
| Reminders and notifications     | `src/reminders`, `src/notifications`, related pet-profile UI | `8f17f55`, `d2fe9bf`, `c3681d1`, `1d25103`                                                                  | Illia's reachable client commits are visible; backend scheduling, FCM delivery, and lifecycle behavior are unverified.        |
| Assistant client                | `src/assistant`, session API exports, tests                  | `0d5e33b`                                                                                                   | Illia's assistant-client implementation is visible; AI-service implementation, model behavior, and clinical validity are not. |
| Generated API boundary          | `docs/openapi.json`, `orval.config.ts`, `src/api`            | Present in the evaluated revision and used across feature hooks                                             | Mobile contract consumption is visible; backend schema authorship and endpoint behavior require backend evidence.             |

The evaluated revision does not contain a `src/care` directory. Therefore, the
care-screen functionality must not be listed as evaluated-release behavior or
counted as a passed requirement at this baseline.

## Anastasia Leonova's separate care-screen branch

The branch-only history provides substantial repository evidence for
Anastasia's frontend-developer role:

| Phase / dates               | Branch evidence                            | Visible code scope                                                                                         | Inclusion and verification boundary                                                                      |
| --------------------------- | ------------------------------------------ | ---------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Foundation, 3 July          | `9c54123`, `de1859d`                       | Mock API/query scaffold, pet-profile care tab shell, and navigation                                        | Branch-only; no evaluated-release inclusion                                                              |
| Sections, 4-5 July          | `4f75649`, `6e5d00e`                       | Care sections, cards, localization, and tab content                                                        | Source exists; behavior has not been accepted against final requirements                                 |
| Forms, 7 July               | `4a3476a`, `46a8b39`, `20973ad`, `ecab5ef` | Management drawers, schemas, form validation, theme/UI changes, dependency and entry configuration         | Branch-only configuration must be reconciled with the final release                                      |
| Refinement, 8-9 July        | `39cde6d` through `cd1472a`                | Shared layouts, mutation keys, skeletons, computed values, profile-tab behavior, and defect corrections    | Commit subjects and diffs show iteration; no independent runtime or review result is attached            |
| Interaction, 11-13 July     | `e52a5bc` through `5260ce0`                | Swipe-to-delete, confirmations, navigation scrim, icon automation, deletion refactor, and provider cleanup | Branch contains no `src/care/*.test.ts(x)` files in the inspected tree                                   |
| Mainline merges, 15-17 July | `4a5522d`, `15da8ee`                       | Mainline merged into the feature branch                                                                    | The feature branch remains 30 commits ahead; these merges do not prove care functionality reached `main` |

The care queries import client-side mock collections for care rules, food
tracking, meals, and planned health events. The branch comment explicitly
describes selected computed data as mocked client-side. Consequently, this
evidence supports a frontend prototype/implementation claim, not live backend
integration, persistence, accepted requirements, or production readiness.

## Missing evidence by role

### Anastasia Leonova

- immutable accepted/merged care-screen revision;
- Figma version history and product/idea decisions;
- pull-request, review, pair-programming, or issue evidence;
- final requirement mapping and Android results;
- explanation of which branch configuration and dependency changes were
  retained.

### Illia

- confirmation of both Git email identities;
- pull-request/review records for the evaluated merge commits;
- important mobile architecture decisions and encountered problems;
- AI backend-service repository and release/evaluation evidence;
- final mobile revision and clean validation package.

### Volodymyr and Ksenia

- backend repository identities and revisions;
- endpoint/module ownership, tests, review, and deployment evidence;
- mapping from backend changes to the mobile contract and final scenarios.

### All authors

- collaborative work not represented by commit authors;
- reviewed artifact-to-task allocation and weighted percentages;
- agreement that the thesis wording matches the signed CDV allocation sheet.

## Chapter 4 claim rules

The working thesis may currently say:

- the evaluated revision contains the listed client modules;
- the evaluated ancestry attributes its human commits to Illia;
- a separate 30-commit care-screen branch is attributed to Anastasia;
- the care branch is based on client-side mock data and lacks care-specific
  test files;
- backend and AI-service implementation remain outside this repository.

It may not yet say:

- Anastasia's care functionality is part of the evaluated release;
- Illia alone designed or implemented every artifact under his commits;
- the care branch is backend-integrated, tested, or accepted;
- commit counts equal contribution percentages;
- backend or AI-service code is proved by the mobile repository.

## Closure for IN-12, IN-13, IN-15, IN-19, and IN-30

This audit is a drafted evidence boundary, not closure. The relevant inputs can
close only after:

1. all four authors confirm their identities and artifact ownership;
2. the final mobile revision and included branches are frozen;
3. Anastasia's accepted care/Figma contribution is linked and reviewed;
4. Illia's mobile and AI-service evidence is linked and reviewed;
5. Volodymyr's and Ksenia's backend/research evidence is linked;
6. Chapter 4 states encountered problems, decisions, and verified results in
   the authors' own reviewed wording;
7. the official CDV percentages are recalculated from the complete artifact
   set, approved, and signed.
