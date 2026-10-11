# TechFarming

An agriculture technology prototype combining a React website, an Express/MySQL backend, and experimental IoT and rover sketches.

Maintained by **Rakesh Siripaka**. Original contributor history and the `Collaborator` file are preserved.

## Project status

This is a development prototype. It is not ready for public deployment or autonomous hardware operation.

| Area | Current implementation | Remaining work |
| --- | --- | --- |
| Website | React pages for farming information, products, accounts and dashboards | Validate complete user journeys and accessibility |
| Backend | Express routes for users, sellers, jobs and products | Authentication sessions, mutation authorization, input validation and database migrations |
| Soil monitoring | Sensor sketch with placeholder readings | Implement sensor drivers, calibration and ingestion endpoint |
| Rover | Motor movement helpers and a draft control loop | Confirm hardware, command handling and safety controls |
| Image processing | Experimental Python scripts and an API route | Repair integration paths and validate model behavior |

## Repository map

| Directory | Purpose |
| --- | --- |
| `client/` | React frontend and its dependency lockfile |
| `Server/` | Express backend, Python experiments and Arduino sketches |
| `Database/` | Example SQL files; not a complete application migration set |
| `docs/` | Setup, architecture, hardware notes and implementation roadmap |

## Start here

- [Local setup](docs/SETUP.md)
- [Architecture and integration gaps](docs/ARCHITECTURE.md)
- [Hardware development notes](docs/HARDWARE.md)
- [Development roadmap](docs/ROADMAP.md)
- [Contributing](CONTRIBUTING.md)
- [Security and credential handling](SECURITY.md)

Dependencies are installed separately inside `client` and `Server`. Generated dependencies are not source code; use the committed lockfiles to restore them.

CareerOrbit is maintained as a separate project.
