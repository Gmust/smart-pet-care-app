# Smart Pet Care App

## Project Overview

Cross-platform mobile app built with Expo and React Native. Uses Expo Router for file-based navigation and TypeScript strict mode.

## Tech Stack

- Expo 54 / React Native 0.81
- Expo Router
- TanStack React Query
- React Hook Form + Zod
- react-native-unistyles
- Axios

## Project Structure

- `app/` and `src/app/`: Expo Router screens and layouts
- `components/` and `src/components/`: shared UI
- `hooks/`: custom hooks
- `styles/`: Unistyles theme setup
- `docs/`: team-facing documentation

## Commands

- `npm run start`
- `npm run ios`
- `npm run android`
- `npm run web`
- `npm run lint`
- `npm run typecheck`

## Conventions

- File names use `kebab-case.tsx`
- Components use PascalCase
- Hooks use `use-*` filenames and `use*` exports
- Prefer named exports for utilities and hooks
- Keep imports sorted
- Use `StyleSheet.create((theme) => ({ ... }))` from `react-native-unistyles`

## PR Review Guidance

- Review only the PR diff
- Focus on bugs, regressions, risky behavior, missing states, accessibility, performance, and missing tests
- Do not invent low-signal issues
- Be concise and specific

## Documentation Guidance

- Update `docs/` when the PR changes user-visible behavior, navigation, setup, scripts, reusable conventions, or contracts
- Prefer updating an existing doc over creating a new one
- Update `README.md` only for onboarding or workflow changes
