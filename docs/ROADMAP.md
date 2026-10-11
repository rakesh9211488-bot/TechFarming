# Development roadmap

## 1. Repository foundation

Document the current prototype, preserve contributor history, remove generated dependencies from tracked source and keep credentials outside Git.

## 2. Secure and reproducible backend

- Revoke the previously exposed service-account key.
- Move configuration to validated environment variables with a placeholder example file.
- Build database migrations matching the account, products and jobs models.
- Implement sessions, authorization, safe response fields and request validation.
- Remove password and personal-data logging; restrict CORS.
- Repair product persistence, job creation and Python invocation.

Acceptance: a clean checkout can install, migrate and run using documented local configuration; account and authorization tests pass.

## 3. Complete website journeys

Validate registration, login, dashboard, product browsing and jobs flows. Add clear loading, empty and error states, accessible controls and responsive layouts. Audit dependencies before deployment.

Acceptance: documented browser tests demonstrate each supported journey without manual database edits.

## 4. Real IoT integration

Confirm hardware, implement sensor drivers and calibration, add device credentials and telemetry persistence, then display real readings with timestamps and units.

Acceptance: a real device submits validated readings and reconnects reliably; rejected or stale readings are visible as such.

## 5. Rover and image experiments

Develop these independently from the website. Add command safety, emergency stopping and recorded hardware tests. Validate image models against a documented dataset and report their limitations.

## 6. Deployment

Choose hosting only after the earlier acceptance checks pass. Add automated checks, least-privilege credentials, monitoring, database backups and a tested restore procedure.
