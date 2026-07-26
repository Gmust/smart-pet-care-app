# Smart Pet Care App - Technology-Decision Evidence Audit

## Purpose and inspected baseline

This audit supports section 3.5 of the working thesis. It distinguishes the
technology stack visible in the mobile repository from the historical decision
process that the four authors must confirm. Its purpose is to prevent
retrospective rationalization: an installed dependency proves implementation,
not the original choice date, participants, alternatives, or approval.

- Evaluated mobile revision: `0d5e33b091e9582a7075786c0b9cf724510825f9`.
- Repository and local decision records inspected: 25 July 2026.
- Current worktree configuration was inspected separately from the evaluated
  revision and is not treated as a clean release.
- The `openspec/` directory is ignored by Git in this repository. Its design
  files contain useful rationales and alternatives, but their filenames and
  filesystem dates are not a substitute for a versioned team decision record.

## Evidence hierarchy

| Level | Evidence type                                               | What it can support                                                                  | What it cannot support without another record                                                 |
| ----- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| A     | Versioned configuration, source, tests, or workflow at HEAD | Technology presence, implemented boundary, configuration, and observable code use    | Original selection rationale, unrecorded alternatives, meeting participants, or team approval |
| B     | Explicit local OpenSpec design record                       | A written rationale, trade-off, rejected alternative, risk, or migration plan        | Git-backed authorship/date or proof that the four-person team reviewed and accepted it        |
| C     | Git history and branch/ref metadata                         | Visible revision chronology and named commit attribution within the inspected scope  | Design/research work, pair programming, external repositories, or decision-meeting content    |
| D     | Author/supervisor confirmation                              | Decision date, participants, project constraint, reviewed alternatives, and approval | Nothing until a dated, inspectable record is supplied                                         |

The final thesis may state an original technology decision only when the
selected row has sufficient Level A evidence and the historical parts are
confirmed through Level B/C evidence plus Level D review. Otherwise it must use
present-tense implementation wording such as "the evaluated client uses".

## Technology evidence matrix

| Technology boundary                           | Level A implementation evidence                                                                                                                                       | Level B rationale or alternative currently available                                                                                                                                                                        | Current claim status                                                                                                       |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Expo, React Native, and Expo Router           | `package.json`; `app.json`; `src/app/`; typed routes, native plugins, iOS/Android/web configuration, fingerprint runtime policy, and EAS project metadata             | The local UX design record chooses route-level Expo Router error boundaries over one top-level boundary. The assistant record rejects a new route group and a fifth tab for the first assistant release.                    | Stack use is confirmed. Original cross-platform/framework selection date, participants, and alternatives are missing.      |
| TypeScript and Zod                            | `tsconfig.json` has `strict: true`; schemas under feature folders validate forms, routes, persisted assistant state, and selected runtime boundaries                  | The local UX record chooses Zod validation at route entry. The assistant records reject unsafe coercion and use discriminated domain models where generated DTOs do not match UI state.                                     | Strict typing and runtime parsing are confirmed. Original language/schema-library selection history is missing.            |
| TanStack Query and Axios                      | `src/api/queryClient.ts`, `src/api/axios.ts`, providers, and feature query/mutation hooks implement server-state caching, invalidation, and authenticated transport   | The local UX record rejects global focus refresh and query-key configuration maps; it selects explicit refresh, NetInfo integration, and per-hook freshness. The assistant record rejects direct Axios calls from the page. | Implemented data boundary and several later refinements are confirmed. Initial library-selection history is missing.       |
| OpenAPI and Orval-generated client            | `docs/openapi.json`, `orval.config.ts`, `src/api/generated/index.ts`, and package scripts define Axios client/model generation; separate audit records byte equality  | The assistant-session record chooses generated methods behind focused query hooks and rejects editing generated files or coercing new DTOs into obsolete mock-era types.                                                    | Generation and current use are confirmed. Original choice against handwritten clients or other generators is missing.      |
| Unistyles and reusable UI primitives          | `react-native-unistyles` dependency, `src/styles/config.ts`, shared components, feature styles, and Figma-related commit messages show the implemented styling system | The UX record mentions compatibility with the existing Unistyles group model. No explicit repository record compares Unistyles with StyleSheet, styled-components, or another styling system.                               | Implemented styling approach is confirmed; comparative selection rationale remains retrospective until authors confirm it. |
| Jest and React Native Testing Library         | `package.json`, Jest configuration, `*.test.ts(x)` files, and CI/test records show automated unit/component testing and the configured commands                       | No explicit initial testing-framework decision record was found. Local design records require deterministic tests and page/hook boundaries, but do not compare Jest with alternatives.                                      | Test-tool use is confirmed. Choice criteria, date, participants, and rejected alternatives are missing.                    |
| EAS Build, Expo Updates, and release channels | `eas.json`, `app.json`, and `.github/workflows/eas-build.yml` / `eas-update.yml` define build profiles, channels, fingerprint runtime compatibility, and workflows    | No explicit initial release-platform comparison was found. The deployment runbook accurately treats these files as configured intent rather than immutable proof of a successful production release.                        | Configured release model is confirmed; platform selection history and final deployment proof remain missing.               |
| Assistant service and generated session API   | `src/assistant/`, generated session endpoints, schemas, hooks, page tests, and the committed mobile revision show a pet-scoped assistant client boundary              | Local assistant records reject direct page-to-Axios coupling, client-owned triage history, fabricated history metadata, automatic retry, plaintext storage, and a fifth tab; trade-offs are explicit.                       | Later architecture choices are well documented locally, but backend/AI-service revisions and team approval are missing.    |

