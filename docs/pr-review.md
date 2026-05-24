# PR Review Guidelines (Frontend)

These rules apply to the React Native / Expo frontend in this repo (TypeScript strict, Expo Router, TanStack React Query, React Hook Form + Zod, `react-native-unistyles`).

## Before requesting review (author)

- Keep PRs small and focused (single concern; avoid drive-by refactors).
- Include a clear description: **why**, **what changed**, and **how to test**.
- Add screenshots/screen recordings for UI changes (iOS + Android where relevant).
- Call out risk areas and edge cases (offline, slow network, permissions, auth, empty states).
- Ensure `npm run lint` is clean and types pass locally.

## What reviewers should check (reviewer)

- Does the change match the intended behavior and product requirements?
- Is the code consistent with project conventions (kebab-case files, import sorting, named exports for utilities/hooks)?
- Are new states handled (loading, empty, error) and are errors actionable for users?
- Is the UX OK across device sizes, safe areas, dark/light backgrounds, and keyboard interactions?
- Is performance acceptable (lists, expensive computations, re-renders, animations)?
- Are accessibility basics covered (labels, roles, hit targets, focus order)?
- No secrets/keys added; no logging of PII; network calls are safe and cancellable.

## React Native / Expo best practices

- Prefer composition over deep prop drilling; introduce small reusable components when repetition is clear.
- Avoid inline object/array props in hot render paths (especially list items); keep callbacks stable where it matters.
- Lists: use virtualization (`FlatList`) correctly (stable `keyExtractor`, avoid anonymous render functions when heavy).
- Handle safe areas and keyboard: use `SafeAreaView` / insets and `KeyboardAvoidingView` where needed.
- Avoid `useEffect` for derived UI state; derive from props/state directly.
- Avoid putting navigation logic inside deeply nested components unless it’s a deliberate boundary.

## Styling rules (`react-native-unistyles`)

- Use `StyleSheet.create((theme) => ({ ... }))` and prefer theme tokens:
  - colors: `theme.palette.*`
  - spacing: `theme.spacing(n)`
  - radii: `theme.borderRadius.*`
  - text sizes: `theme.fontSize.*`
  - shadows: `theme.shadows.*`
  - fonts: `theme.fonts.*`
- Avoid hard-coded colors/sizes unless there’s a strong reason (and document it).
- Keep styles static (module scope) unless they truly depend on props; for prop-driven styling, minimize dynamic objects and keep them close to the usage.
- Prefer style composition (`[styles.base, condition && styles.modifier]`) over deeply nested ternaries.
- Don’t mix multiple styling systems in one component (keep it Unistyles-first).

## UI Components (`src/shadecn/ui/`)

- New reusable UI components (e.g., `Button`, `Dialog`, `Drawer`, `Input`) are located in `src/shadecn/ui/`.
- These components follow a shadcn-like API and integrate with `react-native-unistyles` for styling.
- Shared component and icon usage is documented in `docs/reusable-ui.md`.
- When creating new UI components, consider if they fit into this pattern and contribute to the shared component library.
- Ensure new components have clear props, are accessible, and handle various states (e.g., disabled, loading).

## Forms (`react-hook-form` + Zod)

- Use Zod as the source of truth for validation; prefer `zodResolver` with inferred types.
- Always provide `defaultValues` (and keep them stable) to avoid uncontrolled → controlled warnings.
- Use `Controller`/`useController` for custom inputs; keep inputs “dumb” (controlled by props) and push form logic to the form layer.
- Avoid excessive `watch()` usage; prefer `useWatch` scoped to specific fields.
- Server errors: map to field errors when possible (`setError`) and show a non-field fallback message.
- Disable submit while submitting; prevent double submits; handle slow networks gracefully.

## Data fetching (`@tanstack/react-query`)

- Don’t fetch in `useEffect`; use `useQuery` / `useInfiniteQuery` / `useMutation`.
- Keep query keys stable and structured (arrays, no ad-hoc string concatenation).
- Consider caching behavior (`staleTime`, `gcTime`, `enabled`) and loading states.
- Mutations should invalidate or update caches intentionally (avoid “refetch everything” patterns).
- Create `QueryClient` once (don’t recreate it on every render).

## TypeScript / API usage

- Prefer explicit types for public boundaries (props, hooks returns, API responses).
- Avoid `any`; if unavoidable, isolate and document it.
- Keep platform-specific behavior explicit (`Platform.select`, `*.ios.tsx`, `*.android.tsx`) and reviewed.
