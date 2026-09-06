# Smart Pet Care App

## Project Overview

Cross-platform mobile app (iOS, Android, Web) built with Expo and React Native. Uses Expo Router for file-based navigation.

## Tech Stack

- **Framework**: Expo ~56 / React Native 0.85 (New Architecture enabled)
- **Navigation**: Expo Router (file-based, typed routes)
- **State/Data**: TanStack React Query
- **Forms**: TanStack Form + Zod
- **Styling**: react-native-unistyles
- **HTTP**: Axios
- **Language**: TypeScript (strict)

## Project Structure

```
src/
  app/            # Expo Router routes only — thin, delegate to a feature page
    (auth)/       # welcome, sign-in, confirm-email
    (tabs)/       # home, pets, activity, profile (+ hidden routes)
  <feature>/      # activity, assistant, auth, health, home, notifications, pets, profile
    components/   # feature components (may nest: drawers/, actions/, tabs/)
    hooks/
    locales/en.json
    pages/
    queries/      # query-key factory + one file per useQuery/useMutation
    schemas/      # *.schema.ts (Zod factories taking `t`)
    skeletons/
    utils/
    types.ts
  api/            # axios instance, interceptors, generated client, queryClient
  common/         # shared components, hooks, providers, utils
  icons/          # SVG icon components
  shadecn/ui/     # shared UI primitives
  styles/         # Unistyles palette / theme / config
  i18n.ts         # i18next init + static namespace registry
```

Routes are thin: they re-export `RouteErrorFallback as ErrorBoundary` and render a feature page.
New features follow the shape above — `src/health/` is the reference implementation.

## Commands

Package manager: **pnpm** (with `node-linker=hoisted` in `.npmrc` for RN/Metro compatibility).

Development target: **Android app**. Do not run `pnpm web` for validation or UI checks unless the user explicitly asks for web.

```bash
pnpm start          # Start Expo dev server
pnpm ios            # Run on iOS simulator
pnpm android        # Run on Android emulator
pnpm web            # Run in browser (do not use for default validation)
pnpm lint           # ESLint
pnpm typecheck      # TypeScript check
pnpm test           # Jest
pnpm check          # Lint + typecheck
```

## Code Conventions

- Directory names: kebab-case
- File names: `PascalCase.tsx`
- Components: PascalCase, one per file. Never define 2+ components in one file — split each into its own file. Exception: `src/shadecn/` (shadcn-style primitives), where multiple related components per file is allowed.
- Hooks: camelCase filename (`useAuth.ts`), `use*` export
- Schemas: `*.schema.ts` filename (e.g. `auth.schema.ts`), named exports
- Styles: defined with `StyleSheet.create` from `react-native-unistyles`, colocated in component file or `styles/` directory
- Imports: sorted via `eslint-plugin-simple-import-sort`
- Prefer arrow functions for functions and components.
- Component internals should be ordered as: state, refs, variables, nested components, effects, JSX.
- All forms must be implemented with TanStack Form. Do not use local component state for form field values.
- Use inputs only through TanStack Form field handlers (`field.handleChange`, `field.handleBlur`, and field state); do not manage form input state outside TanStack Form.
- No default exports for utilities/hooks — named exports only
- Components may use default exports (Expo Router requirement for pages)
- No single-use helper/mapper functions. If a transform is called from only one place, inline it at the call site. Extract a function only when reused (2+ call sites).

## Reusable UI (read before writing any component)

Shared primitives live in `src/shadecn/ui/`; shared composites in `src/common/components/`.
**Check `docs/reusable-ui.md` before building UI** — it maps "what you are building" to the
primitive that already does it.

- Anything the user taps to perform an action is a `Button`. Do not rebuild one from
  `Pressable` + `Text` + a stylesheet: that loses the pressed/disabled/loading states, the
  typography scale, the 44×44 touch target, and `role="button"`.
- All text goes through `Text` from `@/shadecn/ui/text` with a `variant`. Never import `Text`
  from `react-native` in feature code.
- Text fields use `Input`, never a raw `TextInput`.
- Deletions use `DeleteConfirmDialog` from `@/common/components/`, not a new modal.
- A raw `Pressable` is correct for _surfaces_ rather than actions — list cards, rows whose whole
  area navigates, custom controls with no primitive equivalent. Give them `accessibilityRole`,
  an `accessibilityLabel` when there is no visible text, and a 44×44 touch target.
- Prefer `Pressable` over `TouchableOpacity`.
- If a primitive nearly fits, add a variant to it in `src/shadecn/ui/` so every screen benefits.
  Do not restyle it locally to imitate another component.

## Unistyles

Theme is configured in `styles/config.ts`. Access via:

```tsx
import { StyleSheet } from "react-native-unistyles";

const styles = StyleSheet.create((theme) => ({
  container: { backgroundColor: theme.palette.white },
}));
```

## API Layer

- `src/api/generated/` is produced by **orval** and is **gitignored** — never edit it, and expect
  it to differ from a teammate's until they regenerate. `pnpm api:generate` rebuilds it from
  `docs/openapi.json`; `pnpm api:update` fetches a fresh spec first.
- **A newly generated endpoint is not callable until you add it to the manual destructure in
  `src/api/index.ts`.** Regenerating alone is not enough — this is easy to miss because the
  function exists in `src/api/generated/` and the import error only appears at the call site.
- Query hooks live in `<feature>/queries/`: one key factory plus one file per query/mutation.
  Make the key factory's broad key a prefix of the narrow one so a single `invalidateQueries`
  covers every variant:
  ```ts
  logs: (petId) => ["activity", "logs", petId],
  logsInRange: (petId, from, to) => ["activity", "logs", petId, from, to],
  ```
