# Smart Pet Care App

Cross-platform Expo app for smart pet care workflows.

## Get started

1. Install dependencies

   ```bash
   pnpm install
   ```

2. Start the app

   ```bash
   pnpm start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

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
OPENAPI_USERNAME=admin OPENAPI_PASSWORD='petPass$' pnpm api:fetch
```

Generate the typed Axios + React Query client from `docs/openapi.json`:

```bash
pnpm api:generate
```

Refresh the spec and regenerate the client in one command:

```bash
OPENAPI_USERNAME=admin OPENAPI_PASSWORD='petPass$' pnpm api:update
```

Generated API code is written to:

```text
src/api/generated/index.ts
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
