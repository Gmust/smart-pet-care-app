# Thesis Diagram Sources

## Status

These PlantUML files are evidence-grounded working sources for the diagrams
required by the CDV Informatics thesis guide. They are not final figures.

The mobile-client elements come from the current repository and committed
OpenAPI snapshot. The backend and AI-service elements were reconciled on
26 July 2026 with `smart-pet-care-api` main through `6d79951` and
`pet-diseases-classifier` main `682dfb5` plus unified-chat feature revision
`74019ea`. Final deployed versions and runtime results remain pending.

## Files

- `system-components.puml` - component and ownership boundaries across the
  mobile client, C# backend, and Python AI service.
- `deployment.puml` - repository-supported deployment definitions and explicit
  final-release evidence boundaries.
- `use-cases.puml` - account and pet-care use cases with stable working IDs.
- `assistant-platform-use-cases.puml` - assistant and connectivity use cases;
  together with `use-cases.puml`, it forms the complete provisional use-case
  view.
- `domain-class.puml` - conceptual classes and relations derived from the
  committed OpenAPI response schemas; this is not a persistence model.
- `auth-refresh-sequence.puml` - startup restoration and `401` refresh path.
- `notification-status-sequence.puml` - Android FCM token and reminder-tap
  workflow.
- `assistant-send-retry-sequence.puml` - consent, session bootstrap, send, and
  retry behavior.

## Required review

Before rendering final figures:

1. Volodymyr and Kseniia must confirm the final backend image, host, database
   migration state, interfaces, and runtime record.
2. Illia must confirm whether AI revision `74019ea` was merged, tagged, or
   deployed and provide the model-release and runtime evaluation evidence.
3. Anastasia Leonova and Illia must confirm that the user flows match the final
   Android interface.
4. Every actor, component, message, and protocol must be checked against the
   final OpenAPI contract and release.
5. The supervisor must approve diagram scope and notation.

## Final-figure rules

- Export each approved diagram at readable resolution.
- Use the thesis-language caption format.
- Add a source statement such as `(source: authors' own work)`.
- Refer to every diagram in the body text.
- Record the diagram in the list of figures.
- Do not leave notes containing `CONFIRM` or `EVIDENCE REQUIRED` in the final
  export.

## Reproducible working-draft render

The `.png` and `.svg` files next to the PlantUML sources are working-draft
exports, with the three service-boundary figures regenerated on 26 July 2026.
The renderer was the official PlantUML
`1.2026.3` JAR with SHA-256
`53af6760d96bb2737e5e4386e832b46339fc29dec74f412d7c12db7c30db8ec4`.
The embedded Smetana layout was selected because Graphviz was not installed in
the verification environment.

From this directory, the validation/export command is:

```bash
env JAVA_TOOL_OPTIONS=-Djava.awt.headless=true \
  java -jar /private/tmp/plantuml-1.2026.3.jar \
  -Playout=smetana --no-error-image --format png \
  use-cases.puml assistant-platform-use-cases.puml domain-class.puml \
  system-components.puml deployment.puml \
  auth-refresh-sequence.puml notification-status-sequence.puml \
  assistant-send-retry-sequence.puml
```

The JAR path is environment-specific and is not committed. Re-download the
same official release or record and review a newer renderer before reproducing
the final exports. Successful compilation proves PlantUML syntax only; it does
not verify the provisional backend or AI-service facts.
