# Smart Pet Care App

Cross-platform Expo app for smart pet care workflows.

## Get started

1. Install dependencies

   ```bash
   pnpm install
   ```

2. Set up environment variables

   ```bash
   cp .env.example .env
   ```

   Set `EXPO_PUBLIC_API_URL` to the backend host the app should call (e.g.
   `https://smart-pet-care.duckdns.org`). Without it, API requests use relative
   URLs and fail. See [Environment variables](#environment-variables) for the full list.

3. Start the app

   ```bash
   pnpm start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Environment variables

Configured via `.env` (gitignored). Copy `.env.example` to get started.

| Variable                                | Used by          | Purpose                                                                        |
| --------------------------------------- | ---------------- | ------------------------------------------------------------------------------ |
| `EXPO_PUBLIC_API_URL`                   | App runtime      | Backend host the app calls. Set in `src/api/config.ts` as the axios `baseURL`. |
| `OPENAPI_USERNAME` / `OPENAPI_PASSWORD` | `pnpm api:fetch` | Basic-auth creds for the spec endpoint (maintainer-only).                      |
| `OPENAPI_URL`                           | `pnpm api:fetch` | Optional override for the spec URL.                                            |

`EXPO_PUBLIC_*` variables are inlined by Expo at build time and shipped in the client bundle — never put secrets in them.

## API docs and generated client

The backend exposes Scalar docs at:

```text
https://smart-pet-care.duckdns.org/scalar/v1
```

Scalar loads the OpenAPI spec from:

```text
https://smart-pet-care.duckdns.org/openapi/v1.json
```

The app keeps a local copy at `docs/openapi.json`. Refresh it with backend basic auth credentials:

```bash
pnpm api:fetch   # reads OPENAPI_USERNAME / OPENAPI_PASSWORD from .env
```

Generate the typed Axios + React Query client from `docs/openapi.json`:

```bash
pnpm api:generate
```

Refresh the spec and regenerate the client in one command:

```bash
pnpm api:update   # reads OPENAPI_USERNAME / OPENAPI_PASSWORD from .env
```

Generated API code is written to:

```text
src/api/generated/index.ts
```

### The generated client is not committed

`src/api/generated/` is gitignored. It is **regenerated automatically on `pnpm install`**
(via the `postinstall` script) from the committed `docs/openapi.json` spec, so a fresh
clone produces the client without any credentials. You only need `api:fetch` credentials
to pull a newer spec.

If the generated client is ever missing (e.g. install ran without devDependencies), recreate it with:

```bash
pnpm api:generate
```

Do not edit generated files manually. Update the backend spec, refresh `docs/openapi.json`, then rerun generation.

## Team docs

- PR review guidelines: `docs/pr-review.md`
- Gemini PR automation: `docs/gemini-pr-automation.md`

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
