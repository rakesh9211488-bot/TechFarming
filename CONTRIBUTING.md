# Contributing

Read the setup, architecture and roadmap first. Make focused branches and explain the changed behavior, validation and limits in each pull request.

- Preserve existing contributor attribution and history.
- Use npm ci in Server and client, preserving both lockfiles.
- Never commit credentials, database dumps, real account data or device Wi-Fi passwords.
- Keep environment files private; commit placeholder examples only.
- Distinguish sample catalog data, synthetic test readings and physical measurements.
- Keep unsupported integrations visibly unavailable until implemented and verified.
- Add meaningful tests for changed behavior and run the full relevant user journey.

```powershell
npm --prefix Server test
npm --prefix client run build
```

MySQL integration tests and browser verification run in disposable CI databases. Do not point those fixtures at real user data. Read docs/VERIFICATION.md for what each check proves.

No new project-wide license is introduced by this update. Dependency licenses do not establish an exclusive project copyright claim.
