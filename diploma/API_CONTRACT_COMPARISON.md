# Smart Pet Care App - API Contract Comparison

## Purpose and scope

This record compares the mobile repository's committed OpenAPI snapshot with
the authenticated OpenAPI description served by the configured backend on
25 July 2026. It is a contract-level check only.

The comparison can establish that the two machine-readable descriptions differ.
It does not prove that an endpoint behaves correctly, that the mobile
application exposes it, or that the live service was deployed from a particular
backend revision.

## Compared artifacts

| Artifact                                    | Location                               | SHA-256                                                            |          Size |
| ------------------------------------------- | -------------------------------------- | ------------------------------------------------------------------ | ------------: |
| Committed mobile snapshot                   | `docs/openapi.json`                    | `fa597ae48cd99e18771c6ed8bc5b4980d730cfc00719d5c54011cd2c3fb27c1d` | 153,890 bytes |
| Live contract, fetched to temporary storage | configured `/openapi/v1.json` endpoint | `01f3236acad6bc7cde933812f1b011abe4c7ac71d58bf9effa779ed054d981d9` | 184,984 bytes |

The live artifact was fetched at `2026-07-25T15:30:33+0200` to
`/private/tmp/smart-pet-care-openapi-live.json`. It was not copied into the
repository. The fetch used locally configured maintainer credentials; no
credential value, authorization header, token, or response containing personal
data was printed or retained in the thesis workspace.

## Reproducible method

1. Inspect `scripts/fetch-openapi.mjs` to confirm the configured endpoint,
   authentication mechanism, validation checks, and output transformation.
2. Request the Scalar and OpenAPI URLs without credentials. Both returned
   HTTP 401, confirming that the documentation surface is not public.
3. Confirm only the presence, not the values, of `OPENAPI_USERNAME` and
   `OPENAPI_PASSWORD`.
4. Run the repository fetcher with `OPENAPI_OUTPUT` redirected to a temporary
   path.
5. Validate that the result contains an OpenAPI version, paths, and the Bearer
   security scheme.
6. Compare metadata, path/method pairs, schemas, tags, and the changed shared
   operation structurally.

The fetcher normalizes the downloaded document before writing it: it assigns
the Bearer scheme globally and marks the six known registration, login,
refresh, and Google OAuth operations as public. The same generation method is
used for the committed snapshot, so the two written artifacts are comparable.
The recorded live hash is the hash of this normalized output, not of the raw
HTTP response body.

## Comparison result

| Measure                     | Committed snapshot | Live description | Difference |
| --------------------------- | -----------------: | ---------------: | ---------: |
| OpenAPI paths               |                 34 |               38 |         +4 |
| HTTP operations             |                 50 |               57 |         +7 |
| Component schemas           |                 60 |               70 |        +10 |
| Removed paths or operations |                  - |                - |          0 |
| Removed schemas             |                  - |                - |          0 |

The OpenAPI version (`3.1.1`), API title (`Smart Pet Care API`), API version
(`v1`), server declarations, and global security declaration are unchanged.
The live description adds the `JournalEntry` and `SymptomCatalog` tags.

### Added operations

- `GET /api/pets/{petId}/journal`
- `POST /api/pets/{petId}/journal`
- `GET /api/pets/{petId}/journal/{entryId}`
- `PATCH /api/pets/{petId}/journal/{entryId}`
- `DELETE /api/pets/{petId}/journal/{entryId}`
- `GET /api/symptoms`
- `GET /api/symptoms/{id}`

### Added schemas

- `CreateJournalEntryDto`
- `JournalEntryResponseDto`
- `JournalEntrySeverity`
- `JournalEntryType`
- `PatchFieldOfJournalEntrySeverity`
- `PatchFieldOfJournalEntryType`
- `PatchFieldOfListOfSymptomType`
- `PatchJournalEntryDto`
- `SymptomCatalogItemDto`
- `SymptomType`

### Changed existing contract

`GET /api/pets/{petId}/health-records` adds an optional `symptom` query
parameter referencing `SymptomType`.

The existing health-record schemas add symptom-related contract elements:

- `CreateHealthRecordDto` and `HealthRecordResponseDto` add an optional
  `symptoms` collection;
- `HealthRecordType` and `PatchFieldOfHealthRecordType` add the `Symptom`
  enumeration value;
- `PatchHealthRecordDto` adds a patchable `symptoms` field.

No previously described operation or schema was removed.

## Interpretation and thesis boundary

The evidence demonstrates additive drift between the contract currently
committed to the mobile repository and the contract returned by the configured
backend. The generated client present during the check contains no journal or
symptom-catalog symbols, which is consistent with its generation from the older
committed snapshot.

An independent temporary regeneration with Orval 8.14.0 later confirmed that
the committed generated client is byte-for-byte reproducible from that older
snapshot. Both generated files have SHA-256
`6116b5bab5e86f7e7abbeb8c3fa1df66554127f8995113a7d520e2f398f43aa2`.
This narrows the cause of the missing symbols to the selected contract snapshot,
not unexplained manual drift in the generated file. The exact method and
limitations are recorded in `OPENAPI_CLIENT_REPRODUCIBILITY.md`.

This result must not be rewritten as any of the following claims without
additional evidence:

- the journal or symptom catalogue is implemented in the evaluated mobile UI;
- the added endpoints pass functional, authorization, validation, or
  performance tests;
- the live backend is production-ready;
- the responsible backend author or deployment revision is known;
- symptom data provides diagnosis or clinically validated advice.

## Required reconciliation

Before freezing the thesis-evaluated release:

1. Volodymyr and Ksenia identify the backend revision and deployment that
   produced the live contract.
2. The team decides whether journal and symptom functionality belongs to the
   approved thesis scope.
3. If it is in scope, update the committed snapshot through
   `pnpm api:fetch`, regenerate through `pnpm api:generate`, review the mobile
   integration, and add requirement and test records.
4. If it is out of scope, preserve the evaluated older contract explicitly and
   document why the live additive surface is excluded.
5. Repeat this comparison against the final backend deployment and record the
   mobile revision, backend revision, fetch time, normalized contract hash, and
   reviewer.
6. Do not overwrite `docs/openapi.json` until the team has approved the scope
   and reviewed the generated-client impact.

## Current status

**Contract drift found; reconciliation pending.** This is useful release and
thesis evidence, but it is not a passed API integration or backend functional
test.
