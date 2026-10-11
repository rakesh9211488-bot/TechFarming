# Security

This repository is a development prototype and should not be publicly deployed until its authentication, authorization, configuration and input handling are repaired.

## Previously committed service-account key

A Google service-account credential file was committed under `Server/Chat/`. Removing it from the current tree does not remove it from Git history or revoke the key.

The account owner must revoke the exposed key in Google Cloud, review its permissions and activity, and create a replacement only if the integration requires one. Store any replacement outside the repository. Do not paste private keys into issues, pull requests or chat.

## Known application risks

The legacy server contains database configuration in source, permissive CORS, routes exposing account records, sensitive request logging and incomplete authentication sessions. Remediation is tracked in [the roadmap](docs/ROADMAP.md).

Report security issues privately to the repository maintainer using an available private contact channel. Do not include live credentials or personal data in public reports.
