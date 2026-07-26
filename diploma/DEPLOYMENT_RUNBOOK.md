# Smart Pet Care App - Deployment and Release Evidence Runbook

## Status

This runbook describes deployment configuration visible in the mobile
repository on 25 July 2026 and defines the evidence needed for the diploma
thesis. It does not prove that an EAS build, over-the-air update, backend
deployment, or store release succeeded.

Never store credentials, private configuration files, access tokens, signing
material, or unredacted personal data in this directory or in the thesis.

## Repository-defined baseline

| Item                  | Repository evidence      | Current declaration                         |
| --------------------- | ------------------------ | ------------------------------------------- |
| Application package   | `package.json`           | `smart-pet-care-app`, version `1.0.0`       |
| JavaScript runtime    | `package.json`, `.nvmrc` | Node.js `24.18.0`                           |
| Package manager       | `package.json`           | pnpm `11.5.1`                               |
| Mobile framework      | `package.json`           | Expo `~56.0.4`, React Native `0.85.3`       |
| Entry point           | `package.json`           | `src/index.ts`                              |
| Android package       | `app.json`               | `com.anonymous.smartpetcareapp`             |
| iOS bundle identifier | `app.json`               | `com.anonymous.smart-pet-care-app`          |
| Deep-link scheme      | `app.json`               | `smartpetcareapp`                           |
| EAS runtime policy    | `app.json`               | Fingerprint-based runtime version           |
| EAS project           | `app.json`               | Project and owner identifiers are committed |

The identifiers above are technical configuration, not confirmation that the
names are suitable for the final university demonstration or store release.

## Configuration boundaries

### Public mobile configuration

The `.env.example` file defines:

- `EXPO_PUBLIC_API_URL`;
- web, iOS, and Android Google OAuth client identifiers.

Expo public variables are part of the client build and must not contain
secrets. The final evidence should record only which variables were configured,
the target environment, and a redacted or hashed configuration identifier.

### Maintainer-only configuration

The same example defines credentials and an optional URL used to fetch the
OpenAPI description. Those values support a maintainer operation and must not
be included in the mobile bundle, screenshots, logs, or thesis.

### Firebase Android configuration

Android notification registration requires a Firebase Android client file.
For EAS, `app.config.ts` accepts its temporary path through
`GOOGLE_SERVICES_JSON`. For local development, the ignored file can be
referenced explicitly when prebuilding or running Android. Backend Firebase
service-account credentials remain a server-side responsibility.

## Local reproducible-build procedure

1. Check out the final identified Git revision into a clean directory.
2. Install the Node.js and pnpm versions declared by the repository.
3. Run `pnpm install --frozen-lockfile`.
4. Generate the client from the committed contract and confirm that no
   unauthorized manual generated-file edits exist.
5. Create a local `.env` from `.env.example` and populate only the intended
   environment values.
6. Supply the Firebase Android configuration through the documented ignored
   path or environment-file mechanism.
7. Run `pnpm lint`, `pnpm typecheck`, and the full Jest suite.
8. Produce an Android JavaScript/asset export as a Metro bundling check.
9. Build and install a native development, preview, or release artifact.
10. Execute the final device scenario protocol and record the artifact,
    backend, service, device, date, and executor.

Expo Go is not sufficient evidence for Google native sign-in or the project's
FCM integration. Those paths require a native build.

## EAS build and update model

`eas.json` defines:

- a development profile using an internal Android APK and development client;
- a preview profile using an internal Android APK;
- a production profile with automatic application-version incrementing.

The preview build workflow runs on manual request or when native-affecting
configuration files change on the `preview` branch. It installs dependencies,
generates the API client, configures EAS, and requests a non-interactive Android
preview build.

The preview update workflow handles other pushes to the `preview` branch and
publishes a JavaScript/asset update. Native dependencies, native configuration,
and incompatible runtime changes require a new native build. The committed
fingerprint runtime policy supports this boundary, but a successful update and
rollback still require EAS run evidence.

## Pull-request quality workflow

The pull-request CI workflow declares these gates:

1. frozen-lockfile installation;
2. generated API client;
3. lint;
4. strict TypeScript checking;
5. Jest;
6. Expo export for all configured platforms.

The workflow definition is evidence of intended automation. Only a named,
successful GitHub Actions run on the final revision proves that the gates ran
in CI.

