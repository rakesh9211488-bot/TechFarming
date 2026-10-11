# Verification evidence

The supported story is: website action → API validation/authentication → account-scoped data → structured response → rendered website state.

## Local results

| Check | Result | Practical limit |
| --- | --- | --- |
| Backend tests | 18 passed, 0 failed | Uses a test repository for API behavior |
| MySQL integration test | Pending CI | No local MySQL server is available here |
| Frontend production build | Passed | Not a production hosting deployment |
| Browser signup/login/logout | Passed | Test-only in-memory repository |
| Browser session after refresh | Passed | MySQL persistence is checked separately in CI |
| Browser administrator job publishing | Passed | Test administrator fixture |
| Browser catalog search | Passed | Existing sample catalog |
| Browser device registration/report display | Passed | Synthetic test reading, not physical hardware |
| Mobile layout | Passed at 390 px | No horizontal overflow in the tested home page |
| Browser JavaScript errors | 0 in tested journeys | Cannot guarantee every possible environment |
| npm dependency audits | 0 reported vulnerabilities | Point-in-time audit, not a security guarantee |

## Automated verification

`.github/workflows/verify.yml` installs from lockfiles, starts an isolated MySQL 8.4 service, applies migrations twice, runs backend tests including MySQL persistence, builds the frontend and runs Playwright browser checks. Its database credentials are disposable public CI fixture values, not application secrets.

The MySQL integration test covers signup, uniqueness, persisted sessions through a fresh repository instance, administrator jobs, device reporting and logout. Browser tests cover the normal account journey and mobile navigation using the real API and CI database.

The workflow must complete successfully before claiming those database-backed checks passed. Current GitHub results should be reviewed directly in the pull request.

## Still needs physical or production verification

Sensor wiring and calibration, rover safety and command handling, real device network behavior, production TLS/proxy configuration, backups/restore drills and long-term telemetry storage. Commerce and image-processing features are explicitly unavailable rather than simulated as completed integrations.
