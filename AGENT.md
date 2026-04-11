# Agent Guidelines

## Behavior

- Always read existing files before editing them
- Prefer editing existing files over creating new ones
- Keep changes focused — do not refactor surrounding code unless asked
- Do not add comments or docstrings to code you didn't write
- Do not add error handling for impossible cases

## Running Commands

```bash
npm run lint        # Check for lint errors
npx tsc --noEmit    # Type-check without compiling
```

## Adding Dependencies

- Runtime deps: `npm install <pkg>`
- Dev-only deps: `npm install -D <pkg>`
- After installing native modules, remind the user to rebuild (`expo run:ios` / `expo run:android`)

## Styling

- Use `react-native-unistyles` — never inline styles unless trivial (e.g. `flex: 1`)
- Theme access via `StyleSheet.create((theme) => ({ ... }))` callback form
- Palette and spacing live in `styles/theme.ts`

## Navigation

- Pages live in `app/` — Expo Router maps the file tree to routes
- Shared layouts use `_layout.tsx`
- Use `expo-router` hooks (`useRouter`, `useLocalSearchParams`) — not `@react-navigation` directly

## Forms

- React Hook Form + Zod resolver for all forms
- Define schemas with `z.object(...)`, infer types with `z.infer<typeof schema>`

## Data Fetching

- TanStack React Query for all server state
- Custom hooks per resource (e.g. `usePets`, `usePetById`)
- Axios instance configured centrally — do not call `axios` directly in components

## TypeScript

- Strict mode is on — no `any`, no `@ts-ignore` unless absolutely necessary
- Prefer `type` over `interface` for object shapes

## LLM Documentation References

- **Unistyles**: https://www.unistyl.es/llms-full.txt
- **Expo**: https://docs.expo.dev/llms-full.txt
