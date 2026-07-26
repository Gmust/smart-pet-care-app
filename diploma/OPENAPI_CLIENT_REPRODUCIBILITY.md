# Smart Pet Care App - OpenAPI Client Reproducibility Check

## Result

The TypeScript Axios client regenerated from the committed
`docs/openapi.json` snapshot on 25 July 2026 was byte-for-byte identical to the
committed `src/api/generated/index.ts` file.

This verifies current-snapshot generation reproducibility. It does not select
the final backend contract, prove endpoint behavior, or pass final Gate A-02,
which must be repeated from a clean checkout of the approved release.

## Identified environment

| Item                     | Value                                                               |
| ------------------------ | ------------------------------------------------------------------- |
| Observation time (UTC)   | `2026-07-25T14:38:56Z`                                              |
| Git revision             | `0d5e33b091e9582a7075786c0b9cf724510825f9`                          |
| Operating system         | macOS `15.7.7` (`24G720`)                                           |
| Node.js                  | `v24.18.0`                                                          |
| Declared package manager | `pnpm@11.5.1`                                                       |
| Orval                    | `8.14.0`                                                            |
| Orval mode/client        | `single` / `axios`                                                  |
| Worktree qualification   | Not clean; `pnpm-lock.yaml` contained a pre-existing user change    |
| Protected sources        | `docs/openapi.json` and `src/api/generated/index.ts` remained clean |

## Inputs and outputs

| Artifact                      | SHA-256                                                            | Lines |   Bytes |
| ----------------------------- | ------------------------------------------------------------------ | ----: | ------: |
| Committed `docs/openapi.json` | `fa597ae48cd99e18771c6ed8bc5b4980d730cfc00719d5c54011cd2c3fb27c1d` |     - | 153,890 |
| Committed generated client    | `6116b5bab5e86f7e7abbeb8c3fa1df66554127f8995113a7d520e2f398f43aa2` | 1,252 |  34,534 |
| Temporary regenerated client  | `6116b5bab5e86f7e7abbeb8c3fa1df66554127f8995113a7d520e2f398f43aa2` | 1,252 |  34,534 |

The temporary output was written to
`/private/tmp/cdv-openapi-repro/index.ts`, outside the repository. No generated
source was overwritten.

## Reproduction procedure

The repository configuration identifies `docs/openapi.json` as the input,
`src/api/generated/index.ts` as the normal output, and Axios as the client. To
avoid modifying the normal output, the same installed generator was invoked
with an explicit temporary destination:

```bash
node_modules/.bin/orval \
  --input docs/openapi.json \
  --output /private/tmp/cdv-openapi-repro/index.ts \
  --client axios \
  --mode single \
  --fail-on-warnings
```

Orval exited successfully without a warning. The committed and temporary
clients were then compared:

```bash
cmp -s \
  src/api/generated/index.ts \
  /private/tmp/cdv-openapi-repro/index.ts

diff -u \
  src/api/generated/index.ts \
  /private/tmp/cdv-openapi-repro/index.ts
```

`cmp` returned exit code 0 and `diff` produced no output. A fresh
`pnpm typecheck` invocation then completed with exit code 0.

## Interpretation

The evidence supports these bounded statements:

- the committed client can be reproduced deterministically from the committed
  snapshot with the installed Orval 8.14.0 configuration;
- the regenerated output is not merely semantically similar: its bytes, line
  count, size, and SHA-256 match;
- the current generated client passes the repository's strict TypeScript
  check.

The evidence does not support these broader claims:

- that the committed snapshot is the approved final contract;
- that the configured live backend matches the committed snapshot;
- that any generated operation behaves correctly at runtime;
- that authorization, validation, persistence, performance, or deployment is
  correct;
- that the current dirty worktree is an immutable release.

## Final-release closure

After Volodymyr and Ksenia identify the producing backend revision and the team
approves the evaluated contract:

1. start from a clean checkout of the final mobile revision;
2. install the frozen dependency graph;
3. regenerate to a temporary destination with the locked Orval version;
4. compare the complete generated tree and record hashes;
5. run strict type checking and the approved lint/test gates;
6. preserve command output, environment, executor, reviewer, and time;
7. link the result to the final backend and mobile release identifiers.

Until those steps are complete, this record is a passed current-snapshot
checkpoint, not a passed final-release Gate A-02 result.