## Current local deployment-related evidence

On 25 July 2026, at Git revision
`0d5e33b091e9582a7075786c0b9cf724510825f9` with a dirty working tree:

- `pnpm lint` completed with exit code 0;
- a broader `eslint . --max-warnings=0` run failed with one Prettier error in
  ignored generated `expo-env.d.ts`; repeating the broad diagnostic with an
  explicit `--ignore-pattern expo-env.d.ts` passed;
- `pnpm typecheck` completed with exit code 0;
- Orval 8.14.0 regenerated the committed OpenAPI client to temporary storage;
  the regenerated and committed files were byte-for-byte identical with
  SHA-256
  `6116b5bab5e86f7e7abbeb8c3fa1df66554127f8995113a7d520e2f398f43aa2`;
- 9 of 9 Jest suites and 79 of 79 tests passed;
- the latest standard Jest run reported delayed exit, while the latest
  `--detectOpenHandles` run identified no concrete handle; earlier full runs
  emitted timing-dependent React `act(...)` warnings;
- an Android-only Expo export completed, bundling 2,817 modules and 84 assets;
- the generated Hermes bundle occupied approximately 6.8 MiB on disk and had
  SHA-256
  `b4785f3588da7eab6f7e45c36745804c7d3df889b1b72b4f4fae32fbff34fb7d`.

The Expo export proves JavaScript/assets could be bundled in that environment.
It is not an APK, installation, native-linking, notification, OAuth, backend,
or production-deployment result.

### Current API-contract drift evidence

An authenticated read-only fetch on 25 July 2026 returned a valid normalized
OpenAPI description from the configured backend. Its SHA-256 is
`01f3236acad6bc7cde933812f1b011abe4c7ac71d58bf9effa779ed054d981d9`;
the committed `docs/openapi.json` SHA-256 is
`fa597ae48cd99e18771c6ed8bc5b4980d730cfc00719d5c54011cd2c3fb27c1d`.

The live description contains 4 additional paths, 7 additional operations, and
10 additional schemas, with no removals. The additions concern journal entries,
a symptom catalogue, and symptom support in health records. This establishes
contract drift only. It does not identify the backend revision, prove endpoint
behavior, or authorize overwriting the committed snapshot. The exact method,
differences, and reconciliation steps are recorded in
`diploma/API_CONTRACT_COMPARISON.md`.

The byte-identical temporary regeneration proves that the current committed
client corresponds reproducibly to the current committed snapshot. It does not
resolve which snapshot should be approved for the final release. See
`diploma/OPENAPI_CLIENT_REPRODUCIBILITY.md`.

## Release evidence record

For each thesis-evaluated artifact, record:

| Field               | Required value                                                 |
| ------------------- | -------------------------------------------------------------- |
| Release identifier  | Team-assigned immutable identifier                             |
| Mobile Git revision | Full commit hash and clean/dirty state                         |
| Lockfile digest     | SHA-256                                                        |
| OpenAPI contract    | Revision/date and SHA-256                                      |
| Backend release     | Repository revision, deployment identifier, and owner          |
| AI-service release  | Repository revision, configuration/model identifier, and owner |
| EAS build           | Build ID, profile, platform, runtime version, and result       |
| Android artifact    | APK/AAB SHA-256 and signing/build type                         |
| Configuration       | Environment name and redacted configuration record             |
| Device              | Model/emulator, Android/API level, architecture                |
| Execution           | Date/time, executor, reviewer, test-protocol version           |
| Evidence location   | Sanitized logs, screenshots, and result table                  |

## Open release-readiness questions

- Decide whether the live journal and symptom contract belongs to the
  thesis-evaluated scope, then reconcile or explicitly freeze the older
  committed snapshot.
- Confirm the final display name, Android package, iOS bundle identifier,
  owner, EAS project, version, and release channel.
- Justify or remove the declared Android `RECORD_AUDIO` permission if no
  evaluated feature uses microphone input.
- Confirm privacy-policy and terms-of-service URLs and the owner responsible
  for them.
- Supply successful EAS build/update/rollback records.
- Supply the backend and AI-service deployment topology, health checks,
  monitoring, backup, data-retention, and rollback procedures.
- Prove Google sign-in and FCM behavior in a configured native Android build.
- Repeat every automated gate from a clean final revision.
