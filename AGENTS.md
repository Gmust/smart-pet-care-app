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

```bash
npm run start       # Start Expo dev server
npm run ios         # Run on iOS simulator
npm run android     # Run on Android emulator
npm run web         # Run in browser
npm run lint        # ESLint
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

## LLM Documentation References

- **Unistyles**: https://www.unistyl.es/llms-full.txt
- **Expo**: https://docs.expo.dev/llms-full.txt
