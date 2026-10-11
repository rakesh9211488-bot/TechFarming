# Contributing

Read [the setup guide](docs/SETUP.md) and [roadmap](docs/ROADMAP.md) first. Create a focused branch and describe the user-visible change and validation in a pull request.

- Preserve existing contributor attribution and history.
- Install dependencies using the package lockfiles; do not commit `node_modules` or build outputs.
- Never commit credentials, real account data or device Wi-Fi passwords.
- Keep application configuration changes explicit; the backend reads `Server/.env`, while frontend configuration remains separate.
- Distinguish simulated data, planned features and verified implementations in documentation.
- Record meaningful tests for changed behavior. The existing server test command is a placeholder.

No new project-wide license is introduced by this repository cleanup. Dependency licenses do not automatically establish a license for the entire project.