## Explicit local decisions that may be retained after author review

The following decisions have alternatives and trade-offs written in local
OpenSpec records. They are stronger than a dependency-presence inference but
remain Level B because `openspec/` is ignored:

1. built-in `FlatList` instead of adding FlashList/LegendList for current list
   sizes;
2. explicit pull-to-refresh instead of global focus refetch;
3. route-level Expo Router error boundaries instead of one top-level boundary;
4. NetInfo connected to TanStack Query's online manager instead of
   `expo-network`;
5. an in-repository logger and production console stripping instead of an
   external logging library;
6. per-hook query freshness instead of a central query-key option map;
7. Zod parsing at route entry;
8. an assistant service contract instead of direct Axios coupling in the page;
9. SecureStore for bounded sensitive assistant state instead of AsyncStorage
   or an encrypted database for the initial single-thread scope;
10. generated session methods behind assistant-specific query hooks instead of
    calling transport functions directly from the page;
11. server-aligned transcript models instead of coercing incomplete history
    DTOs into richer mock-era shapes;
12. server-resource creation for "New chat" instead of clearing only local
    state.

These are not evidence that the alternatives were prototyped or benchmarked.
The final wording must say "considered" or "rejected" only after the named
technical owners verify that the record reflects the real project decision.

## Missing decision packet for IN-10

Illia and Ksenia should coordinate one dated review with the relevant owners.
For each retained technology row, the packet must record:

1. decision date or bounded phase;
2. participants and approver;
3. requirement or project constraint;
4. selected option and version boundary;
5. alternatives genuinely reviewed;
6. evidence used at the time, not current popularity;
7. accepted trade-off and trigger for reconsideration;
8. links to a commit, issue, meeting note, prototype, benchmark, or external
   repository where available.

Volodymyr must review backend-contract and deployment implications, Ksenia the
research and source boundary, Anastasia Leonova the product/UI implications,
and Illia the mobile, integration, release, and AI-service boundary. The
supervisor should approve the final level of technical detail.

## Closure rule

IN-10 remains open. It can be closed only when the author-reviewed packet is
linked from `AUTHOR_INPUT_RESOLUTION_REGISTER.md`, Table 3.1 contains no
unsupported historical assertion, every retained alternative was genuinely
reviewed, and the rebuilt DOCX passes the structural and visual gates.