- Mutations invalidate; they do not fire toasts. Toasts belong at the call site (drawer/dialog),
  so one hook can serve several surfaces.
- **PATCH endpoints use `PatchFieldOf<T>` semantics: an omitted key is left unchanged, `null`
  clears the value.** Send only the fields that actually changed, or a stale form will silently
  overwrite someone else's concurrent edit.
- Known spec gap: `PatchFieldOf*` **enum** types have no `null` member, so enum fields cannot be
  cleared through PATCH even though their description says otherwise. Do not paper over this with
  an `as` cast — constrain the form instead, and raise it with the backend.

## Internationalisation

- Every user-visible string is a translation key. No hardcoded copy in components.
- A new feature namespace must be registered in **three** places in `src/i18n.ts`: the import, the
  `modules` tuple, and the `enResources` object.
- Resources are typed through `CustomTypeOptions`, so a missing or misspelled key is a
  **typecheck** failure, not a silent runtime fallback. `pnpm typecheck` is the test for i18n keys —
  do not add tests that assert keys exist.

## Testing

Jest with `jest-expo` and `@testing-library/react-native`. Run one file while iterating
(`pnpm exec jest <path>`), the suite before finishing.

Test the logic that can silently corrupt data or lose work — codecs, date grouping, filtering,
schema validation, mutation payloads, destructive flows. Layout and wiring are usually cheaper to
verify on a device than to assert in a test.

Conventions and traps, all of which have bitten before:

- **Query client in tests**: `gcTime: Infinity`, `retry: false`, and clear the cache in
  `afterEach`. Without it React Query's notify timer keeps running and **the suite hangs instead
  of failing**.
- **`jest.config.js` pins `TZ=UTC`.** Setting `process.env.TZ` inside a test file is too late —
  Node resolves the local timezone first. Date-grouping behaviour is timezone-sensitive.
- **Components rendering a `Drawer`** pull in `@gorhom/bottom-sheet`, which needs the real
  Reanimated at import time. Mock `@/shadecn/ui/drawer` in the test — including the
  `useDrawerNativeActivity` / `useDrawerSetOpen` / `useDrawerClose` hooks that `DateTimeField` calls.
- **No JSX inside a `jest.mock` factory.** Babel registers named components via an out-of-scope
  helper and the factory is rejected; use `React.createElement`.
- **Native modules must be mocked** (`expo-maps`, `expo-location`, `expo-crypto`). An Expo module
  auto-mock can return `undefined`, and `toHaveBeenCalledWith` ignores undefined keys — which
  makes an assertion pass **vacuously**. Mock the module explicitly and assert the real value.
- **Prefer `mockImplementation(() => Promise.reject(...))` over `mockRejectedValue`.** The latter
  builds the rejected promise eagerly; if unconsumed it surfaces as an unhandled rejection inside
  the _next_ test.
- After writing a test for non-trivial logic, **break the code and confirm the test fails.** A test
  that passes either way is worse than no test.

## Native Modules and Builds

- Adding a native dependency means **Expo Go no longer works** — a development build is required.
- **Gradle autolinks new Expo modules, but it does not re-run config plugins.** After changing
  `app.json` plugins or `app.config.ts`, run `pnpm exec expo prebuild -p android` or the generated
  `AndroidManifest.xml` keeps its old permissions and metadata indefinitely. A stale manifest looks
  exactly like a working build until the feature crashes.
- `android/` and `ios/` are generated and gitignored; never hand-edit them.
- Native views can be strict about props: passing `undefined` is not the same as omitting a prop.
  Spread conditionally rather than passing `undefined`.
- Guard optional native UI so a missing module degrades to a fallback instead of taking the screen
  down. React error boundaries catch JS throws only — a native crash needs correct configuration.
- See `SETUP.md` for the development-build and API-key steps.

## Definition of Done

Before reporting work complete:

1. `pnpm check` (lint + typecheck) and `pnpm test` pass — the same gates `pre-push` and CI run.
2. No `as` type assertion added without a comment explaining why no safer narrowing works.
3. New user-visible strings are translated; new endpoints are exported from `src/api/index.ts`.
4. `graphify update .` run if code changed.
5. **Anything touching native modules, permissions, or platform UI is verified on a device.**
   Say plainly what was verified and what was not — a green suite is not evidence that a native
   feature works.

## OpenSpec

Non-trivial features are planned in `openspec/` before implementation: `proposal.md` (why),
`specs/<capability>/spec.md` (requirements and scenarios), `design.md` (how, with alternatives),
`tasks.md` (ordered checklist).

- `openspec list` shows active changes; `openspec validate <change>` checks structure.
- Tick tasks in `tasks.md` as they land, and keep the specs true to what shipped — if the
  implementation diverges, update the spec in the same change rather than letting it drift.
- Archived specs live in `openspec/specs/`; check them before assuming behaviour is undefined.

## Git Hooks

- `pre-commit`: runs lint-staged (ESLint + Prettier on staged files)
- `commit-msg`: validates Conventional Commit messages with commitlint
- `pre-push`: runs `pnpm check`

## LLM Documentation References

- **Unistyles**: https://www.unistyl.es/llms-full.txt
- **Expo**: https://docs.expo.dev/llms-full.txt

## Documentation Automation

- Follow `docs/documentation-rules.md` when writing or updating docs.
- Keep automated docs changes minimal, scoped to the PR, and grounded in repository files.
- Do not edit generated files such as `src/api/generated/`.
- When a shared primitive in `src/shadecn/ui/` gains or loses a variant, prop, or export,
  update `docs/reusable-ui.md` in the same change.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, invoke the `skill` tool with `skill: "graphify"` before doing anything else.

Rules:

- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
- Always use Context7 when I need library/API documentation, code generation, setup or configuration steps without me having to explicitly ask.
