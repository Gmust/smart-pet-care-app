# Smart Pet Care App

## Project Overview

Cross-platform mobile app (iOS, Android, Web) built with Expo and React Native. Uses Expo Router for file-based navigation.

## Tech Stack

- **Framework**: Expo ~54 / React Native 0.81 (New Architecture enabled)
- **Navigation**: Expo Router (file-based, typed routes)
- **State/Data**: TanStack React Query
- **Forms**: React Hook Form + Zod
- **Styling**: react-native-unistyles
- **HTTP**: Axios
- **Language**: TypeScript (strict)

## Project Structure

```
app/              # Expo Router pages (file-based routing)
  (tabs)/         # Tab navigator screens
  _layout.tsx     # Root layout
components/       # Shared UI components
  ui/             # Primitive UI components
constants/        # App-wide constants (theme, colors, fonts)
hooks/            # Custom React hooks
assets/           # Images, fonts, icons
styles/           # Unistyles theme config (palette, theme, config)
```

## Commands

Package manager: **pnpm** (with `node-linker=hoisted` in `.npmrc` for RN/Metro compatibility).

```bash
pnpm start          # Start Expo dev server
pnpm ios            # Run on iOS simulator
pnpm android        # Run on Android emulator
pnpm web            # Run in browser
pnpm lint           # ESLint
pnpm typecheck      # TypeScript check
pnpm test           # Jest
pnpm check          # Lint + typecheck
```

## Code Conventions

- File names: `kebab-case.tsx`
- Components: PascalCase, one per file
- Hooks: `use-*` filename, `use*` export
- Styles: defined with `StyleSheet.create` from `react-native-unistyles`, colocated in component file or `styles/` directory
- Imports: sorted via `eslint-plugin-simple-import-sort`
- No default exports for utilities/hooks — named exports only
- Components may use default exports (Expo Router requirement for pages)

## Unistyles

Theme is configured in `styles/config.ts`. Access via:

```tsx
import { StyleSheet } from "react-native-unistyles";

const styles = StyleSheet.create((theme) => ({
  container: { backgroundColor: theme.palette.white },
}));
```

## Git Hooks

- `pre-commit`: runs lint-staged (ESLint + Prettier on staged files)
- `commit-msg`: validates Conventional Commit messages with commitlint
- `pre-push`: runs `pnpm check`

## LLM Documentation References

- **Unistyles**: https://www.unistyl.es/llms-full.txt
- **Expo**: https://docs.expo.dev/llms-full.txt

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, invoke the `skill` tool with `skill: "graphify"` before doing anything else.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
